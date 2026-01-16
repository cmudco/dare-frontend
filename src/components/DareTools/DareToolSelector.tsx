/**
 * DareToolSelector Component
 *
 * Allows users to select which DARE tools are enabled for a conversation.
 * Similar to MCPServerSelector but simpler (no credentials required).
 */

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Wrench,
  ChevronDown,
  GitBranch,
  BarChart3,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RootState, AppDispatch } from '@/redux/store'
import { getDareTools } from '@/redux/asyncThunks/dareTools'
import { DareTool } from '@/redux/types/dareTools'

interface DareToolSelectorProps {
  selectedSlugs: string[]
  onChange: (slugs: string[]) => void
  disabled?: boolean
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  diagram: <GitBranch className='h-4 w-4 text-primary' />,
  chart: <BarChart3 className='h-4 w-4 text-primary' />,
}

export const DareToolSelector: React.FC<DareToolSelectorProps> = ({
  selectedSlugs,
  onChange,
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [open, setOpen] = useState(false)

  const tools = useSelector((state: RootState) => state.dareTools.tools)
  const loading = useSelector((state: RootState) => state.dareTools.loading)

  // Fetch tools on mount if not already loaded
  useEffect(() => {
    if (tools.length === 0 && !loading) {
      dispatch(getDareTools())
    }
  }, [dispatch, tools.length, loading])

  const handleToggleTool = (slug: string) => {
    const newSlugs = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((s) => s !== slug)
      : [...selectedSlugs, slug]
    onChange(newSlugs)
  }

  const selectedCount = selectedSlugs.length

  const getToolIcon = (tool: DareTool) => {
    return TOOL_ICONS[tool.icon] || <Wrench className='h-4 w-4 text-primary' />
  }

  /**
   * Get display label for the tool selector button
   */
  const getDisplayLabel = (): string => {
    if (selectedCount === 0) return 'Tools'
    if (selectedCount === 1) {
      return tools.find((t) => t.slug === selectedSlugs[0])?.name || 'Tool'
    }
    return `${selectedCount} Tools`
  }

  const displayLabel = getDisplayLabel()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          disabled={disabled}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm transition-all ${
            selectedCount > 0
              ? 'bg-primary/15 text-primary'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          title='DARE Tools'
        >
          <Wrench className='h-4 w-4' />
          <span>{displayLabel}</span>
          <ChevronDown className='h-3 w-3 opacity-60' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 rounded-xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-[#1e1e2e]'
        align='start'
      >
        <div className='mb-1.5 flex items-center gap-2'>
          <Wrench className='h-[18px] w-[18px] text-primary' />
          <span className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
            DARE Tools
          </span>
        </div>
        <div className='mb-3 text-xs text-gray-500'>
          Enable AI-powered tools for this conversation
        </div>

        {loading ? (
          <div className='flex items-center justify-center gap-2 py-6 text-sm text-gray-500'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Loading tools...</span>
          </div>
        ) : tools.length === 0 ? (
          <div className='py-6 text-center text-sm text-gray-500'>
            No tools available
          </div>
        ) : (
          <div className='flex flex-col gap-1'>
            {tools.map((tool) => {
              const isSelected = selectedSlugs.includes(tool.slug)
              return (
                <button
                  key={tool.slug}
                  className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-transparent hover:border-gray-200 hover:bg-gray-100 dark:hover:border-white/10 dark:hover:bg-white/5'
                  }`}
                  onClick={() => handleToggleTool(tool.slug)}
                >
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5'>
                    {getToolIcon(tool)}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-0.5 text-[13px] font-medium text-gray-900 dark:text-gray-100'>
                      {tool.name}
                    </div>
                    <div className='line-clamp-2 text-[11px] leading-relaxed text-gray-500'>
                      {tool.description}
                    </div>
                  </div>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center'>
                    {isSelected && <Check className='h-4 w-4 text-primary' />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default DareToolSelector
