import Fuse, { type IFuseOptions, type FuseResult, type FuseResultMatch } from "fuse.js";
import { type CodexEntryWithBookmark } from "@shared/schema";

export interface SearchOptions {
  query: string;
  threshold?: number;
  includeScore?: boolean;
}

export interface SearchResult {
  item: CodexEntryWithBookmark;
  score: number;
  matches?: readonly FuseResultMatch[];
}

export class CodexSearchEngine {
  private fuse: Fuse<CodexEntryWithBookmark>;

  constructor(entries: CodexEntryWithBookmark[]) {
    const options: IFuseOptions<CodexEntryWithBookmark> = {
      keys: [
        {
          name: "summary",
          weight: 0.4,
        },
        {
          name: "fullText",
          weight: 0.3,
        },
        {
          name: "keyChunks",
          weight: 0.2,
        },
        {
          name: "keyTerms",
          weight: 0.1,
        },
      ],
      threshold: 0.3,
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 3,
      ignoreLocation: true,
      useExtendedSearch: true,
    };

    this.fuse = new Fuse(entries, options);
  }

  search(options: SearchOptions): SearchResult[] {
    if (!options.query.trim()) {
      return [];
    }

    const results = this.fuse.search(options.query, {
      limit: 50,
    });

    return results.map((result: FuseResult<CodexEntryWithBookmark>) => ({
      item: result.item,
      score: result.score || 0,
      matches: result.matches,
    }));
  }

  updateCollection(entries: CodexEntryWithBookmark[]) {
    this.fuse.setCollection(entries);
  }
}

export function createSearchEngine(entries: CodexEntryWithBookmark[]): CodexSearchEngine {
  return new CodexSearchEngine(entries);
}
