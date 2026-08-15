import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  ATLAS_CHAT_MODEL,
  ATLAS_DEEP_MODEL,
  atlasResponseFormat,
  buildAtlasAnalysisPrompt,
  clipAtlasInput,
  MAX_ATLAS_CODE_CHARS,
  parseAtlasReport,
} from "../atlas";
import {
  addAtlasChatMessage,
  createAtlasSession,
  getAtlasSessionForUser,
  listAtlasSessions,
  saveAtlasReport,
  setAtlasSessionStatus,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";

const sessionInput = z.object({
  language: z.string().min(1).max(32),
  code: z.string().min(20).max(MAX_ATLAS_CODE_CHARS),
  filename: z.string().min(1).max(240),
  changeIntent: z.string().min(4).max(2_000),
  title: z.string().min(3).max(200).optional(),
});

function sessionTitle(input: z.infer<typeof sessionInput>) {
  return input.title?.trim() || `${input.filename} — ${input.changeIntent.slice(0, 64)}`;
}

async function requireSession(sessionId: number, userId: number) {
  const record = await getAtlasSessionForUser(sessionId, userId);
  if (!record) {
    throw new TRPCError({ code: "NOT_FOUND", message: "جلسة Atlas غير موجودة أو لا تملك صلاحية الوصول إليها." });
  }
  return record;
}

export const atlasRouter = router({
  createSession: protectedProcedure.input(sessionInput).mutation(async ({ ctx, input }) => {
    const sessionId = await createAtlasSession({
      userId: ctx.user.id,
      title: sessionTitle(input),
      language: input.language,
      changeIntent: input.changeIntent,
      filename: input.filename,
      code: input.code,
    });
    return { sessionId };
  }),

  listSessions: protectedProcedure.query(({ ctx }) => listAtlasSessions(ctx.user.id)),

  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number().int().positive() }))
    .query(({ ctx, input }) => requireSession(input.sessionId, ctx.user.id)),

  analyze: protectedProcedure
    .input(z.object({ sessionId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const record = await requireSession(input.sessionId, ctx.user.id);
      if (!record.artifacts.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "لا توجد ملفات برمجية قابلة للتحليل في هذه الجلسة." });
      }

      await setAtlasSessionStatus(input.sessionId, ctx.user.id, "analyzing", ATLAS_DEEP_MODEL);

      try {
        const response = await invokeLLM({
          model: ATLAS_DEEP_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are CodeForge Atlas, a careful senior software engineer. Return analysis in the requested JSON schema. Never invent codebase facts beyond the supplied artifacts.",
            },
            {
              role: "user",
              content: buildAtlasAnalysisPrompt({
                language: record.session.language,
                changeIntent: record.session.changeIntent,
                artifacts: record.artifacts,
              }),
            },
          ],
          response_format: atlasResponseFormat,
        });
        const report = parseAtlasReport(response.choices[0]?.message?.content);
        await saveAtlasReport(input.sessionId, JSON.stringify(report));
        await setAtlasSessionStatus(input.sessionId, ctx.user.id, "ready", ATLAS_DEEP_MODEL);
        return report;
      } catch (error) {
        await setAtlasSessionStatus(input.sessionId, ctx.user.id, "failed", ATLAS_DEEP_MODEL);
        throw error;
      }
    }),

  chat: protectedProcedure
    .input(
      z.object({
        sessionId: z.number().int().positive(),
        message: z.string().min(2).max(4_000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const record = await requireSession(input.sessionId, ctx.user.id);
      await addAtlasChatMessage({ sessionId: input.sessionId, role: "user", content: input.message });

      const codeContext = record.artifacts
        .map(artifact => `FILE: ${artifact.filename}\n${clipAtlasInput(artifact.content, 12_000)}`)
        .join("\n\n");
      const recentMessages = record.messages.slice(-8).map(message => ({
        role: message.role,
        content: message.content,
      }));

      const response = await invokeLLM({
        model: ATLAS_CHAT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are CodeForge Atlas. Answer the developer's questions about only the supplied session. Be concise, cite filenames where possible, state uncertainty when the code does not support a claim, and do not say you ran the code.\n\nSESSION CODE:\n${codeContext}`,
          },
          ...recentMessages,
          { role: "user", content: input.message },
        ],
      });
      const content = response.choices[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "لم تُنتج المساعدة الذكية إجابة صالحة." });
      }

      const messageId = await addAtlasChatMessage({
        sessionId: input.sessionId,
        role: "assistant",
        content,
      });
      return { id: messageId, role: "assistant" as const, content };
    }),
});
