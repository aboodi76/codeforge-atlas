import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analysisReports,
  analysisSessions,
  chatMessages,
  codeArtifacts,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createAtlasSession(input: {
  userId: number;
  title: string;
  language: string;
  changeIntent: string;
  filename: string;
  code: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const [sessionResult] = await db.insert(analysisSessions).values({
    userId: input.userId,
    title: input.title,
    language: input.language,
    changeIntent: input.changeIntent,
  });
  const sessionId = Number(sessionResult.insertId);

  await db.insert(codeArtifacts).values({
    sessionId,
    filename: input.filename,
    language: input.language,
    content: input.code,
  });

  return sessionId;
}

export async function listAtlasSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(analysisSessions)
    .where(eq(analysisSessions.userId, userId))
    .orderBy(desc(analysisSessions.updatedAt));
}

export async function getAtlasSessionForUser(sessionId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const [session] = await db
    .select()
    .from(analysisSessions)
    .where(and(eq(analysisSessions.id, sessionId), eq(analysisSessions.userId, userId)))
    .limit(1);

  if (!session) return undefined;

  const [artifacts, reports, messages] = await Promise.all([
    db.select().from(codeArtifacts).where(eq(codeArtifacts.sessionId, sessionId)),
    db.select().from(analysisReports).where(eq(analysisReports.sessionId, sessionId)).limit(1),
    db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt),
  ]);

  return {
    session,
    artifacts,
    report: reports[0],
    messages,
  };
}

export async function setAtlasSessionStatus(
  sessionId: number,
  userId: number,
  status: "draft" | "analyzing" | "ready" | "failed",
  model?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  await db
    .update(analysisSessions)
    .set({ status, ...(model ? { model } : {}) })
    .where(and(eq(analysisSessions.id, sessionId), eq(analysisSessions.userId, userId)));
}

export async function saveAtlasReport(sessionId: number, payload: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  await db
    .insert(analysisReports)
    .values({ sessionId, payload })
    .onDuplicateKeyUpdate({ set: { payload, updatedAt: new Date() } });
}

export async function addAtlasChatMessage(input: {
  sessionId: number;
  role: "user" | "assistant";
  content: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const [result] = await db.insert(chatMessages).values(input);
  return Number(result.insertId);
}
