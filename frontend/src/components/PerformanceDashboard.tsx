/**
 * Performance Monitoring Dashboard
 * Real-time visualization of application performance metrics
 */

import { useState, useEffect } from 'react';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

interface ResourceMetrics {
  name: string;
  duration: number;
  size: number;
  type: string;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [resources, setResources] = useState<ResourceMetrics[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  // Monitor performance metrics
  usePerformanceMonitoring({
    onMetric: (name, value) => {
      setMetrics(prev => ({ ...prev, [name.toLowerCase()]: value }));
    },
  });

  // Collect resource timing data
  useEffect(() => {
    const collectResourceMetrics = () => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const topResources = resourceEntries
        .map(entry => ({
          name: entry.name.split('/').pop() || entry.name,
          duration: Math.round(entry.duration),
          size: entry.transferSize || 0,
          type: entry.initiatorType,
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

      setResources(topResources);
    };

    collectResourceMetrics();
    const interval = setInterval(collectResourceMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  // Monitor memory usage (Chrome only)
  useEffect(() => {
    const updateMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        setMemoryUsage(usedMB);
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut to toggle dashboard (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors z-50"
        title="Show Performance Dashboard (Ctrl+Shift+P)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
    );
  }

  const getMetricColor = (metric: string, value: number): string => {
    const thresholds: Record<string, { good: number; fair: number }> = {
      fcp: { good: 1800, fair: 3000 },
      lcp: { good: 2500, fair: 4000 },
      fid: { good: 100, fair: 300 },
      cls: { good: 0.1, fair: 0.25 },
      ttfb: { good: 800, fair: 1800 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.fair) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Performance Dashboard</h2>
            <p className="text-sm text-blue-100">Real-time monitoring • Press Ctrl+Shift+P to toggle</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Web Vitals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Web Vitals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(metrics).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {key.toUpperCase()}
                  </div>
                  <div className={`text-2xl font-bold ${getMetricColor(key, value)}`}>
                    {key === 'cls' ? value.toFixed(3) : `${Math.round(value)}ms`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {value <= (key === 'cls' ? 0.1 : key === 'fcp' ? 1800 : key === 'lcp' ? 2500 : key === 'fid' ? 100 : 800)
                      ? '✅ Good'
                      : value <= (key === 'cls' ? 0.25 : key === 'fcp' ? 3000 : key === 'lcp' ? 4000 : key === 'fid' ? 300 : 1800)
                      ? '⚠️ Needs Improvement'
                      : '❌ Poor'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Memory Usage */}
          {memoryUsage > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Memory Usage</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">JS Heap Size</span>
                  <span className="text-2xl font-bold text-blue-600">{memoryUsage} MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      memoryUsage < 50 ? 'bg-green-500' : memoryUsage < 100 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((memoryUsage / 150) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Top Slow Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Slowest Resources (Top 10)</h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resources.map((resource, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono truncate max-w-xs">
                        {resource.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {resource.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-semibold ${
                        resource.duration < 100 ? 'text-green-600' : resource.duration < 500 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {resource.duration}ms
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {formatBytes(resource.size)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Performance Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• FCP &lt; 1.8s, LCP &lt; 2.5s, FID &lt; 100ms, CLS &lt; 0.1 are considered "Good"</li>
              <li>• Use code splitting to reduce initial bundle size</li>
              <li>• Optimize images with WebP format and lazy loading</li>
              <li>• Enable compression (Gzip/Brotli) on your server</li>
              <li>• Use CDN for static assets to reduce TTFB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
