// Analytics Service for tracking page views, CTA clicks, and demo starts

export type AnalyticsEvent = 
  | 'page_view'
  | 'cta_click'
  | 'demo_start'
  | 'demo_end'
  | 'product_view'
  | 'download_datasheet'
  | 'contact_form_submit';

export interface AnalyticsData {
  event: AnalyticsEvent;
  page?: string;
  element?: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsData[] = [];
  private startTime: number = Date.now();
  private demoStartTime: number | null = null;
  private latencyMeasurements: number[] = [];

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
    this.loadStoredEvents();
    this.trackPageView(window.location.pathname);
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private loadStoredEvents(): void {
    const stored = localStorage.getItem('analytics_events');
    if (stored) {
      try {
        this.events = JSON.parse(stored);
      } catch (e) {
        this.events = [];
      }
    }
  }

  private saveEvents(): void {
    // Keep only last 1000 events
    const eventsToSave = this.events.slice(-1000);
    localStorage.setItem('analytics_events', JSON.stringify(eventsToSave));
  }

  track(event: AnalyticsEvent, data?: Partial<AnalyticsData>): void {
    const analyticsData: AnalyticsData = {
      event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...data,
    };

    this.events.push(analyticsData);
    this.saveEvents();

    // Also send to backend if available (optional)
    this.sendToBackend(analyticsData);
  }

  private async sendToBackend(data: AnalyticsData): Promise<void> {
    try {
      // Optional: Send to your backend API
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
    } catch (error) {
      console.error('Failed to send analytics to backend:', error);
    }
  }

  trackPageView(page: string): void {
    this.track('page_view', { page });
  }

  trackCTAClick(element: string, page?: string): void {
    this.track('cta_click', { element, page: page || window.location.pathname });
  }

  trackDemoStart(): void {
    this.demoStartTime = Date.now();
    this.track('demo_start', { page: window.location.pathname });
  }

  trackDemoEnd(): void {
    if (this.demoStartTime) {
      const duration = Date.now() - this.demoStartTime;
      this.track('demo_end', { 
        page: window.location.pathname,
        element: `duration_${duration}ms`
      });
      this.demoStartTime = null;
    }
  }

  measureLatency(operation: string): Promise<number> {
    const start = performance.now();
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const latency = performance.now() - start;
        this.latencyMeasurements.push(latency);
        // Keep only last 100 measurements
        if (this.latencyMeasurements.length > 100) {
          this.latencyMeasurements.shift();
        }
        resolve(latency);
      });
    });
  }

  getStats() {
    const now = Date.now();
    const sessionDuration = now - this.startTime;
    
    const pageViews = this.events.filter(e => e.event === 'page_view').length;
    const ctaClicks = this.events.filter(e => e.event === 'cta_click').length;
    const demoStarts = this.events.filter(e => e.event === 'demo_start').length;
    
    const avgLatency = this.latencyMeasurements.length > 0
      ? this.latencyMeasurements.reduce((a, b) => a + b, 0) / this.latencyMeasurements.length
      : 0;

    const recentEvents = this.events.slice(-50); // Last 50 events

    return {
      sessionId: this.sessionId,
      sessionDuration,
      pageViews,
      ctaClicks,
      demoStarts,
      avgLatency: Math.round(avgLatency * 100) / 100,
      recentEvents,
      totalEvents: this.events.length,
    };
  }

  getUptime(): { status: 'online' | 'offline' | 'degraded'; uptime: number } {
    // Simulate uptime calculation (in real app, this would come from backend)
    const uptime = 99.97; // 99.97% uptime
    const status: 'online' | 'offline' | 'degraded' = 'online';
    
    return { status, uptime };
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Auto-track page views on route changes
if (typeof window !== 'undefined') {
  let lastPath = window.location.pathname;
  
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      analytics.trackPageView(lastPath);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

