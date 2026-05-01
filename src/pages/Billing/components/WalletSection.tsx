import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { getWallets, getFeatureFlags } from '@/redux/asyncThunks/billing'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Wallet as WalletIcon, KeyRound, Network } from 'lucide-react'
import { WalletPickerList } from '@/components/wallet/WalletPickerList'
import { AddLiteLLMKeyModal } from '@/components/wallet/AddLiteLLMKeyModal'
import { AddBYOKeyModal } from '@/components/wallet/AddBYOKeyModal'

/**
 * Top-of-Billing-page section that surfaces every configured wallet, the
 * currently active one, and add-key affordances. Mirrors the popover but
 * roomier; both surfaces share `<WalletPickerList />` so behaviour stays
 * consistent. Uses the canonical DARE brand gradient `#023572 → #EE183C`.
 */
export const WalletSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const wallets = useSelector((s: RootState) => s.billing.wallets)
  const byoEnabled = useSelector((s: RootState) => s.billing.byoEnabled)
  const [showLite, setShowLite] = useState(false)
  const [showByo, setShowByo] = useState(false)

  useEffect(() => {
    dispatch(getWallets())
    dispatch(getFeatureFlags())
  }, [dispatch])

  const active = wallets.find((w) => w.isActive)

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='border-b bg-dare-gradient p-5 text-white'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <div className='rounded-lg bg-white/15 p-2 backdrop-blur-sm'>
                <WalletIcon className='h-5 w-5 text-white' />
              </div>
              <h2 className='text-lg font-semibold'>Wallet</h2>
            </div>
            <p className='mt-1 text-sm text-white/85'>
              {active ? (
                <>
                  Currently routing through{' '}
                  <span className='font-semibold text-white'>
                    {active.label}
                  </span>
                  {active.status.kind === 'BALANCE' && (
                    <>
                      {' · Balance '}
                      <span className='font-semibold text-white'>
                        ${parseFloat(active.status.balance).toFixed(2)}
                      </span>
                    </>
                  )}
                </>
              ) : (
                'Choose how your LLM calls are billed.'
              )}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              size='sm'
              variant='secondary'
              className='bg-white/15 text-white shadow-none backdrop-blur-sm hover:bg-white/25'
              onClick={() => setShowLite(true)}
            >
              <Network className='mr-1 h-3.5 w-3.5' />
              <Plus className='mr-1 h-3 w-3' />
              LiteLLM Key
            </Button>
            {byoEnabled && (
              <Button
                type='button'
                size='sm'
                variant='secondary'
                className='bg-white/15 text-white shadow-none backdrop-blur-sm hover:bg-white/25'
                onClick={() => setShowByo(true)}
              >
                <KeyRound className='mr-1 h-3.5 w-3.5' />
                <Plus className='mr-1 h-3 w-3' />
                BYO Key
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-4'>
        <WalletPickerList
          onAddLiteLLM={() => setShowLite(true)}
          onAddBYO={byoEnabled ? () => setShowByo(true) : undefined}
        />
      </CardContent>

      <AddLiteLLMKeyModal open={showLite} onClose={() => setShowLite(false)} />
      <AddBYOKeyModal open={showByo} onClose={() => setShowByo(false)} />
    </Card>
  )
}
