import { useState } from "react";
import { Settings, MessageCircle, Zap, Volume2, History, User, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ToolSession {
  session_id: string;
  started_at: string;
  tools_used: string[];
  total_requests: number;
  last_activity: string;
  context_stack: string[];
}

interface MysticalToolsClientProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MysticalToolsClient({ isOpen, onClose }: MysticalToolsClientProps) {
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleContext, setOracleContext] = useState("general");
  const [oracleDepth, setOracleDepth] = useState("medium");
  
  const [sigilIntention, setSigilIntention] = useState("");
  const [sigilStyle, setSigilStyle] = useState("traditional");
  const [sigilSymbolism, setSigilSymbolism] = useState("hermetic");
  const [sigilEnergy, setSigilEnergy] = useState("balanced");
  
  const [sonicText, setSonicText] = useState("");
  const [sonicVoice, setSonicVoice] = useState("mystical");
  const [sonicStyle, setSonicStyle] = useState("meditation");
  const [sonicTitle, setSonicTitle] = useState("");

  const [responses, setResponses] = useState<any[]>([]);

  const { toast } = useToast();

  // Query for session info
  const sessionQuery = useQuery({
    queryKey: ['/api/python/mystical-tools/session'],
    queryFn: async () => {
      const response = await fetch('/api/python/mystical-tools/session');
      if (!response.ok) throw new Error('Failed to get session info');
      return response.json() as Promise<ToolSession>;
    },
    enabled: isOpen,
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Oracle consultation mutation
  const oracleMutation = useMutation({
    mutationFn: async (params: { query: string; context: string; depth: string }) => {
      const response = await fetch('/api/python/mystical-tools/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to consult Oracle');
      return response.json();
    },
    onSuccess: (data) => {
      setResponses(prev => [...prev, { type: 'oracle', data, timestamp: new Date() }]);
      setOracleQuery("");
      queryClient.invalidateQueries({ queryKey: ['/api/python/mystical-tools/session'] });
      toast({ title: "Oracle consultation complete", description: "Wisdom received through Python interface" });
    },
    onError: (error) => {
      toast({ title: "Oracle consultation failed", description: error.message, variant: "destructive" });
    }
  });

  // Sigil generation mutation
  const sigilMutation = useMutation({
    mutationFn: async (params: { intention: string; style: string; symbolism: string; energyType: string }) => {
      const response = await fetch('/api/python/mystical-tools/sigil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to generate Sigil');
      return response.json();
    },
    onSuccess: (data) => {
      setResponses(prev => [...prev, { type: 'sigil', data, timestamp: new Date() }]);
      setSigilIntention("");
      queryClient.invalidateQueries({ queryKey: ['/api/python/mystical-tools/session'] });
      toast({ title: "Sigil generated", description: "Mystical symbol created through Python interface" });
    },
    onError: (error) => {
      toast({ title: "Sigil generation failed", description: error.message, variant: "destructive" });
    }
  });

  // Sonic Echo generation mutation
  const sonicMutation = useMutation({
    mutationFn: async (params: { text: string; voice: string; style: string; title: string }) => {
      const response = await fetch('/api/python/mystical-tools/sonic-echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to generate Sonic Echo');
      return response.json();
    },
    onSuccess: (data) => {
      setResponses(prev => [...prev, { type: 'sonic', data, timestamp: new Date() }]);
      setSonicText("");
      setSonicTitle("");
      queryClient.invalidateQueries({ queryKey: ['/api/python/mystical-tools/session'] });
      toast({ title: "Sonic Echo generated", description: "Audio resonance created through Python interface" });
    },
    onError: (error) => {
      toast({ title: "Sonic Echo failed", description: error.message, variant: "destructive" });
    }
  });

  const handleOracleConsult = () => {
    if (!oracleQuery.trim()) {
      toast({ title: "Query required", description: "Please enter a question for the Oracle", variant: "destructive" });
      return;
    }
    oracleMutation.mutate({ query: oracleQuery, context: oracleContext, depth: oracleDepth });
  };

  const handleSigilGenerate = () => {
    if (!sigilIntention.trim()) {
      toast({ title: "Intention required", description: "Please enter an intention for the Sigil", variant: "destructive" });
      return;
    }
    sigilMutation.mutate({ 
      intention: sigilIntention, 
      style: sigilStyle, 
      symbolism: sigilSymbolism, 
      energyType: sigilEnergy 
    });
  };

  const handleSonicGenerate = () => {
    if (!sonicText.trim()) {
      toast({ title: "Text required", description: "Please enter text for the Sonic Echo", variant: "destructive" });
      return;
    }
    sonicMutation.mutate({ 
      text: sonicText, 
      voice: sonicVoice, 
      style: sonicStyle, 
      title: sonicTitle || "Python Sonic Echo" 
    });
  };

  const session = sessionQuery.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 border-mystical text-white">
        <DialogHeader className="border-b border-violet-400/30 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-cinzel text-violet-200">
            <Settings className="h-6 w-6" />
            ✦ Mystical Tools Client ✦
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4 h-[70vh]">
          {/* Left Panel - Session Info */}
          <div className="col-span-3 flex flex-col space-y-4">
            {/* Session Status */}
            <Card className="bg-slate-800/50 border-violet-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-violet-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Python Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {session ? (
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-violet-200">Session ID</span>
                      <span className="text-violet-300 font-mono" data-testid="text-session-id">
                        {session.session_id.slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-violet-200">Tools Used</span>
                      <span className="text-violet-300" data-testid="text-tools-count">
                        {session.tools_used.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-violet-200">Requests</span>
                      <span className="text-violet-300" data-testid="text-total-requests">
                        {session.total_requests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-violet-200">Last Activity</span>
                      <span className="text-violet-300">
                        {new Date(session.last_activity).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-violet-300">
                    Connecting to Python session...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tools Used */}
            {session && session.tools_used.length > 0 && (
              <Card className="bg-slate-800/50 border-violet-400/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-violet-300">Active Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {session.tools_used.map((tool, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-violet-400/30">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Context Stack */}
            {session && session.context_stack.length > 0 && (
              <Card className="bg-slate-800/50 border-violet-400/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-violet-300">Context Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-20">
                    <div className="space-y-1">
                      {session.context_stack.map((context, index) => (
                        <div key={index} className="text-xs text-violet-200">
                          {context}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center Panel - Tool Interfaces */}
          <div className="col-span-6 flex flex-col">
            <Tabs defaultValue="oracle" className="flex-1">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                <TabsTrigger value="oracle" className="text-xs flex items-center gap-1" data-testid="tab-oracle">
                  <MessageCircle className="h-3 w-3" />
                  Oracle
                </TabsTrigger>
                <TabsTrigger value="sigil" className="text-xs flex items-center gap-1" data-testid="tab-sigil">
                  <Zap className="h-3 w-3" />
                  Sigil
                </TabsTrigger>
                <TabsTrigger value="sonic" className="text-xs flex items-center gap-1" data-testid="tab-sonic">
                  <Volume2 className="h-3 w-3" />
                  Sonic Echo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="oracle" className="flex-1 mt-4">
                <Card className="bg-slate-800/50 border-violet-400/30 h-full">
                  <CardHeader>
                    <CardTitle className="text-violet-300">Python Oracle Consultation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-violet-200 mb-1 block">Context</Label>
                        <Select value={oracleContext} onValueChange={setOracleContext}>
                          <SelectTrigger className="bg-slate-700/50 border-violet-400/30 text-white h-8" data-testid="select-oracle-context">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-violet-400/30">
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="cosmogenesis">Cosmogenesis</SelectItem>
                            <SelectItem value="psychogenesis">Psychogenesis</SelectItem>
                            <SelectItem value="mystagogy">Mystagogy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-violet-200 mb-1 block">Wisdom Depth</Label>
                        <Select value={oracleDepth} onValueChange={setOracleDepth}>
                          <SelectTrigger className="bg-slate-700/50 border-violet-400/30 text-white h-8" data-testid="select-oracle-depth">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-violet-400/30">
                            <SelectItem value="surface">Surface</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="deep">Deep</SelectItem>
                            <SelectItem value="profound">Profound</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-violet-200 mb-1 block">Your Question</Label>
                      <Textarea
                        value={oracleQuery}
                        onChange={(e) => setOracleQuery(e.target.value)}
                        placeholder="Ask the Python-enhanced Oracle..."
                        className="bg-slate-700/50 border-violet-400/30 text-white resize-none"
                        rows={3}
                        data-testid="textarea-oracle-query"
                      />
                    </div>

                    <Button
                      onClick={handleOracleConsult}
                      disabled={oracleMutation.isPending}
                      className="w-full bg-violet-600 hover:bg-violet-700"
                      data-testid="button-consult-oracle"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {oracleMutation.isPending ? 'Consulting...' : 'Consult Oracle'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sigil" className="flex-1 mt-4">
                <Card className="bg-slate-800/50 border-violet-400/30 h-full">
                  <CardHeader>
                    <CardTitle className="text-violet-300">Python Sigil Generator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs text-violet-200 mb-1 block">Intention</Label>
                      <Input
                        value={sigilIntention}
                        onChange={(e) => setSigilIntention(e.target.value)}
                        placeholder="State your mystical intention..."
                        className="bg-slate-700/50 border-violet-400/30 text-white"
                        data-testid="input-sigil-intention"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-violet-200 mb-1 block">Style</Label>
                        <Select value={sigilStyle} onValueChange={setSigilStyle}>
                          <SelectTrigger className="bg-slate-700/50 border-violet-400/30 text-white h-8" data-testid="select-sigil-style">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-violet-400/30">
                            <SelectItem value="traditional">Traditional</SelectItem>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="geometric">Geometric</SelectItem>
                            <SelectItem value="organic">Organic</SelectItem>
                            <SelectItem value="cosmic">Cosmic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-violet-200 mb-1 block">Symbolism</Label>
                        <Select value={sigilSymbolism} onValueChange={setSigilSymbolism}>
                          <SelectTrigger className="bg-slate-700/50 border-violet-400/30 text-white h-8" data-testid="select-sigil-symbolism">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-violet-400/30">
                            <SelectItem value="hermetic">Hermetic</SelectItem>
                            <SelectItem value="runic">Runic</SelectItem>
                            <SelectItem value="alchemical">Alchemical</SelectItem>
                            <SelectItem value="kabbalistic">Kabbalistic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-violet-200 mb-1 block">Energy</Label>
                        <Select value={sigilEnergy} onValueChange={setSigilEnergy}>
                          <SelectTrigger className="bg-slate-700/50 border-violet-400/30 text-white h-8" data-testid="select-sigil-energy">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-violet-400/30">
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="passive">Passive</SelectItem>
                            <SelectItem value="protective">Protective</SelectItem>
                            <SelectItem value="manifestation">Manifestation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleSigilGenerate}
                      disabled={sigilMutation.isPending}
                      className="w-full bg-violet-600 hover:bg-violet-700"
                      data-testid="button-generate-sigil"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {sigilMutation.isPending ? 'Generating...' : 'Generate Sigil'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sonic" className="flex-1 mt-4">
                <Card className="bg-slate-800/50 border-violet-400/30 h-full">
                  <CardHeader>
                    <CardTitle className="text-violet-300">Python Sonic Echo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs text-violet-200 mb-1 block">Title (Optional)</Label>
                      <Input
                        value={sonicTitle}
                        onChange={(e) => setSonicTitle(e.target.value)}
                        placeholder="Name your sonic creation..."
                        className="bg-slate-700/50 border-violet-400/30 text-white"
                        data-testid="input-sonic-title"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-violet-200 mb-1 block">Text to Transform</Label>
                      <Textarea
                        value={sonicText}
                        onChange={(e) => setSonicText(e.target.value)}
                        placeholder="Enter mystical text for sonic transformation..."
                        className="bg-slate-700/50 border-violet-400/30 text-white resize-none"
                        rows={3}
                        data-testid="textarea-sonic-text"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-violet-200 mb-1 block">Voice</Label>
                        <Select value={sonicVoice} onValueChange={setSonicVoice}>
                          <SelectTrigger className="bg-slate-700/50 border-violet-400/30 text-white h-8" data-testid="select-sonic-voice">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-violet-400/30">
                            <SelectItem value="mystical">Mystical</SelectItem>
                            <SelectItem value="ancient">Ancient</SelectItem>
                            <SelectItem value="ethereal">Ethereal</SelectItem>
                            <SelectItem value="deep">Deep</SelectItem>
                            <SelectItem value="whisper">Whisper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-violet-200 mb-1 block">Style</Label>
                        <Select value={sonicStyle} onValueChange={setSonicStyle}>
                          <SelectTrigger className="bg-slate-700/50 border-violet-400/30 text-white h-8" data-testid="select-sonic-style">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-violet-400/30">
                            <SelectItem value="meditation">Meditation</SelectItem>
                            <SelectItem value="ritual">Ritual</SelectItem>
                            <SelectItem value="incantation">Incantation</SelectItem>
                            <SelectItem value="chant">Chant</SelectItem>
                            <SelectItem value="prayer">Prayer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleSonicGenerate}
                      disabled={sonicMutation.isPending}
                      className="w-full bg-violet-600 hover:bg-violet-700"
                      data-testid="button-generate-sonic"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      {sonicMutation.isPending ? 'Generating...' : 'Generate Sonic Echo'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Results History */}
          <div className="col-span-3 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-violet-300" />
              <h3 className="font-semibold text-violet-300">Recent Results</h3>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {responses.length === 0 ? (
                  <Card className="bg-slate-800/30 border-violet-400/30">
                    <CardContent className="p-4 text-center text-violet-300/50">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No results yet</p>
                      <p className="text-xs mt-1">Use the tools to see Python-enhanced outputs</p>
                    </CardContent>
                  </Card>
                ) : (
                  responses.slice().reverse().map((response, index) => (
                    <Card key={index} className="bg-slate-800/30 border-violet-400/30" data-testid={`card-result-${index}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${
                            response.type === 'oracle' ? 'bg-blue-600' :
                            response.type === 'sigil' ? 'bg-purple-600' : 'bg-green-600'
                          }`}>
                            {response.type}
                          </Badge>
                          <span className="text-xs text-violet-300">
                            {response.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-xs text-violet-200">
                          {response.type === 'oracle' && response.data.response && (
                            <div className="line-clamp-4">{response.data.response}</div>
                          )}
                          {response.type === 'sigil' && response.data.description && (
                            <div className="line-clamp-4">{response.data.description}</div>
                          )}
                          {response.type === 'sonic' && response.data.title && (
                            <div>Audio: {response.data.title}</div>
                          )}
                          {response.data.raw && (
                            <div className="line-clamp-4 font-mono">{response.data.output}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-violet-400/30">
          <div className="text-sm text-violet-300">
            Enhanced Mystical Tools • Python-Powered • Session-Aware
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-violet-400/30 hover:bg-violet-700/30"
            data-testid="button-close-mystical-tools"
          >
            Close Tools Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}