'use client';

import { useState, useEffect } from 'react';

interface MetricData {
  users: number;
  sessions: number;
  pageviews: number;
  conversions: number;
  avgSessionDuration: number;
}

interface ErrorDetail {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  stackTrace?: string;
  endpoint?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: string;
  details?: ErrorDetail;
}

function MetricCard({ title, value, change, icon }: {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {change && (
        <div className="text-sm text-green-600">{change}</div>
      )}
    </div>
  );
}

function ErrorModal({ error, onClose }: { error: ErrorDetail; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Error Details</h3>
            <p className="text-sm text-gray-500 mt-1">{error.timestamp}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Error Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Error Type
            </label>
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-800 font-mono text-sm">
              {error.type}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Message
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900">
              {error.message}
            </div>
          </div>

          {/* Endpoint */}
          {error.endpoint && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Endpoint
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-mono text-sm text-gray-900">
                {error.endpoint}
              </div>
            </div>
          )}

          {/* User ID */}
          {error.userId && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                User ID
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-mono text-sm text-gray-900">
                {error.userId}
              </div>
            </div>
          )}

          {/* Stack Trace */}
          {error.stackTrace && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Stack Trace
              </label>
              <pre className="bg-gray-900 text-gray-100 rounded-lg px-4 py-3 text-xs overflow-x-auto">
                {error.stackTrace}
              </pre>
            </div>
          )}

          {/* Metadata */}
          {error.metadata && Object.keys(error.metadata).length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Additional Info
              </label>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs overflow-x-auto">
                {JSON.stringify(error.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function HealthCheckItem({ check, onClick }: {
  check: HealthCheck;
  onClick?: () => void;
}) {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusIcons = {
    healthy: '✓',
    warning: '⚠',
    error: '✕',
  };

  const hasDetails = check.status === 'error' && check.details;

  return (
    <div
      className={`p-4 rounded-lg border ${statusColors[check.status]} ${hasDetails ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={hasDetails ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xl font-bold">{statusIcons[check.status]}</span>
          <div className="flex-1">
            <div className="font-semibold">{check.name}</div>
            <div className="text-sm opacity-80">{check.message}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs opacity-60">
            {new Date(check.lastChecked).toLocaleTimeString()}
          </div>
          {hasDetails && (
            <div className="text-xs font-semibold">
              Click for details →
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorDetail | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // Simulate API calls - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock metrics
      setMetrics({
        users: 1234,
        sessions: 2456,
        pageviews: 5678,
        conversions: 89,
        avgSessionDuration: 145,
      });

      // Mock health checks with detailed errors
      const checks: HealthCheck[] = [
        {
          name: 'Submit Quiz API',
          status: 'healthy',
          message: 'Responding normally',
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Get Results API',
          status: 'healthy',
          message: 'Responding normally',
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Generate Image API',
          status: 'error',
          message: 'Timeout after 30s',
          lastChecked: new Date().toISOString(),
          details: {
            id: 'err_001',
            timestamp: new Date().toISOString(),
            type: 'TimeoutError',
            message: 'Request timeout after 30 seconds. Gemini API may be experiencing high load.',
            endpoint: '/api/generate-image',
            userId: 'user_abc123',
            stackTrace: `TimeoutError: Request timeout
    at fetch (/api/generate-image/route.ts:45:12)
    at processImage (/api/generate-image/route.ts:89:23)
    at handler (/api/generate-image/route.ts:120:15)`,
            metadata: {
              requestDuration: '30000ms',
              retryCount: 3,
              lastAttempt: new Date(Date.now() - 5000).toISOString(),
            }
          }
        },
        {
          name: 'OG Image API',
          status: 'warning',
          message: 'Slow response time (>2s)',
          lastChecked: new Date().toISOString(),
          details: {
            id: 'warn_001',
            timestamp: new Date().toISOString(),
            type: 'PerformanceWarning',
            message: 'Average response time exceeds 2 seconds. Consider optimizing image generation.',
            endpoint: '/api/og-image',
            metadata: {
              avgResponseTime: '2.3s',
              p95ResponseTime: '3.1s',
              recommendation: 'Add caching layer for frequently accessed images',
            }
          }
        },
        {
          name: 'Database Connection',
          status: 'healthy',
          message: 'Connected to Upstash Redis',
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Google AI Config',
          status: 'healthy',
          message: 'API key configured',
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Vercel Blob Storage',
          status: 'error',
          message: 'Upload quota exceeded',
          lastChecked: new Date().toISOString(),
          details: {
            id: 'err_002',
            timestamp: new Date().toISOString(),
            type: 'QuotaExceededError',
            message: 'Blob storage upload quota exceeded. Current usage: 95% of monthly limit.',
            endpoint: '/api/upload-card',
            stackTrace: `QuotaExceededError: Storage limit exceeded
    at uploadToBlob (/api/upload-card/route.ts:67:12)
    at POST (/api/upload-card/route.ts:89:23)`,
            metadata: {
              currentUsage: '9.5 GB',
              monthlyLimit: '10 GB',
              remainingDays: 12,
              recommendation: 'Upgrade plan or implement cleanup policy',
            }
          }
        },
      ];

      setHealthChecks(checks);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const healthyCount = healthChecks.filter(c => c.status === 'healthy').length;
  const warningCount = healthChecks.filter(c => c.status === 'warning').length;
  const errorCount = healthChecks.filter(c => c.status === 'error').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Quiz Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor traffic and system health</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{healthyCount}</div>
              <div className="text-sm text-gray-600">Healthy</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>
        </div>

        {/* GA4 Metrics */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Traffic Metrics (Last 24h)</h2>
          {metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Users"
                value={metrics.users.toLocaleString()}
                icon="👥"
              />
              <MetricCard
                title="Sessions"
                value={metrics.sessions.toLocaleString()}
                icon="📊"
              />
              <MetricCard
                title="Page Views"
                value={metrics.pageviews.toLocaleString()}
                icon="👁️"
              />
              <MetricCard
                title="Conversions"
                value={metrics.conversions.toLocaleString()}
                icon="🎯"
              />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
              ⚠️ GA4 not configured. Set GA4_PROPERTY_ID and GA4_CREDENTIALS environment variables.
            </div>
          )}
        </div>

        {/* Health Checks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Service Status</h2>
            <div className="text-sm text-gray-500">
              Click error items for details
            </div>
          </div>
          <div className="space-y-3">
            {healthChecks.map((check, idx) => (
              <HealthCheckItem
                key={idx}
                check={check}
                onClick={check.details ? () => setSelectedError(check.details!) : undefined}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href="/admin"
              className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="text-2xl mb-2">🗑️</div>
              <div className="text-sm font-medium">Admin Panel</div>
            </a>
            <a
              href="/admin/insights"
              className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium">Quiz Insights</div>
            </a>
            <a
              href="/preview"
              className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm font-medium">Preview Cards</div>
            </a>
            <a
              href="/api/all-cards"
              target="_blank"
              className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium">All Cards API</div>
            </a>
            <a
              href="https://vercel.com/jessica-rosenbergs-projects/campaign-quiz"
              target="_blank"
              className="p-4 text-center bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            >
              <div className="text-2xl mb-2">▲</div>
              <div className="text-sm font-medium">Vercel Console</div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t">
          Campaign Quiz Dashboard • Built with Next.js • Deployed on Vercel
        </div>
      </div>

      {/* Error Modal */}
      {selectedError && (
        <ErrorModal
          error={selectedError}
          onClose={() => setSelectedError(null)}
        />
      )}
    </div>
  );
}
