import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Eye, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGrimoireEntrySchema, type GrimoireEntry, type InsertGrimoireEntry } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

const grimoireFormSchema = insertGrimoireEntrySchema.extend({
  tagsInput: z.string().optional(),
});

type GrimoireFormData = z.infer<typeof grimoireFormSchema>;

export default function GrimoirePage() {
  const [selectedEntry, setSelectedEntry] = useState<GrimoireEntry | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GrimoireEntry | null>(null);
  const { toast } = useToast();

  const { data: entries = [], isLoading } = useQuery<GrimoireEntry[]>({
    queryKey: ["/api/grimoire/entries"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertGrimoireEntry) => {
      return await apiRequest("POST", "/api/grimoire/entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grimoire/entries"] });
      setIsCreateModalOpen(false);
      toast({ title: "Success", description: "Grimoire entry created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create grimoire entry", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertGrimoireEntry> }) => {
      return await apiRequest("PUT", `/api/grimoire/entries/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grimoire/entries"] });
      setIsEditModalOpen(false);
      setEditingEntry(null);
      toast({ title: "Success", description: "Grimoire entry updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update grimoire entry", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/grimoire/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grimoire/entries"] });
      toast({ title: "Success", description: "Grimoire entry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete grimoire entry", variant: "destructive" });
    },
  });

  const createForm = useForm<GrimoireFormData>({
    resolver: zodResolver(grimoireFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "personal-writing",
      tagsInput: "",
      isPrivate: true,
    },
  });

  const editForm = useForm<GrimoireFormData>({
    resolver: zodResolver(grimoireFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "personal-writing",
      tagsInput: "",
      isPrivate: true,
    },
  });

  const onCreateSubmit = (data: GrimoireFormData) => {
    const tags = data.tagsInput
      ? data.tagsInput.split(",").map(tag => tag.trim()).filter(Boolean)
      : [];
    
    const insertData: InsertGrimoireEntry = {
      title: data.title,
      content: data.content,
      category: data.category || "personal-writing",
      tags,
      isPrivate: data.isPrivate ?? true,
    };

    createMutation.mutate(insertData);
  };

  const onEditSubmit = (data: GrimoireFormData) => {
    if (!editingEntry) return;

    const tags = data.tagsInput
      ? data.tagsInput.split(",").map(tag => tag.trim()).filter(Boolean)
      : [];
    
    const updateData: Partial<InsertGrimoireEntry> = {
      title: data.title,
      content: data.content,
      category: data.category || "personal-writing",
      tags,
      isPrivate: data.isPrivate ?? true,
    };

    updateMutation.mutate({ id: editingEntry.id, data: updateData });
  };

  const openEditModal = (entry: GrimoireEntry) => {
    setEditingEntry(entry);
    editForm.reset({
      title: entry.title,
      content: entry.content,
      category: entry.category,
      tagsInput: entry.tags?.join(", ") || "",
      isPrivate: entry.isPrivate,
    });
    setIsEditModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.reset();
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEntry(null);
    editForm.reset();
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      "personal-writing": "Personal Writing",
      "ritual-notes": "Ritual Notes",
      "divination-records": "Divination Records",
      "meditation-insights": "Meditation Insights",
      "dream-journal": "Dream Journal",
      "magical-experiments": "Magical Experiments",
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="mystical-border border-l-0 border-t-0 border-r-0 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-primary tracking-wider">
              ✦ PERSONAL GRIMOIRE ✦
            </h1>
            <p className="text-muted-foreground mt-2 italic">
              Your Sacred Collection of Mystical Writings
            </p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="mystical-border oracle-glow font-cinzel font-semibold"
                data-testid="button-create-entry"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="font-cinzel text-xl text-primary">Create New Grimoire Entry</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2">
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter title..." {...field} data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="personal-writing">Personal Writing</SelectItem>
                            <SelectItem value="ritual-notes">Ritual Notes</SelectItem>
                            <SelectItem value="divination-records">Divination Records</SelectItem>
                            <SelectItem value="meditation-insights">Meditation Insights</SelectItem>
                            <SelectItem value="dream-journal">Dream Journal</SelectItem>
                            <SelectItem value="magical-experiments">Magical Experiments</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="tagsInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter tags separated by commas..." 
                            {...field} 
                            data-testid="input-tags"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your mystical insights..." 
                            className="min-h-[300px]"
                            {...field} 
                            data-testid="textarea-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={closeCreateModal} data-testid="button-cancel">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      data-testid="button-save"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {createMutation.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                  </div>
                </form>
              </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading grimoire entries...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-4">Your grimoire is empty</p>
            <p>Begin your mystical journey by creating your first entry</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <Card key={entry.id} className="mystical-border hover:bg-accent/5 transition-all group" data-testid={`card-entry-${entry.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Badge className="category-badge mb-2">
                        {getCategoryDisplayName(entry.category)}
                      </Badge>
                      <CardTitle className="font-cinzel text-lg text-primary truncate" data-testid={`text-title-${entry.id}`}>
                        {entry.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(entry.updatedAt)}
                      </p>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEntry(entry)}
                        data-testid={`button-view-${entry.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(entry)}
                        data-testid={`button-edit-${entry.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(entry.id)}
                        data-testid={`button-delete-${entry.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {entry.content}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {entry.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* View Entry Modal */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="font-cinzel text-xl text-primary">
                    {selectedEntry.title}
                  </DialogTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="category-badge">
                      {getCategoryDisplayName(selectedEntry.category)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(selectedEntry.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      openEditModal(selectedEntry);
                      setSelectedEntry(null);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-foreground">
                    {selectedEntry.content}
                  </div>
                </div>
                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Entry Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-cinzel text-xl text-primary">Edit Grimoire Entry</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal-writing">Personal Writing</SelectItem>
                        <SelectItem value="ritual-notes">Ritual Notes</SelectItem>
                        <SelectItem value="divination-records">Divination Records</SelectItem>
                        <SelectItem value="meditation-insights">Meditation Insights</SelectItem>
                        <SelectItem value="dream-journal">Dream Journal</SelectItem>
                        <SelectItem value="magical-experiments">Magical Experiments</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="tagsInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter tags separated by commas..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your mystical insights..." 
                        className="min-h-[300px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={closeEditModal}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Update Entry"}
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}