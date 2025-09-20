import { useState } from "react";
import { X, Eye, Loader2, Scroll } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type OracleRequest, type OracleResponse } from "@shared/schema";

interface OracleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OracleModal({ isOpen, onClose }: OracleModalProps) {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [response, setResponse] = useState<string | null>(null);

  const oracleMutation = useMutation({
    mutationFn: async (request: OracleRequest) => {
      const res = await apiRequest("POST", "/api/oracle/consult", request);
      return res.json() as Promise<OracleResponse>;
    },
    onSuccess: (data) => {
      setResponse(data.response);
    },
    onError: (error) => {
      console.error("Oracle consultation failed:", error);
      setResponse("The Oracle is currently in deep meditation. Please try again later.");
    },
  });

  const handleConsult = () => {
    if (!query.trim()) return;
    
    setResponse(null);
    oracleMutation.mutate({
      query: query.trim(),
      context: context || undefined,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    setQuery("");
    setContext("");
    setResponse(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 overflow-hidden"
      onClick={handleBackdropClick}
      data-testid="modal-oracle"
    >
      <div className="mystical-border mystical-glow rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
        <header className="flex-shrink-0 mystical-border border-l-0 border-r-0 border-t-0 p-6 flex items-center justify-between bg-card/95 backdrop-blur-sm">
          <h2 className="font-cinzel text-xl font-bold text-primary">
            <Eye className="inline h-5 w-5 mr-2" />
            Oracle of Hidden Knowing
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground text-xl"
            data-testid="button-close-oracle"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6" style={{maxHeight: 'calc(80vh - 100px)'}}>
          <div className="mb-6">
            <Label htmlFor="oracle-query" className="block text-sm font-medium text-foreground mb-2">
              Pose your question to the Oracle:
            </Label>
            <Textarea
              id="oracle-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-input border-border rounded-lg p-4 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
              placeholder="What wisdom do you seek from the hidden knowledge?"
              rows={4}
              data-testid="textarea-oracle-query"
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="oracle-context" className="block text-sm font-medium text-foreground mb-2">
              Context (optional):
            </Label>
            <Select value={context} onValueChange={setContext}>
              <SelectTrigger className="w-full bg-input border-border" data-testid="select-oracle-context">
                <SelectValue placeholder="General wisdom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General wisdom</SelectItem>
                <SelectItem value="cosmogenesis">Cosmogenesis & Creation</SelectItem>
                <SelectItem value="psychogenesis">Soul & Consciousness</SelectItem>
                <SelectItem value="mystagogy">Spiritual Return</SelectItem>
                <SelectItem value="climbing-systems">Spiritual Practices</SelectItem>
                <SelectItem value="archetypal-structures">Universal Patterns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleConsult}
            disabled={!query.trim() || oracleMutation.isPending}
            className="w-full mystical-border oracle-glow font-cinzel font-semibold text-primary hover:bg-accent/10 bg-transparent border-border"
            data-testid="button-consult-oracle"
          >
            {oracleMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Consulting...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Consult the Oracle
              </>
            )}
          </Button>

          {/* Oracle Response */}
          {(response || oracleMutation.isPending) && (
            <div className="mt-6">
              <div className="divider mb-6"></div>
              <h3 className="font-cinzel text-lg font-semibold text-primary mb-4">
                <Scroll className="inline h-4 w-4 mr-2" />
                The Oracle Speaks:
              </h3>
              <div className="mystical-border rounded-lg p-6" data-testid="section-oracle-response">
                {oracleMutation.isPending ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="loading-spinner mr-3"></div>
                    <span className="text-muted-foreground italic">The Oracle contemplates your query...</span>
                  </div>
                ) : (
                  <div className="prose prose-amber max-w-none text-foreground leading-relaxed">
                    <div className="whitespace-pre-wrap">
                      {response}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {oracleMutation.isError && (
            <div className="mt-4 p-4 mystical-border rounded-lg border-destructive/50">
              <p className="text-destructive text-sm">
                The Oracle encounters interference from the astral planes. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
