import { type CodexEntry, type Bookmark, type OracleConsultation, type GrimoireEntry, type SonicEcho, type Collection, type Annotation, type Share, type ToolRun, type InsertCodexEntry, type InsertBookmark, type InsertOracleConsultation, type InsertGrimoireEntry, type InsertSonicEcho, type InsertCollection, type InsertAnnotation, type InsertShare, type InsertToolRun, type CodexEntryWithBookmark, type CollectionWithEntries, type AnnotationWithEntry } from "@shared/schema";
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
  
  // Sonic echoes
  getSonicEchoes(): Promise<SonicEcho[]>;
  getSonicEcho(id: string): Promise<SonicEcho | undefined>;
  createSonicEcho(echo: InsertSonicEcho): Promise<SonicEcho>;
  deleteSonicEcho(id: string): Promise<boolean>;
  
  // Collections
  getCollections(): Promise<CollectionWithEntries[]>;
  getCollection(id: string): Promise<CollectionWithEntries | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, updates: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: string): Promise<boolean>;
  
  // Annotations
  getAnnotations(): Promise<AnnotationWithEntry[]>;
  getAnnotationsByEntry(entryId: string): Promise<Annotation[]>;
  createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;
  deleteAnnotation(id: string): Promise<boolean>;
  
  // Shares
  getShares(): Promise<Share[]>;
  getShare(shareToken: string): Promise<Share | undefined>;
  createShare(share: InsertShare): Promise<Share>;
  deleteShare(id: string): Promise<boolean>;
  
  // Tool runs
  getToolRuns(): Promise<ToolRun[]>;
  getToolRunsByType(type: string): Promise<ToolRun[]>;
  createToolRun(toolRun: InsertToolRun): Promise<ToolRun>;
  deleteToolRun(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private codexEntries: Map<string, CodexEntry>;
  private bookmarks: Map<string, Bookmark>;
  private oracleConsultations: Map<string, OracleConsultation>;
  private grimoireEntries: Map<string, GrimoireEntry>;
  private sonicEchoes: Map<string, SonicEcho>;
  private collections: Map<string, Collection>;
  private annotations: Map<string, Annotation>;
  private shares: Map<string, Share>;
  private toolRuns: Map<string, ToolRun>;

  constructor() {
    this.codexEntries = new Map();
    this.bookmarks = new Map();
    this.oracleConsultations = new Map();
    this.grimoireEntries = new Map();
    this.sonicEchoes = new Map();
    this.collections = new Map();
    this.annotations = new Map();
    this.shares = new Map();
    this.toolRuns = new Map();
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

  async getSonicEchoes(): Promise<SonicEcho[]> {
    return Array.from(this.sonicEchoes.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSonicEcho(id: string): Promise<SonicEcho | undefined> {
    return this.sonicEchoes.get(id);
  }

  async createSonicEcho(insertEcho: InsertSonicEcho): Promise<SonicEcho> {
    const echo: SonicEcho = {
      ...insertEcho,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.sonicEchoes.set(echo.id, echo);
    return echo;
  }

  async deleteSonicEcho(id: string): Promise<boolean> {
    return this.sonicEchoes.delete(id);
  }

  // Collections implementation
  async getCollections(): Promise<CollectionWithEntries[]> {
    const collections = Array.from(this.collections.values());
    return Promise.all(collections.map(async collection => ({
      ...collection,
      entries: collection.entryIds
        .map(id => this.codexEntries.get(id))
        .filter(Boolean) as CodexEntry[]
    })));
  }

  async getCollection(id: string): Promise<CollectionWithEntries | undefined> {
    const collection = this.collections.get(id);
    if (!collection) return undefined;
    
    const entries = collection.entryIds
      .map(id => this.codexEntries.get(id))
      .filter(Boolean) as CodexEntry[];
    
    return { ...collection, entries };
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const collection: Collection = {
      ...insertCollection,
      id: randomUUID(),
      entryIds: insertCollection.entryIds ? [...insertCollection.entryIds] : [],
      notes: insertCollection.notes || null,
      isPublic: insertCollection.isPublic ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.collections.set(collection.id, collection);
    return collection;
  }

  async updateCollection(id: string, updates: Partial<InsertCollection>): Promise<Collection | undefined> {
    const existing = this.collections.get(id);
    if (!existing) return undefined;
    
    const updated: Collection = {
      ...existing,
      ...updates,
      entryIds: updates.entryIds ? [...updates.entryIds] : existing.entryIds,
      updatedAt: new Date(),
    };
    this.collections.set(id, updated);
    return updated;
  }

  async deleteCollection(id: string): Promise<boolean> {
    return this.collections.delete(id);
  }

  // Annotations implementation
  async getAnnotations(): Promise<AnnotationWithEntry[]> {
    const annotations = Array.from(this.annotations.values());
    return Promise.all(annotations.map(async annotation => ({
      ...annotation,
      entry: this.codexEntries.get(annotation.entryId)
    })));
  }

  async getAnnotationsByEntry(entryId: string): Promise<Annotation[]> {
    return Array.from(this.annotations.values())
      .filter(annotation => annotation.entryId === entryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAnnotation(insertAnnotation: InsertAnnotation): Promise<Annotation> {
    const annotation: Annotation = {
      ...insertAnnotation,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.annotations.set(annotation.id, annotation);
    return annotation;
  }

  async deleteAnnotation(id: string): Promise<boolean> {
    return this.annotations.delete(id);
  }

  // Shares implementation
  async getShares(): Promise<Share[]> {
    return Array.from(this.shares.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getShare(shareToken: string): Promise<Share | undefined> {
    return Array.from(this.shares.values())
      .find(share => share.shareToken === shareToken);
  }

  async createShare(insertShare: InsertShare): Promise<Share> {
    const share: Share = {
      ...insertShare,
      id: randomUUID(),
      shareToken: insertShare.shareToken || randomUUID().replace(/-/g, ''),
      createdAt: new Date(),
    };
    this.shares.set(share.id, share);
    return share;
  }

  async deleteShare(id: string): Promise<boolean> {
    return this.shares.delete(id);
  }

  // Tool runs implementation
  async getToolRuns(): Promise<ToolRun[]> {
    return Array.from(this.toolRuns.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getToolRunsByType(type: string): Promise<ToolRun[]> {
    return Array.from(this.toolRuns.values())
      .filter(toolRun => toolRun.type === type)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createToolRun(insertToolRun: InsertToolRun): Promise<ToolRun> {
    const toolRun: ToolRun = {
      ...insertToolRun,
      id: randomUUID(),
      input: { ...insertToolRun.input },
      output: { ...insertToolRun.output },
      createdAt: new Date(),
    };
    this.toolRuns.set(toolRun.id, toolRun);
    return toolRun;
  }

  async deleteToolRun(id: string): Promise<boolean> {
    return this.toolRuns.delete(id);
  }
}

export const storage = new MemStorage();
