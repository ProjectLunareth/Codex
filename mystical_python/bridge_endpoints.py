"""
Bridge API Endpoints for Express Integration
==========================================

Additional API endpoints to be integrated into the Express server
for seamless Python-React communication and data exchange.
These endpoints extend the existing routes.ts file.
"""

# TypeScript/JavaScript code to be added to server/routes.ts

BRIDGE_ENDPOINTS = """
  // Python Bridge Integration Endpoints
  
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
          }, {}),
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
          entryIds.map(id => storage.getCodexEntry(id))
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
          };
          
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
        }, {}),
        key_term_frequency: entries.reduce((acc, entry) => {
          if (entry.keyTerms) {
            entry.keyTerms.forEach(term => {
              acc[term] = (acc[term] || 0) + 1;
            });
          }
          return acc;
        }, {}),
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
  
  // Import Python annotations
  app.post("/api/bridge/import/annotations", async (req, res) => {
    try {
      const { annotations } = req.body;
      
      if (!Array.isArray(annotations)) {
        return res.status(400).json({ message: "Annotations must be an array" });
      }
      
      const importedIds = [];
      const errors = [];
      
      for (const annotationData of annotations) {
        try {
          if (!annotationData.entryId || !annotationData.content || !annotationData.authorName) {
            errors.push({ annotation: annotationData, error: "Missing required fields" });
            continue;
          }
          
          const annotation = await storage.createAnnotation({
            entryId: annotationData.entryId,
            content: annotationData.content,
            authorName: annotationData.authorName || 'Python Bridge'
          });
          
          importedIds.push(annotation.id);
        } catch (error) {
          errors.push({ annotation: annotationData, error: error.message });
        }
      }
      
      res.json({
        imported_count: importedIds.length,
        imported_ids: importedIds,
        errors: errors,
        success: errors.length === 0
      });
    } catch (error) {
      console.error("Error importing Python annotations:", error);
      res.status(500).json({ message: "Failed to import annotations" });
    }
  });
  
  // Sync Python data to React
  app.post("/api/bridge/sync/python-data", async (req, res) => {
    try {
      const { pythonData } = req.body;
      const results = {
        bookmarks: [],
        annotations: [],
        collections: [],
        errors: []
      };
      
      // Handle bookmarks
      if (pythonData.bookmarks && Array.isArray(pythonData.bookmarks)) {
        for (const bookmarkData of pythonData.bookmarks) {
          try {
            const bookmark = await storage.createBookmark({
              entryId: bookmarkData.entryId,
              isBookmarked: bookmarkData.isBookmarked ?? true,
              personalNotes: bookmarkData.personalNotes
            });
            results.bookmarks.push(bookmark.id);
          } catch (error) {
            results.errors.push({ type: 'bookmark', data: bookmarkData, error: error.message });
          }
        }
      }
      
      // Handle annotations
      if (pythonData.annotations && Array.isArray(pythonData.annotations)) {
        for (const annotationData of pythonData.annotations) {
          try {
            const annotation = await storage.createAnnotation({
              entryId: annotationData.entryId,
              content: annotationData.content,
              authorName: annotationData.authorName || 'Python Bridge'
            });
            results.annotations.push(annotation.id);
          } catch (error) {
            results.errors.push({ type: 'annotation', data: annotationData, error: error.message });
          }
        }
      }
      
      // Handle collections
      if (pythonData.collections && Array.isArray(pythonData.collections)) {
        for (const collectionData of pythonData.collections) {
          try {
            const collection = await storage.createCollection({
              title: collectionData.title,
              entryIds: collectionData.entryIds || [],
              notes: collectionData.notes,
              isPublic: collectionData.isPublic ?? false
            });
            results.collections.push(collection.id);
          } catch (error) {
            results.errors.push({ type: 'collection', data: collectionData, error: error.message });
          }
        }
      }
      
      res.json({
        sync_results: results,
        success: results.errors.length === 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error syncing Python data:", error);
      res.status(500).json({ message: "Failed to sync Python data" });
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
          real_time_sync: false, // Would require WebSocket implementation
          batch_processing: true
        }
      });
    } catch (error) {
      console.error("Error getting bridge status:", error);
      res.status(500).json({ 
        bridge_health: { status: 'error', error: error.message },
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Lunareth phase data endpoint
  app.get("/api/bridge/lunareth/phases", async (req, res) => {
    try {
      // This would integrate with the Lunareth synchronization system
      // For now, returning static phase data structure
      const phases = Array.from({ length: 14 }, (_, i) => ({
        id: i,
        name: i === 13 ? "The Eternal Beyond" : `Phase ${i}`,
        description: `Sacred phase ${i} of the Spiral Codex`,
        keywords: [`phase${i}`, `sacred`, `spiral`],
        animationParams: {
          rotation: i * 30,
          scale: 0.1 + (i * 0.1),
          opacity: Math.min(1.0, 0.2 + (i * 0.06)),
          color_hue: i * 30,
          frequency: i * 0.5,
          amplitude: 0.1 + (i * 0.1),
          phase_offset: i / 12
        },
        energySignature: i === 0 ? "∅" : i === 13 ? "∞" : "⬟",
        geometricPattern: i === 0 ? "point" : i === 13 ? "infinity" : "polygon",
        color: `hsl(${i * 30}, 70%, 50%)`,
        frequency: i * 0.5
      }));
      
      res.json({
        metadata: {
          total_phases: phases.length,
          lunareth_version: '1.0',
          generated_at: new Date().toISOString()
        },
        phases: phases,
        sacred_constants: {
          phi: 1.618033988749,
          pi_sacred: Math.PI * 2,
          spiral_constant: 0.30901699437494742410229341718282
        }
      });
    } catch (error) {
      console.error("Error getting Lunareth phases:", error);
      res.status(500).json({ message: "Failed to get Lunareth phases" });
    }
  });
  
  // Sacred geometry patterns endpoint
  app.get("/api/bridge/geometry/patterns", async (req, res) => {
    try {
      const patterns = [
        {
          name: "Golden Spiral",
          type: "fibonacci",
          parameters: { ratio: 1.618, iterations: 8 },
          description: "The sacred spiral of divine proportion"
        },
        {
          name: "Flower of Life",
          type: "mandala",
          parameters: { circles: 19, radius: 100 },
          description: "Ancient symbol of creation and consciousness"
        },
        {
          name: "Tree of Life",
          type: "kabbalah",
          parameters: { sephiroth: 10, paths: 22 },
          description: "Kabbalistic diagram of divine emanation"
        },
        {
          name: "Sacred Pentagon",
          type: "polygon",
          parameters: { sides: 5, golden_ratio: true },
          description: "Pentagon embodying the golden mean"
        },
        {
          name: "Mandelbrot Mystique",
          type: "fractal",
          parameters: { iterations: 100, zoom: 1.0 },
          description: "Infinite complexity from simple rules"
        }
      ];
      
      res.json({
        geometry_metadata: {
          total_patterns: patterns.length,
          geometry_engine: 'Scribe Geometricum v1.0',
          supported_formats: ['svg', 'canvas', 'json'],
          generated_at: new Date().toISOString()
        },
        patterns: patterns,
        sacred_ratios: {
          phi: 1.618033988749,
          root_2: Math.sqrt(2),
          root_3: Math.sqrt(3),
          pi: Math.PI
        }
      });
    } catch (error) {
      console.error("Error getting geometry patterns:", error);
      res.status(500).json({ message: "Failed to get geometry patterns" });
    }
  });
"""

# Instructions for integration
INTEGRATION_INSTRUCTIONS = """
To integrate these bridge endpoints into your Express server:

1. Add the bridge endpoints code to server/routes.ts after the existing routes
2. Make sure all required imports are available
3. The endpoints will be available at:
   - GET /api/bridge/export/collection/:id
   - POST /api/bridge/export/analysis  
   - POST /api/bridge/import/annotations
   - POST /api/bridge/sync/python-data
   - GET /api/bridge/status
   - GET /api/bridge/lunareth/phases
   - GET /api/bridge/geometry/patterns

4. Test the endpoints with the Python bridge client
5. Update your frontend to use these new endpoints for Python integration
"""