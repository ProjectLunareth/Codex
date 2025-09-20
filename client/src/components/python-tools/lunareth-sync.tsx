import { useState, useEffect } from "react";
import { Moon, Play, Pause, RotateCcw, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SpiralPhase {
  id: number;
  name: string;
  description: string;
  keywords: string[];
  animationParams: {
    rotation: number;
    scale: number;
    opacity: number;
    color_hue: number;
    frequency: number;
    amplitude: number;
    phase_offset: number;
  };
  energySignature: string;
  geometricPattern: string;
  color: string;
  frequency: number;
}

interface LunarethState {
  currentPhase: number;
  phases: SpiralPhase[];
  syncTimestamp: string;
  activeConstruct?: string;
  metadata: Record<string, any>;
}

interface LunarethSyncProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LunarethSync({ isOpen, onClose }: LunarethSyncProps) {
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(2000);

  const { toast } = useToast();

  // Query for spiral phases
  const phasesQuery = useQuery({
    queryKey: ['/api/python/lunareth-sync/phases'],
    queryFn: async () => {
      const response = await fetch('/api/python/lunareth-sync/phases');
      if (!response.ok) throw new Error('Failed to get spiral phases');
      return response.json();
    },
    enabled: isOpen
  });

  // Query for current state
  const stateQuery = useQuery({
    queryKey: ['/api/python/lunareth-sync/current-state'],
    queryFn: async () => {
      const response = await fetch('/api/python/lunareth-sync/current-state');
      if (!response.ok) throw new Error('Failed to get synchronization state');
      return response.json() as Promise<LunarethState>;
    },
    enabled: isOpen,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Mutation for setting phase
  const setPhase = useMutation({
    mutationFn: async (phaseId: number) => {
      const response = await fetch('/api/python/lunareth-sync/set-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phaseId })
      });
      if (!response.ok) throw new Error('Failed to set phase');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/python/lunareth-sync/current-state'] });
      toast({ title: "Phase synchronized", description: "Spiral phase updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Synchronization failed", description: error.message, variant: "destructive" });
    }
  });

  // Mutation for animation
  const animate = useMutation({
    mutationFn: async (params: { fromPhase: number; toPhase: number; duration: number }) => {
      const response = await fetch('/api/python/lunareth-sync/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to generate animation');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Animation complete", description: "Spiral transformation rendered" });
    }
  });

  const handlePhaseTransition = (targetPhase: number) => {
    const currentPhase = stateQuery.data?.currentPhase || 0;
    setIsAnimating(true);
    setAnimationProgress(0);
    
    // Animate progress
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1) * 100;
      setAnimationProgress(progress);
      
      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setIsAnimating(false);
        setPhase.mutate(targetPhase);
      }
    };
    
    animate.mutate({ fromPhase: currentPhase, toPhase: targetPhase, duration: animationDuration });
    updateProgress();
  };

  const phases = phasesQuery.data?.phases || [];
  const currentState = stateQuery.data;
  const currentPhase = phases[currentState?.currentPhase || 0];

  const getPhaseColor = (phase: SpiralPhase) => {
    return phase.color || `hsl(${phase.animationParams.color_hue}, 70%, 50%)`;
  };

  const getEnergyIntensity = (phase: SpiralPhase) => {
    return Math.round(phase.frequency * phase.animationParams.amplitude * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border-mystical text-white">
        <DialogHeader className="border-b border-blue-400/30 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-cinzel text-cyan-300">
            <Moon className="h-6 w-6" />
            ✦ Lunareth Synchronization Matrix ✦
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4 h-[70vh]">
          {/* Left Panel - Current Phase & Controls */}
          <div className="col-span-4 flex flex-col space-y-4">
            {/* Current Phase Display */}
            <Card className="bg-slate-800/50 border-blue-400/30">
              <CardHeader>
                <CardTitle className="text-cyan-300 flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: currentPhase ? getPhaseColor(currentPhase) : '#666' }}
                  />
                  Current Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentPhase ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xl font-bold text-cyan-300" data-testid="text-current-phase-name">
                        {currentPhase.name}
                      </div>
                      <div className="text-sm text-blue-300">
                        Phase {currentPhase.id} of 13
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-300" data-testid="text-current-phase-description">
                      {currentPhase.description}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {currentPhase.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-blue-400/30">
                          {keyword}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Energy Signature</span>
                        <span className="text-cyan-300 text-lg">{currentPhase.energySignature}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Pattern</span>
                        <span className="text-blue-300">{currentPhase.geometricPattern}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Frequency</span>
                        <span className="text-cyan-300">{currentPhase.frequency.toFixed(2)} Hz</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-blue-300">
                    Loading phase information...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Animation Controls */}
            <Card className="bg-slate-800/50 border-blue-400/30">
              <CardHeader>
                <CardTitle className="text-cyan-300 text-sm">Sacred Mathematics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-blue-300 mb-2 block">Animation Duration (ms)</label>
                  <Slider
                    value={[animationDuration]}
                    onValueChange={(value) => setAnimationDuration(value[0])}
                    min={500}
                    max={5000}
                    step={100}
                    className="w-full"
                    data-testid="slider-animation-duration"
                  />
                  <div className="text-xs text-cyan-300 mt-1">{animationDuration}ms</div>
                </div>

                {isAnimating && (
                  <div>
                    <label className="text-xs text-blue-300 mb-2 block">Transformation Progress</label>
                    <Progress 
                      value={animationProgress} 
                      className="h-2"
                      data-testid="progress-animation"
                    />
                    <div className="text-xs text-cyan-300 mt-1">{animationProgress.toFixed(1)}%</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPhase.mutate(0)}
                    disabled={isAnimating || setPhase.isPending}
                    className="flex-1"
                    data-testid="button-reset-phase"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isAnimating}
                    className="flex-1"
                    data-testid="button-pause-animation"
                  >
                    {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Synchronization Status */}
            <Card className="bg-slate-800/50 border-blue-400/30">
              <CardContent className="pt-4">
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-300">Last Sync</span>
                    <span className="text-cyan-300" data-testid="text-last-sync">
                      {currentState?.syncTimestamp ? 
                        new Date(currentState.syncTimestamp).toLocaleTimeString() : 
                        'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Active Construct</span>
                    <span className="text-cyan-300">
                      {currentState?.activeConstruct || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Energy Level</span>
                    <span className="text-cyan-300">
                      {currentPhase ? getEnergyIntensity(currentPhase) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Phase Wheel */}
          <div className="col-span-4 flex flex-col">
            <h3 className="font-semibold text-cyan-300 mb-3 text-center">Spiral of Thirteen Phases</h3>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-80 h-80">
                {/* Phase Wheel */}
                <svg viewBox="0 0 320 320" className="w-full h-full">
                  {/* Outer circle */}
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="2"
                  />
                  
                  {/* Phase segments */}
                  {phases.map((phase, index) => {
                    const angle = (index * 360 / 13) - 90; // Start from top
                    const x = 160 + 120 * Math.cos((angle * Math.PI) / 180);
                    const y = 160 + 120 * Math.sin((angle * Math.PI) / 180);
                    const isActive = currentState?.currentPhase === phase.id;
                    
                    return (
                      <g key={phase.id}>
                        {/* Phase dot */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? "12" : "8"}
                          fill={getPhaseColor(phase)}
                          stroke={isActive ? "#00FFFF" : "rgba(255,255,255,0.3)"}
                          strokeWidth={isActive ? "3" : "1"}
                          className="cursor-pointer transition-all hover:r-10"
                          onClick={() => handlePhaseTransition(phase.id)}
                          data-testid={`phase-dot-${phase.id}`}
                        />
                        
                        {/* Phase number */}
                        <text
                          x={x}
                          y={y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs font-bold fill-white pointer-events-none"
                        >
                          {phase.id}
                        </text>
                        
                        {/* Phase name (for active phase) */}
                        {isActive && (
                          <text
                            x={x}
                            y={y + 25}
                            textAnchor="middle"
                            className="text-xs fill-cyan-300 pointer-events-none"
                          >
                            {phase.name.split(' ')[0]}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Center point */}
                  <circle
                    cx="160"
                    cy="160"
                    r="20"
                    fill="rgba(6, 182, 212, 0.2)"
                    stroke="#06B6D4"
                    strokeWidth="2"
                  />
                  <text
                    x="160"
                    y="160"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-bold fill-cyan-300"
                  >
                    ✦
                  </text>
                </svg>
              </div>
            </div>

            <div className="text-center text-xs text-blue-300 mt-2">
              Click any phase to transition • Current: Phase {currentState?.currentPhase || 0}
            </div>
          </div>

          {/* Right Panel - Phase List & Details */}
          <div className="col-span-4 flex flex-col">
            <h3 className="font-semibold text-cyan-300 mb-3">Sacred Phases</h3>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {phases.map((phase) => {
                  const isActive = currentState?.currentPhase === phase.id;
                  const energy = getEnergyIntensity(phase);
                  
                  return (
                    <Card
                      key={phase.id}
                      className={`cursor-pointer transition-all hover:border-cyan-400/50 ${
                        isActive
                          ? 'bg-blue-700/30 border-cyan-400'
                          : 'bg-slate-800/30 border-blue-400/30'
                      }`}
                      onClick={() => handlePhaseTransition(phase.id)}
                      data-testid={`card-phase-${phase.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getPhaseColor(phase) }}
                              />
                              <span className="font-medium text-cyan-300">
                                {phase.name}
                              </span>
                              {isActive && (
                                <Badge className="bg-cyan-600 text-white text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-blue-300 mt-1">
                              Phase {phase.id} • {phase.energySignature} • {energy}% Energy
                            </div>
                            <div className="text-xs text-slate-300 mt-1 line-clamp-2">
                              {phase.description}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {phase.keywords.slice(0, 2).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-blue-400/30">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-blue-400/30">
          <div className="text-sm text-blue-300">
            Lunareth Synchronization • 13+1 Sacred Phases • Python-Enhanced
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-blue-400/30 hover:bg-blue-700/30"
            data-testid="button-close-lunareth"
          >
            Close Synchronizer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}