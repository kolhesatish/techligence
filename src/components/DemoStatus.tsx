import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Zap,
  CheckCircle2
} from "lucide-react";
import { analytics } from "@/services/analytics";

interface UptimeData {
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  lastChecked: number;
}

const DemoStatus = () => {
  const [uptimeData, setUptimeData] = useState<UptimeData>({
    status: 'online',
    uptime: 99.97,
    lastChecked: Date.now(),
  });
  const [latency, setLatency] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Initial check
    checkStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    // Measure latency periodically
    const latencyInterval = setInterval(measureLatency, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(latencyInterval);
    };
  }, []);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      // Simulate API check (replace with actual endpoint)
      const startTime = performance.now();
      
      // In production, this would be: await fetch('/api/health')
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
        status: 'offline',
        uptime: 0,
        lastChecked: Date.now(),
      });
    } finally {
      setIsChecking(false);
    }
  };

  const measureLatency = async () => {
    const measuredLatency = await analytics.measureLatency('status_check');
    setLatency(Math.round(measuredLatency));
  };

  const getStatusColor = () => {
    switch (uptimeData.status) {
      case 'online':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (uptimeData.status) {
      case 'online':
        return <Wifi className="w-4 h-4" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'offline':
        return <WifiOff className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (uptimeData.status) {
      case 'online':
        return 'Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const formatUptime = (uptime: number) => {
    if (uptime >= 99.9) return `${uptime.toFixed(3)}%`;
    if (uptime >= 99) return `${uptime.toFixed(2)}%`;
    return `${uptime.toFixed(1)}%`;
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Demo Status
          </CardTitle>
          <Badge 
            variant={uptimeData.status === 'online' ? 'default' : 'destructive'}
            className="flex items-center gap-1.5"
          >
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isChecking ? 'animate-pulse' : ''}`} />
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Uptime Badge */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              {getStatusIcon()}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Uptime</p>
              <p className="text-2xl font-bold text-foreground">{formatUptime(uptimeData.uptime)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Last 30 days</p>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Stable</span>
            </div>
          </div>
        </div>

        {/* Latency Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Latency</p>
            </div>
            <p className="text-xl font-bold text-foreground">
              {latency}ms
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {latency < 100 ? 'Excellent' : latency < 200 ? 'Good' : 'Fair'}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Response</p>
            </div>
            <p className="text-xl font-bold text-foreground">
              {isChecking ? '...' : '<100ms'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
          <CheckCircle2 className={`w-5 h-5 ${
            uptimeData.status === 'online' 
              ? 'text-green-500' 
              : uptimeData.status === 'degraded'
              ? 'text-yellow-500'
              : 'text-red-500'
          }`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {uptimeData.status === 'online' 
                ? 'All systems operational'
                : uptimeData.status === 'degraded'
                ? 'Experiencing minor issues'
                : 'Service temporarily unavailable'}
            </p>
            <p className="text-xs text-muted-foreground">
              Last checked: {new Date(uptimeData.lastChecked).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoStatus;

