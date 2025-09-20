import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Volume2, Download, Play, Pause, Trash2, X, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SonicEchoRequest, SonicEchoResponse, SonicEcho } from "@shared/schema";

const sonicEchoFormSchema = z.object({
  text: z.string().min(1, "Text is required").max(4000, "Text must be less than 4000 characters"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  voice: z.string().optional(),
  style: z.string().optional(),
});

type SonicEchoFormData = z.infer<typeof sonicEchoFormSchema>;

interface SonicEchoGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SonicEchoGenerator({ isOpen, onClose }: SonicEchoGeneratorProps) {
  const [generatedEcho, setGeneratedEcho] = useState<SonicEchoResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const form = useForm<SonicEchoFormData>({
    resolver: zodResolver(sonicEchoFormSchema),
    defaultValues: {
      text: "",
      title: "",
      voice: "mystical",
      style: "meditative",
    },
  });

  // Fetch existing sonic echoes
  const { data: existingEchoes = [], refetch: refetchEchoes } = useQuery<SonicEcho[]>({
    queryKey: ["/api/sonic-echo/list"],
    enabled: isOpen,
  });

  const generateMutation = useMutation({
    mutationFn: async (data: SonicEchoRequest) => {
      const response = await apiRequest("POST", "/api/sonic-echo/generate", data);
      return await response.json() as SonicEchoResponse;
    },
    onSuccess: (data) => {
      setGeneratedEcho(data);
      refetchEchoes();
      toast({ 
        title: "Sonic Echo Created", 
        description: "Your mystical sonic echo has been generated successfully" 
      });
    },
    onError: (error) => {
      console.error("Sonic echo generation error:", error);
      toast({ 
        title: "Echo Creation Failed", 
        description: "The sonic energies are currently disrupted. Please try again.", 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/sonic-echo/${id}`);
    },
    onSuccess: () => {
      refetchEchoes();
      toast({ title: "Echo Deleted", description: "Sonic echo has been removed" });
    },
    onError: () => {
      toast({ title: "Delete Failed", description: "Unable to delete sonic echo", variant: "destructive" });
    },
  });

  const onSubmit = (data: SonicEchoFormData) => {
    const echoRequest: SonicEchoRequest = {
      text: data.text,
      title: data.title,
      voice: data.voice || "mystical",
      style: data.style || "meditative",
      sourceType: "custom_text",
    };
    generateMutation.mutate(echoRequest);
  };

  const handleClose = () => {
    setGeneratedEcho(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    form.reset();
    onClose();
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => toast({ title: "Playback Error", description: "Unable to play audio", variant: "destructive" }));
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const downloadAudio = (audioUrl: string, title: string) => {
    try {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: "Downloaded", description: "Sonic echo saved to your device" });
    } catch (error) {
      toast({ title: "Download Failed", description: "Unable to download audio", variant: "destructive" });
    }
  };

  const resetGenerator = () => {
    setGeneratedEcho(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-2xl text-primary flex items-center">
            <Volume2 className="h-6 w-6 mr-2" />
            ⟡ Sonic Echo Generator ⟡
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generation Form */}
          <div className="space-y-6">
            {!generatedEcho ? (
              <>
                <div className="text-center text-muted-foreground">
                  <p className="italic">Transform text into mystical spoken echoes</p>
                  <p className="text-sm mt-1">Channel ancient wisdom through sacred voice</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-cinzel text-primary">Echo Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Name your sonic echo..."
                              className="mystical-border"
                              {...field}
                              data-testid="input-echo-title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-cinzel text-primary">Text to Echo</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter the text you wish to transform into a mystical sonic echo... (passages from codex entries, personal incantations, ritual texts, etc.)"
                              className="min-h-[120px] mystical-border"
                              {...field}
                              data-testid="textarea-echo-text"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="voice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-cinzel text-primary">Mystical Voice</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-voice">
                                  <SelectValue placeholder="Choose voice" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mystical">Mystical (Deep & Resonant)</SelectItem>
                                <SelectItem value="ethereal">Ethereal (Light & Airy)</SelectItem>
                                <SelectItem value="ancient">Ancient (Echo & Wisdom)</SelectItem>
                                <SelectItem value="whisper">Whisper (Soft & Secret)</SelectItem>
                                <SelectItem value="commanding">Commanding (Strong & Clear)</SelectItem>
                                <SelectItem value="sage">Sage (Warm & Knowing)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="style"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-cinzel text-primary">Speaking Style</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-style">
                                  <SelectValue placeholder="Choose style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="meditative">Meditative</SelectItem>
                                <SelectItem value="ceremonial">Ceremonial</SelectItem>
                                <SelectItem value="incantation">Incantation</SelectItem>
                                <SelectItem value="whispered">Whispered</SelectItem>
                                <SelectItem value="prophetic">Prophetic</SelectItem>
                                <SelectItem value="dramatic">Dramatic</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-center pt-4">
                      <Button
                        type="submit"
                        disabled={generateMutation.isPending}
                        className="mystical-border oracle-glow font-cinzel font-semibold px-8 py-3"
                        data-testid="button-generate-echo"
                      >
                        {generateMutation.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Channeling Voice...
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-5 w-5 mr-2" />
                            Generate Sonic Echo
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="font-cinzel text-xl text-primary text-center">Your Sonic Echo</h3>
                
                <Card className="mystical-border">
                  <CardHeader>
                    <CardTitle className="font-cinzel text-lg text-primary flex items-center justify-between">
                      <span data-testid="text-echo-title">{generatedEcho.title}</span>
                      <Badge variant="outline" className="text-primary border-primary">
                        {generatedEcho.voice}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      {!isPlaying ? (
                        <Button
                          onClick={() => playAudio(generatedEcho.audioUrl)}
                          className="mystical-border font-cinzel"
                          data-testid="button-play-echo"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play Echo
                        </Button>
                      ) : (
                        <Button
                          onClick={pauseAudio}
                          className="mystical-border font-cinzel"
                          data-testid="button-pause-echo"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => downloadAudio(generatedEcho.audioUrl, generatedEcho.title)}
                        data-testid="button-download-echo"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {generatedEcho.duration && (
                      <div className="text-center text-sm text-muted-foreground">
                        Duration: ~{generatedEcho.duration} seconds
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-center space-x-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetGenerator}
                    className="font-cinzel"
                    data-testid="button-create-another-echo"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    Create Another
                  </Button>
                  <Button
                    onClick={handleClose}
                    className="mystical-border font-cinzel"
                    data-testid="button-close-echo"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Echoes */}
          <div className="space-y-4">
            <h3 className="font-cinzel text-lg text-primary">Your Echo Archive</h3>
            <ScrollArea className="h-[500px] mystical-border rounded-lg p-4">
              {existingEchoes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Volume2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No sonic echoes yet</p>
                  <p className="text-sm">Generate your first mystical echo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {existingEchoes.map((echo) => (
                    <Card key={echo.id} className="mystical-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-cinzel text-primary font-semibold" data-testid={`text-archive-title-${echo.id}`}>
                            {echo.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {echo.voice}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteMutation.mutate(echo.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${echo.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {echo.sourceText}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            onClick={() => echo.audioUrl && playAudio(echo.audioUrl)}
                            className="mystical-border font-cinzel text-xs"
                            disabled={!echo.audioUrl}
                            data-testid={`button-play-archive-${echo.id}`}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Play
                          </Button>
                          
                          {echo.duration && (
                            <span className="text-xs text-muted-foreground">
                              ~{echo.duration}s
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
        />
      </DialogContent>
    </Dialog>
  );
}