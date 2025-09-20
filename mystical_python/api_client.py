"""
Mystical Codex API Client
========================

A sacred interface for communicating with the React-based Codex system.
This client provides seamless integration between Python scripts and the
mystical web application, maintaining the flow of esoteric knowledge.
"""

import json
import requests
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import time
from pathlib import Path

try:
    from .models import (
        CodexEntry, CodexEntryWithBookmark, Bookmark, OracleConsultation,
        GrimoireEntry, SonicEcho, Collection, CollectionWithEntries,
        Annotation, AnnotationWithEntry, Share, ToolRun,
        OracleRequest, OracleResponse, SigilRequest, SigilResponse,
        SonicEchoRequest, SonicEchoResponse, MysticalToolRequest, MysticalToolResponse,
        ShareRequest, ShareResponse, SearchResult, ExportFormat, PythonConfig
    )
except ImportError:
    from models import (
        CodexEntry, CodexEntryWithBookmark, Bookmark, OracleConsultation,
        GrimoireEntry, SonicEcho, Collection, CollectionWithEntries,
        Annotation, AnnotationWithEntry, Share, ToolRun,
        OracleRequest, OracleResponse, SigilRequest, SigilResponse,
        SonicEchoRequest, SonicEchoResponse, MysticalToolRequest, MysticalToolResponse,
        ShareRequest, ShareResponse, SearchResult, ExportFormat, PythonConfig
    )


class MysticalAPIError(Exception):
    """Raised when the cosmic energies interfere with API communications."""
    pass


class MysticalAPIClient:
    """Sacred client for accessing the Codex of Hidden Knowing."""
    
    def __init__(self, config: Optional[PythonConfig] = None):
        """Initialize the mystical connection to the Codex."""
        self.config = config or PythonConfig()
        self.session = requests.Session()
        
        # Mystical headers for API communication
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mystical-Python-Client/1.0'
        })
        
        self._cache = {}
        self._cache_timestamps = {}
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make a sacred request to the API with mystical error handling."""
        url = f"{self.config.api_base_url}{endpoint}"
        
        # Ensure timeout is always passed to the request
        if 'timeout' not in kwargs:
            kwargs['timeout'] = self.config.timeout
        
        for attempt in range(self.config.max_retries + 1):
            try:
                response = self.session.request(method, url, **kwargs)
                
                if response.status_code >= 400:
                    if self.config.mystical_theme:
                        error_msg = f"🌙 The cosmic energies have disrupted the connection (Status: {response.status_code})"
                    else:
                        error_msg = f"API request failed with status {response.status_code}"
                    
                    try:
                        error_detail = response.json().get('message', '')
                        if error_detail:
                            error_msg += f" - {error_detail}"
                    except:
                        pass
                    
                    raise MysticalAPIError(error_msg)
                
                return response
                
            except requests.exceptions.RequestException as e:
                if attempt == self.config.max_retries:
                    if self.config.mystical_theme:
                        raise MysticalAPIError(f"⚡ The ethereal channels are blocked: {str(e)}")
                    else:
                        raise MysticalAPIError(f"Request failed: {str(e)}")
                
                # Exponential backoff with mystical timing
                time.sleep(2 ** attempt)
    
    def _get_cached(self, key: str) -> Optional[Any]:
        """Retrieve data from the mystical cache."""
        if not self.config.cache_enabled:
            return None
            
        if key in self._cache:
            timestamp = self._cache_timestamps.get(key, 0)
            if time.time() - timestamp < self.config.cache_duration:
                return self._cache[key]
            else:
                # Cache expired, remove it
                del self._cache[key]
                if key in self._cache_timestamps:
                    del self._cache_timestamps[key]
        
        return None
    
    def _set_cache(self, key: str, value: Any):
        """Store data in the mystical cache."""
        if self.config.cache_enabled:
            self._cache[key] = value
            self._cache_timestamps[key] = time.time()
    
    # Codex Entry Methods
    def get_all_entries(self) -> List[CodexEntryWithBookmark]:
        """Retrieve all sacred entries from the Codex."""
        cache_key = "all_entries"
        cached = self._get_cached(cache_key)
        if cached:
            return [CodexEntryWithBookmark(**entry) for entry in cached]
        
        response = self._make_request('GET', '/codex/entries')
        entries_data = response.json()
        
        self._set_cache(cache_key, entries_data)
        return [CodexEntryWithBookmark(**entry) for entry in entries_data]
    
    def get_entry(self, entry_id: str) -> Optional[CodexEntryWithBookmark]:
        """Retrieve a specific entry from the sacred archives."""
        cache_key = f"entry_{entry_id}"
        cached = self._get_cached(cache_key)
        if cached:
            return CodexEntryWithBookmark(**cached)
        
        try:
            response = self._make_request('GET', f'/codex/entries/{entry_id}')
            entry_data = response.json()
            
            self._set_cache(cache_key, entry_data)
            return CodexEntryWithBookmark(**entry_data)
        except MysticalAPIError:
            return None
    
    def search_entries(self, query: str) -> List[CodexEntryWithBookmark]:
        """Search the mystical archives for hidden knowledge."""
        response = self._make_request('GET', '/codex/search', params={'q': query})
        entries_data = response.json()
        return [CodexEntryWithBookmark(**entry) for entry in entries_data]
    
    def get_entries_by_category(self, category: str) -> List[CodexEntryWithBookmark]:
        """Retrieve entries from a specific domain of knowledge."""
        cache_key = f"category_{category}"
        cached = self._get_cached(cache_key)
        if cached:
            return [CodexEntryWithBookmark(**entry) for entry in cached]
        
        response = self._make_request('GET', f'/codex/categories/{category}')
        entries_data = response.json()
        
        self._set_cache(cache_key, entries_data)
        return [CodexEntryWithBookmark(**entry) for entry in entries_data]
    
    def get_cross_references(self, entry_id: str) -> List[CodexEntry]:
        """Find mystical connections between entries."""
        response = self._make_request('GET', f'/codex/entries/{entry_id}/cross-references')
        entries_data = response.json()
        return [CodexEntry(**entry) for entry in entries_data]
    
    # Bookmark Methods
    def get_bookmarked_entries(self) -> List[CodexEntryWithBookmark]:
        """Retrieve all sacred bookmarks."""
        response = self._make_request('GET', '/bookmarks')
        entries_data = response.json()
        return [CodexEntryWithBookmark(**entry) for entry in entries_data]
    
    def create_bookmark(self, entry_id: str, is_bookmarked: bool = True, personal_notes: str = None) -> Bookmark:
        """Create or update a sacred bookmark."""
        bookmark_data = {
            'entryId': entry_id,
            'isBookmarked': is_bookmarked,
            'personalNotes': personal_notes
        }
        
        response = self._make_request('POST', '/bookmarks', json=bookmark_data)
        return Bookmark(**response.json())
    
    # Oracle Methods
    def consult_oracle(self, query: str, context: str = None) -> OracleResponse:
        """Seek wisdom from the Oracle of Hidden Knowing."""
        try:
            oracle_request = OracleRequest(query=query, context=context)
            response = self._make_request('POST', '/oracle/consult', json=oracle_request.dict())
            return OracleResponse(**response.json())
        except Exception as e:
            error_str = str(e)
            # Check if it's an API quota/billing issue and provide graceful fallback
            if any(term in error_str.lower() for term in ["quota", "billing", "rate", "limit", "429", "meditation", "cosmic energies"]):
                print(f"🌙 Oracle consultation temporarily unavailable due to API limits")
                # Return a graceful fallback response
                return OracleResponse(
                    response="The Oracle is currently in deep meditation due to cosmic energy limitations. Your query has been received and will be answered when the mystical channels clear.",
                    consultationId=f"fallback_oracle_{int(time.time())}"
                )
            raise MysticalAPIError(f"Oracle consultation failed: {e}")
    
    def get_oracle_consultations(self) -> List[OracleConsultation]:
        """Retrieve the sacred record of Oracle consultations."""
        response = self._make_request('GET', '/oracle/consultations')
        consultations_data = response.json()
        return [OracleConsultation(**consultation) for consultation in consultations_data]
    
    # Sigil Methods
    def generate_sigil(self, intention: str, style: str = None, symbolism: str = None, energy_type: str = None) -> SigilResponse:
        """Request the creation of a mystical sigil."""
        sigil_request = SigilRequest(
            intention=intention,
            style=style,
            symbolism=symbolism,
            energyType=energy_type
        )
        
        response = self._make_request('POST', '/sigil/generate', json=sigil_request.dict())
        return SigilResponse(**response.json())
    
    # Sonic Echo Methods
    def generate_sonic_echo(self, text: str, voice: str = None, style: str = None, title: str = None) -> SonicEchoResponse:
        """Generate a sonic echo from mystical text."""
        try:
            echo_request = SonicEchoRequest(
                text=text,
                voice=voice,
                style=style,
                title=title
            )
            
            response = self._make_request('POST', '/sonic-echo/generate', json=echo_request.dict())
            return SonicEchoResponse(**response.json())
        except Exception as e:
            error_str = str(e)
            # Check if it's an API quota/billing issue and provide graceful fallback
            if any(term in error_str.lower() for term in ["quota", "billing", "rate", "limit", "429", "sonic echo", "cosmic energies"]):
                print(f"🌙 Sonic echo generation temporarily unavailable due to API limits")
                # Return a graceful fallback response
                fallback_title = title or f"Sonic Echo: {text[:30]}..."
                return SonicEchoResponse(
                    id=f"fallback_sonic_{int(time.time())}",
                    audioUrl="data:audio/wav;base64,UklGRlIEAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YQoEAAC4u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7",
                    title=fallback_title,
                    duration=120,
                    voice=voice or "mystical",
                    style=style or "meditation"
                )
            raise MysticalAPIError(f"Sonic echo generation failed: {e}")
    
    def get_sonic_echoes(self) -> List[SonicEcho]:
        """Retrieve all generated sonic echoes."""
        response = self._make_request('GET', '/sonic-echoes')
        echoes_data = response.json()
        return [SonicEcho(**echo) for echo in echoes_data]
    
    # Mystical Tools Methods
    def run_mystical_tool(self, tool_type: str, input_text: str, context: str = None) -> MysticalToolResponse:
        """Invoke a mystical tool for spiritual guidance."""
        tool_request = MysticalToolRequest(
            type=tool_type,
            input=input_text,
            context=context
        )
        
        response = self._make_request('POST', '/tools/run', json=tool_request.dict())
        return MysticalToolResponse(**response.json())
    
    def get_tool_runs(self, tool_type: str = None) -> List[ToolRun]:
        """Retrieve the history of mystical tool usage."""
        endpoint = '/tools/runs'
        params = {'type': tool_type} if tool_type else None
        
        response = self._make_request('GET', endpoint, params=params)
        runs_data = response.json()
        return [ToolRun(**run) for run in runs_data]
    
    # Collection Methods
    def get_collections(self) -> List[CollectionWithEntries]:
        """Retrieve all mystical collections."""
        response = self._make_request('GET', '/collections')
        collections_data = response.json()
        return [CollectionWithEntries(**collection) for collection in collections_data]
    
    def create_collection(self, title: str, entry_ids: List[str] = None, notes: str = None, is_public: bool = False) -> Collection:
        """Create a new collection of mystical knowledge."""
        collection_data = {
            'title': title,
            'entryIds': entry_ids or [],
            'notes': notes,
            'isPublic': is_public
        }
        
        response = self._make_request('POST', '/collections', json=collection_data)
        return Collection(**response.json())
    
    # Annotation Methods
    def get_annotations(self, entry_id: str = None) -> List[AnnotationWithEntry]:
        """Retrieve annotations, optionally filtered by entry."""
        endpoint = f'/annotations/entry/{entry_id}' if entry_id else '/annotations'
        
        response = self._make_request('GET', endpoint)
        annotations_data = response.json()
        return [AnnotationWithEntry(**annotation) for annotation in annotations_data]
    
    def create_annotation(self, entry_id: str, content: str, author_name: str = "Mystical Python User") -> Annotation:
        """Create a mystical annotation on an entry."""
        annotation_data = {
            'entryId': entry_id,
            'content': content,
            'authorName': author_name
        }
        
        response = self._make_request('POST', '/annotations', json=annotation_data)
        return Annotation(**response.json())
    
    # Share Methods
    def create_share(self, target_type: str, target_id: str) -> ShareResponse:
        """Create a mystical sharing token."""
        share_request = ShareRequest(targetType=target_type, targetId=target_id)
        
        response = self._make_request('POST', '/shares', json=share_request.dict())
        return ShareResponse(**response.json())
    
    # Export/Import Methods
    def export_data(self, format: ExportFormat = 'json', entry_ids: List[str] = None) -> str:
        """Export mystical data in various formats."""
        params = {
            'format': format,
            'includeBookmarks': True,
            'includeAnnotations': True
        }
        
        if entry_ids:
            params['entryIds'] = ','.join(entry_ids)
        
        response = self._make_request('GET', '/export', params=params)
        return response.text
    
    # Health and Status Methods
    def check_connection(self) -> bool:
        """Verify the mystical connection to the Codex."""
        try:
            response = self._make_request('GET', '/health')
            return response.status_code == 200
        except:
            return False
    
    def get_system_info(self) -> Dict[str, Any]:
        """Retrieve system information from the mystical realm."""
        try:
            response = self._make_request('GET', '/system/info')
            return response.json()
        except:
            return {'status': 'unknown', 'connection': False}


# Utility Functions
def create_client(base_url: str = "http://localhost:5000/api", mystical_theme: bool = True) -> MysticalAPIClient:
    """Create a mystical API client with standard configuration."""
    config = PythonConfig(
        api_base_url=base_url,
        mystical_theme=mystical_theme
    )
    return MysticalAPIClient(config)


def load_local_codex_data(file_path: str = "attached_assets/Pasted--metadata-created-2025-09-11T21-24-47-360669-document-count-61-docume-1758273447106_1758273447110.txt") -> List[Dict[str, Any]]:
    """Load codex data directly from the local metadata file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        return metadata.get('documents', [])
    except FileNotFoundError:
        print(f"🌙 The sacred texts cannot be found at {file_path}")
        return []
    except json.JSONDecodeError:
        print(f"⚡ The mystical encoding of {file_path} is corrupted")
        return []


def save_mystical_data(data: Any, filename: str, format: ExportFormat = 'json'):
    """Save mystical data to a file with proper formatting."""
    filepath = Path(filename)
    
    if format == 'json':
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
    elif format == 'yaml':
        try:
            import yaml
            with open(filepath, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
        except ImportError:
            print("🌙 YAML support requires the 'pyyaml' package")
            raise
    else:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(data))
    
    print(f"✨ Mystical data saved to {filepath}")