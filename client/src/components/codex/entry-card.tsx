import { Star, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { type CodexEntryWithBookmark } from "@shared/schema";

interface EntryCardProps {
  entry: CodexEntryWithBookmark;
  viewMode: "grid" | "list";
  onClick: () => void;
}

export default function EntryCard({ entry, viewMode, onClick }: EntryCardProps) {
  const { toggleBookmark } = useBookmarks();

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(entry.id, !!entry.bookmark?.isBookmarked);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      "cosmogenesis": "Cosmogenesis",
      "psychogenesis": "Psychogenesis",
      "mystagogy": "Mystagogy",
      "climbing-systems": "Luminous Halls",
      "initiation-rites": "Luminous Halls",
      "archetypal-structures": "Luminous Halls",
      "psychic-technologies": "Luminous Halls",
      "general": "General"
    };
    return categoryMap[category] || category;
  };

  if (viewMode === "list") {
    return (
      <article
        className="entry-card mystical-border rounded-lg p-4 cursor-pointer relative group flex items-center space-x-4 hover:border-ring/50"
        onClick={onClick}
        data-testid={`card-entry-${entry.id}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <Badge className="category-badge mb-2" data-testid={`badge-category-${entry.id}`}>
                {getCategoryDisplayName(entry.category)}
              </Badge>
              <h3 className="font-cinzel text-lg font-semibold text-primary mb-2 pr-8 truncate" data-testid={`text-title-${entry.id}`}>
                {entry.summary.split('\n')[0].replace('Beginning: The Codex of Hidden Knowing', '').replace(/^[^:]*:\s*/, '').trim()}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkClick}
              className={`bookmark-star opacity-0 group-hover:opacity-100 transition-opacity ${
                entry.bookmark?.isBookmarked ? 'opacity-100' : ''
              }`}
              data-testid={`button-bookmark-${entry.id}`}
            >
              <Star className={`h-4 w-4 ${entry.bookmark?.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3" data-testid={`text-summary-${entry.id}`}>
            {entry.summary.split('\n').slice(1, 3).join(' ').substring(0, 200)}...
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                {formatFileSize(entry.size)}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(entry.processedDate)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{entry.filename}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="entry-card mystical-border rounded-lg p-6 cursor-pointer relative group"
      onClick={onClick}
      data-testid={`card-entry-${entry.id}`}
    >
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmarkClick}
          className={`bookmark-star opacity-0 group-hover:opacity-100 transition-opacity text-lg ${
            entry.bookmark?.isBookmarked ? 'opacity-100' : ''
          }`}
          data-testid={`button-bookmark-${entry.id}`}
        >
          <Star className={`h-5 w-5 ${entry.bookmark?.isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <div className="mb-3">
        <Badge className="category-badge" data-testid={`badge-category-${entry.id}`}>
          {getCategoryDisplayName(entry.category)}
        </Badge>
      </div>

      <h3 className="font-cinzel text-lg font-semibold text-primary mb-3 pr-8" data-testid={`text-title-${entry.id}`}>
        {entry.summary.split('\n')[0].replace('Beginning: The Codex of Hidden Knowing', '').replace(/^[^:]*:\s*/, '').trim()}
      </h3>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid={`text-summary-${entry.id}`}>
        {entry.summary.split('\n').slice(1, 4).join(' ').substring(0, 300)}...
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span data-testid={`text-size-${entry.id}`}>{formatFileSize(entry.size)}</span>
        <span data-testid={`text-date-${entry.id}`}>{formatDate(entry.processedDate)}</span>
      </div>

      {/* Key terms preview */}
      {entry.keyTerms && entry.keyTerms.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Key Terms:</p>
          <div className="flex flex-wrap gap-1">
            {entry.keyTerms.slice(0, 3).map((term, index) => (
              <span 
                key={index} 
                className="cross-ref-link text-xs cursor-pointer hover:text-accent"
                data-testid={`text-term-${entry.id}-${index}`}
              >
                {term}
              </span>
            ))}
            {entry.keyTerms.length > 3 && (
              <span className="text-xs text-muted-foreground">+{entry.keyTerms.length - 3} more</span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
