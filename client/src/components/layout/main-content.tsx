import { Grid, List, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EntryCard from "@/components/codex/entry-card";
import { type CodexEntryWithBookmark } from "@shared/schema";

interface MainContentProps {
  entries: CodexEntryWithBookmark[];
  isLoading: boolean;
  selectedCategory: string | null;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: "title" | "category" | "size" | "date";
  onSortChange: (sort: "title" | "category" | "size" | "date") => void;
  onEntryClick: (entry: CodexEntryWithBookmark) => void;
}

export default function MainContent({
  entries,
  isLoading,
  selectedCategory,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onEntryClick,
}: MainContentProps) {
  const getCategoryDisplayName = (category: string | null) => {
    if (!category) return "All Entries";
    
    const categoryMap: Record<string, string> = {
      "cosmogenesis": "Cosmogenesis",
      "psychogenesis": "Psychogenesis", 
      "mystagogy": "Mystagogy",
      "climbing-systems": "Inner Climbing Systems",
      "initiation-rites": "Initiation Rites",
      "archetypal-structures": "Archetypal Structures",
      "psychic-technologies": "Psychic Technologies",
    };
    
    return categoryMap[category] || category;
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="loading-spinner"></div>
            <span className="text-muted-foreground italic">Loading the sacred texts...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Header Bar */}
      <header className="mystical-border border-l-0 border-t-0 border-r-0 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="font-cinzel text-xl font-semibold text-primary" data-testid="text-current-category">
            {getCategoryDisplayName(selectedCategory)}
          </h2>
          <span className="text-muted-foreground" data-testid="text-entry-count">
            ({entries.length} entries)
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="p-2"
              data-testid="button-grid-view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="p-2"
              data-testid="button-list-view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40 bg-input border-border" data-testid="select-sort">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Sort by Title</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
              <SelectItem value="size">Sort by Size</SelectItem>
              <SelectItem value="date">Sort by Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Content Browser */}
      <div className="flex-1 overflow-y-auto p-6">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mystical-border rounded-lg p-8 max-w-md">
              <h3 className="font-cinzel text-lg font-semibold text-primary mb-2">
                No Entries Found
              </h3>
              <p className="text-muted-foreground">
                The search through the sacred texts yielded no results. Try adjusting your search terms or filters.
              </p>
            </div>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                viewMode={viewMode}
                onClick={() => onEntryClick(entry)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
