import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '@/redux/store'
import { getWallets } from '@/redux/asyncThunks/billing'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { WalletPickerList } from './WalletPickerList'
import { AddLiteLLMKeyModal } from './AddLiteLLMKeyModal'
import { AddBYOKeyModal } from './AddBYOKeyModal'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import {
  CreditCard as CreditCardIcon,
  ChevronDown,
  Plus,
  KeyRound,
  Network,
  Settings2,
} from 'lucide-react'

/**
 * Header trigger + popover for wallet switching. Replaces the static balance
 * chip — clicking opens a list of every configured wallet so the user can
 * switch active in one click. Inline "Add …" rows appear when BYO/LiteLLM
 * aren't set up; quick-add buttons at the bottom always offer the same.
 * Manage navigates to the Billing page deep view.
 *
 * Brand gradient is the DARE canonical pair `#023572 → #EE183C` (deep navy
 * to DARE red), matching the rest of the platform (Workflows / GroupWallet).
 */
export const WalletPopover: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const wallets = useSelector((s: RootState) => s.billing.wallets)
  const byoEnabled = useFeatureFlag('enableByok')
  const litellmEnabled = useFeatureFlag('enableLitellmWallet')
  const [open, setOpen] = useState(false)
  const [showLite, setShowLite] = useState(false)
  const [showByo, setShowByo] = useState(false)

  const active = wallets.find((w) => w.isActive)

  useEffect(() => {
    dispatch(getWallets())
  }, [dispatch])

  const triggerLabel = active?.label ?? 'DARE Wallet'
  const triggerSecondary =
    active?.status.kind === 'BALANCE'
      ? `$${parseFloat(active.status.balance).toFixed(2)}`
      : 'External'

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            aria-label={`Wallet: ${triggerLabel} (${triggerSecondary})`}
            className='group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#023572]/15 bg-background py-0.5 pl-0.5 pr-3 text-sm font-medium text-foreground shadow-sm transition-all hover:border-[#023572]/40 hover:shadow-md dark:border-[#EE183C]/20 dark:hover:border-[#EE183C]/50'
          >
            <span className='flex h-7 w-7 items-center justify-center rounded-full bg-dare-gradient text-white shadow-inner'>
              <CreditCardIcon className='h-3.5 w-3.5' />
            </span>
            <span className='font-semibold tabular-nums text-foreground'>
              {triggerSecondary}
            </span>
            <span className='hidden h-3 w-px bg-border sm:inline-block' />
            <span className='hidden max-w-[110px] truncate text-xs text-muted-foreground sm:inline'>
              {triggerLabel}
            </span>
            <ChevronDown className='h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180' />
          </button>
        </PopoverTrigger>

        <PopoverContent align='end' className='w-[380px] overflow-hidden p-0'>
          {/* Active wallet header — DARE gradient */}
          <div className='relative bg-dare-gradient px-5 py-4 text-white'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <p className='text-[10px] font-semibold uppercase tracking-wider text-white/80'>
                  Active wallet
                </p>
                <p className='mt-0.5 truncate text-base font-semibold'>
                  {triggerLabel}
                </p>
                <p className='text-xs text-white/85'>{triggerSecondary}</p>
              </div>
              <Button
                size='sm'
                variant='secondary'
                className='h-8 bg-white/15 text-white shadow-none backdrop-blur-sm hover:bg-white/25'
                onClick={() => {
                  setOpen(false)
                  navigate('/billing/')
                }}
              >
                <Settings2 className='mr-1 h-3.5 w-3.5' />
                Manage
              </Button>
            </div>
          </div>

          {/* Wallet picker */}
          <div className='max-h-[320px] overflow-y-auto px-3 py-3'>
            <p className='mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
              Switch default
            </p>
            <WalletPickerList
              compact
              onAddLiteLLM={
                litellmEnabled ? () => setShowLite(true) : undefined
              }
              onAddBYO={byoEnabled ? () => setShowByo(true) : undefined}
            />
          </div>

          <Separator />

          {/* Quick-add — always visible alongside the inline rows so users
              can add additional keys (e.g. a second LiteLLM key) without
              having to scroll past existing rows. */}
          <div className='flex flex-wrap gap-2 px-3 py-3'>
            {litellmEnabled && (
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='flex-1 border-[#023572]/30 text-[#023572] hover:bg-[#023572]/5 dark:border-[#EE183C]/30 dark:text-[#EE183C] dark:hover:bg-[#EE183C]/10'
                onClick={() => setShowLite(true)}
              >
                <Network className='mr-1 h-3.5 w-3.5' />
                <Plus className='mr-1 h-3 w-3' />
                LiteLLM Key
              </Button>
            )}
            {byoEnabled && (
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='flex-1 border-[#EE183C]/30 text-[#EE183C] hover:bg-[#EE183C]/5 dark:border-[#EE183C]/30 dark:hover:bg-[#EE183C]/10'
                onClick={() => setShowByo(true)}
              >
                <KeyRound className='mr-1 h-3.5 w-3.5' />
                <Plus className='mr-1 h-3 w-3' />
                BYO Key
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <AddLiteLLMKeyModal open={showLite} onClose={() => setShowLite(false)} />
      <AddBYOKeyModal open={showByo} onClose={() => setShowByo(false)} />
    </>
  )
}
