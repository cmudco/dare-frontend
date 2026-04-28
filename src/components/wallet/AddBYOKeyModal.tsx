import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { getProviderStatus } from '@/redux/asyncThunks/apiKeys'
import { getWallets } from '@/redux/asyncThunks/billing'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ApiKeyInput } from '@/components/Settings/components'
import { PROVIDERS } from '@/components/Settings/constants/apiKeys'
import { Provider } from '@/redux/types/apiKeys'
import { KeyRound } from 'lucide-react'

interface AddBYOKeyModalProps {
  open: boolean
  onClose: () => void
}

/**
 * BYO key management dialog. Mirrors the Settings page layout exactly: one
 * `<ApiKeyInput />` per remote provider, in the same order. The modal is just
 * a Dialog wrapper around that list so the user gets the identical flow they
 * already know from Settings.
 *
 * Wallet picker re-fetches on close so newly added/removed keys appear in the
 * popover and Billing page immediately.
 */
export const AddBYOKeyModal: React.FC<AddBYOKeyModalProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const loading = useSelector((s: RootState) => s.apiKeys.loading)

  const remoteProviders = useMemo(
    () => PROVIDERS.filter((p) => p.type !== Provider.LLAMA),
    []
  )

  useEffect(() => {
    if (open) {
      dispatch(getProviderStatus())
    }
  }, [open, dispatch])

  const handleClose = () => {
    dispatch(getWallets())
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <KeyRound className='h-4 w-4 text-primary' />
            Manage BYO keys
          </DialogTitle>
          <DialogDescription>
            Add or remove provider API keys. Calls to a provider with a key set
            are billed to your account directly — the DARE wallet is not used.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          {loading ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              Loading providers…
            </p>
          ) : (
            remoteProviders.map((p) => (
              <ApiKeyInput key={p.type} provider={p.type} label={p.label} />
            ))
          )}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
