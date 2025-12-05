/**
 * Environment Configuration
 *
 * This module handles environment-specific configuration and feature flags.
 * The VITE_APP_ENVIRONMENT variable determines which environment is active.
 *
 * Supported environments:
 * - local: Local development
 * - dare-staging: DARE staging environment
 * - dare-production: DARE production deployment
 * - gt-production: Georgia Tech production deployment
 */

// Environment types
export type AppEnvironment =
  | 'local'
  | 'dare-staging'
  | 'dare-production'
  | 'gt-production'

// Environment configuration interface
export interface EnvironmentConfig {
  environment: AppEnvironment
  isLocal: boolean
  isDareStaging: boolean
  isDareProduction: boolean
  isGtProduction: boolean
  apiUrl: string
  websocketUrl: string
  socraticBooksUrl?: string
  features: FeatureFlags
}

// Feature flags interface
export interface FeatureFlags {
  // BYOK = Bring Your Own Key (Settings page)
  enableBYOK: boolean
  // Image Generation in chat configuration panel
  enableImageGeneration: boolean
}

/**
 * Get the current environment from environment variables
 */
function getEnvironment(): AppEnvironment {
  const env = import.meta.env.VITE_APP_ENVIRONMENT as AppEnvironment | undefined

  // Default to local if not specified
  if (
    !env ||
    !['local', 'dare-staging', 'dare-production', 'gt-production'].includes(env)
  ) {
    console.warn(
      `Invalid or missing VITE_APP_ENVIRONMENT: "${env}". Defaulting to "local".`
    )
    return 'local'
  }

  return env
}

/**
 * Get feature flags based on environment
 */
function getFeatureFlags(environment: AppEnvironment): FeatureFlags {
  switch (environment) {
    case 'local':
      return {
        enableBYOK: true,
        enableImageGeneration: true,
      }

    case 'dare-staging':
      return {
        enableBYOK: true, // DARE Staging: HAS BYOK
        enableImageGeneration: true, // DARE Staging: HAS Image Generation
      }

    case 'dare-production':
      return {
        enableBYOK: false, // DARE Production: NO BYOK
        enableImageGeneration: true, // DARE Production: has Image Generation
      }

    case 'gt-production':
      return {
        enableBYOK: true, // Georgia Tech: HAS BYOK
        enableImageGeneration: true, // Georgia Tech: HAS Image Generation
      }

    default:
      return {
        enableBYOK: true,
        enableImageGeneration: true,
      }
  }
}

/**
 * Build the complete environment configuration
 */
function buildEnvironmentConfig(): EnvironmentConfig {
  const environment = getEnvironment()

  return {
    environment,
    isLocal: environment === 'local',
    isDareStaging: environment === 'dare-staging',
    isDareProduction: environment === 'dare-production',
    isGtProduction: environment === 'gt-production',
    apiUrl: import.meta.env.VITE_DJANGO_BACKEND_URL || 'http://localhost:8000',
    websocketUrl:
      import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws',
    socraticBooksUrl: import.meta.env.VITE_SOCRATIC_BOOKS_URL,
    features: getFeatureFlags(environment),
  }
}

// Export the configuration object
export const config: EnvironmentConfig = buildEnvironmentConfig()

// Helper functions for common checks
export const isLocal = config.isLocal
export const isDareStaging = config.isDareStaging
export const isDareProduction = config.isDareProduction
export const isGtProduction = config.isGtProduction

// Feature flag helpers
export const features = config.features

// Log environment on initialization (local only)
if (config.isLocal) {
  console.log('🚀 DARE Environment Configuration:', {
    environment: config.environment,
    apiUrl: config.apiUrl,
    websocketUrl: config.websocketUrl,
    features: config.features,
  })
}

export default config
