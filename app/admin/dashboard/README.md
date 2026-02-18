# Admin Dashboard

Monitor Campaign Quiz traffic and system health at `/admin/dashboard`

## Features

### 📊 GA4 Traffic Metrics
- Users (last 24h)
- Sessions
- Page Views
- Conversions

### 🏥 System Health Checks
- API endpoint availability
- Environment variable configuration
- Service status monitoring

### 🚀 Quick Actions
- Access admin panel
- Preview cards
- View all cards API
- Jump to Vercel console

## Setup GA4 Integration

### 1. Enable Google Analytics Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable "Google Analytics Data API"
4. Create a service account
5. Download the JSON credentials file

### 2. Grant Analytics Access

1. Go to [Google Analytics](https://analytics.google.com)
2. Admin → Property Settings → Property Access Management
3. Add the service account email (from the JSON file)
4. Grant "Viewer" role

### 3. Add Environment Variables

Add to `.env.local` and Vercel:

```bash
# GA4 Property ID (found in GA4 Admin → Property Settings)
GA4_PROPERTY_ID="properties/123456789"

# Service account credentials (stringify the JSON file)
GA4_CREDENTIALS='{"type":"service_account","project_id":"...",...}'
```

### 4. Install Dependencies

```bash
npm install @google-analytics/data
```

### 5. Implement GA4 Fetching

Update the `getGA4Metrics()` function in `page.tsx`:

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

async function getGA4Metrics(): Promise<MetricData | null> {
  if (!GA4_PROPERTY_ID || !GA4_CREDENTIALS) return null;

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: JSON.parse(GA4_CREDENTIALS),
    });

    const [response] = await analyticsDataClient.runReport({
      property: GA4_PROPERTY_ID,
      dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
      dimensions: [],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'conversions' },
      ],
    });

    const values = response.rows?.[0]?.metricValues;
    return {
      users: parseInt(values?.[0]?.value || '0'),
      sessions: parseInt(values?.[1]?.value || '0'),
      pageviews: parseInt(values?.[2]?.value || '0'),
      conversions: parseInt(values?.[3]?.value || '0'),
      avgSessionDuration: 0,
    };
  } catch (error) {
    console.error('GA4 fetch error:', error);
    return null;
  }
}
```

## Usage

### Access the Dashboard

Navigate to: `https://campaign-quiz.vercel.app/admin/dashboard`

Or locally: `http://localhost:3000/admin/dashboard`

### Auto-Refresh

The dashboard automatically refreshes on each page load. For real-time monitoring, refresh manually or add auto-refresh:

```typescript
// Add to page.tsx client component
useEffect(() => {
  const interval = setInterval(() => {
    router.refresh();
  }, 60000); // Refresh every 60 seconds
  return () => clearInterval(interval);
}, []);
```

### Add Authentication

Protect the dashboard with middleware:

```typescript
// app/admin/dashboard/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.headers.get('authorization');

  if (authToken !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}
```

## Extending the Dashboard

### Add Custom Metrics

```typescript
interface MetricData {
  // ... existing metrics
  customMetric: number;
}

// In getGA4Metrics()
metrics: [
  // ... existing metrics
  { name: 'yourCustomMetric' },
],
```

### Add More Health Checks

```typescript
// Check external services
const slackCheck = await fetch('https://slack.com/api/api.test');
checks.push({
  name: 'Slack API',
  status: slackCheck.ok ? 'healthy' : 'error',
  message: slackCheck.ok ? 'Connected' : 'Failed',
  lastChecked: new Date().toISOString(),
});
```

### Add Error Tracking

Integrate with Sentry, LogRocket, or custom error tracking:

```typescript
async function getRecentErrors() {
  // Fetch from your error tracking service
  const errors = await fetchFromSentry();
  return errors;
}
```

## Troubleshooting

### "GA4 not configured" message
- Verify `GA4_PROPERTY_ID` and `GA4_CREDENTIALS` are set
- Check credentials JSON is properly stringified
- Ensure service account has Analytics access

### Health checks showing errors
- Check Vercel environment variables
- Verify API routes are deployed
- Check Vercel function logs for errors

### Slow dashboard loading
- Add caching to GA4 metrics (Redis)
- Reduce health check frequency
- Use React Query for client-side caching

## Security Notes

- Never commit credentials to git
- Use environment variables for all secrets
- Add authentication before exposing publicly
- Restrict service account permissions to read-only
- Consider IP whitelisting for admin routes
