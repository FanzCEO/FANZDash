import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Server,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  HardDrive,
  MemoryStick,
  Users,
  Zap,
  Globe,
  Radio,
  Shield,
  Database,
  Cloud,
  Smartphone,
  Bot,
  Eye,
  Lock,
  RefreshCw,
  Send,
  Terminal
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  type: string;
  url: string;
  status: "online" | "offline" | "degraded" | "maintenance";
  lastHeartbeat: string;
  connectedAt: string;
  version: string;
  capabilities: string[];
  metrics: {
    activeUsers: number;
    requestsPerMinute: number;
    avgResponseTime: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage?: number;
    bandwidth?: number;
  };
}

interface CommandCenterStatus {
  status: string;
  version: string;
  uptime: number;
  timestamp: string;
  metrics: {
    totalActiveUsers: number;
    totalRequestsPerMinute: number;
    avgErrorRate: number;
    avgResponseTime: number;
    platformCount: number;
    onlinePlatforms: number;
    degradedPlatforms: number;
    offlinePlatforms: number;
  };
}

interface PlatformEvent {
  id: string;
  platformId: string;
  type: string;
  category: string;
  message: string;
  timestamp: string;
}

const API_KEY = "fanz_cc_master_key_2025_secure";

const platformTypeIcons: Record<string, any> = {
  "main-website": Globe,
  "creator-portal": Users,
  "admin-panel": Shield,
  "mobile-app": Smartphone,
  "streaming-service": Radio,
  "payment-gateway": Database,
  "cdn-node": Cloud,
  "analytics-engine": Eye,
  "moderation-ai": Bot,
  "custom": Lock
};

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  offline: "bg-red-500",
  degraded: "bg-yellow-500",
  maintenance: "bg-blue-500"
};

const statusBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  online: "default",
  offline: "destructive",
  degraded: "secondary",
  maintenance: "outline"
};

export default function CommandCenterDashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState<PlatformEvent[]>([]);

  // Fetch command center status
  const { data: status, refetch: refetchStatus } = useQuery<CommandCenterStatus>({
    queryKey: ["command-center-status"],
    queryFn: async () => {
      const res = await fetch("/api/command-center/status", {
        headers: { "X-Command-Center-Key": API_KEY }
      });
      const data = await res.json();
      return data.data;
    },
    refetchInterval: 5000
  });

  // Fetch platforms
  const { data: platformsData, refetch: refetchPlatforms } = useQuery<{ platforms: Platform[] }>({
    queryKey: ["command-center-platforms"],
    queryFn: async () => {
      const res = await fetch("/api/command-center/platforms", {
        headers: { "X-Command-Center-Key": API_KEY }
      });
      const data = await res.json();
      return data.data;
    },
    refetchInterval: 10000
  });

  // Fetch events
  const { data: eventsData } = useQuery<{ events: PlatformEvent[] }>({
    queryKey: ["command-center-events"],
    queryFn: async () => {
      const res = await fetch("/api/command-center/events?limit=50", {
        headers: { "X-Command-Center-Key": API_KEY }
      });
      const data = await res.json();
      return data.data;
    },
    refetchInterval: 15000
  });

  const platforms = platformsData?.platforms || [];
  const events = eventsData?.events || [];

  // WebSocket connection for live updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/command-center/ws?platformId=dashboard&apiKey=${API_KEY}`);

    ws.onopen = () => {
      setWsConnected(true);
      console.log("Command Center WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "platform_status_change" || data.type === "platform_timeout") {
        refetchPlatforms();
        refetchStatus();
      }
      if (data.type === "event") {
        setLiveEvents(prev => [data.event, ...prev].slice(0, 100));
      }
    };

    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    return () => ws.close();
  }, [refetchPlatforms, refetchStatus]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const onlinePlatforms = platforms.filter(p => p.status === "online");
  const offlinePlatforms = platforms.filter(p => p.status === "offline");
  const degradedPlatforms = platforms.filter(p => p.status === "degraded");

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Terminal className="h-8 w-8 text-cyan-400" />
            Central Command Center
          </h1>
          <p className="text-slate-400 mt-1">dash.Fanz.Website - Real-time Platform Monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={wsConnected ? "default" : "destructive"} className="gap-2">
            {wsConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {wsConnected ? "Live" : "Disconnected"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => { refetchStatus(); refetchPlatforms(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{status?.metrics.platformCount || 0}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="bg-green-600">{status?.metrics.onlinePlatforms || 0} online</Badge>
              <Badge variant="destructive">{status?.metrics.offlinePlatforms || 0} offline</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-cyan-400" />
              {status?.metrics.totalActiveUsers?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2">Across all platforms</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Requests/min</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-400" />
              {status?.metrics.totalRequestsPerMinute?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2">Avg response: {status?.metrics.avgResponseTime?.toFixed(0) || 0}ms</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">System Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <Clock className="h-6 w-6 text-green-400" />
              {status?.uptime ? formatUptime(status.uptime) : "0d 0h 0m"}
            </div>
            <p className="text-xs text-slate-500 mt-2">Error rate: {((status?.metrics.avgErrorRate || 0) * 100).toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="platforms" className="data-[state=active]:bg-cyan-600">
            <Server className="h-4 w-4 mr-2" />
            Platforms ({platforms.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-cyan-600">
            <Activity className="h-4 w-4 mr-2" />
            Events ({events.length})
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-cyan-600">
            <Eye className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {platforms.map((platform) => {
              const IconComponent = platformTypeIcons[platform.type] || Server;
              return (
                <Card
                  key={platform.id}
                  className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:border-cyan-500 ${
                    selectedPlatform?.id === platform.id ? "border-cyan-500 ring-1 ring-cyan-500" : ""
                  }`}
                  onClick={() => setSelectedPlatform(platform)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${platform.status === "online" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                          <IconComponent className={`h-4 w-4 ${platform.status === "online" ? "text-green-400" : "text-red-400"}`} />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium text-white">{platform.name}</CardTitle>
                          <CardDescription className="text-xs">{platform.type}</CardDescription>
                        </div>
                      </div>
                      <div className={`h-2 w-2 rounded-full ${statusColors[platform.status]} animate-pulse`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">CPU</span>
                      <span className="text-white">{platform.metrics.cpuUsage}%</span>
                    </div>
                    <Progress value={platform.metrics.cpuUsage} className="h-1" />

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Memory</span>
                      <span className="text-white">{platform.metrics.memoryUsage}%</span>
                    </div>
                    <Progress value={platform.metrics.memoryUsage} className="h-1" />

                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-slate-500">Last heartbeat</span>
                      <span className="text-slate-400">{formatTime(platform.lastHeartbeat)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Platform Details */}
          {selectedPlatform && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{selectedPlatform.name}</CardTitle>
                    <CardDescription>{selectedPlatform.url}</CardDescription>
                  </div>
                  <Badge variant={statusBadgeVariants[selectedPlatform.status]}>
                    {selectedPlatform.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Platform ID</p>
                    <p className="text-sm text-white font-mono">{selectedPlatform.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Version</p>
                    <p className="text-sm text-white">{selectedPlatform.version}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Active Users</p>
                    <p className="text-sm text-white">{selectedPlatform.metrics.activeUsers}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Requests/min</p>
                    <p className="text-sm text-white">{selectedPlatform.metrics.requestsPerMinute}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-slate-400 mb-2">Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlatform.capabilities.map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Send Command
                  </Button>
                  <Button size="sm" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Events</CardTitle>
              <CardDescription>Real-time platform activity and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {[...liveEvents, ...events].slice(0, 100).map((event, i) => (
                    <div
                      key={event.id || i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700"
                    >
                      <div className={`p-1.5 rounded ${
                        event.type === "error" ? "bg-red-500/20" :
                        event.type === "warning" ? "bg-yellow-500/20" :
                        event.type === "success" ? "bg-green-500/20" : "bg-blue-500/20"
                      }`}>
                        {event.type === "error" ? <AlertTriangle className="h-4 w-4 text-red-400" /> :
                         event.type === "success" ? <CheckCircle2 className="h-4 w-4 text-green-400" /> :
                         <Activity className="h-4 w-4 text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{event.category}</span>
                          <Badge variant="outline" className="text-xs">{event.platformId}</Badge>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{event.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatTime(event.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && liveEvents.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      No events recorded yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-cyan-400" />
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {onlinePlatforms.slice(0, 8).map((platform) => (
                  <div key={platform.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{platform.name}</span>
                      <span className="text-white">{platform.metrics.cpuUsage}% CPU | {platform.metrics.memoryUsage}% RAM</span>
                    </div>
                    <div className="flex gap-1">
                      <Progress value={platform.metrics.cpuUsage} className="h-2 flex-1" />
                      <Progress value={platform.metrics.memoryUsage} className="h-2 flex-1" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                      <div>
                        <p className="text-lg font-bold text-white">{onlinePlatforms.length}</p>
                        <p className="text-sm text-slate-400">Platforms Online</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                      <div>
                        <p className="text-lg font-bold text-white">{offlinePlatforms.length}</p>
                        <p className="text-sm text-slate-400">Platforms Offline</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-yellow-400" />
                      <div>
                        <p className="text-lg font-bold text-white">{degradedPlatforms.length}</p>
                        <p className="text-sm text-slate-400">Platforms Degraded</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
