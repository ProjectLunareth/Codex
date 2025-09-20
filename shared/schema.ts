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

// Collections (for organizing and exporting codex entries)
export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  entryIds: jsonb("entry_ids").$type<string[]>().notNull().default([]),
  notes: text("notes"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Annotations (collaborative notes on entries)
export const annotations = pgTable("annotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").notNull().references(() => codexEntries.id),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Shares (for sharing entries and collections via tokens)
export const shares = pgTable("shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetType: text("target_type").notNull(), // 'entry', 'collection'
  targetId: varchar("target_id").notNull(),
  shareToken: varchar("share_token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Tool runs (history of mystical tool usage)
export const toolRuns = pgTable("tool_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'scrying', 'praxis', 'chronicle', etc.
  input: jsonb("input").notNull(), // Tool-specific input parameters
  output: jsonb("output").notNull(), // Tool-specific output data
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertCodexEntrySchema = createInsertSchema(codexEntries);
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOracleConsultationSchema = createInsertSchema(oracleConsultations).omit({ id: true, createdAt: true });
export const insertGrimoireEntrySchema = createInsertSchema(grimoireEntries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSonicEchoSchema = createInsertSchema(sonicEchoes).omit({ id: true, createdAt: true });
export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAnnotationSchema = createInsertSchema(annotations).omit({ id: true, createdAt: true });
export const insertShareSchema = createInsertSchema(shares).omit({ id: true, createdAt: true });
export const insertToolRunSchema = createInsertSchema(toolRuns).omit({ id: true, createdAt: true });

// Types
export type CodexEntry = typeof codexEntries.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type OracleConsultation = typeof oracleConsultations.$inferSelect;
export type GrimoireEntry = typeof grimoireEntries.$inferSelect;
export type SonicEcho = typeof sonicEchoes.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Annotation = typeof annotations.$inferSelect;
export type Share = typeof shares.$inferSelect;
export type ToolRun = typeof toolRuns.$inferSelect;
export type InsertCodexEntry = z.infer<typeof insertCodexEntrySchema>;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type InsertOracleConsultation = z.infer<typeof insertOracleConsultationSchema>;
export type InsertGrimoireEntry = z.infer<typeof insertGrimoireEntrySchema>;
export type InsertSonicEcho = z.infer<typeof insertSonicEchoSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;
export type InsertShare = z.infer<typeof insertShareSchema>;
export type InsertToolRun = z.infer<typeof insertToolRunSchema>;

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

// Collection types
export type CollectionWithEntries = Collection & {
  entries: CodexEntry[];
};

export type ExportFormat = 'json' | 'markdown';

// Annotation types
export type AnnotationWithEntry = Annotation & {
  entry?: CodexEntry;
};

// Share types
export type ShareRequest = {
  targetType: 'entry' | 'collection';
  targetId: string;
};

export type ShareResponse = {
  shareToken: string;
  shareUrl: string;
};

// Mystical tools types
export type MysticalToolType = 
  | 'scrying' | 'praxis' | 'chronicle' | 'glyph' | 'tapestry'
  | 'synthesis' | 'key' | 'imprint' | 'tarot' | 'star'
  | 'architecture' | 'aether' | 'geometrics' | 'harmonics' | 'labyrinth'
  | 'exegesis' | 'orrery' | 'athanor' | 'legend' | 'noosphere' | 'fusion' | 'dialogue';

export type MysticalToolRequest = {
  type: MysticalToolType;
  input: Record<string, any>;
};

export type MysticalToolResponse = {
  id: string;
  type: MysticalToolType;
  output: Record<string, any>;
  createdAt: Date;
};

// Graph visualization types
export type GraphNode = {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
  keyTerms: string[];
};

export type GraphEdge = {
  source: string;
  target: string;
  similarity: number;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
