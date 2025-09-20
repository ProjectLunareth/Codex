#!/usr/bin/env python3
"""
The Sacred Grimoire Viewer
=========================

An interactive terminal interface for exploring the Codex of Hidden Knowing.
This mystical viewer allows deep navigation through the 61 sacred entries,
providing search, filtering, annotation, and export capabilities.

🌙 Welcome to the Nested Domain of Memory 🌙
"""

import os
import sys
import json
import re
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path
import textwrap
from fuzzywuzzy import fuzz
import argparse

# Ensure mystical_python is in the path
sys.path.insert(0, str(Path(__file__).parent))

from models import CodexEntryWithBookmark, Bookmark, SearchResult, FilterOptions, ExportFormat
from api_client import MysticalAPIClient, create_client, load_local_codex_data, save_mystical_data, MysticalAPIError


class GrimoireViewer:
    """Sacred viewer for the mystical codex collection."""
    
    def __init__(self, use_api: bool = True, offline_mode: bool = False):
        """Initialize the mystical viewer."""
        self.use_api = use_api and not offline_mode
        self.offline_mode = offline_mode
        self.client = None
        self.entries: List[CodexEntryWithBookmark] = []
        self.current_index = 0
        self.current_entry: Optional[CodexEntryWithBookmark] = None
        self.search_results: List[CodexEntryWithBookmark] = []
        self.filter_active = False
        self.bookmarked_only = False
        self.category_filter = None
        self.notes_cache = {}
        
        # Mystical interface settings
        self.page_size = 20
        self.detail_width = 80
        self.mystical_theme = True
        
        if self.use_api:
            try:
                self.client = create_client()
                if self.client.check_connection():
                    print("🌟 Connection to the Mystical Codex established")
                else:
                    print("⚡ Connection to the Mystical Codex failed - entering offline mode")
                    self.offline_mode = True
                    self.use_api = False
            except Exception as e:
                print(f"🌙 Unable to connect to the Mystical Codex: {e}")
                print("📜 Entering offline mode...")
                self.offline_mode = True
                self.use_api = False
    
    def load_entries(self) -> bool:
        """Load the sacred entries from the codex."""
        try:
            if self.use_api and self.client:
                print("🔮 Communing with the living Codex...")
                self.entries = self.client.get_all_entries()
            else:
                print("📚 Reading from the sacred archives...")
                local_data = load_local_codex_data()
                self.entries = []
                
                for doc in local_data:
                    # Convert to our data model
                    entry_data = {
                        'id': doc['filename'].replace('.txt', ''),
                        'filename': doc['filename'],
                        'type': doc['type'],
                        'size': doc['size'],
                        'original_size': doc.get('original_size', doc['size']),
                        'processed_date': datetime.fromisoformat(doc['processed_date'].replace('Z', '+00:00')),
                        'summary': doc['summary'],
                        'key_chunks': doc['key_chunks'],
                        'full_text': doc['full_text'],
                        'category': self._extract_category(doc['summary'], doc['full_text']),
                        'subcategory': self._extract_subcategory(doc['summary']),
                        'key_terms': self._extract_key_terms(doc['summary'])
                    }
                    
                    self.entries.append(CodexEntryWithBookmark(**entry_data))
            
            if self.entries:
                self.current_entry = self.entries[0]
                print(f"✨ {len(self.entries)} sacred entries loaded into memory")
                return True
            else:
                print("🌑 No entries found in the sacred archives")
                return False
                
        except Exception as e:
            print(f"⚡ Error loading entries: {e}")
            return False
    
    def _extract_category(self, summary: str, full_text: str) -> str:
        """Extract category from entry content."""
        text = (summary + " " + full_text).lower()
        
        if "axis mundi: cosmogenesis" in text or "cosmogenesis" in text:
            return "cosmogenesis"
        elif "axis mundi: psychogenesis" in text or "psychogenesis" in text:
            return "psychogenesis"
        elif "axis mundi: mystagogy" in text or "mystagogy" in text:
            return "mystagogy"
        elif "luminous chapter halls" in text or "inner climbing" in text:
            return "climbing-systems"
        elif "initiation" in text and "rites" in text:
            return "initiation-rites"
        elif "archetypal" in text and "structures" in text:
            return "archetypal-structures"
        elif "psychic" in text and "technologies" in text:
            return "psychic-technologies"
        else:
            return "general"
    
    def _extract_subcategory(self, summary: str) -> Optional[str]:
        """Extract subcategory from summary."""
        text = summary.lower()
        if "emanation" in text:
            return "emanation"
        elif "evolution" in text:
            return "evolution"
        elif "return" in text:
            return "return"
        elif "climbing" in text:
            return "climbing"
        elif "initiation" in text:
            return "initiation"
        return None
    
    def _extract_key_terms(self, summary: str) -> List[str]:
        """Extract key terms from summary."""
        # Look for "Key terms:" section
        match = re.search(r'Key terms:\s*([^.]+)', summary, re.IGNORECASE)
        if match:
            terms = [term.strip() for term in match.group(1).split(',')]
            return [term for term in terms if term]
        return []
    
    def display_header(self):
        """Display the mystical header."""
        if self.mystical_theme:
            print("\n" + "="*80)
            print("🌙 THE SACRED GRIMOIRE VIEWER 🌙".center(80))
            print("═" * 80)
            print(f"📚 Archive Status: {'🔮 Live Connection' if self.use_api else '📜 Offline Mode'}")
            print(f"📖 Entries Loaded: {len(self.entries)}")
            if self.filter_active:
                print(f"🔍 Filtered View: {len(self.search_results)} entries")
            print("="*80 + "\n")
        else:
            print("\n" + "="*60)
            print("GRIMOIRE VIEWER".center(60))
            print("="*60)
            print(f"Entries: {len(self.entries)}")
            print("="*60 + "\n")
    
    def display_entry_list(self, entries: List[CodexEntryWithBookmark], start_index: int = 0):
        """Display a list of entries with mystical formatting."""
        end_index = min(start_index + self.page_size, len(entries))
        
        print(f"📜 Showing entries {start_index + 1}-{end_index} of {len(entries)}")
        print("-" * 80)
        
        for i, entry in enumerate(entries[start_index:end_index], start_index):
            status_icons = ""
            if entry.bookmark and entry.bookmark.isBookmarked:
                status_icons += "⭐"
            if entry.bookmark and entry.bookmark.personalNotes:
                status_icons += "📝"
            
            category_icon = self._get_category_icon(entry.category)
            
            print(f"{i + 1:2d}. {category_icon} {entry.filename:<20} | {entry.category:<15} | {status_icons}")
            
            # Show brief summary (first line)
            summary_line = entry.summary.split('\n')[0][:60]
            print(f"    {summary_line}...")
            print()
    
    def _get_category_icon(self, category: str) -> str:
        """Get mystical icon for category."""
        icons = {
            'cosmogenesis': '🌟',
            'psychogenesis': '🧠',
            'mystagogy': '🔮',
            'climbing-systems': '🔥',
            'initiation-rites': '⚡',
            'archetypal-structures': '🗿',
            'psychic-technologies': '👁️',
            'general': '📖'
        }
        return icons.get(category, '📖')
    
    def display_entry_detail(self, entry: CodexEntryWithBookmark):
        """Display detailed view of a single entry."""
        self.clear_screen()
        
        # Header with mystical formatting
        print("🌙" + "="*78 + "🌙")
        print(f"📜 {entry.filename}")
        print(f"🏷️  Category: {entry.category.upper()}")
        if entry.subcategory:
            print(f"📂 Subcategory: {entry.subcategory}")
        
        print(f"📊 Size: {entry.size:,} characters | Original: {entry.originalSize:,}")
        print(f"🕒 Processed: {entry.processedDate.strftime('%Y-%m-%d %H:%M')}")
        
        # Bookmark status
        if entry.bookmark and entry.bookmark.isBookmarked:
            print("⭐ BOOKMARKED")
            if entry.bookmark.personalNotes:
                print(f"📝 Notes: {entry.bookmark.personalNotes[:100]}...")
        
        print("="*80)
        
        # Key terms
        if entry.keyTerms:
            print("🔑 Key Terms:")
            term_str = ", ".join(entry.keyTerms[:10])  # Limit display
            wrapped_terms = textwrap.fill(term_str, width=self.detail_width-4)
            print(f"   {wrapped_terms}")
            print()
        
        # Summary
        print("📋 Summary:")
        wrapped_summary = textwrap.fill(entry.summary, width=self.detail_width)
        for line in wrapped_summary.split('\n'):
            print(f"   {line}")
        print()
        
        # Key chunks preview
        if entry.keyChunks:
            print("🔍 Key Content Chunks:")
            for i, chunk in enumerate(entry.keyChunks[:3], 1):
                preview = chunk[:200] + "..." if len(chunk) > 200 else chunk
                wrapped_chunk = textwrap.fill(preview, width=self.detail_width-6)
                print(f"   {i}. {wrapped_chunk}")
                print()
        
        print("="*80)
    
    def search_entries(self, query: str) -> List[CodexEntryWithBookmark]:
        """Search entries using fuzzy matching."""
        if not query.strip():
            return self.entries
        
        results = []
        query_lower = query.lower()
        
        for entry in self.entries:
            score = 0
            
            # Check filename
            if fuzz.partial_ratio(query_lower, entry.filename.lower()) > 70:
                score += 30
            
            # Check summary
            if fuzz.partial_ratio(query_lower, entry.summary.lower()) > 60:
                score += 40
            
            # Check key terms
            if entry.keyTerms:
                for term in entry.keyTerms:
                    if fuzz.partial_ratio(query_lower, term.lower()) > 80:
                        score += 50
            
            # Check full text (sample)
            full_text_sample = entry.fullText[:1000].lower()
            if fuzz.partial_ratio(query_lower, full_text_sample) > 60:
                score += 20
            
            # Check category
            if fuzz.ratio(query_lower, entry.category.lower()) > 80:
                score += 25
            
            if score > 30:  # Threshold for inclusion
                results.append(entry)
        
        # Sort by relevance (heuristic)
        results.sort(key=lambda e: (
            fuzz.partial_ratio(query_lower, e.summary.lower()) +
            fuzz.partial_ratio(query_lower, e.filename.lower())
        ), reverse=True)
        
        return results
    
    def filter_entries(self) -> List[CodexEntryWithBookmark]:
        """Apply active filters to entries."""
        filtered = self.entries
        
        if self.bookmarked_only:
            filtered = [e for e in filtered if e.bookmark and e.bookmark.isBookmarked]
        
        if self.category_filter:
            filtered = [e for e in filtered if e.category == self.category_filter]
        
        return filtered
    
    def add_note(self, entry: CodexEntryWithBookmark, note: str):
        """Add a personal note to an entry."""
        if self.use_api and self.client:
            try:
                bookmark = self.client.create_bookmark(
                    entry_id=entry.id,
                    is_bookmarked=True,
                    personal_notes=note
                )
                entry.bookmark = bookmark
                print("✨ Note added to the living Codex")
            except MysticalAPIError as e:
                print(f"⚡ Failed to add note to Codex: {e}")
                # Fallback to local storage
                self.notes_cache[entry.id] = note
                print("📝 Note saved locally")
        else:
            self.notes_cache[entry.id] = note
            print("📝 Note saved locally")
    
    def export_data(self, format: ExportFormat = 'json', entries: List[CodexEntryWithBookmark] = None):
        """Export mystical data."""
        entries_to_export = entries or self.entries
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"grimoire_export_{timestamp}.{format}"
        
        if format == 'json':
            export_data = {
                'metadata': {
                    'exported_at': datetime.now().isoformat(),
                    'entry_count': len(entries_to_export),
                    'source': 'Grimoire Viewer',
                    'version': '1.0'
                },
                'entries': [entry.dict() for entry in entries_to_export],
                'notes': self.notes_cache
            }
        else:
            # Simple text format
            export_data = f"Grimoire Export - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            export_data += "="*60 + "\n\n"
            
            for entry in entries_to_export:
                export_data += f"Entry: {entry.filename}\n"
                export_data += f"Category: {entry.category}\n"
                export_data += f"Summary: {entry.summary}\n"
                if entry.id in self.notes_cache:
                    export_data += f"Personal Notes: {self.notes_cache[entry.id]}\n"
                export_data += "\n" + "-"*60 + "\n\n"
        
        save_mystical_data(export_data, filename, format)
        print(f"✨ {len(entries_to_export)} entries exported to {filename}")
    
    def clear_screen(self):
        """Clear the mystical viewing screen."""
        os.system('clear' if os.name == 'posix' else 'cls')
    
    def display_help(self):
        """Display mystical help information."""
        help_text = """
🌙 SACRED GRIMOIRE VIEWER COMMANDS 🌙

Navigation:
  l, list       📜 List all entries (paginated)
  d, detail     🔍 Show detailed view of current entry
  n, next       ➡️  Move to next entry
  p, prev       ⬅️  Move to previous entry
  g, goto       🎯 Go to specific entry number

Search & Filter:
  s, search     🔮 Search entries by text
  f, filter     🗂️  Filter by category
  b, bookmarks  ⭐ Show only bookmarked entries
  c, clear      🧹 Clear all filters

Actions:
  note          📝 Add personal note to current entry
  bookmark      ⭐ Toggle bookmark for current entry
  cross         🔗 Show cross-references for current entry
  
Export:
  export        💾 Export entries to file
  save          💾 Export current view/search results

System:
  info          ℹ️  Show system information
  stats         📊 Show collection statistics
  config        ⚙️  Show configuration
  h, help       ❓ Show this help
  q, quit       🚪 Exit the sacred viewer

Special:
  oracle        🔮 Consult the Oracle (if connected)
  mystical      ✨ Toggle mystical theme
"""
        print(help_text)
    
    def display_stats(self):
        """Display collection statistics."""
        categories = {}
        bookmarked = 0
        with_notes = 0
        
        for entry in self.entries:
            categories[entry.category] = categories.get(entry.category, 0) + 1
            if entry.bookmark:
                if entry.bookmark.isBookmarked:
                    bookmarked += 1
                if entry.bookmark.personalNotes:
                    with_notes += 1
        
        print("\n📊 COLLECTION STATISTICS")
        print("="*40)
        print(f"Total Entries: {len(self.entries)}")
        print(f"Bookmarked: {bookmarked}")
        print(f"With Notes: {with_notes}")
        print(f"Local Notes: {len(self.notes_cache)}")
        print("\nCategories:")
        for category, count in sorted(categories.items()):
            icon = self._get_category_icon(category)
            print(f"  {icon} {category}: {count}")
        print()
    
    def run_interactive(self):
        """Run the interactive mystical viewer."""
        if not self.load_entries():
            return
        
        current_list = self.entries
        list_start = 0
        
        self.display_header()
        print("🌟 Welcome to the Sacred Grimoire Viewer! Type 'help' for commands.")
        
        while True:
            try:
                if self.filter_active:
                    current_list = self.search_results
                else:
                    current_list = self.filter_entries()
                
                command = input("\n🔮 Enter command: ").strip().lower()
                
                if command in ['q', 'quit', 'exit']:
                    print("🌙 May the ancient wisdom guide your path. Farewell!")
                    break
                
                elif command in ['h', 'help']:
                    self.display_help()
                
                elif command in ['l', 'list']:
                    self.clear_screen()
                    self.display_header()
                    self.display_entry_list(current_list, list_start)
                
                elif command in ['n', 'next']:
                    if self.current_index < len(current_list) - 1:
                        self.current_index += 1
                        self.current_entry = current_list[self.current_index]
                        print(f"➡️  Moved to entry {self.current_index + 1}: {self.current_entry.filename}")
                    else:
                        print("🌑 You have reached the end of the sacred collection")
                
                elif command in ['p', 'prev']:
                    if self.current_index > 0:
                        self.current_index -= 1
                        self.current_entry = current_list[self.current_index]
                        print(f"⬅️  Moved to entry {self.current_index + 1}: {self.current_entry.filename}")
                    else:
                        print("🌑 You are at the beginning of the sacred collection")
                
                elif command in ['d', 'detail']:
                    if self.current_entry:
                        self.display_entry_detail(self.current_entry)
                        input("\nPress Enter to continue...")
                    else:
                        print("🌑 No entry selected")
                
                elif command in ['s', 'search']:
                    query = input("🔍 Enter search query: ").strip()
                    if query:
                        self.search_results = self.search_entries(query)
                        self.filter_active = True
                        print(f"✨ Found {len(self.search_results)} entries matching '{query}'")
                        if self.search_results:
                            self.current_entry = self.search_results[0]
                            self.current_index = 0
                
                elif command in ['c', 'clear']:
                    self.filter_active = False
                    self.bookmarked_only = False
                    self.category_filter = None
                    self.current_index = 0
                    self.current_entry = self.entries[0] if self.entries else None
                    print("🧹 All filters cleared")
                
                elif command in ['b', 'bookmarks']:
                    self.bookmarked_only = not self.bookmarked_only
                    self.filter_active = False
                    print(f"⭐ Bookmark filter: {'ON' if self.bookmarked_only else 'OFF'}")
                
                elif command in ['f', 'filter']:
                    categories = list(set(e.category for e in self.entries))
                    print("Available categories:")
                    for i, cat in enumerate(categories, 1):
                        icon = self._get_category_icon(cat)
                        print(f"  {i}. {icon} {cat}")
                    
                    try:
                        choice = input("Select category number (or 'none' to clear): ").strip()
                        if choice.lower() == 'none':
                            self.category_filter = None
                            print("🧹 Category filter cleared")
                        else:
                            idx = int(choice) - 1
                            if 0 <= idx < len(categories):
                                self.category_filter = categories[idx]
                                self.filter_active = False
                                print(f"🗂️  Filtering by: {self.category_filter}")
                    except (ValueError, IndexError):
                        print("❌ Invalid selection")
                
                elif command == 'note':
                    if self.current_entry:
                        note = input("📝 Enter your note: ").strip()
                        if note:
                            self.add_note(self.current_entry, note)
                    else:
                        print("🌑 No entry selected")
                
                elif command == 'export':
                    format_choice = input("📁 Export format (json/txt): ").strip().lower()
                    if format_choice in ['json', 'txt']:
                        self.export_data(format_choice)
                    else:
                        print("❌ Invalid format. Use 'json' or 'txt'")
                
                elif command == 'stats':
                    self.display_stats()
                
                elif command == 'oracle':
                    if self.use_api and self.client:
                        query = input("🔮 Ask the Oracle: ").strip()
                        if query:
                            try:
                                response = self.client.consult_oracle(query)
                                print(f"\n🌟 The Oracle speaks:\n{response.response}\n")
                            except MysticalAPIError as e:
                                print(f"⚡ The Oracle is silent: {e}")
                    else:
                        print("🌑 Oracle connection not available in offline mode")
                
                elif command == 'mystical':
                    self.mystical_theme = not self.mystical_theme
                    print(f"✨ Mystical theme: {'ON' if self.mystical_theme else 'OFF'}")
                
                elif command == 'goto':
                    try:
                        entry_num = int(input("🎯 Enter entry number: ")) - 1
                        if 0 <= entry_num < len(current_list):
                            self.current_index = entry_num
                            self.current_entry = current_list[entry_num]
                            print(f"🎯 Moved to entry {entry_num + 1}: {self.current_entry.filename}")
                        else:
                            print(f"❌ Invalid entry number. Range: 1-{len(current_list)}")
                    except ValueError:
                        print("❌ Please enter a valid number")
                
                else:
                    print("❓ Unknown command. Type 'help' for available commands.")
            
            except KeyboardInterrupt:
                print("\n🌙 Interrupted by cosmic forces. Farewell!")
                break
            except Exception as e:
                print(f"⚡ Mystical error: {e}")


def main():
    """Sacred entry point for the Grimoire Viewer."""
    parser = argparse.ArgumentParser(
        description="🌙 The Sacred Grimoire Viewer - Interactive terminal interface for the Codex of Hidden Knowing"
    )
    parser.add_argument('--offline', action='store_true', 
                       help='Run in offline mode using local data')
    parser.add_argument('--api-url', default='http://localhost:5000/api',
                       help='Base URL for the API (default: http://localhost:5000/api)')
    parser.add_argument('--no-mystical', action='store_true',
                       help='Disable mystical theming')
    
    args = parser.parse_args()
    
    print("🌟 Initializing the Sacred Grimoire Viewer...")
    
    viewer = GrimoireViewer(
        use_api=not args.offline,
        offline_mode=args.offline
    )
    
    if args.no_mystical:
        viewer.mystical_theme = False
    
    try:
        viewer.run_interactive()
    except Exception as e:
        print(f"💥 Fatal mystical error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()