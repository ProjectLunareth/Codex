import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Download, Trash2, Edit, BookOpen, FileText, Share2, Copy } from "lucide-react";
import { type CodexEntry, type Collection, type CollectionWithEntries, insertCollectionSchema } from "@shared/schema";

interface CollectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const createCollectionSchema = insertCollectionSchema.extend({
  title: z.string().min(1, "Collection title is required").max(100, "Title must be 100 characters or less"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

type CreateCollectionForm = z.infer<typeof createCollectionSchema>;

export default function CollectionManager({ isOpen, onClose }: CollectionManagerProps) {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { toast } = useToast();

  // Fetch all entries for selection
  const { data: allEntries = [], isLoading: isLoadingEntries } = useQuery<CodexEntry[]>({
    queryKey: ["/api/codex/entries"]
  });

  // Fetch all collections
  const { data: collections = [], isLoading: isLoadingCollections } = useQuery<CollectionWithEntries[]>({
    queryKey: ["/api/collections"]
  });

  // Create collection form
  const form = useForm<CreateCollectionForm>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      title: "",
      notes: "",
      entryIds: [],
      isPublic: false
    }
  });

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: async (data: CreateCollectionForm) => {
      const payload = {
        ...data,
        entryIds: selectedEntries
      };
      return apiRequest("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Collection created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      form.reset();
      setSelectedEntries([]);
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create collection",
        variant: "destructive"
      });
    }
  });

  // Delete collection mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/collections/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Collection deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      setSelectedCollection(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete collection",
        variant: "destructive"
      });
    }
  });

  // Export collection function
  const exportCollection = async (collection: CollectionWithEntries, format: 'json' | 'markdown') => {
    try {
      const response = await fetch(`/api/collections/${collection.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Collection exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export collection",
        variant: "destructive"
      });
    }
  };

  // Filter entries for selection
  const filteredEntries = allEntries.filter(entry => {
    const matchesSearch = entry.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEntryToggle = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const onSubmit = (data: CreateCollectionForm) => {
    createCollectionMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="container mx-auto p-6 h-full">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-cinzel text-2xl">
                <BookOpen className="h-6 w-6" />
                Collection Manager
              </CardTitle>
              <Button variant="outline" onClick={onClose} data-testid="button-close-collection-manager">
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)]">
            <Tabs defaultValue="browse" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse" data-testid="tab-browse-collections">
                  Browse Collections ({collections.length})
                </TabsTrigger>
                <TabsTrigger value="create" data-testid="tab-create-collection">
                  Create New Collection
                </TabsTrigger>
              </TabsList>

              {/* Browse Collections Tab */}
              <TabsContent value="browse" className="h-[calc(100%-3rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Collections List */}
                  <div className="space-y-4">
                    <h3 className="font-cinzel text-lg font-semibold">Your Collections</h3>
                    {isLoadingCollections ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : collections.length === 0 ? (
                      <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No collections yet. Create your first collection to organize your codex entries!</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <ScrollArea className="h-[calc(100%-2rem)]">
                        <div className="space-y-3">
                          {collections.map((collection) => (
                            <Card 
                              key={collection.id} 
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedCollection === collection.id ? "ring-2 ring-primary" : ""
                              }`}
                              onClick={() => setSelectedCollection(collection.id)}
                              data-testid={`collection-${collection.id}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold truncate">{collection.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {collection.entries.length} entries
                                    </p>
                                    {collection.notes && (
                                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                        {collection.notes}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant={collection.isPublic ? "default" : "secondary"}>
                                        {collection.isPublic ? "Public" : "Private"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(collection.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 ml-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        exportCollection(collection, 'json');
                                      }}
                                      data-testid={`button-export-json-${collection.id}`}
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        exportCollection(collection, 'markdown');
                                      }}
                                      data-testid={`button-export-markdown-${collection.id}`}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCollectionMutation.mutate(collection.id);
                                      }}
                                      data-testid={`button-delete-${collection.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>

                  {/* Collection Details */}
                  <div>
                    {selectedCollection ? (
                      (() => {
                        const collection = collections.find(c => c.id === selectedCollection);
                        return collection ? (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">{collection.title}</CardTitle>
                              {collection.notes && (
                                <p className="text-sm text-muted-foreground">{collection.notes}</p>
                              )}
                            </CardHeader>
                            <CardContent>
                              <div className="flex gap-2 mb-4">
                                <Button
                                  size="sm"
                                  onClick={() => exportCollection(collection, 'json')}
                                  data-testid={`button-export-selected-json`}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Export JSON
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => exportCollection(collection, 'markdown')}
                                  data-testid={`button-export-selected-markdown`}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Export Markdown
                                </Button>
                              </div>
                              
                              <Separator className="mb-4" />
                              
                              <h4 className="font-semibold mb-3">Entries ({collection.entries.length})</h4>
                              <ScrollArea className="h-64">
                                <div className="space-y-2">
                                  {collection.entries.map((entry) => (
                                    <div key={entry.id} className="p-2 bg-muted/30 rounded-md">
                                      <p className="font-medium text-sm">{entry.filename}</p>
                                      <p className="text-xs text-muted-foreground capitalize">{entry.category}</p>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        ) : null;
                      })()
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <p>Select a collection to view details and manage entries</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Create Collection Tab */}
              <TabsContent value="create" className="h-[calc(100%-3rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Collection Form */}
                  <div>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Collection Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter collection title..." {...field} data-testid="input-collection-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Add notes about this collection..."
                                  className="resize-none"
                                  rows={3}
                                  {...field}
                                  data-testid="textarea-collection-notes"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Selected Entries</label>
                            <Badge variant="outline">{selectedEntries.length} selected</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <Input
                              placeholder="Search entries..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              data-testid="input-search-entries"
                            />
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                              <SelectTrigger data-testid="select-category-filter">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="cosmogenesis">Cosmogenesis</SelectItem>
                                <SelectItem value="psychogenesis">Psychogenesis</SelectItem>
                                <SelectItem value="mystagogy">Mystagogy</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            disabled={createCollectionMutation.isPending || selectedEntries.length === 0}
                            data-testid="button-create-collection"
                          >
                            {createCollectionMutation.isPending ? "Creating..." : "Create Collection"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setSelectedEntries([])}
                            data-testid="button-clear-selection"
                          >
                            Clear Selection
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>

                  {/* Entry Selection */}
                  <div>
                    <h3 className="font-cinzel text-lg font-semibold mb-3">
                      Select Entries ({selectedEntries.length}/{filteredEntries.length})
                    </h3>
                    {isLoadingEntries ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <ScrollArea className="h-[calc(100%-3rem)]">
                        <div className="space-y-2 pr-4">
                          {filteredEntries.map((entry) => (
                            <div 
                              key={entry.id} 
                              className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/30 transition-colors"
                            >
                              <Checkbox
                                checked={selectedEntries.includes(entry.id)}
                                onCheckedChange={() => handleEntryToggle(entry.id)}
                                data-testid={`checkbox-entry-${entry.id}`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{entry.filename}</p>
                                <p className="text-xs text-muted-foreground capitalize mb-1">{entry.category}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{entry.summary}</p>
                                {entry.keyTerms && entry.keyTerms.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {entry.keyTerms.slice(0, 3).map((term, i) => (
                                      <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                                        {term}
                                      </Badge>
                                    ))}
                                    {entry.keyTerms.length > 3 && (
                                      <Badge variant="outline" className="text-xs px-1 py-0">
                                        +{entry.keyTerms.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}