import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { FileText, AlertCircle, Download, ExternalLink } from 'lucide-react'
import axios from 'axios'
import FileStructurePanel from './FileStructurePanel'

interface FileViewerModalProps {
  isOpen: boolean
  onClose: () => void
  fileId: number | null
  fileName: string
  fileType?: string
}

/**
 * Modal component for viewing files (PDF, TXT, DOCX) with proper authentication.
 * Uses blob URLs for secure file display in iframe.
 *
 * The Structure tab shows the parsed document model behind the file — headings,
 * tables and where each image sits — which is the only place the scanned-page
 * count is visible.
 */
const FileViewerModal = ({
  isOpen,
  onClose,
  fileId,
  fileName,
  fileType,
}: FileViewerModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  /**
   * Fetches file from backend using authenticated request and converts to blob URL
   */
  const fetchFileAsBlob = useCallback(async () => {
    if (!fileId) return

    try {
      const token = localStorage.getItem('token')
      const baseUrl =
        import.meta.env.VITE_DJANGO_BACKEND_URL || 'http://localhost:8000'

      const response = await axios({
        url: `${baseUrl}/api/files/${fileId}/view/`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const url = URL.createObjectURL(response.data)
      setBlobUrl(url)
      setLoading(false)
    } catch (err: unknown) {
      console.error('File fetch error:', err)

      let errorMessage = 'Failed to load file'
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage =
            'Authentication expired. Please log in again to view files.'
        } else if (err.response?.data) {
          try {
            errorMessage =
              err.response.data.detail ||
              err.response.data.error ||
              errorMessage
          } catch {
            errorMessage = err.message || errorMessage
          }
        } else {
          errorMessage = err.message || errorMessage
        }
      } else {
        errorMessage = err instanceof Error ? err.message : errorMessage
      }

      setError(errorMessage)
      setLoading(false)
    }
  }, [fileId])

  useEffect(() => {
    if (isOpen && fileId) {
      setLoading(true)
      setError(null)
      fetchFileAsBlob()
    }

    // Cleanup blob URL when component unmounts or modal closes
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
        setBlobUrl(null)
      }
    }
  }, [isOpen, fileId, fetchFileAsBlob]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setError(null)
    setLoading(false)
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
      setBlobUrl(null)
    }
    onClose()
  }

  const handleIframeLoad = () => {
    setLoading(false)
  }

  const handleIframeError = () => {
    setError('Failed to load file. The file may not be supported for preview.')
    setLoading(false)
  }

  const openInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank')
    }
  }

  const downloadFile = () => {
    if (blobUrl) {
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const renderFileViewer = () => {
    if (!blobUrl) return null

    return (
      <div className='relative h-full'>
        {/* Action buttons */}
        <div className='absolute top-4 right-4 z-10 flex space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={openInNewTab}
            className='bg-card/90 backdrop-blur-xs'
          >
            <ExternalLink className='mr-2 h-4 w-4' />
            Open in New Tab
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={downloadFile}
            className='bg-card/90 backdrop-blur-xs'
          >
            <Download className='mr-2 h-4 w-4' />
            Download
          </Button>
        </div>

        {/* File viewer */}
        <iframe
          src={blobUrl}
          className='h-full w-full rounded-md border-0'
          title={fileName}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ minHeight: '600px' }}
        />
      </div>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className='flex items-center justify-center py-12'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
          <span className='ml-3 text-muted-foreground'>Loading file...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className='flex flex-col items-center justify-center space-y-4 py-12'>
          <AlertCircle className='h-12 w-12 text-red-500' />
          <div className='text-center'>
            <p className='font-medium text-red-600'>Error loading file</p>
            <p className='mb-4 text-sm text-muted-foreground'>{error}</p>
            <div className='flex space-x-2'>
              <>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => fetchFileAsBlob()}
                >
                  Try Again
                </Button>
                <Button variant='outline' size='sm' onClick={openInNewTab}>
                  <ExternalLink className='mr-2 h-4 w-4' />
                  Open in New Tab
                </Button>
              </>
            </div>
          </div>
        </div>
      )
    }

    return renderFileViewer()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] max-w-6xl overflow-hidden'>
        <DialogHeader className='flex flex-row items-center justify-between'>
          <DialogTitle className='truncate pr-4 text-lg font-semibold'>
            <div className='flex items-center space-x-2'>
              <FileText className='h-5 w-5' />
              <span>{fileName || 'File Viewer'}</span>
              {fileType && (
                <span className='rounded-sm bg-muted px-2 py-1 text-sm text-muted-foreground'>
                  {fileType.toUpperCase()}
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue='document' className='flex h-[70vh] flex-1 flex-col'>
          <TabsList className='self-start'>
            <TabsTrigger value='document'>Document</TabsTrigger>
            <TabsTrigger value='structure'>Structure</TabsTrigger>
          </TabsList>

          <TabsContent
            value='document'
            className='mt-3 flex-1 overflow-hidden data-[state=inactive]:hidden'
          >
            {renderContent()}
          </TabsContent>

          <TabsContent
            value='structure'
            className='mt-3 flex-1 overflow-y-auto data-[state=inactive]:hidden'
          >
            <FileStructurePanel fileId={fileId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default FileViewerModal
