import { useDispatch, useSelector } from 'react-redux'
import { Archive, Brain, Download, Loader2 } from 'lucide-react'

import { MemoryImportDialog } from '@/components/Memory'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { downloadDataExport } from '@/redux/asyncThunks/dataExport'
import { AppDispatch, RootState } from '@/redux/store'
import { DataExportScope } from '@/utils/constants/dataExport'

const DataExportSettings = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { fullDownloading, memoriesDownloading } = useSelector(
    (state: RootState) => state.dataExport
  )
  const { importing } = useSelector((state: RootState) => state.memory)

  const handleDownload = async (scope: DataExportScope) => {
    const result = await dispatch(downloadDataExport(scope))
    if (downloadDataExport.fulfilled.match(result)) {
      toast({
        title: 'Export downloaded',
        description: result.payload.filename,
      })
      return
    }

    toast({
      title: 'Export failed',
      description:
        (result.payload as string) || 'Unable to download your data export.',
      variant: 'destructive',
    })
  }

  return (
    <Card className='border-border bg-card p-6'>
      <div className='space-y-6'>
        <div className='flex items-start gap-3'>
          <div className='rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20'>
            <Archive className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-card-foreground'>
              Data Portability
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Download your DARE context or import memories from another AI.
            </p>
          </div>
        </div>

        <div className='grid gap-3 sm:grid-cols-3'>
          <Button
            onClick={() => handleDownload(DataExportScope.FULL)}
            disabled={fullDownloading || memoriesDownloading}
            className='justify-center gap-2'
          >
            {fullDownloading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Download className='h-4 w-4' />
            )}
            Export Full Context
          </Button>
          <Button
            variant='outline'
            onClick={() => handleDownload(DataExportScope.MEMORIES)}
            disabled={fullDownloading || memoriesDownloading}
            className='justify-center gap-2'
          >
            {memoriesDownloading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Brain className='h-4 w-4' />
            )}
            Export Memories
          </Button>
          <MemoryImportDialog
            importing={importing}
            triggerLabel='Import Memories'
            triggerClassName='justify-center border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40'
          />
        </div>
      </div>
    </Card>
  )
}

export default DataExportSettings
