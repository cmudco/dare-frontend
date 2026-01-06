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
import { Eye, EyeOff, Key, Trash2, Save, Info } from 'lucide-react'
import { ProviderType, Provider } from '@/redux/types/apiKeys'
import { toast } from '@/utils/toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'

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
  const isLlama = provider === Provider.LLAMA

  // Get provider-specific tooltip content
  const getProviderTooltip = () => {
    switch (provider) {
      case Provider.OPENAI:
        return TOOLTIP_CONTENT.apiKeys.openai
      case Provider.CLAUDE:
        return TOOLTIP_CONTENT.apiKeys.anthropic
      case Provider.GEMINI:
        return TOOLTIP_CONTENT.apiKeys.google
      case Provider.LLAMA:
        return TOOLTIP_CONTENT.apiKeys.llama
      default:
        return null
    }
  }

  const providerTooltip = getProviderTooltip()

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
    <TooltipProvider>
      <div
        className={`space-y-3 rounded-lg border border-border p-4 ${isLlama ? 'bg-muted/50 opacity-75' : 'bg-muted/30'}`}
      >
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Key className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
            <Label className='text-sm font-medium text-foreground'>
              {label}
            </Label>
            {providerTooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <div className='space-y-2'>
                    <p className='font-semibold'>{providerTooltip.title}</p>
                    <p className='text-sm'>{providerTooltip.description}</p>
                    <p className='text-xs text-muted-foreground'>
                      💡 {providerTooltip.tip}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            {isLlama && (
              <span className='rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
                No API Key Required
              </span>
            )}
            {!isLlama && hasKey && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='cursor-help rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                    Active
                  </span>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <div className='space-y-2'>
                    <p className='font-semibold'>
                      {TOOLTIP_CONTENT.apiKeys.activeStatus.title}
                    </p>
                    <p className='text-sm'>
                      {TOOLTIP_CONTENT.apiKeys.activeStatus.description}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {hasKey && maskedKey && !isLlama && (
            <div className='break-all pl-6 font-mono text-xs text-muted-foreground'>
              {maskedKey}
            </div>
          )}
        </div>

        {isLlama && (
          <p className='text-xs text-muted-foreground'>
            LLaMA runs locally via Ollama and doesn't require an API key. Make
            sure Ollama is installed and running on your system.
          </p>
        )}

        {!isLlama && (
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
        )}
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
    </TooltipProvider>
  )
}
