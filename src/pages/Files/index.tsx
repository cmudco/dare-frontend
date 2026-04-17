import FileManagerLayout from '../../components/FileManager/FileManagerLayout'
import ProcessingFilesPopover from '../../components/FileManager/ProcessingFilesPopover'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

const Files = () => {
  return (
    <div className='flex h-full flex-col'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex items-center justify-between px-10 pt-8'
      >
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20'>
            <FileText className='h-6 w-6 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Files</h1>
            <p className='text-sm text-muted-foreground'>
              Upload, organize, and manage your documents.
            </p>
          </div>
        </div>
        <ProcessingFilesPopover />
      </motion.div>

      <FileManagerLayout />
    </div>
  )
}

export default Files
