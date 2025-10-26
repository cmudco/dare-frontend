/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * The environment the app is running in
   * @values 'development' | 'gatech' | 'production'
   */
  readonly VITE_APP_ENVIRONMENT: 'development' | 'gatech' | 'production'

  /**
   * Django backend API URL
   * @example 'http://localhost:8000'
   * @example 'https://daretools.com'
   */
  readonly VITE_DJANGO_BACKEND_URL: string

  /**
   * WebSocket connection URL
   * @example 'ws://localhost:8000/ws'
   * @example 'wss://daretools.com/ws'
   */
  readonly VITE_WEBSOCKET_URL: string

  /**
   * Socratic Books application URL (optional)
   * @example 'http://localhost:5174'
   */
  readonly VITE_SOCRATIC_BOOKS_URL?: string

  /**
   * Sentry DSN for error tracking (optional)
   */
  readonly VITE_SENTRY_DSN?: string

  /**
   * Sentry organization name (optional)
   */
  readonly VITE_SENTRY_ORG?: string

  /**
   * Sentry project name (optional)
   */
  readonly VITE_SENTRY_PROJECT?: string

  /**
   * Sentry auth token (optional)
   */
  readonly VITE_SENTRY_AUTH_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
