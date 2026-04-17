import PromptManagerLayout from '../../components/PromptManager/PromptManagerLayout'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'

const Prompt = () => {
  return (
    <div className='flex h-full flex-col'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col space-y-1 px-10 pt-8'
      >
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20'>
            <BarChart3 className='h-6 w-6 text-amber-600 dark:text-amber-400' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Prompts</h1>
            <p className='text-sm text-muted-foreground'>
              Create, manage, and reuse your prompt templates.
            </p>
          </div>
        </div>
      </motion.div>
      <PromptManagerLayout />
    </div>
  )
}

export default Prompt
