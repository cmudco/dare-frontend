import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { testLiteLLMSavedAPI } from '@/api/billing'
import { toast } from '@/utils/toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { updateLiteLLMKeyModels } from '@/redux/asyncThunks/billing'
import { AppDispatch } from '@/redux/store'
import { UnifiedWallet } from '@/redux/types/billing'

interface Props {
  isOpen: boolean
  onClose: () => void
  wallet: UnifiedWallet
}

/** Jobs a conversation needs but the user never asks for. */
const AUXILIARY_JOBS = [
  { key: 'titleModel' as const, label: 'Model for naming conversations' },
  { key: 'memoryModel' as const, label: 'Model for writing memory' },
]

export const EditLiteLLMModelsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  wallet,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [models, setModels] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [choices, setChoices] = useState({ titleModel: '', memoryModel: '' })

  // The roster is fetched with the stored key server-side — the API key itself
  // is never returned, so the dialog cannot probe the proxy directly.
  useEffect(() => {
    if (!isOpen || !wallet.refId) return
    setChoices({
      titleModel: wallet.titleModel ?? '',
      memoryModel: wallet.memoryModel ?? '',
    })
    setError(null)
    setLoading(true)
    testLiteLLMSavedAPI(wallet.refId)
      .then((res) => {
        if (res.ok) setModels(res.models)
        else setError(res.error || 'Could not reach the proxy.')
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Request failed.')
      )
      .finally(() => setLoading(false))
  }, [isOpen, wallet.refId, wallet.titleModel, wallet.memoryModel])

  const handleSave = async () => {
    if (!wallet.refId) return
    setSaving(true)
    try {
      await dispatch(
        updateLiteLLMKeyModels({ id: wallet.refId, ...choices })
      ).unwrap()
      toast.success('Models updated.')
      onClose()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Could not update models.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Models for {wallet.label}</DialogTitle>
          <DialogDescription>
            Pick which model on this proxy handles each background job. Both run
            on your proxy and bill to it.
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

        {!loading &&
          !error &&
          AUXILIARY_JOBS.map((job) => (
            <div key={job.key} className='space-y-1'>
              <Label htmlFor={job.key}>{job.label}</Label>
              <select
                id={job.key}
                value={choices[job.key]}
                onChange={(e) =>
                  setChoices((prev) => ({ ...prev, [job.key]: e.target.value }))
                }
                className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'
              >
                <option value=''>Use the DARE default</option>
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          ))}

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
