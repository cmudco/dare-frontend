import { motion } from 'framer-motion'
import { LayoutTemplate } from 'lucide-react'
import { NavLink, Navigate, useParams } from 'react-router-dom'
import AgentManagerLayout from '@/components/AgentManager/AgentManagerLayout'
import PromptManagerLayout from '@/components/PromptManager/PromptManagerLayout'
import { cn } from '@/lib/utils'
import { AGENT_TEMPLATES_PATH, PROMPT_TEMPLATES_PATH } from '@/routes/paths'

const TABS = [
  { key: 'prompts', label: 'Prompts', path: PROMPT_TEMPLATES_PATH },
  { key: 'agents', label: 'Agents', path: AGENT_TEMPLATES_PATH },
]

/** Prompts and the agents built on them, as two tabs of one page. */
const Templates = () => {
  const { tab } = useParams<{ tab: string }>()
  if (!TABS.some((item) => item.key === tab))
    return <Navigate to={PROMPT_TEMPLATES_PATH} replace />

  return (
    <div className='flex h-full flex-col'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col gap-4 px-10 pt-8'
      >
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-muted p-2'>
            <LayoutTemplate className='h-6 w-6 text-muted-foreground' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Templates</h1>
            <p className='text-sm text-muted-foreground'>
              Reusable prompts, and agents that pair a prompt with a model,
              files and settings.
            </p>
          </div>
        </div>
        <nav
          aria-label='Template types'
          className='flex gap-1'
          data-tour='templates-tabs'
        >
          {TABS.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-accent font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </motion.div>
      {tab === 'agents' ? <AgentManagerLayout /> : <PromptManagerLayout />}
    </div>
  )
}

export default Templates
