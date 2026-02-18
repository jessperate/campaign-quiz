# LogRocket Setup Guide

Complete guide to integrate LogRocket for session replay, error tracking, and performance monitoring.

## Step 1: Create LogRocket Account

1. Go to [https://logrocket.com](https://logrocket.com)
2. Sign up for a free account (up to 1,000 sessions/month free)
3. Create a new app/project
4. Copy your App ID from the dashboard (looks like: `abc123/campaign-quiz`)

## Step 2: Install LogRocket

```bash
npm install logrocket logrocket-react
```

## Step 3: Add Environment Variables

Add to `.env.local` and Vercel:

```bash
NEXT_PUBLIC_LOGROCKET_APP_ID="your-app-id/campaign-quiz"
```

## Step 4: Create LogRocket Provider

Create `/lib/logrocket.ts`:

```typescript
import LogRocket from 'logrocket';

let initialized = false;

export function initLogRocket() {
  if (typeof window === 'undefined' || initialized) return;

  const appId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID;
  if (!appId) {
    console.warn('LogRocket not initialized - missing NEXT_PUBLIC_LOGROCKET_APP_ID');
    return;
  }

  LogRocket.init(appId, {
    // Console integration
    console: {
      shouldAggregateConsoleErrors: true,
    },
    // Network monitoring
    network: {
      requestSanitizer: (request) => {
        // Don't log sensitive data
        if (request.headers['Authorization']) {
          request.headers['Authorization'] = '[REDACTED]';
        }
        return request;
      },
      responseSanitizer: (response) => {
        // Don't log sensitive response data
        return response;
      },
    },
    // Don't record on localhost
    shouldCaptureIP: process.env.NODE_ENV === 'production',
  });

  initialized = true;
  console.log('✅ LogRocket initialized');
}

export function identifyUser(userId: string, traits?: {
  name?: string;
  email?: string;
  [key: string]: any;
}) {
  if (!initialized) return;

  LogRocket.identify(userId, traits);
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!initialized) return;

  LogRocket.track(eventName, properties);
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (!initialized) return;

  LogRocket.captureException(error, {
    tags: context,
  });
}

export { LogRocket };
```

## Step 5: Initialize in Root Layout

Update `app/layout.tsx`:

```typescript
import { initLogRocket } from '@/lib/logrocket';
import { useEffect } from 'react';

// Add this component
function LogRocketInit() {
  useEffect(() => {
    initLogRocket();
  }, []);
  return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LogRocketInit />
        {children}
      </body>
    </html>
  );
}
```

## Step 6: Track User Sessions

Update `/app/results/ResultsClient.tsx` to identify users:

```typescript
import { identifyUser, trackEvent } from '@/lib/logrocket';

// When user completes quiz
useEffect(() => {
  if (results) {
    identifyUser(userId, {
      name: `${results.formData.firstName} ${results.formData.lastName}`,
      email: results.formData.email,
      archetype: results.archetype,
      company: results.formData.company,
    });

    trackEvent('Quiz Completed', {
      archetype: results.archetype,
      role: results.role,
    });
  }
}, [results]);
```

## Step 7: Track Errors

Update error boundaries and API routes:

```typescript
import { captureException } from '@/lib/logrocket';

try {
  // Your code
} catch (error) {
  captureException(error as Error, {
    context: 'quiz-submission',
    userId: userId,
  });
  throw error;
}
```

## Step 8: Integrate with Dashboard

Update `/app/admin/dashboard/page.tsx` to fetch LogRocket errors:

```typescript
// Add LogRocket API integration
async function getLogRocketErrors(): Promise<ErrorDetail[]> {
  // LogRocket doesn't have a direct API for errors, but you can:
  // 1. Use their webhooks to store errors in your DB
  // 2. Manually check LogRocket dashboard
  // 3. Use Sentry integration (see below)

  return [];
}
```

## Step 9: Enable Console Tracking

LogRocket automatically captures:
- ✅ Console errors
- ✅ Network requests
- ✅ DOM events
- ✅ User clicks
- ✅ Redux actions (if using Redux)

## Step 10: Add Error Boundary

Create `/components/ErrorBoundary.tsx`:

```typescript
'use client';

import { Component, ReactNode } from 'react';
import { captureException } from '@/lib/logrocket';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    captureException(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>Our team has been notified and is working on a fix.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Wrap your app in the error boundary:

```typescript
// app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LogRocketInit />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

## Step 11: Set Up Webhooks (Optional)

Store LogRocket errors in your database:

1. Go to LogRocket Settings → Integrations → Webhooks
2. Add webhook URL: `https://campaign-quiz.vercel.app/api/logrocket-webhook`
3. Create the webhook endpoint:

```typescript
// app/api/logrocket-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Store error in Redis or database
    // await storeError(data);

    console.log('LogRocket webhook:', data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## Step 12: Add LogRocket Link to Dashboard

Update dashboard to link to LogRocket sessions:

```typescript
// In your dashboard error modal
<a
  href={`https://app.logrocket.com/${appId}/sessions/${sessionId}`}
  target="_blank"
  className="text-blue-600 hover:underline"
>
  View Session Replay →
</a>
```

## Features You Get

### 📹 Session Replay
- Watch exactly what users did before errors
- See network requests, console logs, clicks
- Filter by user, time, errors

### 🐛 Error Tracking
- Automatic JavaScript error capture
- Stack traces with source maps
- User context and session data

### 📊 Performance Monitoring
- Page load times
- API response times
- Core Web Vitals

### 🔍 Network Monitoring
- All API calls logged
- Request/response payloads
- Failed requests highlighted

## Privacy & GDPR

Sanitize sensitive data:

```typescript
LogRocket.init(appId, {
  // Don't record input fields with these names
  shouldCaptureIP: false,
  network: {
    requestSanitizer: (request) => {
      // Remove auth headers
      delete request.headers['Authorization'];
      return request;
    },
  },
  dom: {
    inputSanitizer: true, // Mask all input fields
    // Or specify fields to mask
    inputSanitizer(text, element) {
      if (element.name === 'password' || element.name === 'email') {
        return '***';
      }
      return text;
    },
  },
});
```

## Pricing

- **Free**: 1,000 sessions/month
- **Starter**: $99/month for 10,000 sessions
- **Professional**: $299/month for 50,000 sessions

## Alternative: Sentry + LogRocket

For best results, use both:
- **Sentry**: Error tracking + performance
- **LogRocket**: Session replay

They integrate seamlessly:

```bash
npm install @sentry/nextjs @logrocket/sentry
```

```typescript
import * as Sentry from '@sentry/nextjs';
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';

// Initialize LogRocket
LogRocket.init('your-app-id');
setupLogRocketReact(LogRocket);

// Link to Sentry
LogRocket.getSessionURL((sessionURL) => {
  Sentry.configureScope((scope) => {
    scope.setExtra('sessionURL', sessionURL);
  });
});
```

## Testing

After setup, test by triggering an error:

```typescript
// Add a test button in your app
<button onClick={() => {
  throw new Error('Test error for LogRocket');
}}>
  Test Error Tracking
</button>
```

Then check:
1. LogRocket dashboard for the error
2. Session replay to see what happened
3. Your admin dashboard (if integrated)

## Troubleshooting

### LogRocket not recording
- Check `NEXT_PUBLIC_LOGROCKET_APP_ID` is set
- Verify it's initialized before first render
- Check browser console for errors

### Missing session replays
- Ensure you're in production mode
- Check adblockers aren't blocking LogRocket
- Verify network tab shows LogRocket requests

### High data usage
- Adjust sampling rate: `LogRocket.init(appId, { sampleRate: 0.5 })`
- Increase session length limit
- Filter out specific pages

## Next Steps

1. Install the packages
2. Add App ID to environment variables
3. Initialize in root layout
4. Test with an error
5. Check LogRocket dashboard
6. Integrate with your admin dashboard

Need help? LogRocket has excellent docs: https://docs.logrocket.com
