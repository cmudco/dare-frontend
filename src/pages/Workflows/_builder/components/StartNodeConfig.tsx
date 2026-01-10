import { ArrowRight, GitBranch } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useEffect } from 'react'

// Start Node Data Type
export type StartNodeData = {
  title?: string
  description?: string
  mode?: 'sequential' | 'parallel'
}

interface StartNodeConfigProps {
  nodeData: StartNodeData
  updateNodeData: (updates: Record<string, unknown>) => void
}

export default function StartNodeConfig({
  nodeData,
  updateNodeData,
}: StartNodeConfigProps) {
  // Local state for text inputs to prevent cursor jumping
  const [localTitle, setLocalTitle] = useState(nodeData?.title || '')
  const [localDescription, setLocalDescription] = useState(
    nodeData?.description || ''
  )

  // Sync local state when external data changes
  useEffect(() => {
    setLocalTitle(nodeData?.title || '')
  }, [nodeData?.title])

  useEffect(() => {
    setLocalDescription(nodeData?.description || '')
  }, [nodeData?.description])

  // Debounced sync to Redux for text inputs
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localTitle !== (nodeData?.title || '')) {
        updateNodeData({ title: localTitle })
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [localTitle, nodeData?.title, updateNodeData])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localDescription !== (nodeData?.description || '')) {
        updateNodeData({ description: localDescription })
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [localDescription, nodeData?.description, updateNodeData])

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='title' className='text-xs font-medium'>
          Title
        </Label>
        <Input
          id='title'
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder='Enter workflow title'
          className='bg-background text-sm'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description' className='text-xs font-medium'>
          Description
        </Label>
        <Textarea
          id='description'
          value={localDescription}
          onChange={(e) => setLocalDescription(e.target.value)}
          placeholder='Enter your description here'
          className='resize-none bg-background text-sm'
          rows={3}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='mode' className='text-xs font-medium'>
          Execution Mode
        </Label>
        <Select
          value={nodeData?.mode || 'sequential'}
          onValueChange={(value: 'sequential' | 'parallel') => {
            updateNodeData({ mode: value })
          }}
        >
          <SelectTrigger className='bg-background text-sm'>
            <SelectValue placeholder='Select execution mode' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='sequential'>
              <div className='flex items-center gap-2'>
                <ArrowRight className='h-3 w-3' />
                Sequential
              </div>
            </SelectItem>
            <SelectItem value='parallel'>
              <div className='flex items-center gap-2'>
                <GitBranch className='h-3 w-3' />
                Parallel
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='text-xs text-muted-foreground'>
        {(nodeData?.mode || 'sequential') === 'sequential'
          ? 'Steps execute one after another in sequence'
          : 'Multiple steps can execute simultaneously from this start point'}
      </div>
    </div>
  )
}
