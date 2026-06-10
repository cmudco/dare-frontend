import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { updateBillingMode } from '@/redux/asyncThunks/apiKeys'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Info } from 'lucide-react'
import { BillingModeType } from '@/redux/types/apiKeys'
import { toast } from '@/utils/toast'
import { BILLING_MODE_INFO, ALERT_STYLES } from '../constants/apiKeys'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'

export const BillingModeSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { billingMode, updating, providerStatus } = useSelector(
    (state: RootState) => state.apiKeys
  )

  // we need at least one key to enable 'own_api' option
  const hasAnyKey = providerStatus
    ? Object.values(providerStatus).some((status) => status.hasKey)
    : false

  const handleBillingModeChange = async (mode: string) => {
    try {
      await dispatch(updateBillingMode(mode as BillingModeType)).unwrap()
      toast.success('Billing mode updated successfully')
    } catch (error) {
      toast.error('Failed to update billing mode')
      console.error('Error updating billing mode:', error)
    }
  }

  const currentMode = billingMode || 'wallet'
  const modeInfo = BILLING_MODE_INFO[currentMode]
  const variant =
    billingMode === 'wallet' ? ('success' as const) : ('warning' as const)
  const currentStyle = ALERT_STYLES[variant]

  return (
    <TooltipProvider>
      <div className='space-y-3 border-t border-border pt-6'>
        <div className='flex items-center gap-2'>
          <Label
            htmlFor='billing-mode-select'
            className='text-sm font-medium text-foreground'
          >
            Billing Mode
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
            </TooltipTrigger>
            <TooltipContent className='max-w-xs'>
              <div className='space-y-2'>
                <p className='font-semibold'>
                  {TOOLTIP_CONTENT.billing.mode.title}
                </p>
                <p className='text-sm'>
                  {TOOLTIP_CONTENT.billing.mode.description}
                </p>
                <p className='text-xs text-muted-foreground'>
                  💡 {TOOLTIP_CONTENT.billing.mode.tip}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={billingMode}
          onValueChange={handleBillingModeChange}
          disabled={updating}
        >
          <SelectTrigger
            id='billing-mode-select'
            className='w-full max-w-xs border-border bg-background text-foreground'
          >
            <SelectValue placeholder='Select billing mode' />
          </SelectTrigger>
          <SelectContent className='border-border bg-popover'>
            <SelectItem
              value='wallet'
              className='text-popover-foreground hover:bg-accent'
            >
              <div className='flex items-center gap-2'>
                Use Wallet Credits
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-3 w-3 cursor-help text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent className='max-w-xs' side='right'>
                    <div className='space-y-2'>
                      <p className='font-semibold'>
                        {TOOLTIP_CONTENT.billing.walletCredits.title}
                      </p>
                      <p className='text-sm'>
                        {TOOLTIP_CONTENT.billing.walletCredits.description}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        💡 {TOOLTIP_CONTENT.billing.walletCredits.tip}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </SelectItem>
            <SelectItem
              value='own_api'
              className='text-popover-foreground hover:bg-accent'
              disabled={!hasAnyKey}
            >
              <div className='flex items-center gap-2'>
                Use Own API Keys {!hasAnyKey && '(Add at least one key first)'}
                {hasAnyKey ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3 w-3 cursor-help text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs' side='right'>
                      <div className='space-y-2'>
                        <p className='font-semibold'>
                          {TOOLTIP_CONTENT.billing.ownApiKeys.title}
                        </p>
                        <p className='text-sm'>
                          {TOOLTIP_CONTENT.billing.ownApiKeys.description}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          💡 {TOOLTIP_CONTENT.billing.ownApiKeys.tip}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3 w-3 cursor-help text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs' side='right'>
                      <div className='space-y-2'>
                        <p className='font-semibold'>
                          {TOOLTIP_CONTENT.billing.requiresKey.title}
                        </p>
                        <p className='text-sm'>
                          {TOOLTIP_CONTENT.billing.requiresKey.description}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          💡 {TOOLTIP_CONTENT.billing.requiresKey.tip}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className='text-xs text-muted-foreground'>{modeInfo.helperText}</p>

        <div className={`rounded-lg border p-4 ${currentStyle.container}`}>
          <div className='flex gap-3'>
            <AlertCircle className={`h-5 w-5 shrink-0 ${currentStyle.icon}`} />
            <div className='space-y-1'>
              <p className={`text-sm font-medium ${currentStyle.title}`}>
                {modeInfo.title}
              </p>
              <p className={`text-xs ${currentStyle.text}`}>
                {modeInfo.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
