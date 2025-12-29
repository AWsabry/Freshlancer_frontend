import { API_BASE_URL } from '../config/env';

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

/**
 * Logger utility for frontend
 * - Logs to console in development
 * - Sends logs (info, success, error) to backend in production
 * - Prevents exposing sensitive information in production
 */
class Logger {
  /**
   * Log information
   */
  async info(...args) {
    if (isDevelopment) {
      console.info(...args);
    } else {
      await this.sendToBackend('info', args);
    }
  }

  /**
   * Log success messages
   */
  async success(...args) {
    if (isDevelopment) {
      console.log('✅', ...args);
    } else {
      await this.sendToBackend('success', args);
    }
  }

  /**
   * Log errors (always logged, sent to backend in production)
   */
  async error(...args) {
    if (isDevelopment) {
      console.error(...args);
    } else {
      await this.sendToBackend('error', args);
    }
  }

  /**
   * Log warnings
   */
  async warn(...args) {
    if (isDevelopment) {
      console.warn(...args);
    } else {
      await this.sendToBackend('warn', args);
    }
  }

  /**
   * Log debug (development only, not sent to backend)
   */
  debug(...args) {
    if (isDevelopment) {
      console.debug(...args);
    }
    // Debug logs are not sent to backend to avoid clutter
  }

  /**
   * Log general information (alias for info)
   */
  async log(...args) {
    await this.info(...args);
  }

  /**
   * Send log to backend API
   * Sends info, success, warn, and error logs in production
   */
  async sendToBackend(level, args, action = null) {
    try {
      const message = args
        .map((arg) => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');

      // Don't send if it's a network error (would cause infinite loop)
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        return;
      }

      // Throttle logging to avoid overwhelming the server
      // Only send important logs in production
      const importantLevels = ['error', 'success', 'warn'];
      if (!isDevelopment && !importantLevels.includes(level) && level !== 'info') {
        return;
      }

      await fetch(`${API_BASE_URL}/api/v1/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          action, // Optional: action name (e.g., 'user_login', 'payment_success')
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : 'N/A',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
          path: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
        }),
      });
    } catch (err) {
      // Silently fail - don't break the app if logging fails
      // Don't log the error to avoid infinite loops
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Default export for convenience
export default logger;

