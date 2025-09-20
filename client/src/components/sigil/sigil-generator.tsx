import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Download, Copy, Wand2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import type { SigilRequest, SigilResponse } from "@shared/schema";

const sigilFormSchema = z.object({
  intention: z.string().min(1, "Intention is required").max(500, "Intention must be less than 500 characters"),
  style: z.string().optional(),
  symbolism: z.string().optional(),
  energyType: z.string().optional(),
});

type SigilFormData = z.infer<typeof sigilFormSchema>;

interface SigilGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SigilGenerator({ isOpen, onClose }: SigilGeneratorProps) {
  const [generatedSigil, setGeneratedSigil] = useState<SigilResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<SigilFormData>({
    resolver: zodResolver(sigilFormSchema),
    defaultValues: {
      intention: "",
      style: "traditional",
      symbolism: "hermetic",
      energyType: "balanced",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: SigilRequest) => {
      const response = await apiRequest("POST", "/api/sigil/generate", data);
      return await response.json() as SigilResponse;
    },
    onSuccess: (data) => {
      setGeneratedSigil(data);
      toast({ 
        title: "Sigil Generated", 
        description: "Your mystical sigil has been created successfully" 
      });
    },
    onError: (error) => {
      console.error("Sigil generation error:", error);
      toast({ 
        title: "Generation Failed", 
        description: "The mystical energies are currently unstable. Please try again.", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: SigilFormData) => {
    const sigilRequest: SigilRequest = {
      intention: data.intention,
      style: data.style || "traditional",
      symbolism: data.symbolism || "hermetic",
      energyType: data.energyType || "balanced",
    };
    generateMutation.mutate(sigilRequest);
  };

  const handleClose = () => {
    setGeneratedSigil(null);
    form.reset();
    onClose();
  };

  const copyImageUrl = async () => {
    if (generatedSigil?.imageUrl) {
      try {
        await navigator.clipboard.writeText(generatedSigil.imageUrl);
        toast({ title: "Copied", description: "Image URL copied to clipboard" });
      } catch (error) {
        toast({ title: "Copy Failed", description: "Unable to copy to clipboard", variant: "destructive" });
      }
    }
  };

  const downloadImage = async () => {
    if (generatedSigil?.imageUrl) {
      try {
        const response = await fetch(generatedSigil.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sigil-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: "Downloaded", description: "Sigil saved to your device" });
      } catch (error) {
        toast({ title: "Download Failed", description: "Unable to download image", variant: "destructive" });
      }
    }
  };

  const resetGenerator = () => {
    setGeneratedSigil(null);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="flex-shrink-0 p-6 pb-2">
          <DialogTitle className="font-cinzel text-2xl text-primary flex items-center">
            <Wand2 className="h-6 w-6 mr-2" />
            ✦ Mystical Sigil Generator ✦
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6" style={{maxHeight: 'calc(90vh - 120px)'}}>
          {!generatedSigil ? (
          <div className="space-y-6">
            <div className="text-center text-muted-foreground">
              <p className="italic">Channel your intention into sacred geometry</p>
              <p className="text-sm mt-1">Focus your mind and speak your deepest desire</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="intention"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-cinzel text-primary">Your Sacred Intention</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="State your intention clearly and with focused will... (e.g., 'Manifest abundance and prosperity', 'Protection from negative energies', 'Enhance psychic abilities')"
                          className="min-h-[100px] mystical-border"
                          {...field}
                          data-testid="textarea-intention"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-cinzel text-primary">Mystical Style</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-style">
                              <SelectValue placeholder="Choose style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="traditional">Traditional</SelectItem>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="gothic">Gothic</SelectItem>
                            <SelectItem value="celtic">Celtic</SelectItem>
                            <SelectItem value="egyptian">Egyptian</SelectItem>
                            <SelectItem value="norse">Norse</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="symbolism"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-cinzel text-primary">Symbolic Tradition</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-symbolism">
                              <SelectValue placeholder="Choose tradition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hermetic">Hermetic</SelectItem>
                            <SelectItem value="kabbalistic">Kabbalistic</SelectItem>
                            <SelectItem value="alchemical">Alchemical</SelectItem>
                            <SelectItem value="astrological">Astrological</SelectItem>
                            <SelectItem value="runic">Runic</SelectItem>
                            <SelectItem value="elemental">Elemental</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="energyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-cinzel text-primary">Energy Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-energy">
                              <SelectValue placeholder="Choose energy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="protective">Protective</SelectItem>
                            <SelectItem value="manifesting">Manifesting</SelectItem>
                            <SelectItem value="healing">Healing</SelectItem>
                            <SelectItem value="transformative">Transformative</SelectItem>
                            <SelectItem value="empowering">Empowering</SelectItem>
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
                    data-testid="button-generate-sigil"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Channeling Energies...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate Sacred Sigil
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Generated Sigil Display */}
            <div className="text-center">
              <h3 className="font-cinzel text-xl text-primary mb-4">Your Sacred Sigil</h3>
              <div className="relative mx-auto max-w-md">
                <img
                  src={generatedSigil.imageUrl}
                  alt="Generated Mystical Sigil"
                  className="w-full h-auto border-2 border-primary rounded-lg shadow-lg bg-card"
                  data-testid="image-sigil"
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyImageUrl}
                    className="bg-background/80 backdrop-blur"
                    data-testid="button-copy-url"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadImage}
                    className="bg-background/80 backdrop-blur"
                    data-testid="button-download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sigil Information */}
            <div className="grid gap-6">
              <Card className="mystical-border">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg text-primary">Symbolic Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed" data-testid="text-description">
                    {generatedSigil.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="mystical-border">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg text-primary">Mystical Meaning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed" data-testid="text-meaning">
                    {generatedSigil.symbolicMeaning}
                  </p>
                </CardContent>
              </Card>

              <Card className="mystical-border">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg text-primary">Usage Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {generatedSigil.usageGuidance.map((guidance, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-foreground" data-testid={`text-guidance-${index}`}>
                          {guidance}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={resetGenerator}
                className="font-cinzel"
                data-testid="button-create-another"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Create Another
              </Button>
              <Button
                onClick={handleClose}
                className="mystical-border font-cinzel"
                data-testid="button-close"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}