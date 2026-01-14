import { useNavigate } from 'react-router-dom'
import { McpTool } from '@/redux/types/mcp'
import { Wrench } from 'lucide-react'

interface MCPToolCardProps {
  tool: McpTool
  serverSlug: string
}

/**
 * MCPToolCard - Display a single MCP tool as a clickable card
 */
const MCPToolCard = ({ tool, serverSlug }: MCPToolCardProps) => {
  const navigate = useNavigate()

  const argCount = tool.inputSchema?.properties
    ? Object.keys(tool.inputSchema.properties).length
    : 0
  const requiredCount = tool.inputSchema?.required?.length || 0

  return (
    <div
      onClick={() => navigate(`/mcp/${serverSlug}/tools/${tool.name}`)}
      className='group cursor-pointer rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm'
    >
      <div className='mb-2 flex items-start justify-between'>
        <div className='flex items-center gap-2'>
          <Wrench className='h-4 w-4 text-muted-foreground' />
          <h4 className='font-medium group-hover:text-primary'>{tool.name}</h4>
        </div>
        <span className='text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100'>
          Execute →
        </span>
      </div>
      <p className='mb-3 line-clamp-2 text-sm text-muted-foreground'>
        {tool.description || 'No description'}
      </p>
      <div className='text-xs text-muted-foreground'>
        {argCount} args ({requiredCount} required)
      </div>
    </div>
  )
}

export default MCPToolCard
