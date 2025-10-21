import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import {
  updateApiKey,
  deleteApiKey,
  getProviderStatus,
} from '@/redux/asyncThunks/apiKeys'
import { clearApiKeysError } from '@/redux/apiKeysSlice'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import { Eye, EyeOff, Key, Trash2, Save } from 'lucide-react'
import { ProviderType } from '@/redux/types/apiKeys'
import { toast } from '@/utils/toast'

interface ApiKeyInputProps {
  provider: ProviderType
  label: string
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  provider,
  label,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [apiKey, setApiKey] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { providerStatus, updating } = useSelector(
    (state: RootState) => state.apiKeys
  )

  const providerInfo = providerStatus?.[provider]
  const hasKey = providerInfo?.hasKey || false
  const maskedKey = providerInfo?.maskedKey

  const handleSave = async () => {
    if (!apiKey.trim()) return

    setIsSaving(true)
    try {
      await dispatch(updateApiKey({ provider, apiKey: apiKey.trim() })).unwrap()
      setApiKey('')
      setIsVisible(false)
      dispatch(getProviderStatus())
      toast.success(`${label} API key saved successfully`)
    } catch (error) {
      toast.error(`Failed to save ${label} API key`)
      console.error('Error saving API key:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteApiKey(provider)).unwrap()
      setApiKey('')
      dispatch(getProviderStatus())
      toast.success(`${label} API key deleted successfully`)
    } catch (error) {
      toast.error(`Failed to delete ${label} API key`)
      console.error('Error deleting API key:', error)
    }
  }

  const handleChange = (value: string) => {
    setApiKey(value)
    dispatch(clearApiKeysError())
  }

  return (
    <>
      <div className='space-y-3 rounded-lg border border-border bg-muted/30 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Key className='h-4 w-4 text-muted-foreground' />
            <Label className='text-sm font-medium text-foreground'>
              {label}
            </Label>
            {hasKey && (
              <span className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                Active
              </span>
            )}
          </div>
          {hasKey && maskedKey && (
            <span className='font-mono text-xs text-muted-foreground'>
              {maskedKey}
            </span>
          )}
        </div>

        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <Input
              type={isVisible ? 'text' : 'password'}
              placeholder={
                hasKey
                  ? 'Enter new API key to update'
                  : `Enter your ${label} API key`
              }
              value={apiKey}
              onChange={(e) => handleChange(e.target.value)}
              className='border-border bg-background pr-10 font-mono text-sm text-foreground'
            />
            {apiKey && (
              <button
                type='button'
                onClick={() => setIsVisible(!isVisible)}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                {isVisible ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={!apiKey.trim() || isSaving || updating}
            size='sm'
            className='gap-2'
          >
            <Save className='h-4 w-4' />
            {isSaving ? 'Saving...' : hasKey ? 'Update' : 'Save'}
          </Button>

          {hasKey && (
            <Button
              onClick={handleDeleteClick}
              disabled={isSaving || updating}
              size='sm'
              variant='destructive'
              className='gap-2'
            >
              <Trash2 className='h-4 w-4' />
              Delete
            </Button>
          )}
        </div>
      </div>

      <DeleteConfirmation
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={handleDeleteConfirm}
        title='Delete API Key'
        description='Are you sure you want to delete this API key? This action cannot be undone.'
        itemName={`${label} API Key`}
        confirmText='Delete'
        cancelText='Cancel'
      />
    </>
  )
}
