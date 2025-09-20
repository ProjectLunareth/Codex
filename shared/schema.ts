import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Codex entry schema
export const codexEntries = pgTable("codex_entries", {
  id: varchar("id").primaryKey(),
  filename: text("filename").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  originalSize: integer("original_size").notNull(),
  processedDate: timestamp("processed_date").notNull(),
  summary: text("summary").notNull(),
  keyChunks: jsonb("key_chunks").$type<string[]>().notNull(),
  fullText: text("full_text").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  keyTerms: jsonb("key_terms").$type<string[]>(),
});

// User bookmarks and notes
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").notNull().references(() => codexEntries.id),
  isBookmarked: boolean("is_bookmarked").notNull().default(false),
  personalNotes: text("personal_notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Oracle consultations
export const oracleConsultations = pgTable("oracle_consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  context: text("context"),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Personal grimoire entries (user-created mystical writings)
export const grimoireEntries = pgTable("grimoire_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("personal-writing"),
  tags: jsonb("tags").$type<string[]>().default([]),
  isPrivate: boolean("is_private").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Sonic echoes (AI-generated audio from text)
export const sonicEchoes = pgTable("sonic_echoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  sourceText: text("source_text").notNull(),
  voice: text("voice").notNull(),
  style: text("style"),
  audioUrl: text("audio_url"),
  duration: integer("duration"), // Duration in seconds
  sourceType: text("source_type").notNull(), // 'codex_entry', 'grimoire_entry', 'custom_text'
  sourceId: varchar("source_id"), // Reference to codex or grimoire entry if applicable
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertCodexEntrySchema = createInsertSchema(codexEntries);
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOracleConsultationSchema = createInsertSchema(oracleConsultations).omit({ id: true, createdAt: true });
export const insertGrimoireEntrySchema = createInsertSchema(grimoireEntries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSonicEchoSchema = createInsertSchema(sonicEchoes).omit({ id: true, createdAt: true });

// Types
export type CodexEntry = typeof codexEntries.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type OracleConsultation = typeof oracleConsultations.$inferSelect;
export type GrimoireEntry = typeof grimoireEntries.$inferSelect;
export type SonicEcho = typeof sonicEchoes.$inferSelect;
export type InsertCodexEntry = z.infer<typeof insertCodexEntrySchema>;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type InsertOracleConsultation = z.infer<typeof insertOracleConsultationSchema>;
export type InsertGrimoireEntry = z.infer<typeof insertGrimoireEntrySchema>;
export type InsertSonicEcho = z.infer<typeof insertSonicEchoSchema>;

// Additional types for API responses
export type CodexEntryWithBookmark = CodexEntry & {
  bookmark?: Bookmark;
};

export type SearchResult = {
  entry: CodexEntryWithBookmark;
  score: number;
  matches: Array<{
    field: string;
    value: string;
    indices: number[][];
  }>;
};

export type OracleRequest = {
  query: string;
  context?: string;
};

export type OracleResponse = {
  response: string;
  consultationId: string;
};

export type SigilRequest = {
  intention: string;
  style?: string;
  symbolism?: string;
  energyType?: string;
};

export type SigilResponse = {
  imageUrl: string;
  description: string;
  symbolicMeaning: string;
  usageGuidance: string[];
};

export type SonicEchoRequest = {
  text: string;
  voice?: string;
  style?: string;
  title?: string;
  sourceType?: string;
  sourceId?: string;
};

export type SonicEchoResponse = {
  id: string;
  audioUrl: string;
  title: string;
  duration?: number;
  voice: string;
  style?: string;
};
