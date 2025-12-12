type Status = "online" | "offline" | "degraded";

interface UptimeInfo {
  status: Status;
  uptime: number;
}

interface AnalyticsSnapshot {
  pageViews: number;
  ctaClicks: number;
  demoStarts: number;
  avgLatency: number;
  sessionDuration: number;
  totalEvents: number;
}

const baseStats: AnalyticsSnapshot = {
  pageViews: 1280,
  ctaClicks: 320,
  demoStarts: 142,
  avgLatency: 82,
  sessionDuration: 185000,
  totalEvents: 2500,
};

let stats = { ...baseStats };

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const statusPool: Status[] = ["online", "online", "online", "degraded"];

export const analytics = {
  getStats(): AnalyticsSnapshot {
    const viewDelta = Math.floor(randomBetween(4, 25));
    stats.pageViews += viewDelta;
    stats.ctaClicks += Math.floor(viewDelta * randomBetween(0.25, 0.5));
    stats.demoStarts += Math.floor(viewDelta * randomBetween(0.1, 0.2));
    stats.totalEvents += viewDelta;
    stats.sessionDuration = Math.max(
      60000,
      stats.sessionDuration + Math.floor(randomBetween(-3000, 6000))
    );
    stats.avgLatency = Math.round(randomBetween(60, 140));
    return { ...stats };
  },

  getUptime(): UptimeInfo {
    const status = statusPool[Math.floor(Math.random() * statusPool.length)];
    const uptime = status === "offline" ? 0 : 99 + randomBetween(0.4, 1);
    return {
      status,
      uptime: parseFloat(uptime.toFixed(3)),
    };
  },

  async measureLatency(label?: string): Promise<number> {
    void label; // placeholder for future label-based routing
    const simulatedLatency = randomBetween(45, 180);
    return simulatedLatency;
  },
};

