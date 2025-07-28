import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'

interface TokenHealthResponse {
  status: 'valid' | 'invalid'
  user_id?: number
  username?: string
  is_active?: boolean
  timestamp?: string
  detail?: string
}

export class TokenExpirationService {
  private healthCheckInterval: NodeJS.Timeout | null = null
  private onTokenExpired: (() => void) | null = null
  private isMonitoring = false
  private isLoggingOut = false

  private readonly HEALTH_CHECK_INTERVAL = 15000

  startMonitoring(onTokenExpired: () => void): void {
    if (this.isMonitoring) {
      this.stopMonitoring()
    }

    this.onTokenExpired = onTokenExpired
    this.isMonitoring = true

    this.checkTokenHealth()

    this.healthCheckInterval = setInterval(() => {
      this.checkTokenHealth()
    }, this.HEALTH_CHECK_INTERVAL)
  }

  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    this.isMonitoring = false
    this.onTokenExpired = null
  }

  public handleTokenExpiration(): void {
    if (this.isLoggingOut) {
      return
    }

    this.isLoggingOut = true

    const logoutCallback = this.onTokenExpired

    this.stopMonitoring()

    try {
      const toastData = {
        title: 'Session Expired',
        description: 'Your session has expired. Please log in again.',
        variant: 'destructive',
        timestamp: Date.now(),
      }

      localStorage.setItem('sessionExpiredToast', JSON.stringify(toastData))

      const stored = localStorage.getItem('sessionExpiredToast')
      if (!stored) {
        console.error('Failed to store session expired toast in localStorage')
      }
    } catch (error) {
      console.error('Error storing session expired toast:', error)
    }

    try {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('refresh_token')
    } catch (error) {
      console.error('Error clearing auth tokens:', error)
    }

    setTimeout(() => {
      if (logoutCallback) {
        try {
          logoutCallback()
        } catch (error) {
          console.error('Error executing logout callback:', error)
          const currentPath = window.location.pathname
          if (currentPath !== '/login') {
            window.location.href = '/login'
          }
        }
      } else {
        const currentPath = window.location.pathname
        if (currentPath !== '/login') {
          window.location.href = '/login'
        }
      }
    }, 100)

    setTimeout(() => {
      this.isLoggingOut = false
    }, 2000)
  }

  private async checkTokenHealth(): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return
      }

      const response = await baseRequest<TokenHealthResponse>({
        url: 'users/api/token-health/',
        method: METHOD.GET,
        includeAuthToken: true,
      })

      if (response.status === 'valid') {
        return
      }
    } catch {
      this.handleTokenExpiration()
    }
  }

  isCurrentlyMonitoring(): boolean {
    return this.isMonitoring
  }
}

export const tokenExpirationService = new TokenExpirationService()
