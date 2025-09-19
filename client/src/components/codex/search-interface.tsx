import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface SearchInterfaceProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
}

export default function SearchInterface({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFiltersChange,
}: SearchInterfaceProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const clearSearch = () => {
    onSearchChange("");
  };

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      onFiltersChange(selectedFilters.filter(f => f !== filter));
    } else {
      onFiltersChange([...selectedFilters, filter]);
    }
  };

  const availableFilters = [
    { id: "axis-mundi", label: "Axis Mundi" },
    { id: "luminous-halls", label: "Luminous Halls" },
    { id: "bookmarked", label: "Bookmarked" },
    { id: "has-notes", label: "Has Notes" },
  ];

  return (
    <div className="mystical-border rounded-lg p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-input border-border pl-10 pr-20 focus:border-ring focus:ring-2 focus:ring-ring/20"
          placeholder="Search across all entries..."
          data-testid="input-advanced-search"
        />
        <div className="absolute right-2 top-2 flex items-center space-x-1">
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              data-testid="button-clear-advanced-search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                data-testid="button-filters"
              >
                <Filter className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Filters</h4>
                {availableFilters.map((filter) => (
                  <div key={filter.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={filter.id}
                      checked={selectedFilters.includes(filter.id)}
                      onCheckedChange={() => toggleFilter(filter.id)}
                      data-testid={`checkbox-filter-${filter.id}`}
                    />
                    <label
                      htmlFor={filter.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {filter.label}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {selectedFilters.map((filter) => {
            const filterData = availableFilters.find(f => f.id === filter);
            return (
              <Badge
                key={filter}
                variant="default"
                className="category-badge cursor-pointer text-xs"
                onClick={() => toggleFilter(filter)}
                data-testid={`active-filter-${filter}`}
              >
                {filterData?.label || filter}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
