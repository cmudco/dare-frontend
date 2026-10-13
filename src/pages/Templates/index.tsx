import { motion } from 'framer-motion'
import { Bot, LayoutTemplate } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import AgentManagerLayout from '@/components/AgentManager/AgentManagerLayout'
import PromptManagerLayout from '@/components/PromptManager/PromptManagerLayout'
import { PROMPT_TEMPLATES_PATH } from '@/routes/paths'

const SECTIONS = {
  prompts: {
    title: 'Prompts',
    description: 'Reusable instructions you can apply in any conversation.',
    icon: LayoutTemplate,
  },
  agents: {
    title: 'Agents',
    description:
      'A prompt paired with a model, files and settings, ready for chats and workflows.',
    icon: Bot,
  },
} as const

const Templates = () => {
  const { tab } = useParams<{ tab: string }>()
  if (tab !== 'prompts' && tab !== 'agents')
    return <Navigate to={PROMPT_TEMPLATES_PATH} replace />

  const section = SECTIONS[tab]
  const Icon = section.icon

  return (
    <div className='flex h-full flex-col'>
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex items-center gap-3 px-10 pt-8'
      >
        <div className='rounded-lg bg-muted p-2'>
          <Icon className='h-6 w-6 text-muted-foreground' />
        </div>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>{section.title}</h1>
          <p className='text-sm text-muted-foreground'>{section.description}</p>
        </div>
      </motion.div>
      {tab === 'agents' ? <AgentManagerLayout /> : <PromptManagerLayout />}
    </div>
  )
}

export default Templates
