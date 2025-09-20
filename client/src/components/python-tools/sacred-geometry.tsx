import { useState, useRef, useEffect } from "react";
import { Compass, Download, RotateCcw, Settings, Zap, Play, Square } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface GeometricPattern {
  name: string;
  type: string;
  description: string;
  parameters: Record<string, any>;
  sacred_ratio?: number;
}

interface SacredGeometryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SacredGeometry({ isOpen, onClose }: SacredGeometryProps) {
  const [selectedPattern, setSelectedPattern] = useState<string>("");
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [lSystemState, setLSystemState] = useState({
    axiom: "F",
    rules: { F: "F+F-F-F+F" },
    iterations: 3,
    angle: 90
  });
  const [colorScheme, setColorScheme] = useState("golden");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Query for available patterns
  const patternsQuery = useQuery({
    queryKey: ['/api/python/sacred-geometry/patterns'],
    queryFn: async () => {
      const response = await fetch('/api/python/sacred-geometry/patterns');
      if (!response.ok) throw new Error('Failed to get patterns');
      return response.json();
    },
    enabled: isOpen
  });

  // Mutation for generating patterns
  const generatePattern = useMutation({
    mutationFn: async (params: {
      patternType: string;
      parameters: Record<string, any>;
      width: number;
      height: number;
    }) => {
      const response = await fetch('/api/python/sacred-geometry/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to generate pattern');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({ title: "Pattern generated", description: "Sacred geometry rendered successfully" });
      }
    },
    onError: (error) => {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    }
  });

  // Mutation for L-system generation
  const generateLSystem = useMutation({
    mutationFn: async (params: {
      axiom: string;
      rules: Record<string, string>;
      iterations: number;
      angle: number;
      colorScheme?: string;
    }) => {
      const response = await fetch('/api/python/sacred-geometry/l-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to generate L-system');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({ title: "L-system generated", description: "Fractal pattern rendered successfully" });
      }
    },
    onError: (error) => {
      toast({ title: "L-system failed", description: error.message, variant: "destructive" });
    }
  });

  const colorSchemes = [
    { value: "golden", label: "Golden Ratio", colors: ["#FFD700", "#FFA500", "#FF8C00"] },
    { value: "mystical", label: "Mystical Purple", colors: ["#4B0082", "#8A2BE2", "#9932CC"] },
    { value: "emerald", label: "Emerald Light", colors: ["#50C878", "#00FF7F", "#00FA9A"] },
    { value: "cosmic", label: "Cosmic Blue", colors: ["#191970", "#0000CD", "#4169E1"] },
    { value: "fire", label: "Sacred Fire", colors: ["#DC143C", "#FF4500", "#FF6347"] }
  ];

  const patterns = patternsQuery.data?.patterns || [];

  const handleGeneratePattern = () => {
    if (!selectedPattern) {
      toast({ title: "No pattern selected", description: "Please select a pattern type", variant: "destructive" });
      return;
    }

    generatePattern.mutate({
      patternType: selectedPattern,
      parameters: {
        ...parameters,
        color_scheme: colorScheme
      },
      width: canvasSize.width,
      height: canvasSize.height
    });
  };

  const handleGenerateLSystem = () => {
    generateLSystem.mutate({
      ...lSystemState,
      colorScheme
    });
  };

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `sacred-geometry-${Date.now()}.png`;
      link.click();
    }
  };

  const selectedPatternData = patterns.find((p: GeometricPattern) => p.name === selectedPattern);

  // Golden ratio calculations for display
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 border-mystical text-white">
        <DialogHeader className="border-b border-amber-400/30 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-cinzel text-amber-200">
            <Compass className="h-6 w-6" />
            ✦ Scribe's Geometricum ✦
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4 h-[70vh]">
          {/* Left Panel - Controls */}
          <div className="col-span-3 flex flex-col space-y-4">
            {/* Pattern Selection */}
            <Card className="bg-slate-800/50 border-amber-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-300">Sacred Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={selectedPattern} onValueChange={setSelectedPattern}>
                  <SelectTrigger className="bg-slate-700/50 border-amber-400/30 text-white" data-testid="select-pattern-type">
                    <SelectValue placeholder="Choose pattern" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-400/30">
                    {patterns.map((pattern: GeometricPattern) => (
                      <SelectItem key={pattern.name} value={pattern.name} className="text-white hover:bg-amber-700/50">
                        {pattern.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPatternData && (
                  <div className="text-xs text-amber-200" data-testid="text-pattern-description">
                    {selectedPatternData.description}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Canvas Settings */}
            <Card className="bg-slate-800/50 border-amber-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-300">Canvas Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-amber-200">Width</Label>
                    <Input
                      type="number"
                      value={canvasSize.width}
                      onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                      className="bg-slate-700/50 border-amber-400/30 text-white h-8"
                      data-testid="input-canvas-width"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-amber-200">Height</Label>
                    <Input
                      type="number"
                      value={canvasSize.height}
                      onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                      className="bg-slate-700/50 border-amber-400/30 text-white h-8"
                      data-testid="input-canvas-height"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-amber-200 mb-2 block">Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger className="bg-slate-700/50 border-amber-400/30 text-white h-8" data-testid="select-color-scheme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-amber-400/30">
                      {colorSchemes.map(scheme => (
                        <SelectItem key={scheme.value} value={scheme.value} className="text-white hover:bg-amber-700/50">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {scheme.colors.map((color, i) => (
                                <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                              ))}
                            </div>
                            {scheme.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Sacred Mathematics */}
            <Card className="bg-slate-800/50 border-amber-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-300">Sacred Mathematics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-amber-200">Golden Ratio (φ)</span>
                  <span className="text-amber-300 font-mono">{goldenRatio.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200">φ²</span>
                  <span className="text-amber-300 font-mono">{(goldenRatio * goldenRatio).toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200">1/φ</span>
                  <span className="text-amber-300 font-mono">{(1/goldenRatio).toFixed(6)}</span>
                </div>
                <div className="mt-2">
                  <div className="text-amber-200 mb-1">Fibonacci Sequence</div>
                  <div className="flex flex-wrap gap-1">
                    {fibSequence.map((num, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-amber-400/30">
                        {num}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGeneratePattern}
              disabled={!selectedPattern || generatePattern.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              data-testid="button-generate-pattern"
            >
              <Zap className="h-4 w-4 mr-2" />
              {generatePattern.isPending ? 'Generating...' : 'Generate Pattern'}
            </Button>
          </div>

          {/* Center Panel - Canvas Display */}
          <div className="col-span-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-amber-300">Sacred Canvas</h3>
              <div className="flex gap-2">
                {generatedImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="border-amber-400/30 hover:bg-amber-700/30"
                    data-testid="button-download-image"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGeneratedImage(null)}
                  className="border-amber-400/30 hover:bg-amber-700/30"
                  data-testid="button-clear-canvas"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <Card className="bg-black/50 border-amber-400/30 flex-1 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center p-4">
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated sacred geometry"
                    className="max-w-full max-h-full object-contain border border-amber-400/30 rounded"
                    data-testid="img-generated-pattern"
                  />
                ) : (
                  <div className="text-center text-amber-300/50">
                    <Compass className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>Select a pattern and generate sacred geometry</p>
                    <p className="text-sm mt-2">Canvas: {canvasSize.width} × {canvasSize.height}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Panel - Pattern Parameters & L-Systems */}
          <div className="col-span-3 flex flex-col">
            <Tabs defaultValue="parameters" className="flex-1">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                <TabsTrigger value="parameters" className="text-xs" data-testid="tab-parameters">Parameters</TabsTrigger>
                <TabsTrigger value="lsystem" className="text-xs" data-testid="tab-lsystem">L-Systems</TabsTrigger>
              </TabsList>

              <TabsContent value="parameters" className="flex-1 mt-4">
                <Card className="bg-slate-800/50 border-amber-400/30 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-amber-300">Pattern Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      {selectedPatternData ? (
                        <div className="space-y-4">
                          {Object.entries(selectedPatternData.parameters).map(([key, defaultValue]) => (
                            <div key={key}>
                              <Label className="text-xs text-amber-200 mb-2 block capitalize">
                                {key.replace('_', ' ')}
                              </Label>
                              {typeof defaultValue === 'number' ? (
                                <div className="space-y-2">
                                  <Slider
                                    value={[parameters[key] || defaultValue]}
                                    onValueChange={(value) => handleParameterChange(key, value[0])}
                                    min={Math.max(0.1, defaultValue * 0.1)}
                                    max={defaultValue * 5}
                                    step={defaultValue < 1 ? 0.1 : 1}
                                    className="w-full"
                                    data-testid={`slider-${key}`}
                                  />
                                  <div className="text-xs text-amber-300">
                                    {(parameters[key] || defaultValue).toFixed(1)}
                                  </div>
                                </div>
                              ) : typeof defaultValue === 'boolean' ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={parameters[key] ?? defaultValue}
                                    onChange={(e) => handleParameterChange(key, e.target.checked)}
                                    className="rounded"
                                    data-testid={`checkbox-${key}`}
                                  />
                                </div>
                              ) : (
                                <Input
                                  value={parameters[key] || defaultValue}
                                  onChange={(e) => handleParameterChange(key, e.target.value)}
                                  className="bg-slate-700/50 border-amber-400/30 text-white h-8"
                                  data-testid={`input-${key}`}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-amber-300/50">
                          <Settings className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Select a pattern to configure parameters</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lsystem" className="flex-1 mt-4">
                <Card className="bg-slate-800/50 border-amber-400/30 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-amber-300">L-System Fractals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-amber-200 mb-1 block">Axiom</Label>
                      <Input
                        value={lSystemState.axiom}
                        onChange={(e) => setLSystemState(prev => ({ ...prev, axiom: e.target.value }))}
                        className="bg-slate-700/50 border-amber-400/30 text-white h-8"
                        placeholder="F"
                        data-testid="input-lsystem-axiom"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-amber-200 mb-1 block">Rules (F → ...)</Label>
                      <Input
                        value={lSystemState.rules.F || ""}
                        onChange={(e) => setLSystemState(prev => ({ 
                          ...prev, 
                          rules: { ...prev.rules, F: e.target.value }
                        }))}
                        className="bg-slate-700/50 border-amber-400/30 text-white h-8"
                        placeholder="F+F-F-F+F"
                        data-testid="input-lsystem-rules"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-amber-200 mb-2 block">
                        Iterations: {lSystemState.iterations}
                      </Label>
                      <Slider
                        value={[lSystemState.iterations]}
                        onValueChange={(value) => setLSystemState(prev => ({ ...prev, iterations: value[0] }))}
                        min={1}
                        max={7}
                        step={1}
                        className="w-full"
                        data-testid="slider-lsystem-iterations"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-amber-200 mb-2 block">
                        Angle: {lSystemState.angle}°
                      </Label>
                      <Slider
                        value={[lSystemState.angle]}
                        onValueChange={(value) => setLSystemState(prev => ({ ...prev, angle: value[0] }))}
                        min={15}
                        max={120}
                        step={15}
                        className="w-full"
                        data-testid="slider-lsystem-angle"
                      />
                    </div>

                    <Button
                      onClick={handleGenerateLSystem}
                      disabled={generateLSystem.isPending}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      data-testid="button-generate-lsystem"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {generateLSystem.isPending ? 'Generating...' : 'Generate L-System'}
                    </Button>

                    <div className="text-xs text-amber-200 space-y-1">
                      <div><strong>Commands:</strong></div>
                      <div>F = Forward, + = Turn Left, - = Turn Right</div>
                      <div>[ = Push State, ] = Pop State</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-amber-400/30">
          <div className="text-sm text-amber-300">
            Sacred Geometry Engine • Mathematical Harmony • Divine Proportions
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-amber-400/30 hover:bg-amber-700/30"
            data-testid="button-close-geometry"
          >
            Close Geometricum
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}