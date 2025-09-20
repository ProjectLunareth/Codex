import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare, Plus, Trash2, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { type Annotation, insertAnnotationSchema } from "@shared/schema";

interface EntryAnnotationsProps {
  entryId: string;
  entryTitle: string;
}

const createAnnotationSchema = insertAnnotationSchema.extend({
  content: z.string().min(1, "Annotation content is required").max(1000, "Content must be 1000 characters or less"),
  authorName: z.string().min(1, "Author name is required").max(50, "Name must be 50 characters or less"),
});

type CreateAnnotationForm = z.infer<typeof createAnnotationSchema>;

export default function EntryAnnotations({ entryId, entryTitle }: EntryAnnotationsProps) {
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const { toast } = useToast();

  // Fetch annotations for this entry
  const { data: annotations = [], isLoading } = useQuery<Annotation[]>({
    queryKey: ["/api/annotations", entryId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/annotations?entryId=${entryId}`);
      return response.json();
    }
  });

  // Create annotation form
  const form = useForm<CreateAnnotationForm>({
    resolver: zodResolver(createAnnotationSchema),
    defaultValues: {
      content: "",
      authorName: "",
      entryId: entryId
    }
  });

  // Create annotation mutation
  const createAnnotationMutation = useMutation({
    mutationFn: async (data: CreateAnnotationForm) => {
      return apiRequest("POST", "/api/annotations", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Annotation added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/annotations", entryId] });
      form.reset();
      setIsAddingAnnotation(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to add annotation",
        variant: "destructive"
      });
    }
  });

  // Delete annotation mutation
  const deleteAnnotationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/annotations/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Annotation deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/annotations", entryId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete annotation",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CreateAnnotationForm) => {
    createAnnotationMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-cinzel text-lg font-semibold">
            Annotations
          </h3>
          <Badge variant="outline">{annotations.length}</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
          data-testid="button-toggle-add-annotation"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Annotation
        </Button>
      </div>

      {/* Add Annotation Form */}
      {isAddingAnnotation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Annotation</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name..."
                          {...field}
                          data-testid="input-annotation-author"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annotation</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts, insights, or questions about this entry..."
                          className="resize-none"
                          rows={4}
                          {...field}
                          data-testid="textarea-annotation-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createAnnotationMutation.isPending}
                    data-testid="button-submit-annotation"
                  >
                    {createAnnotationMutation.isPending ? "Adding..." : "Add Annotation"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingAnnotation(false);
                      form.reset();
                    }}
                    data-testid="button-cancel-annotation"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Annotations List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : annotations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                No annotations yet. Be the first to share your insights about "{entryTitle}"!
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-3 pr-4">
              {annotations.map((annotation) => (
                <Card key={annotation.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Author Avatar */}
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                        <span className="text-sm font-semibold text-primary">
                          {getAuthorInitials(annotation.authorName)}
                        </span>
                      </div>

                      {/* Annotation Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{annotation.authorName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(annotation.createdAt)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAnnotationMutation.mutate(annotation.id)}
                              disabled={deleteAnnotationMutation.isPending}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              data-testid={`button-delete-annotation-${annotation.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-foreground leading-relaxed">
                          {annotation.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {annotations.length > 0 && (
        <div className="text-center text-xs text-muted-foreground pt-2">
          Showing {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} for "{entryTitle}"
        </div>
      )}
    </div>
  );
}