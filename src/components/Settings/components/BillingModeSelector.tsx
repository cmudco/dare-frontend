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
import { AlertCircle } from 'lucide-react'
import { BillingModeType } from '@/redux/types/apiKeys'
import { toast } from '@/utils/toast'
import { BILLING_MODE_INFO, ALERT_STYLES } from '../constants/apiKeys'

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
    <div className='space-y-3 border-t border-border pt-6'>
      <Label
        htmlFor='billing-mode-select'
        className='text-sm font-medium text-foreground'
      >
        Billing Mode
      </Label>
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
            Use Wallet Credits
          </SelectItem>
          <SelectItem
            value='own_api'
            className='text-popover-foreground hover:bg-accent'
            disabled={!hasAnyKey}
          >
            Use Own API Keys {!hasAnyKey && '(Add at least one key first)'}
          </SelectItem>
        </SelectContent>
      </Select>
      <p className='text-xs text-muted-foreground'>{modeInfo.helperText}</p>

      <div className={`rounded-lg border p-4 ${currentStyle.container}`}>
        <div className='flex gap-3'>
          <AlertCircle
            className={`h-5 w-5 flex-shrink-0 ${currentStyle.icon}`}
          />
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
  )
}
