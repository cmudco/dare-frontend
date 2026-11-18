import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Gauge, Unplug, WalletMinimal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getWallets } from '@/redux/asyncThunks/billing'
import { SendRefusalCode, clearSendRefusal } from '@/redux/slices/socketSlice'

const TITLES: Record<SendRefusalCode, string> = {
  [SendRefusalCode.INSUFFICIENT_CREDITS]: 'Out of credits',
  [SendRefusalCode.INSUFFICIENT_BALANCE]: 'Not enough balance',
  [SendRefusalCode.SPEND_LIMIT_REACHED]: 'Allowance used up',
  [SendRefusalCode.PROVIDER_NOT_CONFIGURED]: 'Model not available',
}

const SendRefusalAlert = () => {
  const dispatch = useAppDispatch()
  const sendRefusal = useAppSelector((state) => state.socket.sendRefusal)

  const isProvider =
    sendRefusal?.code === SendRefusalCode.PROVIDER_NOT_CONFIGURED
  // A member cannot fund an allowance; only their instructor can raise it.
  const isAllowance = sendRefusal?.code === SendRefusalCode.SPEND_LIMIT_REACHED

  useEffect(() => {
    if (sendRefusal && !isProvider) dispatch(getWallets())
  }, [sendRefusal, isProvider, dispatch])

  const dismiss = () => dispatch(clearSendRefusal())
  const Icon = isProvider ? Unplug : isAllowance ? Gauge : WalletMinimal

  return (
    <AnimatePresence>
      {sendRefusal && (
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
                {TITLES[sendRefusal.code]}
              </p>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                {sendRefusal.message}
              </p>
              <div className='flex gap-2 pt-2'>
                {!isAllowance && !isProvider && (
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

export default SendRefusalAlert
