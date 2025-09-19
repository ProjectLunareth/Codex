import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { type CodexEntryWithBookmark } from "@shared/schema";

interface UseCodexOptions {
  searchQuery?: string;
  category?: string | null;
  filters?: string[];
  sortBy?: "title" | "category" | "size" | "date";
}

export function useCodex(options: UseCodexOptions = {}) {
  const { searchQuery = "", category = null, filters = [], sortBy = "title" } = options;

  // Fetch all entries
  const { data: allEntries = [], isLoading } = useQuery<CodexEntryWithBookmark[]>({
    queryKey: ["/api/codex/entries"],
  });

  // Fetch search results if there's a search query
  const { data: searchResults = [] } = useQuery<CodexEntryWithBookmark[]>({
    queryKey: ["/api/codex/search", { q: searchQuery }],
    enabled: searchQuery.trim().length > 0,
  });

  // Fetch category entries if category is selected
  const { data: categoryEntries = [] } = useQuery<CodexEntryWithBookmark[]>({
    queryKey: ["/api/codex/categories", category],
    enabled: !!category,
  });

  // Fetch bookmarked entries if bookmarked filter is active
  const { data: bookmarkedEntries = [] } = useQuery<CodexEntryWithBookmark[]>({
    queryKey: ["/api/bookmarks"],
    enabled: filters.includes("bookmarked"),
  });

  const filteredEntries = useMemo(() => {
    let entries = allEntries;

    // Apply search
    if (searchQuery.trim()) {
      entries = searchResults;
    }

    // Apply category filter
    if (category) {
      entries = categoryEntries;
    }

    // Apply additional filters
    if (filters.length > 0) {
      entries = entries.filter(entry => {
        // Bookmarked filter
        if (filters.includes("bookmarked")) {
          if (!entry.bookmark?.isBookmarked) return false;
        }

        // Axis Mundi filter
        if (filters.includes("axis-mundi")) {
          if (!["cosmogenesis", "psychogenesis", "mystagogy"].includes(entry.category)) {
            return false;
          }
        }

        // Luminous Halls filter
        if (filters.includes("luminous-halls")) {
          if (!["climbing-systems", "initiation-rites", "archetypal-structures", "psychic-technologies"].includes(entry.category)) {
            return false;
          }
        }

        // Has notes filter
        if (filters.includes("has-notes")) {
          if (!entry.bookmark?.personalNotes?.trim()) return false;
        }

        return true;
      });
    }

    // Apply sorting
    const sorted = [...entries].sort((a, b) => {
      switch (sortBy) {
        case "title":
          const titleA = a.summary.split('\n')[0].replace('Beginning: The Codex of Hidden Knowing', '').replace(/^[^:]*:\s*/, '').trim();
          const titleB = b.summary.split('\n')[0].replace('Beginning: The Codex of Hidden Knowing', '').replace(/^[^:]*:\s*/, '').trim();
          return titleA.localeCompare(titleB);
        case "category":
          return a.category.localeCompare(b.category);
        case "size":
          return b.size - a.size;
        case "date":
          return new Date(b.processedDate).getTime() - new Date(a.processedDate).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [allEntries, searchResults, categoryEntries, searchQuery, category, filters, sortBy]);

  return {
    allEntries,
    filteredEntries,
    isLoading,
  };
}
