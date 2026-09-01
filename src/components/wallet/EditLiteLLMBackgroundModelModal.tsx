import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { testLiteLLMSavedAPI } from '@/api/billing'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateLiteLLMKeyBackgroundModel } from '@/redux/asyncThunks/billing'
import { AppDispatch } from '@/redux/store'
import { UnifiedWallet } from '@/redux/types/billing'
import { toast } from '@/utils/toast'
import { BackgroundModelSelect } from './BackgroundModelSelect'

interface Props {
  isOpen: boolean
  onClose: () => void
  wallet: UnifiedWallet
}

export const EditLiteLLMBackgroundModelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  wallet,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [models, setModels] = useState<string[]>([])
  const [recommendedModels, setRecommendedModels] = useState<string[]>([])
  const [backgroundModel, setBackgroundModel] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The stored key stays server-side; this dialog receives only the model roster.
  useEffect(() => {
    if (!isOpen || !wallet.refId) return

    setBackgroundModel(wallet.backgroundModel ?? '')
    setRecommendedModels([])
    setError(null)
    setLoading(true)
    testLiteLLMSavedAPI(wallet.refId)
      .then((response) => {
        if (!response.ok) {
          setError(response.error || 'Could not reach the proxy.')
          return
        }

        setModels(response.models)
        setRecommendedModels(response.recommendedModels)
        setBackgroundModel(
          (current) => current || response.recommendedModels[0] || ''
        )
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : 'Request failed.')
      )
      .finally(() => setLoading(false))
  }, [isOpen, wallet.backgroundModel, wallet.refId])

  const handleSave = async () => {
    if (!wallet.refId) return

    setSaving(true)
    try {
      await dispatch(
        updateLiteLLMKeyBackgroundModel({
          id: wallet.refId,
          backgroundModel,
        })
      ).unwrap()
      toast.success('Background model updated.')
      onClose()
    } catch (caught) {
      toast.error(
        typeof caught === 'string'
          ? caught
          : 'Could not update the background model.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Background model for {wallet.label}</DialogTitle>
          <DialogDescription>
            Choose from DARE's ranked recommendations or any model exposed by
            your proxy.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <p className='text-sm text-muted-foreground'>Loading models…</p>
        )}

        {error && !loading && (
          <div className='rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs'>
            <p className='wrap-break-word'>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <BackgroundModelSelect
            id='litellm-background-model'
            models={models}
            recommendedModels={recommendedModels}
            value={backgroundModel}
            onChange={setBackgroundModel}
          />
        )}

        <DialogFooter>
          <Button variant='ghost' onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading || !!error}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
