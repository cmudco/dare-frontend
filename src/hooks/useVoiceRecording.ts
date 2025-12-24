/**
 * useVoiceRecording - Simple click-to-toggle recording
 */

import { useState, useRef, useCallback } from 'react'
import RecordRTC, { StereoAudioRecorder } from 'recordrtc'

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const recorderRef = useRef<RecordRTC | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const recorder = new RecordRTC(stream, {
      type: 'audio',
      mimeType: 'audio/wav',
      recorderType: StereoAudioRecorder,
      numberOfAudioChannels: 1,
      desiredSampRate: 16000,
      disableLogs: true,
    })

    recorderRef.current = recorder
    recorder.startRecording()
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current
      if (!recorder) {
        setIsRecording(false)
        resolve(null)
        return
      }

      recorder.stopRecording(() => {
        const blob = recorder.getBlob()

        // Cleanup
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        recorder.destroy()
        recorderRef.current = null
        setIsRecording(false)

        resolve(blob?.size > 1000 ? blob : null)
      })
    })
  }, [])

  return { isRecording, startRecording, stopRecording }
}
