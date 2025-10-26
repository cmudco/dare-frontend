import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { getProviderStatus, getBillingMode } from '@/redux/asyncThunks/apiKeys'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { ApiKeyInput, BillingModeSelector } from './components'
import { PROVIDERS, INFO_MESSAGES, ALERT_STYLES } from './constants/apiKeys'

const ApiKeysManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, updateError } = useSelector(
    (state: RootState) => state.apiKeys
  )

  useEffect(() => {
    dispatch(getProviderStatus())
    dispatch(getBillingMode())
  }, [dispatch])

  return (
    <Card className='border-border bg-card p-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h3 className='text-lg font-semibold text-card-foreground'>
            Billing & API Keys
          </h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Choose how you want to pay for AI model usage.
          </p>
        </div>

        {/* API Keys Section */}
        <div className='space-y-4'>
          {/* Info Alert */}
          <div
            className={`rounded-lg border p-4 ${ALERT_STYLES.info.container}`}
          >
            <div className='flex gap-3'>
              <AlertCircle
                className={`h-5 w-5 flex-shrink-0 ${ALERT_STYLES.info.icon}`}
              />
              <div className='space-y-1'>
                <p className={`text-sm font-medium ${ALERT_STYLES.info.title}`}>
                  {INFO_MESSAGES.configureKeys.title}
                </p>
                <p className={`text-xs ${ALERT_STYLES.info.text}`}>
                  {INFO_MESSAGES.configureKeys.description}
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {updateError && (
            <div
              className={`rounded-lg border p-4 ${ALERT_STYLES.error.container}`}
            >
              <div className='flex gap-3'>
                <AlertCircle
                  className={`h-5 w-5 flex-shrink-0 ${ALERT_STYLES.error.icon}`}
                />
                <p className={`text-sm ${ALERT_STYLES.error.text}`}>
                  {updateError}
                </p>
              </div>
            </div>
          )}

          {/* Provider API Keys */}
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-foreground'>
              Provider API Keys
            </h4>
            {loading ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>
                {INFO_MESSAGES.loading}
              </div>
            ) : (
              <div className='space-y-3'>
                {PROVIDERS.map(({ type, label }) => (
                  <ApiKeyInput key={type} provider={type} label={label} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Billing Mode Selection */}
        <BillingModeSelector />
      </div>
    </Card>
  )
}

export default ApiKeysManagement
