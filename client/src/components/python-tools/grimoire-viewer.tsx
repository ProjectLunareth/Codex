import { useState, useEffect, useCallback } from "react";
import { Terminal, Search, BookOpen, Eye, ChevronRight, ChevronLeft, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GrimoireEntry {
  id: string;
  filename: string;
  category: string;
  subcategory?: string;
  summary: string;
  size: number;
  keyTerms?: string[];
  fullText?: string;
  bookmark?: {
    isBookmarked: boolean;
    personalNotes?: string;
  };
}

interface GrimoireBrowseResult {
  entries: GrimoireEntry[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface GrimoireViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GrimoireViewer({ isOpen, onClose }: GrimoireViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [selectedEntry, setSelectedEntry] = useState<GrimoireEntry | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "terminal">("terminal");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "🌙 Mystical Grimoire Viewer initialized",
    "📚 Connected to sacred codex archives",
    "✨ Type 'help' for available commands"
  ]);

  const { toast } = useToast();

  // Query for browsing entries
  const browseQuery = useQuery({
    queryKey: ['/api/python/grimoire-viewer/browse', currentPage, pageSize, selectedCategory, searchQuery],
    queryFn: async () => {
      const response = await fetch('/api/python/grimoire-viewer/browse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: currentPage,
          pageSize,
          category: selectedCategory,
          search: searchQuery
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to browse entries');
      }
      
      return response.json() as Promise<GrimoireBrowseResult>;
    },
    enabled: isOpen
  });

  // Query for entry details
  const entryQuery = useQuery({
    queryKey: ['/api/python/grimoire-viewer/entry', selectedEntry?.id],
    queryFn: async () => {
      if (!selectedEntry?.id) return null;
      
      const response = await fetch(`/api/python/grimoire-viewer/entry/${selectedEntry.id}`);
      if (!response.ok) {
        throw new Error('Failed to get entry details');
      }
      
      return response.json();
    },
    enabled: !!selectedEntry?.id
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
    addToTerminalHistory(`🔍 Searching for: "${query}"`);
  }, []);

  const handleCategoryFilter = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(0);
    if (category) {
      addToTerminalHistory(`📂 Filtering by category: ${category}`);
    } else {
      addToTerminalHistory("📂 Clearing category filter");
    }
  }, []);

  const addToTerminalHistory = (message: string) => {
    setTerminalHistory(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const handleEntrySelect = (entry: GrimoireEntry) => {
    setSelectedEntry(entry);
    addToTerminalHistory(`📖 Viewing entry: ${entry.filename}`);
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && browseQuery.data?.hasMore) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
    addToTerminalHistory(`📄 Page ${direction === 'next' ? currentPage + 2 : currentPage}`);
  };

  const categories = [
    "cosmogenesis", "psychogenesis", "mystagogy",
    "climbing-systems", "initiation-rites", "archetypal-structures", "psychic-technologies"
  ];

  useEffect(() => {
    if (isOpen) {
      addToTerminalHistory("🌟 Grimoire Viewer opened");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900 to-purple-900 border-mystical text-white">
        <DialogHeader className="border-b border-purple-400/30 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-cinzel text-amber-300">
            <Terminal className="h-6 w-6" />
            ✦ Mystical Grimoire Viewer ✦
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4 h-[70vh]">
          {/* Left Panel - Search & Navigation */}
          <div className="col-span-4 flex flex-col space-y-4">
            {/* Search Controls */}
            <Card className="bg-slate-800/50 border-purple-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-amber-300">Sacred Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-purple-300" />
                  <Input
                    placeholder="Search the mystical archives..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8 bg-slate-700/50 border-purple-400/30 text-white placeholder:text-purple-300"
                    data-testid="input-grimoire-search"
                  />
                </div>
                
                <Select value={selectedCategory || "all"} onValueChange={val => handleCategoryFilter(val === "all" ? null : val)}>
                  <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white" data-testid="select-grimoire-category">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-400/30">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-white hover:bg-purple-700/50">
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "terminal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("terminal")}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    data-testid="button-terminal-mode"
                  >
                    <Terminal className="h-4 w-4 mr-1" />
                    Terminal
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex-1"
                    data-testid="button-list-mode"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    List
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Terminal View */}
            {viewMode === "terminal" && (
              <Card className="bg-black/80 border-green-400/30 flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-green-400">Terminal Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48 font-mono text-xs">
                    <div className="space-y-1">
                      {terminalHistory.map((line, index) => (
                        <div key={index} className="text-green-300" data-testid={`terminal-line-${index}`}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Entry Statistics */}
            <Card className="bg-slate-800/50 border-purple-400/30">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <div className="text-amber-300 font-semibold" data-testid="text-total-entries">
                      {browseQuery.data?.totalCount || 0}
                    </div>
                    <div className="text-purple-300">Total Entries</div>
                  </div>
                  <div>
                    <div className="text-amber-300 font-semibold" data-testid="text-current-page">
                      {currentPage + 1}
                    </div>
                    <div className="text-purple-300">Current Page</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Entry List */}
          <div className="col-span-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-amber-300">Sacred Entries</h3>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 0}
                  className="px-2"
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('next')}
                  disabled={!browseQuery.data?.hasMore}
                  className="px-2"
                  data-testid="button-next-page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {browseQuery.isLoading ? (
                <div className="text-center py-8 text-purple-300">Loading sacred entries...</div>
              ) : browseQuery.error ? (
                <div className="text-center py-8 text-red-400">Error loading entries</div>
              ) : (
                <div className="space-y-2">
                  {(browseQuery.data?.entries || []).map((entry) => (
                    <Card
                      key={entry.id}
                      className={`cursor-pointer transition-all hover:border-amber-400/50 ${
                        selectedEntry?.id === entry.id
                          ? 'bg-purple-700/30 border-amber-400'
                          : 'bg-slate-800/30 border-purple-400/30'
                      }`}
                      onClick={() => handleEntrySelect(entry)}
                      data-testid={`card-entry-${entry.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-amber-300 truncate">
                              {entry.filename}
                            </div>
                            <div className="text-xs text-purple-300 mt-1">
                              {entry.category} • {entry.size} bytes
                            </div>
                            <div className="text-xs text-slate-300 mt-1 line-clamp-2">
                              {entry.summary}
                            </div>
                          </div>
                          {entry.bookmark?.isBookmarked && (
                            <Badge variant="secondary" className="bg-amber-600/20 text-amber-300 ml-2">
                              ★
                            </Badge>
                          )}
                        </div>
                        {(entry.keyTerms && entry.keyTerms.length > 0) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(entry.keyTerms || []).slice(0, 3).map((term, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-purple-400/30">
                                {term}
                              </Badge>
                            ))}
                            {(entry.keyTerms?.length || 0) > 3 && (
                              <Badge variant="outline" className="text-xs border-purple-400/30">
                                +{(entry.keyTerms?.length || 0) - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Panel - Entry Details */}
          <div className="col-span-4 flex flex-col">
            <h3 className="font-semibold text-amber-300 mb-3">Entry Details</h3>
            
            {selectedEntry ? (
              <Card className="bg-slate-800/50 border-purple-400/30 flex-1">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    {selectedEntry.filename}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className="bg-purple-600">{selectedEntry.category}</Badge>
                    {selectedEntry.subcategory && (
                      <Badge variant="outline">{selectedEntry.subcategory}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-purple-300 mb-2">Summary</h4>
                        <p className="text-sm text-slate-300" data-testid="text-entry-summary">
                          {selectedEntry.summary}
                        </p>
                      </div>
                      
                      {(selectedEntry.keyTerms && selectedEntry.keyTerms.length > 0) && (
                        <div>
                          <h4 className="font-semibold text-purple-300 mb-2">Key Terms</h4>
                          <div className="flex flex-wrap gap-1">
                            {(selectedEntry.keyTerms || []).map((term, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {entryQuery.data?.fullText && (
                        <div>
                          <h4 className="font-semibold text-purple-300 mb-2">Full Content</h4>
                          <div className="text-xs text-slate-300 whitespace-pre-wrap" data-testid="text-entry-content">
                            {entryQuery.data.fullText.substring(0, 1000)}
                            {entryQuery.data.fullText.length > 1000 && "..."}
                          </div>
                        </div>
                      )}

                      {selectedEntry.bookmark?.personalNotes && (
                        <div>
                          <h4 className="font-semibold text-purple-300 mb-2">Personal Notes</h4>
                          <p className="text-sm text-amber-200 italic">
                            {selectedEntry.bookmark.personalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/30 border-purple-400/30 flex-1 flex items-center justify-center">
                <div className="text-center text-purple-300">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select an entry to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-purple-400/30">
          <div className="text-sm text-purple-300">
            Python-powered mystical archive browser
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-purple-400/30 hover:bg-purple-700/30"
            data-testid="button-close-grimoire"
          >
            Close Viewer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}