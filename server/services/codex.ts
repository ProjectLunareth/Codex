import { storage } from "../storage";
import { type CodexEntry, type InsertCodexEntry } from "@shared/schema";
import fs from "fs";
import path from "path";

interface CodexDocument {
  filename: string;
  type: string;
  size: number;
  original_size: number;
  processed_date: string;
  summary: string;
  key_chunks: string[];
  full_text: string;
}

interface CodexMetadata {
  metadata: {
    created: string;
    document_count: number;
    documents_with_content: number;
    total_size: number;
    version: string;
    processor: string;
  };
  documents: CodexDocument[];
}

export class CodexService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadCodexData();
      this.initialized = true;
      console.log("Codex service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Codex service:", error);
      throw error;
    }
  }

  private async loadCodexData(): Promise<void> {
    try {
      const metadataPath = path.resolve(process.cwd(), "attached_assets", "Pasted--metadata-created-2025-09-11T21-24-47-360669-document-count-61-docume-1758273447106_1758273447110.txt");
      
      if (!fs.existsSync(metadataPath)) {
        console.warn("Codex metadata file not found, using empty dataset");
        return;
      }

      const rawData = fs.readFileSync(metadataPath, "utf-8");
      const metadata: CodexMetadata = JSON.parse(rawData);

      console.log(`Loading ${metadata.documents.length} codex documents...`);

      for (const doc of metadata.documents) {
        const category = this.extractCategory(doc.summary, doc.full_text);
        const keyTerms = this.extractKeyTerms(doc.summary, doc.full_text);

        const entry: InsertCodexEntry = {
          id: doc.filename.replace('.txt', ''),
          filename: doc.filename,
          type: doc.type,
          size: doc.size,
          originalSize: doc.original_size,
          processedDate: new Date(doc.processed_date),
          summary: doc.summary,
          keyChunks: doc.key_chunks,
          fullText: doc.full_text,
          category,
          subcategory: this.extractSubcategory(doc.summary, doc.full_text),
          keyTerms,
        };

        await storage.createCodexEntry(entry);
      }

      console.log(`Successfully loaded ${metadata.documents.length} codex entries`);
    } catch (error) {
      console.error("Error loading codex data:", error);
      throw error;
    }
  }

  private extractCategory(summary: string, fullText: string): string {
    const text = (summary + " " + fullText).toLowerCase();
    
    // Determine main category based on content
    if (text.includes("axis mundi") && text.includes("cosmogenesis")) {
      return "cosmogenesis";
    }
    if (text.includes("axis mundi") && text.includes("psychogenesis")) {
      return "psychogenesis";
    }
    if (text.includes("axis mundi") && text.includes("mystagogy")) {
      return "mystagogy";
    }
    if (text.includes("luminous chapter halls") || text.includes("inner climbing")) {
      return "climbing-systems";
    }
    if (text.includes("initiation") && text.includes("rites")) {
      return "initiation-rites";
    }
    if (text.includes("archetypal") && text.includes("structures")) {
      return "archetypal-structures";
    }
    if (text.includes("psychic") && text.includes("technologies")) {
      return "psychic-technologies";
    }
    
    // Default categorization
    if (text.includes("soul") || text.includes("consciousness")) {
      return "psychogenesis";
    }
    if (text.includes("spiritual") || text.includes("ascent")) {
      return "mystagogy";
    }
    
    return "general";
  }

  private extractSubcategory(summary: string, fullText: string): string | undefined {
    const text = (summary + " " + fullText).toLowerCase();
    
    if (text.includes("emanation")) return "emanation";
    if (text.includes("evolution")) return "evolution";
    if (text.includes("return")) return "return";
    if (text.includes("climbing")) return "climbing";
    if (text.includes("initiation")) return "initiation";
    if (text.includes("archetypal")) return "archetypal";
    if (text.includes("psychic")) return "psychic";
    
    return undefined;
  }

  private extractKeyTerms(summary: string, fullText: string): string[] {
    const text = summary + " " + fullText;
    const terms = new Set<string>();
    
    // Extract terms from the provided key terms in the summary
    const keyTermsMatch = text.match(/Key terms: ([^.]+)/i);
    if (keyTermsMatch) {
      const extractedTerms = keyTermsMatch[1].split(',').map(term => term.trim());
      extractedTerms.forEach(term => terms.add(term));
    }
    
    // Add some common mystical terms if found
    const mysticalTerms = [
      "Kabbalah", "Sephiroth", "Tree of Life", "Emanation", "Gnosis", "Pleroma",
      "Alchemy", "Hermeticism", "Sufism", "Chakras", "Kundalini", "Meditation",
      "Soul", "Consciousness", "Enlightenment", "Initiation", "Mysticism",
      "Archetype", "Jung", "Collective Unconscious", "Sacred Geometry"
    ];
    
    mysticalTerms.forEach(term => {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        terms.add(term);
      }
    });
    
    return Array.from(terms).slice(0, 10); // Limit to 10 key terms
  }

  async findCrossReferences(entryId: string): Promise<CodexEntry[]> {
    const entry = await storage.getCodexEntry(entryId);
    if (!entry) return [];

    const allEntries = await storage.getCodexEntries();
    const crossRefs: CodexEntry[] = [];

    // Find entries with similar key terms or content
    for (const otherEntry of allEntries) {
      if (otherEntry.id === entryId) continue;

      let similarity = 0;
      
      // Check key terms overlap
      if (entry.keyTerms && otherEntry.keyTerms) {
        const commonTerms = entry.keyTerms.filter(term => 
          otherEntry.keyTerms!.some(otherTerm => 
            otherTerm.toLowerCase() === term.toLowerCase()
          )
        );
        similarity += commonTerms.length * 2;
      }

      // Check summary similarity
      const entryWords = entry.summary.toLowerCase().split(/\s+/);
      const otherWords = otherEntry.summary.toLowerCase().split(/\s+/);
      const commonWords = entryWords.filter(word => 
        word.length > 4 && otherWords.includes(word)
      );
      similarity += commonWords.length;

      if (similarity >= 3) {
        crossRefs.push(otherEntry);
      }
    }

    return crossRefs.slice(0, 6); // Limit to 6 cross-references
  }
}

export const codexService = new CodexService();
