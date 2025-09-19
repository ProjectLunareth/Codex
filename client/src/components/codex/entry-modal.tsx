import { useState, useEffect } from "react";
import { X, Star, FileText, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { type CodexEntryWithBookmark, type CodexEntry } from "@shared/schema";

interface EntryModalProps {
  entry: CodexEntryWithBookmark;
  isOpen: boolean;
  onClose: () => void;
}

export default function EntryModal({ entry, isOpen, onClose }: EntryModalProps) {
  const [personalNotes, setPersonalNotes] = useState("");
  const { toggleBookmark, updateNotes } = useBookmarks();

  // Fetch cross-references
  const { data: crossReferences = [] } = useQuery<CodexEntry[]>({
    queryKey: ["/api/codex/entries", entry.id, "cross-references"],
    enabled: isOpen,
  });

  useEffect(() => {
    if (entry.bookmark?.personalNotes) {
      setPersonalNotes(entry.bookmark.personalNotes);
    } else {
      setPersonalNotes("");
    }
  }, [entry.id, entry.bookmark?.personalNotes]);

  const handleBookmarkClick = () => {
    toggleBookmark(entry.id, !!entry.bookmark?.isBookmarked);
  };

  const handleSaveNotes = () => {
    updateNotes(entry.id, personalNotes);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      "cosmogenesis": "Cosmogenesis",
      "psychogenesis": "Psychogenesis",
      "mystagogy": "Mystagogy",
      "climbing-systems": "Inner Climbing Systems",
      "initiation-rites": "Initiation Rites",
      "archetypal-structures": "Archetypal Structures",
      "psychic-technologies": "Psychic Technologies",
      "general": "General"
    };
    return categoryMap[category] || category;
  };

  if (!isOpen) return null;

  const entryTitle = entry.summary.split('\n')[0]
    .replace('Beginning: The Codex of Hidden Knowing', '')
    .replace(/^[^:]*:\s*/, '')
    .trim();

  return (
    <div 
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      data-testid="modal-entry"
    >
      <div className="mystical-border mystical-glow rounded-lg max-w-4xl max-h-[90vh] w-full overflow-y-auto">
        <header className="sticky top-0 mystical-border border-l-0 border-r-0 border-t-0 p-6 flex items-center justify-between bg-card/95 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <Badge className="category-badge" data-testid="text-modal-category">
              {getCategoryDisplayName(entry.category)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkClick}
              className={`bookmark-star text-xl hover:scale-110 transform transition-transform ${
                entry.bookmark?.isBookmarked ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid="button-modal-bookmark"
            >
              <Star className={`h-5 w-5 ${entry.bookmark?.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl"
            data-testid="button-close-modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="p-6">
          <h1 className="font-cinzel text-2xl font-bold text-primary mb-4" data-testid="text-modal-title">
            {entryTitle}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-6">
            <span className="flex items-center" data-testid="text-modal-size">
              <FileText className="h-4 w-4 mr-1" />
              Size: {formatFileSize(entry.size)}
            </span>
            <span className="flex items-center" data-testid="text-modal-date">
              <Calendar className="h-4 w-4 mr-1" />
              Processed: {formatDate(entry.processedDate)}
            </span>
            <span data-testid="text-modal-filename">File: {entry.filename}</span>
          </div>

          <div className="divider mb-6"></div>

          {/* Summary Section */}
          <section className="mb-8">
            <h3 className="font-cinzel text-lg font-semibold text-primary mb-3">Summary</h3>
            <div className="prose prose-amber max-w-none text-foreground leading-relaxed" data-testid="text-modal-summary">
              {entry.summary.split('\n').slice(1).map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </section>

          {/* Key Chunks Section */}
          {entry.keyChunks && entry.keyChunks.length > 0 && (
            <section className="mb-8">
              <h3 className="font-cinzel text-lg font-semibold text-primary mb-3">Key Passages</h3>
              <div className="space-y-4" data-testid="section-key-chunks">
                {entry.keyChunks.slice(0, 3).map((chunk, index) => (
                  <div key={index} className="mystical-border rounded-lg p-4">
                    <p className="text-foreground leading-relaxed italic text-sm">
                      "{chunk.substring(0, 500)}{chunk.length > 500 ? '...' : ''}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cross-References Section */}
          {crossReferences.length > 0 && (
            <section className="mb-8">
              <h3 className="font-cinzel text-lg font-semibold text-primary mb-3">Cross-References</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="section-cross-refs">
                {crossReferences.map((ref) => (
                  <div 
                    key={ref.id} 
                    className="mystical-border rounded-lg p-4 cursor-pointer hover:border-ring/50 transition-colors"
                    data-testid={`cross-ref-${ref.id}`}
                  >
                    <h4 className="font-cinzel font-semibold text-accent mb-2">
                      {ref.summary.split('\n')[0].replace('Beginning: The Codex of Hidden Knowing', '').replace(/^[^:]*:\s*/, '').trim()}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {getCategoryDisplayName(ref.category)} • {ref.filename}
                    </p>
                    <p className="text-sm">
                      {ref.summary.split('\n').slice(1, 2).join(' ').substring(0, 150)}...
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Personal Notes Section */}
          <section className="mb-8">
            <h3 className="font-cinzel text-lg font-semibold text-primary mb-3">Personal Notes</h3>
            <div className="mystical-border rounded-lg p-4">
              <Textarea
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                className="w-full bg-transparent border-0 resize-none text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-0"
                placeholder="Add your personal insights and notes..."
                rows={4}
                data-testid="textarea-notes"
              />
              <div className="flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveNotes}
                  className="text-xs text-accent hover:text-primary transition-colors"
                  data-testid="button-save-notes"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Save Notes
                </Button>
              </div>
            </div>
          </section>

          {/* Key Terms Section */}
          {entry.keyTerms && entry.keyTerms.length > 0 && (
            <section className="mb-8">
              <h3 className="font-cinzel text-lg font-semibold text-primary mb-3">Key Terms</h3>
              <div className="flex flex-wrap gap-2" data-testid="section-key-terms">
                {entry.keyTerms.map((term, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="category-badge cursor-pointer hover:bg-accent/20"
                    data-testid={`term-${index}`}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Full Text Section */}
          <section>
            <h3 className="font-cinzel text-lg font-semibold text-primary mb-3">Full Text</h3>
            <div className="mystical-border rounded-lg p-6 prose prose-amber max-w-none text-foreground leading-relaxed" data-testid="text-modal-full">
              <div className="whitespace-pre-wrap text-sm">
                {entry.fullText}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
