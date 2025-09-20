import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import MainContent from "@/components/layout/main-content";
import EntryModal from "@/components/codex/entry-modal";
import OracleModal from "@/components/codex/oracle-modal";
import SigilGenerator from "@/components/sigil/sigil-generator";
import SonicEchoGenerator from "@/components/sonic/sonic-echo-generator";
import CodexGraph from "@/components/codex/codex-graph";
import CollectionManager from "@/components/codex/collection-manager";
import ToolRunner from "@/components/tools/tool-runner";
import { useCodex } from "@/hooks/use-codex";
import { type CodexEntryWithBookmark } from "@shared/schema";

export default function Home() {
  const [selectedEntry, setSelectedEntry] = useState<CodexEntryWithBookmark | null>(null);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [isSigilGeneratorOpen, setIsSigilGeneratorOpen] = useState(false);
  const [isSonicEchoGeneratorOpen, setIsSonicEchoGeneratorOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"title" | "category" | "size" | "date">("title");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { filteredEntries, isLoading } = useCodex({
    searchQuery,
    category: selectedCategory,
    filters: selectedFilters,
    sortBy,
  });

  const handleEntryClick = (entry: CodexEntryWithBookmark) => {
    setSelectedEntry(entry);
  };

  const closeEntryModal = () => {
    setSelectedEntry(null);
  };

  const openOracle = () => {
    setIsOracleOpen(true);
  };

  const closeOracle = () => {
    setIsOracleOpen(false);
  };

  const openSigilGenerator = () => {
    setIsSigilGeneratorOpen(true);
  };

  const closeSigilGenerator = () => {
    setIsSigilGeneratorOpen(false);
  };

  const openSonicEchoGenerator = () => {
    setIsSonicEchoGeneratorOpen(true);
  };

  const closeSonicEchoGenerator = () => {
    setIsSonicEchoGeneratorOpen(false);
  };

  const openGraph = () => {
    setIsGraphOpen(true);
  };

  const closeGraph = () => {
    setIsGraphOpen(false);
  };

  const openCollections = () => {
    setIsCollectionsOpen(true);
  };

  const closeCollections = () => {
    setIsCollectionsOpen(false);
  };

  const openTools = () => {
    setIsToolsOpen(true);
  };

  const closeTools = () => {
    setIsToolsOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Python Tools handlers
  const handleGrimoireViewer = () => {
    console.log("Opening Grimoire Viewer...");
    // TODO: Implement Python terminal interface for browsing codex entries
    alert("Grimoire Viewer: Interactive terminal interface for browsing codex entries will be implemented here.");
  };

  const handleLunarethSync = () => {
    console.log("Opening Lunareth Synchronization...");
    // TODO: Implement 13+1 phase mapping with sacred mathematics
    alert("Lunareth Synchronization: 13+1 phase mapping with sacred mathematics will be implemented here.");
  };

  const handleSacredGeometry = () => {
    console.log("Opening Sacred Geometry...");
    // TODO: Implement Scribe's Geometricum - mathematical patterns, L-systems, fractals
    alert("Sacred Geometry: Scribe's Geometricum for mathematical patterns, L-systems, and fractals will be implemented here.");
  };

  const handleMysticalToolsClient = () => {
    console.log("Opening Mystical Tools Client...");
    // TODO: Implement Python access to Oracle, Sigil Generator, Sonic Echo
    alert("Mystical Tools Client: Python access to Oracle, Sigil Generator, and Sonic Echo will be implemented here.");
  };

  const handleIntegrationBridge = () => {
    console.log("Opening Integration Bridge...");
    // TODO: Implement bidirectional data exchange between React and Python
    alert("Integration Bridge: Bidirectional data exchange between React and Python will be implemented here.");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedFilters={selectedFilters}
        onFiltersChange={setSelectedFilters}
        onOracleClick={openOracle}
        onSigilClick={openSigilGenerator}
        onSonicEchoClick={openSonicEchoGenerator}
        onGraphClick={openGraph}
        onCollectionsClick={openCollections}
        onToolsClick={openTools}
        onGrimoireViewerClick={handleGrimoireViewer}
        onLunarethSyncClick={handleLunarethSync}
        onSacredGeometryClick={handleSacredGeometry}
        onMysticalToolsClientClick={handleMysticalToolsClient}
        onIntegrationBridgeClick={handleIntegrationBridge}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        entryCounts={{
          cosmogenesis: filteredEntries.filter(e => e.category === "cosmogenesis").length,
          psychogenesis: filteredEntries.filter(e => e.category === "psychogenesis").length,
          mystagogy: filteredEntries.filter(e => e.category === "mystagogy").length,
          "climbing-systems": filteredEntries.filter(e => e.category === "climbing-systems").length,
          "initiation-rites": filteredEntries.filter(e => e.category === "initiation-rites").length,
          "archetypal-structures": filteredEntries.filter(e => e.category === "archetypal-structures").length,
          "psychic-technologies": filteredEntries.filter(e => e.category === "psychic-technologies").length,
        }}
      />

      <MainContent
        entries={filteredEntries}
        isLoading={isLoading}
        selectedCategory={selectedCategory}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onEntryClick={handleEntryClick}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          isOpen={!!selectedEntry}
          onClose={closeEntryModal}
        />
      )}

      <OracleModal
        isOpen={isOracleOpen}
        onClose={closeOracle}
      />

      <SigilGenerator
        isOpen={isSigilGeneratorOpen}
        onClose={closeSigilGenerator}
      />

      <SonicEchoGenerator
        isOpen={isSonicEchoGeneratorOpen}
        onClose={closeSonicEchoGenerator}
      />

      {isGraphOpen && (
        <CodexGraph
          onEntryClick={(entry) => {
            setSelectedEntry(entry);
            setIsGraphOpen(false);
          }}
          onClose={closeGraph}
        />
      )}

      <CollectionManager
        isOpen={isCollectionsOpen}
        onClose={closeCollections}
      />

      <ToolRunner
        isOpen={isToolsOpen}
        onClose={closeTools}
      />
    </div>
  );
}
