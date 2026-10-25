import { useState } from 'react'
import { useSelector } from 'react-redux'

import { setBackgroundModelAPI } from '@/api/backgroundModels'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { EditLiteLLMBackgroundModelModal } from '@/components/wallet/EditLiteLLMBackgroundModelModal'
import { BackgroundModelOverview } from '@/redux/types/backgroundModels'
import { RootState } from '@/redux/store'
import { toast } from '@/utils/toast'
import CatalogModelSelect from './CatalogModelSelect'

interface YourBackgroundModelCardProps {
  overview: BackgroundModelOverview
  onChanged: (overview: BackgroundModelOverview) => void
}

const YourBackgroundModelCard = ({
  overview,
  onChanged,
}: YourBackgroundModelCardProps) => {
  const [saving, setSaving] = useState(false)
  const [editingKey, setEditingKey] = useState(false)
  const wallets = useSelector((state: RootState) => state.billing.wallets)
  const { litellmKey } = overview

  const choose = async (model: string) => {
    setSaving(true)
    try {
      onChanged(await setBackgroundModelAPI(model))
      toast.success(
        model ? 'Background model updated.' : 'Using the platform models.'
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not update the background model.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (litellmKey) {
    const wallet = wallets.find(
      (w) => w.type === 'LITELLM' && w.refId === litellmKey.id
    )
    return (
      <Card className='border-border bg-card p-6'>
        <h3 className='text-lg font-semibold text-card-foreground'>
          Your background model
        </h3>
        <p className='mt-1 text-sm text-muted-foreground'>
          You are using the LiteLLM key <strong>{litellmKey.label}</strong>.
          Background work runs on the model chosen for that key and is billed by
          your proxy.
        </p>
        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3'>
          <span className='text-sm'>
            {litellmKey.backgroundModel ||
              'None chosen: the platform models run on your DARE wallet.'}
          </span>
          {wallet && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setEditingKey(true)}
            >
              Change
            </Button>
          )}
        </div>
        {wallet && (
          <EditLiteLLMBackgroundModelModal
            isOpen={editingKey}
            onClose={() => setEditingKey(false)}
            wallet={wallet}
          />
        )}
      </Card>
    )
  }

  const staleChoice = overview.selected && !overview.selectedOffered
  return (
    <Card className='border-border bg-card p-6'>
      <h3 className='text-lg font-semibold text-card-foreground'>
        Your background model
      </h3>
      <p className='mt-1 text-sm text-muted-foreground'>
        Pick one model for all background tasks, or keep the models your
        platform administrator chose.
      </p>
      <div className='mt-4 space-y-2'>
        <Label htmlFor='user-background-model'>Model</Label>
        <CatalogModelSelect
          id='user-background-model'
          models={overview.candidates}
          value={overview.selectedOffered ? overview.selected : ''}
          defaultLabel='Use the platform models'
          onChange={choose}
          disabled={saving}
        />
        <p className='text-xs text-muted-foreground'>
          {overview.walletType === 'BYO'
            ? 'Runs on your own API keys. Only providers you have added a key for are listed.'
            : 'Billed to your DARE wallet. Background tasks pause when the wallet is empty.'}
        </p>
        {staleChoice && (
          <p className='text-xs text-destructive'>
            Your earlier choice ({overview.selected}) is not available with your
            current wallet, so the platform models are used.
          </p>
        )}
      </div>
    </Card>
  )
}

export default YourBackgroundModelCard
