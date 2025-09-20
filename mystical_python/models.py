"""
Mystical Codex Python Models
============================

Python data models that mirror the TypeScript schema for seamless integration
between the React frontend and Python scripts. These models use Pydantic for
validation and serialization, maintaining compatibility with our API endpoints.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Union, Literal
from pydantic import BaseModel, Field
from enum import Enum


class CodexEntry(BaseModel):
    """Mystical codex entry containing esoteric knowledge and wisdom."""
    id: str
    filename: str
    type: str
    size: int
    originalSize: Optional[int] = Field(alias="original_size", default=None)
    processedDate: Optional[datetime] = Field(alias="processed_date", default=None)
    summary: str
    keyChunks: Optional[List[str]] = Field(alias="key_chunks", default=None)
    fullText: Optional[str] = Field(alias="full_text", default=None)
    category: str
    subcategory: Optional[str] = None
    keyTerms: Optional[List[str]] = Field(alias="key_terms", default=None)

    class Config:
        populate_by_name = True


class Bookmark(BaseModel):
    """Sacred bookmarks and personal annotations for codex entries."""
    id: str
    entryId: str = Field(alias="entry_id")
    isBookmarked: bool = Field(alias="is_bookmarked", default=False)
    personalNotes: Optional[str] = Field(alias="personal_notes", default=None)
    createdAt: datetime = Field(alias="created_at")
    updatedAt: datetime = Field(alias="updated_at")

    class Config:
        populate_by_name = True


class CodexEntryWithBookmark(CodexEntry):
    """Codex entry enhanced with bookmark information."""
    bookmark: Optional[Bookmark] = None


class OracleConsultation(BaseModel):
    """Oracle consultation records for mystical guidance."""
    id: str
    query: str
    context: Optional[str] = None
    response: str
    createdAt: datetime = Field(alias="created_at")

    class Config:
        populate_by_name = True


class GrimoireEntry(BaseModel):
    """Personal grimoire entries - user-created mystical writings."""
    id: str
    title: str
    content: str
    category: str = "personal-writing"
    tags: List[str] = Field(default_factory=list)
    isPrivate: bool = Field(alias="is_private", default=True)
    createdAt: datetime = Field(alias="created_at")
    updatedAt: datetime = Field(alias="updated_at")

    class Config:
        populate_by_name = True


class SonicEcho(BaseModel):
    """AI-generated audio echoes from mystical texts."""
    id: str
    title: str
    sourceText: str = Field(alias="source_text")
    voice: str
    style: Optional[str] = None
    audioUrl: Optional[str] = Field(alias="audio_url", default=None)
    duration: Optional[int] = None  # Duration in seconds
    sourceType: str = Field(alias="source_type")  # 'codex_entry', 'grimoire_entry', 'custom_text'
    sourceId: Optional[str] = Field(alias="source_id", default=None)
    createdAt: datetime = Field(alias="created_at")

    class Config:
        populate_by_name = True


class Collection(BaseModel):
    """Collections for organizing mystical knowledge."""
    id: str
    title: str
    entryIds: List[str] = Field(alias="entry_ids", default_factory=list)
    notes: Optional[str] = None
    isPublic: bool = Field(alias="is_public", default=False)
    createdAt: datetime = Field(alias="created_at")
    updatedAt: datetime = Field(alias="updated_at")

    class Config:
        populate_by_name = True


class CollectionWithEntries(Collection):
    """Collection enhanced with full entry data."""
    entries: List[CodexEntry] = Field(default_factory=list)


class Annotation(BaseModel):
    """Collaborative annotations on codex entries."""
    id: str
    entryId: str = Field(alias="entry_id")
    content: str
    authorName: str = Field(alias="author_name")
    createdAt: datetime = Field(alias="created_at")

    class Config:
        populate_by_name = True


class AnnotationWithEntry(Annotation):
    """Annotation enhanced with entry information."""
    entry: Optional[CodexEntry] = None


class Share(BaseModel):
    """Sharing tokens for mystical knowledge distribution."""
    id: str
    targetType: str = Field(alias="target_type")  # 'entry' or 'collection'
    targetId: str = Field(alias="target_id")
    shareToken: str = Field(alias="share_token")
    createdAt: datetime = Field(alias="created_at")

    class Config:
        populate_by_name = True


class ToolRun(BaseModel):
    """Historical records of mystical tool usage."""
    id: str
    type: str  # 'scrying', 'praxis', 'chronicle', etc.
    input: str  # User input text
    output: str  # AI response text
    createdAt: datetime = Field(alias="created_at")

    class Config:
        populate_by_name = True


# Mystical Tool Types
MysticalToolType = Literal[
    'scrying', 'praxis', 'chronicle', 'glyph', 'tapestry',
    'synthesis', 'keys', 'imprint', 'tarot', 'stars',
    'architecture', 'aether', 'geometrics', 'harmonics', 'labyrinth',
    'exegesis', 'orrery', 'athanor', 'legend', 'noosphere', 'fusion', 'dialogue'
]


# Request/Response Models for API interactions
class OracleRequest(BaseModel):
    """Request for Oracle consultation."""
    query: str
    context: Optional[str] = None


class OracleResponse(BaseModel):
    """Response from Oracle consultation."""
    response: str
    consultationId: str


class SigilRequest(BaseModel):
    """Request for sigil generation."""
    intention: str
    style: Optional[str] = None
    symbolism: Optional[str] = None
    energyType: Optional[str] = None


class SigilResponse(BaseModel):
    """Response from sigil generation."""
    imageUrl: str
    description: str
    symbolicMeaning: str
    usageGuidance: List[str]


class SonicEchoRequest(BaseModel):
    """Request for sonic echo generation."""
    text: str
    voice: Optional[str] = None
    style: Optional[str] = None
    title: Optional[str] = None
    sourceType: Optional[str] = None
    sourceId: Optional[str] = None


class SonicEchoResponse(BaseModel):
    """Response from sonic echo generation."""
    id: str
    audioUrl: str
    title: str
    duration: Optional[int] = None
    voice: str
    style: Optional[str] = None


class MysticalToolRequest(BaseModel):
    """Request for mystical tool processing."""
    type: MysticalToolType
    input: str
    context: Optional[str] = None


class MysticalToolResponse(BaseModel):
    """Response from mystical tool processing."""
    output: str


class ShareRequest(BaseModel):
    """Request to create a sharing token."""
    targetType: Literal['entry', 'collection']
    targetId: str


class ShareResponse(BaseModel):
    """Response containing share information."""
    shareToken: str
    shareUrl: str


# Lunareth Synchronization Models
class SpiralPhase(BaseModel):
    """A phase in the Spiral Codex of thirteen sacred transformations."""
    id: int  # 0-12 (13 phases) or special 13th "beyond" phase
    name: str
    description: str
    keywords: List[str]
    animationParams: Dict[str, Any]
    energySignature: Optional[str] = None
    geometricPattern: Optional[str] = None
    color: Optional[str] = None
    frequency: Optional[float] = None


class LunarethSync(BaseModel):
    """Lunareth synchronization state and phase mapping."""
    currentPhase: int
    phases: List[SpiralPhase]
    syncTimestamp: datetime
    activeConstruct: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


# Sacred Geometry Models
class GeometricPattern(BaseModel):
    """Sacred geometric pattern definition."""
    name: str
    type: str  # 'fractal', 'l_system', 'mandala', 'fibonacci', etc.
    parameters: Dict[str, Any]
    rules: Optional[List[str]] = None  # For L-systems
    iterations: int = 1
    color_scheme: Optional[str] = None
    sacred_ratio: Optional[float] = None  # Golden ratio, etc.


class GeometryRenderRequest(BaseModel):
    """Request for geometric pattern rendering."""
    pattern: GeometricPattern
    width: int = 800
    height: int = 600
    format: str = "PNG"
    background_color: str = "#000000"
    line_color: str = "#FFD700"


# Search and Filter Models
class SearchResult(BaseModel):
    """Search result with relevance scoring."""
    entry: CodexEntryWithBookmark
    score: float
    matches: List[Dict[str, Any]]


class FilterOptions(BaseModel):
    """Filter options for codex browsing."""
    categories: Optional[List[str]] = None
    subcategories: Optional[List[str]] = None
    keyTerms: Optional[List[str]] = None
    dateRange: Optional[Dict[str, datetime]] = None
    hasBookmark: Optional[bool] = None
    hasNotes: Optional[bool] = None


# Export/Import Models
ExportFormat = Literal['json', 'yaml', 'markdown', 'csv']


class ExportRequest(BaseModel):
    """Request for data export."""
    format: ExportFormat
    includeBookmarks: bool = True
    includeAnnotations: bool = True
    entryIds: Optional[List[str]] = None  # If None, export all


class ImportRequest(BaseModel):
    """Request for data import."""
    format: ExportFormat
    data: str
    mergeStrategy: Literal['replace', 'merge', 'skip_existing'] = 'merge'


# Configuration Models
class PythonConfig(BaseModel):
    """Configuration for Python integration."""
    api_base_url: str = "http://localhost:5000/api"
    timeout: int = 30
    max_retries: int = 3
    cache_enabled: bool = True
    cache_duration: int = 300  # seconds
    debug_mode: bool = False
    mystical_theme: bool = True


class BridgeConfig(BaseModel):
    """Configuration for React-Python bridge."""
    sync_interval: int = 5  # seconds
    auto_sync: bool = True
    bidirectional: bool = True
    conflict_resolution: Literal['react_wins', 'python_wins', 'manual'] = 'manual'
    shared_state_file: str = "mystical_bridge_state.json"