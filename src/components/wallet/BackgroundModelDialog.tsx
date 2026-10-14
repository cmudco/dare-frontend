import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LiteLLMTestResponse } from '@/redux/types/billing'
import { toast } from '@/utils/toast'
import { BackgroundModelSelect } from './BackgroundModelSelect'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  currentModel: string
  /** Must be stable (useCallback); a new function reloads the roster. */
  loadModels: () => Promise<LiteLLMTestResponse>
  onSave: (backgroundModel: string) => Promise<unknown>
}

/** Picks a key's background model from the models its gateway serves. */
export const BackgroundModelDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  description,
  currentModel,
  loadModels,
  onSave,
}) => {
  const [models, setModels] = useState<string[]>([])
  const [recommendedModels, setRecommendedModels] = useState<string[]>([])
  const [backgroundModel, setBackgroundModel] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    setBackgroundModel(currentModel)
    setRecommendedModels([])
    setError(null)
    setLoading(true)
    loadModels()
      .then((response) => {
        if (!response.ok) {
          setError(response.error || 'Could not reach the gateway.')
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
  }, [isOpen, currentModel, loadModels])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(backgroundModel)
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
