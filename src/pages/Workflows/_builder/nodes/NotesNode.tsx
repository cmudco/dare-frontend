import { type NodeProps } from '@xyflow/react'
import { StickyNote, Trash2 } from 'lucide-react'

import { useAppDispatch } from '@/redux/hooks'
import {
  removeNodeWithEdges,
  setSelectedNodeId,
} from '@/redux/workflowBuilderSlice'

interface NotesNodeData {
  content?: string
}

export default function NotesNode({ id, data, selected }: NodeProps) {
  const dispatch = useAppDispatch()
  const notesData = data as NotesNodeData

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(removeNodeWithEdges({ nodeId: id }))
  }

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(setSelectedNodeId(id))
  }

  return (
    <div
      className={`min-w-[180px] max-w-[280px] cursor-pointer rounded-lg border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-yellow-500/40 dark:from-yellow-500/15 dark:to-yellow-600/10 ${selected ? 'ring-2 ring-primary' : ''}`}
      onClick={handleConfigure}
    >
      {selected && (
        <div className='node-quick-actions'>
          <button
            className='quick-action-btn danger'
            title='Delete'
            onClick={handleDelete}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className='flex items-center gap-2 p-3 pb-2'>
        <div className='rounded-md bg-yellow-100 p-1.5 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'>
          <StickyNote size={14} />
        </div>
        <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          Note
        </span>
      </div>

      <div className='px-3 pb-3'>
        <div className='line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground'>
          {notesData.content || 'Click to add note...'}
        </div>
      </div>
    </div>
  )
}
