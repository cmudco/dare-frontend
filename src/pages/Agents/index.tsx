import AgentManagerLayout from '../../components/AgentManager/AgentManagerLayout'
import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

const Agents = () => {
  return (
    <div className='flex h-full flex-col'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col space-y-1 px-10 pt-8'
      >
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20'>
            <Bot className='h-6 w-6 text-purple-600 dark:text-purple-400' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Agents</h1>
            <p className='text-sm text-muted-foreground'>
              Configure and deploy your AI agents.
            </p>
          </div>
        </div>
      </motion.div>
      <AgentManagerLayout />
    </div>
  )
}

export default Agents
