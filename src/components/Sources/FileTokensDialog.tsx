import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getFileTokensAPI, type ProviderTokens } from '@/api/files'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MyFile } from '@/redux/types/files'

const PROVIDER_LABELS: Record<string, string> = {
  claude: 'Claude',
  openai: 'OpenAI',
  gemini: 'Gemini',
}

interface FileTokensDialogProps {
  file: MyFile | null
  onClose: () => void
}

const FileTokensDialog = ({ file, onClose }: FileTokensDialogProps) => {
  const [rows, setRows] = useState<ProviderTokens[] | null>(null)
  const [failed, setFailed] = useState(false)
  const fileId = file?.id

  useEffect(() => {
    if (fileId === undefined) return
    let stale = false
    setRows(null)
    setFailed(false)
    getFileTokensAPI(fileId)
      .then((result) => !stale && setRows(result))
      .catch(() => !stale && setFailed(true))
    return () => {
      stale = true
    }
  }, [fileId])

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Tokens</DialogTitle>
          <DialogDescription className='break-all'>
            {file?.name}
          </DialogDescription>
        </DialogHeader>
        {failed ? (
          <p className='text-sm text-destructive'>
            Couldn't count tokens for this file. Try again.
          </p>
        ) : !rows ? (
          <div className='flex items-center gap-2 py-4 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            Counting tokens…
          </div>
        ) : (
          <table className='w-full text-sm'>
            <tbody className='divide-y divide-border'>
              {rows.map((row) => (
                <tr key={row.provider}>
                  <td className='py-2.5'>
                    <div>{PROVIDER_LABELS[row.provider] ?? row.provider}</div>
                    <div className='text-xs text-muted-foreground'>
                      {row.model}
                    </div>
                  </td>
                  <td className='py-2.5 text-right font-medium tabular-nums'>
                    ~{row.tokens.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default FileTokensDialog
