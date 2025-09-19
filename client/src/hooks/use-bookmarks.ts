import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type InsertBookmark } from "@shared/schema";

export function useBookmarks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleBookmarkMutation = useMutation({
    mutationFn: async ({ entryId, isCurrentlyBookmarked }: { entryId: string; isCurrentlyBookmarked: boolean }) => {
      const bookmarkData: InsertBookmark = {
        entryId,
        isBookmarked: !isCurrentlyBookmarked,
      };
      
      const res = await apiRequest("POST", "/api/bookmarks", bookmarkData);
      return res.json();
    },
    onSuccess: (_, { isCurrentlyBookmarked }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/codex/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      
      toast({
        title: isCurrentlyBookmarked ? "Bookmark Removed" : "Bookmark Added",
        description: isCurrentlyBookmarked 
          ? "Entry removed from your bookmarks" 
          : "Entry added to your bookmarks",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error("Failed to toggle bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ entryId, notes }: { entryId: string; notes: string }) => {
      const bookmarkData: InsertBookmark = {
        entryId,
        isBookmarked: true, // Ensure it's bookmarked when adding notes
        personalNotes: notes,
      };
      
      const res = await apiRequest("POST", "/api/bookmarks", bookmarkData);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/codex/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      
      toast({
        title: "Notes Saved",
        description: "Your personal notes have been saved",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error("Failed to save notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const toggleBookmark = (entryId: string, isCurrentlyBookmarked: boolean) => {
    toggleBookmarkMutation.mutate({ entryId, isCurrentlyBookmarked });
  };

  const updateNotes = (entryId: string, notes: string) => {
    updateNotesMutation.mutate({ entryId, notes });
  };

  return {
    toggleBookmark,
    updateNotes,
    isToggling: toggleBookmarkMutation.isPending,
    isSavingNotes: updateNotesMutation.isPending,
  };
}
