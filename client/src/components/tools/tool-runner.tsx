import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Sparkles, Eye, BookOpen, Scroll, Star, Zap, Key, Search, Crown, Map,
  Compass, Layers, Grid3x3, Music, FileText, Clock, Flame, 
  Mountain, Globe, Merge, MessageCircle, History, ChevronDown, ChevronUp
} from "lucide-react";
import { type ToolRun, insertToolRunSchema } from "@shared/schema";

interface ToolRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: string;
}

const mysticalTools = [
  { id: "scrying", name: "Scrying", icon: Eye, description: "Peer through the veils of time and space to glimpse hidden truths" },
  { id: "praxis", name: "Praxis", icon: Sparkles, description: "Transform abstract knowledge into practical mystical application" },
  { id: "chronicle", name: "Chronicle", icon: Scroll, description: "Weave personal narratives into the greater cosmic tapestry" },
  { id: "glyph", name: "Glyph Interpretation", icon: BookOpen, description: "Decode the sacred symbols and mystical sigils" },
  { id: "tapestry", name: "Tapestry Weaving", icon: Layers, description: "Interconnect disparate concepts into unified understanding" },
  { id: "synthesis", name: "Synthesis", icon: Merge, description: "Forge new insights by combining ancient wisdom with modern knowledge" },
  { id: "keys", name: "Key Generation", icon: Key, description: "Unlock hidden meanings and generate mystical correspondences" },
  { id: "imprint", name: "Imprint Reading", icon: Search, description: "Divine the subtle energetic signatures of mystical texts" },
  { id: "tarot", name: "Tarot", icon: Star, description: "Channel archetypal wisdom through the sacred cards" },
  { id: "stars", name: "Star Charts", icon: Crown, description: "Map celestial influences and cosmic alignments" },
  { id: "architecture", name: "Architecture", icon: Grid3x3, description: "Design sacred spaces and mystical structures" },
  { id: "aether", name: "Aether Analysis", icon: Zap, description: "Analyze the subtle energetic currents and elemental forces" },
  { id: "geometrics", name: "Geometrics", icon: Compass, description: "Unveil the sacred mathematics underlying reality" },
  { id: "harmonics", name: "Harmonics", icon: Music, description: "Attune to the vibrational frequencies of creation" },
  { id: "labyrinth", name: "Labyrinth", icon: Zap, description: "Navigate complex spiritual paths and inner journeys" },
  { id: "exegesis", name: "Exegesis", icon: FileText, description: "Provide deep mystical commentary and interpretation" },
  { id: "orrery", name: "Orrery", icon: Clock, description: "Model cosmic cycles and temporal mystical patterns" },
  { id: "athanor", name: "Athanor", icon: Flame, description: "Transform and purify concepts through alchemical processes" },
  { id: "legend", name: "Legend", icon: Mountain, description: "Create mythic narratives and archetypal stories" },
  { id: "noosphere", name: "Noosphere", icon: Globe, description: "Tap into collective consciousness and shared wisdom" },
  { id: "fusion", name: "Fusion", icon: Sparkles, description: "Blend multiple mystical traditions and practices" },
  { id: "dialogue", name: "Dialogue", icon: MessageCircle, description: "Engage in mystical discourse and spiritual conversation" },
];

const createToolRunSchema = insertToolRunSchema.extend({
  type: z.string().min(1, "Tool type is required"),
  input: z.string().min(1, "Input is required").max(2000, "Input must be 2000 characters or less"),
});

type CreateToolRunForm = z.infer<typeof createToolRunSchema>;

export default function ToolRunner({ isOpen, onClose, initialTool = "scrying" }: ToolRunnerProps) {
  const [selectedTool, setSelectedTool] = useState(initialTool);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  const selectedToolInfo = mysticalTools.find(tool => tool.id === selectedTool) || mysticalTools[0];

  // Fetch tool run history
  const { data: toolRuns = [], isLoading: isLoadingHistory } = useQuery<ToolRun[]>({
    queryKey: ["/api/tools/runs"],
    enabled: isOpen && showHistory
  });

  // Create tool run form
  const form = useForm<CreateToolRunForm>({
    resolver: zodResolver(createToolRunSchema),
    defaultValues: {
      type: selectedTool,
      input: ""
    }
  });

  // Update form when tool changes
  const handleToolChange = (toolId: string) => {
    setSelectedTool(toolId);
    form.setValue("type", toolId);
  };

  // Run tool mutation
  const runToolMutation = useMutation({
    mutationFn: async (data: CreateToolRunForm) => {
      const response = await apiRequest("POST", "/api/tools/run", data);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "✨ Mystical Insight Received",
        description: `The ${selectedToolInfo.name} has revealed its wisdom`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tool-runs"] });
      // Don't reset form - keep the result visible
    },
    onError: (error: any) => {
      if (error.message?.includes("quota") || error.message?.includes("rate")) {
        toast({
          title: "🌙 The Oracle Rests",
          description: "The mystical energies are temporarily exhausted. Please wait before consulting the cosmos again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "⚡ Mystical Interference",
          description: "The ethereal channels are disrupted. Try again when the cosmic alignments are more favorable.",
          variant: "destructive"
        });
      }
    }
  });

  const onSubmit = (data: CreateToolRunForm) => {
    runToolMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-hidden">
      <div className="container mx-auto p-6 h-full max-w-6xl">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-cinzel text-2xl">
                <Sparkles className="h-6 w-6" />
                Mystical Tools Atelier
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  data-testid="button-toggle-history"
                >
                  <History className="h-4 w-4 mr-1" />
                  {showHistory ? "Hide" : "Show"} History
                </Button>
                <Button variant="outline" onClick={onClose} data-testid="button-close-tool-runner">
                  ✕
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              
              {/* Tools Selection */}
              <div className="space-y-4">
                <h3 className="font-cinzel text-lg font-semibold">Choose Your Mystical Tool</h3>
                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-4">
                    {mysticalTools.map((tool) => {
                      const IconComponent = tool.icon;
                      return (
                        <Card 
                          key={tool.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTool === tool.id ? "ring-2 ring-primary bg-primary/5" : ""
                          }`}
                          onClick={() => handleToolChange(tool.id)}
                          data-testid={`tool-${tool.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{tool.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {tool.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Tool Interface */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Tool */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <selectedToolInfo.icon className="h-5 w-5" />
                      {selectedToolInfo.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedToolInfo.description}
                    </p>
                  </CardHeader>
                </Card>

                {/* Tool Form */}
                <Card>
                  <CardContent className="p-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="input"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-cinzel">
                                Your Query to the {selectedToolInfo.name}
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={`Enter your question or input for the ${selectedToolInfo.name}...`}
                                  className="resize-none"
                                  rows={4}
                                  {...field}
                                  data-testid="textarea-tool-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={runToolMutation.isPending}
                            className="mystical-border oracle-glow"
                            data-testid="button-run-tool"
                          >
                            {runToolMutation.isPending ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                                Consulting the Cosmos...
                              </>
                            ) : (
                              <>
                                <selectedToolInfo.icon className="h-4 w-4 mr-2" />
                                Invoke {selectedToolInfo.name}
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Tool Result */}
                {runToolMutation.data && (
                  <Card className="mystical-border mystical-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Mystical Revelation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-amber max-w-none text-foreground">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {(runToolMutation.data as any)?.output}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tool History */}
                {showHistory && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Recent Mystical Consultations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : toolRuns.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No mystical consultations yet. Begin your journey above!</p>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-96">
                          <div className="space-y-3 pr-4">
                            {toolRuns.slice(0, 10).map((run) => {
                              const toolInfo = mysticalTools.find(t => t.id === run.type) || mysticalTools[0];
                              return (
                                <div key={run.id} className="border rounded-lg p-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <toolInfo.icon className="h-4 w-4" />
                                    <Badge variant="secondary">{toolInfo.name}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(run.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Query:</strong> {run.input.substring(0, 100)}
                                    {run.input.length > 100 ? "..." : ""}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Revelation:</strong> {run.output.substring(0, 150)}
                                    {run.output.length > 150 ? "..." : ""}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}