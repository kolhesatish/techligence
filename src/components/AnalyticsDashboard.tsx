import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  MousePointerClick, 
  Play, 
  TrendingUp,
  BarChart3,
  Activity,
  Clock
} from "lucide-react";
import { analytics } from "@/services/analytics";

interface AnalyticsStats {
  pageViews: number;
  ctaClicks: number;
  demoStarts: number;
  avgLatency: number;
  sessionDuration: number;
  totalEvents: number;
}

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<AnalyticsStats>({
    pageViews: 0,
    ctaClicks: 0,
    demoStarts: 0,
    avgLatency: 0,
    sessionDuration: 0,
    totalEvents: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Update stats every 2 seconds
    const interval = setInterval(() => {
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

    // Show dashboard after a short delay
    setTimeout(() => setIsVisible(true), 500);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const metrics = [
    {
      label: "Page Views",
      value: stats.pageViews,
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "CTA Clicks",
      value: stats.ctaClicks,
      icon: MousePointerClick,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Demo Starts",
      value: stats.demoStarts,
      icon: Play,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Avg Latency",
      value: `${stats.avgLatency}ms`,
      icon: Activity,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  if (!isVisible) return null;

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card/90 to-card/80 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
      <CardHeader className="pb-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Engagement Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1.5">
                Real-time session metrics and performance insights
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-2 px-4 py-2 shadow-md border border-border/50 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Live</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="group p-5 rounded-2xl bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${metric.bgColor} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {metric.label}
                  </p>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Session Info */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border border-primary/30 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-md">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Session Duration
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatDuration(stats.sessionDuration)}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Events</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalEvents}
              </p>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Engagement Rate</p>
            <Badge variant="outline" className="text-xs font-medium px-3 py-1">
              {stats.pageViews > 0
                ? `${Math.round((stats.ctaClicks / stats.pageViews) * 100)}%`
                : '0%'}
            </Badge>
          </div>
          <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary/90 to-secondary transition-all duration-700 shadow-lg"
              style={{
                width: `${
                  stats.pageViews > 0
                    ? Math.min((stats.ctaClicks / stats.pageViews) * 100, 100)
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            {stats.ctaClicks} clicks from {stats.pageViews} views
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;

