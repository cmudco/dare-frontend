import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface NotesNodeData {
  content?: string
}

interface NotesNodeConfigProps {
  nodeData: NotesNodeData
  updateNodeData: (updates: Record<string, unknown>) => void
}

export default function NotesNodeConfig({
  nodeData,
  updateNodeData,
}: NotesNodeConfigProps) {
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='note-content'>Note</Label>
        <Textarea
          id='note-content'
          value={nodeData.content || ''}
          onChange={(e) => updateNodeData({ content: e.target.value })}
          placeholder='Add your notes, documentation, or comments here...'
          className='min-h-[300px] resize-y'
        />
      </div>
    </div>
  )
}
