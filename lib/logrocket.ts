import LogRocket from 'logrocket';

let initialized = false;

export function initLogRocket() {
  if (typeof window === 'undefined' || initialized) return;

  const appId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID;
  if (!appId) {
    console.warn('LogRocket not initialized - missing NEXT_PUBLIC_LOGROCKET_APP_ID');
    return;
  }

  try {
    LogRocket.init(appId, {
      // Console integration
      console: {
        shouldAggregateConsoleErrors: true,
      },
      // Network monitoring
      network: {
        requestSanitizer: (request) => {
          // Don't log sensitive headers
          if (request.headers['Authorization']) {
            request.headers['Authorization'] = '[REDACTED]';
          }
          if (request.headers['Cookie']) {
            request.headers['Cookie'] = '[REDACTED]';
          }
          return request;
        },
        responseSanitizer: (response) => {
          // Sanitize sensitive response data if needed
          return response;
        },
      },
      // Privacy settings
      dom: {
        inputSanitizer: true, // Mask all input fields by default
      },
      // Don't record on localhost
      shouldCaptureIP: process.env.NODE_ENV === 'production',
    });

    initialized = true;
    console.log('✅ LogRocket initialized');
  } catch (error) {
    console.error('Failed to initialize LogRocket:', error);
  }
}

export function identifyUser(userId: string, traits?: {
  name?: string;
  email?: string;
  [key: string]: any;
}) {
  if (!initialized) return;

  try {
    LogRocket.identify(userId, traits);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!initialized) return;

  try {
    LogRocket.track(eventName, properties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (!initialized) return;

  try {
    LogRocket.captureException(error, {
      tags: context,
    });
  } catch (err) {
    console.error('Failed to capture exception:', err);
  }
}

export function getSessionURL(): Promise<string | null> {
  if (!initialized) return Promise.resolve(null);

  return new Promise((resolve) => {
    LogRocket.getSessionURL((url) => {
      resolve(url);
    });
  });
}

export { LogRocket };
