import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { createNodeAtPosition, resetBuilder } from '@/redux/workflowBuilderSlice'

interface NodeToolbarProps {
  disabled?: boolean
}

export const NodeToolbar = ({
  disabled,
}: NodeToolbarProps) => {
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((state) => state.workflowBuilder.nodes)

  const hasStartNode = nodes.some((n) => n.type === 'start')

  const handleAddNode = (type: string) => {
    // Position new nodes in a reasonable location
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 200 + 100,
    }
    dispatch(createNodeAtPosition({ type, position }))
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
        padding: '8px',
        background: 'white',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <button
        onClick={() => handleAddNode('start')}
        disabled={disabled || hasStartNode}
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: hasStartNode ? '#f5f5f5' : 'white',
          cursor: disabled || hasStartNode ? 'not-allowed' : 'pointer',
          fontSize: '12px',
        }}
      >
        + Start
      </button>

      <button
        onClick={() => handleAddNode('step')}
        disabled={disabled || !hasStartNode}
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: disabled || !hasStartNode ? '#f5f5f5' : 'white',
          cursor: disabled || !hasStartNode ? 'not-allowed' : 'pointer',
          fontSize: '12px',
        }}
      >
        + Step
      </button>

      <button
        onClick={() => handleAddNode('chatOutput')}
        disabled={disabled || !hasStartNode}
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: disabled || !hasStartNode ? '#f5f5f5' : 'white',
          cursor: disabled || !hasStartNode ? 'not-allowed' : 'pointer',
          fontSize: '12px',
        }}
      >
        + Output
      </button>

      {nodes.length > 0 && (
        <>
          <div
            style={{
              width: '1px',
              height: '24px',
              background: '#ddd',
              margin: '0 4px',
            }}
          />
          <button
            onClick={() => dispatch(resetBuilder())}
            disabled={disabled}
            style={{
              padding: '8px 12px',
              border: '1px solid #dc3545',
              borderRadius: '4px',
              background: disabled ? '#f5f5f5' : '#dc3545',
              color: disabled ? '#666' : 'white',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '12px',
            }}
          >
            Clear All
          </button>
        </>
      )}
    </div>
  )
}
