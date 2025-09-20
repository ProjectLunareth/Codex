import { type CodexEntry, type Bookmark, type OracleConsultation, type GrimoireEntry, type InsertCodexEntry, type InsertBookmark, type InsertOracleConsultation, type InsertGrimoireEntry, type CodexEntryWithBookmark } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Codex entries
  getCodexEntries(): Promise<CodexEntryWithBookmark[]>;
  getCodexEntry(id: string): Promise<CodexEntryWithBookmark | undefined>;
  createCodexEntry(entry: InsertCodexEntry): Promise<CodexEntry>;
  searchCodexEntries(query: string): Promise<CodexEntryWithBookmark[]>;
  getEntriesByCategory(category: string): Promise<CodexEntryWithBookmark[]>;
  
  // Bookmarks
  getBookmark(entryId: string): Promise<Bookmark | undefined>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  updateBookmark(entryId: string, updates: Partial<InsertBookmark>): Promise<Bookmark | undefined>;
  getBookmarkedEntries(): Promise<CodexEntryWithBookmark[]>;
  
  // Oracle consultations
  createOracleConsultation(consultation: InsertOracleConsultation): Promise<OracleConsultation>;
  getOracleConsultations(): Promise<OracleConsultation[]>;
  
  // Grimoire entries
  getGrimoireEntries(): Promise<GrimoireEntry[]>;
  getGrimoireEntry(id: string): Promise<GrimoireEntry | undefined>;
  createGrimoireEntry(entry: InsertGrimoireEntry): Promise<GrimoireEntry>;
  updateGrimoireEntry(id: string, updates: Partial<InsertGrimoireEntry>): Promise<GrimoireEntry | undefined>;
  deleteGrimoireEntry(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private codexEntries: Map<string, CodexEntry>;
  private bookmarks: Map<string, Bookmark>;
  private oracleConsultations: Map<string, OracleConsultation>;
  private grimoireEntries: Map<string, GrimoireEntry>;

  constructor() {
    this.codexEntries = new Map();
    this.bookmarks = new Map();
    this.oracleConsultations = new Map();
    this.grimoireEntries = new Map();
  }

  async getCodexEntries(): Promise<CodexEntryWithBookmark[]> {
    const entries = Array.from(this.codexEntries.values());
    return Promise.all(entries.map(async entry => ({
      ...entry,
      bookmark: await this.getBookmark(entry.id)
    })));
  }

  async getCodexEntry(id: string): Promise<CodexEntryWithBookmark | undefined> {
    const entry = this.codexEntries.get(id);
    if (!entry) return undefined;
    
    const bookmark = await this.getBookmark(id);
    return { ...entry, bookmark };
  }

  async createCodexEntry(insertEntry: InsertCodexEntry): Promise<CodexEntry> {
    const entry: CodexEntry = {
      ...insertEntry,
      id: insertEntry.id || randomUUID(),
      subcategory: insertEntry.subcategory || null,
      keyTerms: insertEntry.keyTerms ? [...insertEntry.keyTerms] : null,
      keyChunks: [...insertEntry.keyChunks],
    };
    this.codexEntries.set(entry.id, entry);
    return entry;
  }

  async searchCodexEntries(query: string): Promise<CodexEntryWithBookmark[]> {
    const entries = Array.from(this.codexEntries.values());
    const searchTerm = query.toLowerCase();
    
    const filtered = entries.filter(entry => 
      entry.summary.toLowerCase().includes(searchTerm) ||
      entry.fullText.toLowerCase().includes(searchTerm) ||
      entry.keyChunks.some(chunk => chunk.toLowerCase().includes(searchTerm)) ||
      (entry.keyTerms && entry.keyTerms.some(term => term.toLowerCase().includes(searchTerm)))
    );

    return Promise.all(filtered.map(async entry => ({
      ...entry,
      bookmark: await this.getBookmark(entry.id)
    })));
  }

  async getEntriesByCategory(category: string): Promise<CodexEntryWithBookmark[]> {
    const entries = Array.from(this.codexEntries.values());
    const filtered = entries.filter(entry => entry.category === category);
    
    return Promise.all(filtered.map(async entry => ({
      ...entry,
      bookmark: await this.getBookmark(entry.id)
    })));
  }

  async getBookmark(entryId: string): Promise<Bookmark | undefined> {
    return this.bookmarks.get(entryId);
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const bookmark: Bookmark = {
      ...insertBookmark,
      id: randomUUID(),
      isBookmarked: insertBookmark.isBookmarked ?? false,
      personalNotes: insertBookmark.personalNotes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookmarks.set(bookmark.entryId, bookmark);
    return bookmark;
  }

  async updateBookmark(entryId: string, updates: Partial<InsertBookmark>): Promise<Bookmark | undefined> {
    const existing = this.bookmarks.get(entryId);
    if (!existing) return undefined;
    
    const updated: Bookmark = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.bookmarks.set(entryId, updated);
    return updated;
  }

  async getBookmarkedEntries(): Promise<CodexEntryWithBookmark[]> {
    const bookmarkedIds = Array.from(this.bookmarks.values())
      .filter(bookmark => bookmark.isBookmarked)
      .map(bookmark => bookmark.entryId);
    
    const entries = bookmarkedIds
      .map(id => this.codexEntries.get(id))
      .filter(Boolean) as CodexEntry[];
    
    return Promise.all(entries.map(async entry => ({
      ...entry,
      bookmark: await this.getBookmark(entry.id)
    })));
  }

  async createOracleConsultation(insertConsultation: InsertOracleConsultation): Promise<OracleConsultation> {
    const consultation: OracleConsultation = {
      ...insertConsultation,
      id: randomUUID(),
      context: insertConsultation.context || null,
      createdAt: new Date(),
    };
    this.oracleConsultations.set(consultation.id, consultation);
    return consultation;
  }

  async getOracleConsultations(): Promise<OracleConsultation[]> {
    return Array.from(this.oracleConsultations.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGrimoireEntries(): Promise<GrimoireEntry[]> {
    return Array.from(this.grimoireEntries.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getGrimoireEntry(id: string): Promise<GrimoireEntry | undefined> {
    return this.grimoireEntries.get(id);
  }

  async createGrimoireEntry(insertEntry: InsertGrimoireEntry): Promise<GrimoireEntry> {
    const entry: GrimoireEntry = {
      ...insertEntry,
      id: randomUUID(),
      category: insertEntry.category || "personal-writing",
      tags: insertEntry.tags ? [...insertEntry.tags] : [],
      isPrivate: insertEntry.isPrivate ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.grimoireEntries.set(entry.id, entry);
    return entry;
  }

  async updateGrimoireEntry(id: string, updates: Partial<InsertGrimoireEntry>): Promise<GrimoireEntry | undefined> {
    const existing = this.grimoireEntries.get(id);
    if (!existing) return undefined;
    
    const updated: GrimoireEntry = {
      ...existing,
      ...updates,
      tags: updates.tags ? [...updates.tags] : existing.tags,
      updatedAt: new Date(),
    };
    this.grimoireEntries.set(id, updated);
    return updated;
  }

  async deleteGrimoireEntry(id: string): Promise<boolean> {
    return this.grimoireEntries.delete(id);
  }
}

export const storage = new MemStorage();
