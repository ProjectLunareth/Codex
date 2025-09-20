import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Network, RotateCcw, ZoomIn, ZoomOut, Filter } from "lucide-react";
import { type CodexEntry, type GraphNode, type GraphEdge } from "@shared/schema";

interface CodexGraphProps {
  onEntryClick: (entry: CodexEntry) => void;
  onClose: () => void;
}

// Jaccard similarity calculation for keyTerms
function calculateJaccardSimilarity(terms1: string[] | null, terms2: string[] | null): number {
  if (!terms1 || !terms2 || terms1.length === 0 || terms2.length === 0) return 0;
  
  const set1 = new Set(terms1.map(term => term.toLowerCase()));
  const set2 = new Set(terms2.map(term => term.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Generate circular layout positions
function generateCircularLayout(entries: CodexEntry[], width: number, height: number): GraphNode[] {
  const categories = ["cosmogenesis", "psychogenesis", "mystagogy"];
  const categoryGroups = categories.map(category => 
    entries.filter(entry => entry.category === category)
  );
  
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(width, height) * 0.3;
  
  const nodes: GraphNode[] = [];
  
  categoryGroups.forEach((group, categoryIndex) => {
    if (group.length === 0) return;
    
    const categoryRadius = baseRadius + (categoryIndex * 60);
    const angleStep = (2 * Math.PI) / group.length;
    const categoryStartAngle = (categoryIndex * Math.PI * 2) / 3;
    
    group.forEach((entry, index) => {
      const angle = categoryStartAngle + (index * angleStep);
      const x = centerX + Math.cos(angle) * categoryRadius;
      const y = centerY + Math.sin(angle) * categoryRadius;
      
      nodes.push({
        id: entry.id,
        title: entry.filename.replace('.txt', ''),
        category: entry.category,
        x,
        y,
        keyTerms: entry.keyTerms || []
      });
    });
  });
  
  return nodes;
}

// Generate force-directed layout
function generateForceLayout(entries: CodexEntry[], width: number, height: number): GraphNode[] {
  // Simplified force layout - place randomly and let CSS transitions handle movement
  const nodes: GraphNode[] = entries.map((entry, index) => ({
    id: entry.id,
    title: entry.filename.replace('.txt', ''),
    category: entry.category,
    x: Math.random() * (width - 100) + 50,
    y: Math.random() * (height - 100) + 50,
    keyTerms: entry.keyTerms || []
  }));
  
  return nodes;
}

// Generate relationship edges based on similarity
function generateEdges(nodes: GraphNode[], entries: CodexEntry[], threshold: number): GraphEdge[] {
  const edges: GraphEdge[] = [];
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const entry1 = entries.find(e => e.id === nodes[i].id);
      const entry2 = entries.find(e => e.id === nodes[j].id);
      
      if (entry1 && entry2) {
        const similarity = calculateJaccardSimilarity(entry1.keyTerms, entry2.keyTerms);
        if (similarity >= threshold) {
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            similarity
          });
        }
      }
    }
  }
  
  return edges;
}

export default function CodexGraph({ onEntryClick, onClose }: CodexGraphProps) {
  const [layout, setLayout] = useState<"circular" | "force">("circular");
  const [similarityThreshold, setSimilarityThreshold] = useState([0.2]);
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const [showEdges, setShowEdges] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Fetch all codex entries
  const { data: entries = [], isLoading } = useQuery<CodexEntry[]>({
    queryKey: ["/api/codex/entries"]
  });

  // Get entry counts by category
  const entryCounts = useMemo(() => {
    return entries.reduce((counts, entry) => {
      counts[entry.category] = (counts[entry.category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }, [entries]);

  // Filter entries by selected category
  const filteredEntries = useMemo(() => {
    if (selectedCategory === "all") return entries;
    return entries.filter(entry => entry.category === selectedCategory);
  }, [entries, selectedCategory]);

  // Generate graph layout
  const { nodes, edges } = useMemo(() => {
    if (filteredEntries.length === 0) return { nodes: [], edges: [] };
    
    const svgWidth = 800;
    const svgHeight = 600;
    
    const graphNodes = layout === "circular" 
      ? generateCircularLayout(filteredEntries, svgWidth, svgHeight)
      : generateForceLayout(filteredEntries, svgWidth, svgHeight);
    
    const graphEdges = generateEdges(graphNodes, filteredEntries, similarityThreshold[0]);
    
    return { nodes: graphNodes, edges: graphEdges };
  }, [filteredEntries, layout, similarityThreshold]);

  const handleNodeClick = (node: GraphNode) => {
    const entry = entries.find(e => e.id === node.id);
    if (entry) {
      onEntryClick(entry);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading codex visualization...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="h-full flex">
        {/* Controls Panel */}
        <Card className="w-80 m-4 h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-cinzel">
                <Network className="h-5 w-5" />
                Codex Relationships
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-graph">
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Layout Controls */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Layout</Label>
              <Select value={layout} onValueChange={(value: "circular" | "force") => setLayout(value)}>
                <SelectTrigger data-testid="select-layout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="circular">Circular (by Category)</SelectItem>
                  <SelectItem value="force">Force-Directed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Category Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Category Filter</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories ({entries.length})</SelectItem>
                  <SelectItem value="cosmogenesis">
                    Cosmogenesis ({entryCounts.cosmogenesis || 0})
                  </SelectItem>
                  <SelectItem value="psychogenesis">
                    Psychogenesis ({entryCounts.psychogenesis || 0})
                  </SelectItem>
                  <SelectItem value="mystagogy">
                    Mystagogy ({entryCounts.mystagogy || 0})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Similarity Threshold */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Similarity Threshold</Label>
                <Badge variant="outline">{similarityThreshold[0].toFixed(2)}</Badge>
              </div>
              <Slider
                value={similarityThreshold}
                onValueChange={setSimilarityThreshold}
                max={1}
                min={0.1}
                step={0.05}
                data-testid="slider-similarity-threshold"
              />
              <p className="text-xs text-muted-foreground">
                Edges shown: {edges.length} relationships
              </p>
            </div>

            <Separator />

            {/* Display Options */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Display Options</Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-edges" className="text-sm">Show Relationships</Label>
                <Switch
                  id="show-edges"
                  checked={showEdges}
                  onCheckedChange={setShowEdges}
                  data-testid="switch-show-edges"
                />
              </div>
            </div>

            <Separator />

            {/* View Controls */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">View Controls</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomIn} data-testid="button-zoom-in">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut} data-testid="button-zoom-out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetView} data-testid="button-reset-view">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Zoom: {(zoom * 100).toFixed(0)}%
              </p>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Legend</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <span className="text-xs">Cosmogenesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <span className="text-xs">Psychogenesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-xs">Mystagogy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-amber-300/60"></div>
                  <span className="text-xs">Relationship</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Graph Visualization */}
        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardContent className="p-4 h-full">
              <TooltipProvider>
                <div className="relative w-full h-full overflow-hidden rounded-lg border bg-gradient-to-br from-background to-muted/20">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox={`${-pan.x} ${-pan.y} ${800 / zoom} ${600 / zoom}`}
                    className="cursor-grab active:cursor-grabbing"
                    data-testid="svg-codex-graph"
                  >
                    {/* Background grid */}
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="rgba(148, 163, 184, 0.1)"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Relationship edges */}
                    {showEdges && edges.map((edge, index) => {
                      const sourceNode = nodes.find(n => n.id === edge.source);
                      const targetNode = nodes.find(n => n.id === edge.target);
                      
                      if (!sourceNode || !targetNode) return null;
                      
                      return (
                        <line
                          key={`edge-${index}`}
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="rgb(251 191 36 / 0.3)"
                          strokeWidth={edge.similarity * 2}
                          className="transition-all duration-300"
                          data-testid={`edge-${edge.source}-${edge.target}`}
                        />
                      );
                    })}

                    {/* Nodes */}
                    {nodes.map((node) => {
                      const entry = entries.find(e => e.id === node.id);
                      if (!entry) return null;

                      const categoryColors = {
                        cosmogenesis: "rgb(251 191 36)", // amber-400
                        psychogenesis: "rgb(168 85 247)", // purple-400  
                        mystagogy: "rgb(96 165 250)" // blue-400
                      };

                      const isHovered = hoveredNode === node.id;

                      return (
                        <Tooltip key={node.id}>
                          <TooltipTrigger asChild>
                            <g
                              className="cursor-pointer transition-all duration-300 hover:scale-110"
                              onClick={() => handleNodeClick(node)}
                              onMouseEnter={() => setHoveredNode(node.id)}
                              onMouseLeave={() => setHoveredNode(null)}
                              data-testid={`node-${node.id}`}
                            >
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r={isHovered ? 8 : 6}
                                fill={categoryColors[node.category as keyof typeof categoryColors]}
                                stroke="rgba(255, 255, 255, 0.8)"
                                strokeWidth={isHovered ? 2 : 1}
                                className="drop-shadow-sm"
                              />
                              
                              {isHovered && (
                                <text
                                  x={node.x}
                                  y={node.y - 12}
                                  textAnchor="middle"
                                  fontSize="12"
                                  fill="currentColor"
                                  className="font-medium drop-shadow-sm"
                                >
                                  {node.title.length > 20 ? node.title.substring(0, 20) + '...' : node.title}
                                </text>
                              )}
                            </g>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">{entry.filename}</p>
                              <p className="text-sm capitalize">
                                <Badge variant="outline">{entry.category}</Badge>
                              </p>
                              <p className="text-xs line-clamp-3">{entry.summary}</p>
                              {entry.keyTerms && entry.keyTerms.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {entry.keyTerms.slice(0, 3).map((term, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {term}
                                    </Badge>
                                  ))}
                                  {entry.keyTerms.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{entry.keyTerms.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </svg>

                  {/* Status overlay */}
                  <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-md px-3 py-2 text-sm">
                    <p>Showing {nodes.length} entries • {edges.length} relationships</p>
                    <p className="text-muted-foreground text-xs">Click nodes to view entries</p>
                  </div>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}