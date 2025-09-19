import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { codexService } from "./services/codex";
import { consultOracle } from "./services/openai";
import { insertBookmarkSchema, insertOracleConsultationSchema, type OracleRequest, type OracleResponse } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
