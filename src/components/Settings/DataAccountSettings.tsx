/**
 * DataAccountSettings
 *
 * The account-level half of data portability. The Memory page owns the
 * memory store on its own terms; this card is where the whole account
 * leaves, comes back, or ends.
 */
import { useDispatch, useSelector } from 'react-redux'
import { Archive, Brain, Download, Loader2 } from 'lucide-react'

import DeleteAccountDialog from '@/components/Settings/DeleteAccountDialog'
import RestoreArchiveDialog from '@/components/Settings/RestoreArchiveDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { exportAccountData } from '@/redux/asyncThunks/accountData'
import { ExportScope } from '@/redux/types/accountData'
import { AppDispatch, RootState } from '@/redux/store'
import { toast } from '@/utils/toast'

const DataAccountSettings = () => {
  const dispatch = useDispatch<AppDispatch>()
  const exportingScope = useSelector(
    (state: RootState) => state.accountData.exportingScope
  )

  const handleExport = async (scope: ExportScope) => {
    const result = await dispatch(exportAccountData(scope))
    if (exportAccountData.fulfilled.match(result)) {
      toast.success(`Downloaded ${result.payload.filename}`)
      return
    }
    toast.error(
      (result.payload as string) || 'Your export could not be prepared.'
    )
  }

  const busy = exportingScope !== null

  return (
    <Card className='p-4 sm:p-6'>
      <div className='space-y-6'>
        <div className='flex items-start gap-3'>
          <div className='rounded-lg bg-muted p-2'>
            <Archive className='h-5 w-5 text-muted-foreground' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-foreground'>
              Your data and account
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Take a copy of everything, bring it back into a new account, or
              close this one for good.
            </p>
          </div>
        </div>

        <div className='grid gap-3 sm:grid-cols-2'>
          <Button
            onClick={() => handleExport(ExportScope.FULL)}
            disabled={busy}
            className='justify-center gap-2'
          >
            {exportingScope === ExportScope.FULL ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Download className='h-4 w-4' />
            )}
            Export everything
          </Button>
          <Button
            variant='outline'
            onClick={() => handleExport(ExportScope.MEMORIES)}
            disabled={busy}
            className='justify-center gap-2'
          >
            {exportingScope === ExportScope.MEMORIES ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Brain className='h-4 w-4' />
            )}
            Export memories only
          </Button>
          <RestoreArchiveDialog />
          <DeleteAccountDialog />
        </div>

        <p className='text-sm text-muted-foreground'>
          An export holds your conversations, prompts, workflows, memories and
          profile. Uploaded files, their embeddings and run history are not
          included.
        </p>
      </div>
    </Card>
  )
}

export default DataAccountSettings
