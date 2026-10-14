import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { testLiteLLMSavedAPI } from '@/api/billing'
import { updateLiteLLMKeyBackgroundModel } from '@/redux/asyncThunks/billing'
import { AppDispatch } from '@/redux/store'
import { UnifiedWallet } from '@/redux/types/billing'
import { BackgroundModelDialog } from './BackgroundModelDialog'

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
  const keyId = wallet.refId
  // The stored key stays server-side; this dialog receives only the model roster.
  const loadModels = useCallback(
    () => testLiteLLMSavedAPI(keyId ?? ''),
    [keyId]
  )

  if (!keyId) return null

  return (
    <BackgroundModelDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Background model for ${wallet.label}`}
      description="Choose from DARE's ranked recommendations or any model exposed by your proxy."
      currentModel={wallet.backgroundModel ?? ''}
      loadModels={loadModels}
      onSave={(backgroundModel) =>
        dispatch(
          updateLiteLLMKeyBackgroundModel({ id: keyId, backgroundModel })
        ).unwrap()
      }
    />
  )
}
