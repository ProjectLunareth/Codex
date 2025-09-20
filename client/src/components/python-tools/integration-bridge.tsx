import { useState, useEffect } from "react";
import { Network, RefreshCw, Download, Upload, Activity, Server, Database, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BridgeStatus {
  status: string;
  react_connection: boolean;
  python_connection: boolean;
  last_sync: string;
  pending_operations: number;
  sync_conflicts: number;
  uptime: number;
}

interface BridgeMetrics {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  avg_sync_time: number;
  data_transferred: number;
  last_export: string;
  active_bridges: number;
}

interface SyncOperation {
  id: string;
  type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  progress: number;
  items_processed: number;
  total_items: number;
  error_message?: string;
}

interface IntegrationBridgeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntegrationBridge({ isOpen, onClose }: IntegrationBridgeProps) {
  const [syncDirection, setSyncDirection] = useState("bidirectional");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState("json");
  const [includeBookmarks, setIncludeBookmarks] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [currentOperations, setCurrentOperations] = useState<SyncOperation[]>([]);

  const { toast } = useToast();

  // Query for bridge status
  const statusQuery = useQuery({
    queryKey: ['/api/python/integration-bridge/status'],
    queryFn: async () => {
      const response = await fetch('/api/python/integration-bridge/status');
      if (!response.ok) throw new Error('Failed to get bridge status');
      return response.json() as Promise<BridgeStatus>;
    },
    enabled: isOpen,
    refetchInterval: 3000 // Refresh every 3 seconds
  });

  // Query for bridge metrics
  const metricsQuery = useQuery({
    queryKey: ['/api/python/integration-bridge/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/python/integration-bridge/metrics');
      if (!response.ok) throw new Error('Failed to get bridge metrics');
      return response.json() as Promise<BridgeMetrics>;
    },
    enabled: isOpen,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Query for collections list
  const collectionsQuery = useQuery({
    queryKey: ['/api/collections'],
    queryFn: async () => {
      const response = await fetch('/api/collections');
      if (!response.ok) throw new Error('Failed to get collections');
      return response.json();
    },
    enabled: isOpen
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async (params: { direction: string; collections: string[]; force: boolean }) => {
      const response = await fetch('/api/python/integration-bridge/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to start synchronization');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/python/integration-bridge/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/python/integration-bridge/metrics'] });
      toast({ title: "Synchronization started", description: "Data sync operation initiated" });
      
      // Add operation to current operations
      const newOperation: SyncOperation = {
        id: data.operation_id || `sync_${Date.now()}`,
        type: 'sync',
        status: 'running',
        started_at: new Date().toISOString(),
        progress: 0,
        items_processed: 0,
        total_items: data.total_items || 0
      };
      setCurrentOperations(prev => [...prev, newOperation]);
    },
    onError: (error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (params: { format: string; includeBookmarks: boolean; entryIds?: string[] }) => {
      const response = await fetch('/api/python/integration-bridge/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to export data');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/python/integration-bridge/metrics'] });
      toast({ title: "Export complete", description: "Data exported successfully" });
      
      // Trigger download if data is available
      if (data.download_url) {
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = `mystical-export-${Date.now()}.${exportFormat}`;
        link.click();
      }
    },
    onError: (error) => {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    }
  });

  const handleSync = (force = false) => {
    syncMutation.mutate({
      direction: syncDirection,
      collections: selectedCollections,
      force
    });
  };

  const handleExport = () => {
    exportMutation.mutate({
      format: exportFormat,
      includeBookmarks,
      entryIds: selectedCollections.length > 0 ? selectedCollections : undefined
    });
  };

  const status = statusQuery.data;
  const metrics = metricsQuery.data;
  const collections = collectionsQuery.data || [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Clock;
    }
  };

  const StatusIcon = status ? getStatusIcon(status.status) : Clock;

  // Simulate operation progress updates
  useEffect(() => {
    if (currentOperations.length > 0) {
      const interval = setInterval(() => {
        setCurrentOperations(prev => 
          prev.map(op => {
            if (op.status === 'running' && op.progress < 100) {
              const newProgress = Math.min(op.progress + Math.random() * 20, 100);
              const isComplete = newProgress >= 100;
              return {
                ...op,
                progress: newProgress,
                items_processed: Math.floor((newProgress / 100) * op.total_items),
                status: isComplete ? 'completed' : 'running',
                completed_at: isComplete ? new Date().toISOString() : undefined
              };
            }
            return op;
          })
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentOperations]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-mystical text-white">
        <DialogHeader className="border-b border-blue-400/30 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-cinzel text-blue-200">
            <Network className="h-6 w-6" />
            ✦ Mystical Integration Bridge ✦
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4 h-[70vh]">
          {/* Left Panel - Status & Controls */}
          <div className="col-span-4 flex flex-col space-y-4">
            {/* Bridge Status */}
            <Card className="bg-slate-800/50 border-blue-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${getStatusColor(status?.status)}`} />
                  Bridge Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {status ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-200">Overall Status</span>
                      <Badge className={`text-xs ${
                        status.status === 'healthy' ? 'bg-green-600' :
                        status.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                      }`} data-testid="badge-bridge-status">
                        {status.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-200">React Connection</span>
                      <div className={`w-3 h-3 rounded-full ${status.react_connection ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-200">Python Connection</span>
                      <div className={`w-3 h-3 rounded-full ${status.python_connection ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-200">Last Sync</span>
                      <span className="text-blue-300" data-testid="text-last-sync">
                        {status.last_sync ? new Date(status.last_sync).toLocaleTimeString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-200">Pending Ops</span>
                      <span className="text-blue-300" data-testid="text-pending-ops">{status.pending_operations}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-200">Conflicts</span>
                      <span className="text-blue-300">{status.sync_conflicts}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-200">Uptime</span>
                      <span className="text-blue-300">{Math.floor(status.uptime / 60)}m</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-blue-300">
                    Checking bridge status...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sync Controls */}
            <Card className="bg-slate-800/50 border-blue-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Synchronization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-blue-200 mb-1 block">Sync Direction</Label>
                  <Select value={syncDirection} onValueChange={setSyncDirection}>
                    <SelectTrigger className="bg-slate-700/50 border-blue-400/30 text-white h-8" data-testid="select-sync-direction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-blue-400/30">
                      <SelectItem value="bidirectional">Bidirectional</SelectItem>
                      <SelectItem value="react-to-python">React → Python</SelectItem>
                      <SelectItem value="python-to-react">Python → React</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-blue-200 mb-1 block">Collections</Label>
                  <Select 
                    value={selectedCollections.length > 0 ? selectedCollections.join(',') : "all"} 
                    onValueChange={(value) => setSelectedCollections(value === "all" ? [] : (value ? value.split(',') : []))}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-blue-400/30 text-white h-8" data-testid="select-collections">
                      <SelectValue placeholder="All collections" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-blue-400/30">
                      <SelectItem value="all">All Collections</SelectItem>
                      {collections.map((collection: any) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={autoSync}
                    onCheckedChange={setAutoSync}
                    data-testid="switch-auto-sync"
                  />
                  <Label className="text-xs text-blue-200">Auto-sync enabled</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSync(false)}
                    disabled={syncMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                    data-testid="button-sync"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
                  <Button
                    onClick={() => handleSync(true)}
                    disabled={syncMutation.isPending}
                    variant="outline"
                    className="flex-1 border-blue-400/30 hover:bg-blue-700/30 text-xs"
                    data-testid="button-force-sync"
                  >
                    Force
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export Controls */}
            <Card className="bg-slate-800/50 border-blue-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Data Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-blue-200 mb-1 block">Format</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger className="bg-slate-700/50 border-blue-400/30 text-white h-8" data-testid="select-export-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-blue-400/30">
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="yaml">YAML</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={includeBookmarks}
                        onCheckedChange={setIncludeBookmarks}
                        data-testid="switch-include-bookmarks"
                      />
                      <Label className="text-xs text-blue-200">Bookmarks</Label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                  data-testid="button-export"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {exportMutation.isPending ? 'Exporting...' : 'Export Data'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Operations & Metrics */}
          <div className="col-span-5 flex flex-col">
            <Tabs defaultValue="operations" className="flex-1">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                <TabsTrigger value="operations" className="text-xs" data-testid="tab-operations">Operations</TabsTrigger>
                <TabsTrigger value="metrics" className="text-xs" data-testid="tab-metrics">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="operations" className="flex-1 mt-4">
                <Card className="bg-slate-800/50 border-blue-400/30 h-full">
                  <CardHeader>
                    <CardTitle className="text-blue-300 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Active Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      {currentOperations.length === 0 ? (
                        <div className="text-center py-8 text-blue-300/50">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No active operations</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentOperations.map((operation) => (
                            <Card key={operation.id} className="bg-slate-700/30 border-blue-400/20" data-testid={`card-operation-${operation.id}`}>
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge className={`text-xs ${
                                      operation.status === 'completed' ? 'bg-green-600' :
                                      operation.status === 'running' ? 'bg-blue-600' : 'bg-red-600'
                                    }`}>
                                      {operation.type}
                                    </Badge>
                                    <span className="text-xs text-blue-200">
                                      {operation.status}
                                    </span>
                                  </div>
                                  <span className="text-xs text-blue-300">
                                    {new Date(operation.started_at).toLocaleTimeString()}
                                  </span>
                                </div>
                                
                                {operation.status === 'running' && (
                                  <div className="space-y-1">
                                    <Progress value={operation.progress} className="h-2" />
                                    <div className="flex justify-between text-xs text-blue-300">
                                      <span>{operation.items_processed} / {operation.total_items} items</span>
                                      <span>{operation.progress.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                )}

                                {operation.error_message && (
                                  <div className="text-xs text-red-400 mt-2">
                                    Error: {operation.error_message}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="flex-1 mt-4">
                <Card className="bg-slate-800/50 border-blue-400/30 h-full">
                  <CardHeader>
                    <CardTitle className="text-blue-300 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Bridge Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-300" data-testid="text-total-syncs">
                              {metrics.total_syncs}
                            </div>
                            <div className="text-xs text-blue-200">Total Syncs</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400" data-testid="text-successful-syncs">
                              {metrics.successful_syncs}
                            </div>
                            <div className="text-xs text-blue-200">Successful</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-400" data-testid="text-failed-syncs">
                              {metrics.failed_syncs}
                            </div>
                            <div className="text-xs text-blue-200">Failed</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-300">
                              {metrics.avg_sync_time.toFixed(1)}s
                            </div>
                            <div className="text-xs text-blue-200">Avg Sync Time</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">
                              {(metrics.data_transferred / 1024).toFixed(1)}KB
                            </div>
                            <div className="text-xs text-blue-200">Data Transferred</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400" data-testid="text-active-bridges">
                              {metrics.active_bridges}
                            </div>
                            <div className="text-xs text-blue-200">Active Bridges</div>
                          </div>
                        </div>
                        
                        <div className="col-span-2 mt-4 pt-4 border-t border-blue-400/20">
                          <div className="text-xs text-blue-200 space-y-1">
                            <div className="flex justify-between">
                              <span>Success Rate</span>
                              <span className="text-green-400">
                                {metrics.total_syncs > 0 ? ((metrics.successful_syncs / metrics.total_syncs) * 100).toFixed(1) : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Export</span>
                              <span className="text-blue-300">
                                {metrics.last_export ? new Date(metrics.last_export).toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-blue-300">
                        Loading bridge metrics...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Connection Info */}
          <div className="col-span-3 flex flex-col space-y-4">
            <Card className="bg-slate-800/50 border-blue-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  System Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-200">React Build</span>
                  <Badge variant="outline" className="text-xs border-blue-400/30">Development</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Python Version</span>
                  <span className="text-blue-300">3.11.13</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Node.js Version</span>
                  <span className="text-blue-300">v20.x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Bridge Protocol</span>
                  <span className="text-blue-300">HTTP/REST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">API Endpoints</span>
                  <span className="text-blue-300">15 active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-blue-400/30 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-300">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-blue-200">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>Bridge status checked</span>
                      <span className="text-blue-300 ml-auto">now</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span>Metrics updated</span>
                      <span className="text-blue-300 ml-auto">5s ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span>Collections synced</span>
                      <span className="text-blue-300 ml-auto">2m ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      <span>Export completed</span>
                      <span className="text-blue-300 ml-auto">15m ago</span>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-blue-400/30">
          <div className="text-sm text-blue-300">
            Integration Bridge • React ↔ Python • Real-time Synchronization
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-blue-400/30 hover:bg-blue-700/30"
            data-testid="button-close-bridge"
          >
            Close Bridge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}