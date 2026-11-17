import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'

import type { GraphNode } from '@/redux/types/knowledgeGraph'

import { entityKind } from './entityKinds'

const CENTER_HANDLE = {
  top: '50%',
  left: '50%',
  width: 1,
  height: 1,
  minWidth: 0,
  minHeight: 0,
  opacity: 0,
  border: 0,
  pointerEvents: 'none' as const,
}

export type EntityNodeData = {
  entity: GraphNode
  emphasis: 'selected' | 'path' | 'near' | 'plain' | 'dim'
  prominent: boolean
}

const EMPHASIS_CLASS: Record<EntityNodeData['emphasis'], string> = {
  selected: 'border-primary bg-primary text-primary-foreground shadow-md',
  path: 'border-primary bg-primary/15 text-foreground shadow-sm',
  near: 'border-foreground/40 bg-card text-foreground',
  plain: 'border-border bg-card text-foreground hover:border-foreground/40',
  dim: 'border-border/60 bg-card/70 text-muted-foreground opacity-40',
}

const EntityNode = ({ data }: NodeProps<Node<EntityNodeData>>) => {
  const { icon: Icon } = entityKind(data.entity.kind)
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 transition-all duration-150 ${
        data.prominent ? 'py-1.5 text-sm font-medium' : 'py-1 text-xs'
      } ${EMPHASIS_CLASS[data.emphasis]}`}
    >
      <Handle
        type='target'
        position={Position.Top}
        isConnectable={false}
        style={CENTER_HANDLE}
      />
      <Handle
        type='source'
        position={Position.Top}
        isConnectable={false}
        style={CENTER_HANDLE}
      />
      <Icon
        className={`shrink-0 ${data.prominent ? 'h-3.5 w-3.5' : 'h-3 w-3'}`}
      />
      <span className='max-w-44 truncate whitespace-nowrap'>
        {data.entity.label}
      </span>
      {data.entity.elsewhere > 0 && (
        <span
          title={`${data.entity.elsewhere} related ${
            data.entity.elsewhere === 1 ? 'name is' : 'names are'
          } not on this page. Select this name to list them.`}
          className='shrink-0 text-[10px] tabular-nums opacity-70'
        >
          +{data.entity.elsewhere}
        </span>
      )}
    </div>
  )
}

export default EntityNode
