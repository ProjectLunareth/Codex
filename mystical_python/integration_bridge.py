#!/usr/bin/env python3
"""
Mystical Integration Bridge
==========================

A sacred conduit between the React-based Codex system and Python mystical tools.
This bridge enables bidirectional data flow, real-time synchronization, and
seamless integration between the living web interface and the deep python analytics.

🌙 "The bridge spans realms, connecting mind to spirit" 🌙
"""

import json
import time
import asyncio
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Callable
from pathlib import Path
import requests
from queue import Queue
import logging
from dataclasses import dataclass, asdict

# WebSocket import with feature flag protection
try:
    try:
        from .shared_config import get_mystical_config
    except ImportError:
        from shared_config import get_mystical_config
    _config = get_mystical_config()
    if _config.websocket_bridge_enabled:
        import websocket
        WEBSOCKET_AVAILABLE = True
    else:
        WEBSOCKET_AVAILABLE = False
        websocket = None
except ImportError:
    WEBSOCKET_AVAILABLE = False
    websocket = None

try:
    from .models import (
        CodexEntryWithBookmark, Collection, Bookmark, Annotation,
        ExportFormat, PythonConfig, BridgeConfig
    )
    from .api_client import MysticalAPIClient, create_client, MysticalAPIError
except ImportError:
    from models import (
        CodexEntryWithBookmark, Collection, Bookmark, Annotation,
        ExportFormat, PythonConfig, BridgeConfig
    )
    from api_client import MysticalAPIClient, create_client, MysticalAPIError


@dataclass
class BridgeMessage:
    """Message format for bridge communication."""
    type: str
    timestamp: datetime
    source: str  # 'python' or 'react'
    payload: Dict[str, Any]
    message_id: str = None
    
    def __post_init__(self):
        if self.message_id is None:
            self.message_id = f"{self.source}_{int(time.time() * 1000)}"


@dataclass
class SyncState:
    """Synchronization state between systems."""
    last_sync: datetime
    react_version: int = 0
    python_version: int = 0
    pending_changes: List[str] = None
    conflict_resolution: str = 'manual'
    
    def __post_init__(self):
        if self.pending_changes is None:
            self.pending_changes = []


class MysticalBridge:
    """Sacred bridge connecting React and Python realms."""
    
    def __init__(self, config: Optional[BridgeConfig] = None, api_client: Optional[MysticalAPIClient] = None):
        """Initialize the mystical bridge."""
        self.config = config or BridgeConfig()
        self.client = api_client or create_client()
        
        # Bridge state
        self.sync_state = SyncState(last_sync=datetime.now())
        self.message_queue = Queue()
        self.event_handlers: Dict[str, List[Callable]] = {}
        self.is_running = False
        self.sync_thread = None
        
        # Shared state management
        self.shared_state_path = Path(self.config.shared_state_file)
        self.local_cache = {}
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("MysticalBridge")
        
        # Load existing state if available
        self._load_shared_state()
    
    def _load_shared_state(self):
        """Load shared state from file."""
        try:
            if self.shared_state_path.exists():
                with open(self.shared_state_path, 'r') as f:
                    state_data = json.load(f)
                
                # Update sync state
                if 'sync_state' in state_data:
                    sync_data = state_data['sync_state']
                    self.sync_state.last_sync = datetime.fromisoformat(sync_data['last_sync'])
                    self.sync_state.react_version = sync_data.get('react_version', 0)
                    self.sync_state.python_version = sync_data.get('python_version', 0)
                    self.sync_state.pending_changes = sync_data.get('pending_changes', [])
                
                # Load local cache
                self.local_cache = state_data.get('local_cache', {})
                
                self.logger.info("🌟 Shared state loaded from bridge file")
        
        except Exception as e:
            self.logger.warning(f"⚡ Could not load shared state: {e}")
    
    def _save_shared_state(self):
        """Save shared state to file."""
        try:
            state_data = {
                'sync_state': {
                    'last_sync': self.sync_state.last_sync.isoformat(),
                    'react_version': self.sync_state.react_version,
                    'python_version': self.sync_state.python_version,
                    'pending_changes': self.sync_state.pending_changes,
                    'conflict_resolution': self.sync_state.conflict_resolution
                },
                'local_cache': self.local_cache,
                'metadata': {
                    'bridge_version': '1.0',
                    'last_updated': datetime.now().isoformat(),
                    'auto_sync': self.config.auto_sync,
                    'bidirectional': self.config.bidirectional
                }
            }
            
            with open(self.shared_state_path, 'w') as f:
                json.dump(state_data, f, indent=2, default=str)
            
            self.logger.debug("💾 Shared state saved to bridge file")
        
        except Exception as e:
            self.logger.error(f"⚡ Could not save shared state: {e}")
    
    def register_event_handler(self, event_type: str, handler: Callable):
        """Register an event handler for bridge messages."""
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        self.event_handlers[event_type].append(handler)
    
    def emit_event(self, event_type: str, payload: Dict[str, Any]):
        """Emit an event to registered handlers."""
        message = BridgeMessage(
            type=event_type,
            timestamp=datetime.now(),
            source='python',
            payload=payload
        )
        
        # Add to message queue
        self.message_queue.put(message)
        
        # Call handlers
        if event_type in self.event_handlers:
            for handler in self.event_handlers[event_type]:
                try:
                    handler(message)
                except Exception as e:
                    self.logger.error(f"⚡ Event handler error: {e}")
    
    # Data Export/Import Methods
    def export_collection_for_python(self, collection_id: str) -> Dict[str, Any]:
        """Export a collection in Python-friendly format."""
        try:
            # Get collection with entries
            collections = self.client.get_collections()
            target_collection = None
            
            for collection in collections:
                if collection.id == collection_id:
                    target_collection = collection
                    break
            
            if not target_collection:
                raise ValueError(f"Collection {collection_id} not found")
            
            # Export format optimized for Python processing
            export_data = {
                'collection_info': {
                    'id': target_collection.id,
                    'title': target_collection.title,
                    'notes': target_collection.notes,
                    'entry_count': len(target_collection.entries),
                    'exported_at': datetime.now().isoformat(),
                    'export_source': 'mystical_bridge'
                },
                'entries': [],
                'metadata': {
                    'total_size': 0,
                    'categories': {},
                    'key_terms': set(),
                    'date_range': {'earliest': None, 'latest': None}
                }
            }
            
            total_size = 0
            categories = {}
            all_key_terms = set()
            dates = []
            
            for entry in target_collection.entries:
                # Convert entry to dict
                entry_dict = entry.dict()
                
                # Add processing metadata
                entry_dict['python_metadata'] = {
                    'word_count': len(entry.fullText.split()),
                    'char_count': len(entry.fullText),
                    'summary_length': len(entry.summary),
                    'has_bookmark': entry.bookmark is not None,
                    'bookmark_notes': entry.bookmark.personalNotes if entry.bookmark else None
                }
                
                export_data['entries'].append(entry_dict)
                
                # Update metadata
                total_size += entry.size
                categories[entry.category] = categories.get(entry.category, 0) + 1
                
                if entry.keyTerms:
                    all_key_terms.update(entry.keyTerms)
                
                dates.append(entry.processedDate)
            
            # Finalize metadata
            export_data['metadata']['total_size'] = total_size
            export_data['metadata']['categories'] = categories
            export_data['metadata']['key_terms'] = list(all_key_terms)
            
            if dates:
                export_data['metadata']['date_range'] = {
                    'earliest': min(dates).isoformat(),
                    'latest': max(dates).isoformat()
                }
            
            # Cache the export
            cache_key = f"collection_export_{collection_id}"
            self.local_cache[cache_key] = {
                'data': export_data,
                'exported_at': datetime.now().isoformat(),
                'expires_at': (datetime.now() + timedelta(hours=1)).isoformat()
            }
            
            self.emit_event('collection_exported', {
                'collection_id': collection_id,
                'entry_count': len(export_data['entries']),
                'total_size': total_size
            })
            
            return export_data
        
        except Exception as e:
            self.logger.error(f"⚡ Collection export failed: {e}")
            raise
    
    def import_python_annotations(self, annotations_data: List[Dict[str, Any]]) -> List[str]:
        """Import annotations created in Python back to React system."""
        imported_ids = []
        
        try:
            for annotation_data in annotations_data:
                # Validate required fields
                if not all(key in annotation_data for key in ['entryId', 'content', 'authorName']):
                    self.logger.warning(f"⚡ Skipping invalid annotation: {annotation_data}")
                    continue
                
                # Create annotation via API
                annotation = self.client.create_annotation(
                    entry_id=annotation_data['entryId'],
                    content=annotation_data['content'],
                    author_name=annotation_data.get('authorName', 'Python Bridge')
                )
                
                imported_ids.append(annotation.id)
            
            self.emit_event('annotations_imported', {
                'count': len(imported_ids),
                'annotation_ids': imported_ids
            })
            
            self.logger.info(f"✨ Imported {len(imported_ids)} annotations from Python")
            return imported_ids
        
        except Exception as e:
            self.logger.error(f"⚡ Annotation import failed: {e}")
            return imported_ids
    
    def export_entries_for_analysis(self, 
                                   entry_ids: Optional[List[str]] = None,
                                   include_full_text: bool = True,
                                   include_bookmarks: bool = True) -> Dict[str, Any]:
        """Export entries optimized for Python analysis."""
        try:
            if entry_ids:
                entries = []
                for entry_id in entry_ids:
                    entry = self.client.get_entry(entry_id)
                    if entry:
                        entries.append(entry)
            else:
                entries = self.client.get_all_entries()
            
            # Analysis-optimized export
            export_data = {
                'analysis_metadata': {
                    'total_entries': len(entries),
                    'exported_at': datetime.now().isoformat(),
                    'include_full_text': include_full_text,
                    'include_bookmarks': include_bookmarks,
                    'export_purpose': 'python_analysis'
                },
                'entries': [],
                'text_corpus': [],
                'category_distribution': {},
                'key_term_frequency': {},
                'processing_hints': {
                    'recommended_tools': ['nltk', 'spacy', 'sklearn', 'gensim'],
                    'text_encoding': 'utf-8',
                    'language': 'english',
                    'domain': 'mystical_esoteric'
                }
            }
            
            category_counts = {}
            term_frequency = {}
            
            for entry in entries:
                entry_data = {
                    'id': entry.id,
                    'filename': entry.filename,
                    'category': entry.category,
                    'subcategory': entry.subcategory,
                    'size': entry.size,
                    'processed_date': entry.processedDate.isoformat(),
                    'summary': entry.summary,
                    'key_chunks': entry.keyChunks[:5] if not include_full_text else entry.keyChunks,  # Limit if not full
                    'key_terms': entry.keyTerms
                }
                
                if include_full_text:
                    entry_data['full_text'] = entry.fullText
                    export_data['text_corpus'].append({
                        'id': entry.id,
                        'text': entry.fullText,
                        'metadata': {
                            'category': entry.category,
                            'size': entry.size
                        }
                    })
                
                if include_bookmarks and entry.bookmark:
                    entry_data['bookmark'] = {
                        'is_bookmarked': entry.bookmark.isBookmarked,
                        'personal_notes': entry.bookmark.personalNotes,
                        'created_at': entry.bookmark.createdAt.isoformat(),
                        'updated_at': entry.bookmark.updatedAt.isoformat()
                    }
                
                export_data['entries'].append(entry_data)
                
                # Update statistics
                category_counts[entry.category] = category_counts.get(entry.category, 0) + 1
                
                if entry.keyTerms:
                    for term in entry.keyTerms:
                        term_frequency[term] = term_frequency.get(term, 0) + 1
            
            export_data['category_distribution'] = category_counts
            export_data['key_term_frequency'] = dict(sorted(term_frequency.items(), key=lambda x: x[1], reverse=True)[:50])
            
            return export_data
        
        except Exception as e:
            self.logger.error(f"⚡ Analysis export failed: {e}")
            raise
    
    def sync_python_data_to_react(self, python_data: Dict[str, Any]) -> bool:
        """Synchronize Python-generated data back to React system."""
        try:
            # Handle different types of Python data
            if 'bookmarks' in python_data:
                for bookmark_data in python_data['bookmarks']:
                    self.client.create_bookmark(
                        entry_id=bookmark_data['entryId'],
                        is_bookmarked=bookmark_data.get('isBookmarked', True),
                        personal_notes=bookmark_data.get('personalNotes')
                    )
            
            if 'annotations' in python_data:
                self.import_python_annotations(python_data['annotations'])
            
            if 'collections' in python_data:
                for collection_data in python_data['collections']:
                    self.client.create_collection(
                        title=collection_data['title'],
                        entry_ids=collection_data.get('entryIds', []),
                        notes=collection_data.get('notes'),
                        is_public=collection_data.get('isPublic', False)
                    )
            
            # Update sync state
            self.sync_state.python_version += 1
            self.sync_state.last_sync = datetime.now()
            self._save_shared_state()
            
            self.emit_event('python_data_synced', {
                'data_types': list(python_data.keys()),
                'sync_version': self.sync_state.python_version
            })
            
            return True
        
        except Exception as e:
            self.logger.error(f"⚡ Python data sync failed: {e}")
            return False
    
    # Real-time Synchronization Methods
    def start_sync_daemon(self):
        """Start the background synchronization daemon."""
        if self.is_running:
            self.logger.warning("🌙 Sync daemon already running")
            return
        
        self.is_running = True
        self.sync_thread = threading.Thread(target=self._sync_loop, daemon=True)
        self.sync_thread.start()
        
        self.logger.info("🌟 Mystical Bridge sync daemon started")
    
    def stop_sync_daemon(self):
        """Stop the background synchronization daemon."""
        self.is_running = False
        if self.sync_thread:
            self.sync_thread.join(timeout=5.0)
        
        self._save_shared_state()
        self.logger.info("🌙 Mystical Bridge sync daemon stopped")
    
    def _sync_loop(self):
        """Main synchronization loop."""
        while self.is_running:
            try:
                if self.config.auto_sync:
                    self._check_for_changes()
                
                # Process message queue
                while not self.message_queue.empty():
                    message = self.message_queue.get()
                    self._process_bridge_message(message)
                
                time.sleep(self.config.sync_interval)
            
            except Exception as e:
                self.logger.error(f"⚡ Sync loop error: {e}")
                time.sleep(self.config.sync_interval)
    
    def _check_for_changes(self):
        """Check for changes in both React and Python systems."""
        try:
            # Check React system for changes (simplified - would need more sophisticated versioning)
            current_time = datetime.now()
            time_threshold = current_time - timedelta(seconds=self.config.sync_interval * 2)
            
            # In a real implementation, we'd check modification timestamps or version numbers
            # For now, we'll just update the last sync time
            if current_time - self.sync_state.last_sync > timedelta(seconds=self.config.sync_interval):
                self.sync_state.last_sync = current_time
                self._save_shared_state()
        
        except Exception as e:
            self.logger.error(f"⚡ Change detection failed: {e}")
    
    def _process_bridge_message(self, message: BridgeMessage):
        """Process a bridge message."""
        try:
            self.logger.debug(f"🔄 Processing message: {message.type} from {message.source}")
            
            # Handle different message types
            if message.type == 'data_request':
                self._handle_data_request(message)
            elif message.type == 'data_sync':
                self._handle_data_sync(message)
            elif message.type == 'status_update':
                self._handle_status_update(message)
            else:
                self.logger.warning(f"❓ Unknown message type: {message.type}")
        
        except Exception as e:
            self.logger.error(f"⚡ Message processing error: {e}")
    
    def _handle_data_request(self, message: BridgeMessage):
        """Handle data request from React system."""
        payload = message.payload
        request_type = payload.get('request_type')
        
        if request_type == 'export_collection':
            collection_id = payload.get('collection_id')
            if collection_id:
                exported_data = self.export_collection_for_python(collection_id)
                # In a real implementation, this would be sent back to React
                self.logger.info(f"✨ Collection {collection_id} exported for Python processing")
    
    def _handle_data_sync(self, message: BridgeMessage):
        """Handle data synchronization from Python system."""
        payload = message.payload
        
        if 'python_data' in payload:
            success = self.sync_python_data_to_react(payload['python_data'])
            if success:
                self.logger.info("✨ Python data successfully synced to React")
            else:
                self.logger.error("⚡ Python data sync failed")
    
    def _handle_status_update(self, message: BridgeMessage):
        """Handle status updates from either system."""
        payload = message.payload
        status = payload.get('status', 'unknown')
        
        self.logger.info(f"📊 Status update from {message.source}: {status}")
    
    # Utility Methods
    def get_bridge_status(self) -> Dict[str, Any]:
        """Get current bridge status and health information."""
        return {
            'bridge_health': {
                'is_running': self.is_running,
                'api_connection': self.client.check_connection() if self.client else False,
                'last_sync': self.sync_state.last_sync.isoformat(),
                'message_queue_size': self.message_queue.qsize(),
                'cache_size': len(self.local_cache)
            },
            'sync_state': {
                'react_version': self.sync_state.react_version,
                'python_version': self.sync_state.python_version,
                'pending_changes': len(self.sync_state.pending_changes),
                'conflict_resolution': self.sync_state.conflict_resolution
            },
            'configuration': {
                'auto_sync': self.config.auto_sync,
                'bidirectional': self.config.bidirectional,
                'sync_interval': self.config.sync_interval,
                'shared_state_file': str(self.shared_state_path)
            },
            'statistics': {
                'uptime': (datetime.now() - self.sync_state.last_sync).total_seconds(),
                'messages_processed': len(self.event_handlers),
                'last_activity': datetime.now().isoformat()
            }
        }
    
    def clear_cache(self):
        """Clear the local cache."""
        self.local_cache.clear()
        self._save_shared_state()
        self.logger.info("🧹 Bridge cache cleared")
    
    def force_sync(self):
        """Force an immediate synchronization."""
        try:
            self._check_for_changes()
            self.sync_state.last_sync = datetime.now()
            self._save_shared_state()
            
            self.emit_event('force_sync_completed', {
                'timestamp': datetime.now().isoformat(),
                'sync_version': self.sync_state.python_version
            })
            
            self.logger.info("🔄 Force sync completed")
        
        except Exception as e:
            self.logger.error(f"⚡ Force sync failed: {e}")


# Utility Functions for Easy Integration
def create_bridge(api_url: str = "http://localhost:5000/api", auto_start: bool = True) -> MysticalBridge:
    """Create and optionally start a mystical bridge."""
    client = create_client(api_url)
    bridge = MysticalBridge(api_client=client)
    
    if auto_start:
        bridge.start_sync_daemon()
    
    return bridge


def export_for_python_analysis(bridge: MysticalBridge, 
                              entry_ids: Optional[List[str]] = None,
                              output_file: str = None) -> str:
    """Quick export function for Python analysis."""
    data = bridge.export_entries_for_analysis(entry_ids)
    
    if output_file is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"mystical_analysis_export_{timestamp}.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, default=str)
    
    print(f"✨ Analysis data exported to {output_file}")
    return output_file


# Demo and Testing Functions
def demo_bridge_functionality():
    """Demonstrate bridge functionality."""
    print("🌙 Mystical Integration Bridge Demo")
    print("="*50)
    
    # Create bridge
    bridge = create_bridge(auto_start=False)
    
    # Test connection
    status = bridge.get_bridge_status()
    print(f"🔗 API Connection: {'✅' if status['bridge_health']['api_connection'] else '❌'}")
    
    # Test export functionality (would work with live API)
    try:
        if status['bridge_health']['api_connection']:
            # Demo export
            print("\n📤 Testing collection export...")
            # This would work with actual collections
            print("   (Would export collection data for Python processing)")
        else:
            print("\n📤 Collection export - requires live API connection")
    
    except Exception as e:
        print(f"⚡ Export test failed: {e}")
    
    # Show bridge status
    print(f"\n📊 Bridge Status:")
    print(f"   Running: {status['bridge_health']['is_running']}")
    print(f"   Auto Sync: {status['configuration']['auto_sync']}")
    print(f"   Cache Size: {status['bridge_health']['cache_size']}")
    
    print("\n🌙 Bridge demo complete")


if __name__ == "__main__":
    demo_bridge_functionality()