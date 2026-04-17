import WorkflowManagerLayout from '../../components/WorkflowManager/WorkflowManagerLayout'
import { motion } from 'framer-motion'
import { Workflow } from 'lucide-react'

const Workflows = () => {
  return (
    <div className='flex h-full flex-col'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col space-y-1 px-10 pt-8'
      >
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20'>
            <Workflow className='h-6 w-6 text-emerald-600 dark:text-emerald-400' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Multi-Agent Workflow
            </h1>
            <p className='text-sm text-muted-foreground'>
              Chain prompts into multi-step AI pipelines to automate complex
              tasks.
            </p>
          </div>
        </div>
      </motion.div>

      <WorkflowManagerLayout />
    </div>
  )
}

export default Workflows
