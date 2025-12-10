/**
 * Production-safe logging utility
 * Only logs in development to prevent Vercel storage bloat
 */

const isDevelopment = process.env.NODE_ENV !== 'production'

/**
 * Logger utility that conditionally logs based on environment
 */
export const logger = {
  /**
   * Log informational messages (only in development)
   * @param {...any} args - Arguments to log
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * Log error messages (only in development)
   * In production, errors are silently ignored to prevent log bloat
   * For production error tracking, integrate with a service like Sentry
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args)
    }
    // In production, you could send to error tracking service here
    // Example: Sentry.captureException(args[0])
  },

  /**
   * Log warning messages (only in development)
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  /**
   * Log info messages (only in development)
   * @param {...any} args - Arguments to log
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  /**
   * Log debug messages (only in development)
   * @param {...any} args - Arguments to log
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
}

export default logger

