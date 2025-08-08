import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { Button } from '../ui/button'
import { Download } from 'lucide-react'
import { exportConversationPdfAPI } from '../../api/conversation'

const ExportButton: React.FC = () => {
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )

  const handleExportConversation = async () => {
    if (!activeConversation) return

    try {
      const { blob, filename } = await exportConversationPdfAPI(
        activeConversation.conversationId
      )

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting conversation:', error)
      // You might want to show a toast notification here
    }
  }

  if (!activeConversation) return null

  return (
    <Button
      variant='ghost'
      className='group flex h-9 items-center gap-2 px-3 hover:bg-gray-200 dark:hover:bg-white/10'
      onClick={handleExportConversation}
      title='Export conversation as PDF'
    >
      <Download className='h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-white' />
      <span className='text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-white'>
        Export
      </span>
    </Button>
  )
}

export default ExportButton
