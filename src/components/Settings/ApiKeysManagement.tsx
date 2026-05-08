import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { getProviderStatus, getBillingMode } from '@/redux/asyncThunks/apiKeys'
import { getFeatureFlags } from '@/redux/asyncThunks/billing'
import { Card } from '@/components/ui/card'
import { AlertCircle, Info, Lock } from 'lucide-react'
import { ApiKeyInput, BillingModeSelector } from './components'
import { PROVIDERS, INFO_MESSAGES, ALERT_STYLES } from './constants/apiKeys'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'

const ApiKeysManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, updateError } = useSelector(
    (state: RootState) => state.apiKeys
  )
  const byoEnabled = useSelector((state: RootState) => state.billing.byoEnabled)

  useEffect(() => {
    dispatch(getProviderStatus())
    dispatch(getBillingMode())
    dispatch(getFeatureFlags())
  }, [dispatch])

  return (
    <TooltipProvider>
      <Card data-tour='settings-api-keys' className='border-border bg-card p-6'>
        <div className='space-y-6'>
          {/* Header */}
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg font-semibold text-card-foreground'>
                Billing & API Keys
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-4 w-4 cursor-help text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <div className='space-y-2'>
                    <p className='font-semibold'>
                      {TOOLTIP_CONTENT.apiKeys.header.title}
                    </p>
                    <p className='text-sm'>
                      {TOOLTIP_CONTENT.apiKeys.header.description}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      💡 {TOOLTIP_CONTENT.apiKeys.header.tip}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className='mt-1 text-sm text-muted-foreground'>
              Choose how you want to pay for AI model usage.
            </p>
          </div>

          {/* API Keys Section — gated on the platform-wide BYO flag.
              When the admin disables BYO, neither adding/removing provider
              keys nor switching billing mode is available to users. */}
          {byoEnabled ? (
            <>
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
                      <p
                        className={`text-sm font-medium ${ALERT_STYLES.info.title}`}
                      >
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
                  <div className='flex items-center gap-2'>
                    <h4 className='text-sm font-medium text-foreground'>
                      Provider API Keys
                    </h4>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                      </TooltipTrigger>
                      <TooltipContent className='max-w-xs'>
                        <div className='space-y-2'>
                          <p className='font-semibold'>
                            {TOOLTIP_CONTENT.apiKeys.security.title}
                          </p>
                          <p className='text-sm'>
                            {TOOLTIP_CONTENT.apiKeys.security.description}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            💡 {TOOLTIP_CONTENT.apiKeys.security.tip}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
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
            </>
          ) : (
            <div
              className={`rounded-lg border p-6 ${ALERT_STYLES.info.container}`}
            >
              <div className='flex gap-3'>
                <Lock
                  className={`h-5 w-5 flex-shrink-0 ${ALERT_STYLES.info.icon}`}
                />
                <div className='space-y-1'>
                  <p
                    className={`text-sm font-medium ${ALERT_STYLES.info.title}`}
                  >
                    BYO keys are disabled on this platform
                  </p>
                  <p className={`text-xs ${ALERT_STYLES.info.text}`}>
                    Your administrator has turned off the option to bring your
                    own provider API keys. All LLM usage is billed through your
                    DARE wallet. Reach out to your admin if you need access.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  )
}

export default ApiKeysManagement
