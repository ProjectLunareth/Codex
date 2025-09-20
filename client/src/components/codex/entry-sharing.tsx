import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Share2, Plus, Copy, Trash2, ExternalLink, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { type Share } from "@shared/schema";

interface EntrySharingProps {
  entryId: string;
  entryTitle: string;
}

export default function EntrySharing({ entryId, entryTitle }: EntrySharingProps) {
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const { toast } = useToast();

  // Fetch shares for this entry
  const { data: shares = [], isLoading } = useQuery<Share[]>({
    queryKey: ["/api/shares", entryId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/shares?targetType=entry&targetId=${entryId}`);
      return response.json();
    }
  });

  // Create share mutation
  const createShareMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/shares", {
        targetType: "entry",
        targetId: entryId
      });
      return response.json();
    },
    onSuccess: (newShare) => {
      toast({
        title: "Success",
        description: "Share link created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shares", entryId] });
      setIsCreatingShare(false);
      
      // Copy to clipboard
      const shareUrl = `${window.location.origin}/shared/${(newShare as any).shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied to clipboard",
        description: "Share link has been copied to your clipboard"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create share link",
        variant: "destructive"
      });
    }
  });

  // Delete share mutation
  const deleteShareMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/shares/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Share link deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shares", entryId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to delete share link",
        variant: "destructive"
      });
    }
  });

  const copyShareLink = async (shareToken: string) => {
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied to clipboard",
        description: "Share link has been copied to your clipboard"
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const truncateToken = (token: string) => {
    return token.length > 12 ? `${token.slice(0, 8)}...${token.slice(-4)}` : token;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          <h3 className="font-cinzel text-lg font-semibold">
            Sharing
          </h3>
          <Badge variant="outline">{shares.length}</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreatingShare(true)}
          disabled={isCreatingShare || createShareMutation.isPending}
          data-testid="button-create-share"
        >
          <Plus className="h-4 w-4 mr-1" />
          {createShareMutation.isPending ? "Creating..." : "Create Share Link"}
        </Button>
      </div>

      {/* Create Share Confirmation */}
      {isCreatingShare && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-2">Create Share Link</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This will generate a read-only link that allows anyone to view "{entryTitle}" 
                  without needing access to your account. The link will be automatically copied to your clipboard.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => createShareMutation.mutate()}
                    disabled={createShareMutation.isPending}
                    data-testid="button-confirm-create-share"
                  >
                    {createShareMutation.isPending ? "Creating..." : "Create Share Link"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCreatingShare(false)}
                    data-testid="button-cancel-create-share"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Shares List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : shares.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                No share links created yet. Create a share link to give others read-only access to "{entryTitle}".
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-3 pr-4">
              {shares.map((share) => (
                <Card key={share.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Share Link Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">Share Link</span>
                          <Badge variant="secondary" className="text-xs">
                            Read-only
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Created {formatDate(share.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Share URL */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={`${window.location.origin}/shared/${share.shareToken}`}
                            readOnly
                            className="font-mono text-xs bg-muted/30"
                            data-testid={`input-share-url-${share.id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyShareLink(share.shareToken)}
                            data-testid={`button-copy-share-${share.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteShareMutation.mutate(share.id)}
                            disabled={deleteShareMutation.isPending}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-share-${share.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Token: {truncateToken(share.shareToken)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/shared/${share.shareToken}`, '_blank')}
                            className="h-auto p-1 text-xs"
                            data-testid={`button-open-share-${share.id}`}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {shares.length > 0 && (
        <div className="text-center text-xs text-muted-foreground pt-2">
          {shares.length} active share link{shares.length !== 1 ? 's' : ''} for "{entryTitle}"
        </div>
      )}

      {/* Info Box */}
      <Card className="bg-muted/20 border-muted">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Share2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Share links are read-only</strong> - Recipients can view the entry but cannot edit or annotate.</p>
              <p><strong>Links never expire</strong> - Share links remain active until manually deleted.</p>
              <p><strong>No authentication required</strong> - Anyone with the link can access the entry.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}