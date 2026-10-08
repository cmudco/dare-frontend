import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Gauge, WalletMinimal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getWallets } from '@/redux/asyncThunks/billing'
import { BillingErrorCode, clearBillingError } from '@/redux/slices/socketSlice'

const TITLES: Record<BillingErrorCode, string> = {
  [BillingErrorCode.INSUFFICIENT_CREDITS]: 'Out of credits',
  [BillingErrorCode.INSUFFICIENT_BALANCE]: 'Not enough balance',
  [BillingErrorCode.SPEND_LIMIT_REACHED]: 'Allowance used up',
}

const BillingErrorAlert = () => {
  const dispatch = useAppDispatch()
  const billingError = useAppSelector((state) => state.socket.billingError)

  useEffect(() => {
    if (billingError) dispatch(getWallets())
  }, [billingError, dispatch])

  const dismiss = () => dispatch(clearBillingError())
  // A member cannot fund an allowance; only their instructor can raise it.
  const isAllowance =
    billingError?.code === BillingErrorCode.SPEND_LIMIT_REACHED
  const Icon = isAllowance ? Gauge : WalletMinimal

  return (
    <AnimatePresence>
      {billingError && (
        <motion.div
          role='alert'
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className='fixed top-20 right-4 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg'
        >
          <div className='h-1 w-full bg-destructive/70' />
          <div className='flex gap-3 p-4'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
              <Icon className='h-4 w-4' aria-hidden />
            </div>
            <div className='min-w-0 flex-1 space-y-1'>
              <p className='text-sm font-semibold'>
                {TITLES[billingError.code]}
              </p>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                {billingError.message}
              </p>
              <div className='flex gap-2 pt-2'>
                {!isAllowance && (
                  <Button asChild size='sm' onClick={dismiss}>
                    <Link to='/billing/'>Add funds</Link>
                  </Button>
                )}
                <Button size='sm' variant='outline' onClick={dismiss}>
                  Got it
                </Button>
              </div>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='-mt-1 -mr-1 h-7 w-7 shrink-0 text-muted-foreground'
              onClick={dismiss}
              aria-label='Dismiss'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BillingErrorAlert
