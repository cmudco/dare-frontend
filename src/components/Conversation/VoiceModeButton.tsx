/**
 * VoiceModeButton - Click to record, click to stop
 * Transcription goes to input box for user review
 */

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Mic, Square, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { useVoiceRecording } from '@/hooks/useVoiceRecording'
import { AppDispatch, RootState } from '@/redux/store'
import { socketSendVoiceMessage } from '@/redux/middleware/socketMiddleware'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

const VoiceModeButton: React.FC<{ disabled?: boolean }> = ({
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )

  const { isRecording, startRecording, stopRecording } = useVoiceRecording()
  const [isProcessing, setIsProcessing] = useState(false)
  const enableVoiceInput = useFeatureFlag('enableVoiceInput')

  const handleClick = async () => {
    if (disabled || isProcessing) return

    if (isRecording) {
      const blob = await stopRecording()
      if (!blob || !activeConversation?.conversationId) return

      setIsProcessing(true)
      dispatch(
        socketSendVoiceMessage(activeConversation.conversationId, blob, 'en')
      )

      // Reset processing after a timeout (transcription will update input)
      setTimeout(() => setIsProcessing(false), 5000)
    } else {
      await startRecording()
    }
  }

  if (!enableVoiceInput) return null

  const showLoader = isProcessing && !isRecording

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={disabled || isProcessing}
      title={
        isProcessing
          ? 'Transcribing...'
          : isRecording
            ? 'Click to stop'
            : 'Click to record'
      }
      className={clsx(
        'flex h-8 w-8 items-center justify-center rounded-full transition-all',
        disabled && 'cursor-not-allowed opacity-50',
        showLoader && 'bg-purple-100 text-purple-600 dark:bg-purple-900/50',
        isRecording && 'animate-pulse bg-red-500 text-white',
        !isRecording &&
          !showLoader &&
          'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
      )}
    >
      {showLoader ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : isRecording ? (
        <Square className='h-3 w-3' />
      ) : (
        <Mic className='h-4 w-4' />
      )}
    </button>
  )
}

export default VoiceModeButton
