import { Suspense } from 'react';

// GA4 Property ID from environment
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const GA4_CREDENTIALS = process.env.GA4_CREDENTIALS;

interface MetricData {
  users: number;
  sessions: number;
  pageviews: number;
  conversions: number;
  avgSessionDuration: number;
}

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: string;
}

async function getGA4Metrics(): Promise<MetricData | null> {
  // If GA4 not configured, return mock data
  if (!GA4_PROPERTY_ID || !GA4_CREDENTIALS) {
    return {
      users: 0,
      sessions: 0,
      pageviews: 0,
      conversions: 0,
      avgSessionDuration: 0,
    };
  }

  try {
    // TODO: Implement actual GA4 API call
    // For now, return mock data
    return {
      users: 1234,
      sessions: 2456,
      pageviews: 5678,
      conversions: 89,
      avgSessionDuration: 145,
    };
  } catch (error) {
    console.error('Failed to fetch GA4 metrics:', error);
    return null;
  }
}

async function runHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://campaign-quiz.vercel.app';

  // Check main API endpoints
  const endpoints = [
    { name: 'Submit Quiz', path: '/api/submit-quiz' },
    { name: 'Get Results', path: '/api/get-results' },
    { name: 'Generate Image', path: '/api/generate-image' },
    { name: 'OG Image', path: '/api/og-image' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: 'HEAD',
        cache: 'no-store',
      });

      checks.push({
        name: endpoint.name,
        status: response.ok ? 'healthy' : 'warning',
        message: response.ok ? 'Responding' : `Status: ${response.status}`,
        lastChecked: new Date().toISOString(),
      });
    } catch (error) {
      checks.push({
        name: endpoint.name,
        status: 'error',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastChecked: new Date().toISOString(),
      });
    }
  }

  // Check environment variables
  const requiredEnvVars = [
    { name: 'Database', key: 'UPSTASH_REDIS_REST_URL' },
    { name: 'Google AI', key: 'GOOGLE_API_KEY' },
    { name: 'Vercel Blob', key: 'BLOB_READ_WRITE_TOKEN' },
  ];

  for (const env of requiredEnvVars) {
    checks.push({
      name: `${env.name} Config`,
      status: process.env[env.key] ? 'healthy' : 'error',
      message: process.env[env.key] ? 'Configured' : 'Missing',
      lastChecked: new Date().toISOString(),
    });
  }

  return checks;
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

function HealthCheckItem({ check }: { check: HealthCheck }) {
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

  return (
    <div className={`p-4 rounded-lg border ${statusColors[check.status]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">{statusIcons[check.status]}</span>
          <div>
            <div className="font-semibold">{check.name}</div>
            <div className="text-sm opacity-80">{check.message}</div>
          </div>
        </div>
        <div className="text-xs opacity-60">
          {new Date(check.lastChecked).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

async function DashboardContent() {
  const [metrics, healthChecks] = await Promise.all([
    getGA4Metrics(),
    runHealthChecks(),
  ]);

  const healthyCount = healthChecks.filter(c => c.status === 'healthy').length;
  const warningCount = healthChecks.filter(c => c.status === 'warning').length;
  const errorCount = healthChecks.filter(c => c.status === 'error').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Quiz Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor traffic and system health</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Service Status</h2>
        <div className="space-y-3">
          {healthChecks.map((check, idx) => (
            <HealthCheckItem key={idx} check={check} />
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
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-gray-600">Loading dashboard...</div>
          </div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
