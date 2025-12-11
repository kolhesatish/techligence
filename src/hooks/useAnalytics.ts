import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/services/analytics';

/**
 * Hook to automatically track page views and provide analytics functions
 */
export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    analytics.trackPageView(location.pathname);
  }, [location.pathname]);

  return {
    trackCTAClick: (element: string) => {
      analytics.trackCTAClick(element, location.pathname);
    },
    trackDemoStart: () => {
      analytics.trackDemoStart();
    },
    trackDemoEnd: () => {
      analytics.trackDemoEnd();
    },
    getStats: () => analytics.getStats(),
  };
};

