import {
  index,
  int,
  mediumtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const analysisSessions = mysqlTable(
  "analysis_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    language: varchar("language", { length: 32 }).notNull(),
    changeIntent: text("changeIntent").notNull(),
    status: mysqlEnum("status", ["draft", "analyzing", "ready", "failed"])
      .default("draft")
      .notNull(),
    model: varchar("model", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("analysis_sessions_user_created_idx").on(table.userId, table.createdAt),
  ]
);

export const codeArtifacts = mysqlTable(
  "code_artifacts",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId")
      .notNull()
      .references(() => analysisSessions.id, { onDelete: "cascade" }),
    filename: varchar("filename", { length: 240 }).notNull(),
    language: varchar("language", { length: 32 }).notNull(),
    content: mediumtext("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("code_artifacts_session_idx").on(table.sessionId)]
);

export const analysisReports = mysqlTable(
  "analysis_reports",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId")
      .notNull()
      .references(() => analysisSessions.id, { onDelete: "cascade" }),
    payload: mediumtext("payload").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("analysis_reports_session_unique").on(table.sessionId)]
);

export const chatMessages = mysqlTable(
  "chat_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId")
      .notNull()
      .references(() => analysisSessions.id, { onDelete: "cascade" }),
    role: mysqlEnum("role", ["user", "assistant"]).notNull(),
    content: mediumtext("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("chat_messages_session_created_idx").on(table.sessionId, table.createdAt)]
);

export type AnalysisSession = typeof analysisSessions.$inferSelect;
export type CodeArtifact = typeof codeArtifacts.$inferSelect;
export type AnalysisReport = typeof analysisReports.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
