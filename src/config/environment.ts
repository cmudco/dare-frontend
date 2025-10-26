/**
 * Environment Configuration
 *
 * This module handles environment-specific configuration and feature flags.
 * The VITE_APP_ENVIRONMENT variable determines which environment is active.
 *
 * Supported environments:
 * - development: Local development
 * - gatech: Georgia Tech deployment (using main branch)
 * - production: DARE production deployment (using main branch)
 */

// Environment types
export type AppEnvironment = 'development' | 'gatech' | 'production'

// Environment configuration interface
export interface EnvironmentConfig {
  environment: AppEnvironment
  isDevelopment: boolean
  isGaTech: boolean
  isProduction: boolean
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

  // Default to development if not specified
  if (!env || !['development', 'gatech', 'production'].includes(env)) {
    console.warn(
      `Invalid or missing VITE_APP_ENVIRONMENT: "${env}". Defaulting to "development".`
    )
    return 'development'
  }

  return env
}

/**
 * Get feature flags based on environment
 */
function getFeatureFlags(environment: AppEnvironment): FeatureFlags {
  switch (environment) {
    case 'development':
      return {
        enableBYOK: true,
        enableImageGeneration: true,
      }

    case 'gatech':
      return {
        enableBYOK: true, // Georgia Tech has BYOK
        enableImageGeneration: true, // Georgia Tech has Image Generation
      }

    case 'production':
      return {
        enableBYOK: false, // DARE Production: NO BYOK
        enableImageGeneration: false, // DARE Production: NO Image Generation
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
    isDevelopment: environment === 'development',
    isGaTech: environment === 'gatech',
    isProduction: environment === 'production',
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
export const isDevelopment = config.isDevelopment
export const isGaTech = config.isGaTech
export const isProduction = config.isProduction

// Feature flag helpers
export const features = config.features

// Log environment on initialization (development only)
if (config.isDevelopment) {
  console.log('🚀 DARE Environment Configuration:', {
    environment: config.environment,
    apiUrl: config.apiUrl,
    websocketUrl: config.websocketUrl,
    features: config.features,
  })
}

export default config
