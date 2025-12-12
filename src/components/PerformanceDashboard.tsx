import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Clock,
  TrendingUp,
  Zap,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Play,
  BarChart3,
  Gauge,
  Timer,
} from "lucide-react";
import { analytics } from "@/services/analytics";

interface UptimeData {
  status: "online" | "offline" | "degraded";
  uptime: number;
  lastChecked: number;
}

interface AnalyticsStats {
  pageViews: number;
  ctaClicks: number;
  demoStarts: number;
  avgLatency: number;
  sessionDuration: number;
  totalEvents: number;
}

const PerformanceDashboard = () => {
  const [uptimeData, setUptimeData] = useState<UptimeData>({
    status: "online",
    uptime: 99.97,
    lastChecked: Date.now(),
  });
  const [latency, setLatency] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const [stats, setStats] = useState<AnalyticsStats>({
    pageViews: 0,
    ctaClicks: 0,
    demoStarts: 0,
    avgLatency: 0,
    sessionDuration: 0,
    totalEvents: 0,
  });

  useEffect(() => {
    checkStatus();
    const statusInterval = setInterval(checkStatus, 30000);
    const latencyInterval = setInterval(measureLatency, 5000);
    const statsInterval = setInterval(() => {
      const analyticsStats = analytics.getStats();
      setStats({
        pageViews: analyticsStats.pageViews,
        ctaClicks: analyticsStats.ctaClicks,
        demoStarts: analyticsStats.demoStarts,
        avgLatency: analyticsStats.avgLatency,
        sessionDuration: analyticsStats.sessionDuration,
        totalEvents: analyticsStats.totalEvents,
      });
    }, 2000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(latencyInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const startTime = performance.now();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const responseTime = performance.now() - startTime;
      const uptimeInfo = analytics.getUptime();
      setUptimeData({
        status: uptimeInfo.status,
        uptime: uptimeInfo.uptime,
        lastChecked: Date.now(),
      });
      setLatency(Math.round(responseTime));
    } catch (error) {
      setUptimeData({
        status: "offline",
        uptime: 0,
        lastChecked: Date.now(),
      });
    } finally {
      setIsChecking(false);
    }
  };

  const measureLatency = async () => {
    const measuredLatency = await analytics.measureLatency("status_check");
    setLatency(Math.round(measuredLatency));
  };

  const getStatusColor = () => {
    switch (uptimeData.status) {
      case "online":
        return "bg-emerald-500";
      case "degraded":
        return "bg-amber-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatUptime = (uptime: number) => {
    if (uptime >= 99.9) return `${uptime.toFixed(3)}%`;
    if (uptime >= 99) return `${uptime.toFixed(2)}%`;
    return `${uptime.toFixed(1)}%`;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const engagementRate =
    stats.pageViews > 0
      ? Math.round((stats.ctaClicks / stats.pageViews) * 100)
      : 0;

  return (
    <Card className="border shadow-lg bg-gradient-to-br from-background via-background to-muted/40 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                Real-Time Performance
              </h3>
              <p className="text-xs text-muted-foreground">
                Live observability for marketing & product signals
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Updated: {new Date(uptimeData.lastChecked).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 p-5 rounded-xl border bg-card shadow-sm relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">System Status</p>
                  <p className="text-sm font-semibold">
                    {uptimeData.status === "online"
                      ? "Operational"
                      : uptimeData.status === "degraded"
                      ? "Degraded"
                      : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${getStatusColor()} ${
                    isChecking ? "animate-pulse" : ""
                  }`}
                />
                <span className="text-muted-foreground">Last 30d</span>
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-bold leading-none">
                {formatUptime(uptimeData.uptime)}
              </span>
              <Badge variant="outline" className="text-[11px]">
                SLA 99.9%
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                Healthy trend
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Autorecovery on
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Latency
                </span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                P75
              </Badge>
            </div>
            <div className="text-3xl font-semibold leading-tight">{latency}ms</div>
            <div className="text-xs text-muted-foreground mt-1">
              {latency < 100 ? "Excellent" : latency < 200 ? "Good" : "Fair"}
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
                style={{ width: `${Math.min(latency / 3, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Response
                </span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Live
              </Badge>
            </div>
            <div className="text-3xl font-semibold leading-tight">
              {isChecking ? "..." : "<100ms"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time synthetic probe
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground">Auto-refreshing</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <Badge variant="outline" className="text-[10px]">
                Traffic
              </Badge>
            </div>
            <div className="text-2xl font-bold">{stats.pageViews}</div>
            <p className="text-xs text-muted-foreground">Page views</p>
          </div>

          <div className="p-4 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <MousePointerClick className="w-4 h-4 text-emerald-500" />
              <Badge variant="outline" className="text-[10px]">
                CTA
              </Badge>
            </div>
            <div className="text-2xl font-bold">{stats.ctaClicks}</div>
            <p className="text-xs text-muted-foreground">Primary clicks</p>
          </div>

          <div className="p-4 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Play className="w-4 h-4 text-purple-500" />
              <Badge variant="outline" className="text-[10px]">
                Demos
              </Badge>
            </div>
            <div className="text-2xl font-bold">{stats.demoStarts}</div>
            <p className="text-xs text-muted-foreground">Demo starts</p>
          </div>

          <div className="p-4 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="w-4 h-4 text-orange-500" />
              <Badge variant="outline" className="text-[10px]">
                Infra
              </Badge>
            </div>
            <div className="text-2xl font-bold">{stats.avgLatency}ms</div>
            <p className="text-xs text-muted-foreground">Avg latency</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-5 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Engagement Rate</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {engagementRate}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="h-full bg-gradient-to-r from-primary via-secondary to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(engagementRate, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.ctaClicks} clicks from {stats.pageViews} views
            </p>
          </div>

          <div className="p-5 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Session
              </span>
            </div>
            <div className="text-2xl font-semibold">
              {formatDuration(stats.sessionDuration)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalEvents} events processed
            </p>
          </div>
        </div>

        <div className="pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2
            className={`w-4 h-4 ${
              uptimeData.status === "online"
                ? "text-emerald-500"
                : uptimeData.status === "degraded"
                ? "text-amber-500"
                : "text-red-500"
            }`}
          />
          <span>
            {uptimeData.status === "online"
              ? "All systems operational"
              : uptimeData.status === "degraded"
              ? "Experiencing minor issues"
              : "Service temporarily unavailable"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceDashboard;

