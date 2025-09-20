import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import path from "path";
import { storage } from "./storage";
import { codexService } from "./services/codex";
import { consultOracle, generateMysticalSigil, generateSonicEcho, processMysticalTool } from "./services/openai";
import { insertBookmarkSchema, insertOracleConsultationSchema, insertGrimoireEntrySchema, insertSonicEchoSchema, insertCollectionSchema, insertAnnotationSchema, insertShareSchema, insertToolRunSchema, type OracleRequest, type OracleResponse, type SigilRequest, type SigilResponse, type SonicEchoRequest, type SonicEchoResponse, type MysticalToolRequest, type MysticalToolResponse, type ShareRequest, type ShareResponse, type ExportFormat } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize codex service
  await codexService.initialize();

  // Get all codex entries
  app.get("/api/codex/entries", async (req, res) => {
    try {
      const entries = await storage.getCodexEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching codex entries:", error);
      res.status(500).json({ message: "Failed to fetch codex entries" });
    }
  });

  // Get single codex entry
  app.get("/api/codex/entries/:id", async (req, res) => {
    try {
      const entry = await storage.getCodexEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching codex entry:", error);
      res.status(500).json({ message: "Failed to fetch codex entry" });
    }
  });

  // Search codex entries
  app.get("/api/codex/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const entries = await storage.searchCodexEntries(query);
      res.json(entries);
    } catch (error) {
      console.error("Error searching codex entries:", error);
      res.status(500).json({ message: "Failed to search codex entries" });
    }
  });

  // Get entries by category
  app.get("/api/codex/categories/:category", async (req, res) => {
    try {
      const entries = await storage.getEntriesByCategory(req.params.category);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching entries by category:", error);
      res.status(500).json({ message: "Failed to fetch entries by category" });
    }
  });

  // Get cross-references for an entry
  app.get("/api/codex/entries/:id/cross-references", async (req, res) => {
    try {
      const crossRefs = await codexService.findCrossReferences(req.params.id);
      res.json(crossRefs);
    } catch (error) {
      console.error("Error fetching cross-references:", error);
      res.status(500).json({ message: "Failed to fetch cross-references" });
    }
  });

  // Get bookmarked entries
  app.get("/api/bookmarks", async (req, res) => {
    try {
      const bookmarkedEntries = await storage.getBookmarkedEntries();
      res.json(bookmarkedEntries);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  // Create or update bookmark
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const validatedData = insertBookmarkSchema.parse(req.body);
      
      const existing = await storage.getBookmark(validatedData.entryId);
      let bookmark;
      
      if (existing) {
        bookmark = await storage.updateBookmark(validatedData.entryId, validatedData);
      } else {
        bookmark = await storage.createBookmark(validatedData);
      }
      
      res.json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      }
      console.error("Error creating/updating bookmark:", error);
      res.status(500).json({ message: "Failed to create/update bookmark" });
    }
  });

  // Oracle consultation
  app.post("/api/oracle/consult", async (req, res) => {
    try {
      const oracleRequest = req.body as OracleRequest;
      
      if (!oracleRequest.query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // Get relevant codex knowledge if context is provided
      let codexKnowledge = '';
      if (oracleRequest.context && oracleRequest.context !== 'general') {
        const contextEntries = await storage.getEntriesByCategory(oracleRequest.context);
        if (contextEntries.length > 0) {
          codexKnowledge = contextEntries
            .slice(0, 3) // Limit to first 3 entries for context
            .map(entry => `${entry.summary}\n\nKey concepts: ${entry.keyTerms?.join(', ') || 'N/A'}`)
            .join('\n\n---\n\n');
        }
      }

      const oracleResponse = await consultOracle({
        query: oracleRequest.query,
        context: oracleRequest.context,
        codexKnowledge
      });

      // Save consultation to storage
      const consultation = await storage.createOracleConsultation({
        query: oracleRequest.query,
        context: oracleRequest.context,
        response: oracleResponse.response
      });

      const response: OracleResponse = {
        response: oracleResponse.response,
        consultationId: consultation.id
      };

      res.json(response);
    } catch (error) {
      console.error("Oracle consultation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Oracle consultation failed"
      });
    }
  });

  // Get oracle consultation history
  app.get("/api/oracle/history", async (req, res) => {
    try {
      const consultations = await storage.getOracleConsultations();
      res.json(consultations);
    } catch (error) {
      console.error("Error fetching oracle history:", error);
      res.status(500).json({ message: "Failed to fetch oracle history" });
    }
  });

  // Get all grimoire entries
  app.get("/api/grimoire/entries", async (req, res) => {
    try {
      const entries = await storage.getGrimoireEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching grimoire entries:", error);
      res.status(500).json({ message: "Failed to fetch grimoire entries" });
    }
  });

  // Get single grimoire entry
  app.get("/api/grimoire/entries/:id", async (req, res) => {
    try {
      const entry = await storage.getGrimoireEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: "Grimoire entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching grimoire entry:", error);
      res.status(500).json({ message: "Failed to fetch grimoire entry" });
    }
  });

  // Create new grimoire entry
  app.post("/api/grimoire/entries", async (req, res) => {
    try {
      const validated = insertGrimoireEntrySchema.parse(req.body);
      const entry = await storage.createGrimoireEntry(validated);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating grimoire entry:", error);
      res.status(500).json({ message: "Failed to create grimoire entry" });
    }
  });

  // Update grimoire entry
  app.put("/api/grimoire/entries/:id", async (req, res) => {
    try {
      const validated = insertGrimoireEntrySchema.partial().parse(req.body);
      const entry = await storage.updateGrimoireEntry(req.params.id, validated);
      if (!entry) {
        return res.status(404).json({ message: "Grimoire entry not found" });
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating grimoire entry:", error);
      res.status(500).json({ message: "Failed to update grimoire entry" });
    }
  });

  // Delete grimoire entry
  app.delete("/api/grimoire/entries/:id", async (req, res) => {
    try {
      const success = await storage.deleteGrimoireEntry(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Grimoire entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting grimoire entry:", error);
      res.status(500).json({ message: "Failed to delete grimoire entry" });
    }
  });

  // Generate mystical sigil
  app.post("/api/sigil/generate", async (req, res) => {
    try {
      const { intention, style, symbolism, energyType } = req.body;
      
      if (!intention || typeof intention !== 'string' || intention.trim().length === 0) {
        return res.status(400).json({ message: "Intention is required and must be a non-empty string" });
      }

      const sigilRequest = {
        intention: intention.trim(),
        style: style || "traditional",
        symbolism: symbolism || "hermetic", 
        energyType: energyType || "balanced"
      };

      const sigilResponse = await generateMysticalSigil(sigilRequest);
      res.json(sigilResponse);
    } catch (error) {
      console.error("Sigil generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Sigil generation failed"
      });
    }
  });

  // Generate sonic echo (TTS)
  app.post("/api/sonic-echo/generate", async (req, res) => {
    try {
      const { text, voice, style, title, sourceType, sourceId } = req.body;
      
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ message: "Text is required and must be a non-empty string" });
      }

      const sonicRequest = {
        text: text.trim(),
        voice: voice || "mystical",
        style: style,
        title: title || "Sonic Echo",
        sourceType: sourceType || "custom_text",
        sourceId: sourceId
      };

      // Generate the audio using OpenAI TTS
      const { audioBuffer, duration } = await generateSonicEcho(sonicRequest);
      
      // For now, we'll return the audio as base64 data URL (in production, you'd save to file storage)
      const audioBase64 = audioBuffer.toString('base64');
      const audioDataUrl = `data:audio/mp3;base64,${audioBase64}`;

      // Save echo record to storage
      const sonicEcho = await storage.createSonicEcho({
        title: sonicRequest.title,
        sourceText: sonicRequest.text,
        voice: sonicRequest.voice,
        style: sonicRequest.style,
        audioUrl: audioDataUrl,
        duration: duration,
        sourceType: sonicRequest.sourceType,
        sourceId: sonicRequest.sourceId
      });

      const sonicResponse: SonicEchoResponse = {
        id: sonicEcho.id,
        audioUrl: audioDataUrl,
        title: sonicEcho.title,
        duration: sonicEcho.duration || undefined,
        voice: sonicEcho.voice,
        style: sonicEcho.style || undefined
      };

      res.json(sonicResponse);
    } catch (error) {
      console.error("Sonic echo generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Sonic echo generation failed"
      });
    }
  });

  // Get sonic echoes
  app.get("/api/sonic-echo/list", async (req, res) => {
    try {
      const echoes = await storage.getSonicEchoes();
      res.json(echoes);
    } catch (error) {
      console.error("Error fetching sonic echoes:", error);
      res.status(500).json({ message: "Failed to fetch sonic echoes" });
    }
  });

  // Delete sonic echo
  app.delete("/api/sonic-echo/:id", async (req, res) => {
    try {
      const success = await storage.deleteSonicEcho(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Sonic echo not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sonic echo:", error);
      res.status(500).json({ message: "Failed to delete sonic echo" });
    }
  });

  // ===== COLLECTIONS ROUTES =====
  // Get all collections
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  // Get single collection
  app.get("/api/collections/:id", async (req, res) => {
    try {
      const collection = await storage.getCollection(req.params.id);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  // Create collection
  app.post("/api/collections", async (req, res) => {
    try {
      const validatedData = insertCollectionSchema.parse(req.body);
      const collection = await storage.createCollection(validatedData);
      res.status(201).json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid collection data", errors: error.errors });
      }
      console.error("Error creating collection:", error);
      res.status(500).json({ message: "Failed to create collection" });
    }
  });

  // Update collection
  app.put("/api/collections/:id", async (req, res) => {
    try {
      const validatedData = insertCollectionSchema.partial().parse(req.body);
      const collection = await storage.updateCollection(req.params.id, validatedData);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid collection data", errors: error.errors });
      }
      console.error("Error updating collection:", error);
      res.status(500).json({ message: "Failed to update collection" });
    }
  });

  // Delete collection
  app.delete("/api/collections/:id", async (req, res) => {
    try {
      const success = await storage.deleteCollection(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting collection:", error);
      res.status(500).json({ message: "Failed to delete collection" });
    }
  });

  // Export collection
  app.post("/api/collections/:id/export", async (req, res) => {
    try {
      const { format } = req.body as { format: ExportFormat };
      const collection = await storage.getCollection(req.params.id);
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${collection.title}.json"`);
        res.json({
          collection: {
            title: collection.title,
            notes: collection.notes,
            createdAt: collection.createdAt
          },
          entries: collection.entries
        });
      } else if (format === 'markdown') {
        const markdown = [
          `# ${collection.title}`,
          '',
          collection.notes ? `${collection.notes}` : '',
          collection.notes ? '' : '',
          `## Entries (${collection.entries.length})`,
          '',
          ...collection.entries.map(entry => [
            `### ${entry.filename}`,
            `**Category:** ${entry.category}`,
            entry.subcategory ? `**Subcategory:** ${entry.subcategory}` : '',
            `**Summary:** ${entry.summary}`,
            '',
            entry.fullText,
            '',
            '---',
            ''
          ].filter(Boolean)).flat()
        ].filter(Boolean).join('\n');

        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${collection.title}.md"`);
        res.send(markdown);
      } else {
        res.status(400).json({ message: "Invalid export format. Use 'json' or 'markdown'" });
      }
    } catch (error) {
      console.error("Error exporting collection:", error);
      res.status(500).json({ message: "Failed to export collection" });
    }
  });

  // ===== ANNOTATIONS ROUTES =====
  // Get all annotations
  app.get("/api/annotations", async (req, res) => {
    try {
      const annotations = await storage.getAnnotations();
      res.json(annotations);
    } catch (error) {
      console.error("Error fetching annotations:", error);
      res.status(500).json({ message: "Failed to fetch annotations" });
    }
  });

  // Get annotations by entry
  app.get("/api/entries/:entryId/annotations", async (req, res) => {
    try {
      const annotations = await storage.getAnnotationsByEntry(req.params.entryId);
      res.json(annotations);
    } catch (error) {
      console.error("Error fetching annotations:", error);
      res.status(500).json({ message: "Failed to fetch annotations" });
    }
  });

  // Create annotation
  app.post("/api/annotations", async (req, res) => {
    try {
      const validatedData = insertAnnotationSchema.parse(req.body);
      const annotation = await storage.createAnnotation(validatedData);
      res.status(201).json(annotation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid annotation data", errors: error.errors });
      }
      console.error("Error creating annotation:", error);
      res.status(500).json({ message: "Failed to create annotation" });
    }
  });

  // Delete annotation
  app.delete("/api/annotations/:id", async (req, res) => {
    try {
      const success = await storage.deleteAnnotation(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Annotation not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting annotation:", error);
      res.status(500).json({ message: "Failed to delete annotation" });
    }
  });

  // ===== SHARES ROUTES =====
  // Get all shares
  app.get("/api/shares", async (req, res) => {
    try {
      const shares = await storage.getShares();
      res.json(shares);
    } catch (error) {
      console.error("Error fetching shares:", error);
      res.status(500).json({ message: "Failed to fetch shares" });
    }
  });

  // Create share
  app.post("/api/shares", async (req, res) => {
    try {
      const { targetType, targetId } = req.body as ShareRequest;
      const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const share = await storage.createShare({
        targetType,
        targetId,
        shareToken
      });

      const response: ShareResponse = {
        shareToken: share.shareToken,
        shareUrl: `${req.protocol}://${req.get('host')}/shared/${share.shareToken}`
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating share:", error);
      res.status(500).json({ message: "Failed to create share" });
    }
  });

  // Get shared content
  app.get("/api/shared/:token", async (req, res) => {
    try {
      const share = await storage.getShare(req.params.token);
      if (!share) {
        return res.status(404).json({ message: "Share not found or expired" });
      }

      if (share.targetType === 'entry') {
        const entry = await storage.getCodexEntry(share.targetId);
        res.json({ type: 'entry', data: entry });
      } else if (share.targetType === 'collection') {
        const collection = await storage.getCollection(share.targetId);
        res.json({ type: 'collection', data: collection });
      } else {
        res.status(400).json({ message: "Invalid share type" });
      }
    } catch (error) {
      console.error("Error fetching shared content:", error);
      res.status(500).json({ message: "Failed to fetch shared content" });
    }
  });

  // Delete share
  app.delete("/api/shares/:id", async (req, res) => {
    try {
      const success = await storage.deleteShare(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Share not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting share:", error);
      res.status(500).json({ message: "Failed to delete share" });
    }
  });

  // ===== MYSTICAL TOOLS ROUTES =====
  // Get tool runs
  app.get("/api/tools/runs", async (req, res) => {
    try {
      const type = req.query.type as string;
      const toolRuns = type 
        ? await storage.getToolRunsByType(type)
        : await storage.getToolRuns();
      res.json(toolRuns);
    } catch (error) {
      console.error("Error fetching tool runs:", error);
      res.status(500).json({ message: "Failed to fetch tool runs" });
    }
  });

  // Run mystical tool
  app.post("/api/tools/run", async (req, res) => {
    try {
      const request = insertToolRunSchema.parse(req.body);
      
      // Process the mystical tool using OpenAI
      const toolResult = await processMysticalTool({
        type: request.type,
        input: request.input
      });
      
      // Save tool run to storage with result
      const toolRun = await storage.createToolRun({
        type: request.type,
        input: request.input,
        output: toolResult.output
      });

      res.json(toolRun);
    } catch (error) {
      console.error("Mystical tool processing error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Mystical tool processing failed"
      });
    }
  });

  // ===== PYTHON BRIDGE ENDPOINTS =====
  
  // Export collection for Python processing
  app.get("/api/bridge/export/collection/:id", async (req, res) => {
    try {
      const collectionId = req.params.id;
      const collection = await storage.getCollection(collectionId);
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      // Get all entries in the collection
      const entries = await Promise.all(
        collection.entryIds.map(id => storage.getCodexEntry(id))
      );
      
      const validEntries = entries.filter(entry => entry !== undefined);
      
      // Python-optimized export format
      const exportData = {
        collection_info: {
          id: collection.id,
          title: collection.title,
          notes: collection.notes,
          entry_count: validEntries.length,
          exported_at: new Date().toISOString(),
          export_source: 'mystical_bridge'
        },
        entries: validEntries.map(entry => ({
          ...entry,
          python_metadata: {
            word_count: entry.fullText.split(' ').length,
            char_count: entry.fullText.length,
            summary_length: entry.summary.length,
            has_bookmark: entry.bookmark !== null,
            bookmark_notes: entry.bookmark?.personalNotes || null
          }
        })),
        metadata: {
          total_size: validEntries.reduce((sum, entry) => sum + entry.size, 0),
          categories: validEntries.reduce((acc, entry) => {
            acc[entry.category] = (acc[entry.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          key_terms: [...new Set(validEntries.flatMap(entry => entry.keyTerms || []))],
          date_range: {
            earliest: Math.min(...validEntries.map(e => new Date(e.processedDate).getTime())),
            latest: Math.max(...validEntries.map(e => new Date(e.processedDate).getTime()))
          }
        }
      };
      
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting collection for Python:", error);
      res.status(500).json({ message: "Failed to export collection" });
    }
  });
  
  // Export entries for analysis
  app.post("/api/bridge/export/analysis", async (req, res) => {
    try {
      const { entryIds, includeFullText = true, includeBookmarks = true } = req.body;
      
      let entries;
      if (entryIds && Array.isArray(entryIds)) {
        entries = await Promise.all(
          entryIds.map((id: string) => storage.getCodexEntry(id))
        );
        entries = entries.filter(entry => entry !== undefined);
      } else {
        entries = await storage.getCodexEntries();
      }
      
      const exportData = {
        analysis_metadata: {
          total_entries: entries.length,
          exported_at: new Date().toISOString(),
          include_full_text: includeFullText,
          include_bookmarks: includeBookmarks,
          export_purpose: 'python_analysis'
        },
        entries: entries.map(entry => {
          const entryData = {
            id: entry.id,
            filename: entry.filename,
            category: entry.category,
            subcategory: entry.subcategory,
            size: entry.size,
            processed_date: entry.processedDate,
            summary: entry.summary,
            key_chunks: includeFullText ? entry.keyChunks : entry.keyChunks.slice(0, 3),
            key_terms: entry.keyTerms
          } as any;
          
          if (includeFullText) {
            entryData.full_text = entry.fullText;
          }
          
          if (includeBookmarks && entry.bookmark) {
            entryData.bookmark = {
              is_bookmarked: entry.bookmark.isBookmarked,
              personal_notes: entry.bookmark.personalNotes,
              created_at: entry.bookmark.createdAt,
              updated_at: entry.bookmark.updatedAt
            };
          }
          
          return entryData;
        }),
        text_corpus: includeFullText ? entries.map(entry => ({
          id: entry.id,
          text: entry.fullText,
          metadata: {
            category: entry.category,
            size: entry.size
          }
        })) : [],
        category_distribution: entries.reduce((acc, entry) => {
          acc[entry.category] = (acc[entry.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        key_term_frequency: entries.reduce((acc, entry) => {
          if (entry.keyTerms) {
            entry.keyTerms.forEach(term => {
              acc[term] = (acc[term] || 0) + 1;
            });
          }
          return acc;
        }, {} as Record<string, number>),
        processing_hints: {
          recommended_tools: ['nltk', 'spacy', 'sklearn', 'gensim'],
          text_encoding: 'utf-8',
          language: 'english',
          domain: 'mystical_esoteric'
        }
      };
      
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting for analysis:", error);
      res.status(500).json({ message: "Failed to export for analysis" });
    }
  });

  // Bridge status and health check
  app.get("/api/bridge/status", async (req, res) => {
    try {
      const allEntries = await storage.getCodexEntries();
      const allCollections = await storage.getCollections();
      const allBookmarks = await storage.getBookmarkedEntries();
      
      res.json({
        bridge_health: {
          status: 'healthy',
          api_version: '1.0',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        },
        data_summary: {
          total_entries: allEntries.length,
          total_collections: allCollections.length,
          bookmarked_entries: allBookmarks.length,
          categories: [...new Set(allEntries.map(e => e.category))],
          last_processed: allEntries.length > 0 ? 
            Math.max(...allEntries.map(e => new Date(e.processedDate).getTime())) : null
        },
        capabilities: {
          export_collections: true,
          export_analysis: true,
          import_annotations: true,
          sync_python_data: true,
          real_time_sync: false,
          batch_processing: true
        }
      });
    } catch (error) {
      console.error("Error getting bridge status:", error);
      res.status(500).json({ 
        bridge_health: { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      });
    }
  });

  // ===== PYTHON TOOLS ENDPOINTS =====
  
  // Helper function to execute Python scripts through mystical_main.py
  const executePythonScript = async (command: string, args: string[] = []): Promise<any> => {
    
    return new Promise((resolve, reject) => {
      const fullScriptPath = path.join(process.cwd(), 'mystical_python', 'mystical_main.py');
      const allArgs = [command, ...args];
      const python = spawn('python3', [fullScriptPath, ...allArgs], {
        cwd: path.join(process.cwd(), 'mystical_python'),
        env: { ...process.env, PYTHONPATH: path.join(process.cwd(), 'mystical_python') }
      });
      
      let stdout = '';
      let stderr = '';
      
      python.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      
      python.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
      
      python.on('close', (code: number) => {
        if (code === 0) {
          try {
            // Try to parse as JSON, fall back to raw text
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            resolve({ output: stdout, raw: true });
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        }
      });
      
      python.on('error', (error: Error) => {
        reject(error);
      });
    });
  };

  // Grimoire Viewer endpoints
  app.get("/api/python/grimoire-viewer/status", async (req, res) => {
    try {
      const result = await executePythonScript('grimoire', ['--offline']);
      res.json(result);
    } catch (error) {
      console.error("Grimoire Viewer status error:", error);
      res.status(500).json({ message: "Failed to get Grimoire Viewer status" });
    }
  });

  app.post("/api/python/grimoire-viewer/browse", async (req, res) => {
    try {
      const result = await executePythonScript('grimoire', ['--offline']);
      res.json(result);
    } catch (error) {
      console.error("Grimoire Viewer browse error:", error);
      res.status(500).json({ message: "Failed to browse entries" });
    }
  });

  app.get("/api/python/grimoire-viewer/entry/:id", async (req, res) => {
    try {
      const result = await executePythonScript('grimoire', ['--offline']);
      res.json(result);
    } catch (error) {
      console.error("Grimoire Viewer entry error:", error);
      res.status(500).json({ message: "Failed to get entry details" });
    }
  });

  // Lunareth Synchronization endpoints
  app.get("/api/python/lunareth-sync/phases", async (req, res) => {
    try {
      const result = await executePythonScript('lunareth', []);
      res.json(result);
    } catch (error) {
      console.error("Lunareth Sync phases error:", error);
      res.status(500).json({ message: "Failed to get spiral phases" });
    }
  });

  app.post("/api/python/lunareth-sync/set-phase", async (req, res) => {
    try {
      const { phaseId } = req.body;
      const result = await executePythonScript('lunareth', ['--phase', phaseId.toString()]);
      res.json(result);
    } catch (error) {
      console.error("Lunareth Sync set phase error:", error);
      res.status(500).json({ message: "Failed to set spiral phase" });
    }
  });

  app.get("/api/python/lunareth-sync/current-state", async (req, res) => {
    try {
      const result = await executePythonScript('lunareth', []);
      res.json(result);
    } catch (error) {
      console.error("Lunareth Sync state error:", error);
      res.status(500).json({ message: "Failed to get synchronization state" });
    }
  });

  app.post("/api/python/lunareth-sync/animate", async (req, res) => {
    try {
      const { fromPhase, toPhase } = req.body;
      const result = await executePythonScript('lunareth', ['--phase', fromPhase.toString()]);
      res.json(result);
    } catch (error) {
      console.error("Lunareth Sync animation error:", error);
      res.status(500).json({ message: "Failed to generate animation" });
    }
  });

  // Sacred Geometry endpoints
  app.get("/api/python/sacred-geometry/patterns", async (req, res) => {
    try {
      const result = await executePythonScript('geometry', []);
      res.json(result);
    } catch (error) {
      console.error("Sacred Geometry patterns error:", error);
      res.status(500).json({ message: "Failed to get pattern list" });
    }
  });

  app.post("/api/python/sacred-geometry/generate", async (req, res) => {
    try {
      const { patternType, width = 800 } = req.body;
      const result = await executePythonScript('geometry', [
        '--pattern', patternType || 'golden_spiral',
        '--size', width.toString()
      ]);
      res.json(result);
    } catch (error) {
      console.error("Sacred Geometry generation error:", error);
      res.status(500).json({ message: "Failed to generate pattern" });
    }
  });

  app.post("/api/python/sacred-geometry/l-system", async (req, res) => {
    try {
      const result = await executePythonScript('geometry', [
        '--pattern', 'fractal_tree'
      ]);
      res.json(result);
    } catch (error) {
      console.error("Sacred Geometry L-system error:", error);
      res.status(500).json({ message: "Failed to generate L-system" });
    }
  });

  // Mystical Tools Client endpoints
  app.post("/api/python/mystical-tools/oracle", async (req, res) => {
    try {
      const { query, context = 'general' } = req.body;
      const result = await executePythonScript('tools', [
        '--oracle', query,
        '--context', context
      ]);
      res.json(result);
    } catch (error) {
      console.error("Mystical Tools Oracle error:", error);
      res.status(500).json({ message: "Failed to consult Oracle through Python" });
    }
  });

  app.post("/api/python/mystical-tools/sigil", async (req, res) => {
    try {
      const { intention } = req.body;
      const result = await executePythonScript('tools', [
        '--sigil', intention
      ]);
      res.json(result);
    } catch (error) {
      console.error("Mystical Tools Sigil error:", error);
      res.status(500).json({ message: "Failed to generate Sigil through Python" });
    }
  });

  app.post("/api/python/mystical-tools/sonic-echo", async (req, res) => {
    try {
      const { text } = req.body;
      const result = await executePythonScript('tools', [
        '--sonic', text
      ]);
      res.json(result);
    } catch (error) {
      console.error("Mystical Tools Sonic Echo error:", error);
      res.status(500).json({ message: "Failed to generate Sonic Echo through Python" });
    }
  });

  app.get("/api/python/mystical-tools/session", async (req, res) => {
    try {
      const result = await executePythonScript('tools', ['--offline']);
      res.json(result);
    } catch (error) {
      console.error("Mystical Tools session error:", error);
      res.status(500).json({ message: "Failed to get tool session info" });
    }
  });

  // Integration Bridge endpoints
  app.get("/api/python/integration-bridge/status", async (req, res) => {
    try {
      const result = await executePythonScript('bridge', []);
      res.json(result);
    } catch (error) {
      console.error("Integration Bridge status error:", error);
      res.status(500).json({ message: "Failed to get bridge status" });
    }
  });

  app.post("/api/python/integration-bridge/sync", async (req, res) => {
    try {
      const result = await executePythonScript('bridge', []);
      res.json(result);
    } catch (error) {
      console.error("Integration Bridge sync error:", error);
      res.status(500).json({ message: "Failed to synchronize data" });
    }
  });

  app.post("/api/python/integration-bridge/export", async (req, res) => {
    try {
      const result = await executePythonScript('bridge', []);
      res.json(result);
    } catch (error) {
      console.error("Integration Bridge export error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  app.get("/api/python/integration-bridge/metrics", async (req, res) => {
    try {
      const result = await executePythonScript('bridge', []);
      res.json(result);
    } catch (error) {
      console.error("Integration Bridge metrics error:", error);
      res.status(500).json({ message: "Failed to get bridge metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
