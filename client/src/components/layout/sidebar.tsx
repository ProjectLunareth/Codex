import { Search, X, Eye, CircleDot, Lightbulb, Bookmark, Menu, ChevronLeft, BookOpen, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface SidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
  onOracleClick: () => void;
  onSigilClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  entryCounts: Record<string, number>;
}

export default function Sidebar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedFilters,
  onFiltersChange,
  onOracleClick,
  onSigilClick,
  isCollapsed,
  onToggleCollapse,
  entryCounts,
}: SidebarProps) {
  const handleFilterToggle = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      onFiltersChange(selectedFilters.filter(f => f !== filter));
    } else {
      onFiltersChange([...selectedFilters, filter]);
    }
  };

  const clearSearch = () => {
    onSearchChange("");
  };

  const categories = [
    { id: "cosmogenesis", name: "Cosmogenesis", count: entryCounts.cosmogenesis },
    { id: "psychogenesis", name: "Psychogenesis", count: entryCounts.psychogenesis },
    { id: "mystagogy", name: "Mystagogy", count: entryCounts.mystagogy },
  ];

  const luminousHalls = [
    { id: "climbing-systems", name: "Inner Climbing Systems", count: entryCounts["climbing-systems"] },
    { id: "initiation-rites", name: "Initiation Rites", count: entryCounts["initiation-rites"] },
    { id: "archetypal-structures", name: "Archetypal Structures", count: entryCounts["archetypal-structures"] },
    { id: "psychic-technologies", name: "Psychic Technologies", count: entryCounts["psychic-technologies"] },
  ];

  return (
    <aside className={`sidebar-nav flex flex-col overflow-y-auto transition-all duration-300 ${
      isCollapsed ? 'w-16 p-2' : 'w-80 p-6'
    }`}>
      <header className={`mb-8 relative ${isCollapsed ? 'mb-4' : ''}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-0 z-10 mystical-border bg-card text-primary hover:bg-accent/10 p-2 rounded-full shadow-lg"
          data-testid="button-toggle-sidebar"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        {!isCollapsed && (
          <>
            <h1 className="font-cinzel text-2xl font-bold text-primary tracking-wider text-center">
              ✦ CODEX OF HIDDEN KNOWING ✦
            </h1>
            <p className="text-sm text-muted-foreground text-center mt-2 italic">
              Digital Archive of Sacred Wisdom
            </p>
          </>
        )}
      </header>

      {/* Search Interface */}
      {!isCollapsed && (
        <div className="mystical-border rounded-lg p-4 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-input border-border pl-10 pr-10 focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="Search across all entries..."
            data-testid="input-search"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Filters */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Filters:</span>
            <Badge
              variant={selectedFilters.includes("axis-mundi") ? "default" : "outline"}
              className="category-badge cursor-pointer text-xs"
              onClick={() => handleFilterToggle("axis-mundi")}
              data-testid="filter-axis-mundi"
            >
              Axis Mundi
            </Badge>
            <Badge
              variant={selectedFilters.includes("luminous-halls") ? "default" : "outline"}
              className="category-badge cursor-pointer text-xs"
              onClick={() => handleFilterToggle("luminous-halls")}
              data-testid="filter-luminous-halls"
            >
              Luminous Halls
            </Badge>
            <Badge
              variant={selectedFilters.includes("bookmarked") ? "default" : "outline"}
              className="category-badge cursor-pointer text-xs"
              onClick={() => handleFilterToggle("bookmarked")}
              data-testid="filter-bookmarked"
            >
              <Bookmark className="h-3 w-3 mr-1" />
              Bookmarked
            </Badge>
          </div>
        </div>
      </div>
      )}

      {/* Category Navigation */}
      {!isCollapsed && (
        <nav className="space-y-6 flex-1">
        <div>
          <h3 className="font-cinzel text-lg font-semibold text-primary mb-3 flex items-center">
            <CircleDot className="h-4 w-4 mr-2" />
            Axis Mundi
          </h3>
          <ul className="space-y-2 ml-4">
            {categories.map((category) => (
              <li key={category.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 ${
                    selectedCategory === category.id ? "bg-muted text-foreground" : ""
                  }`}
                  onClick={() => onCategoryChange(selectedCategory === category.id ? null : category.id)}
                  data-testid={`category-${category.id}`}
                >
                  {category.name} <span className="text-xs ml-auto">({category.count})</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-cinzel text-lg font-semibold text-primary mb-3 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Luminous Chapter Halls
          </h3>
          <ul className="space-y-2 ml-4">
            {luminousHalls.map((hall) => (
              <li key={hall.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 ${
                    selectedCategory === hall.id ? "bg-muted text-foreground" : ""
                  }`}
                  onClick={() => onCategoryChange(selectedCategory === hall.id ? null : hall.id)}
                  data-testid={`category-${hall.id}`}
                >
                  {hall.name} <span className="text-xs ml-auto">({hall.count})</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      )}

      {/* Action Buttons */}
      <div className="mt-auto pt-6 space-y-3">
        <Link href="/grimoire">
          <Button
            className={`mystical-border font-cinzel font-semibold text-primary hover:bg-accent/10 bg-transparent border-border ${
              isCollapsed ? 'w-12 h-12 p-0' : 'w-full'
            }`}
            data-testid="button-grimoire"
          >
            <BookOpen className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Personal Grimoire</span>}
          </Button>
        </Link>
        
        <Button
          onClick={onSigilClick}
          className={`mystical-border font-cinzel font-semibold text-primary hover:bg-accent/10 bg-transparent border-border ${
            isCollapsed ? 'w-12 h-12 p-0' : 'w-full'
          }`}
          data-testid="button-sigil-generator"
        >
          <Sparkles className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Generate Sigils</span>}
        </Button>
        
        <Button
          onClick={onOracleClick}
          className={`mystical-border oracle-glow font-cinzel font-semibold text-primary hover:bg-accent/10 bg-transparent border-border ${
            isCollapsed ? 'w-12 h-12 p-0' : 'w-full'
          }`}
          data-testid="button-oracle"
        >
          <Eye className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Consult the Oracle</span>}
        </Button>
      </div>
    </aside>
  );
}
