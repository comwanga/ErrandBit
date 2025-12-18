import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

interface NavigationTiming {
  dns: number;
  tcp: number;
  request: number;
  response: number;
  domProcessing: number;
  domContentLoaded: number;
  loadComplete: number;
}

/**
 * Custom hook for monitoring web vitals and performance metrics
 * 
 * Usage:
 * ```tsx
 * function App() {
 *   usePerformanceMonitoring({
 *     onMetric: (name, value) => {
 *       console.log(`${name}: ${value}ms`);
 *     }
 *   });
 * }
 * ```
 */
export function usePerformanceMonitoring(options?: {
  onMetric?: (name: string, value: number) => void;
  reportToAnalytics?: boolean;
}) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const { onMetric, reportToAnalytics = false } = options || {};

    // Report metric to callback and/or analytics
    const reportMetric = (name: string, value: number) => {
      if (onMetric) {
        onMetric(name, value);
      }

      if (reportToAnalytics) {
        // TODO: Integrate with analytics service
        console.log(`[Analytics] ${name}: ${value}ms`);
      }
    };

    // Measure First Contentful Paint (FCP)
    const measureFCP = () => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        reportMetric('FCP', Math.round(fcpEntry.startTime));
      }
    };

    // Measure Largest Contentful Paint (LCP)
    const measureLCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
            const lcp = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
            reportMetric('LCP', Math.round(lcp));
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // LCP not supported
        }
      }
    };

    // Measure First Input Delay (FID)
    const measureFID = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              const fidEntry = entry as PerformanceEntry & { processingStart?: number };
              if (fidEntry.processingStart) {
                const fid = fidEntry.processingStart - entry.startTime;
                reportMetric('FID', Math.round(fid));
              }
            });
          });
          observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          // FID not supported
        }
      }
    };

    // Measure Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      if ('PerformanceObserver' in window) {
        try {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
              if (!layoutShift.hadRecentInput && layoutShift.value) {
                clsValue += layoutShift.value;
              }
            });
          });
          observer.observe({ entryTypes: ['layout-shift'] });

          // Report CLS on page unload
          window.addEventListener('beforeunload', () => {
            reportMetric('CLS', Math.round(clsValue * 1000) / 1000);
          });
        } catch (e) {
          // CLS not supported
        }
      }
    };

    // Measure Navigation Timing
    const measureNavigationTiming = () => {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (!perfData) return;

          const timing: NavigationTiming = {
            dns: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
            tcp: Math.round(perfData.connectEnd - perfData.connectStart),
            request: Math.round(perfData.responseStart - perfData.requestStart),
            response: Math.round(perfData.responseEnd - perfData.responseStart),
            domProcessing: Math.round(perfData.domContentLoadedEventStart - perfData.responseEnd),
            domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
            loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
          };

          // Time to First Byte
          const ttfb = Math.round(perfData.responseStart - perfData.requestStart);
          reportMetric('TTFB', ttfb);

          // Report detailed timing
          if (import.meta.env.DEV) {
            console.log('[Performance] Navigation Timing:', timing);
          }
        }, 0);
      });
    };

    // Execute all measurements
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();
    measureNavigationTiming();

    // Cleanup is handled by browser automatically for PerformanceObserver
  }, [options?.onMetric, options?.reportToAnalytics]);
}

/**
 * Utility function to measure component render time
 */
export function measureComponentRender(componentName: string) {
  const startMark = `${componentName}-start`;
  const endMark = `${componentName}-end`;
  const measureName = `${componentName}-render`;

  performance.mark(startMark);

  return () => {
    performance.mark(endMark);
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      if (import.meta.env.DEV) {
        console.log(`[Render] ${componentName}: ${Math.round(measure.duration)}ms`);
      }
      // Cleanup
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    } catch (e) {
      // Measurement not supported
    }
  };
}

/**
 * Utility function to report custom metrics
 */
export function reportCustomMetric(name: string, value: number, unit: string = 'ms') {
  if (import.meta.env.DEV) {
    console.log(`[Metric] ${name}: ${value}${unit}`);
  }

  // TODO: Send to analytics service
  // Example: analytics.track(name, { value, unit });
}
