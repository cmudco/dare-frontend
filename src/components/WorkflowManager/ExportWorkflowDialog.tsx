import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { FileDown, Copy, Check, Info } from 'lucide-react'

const SYFTBOX_APP_URL = 'https://github.com/m-Hariss/dare-workflows.git'

interface ExportWorkflowDialogProps {
  isOpen: boolean
  onClose: () => void
}

const ExportWorkflowDialog: React.FC<ExportWorkflowDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SYFTBOX_APP_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileDown className='h-5 w-5 text-primary' />
            Workflow Exported!
          </DialogTitle>
          <DialogDescription>
            Your workflow JSON has been downloaded. Follow the steps below to
            run it as an app on Syftbox.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <ol className='space-y-3 text-sm text-muted-foreground'>
            <li className='flex items-start gap-2'>
              <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                1
              </span>
              <span>
                Download and install the{' '}
                <span className='font-medium text-foreground'>
                  Syftbox desktop app
                </span>{' '}
                from{' '}
                <a
                  href='https://syftbox.openmined.org'
                  target='_blank'
                  rel='noreferrer'
                  className='underline underline-offset-2 hover:text-foreground'
                >
                  syftbox.openmined.org
                </a>
                .
              </span>
            </li>

            <li className='flex items-start gap-2'>
              <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                2
              </span>
              <div className='flex-1 space-y-1.5'>
                <span>
                  Install the{' '}
                  <span className='font-medium text-foreground'>
                    DARE workflow app
                  </span>{' '}
                  on Syftbox using this repository URL:
                </span>
                <div className='flex items-center gap-2 rounded-md border bg-muted px-3 py-2'>
                  <code className='flex-1 truncate text-xs text-foreground'>
                    {SYFTBOX_APP_URL}
                  </code>
                  <button
                    onClick={handleCopy}
                    className='ml-1 shrink-0 text-muted-foreground transition-colors hover:text-foreground'
                    title='Copy URL'
                  >
                    {copied ? (
                      <Check className='h-4 w-4 text-green-600' />
                    ) : (
                      <Copy className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>
            </li>

            <li className='flex items-start gap-2'>
              <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                3
              </span>
              <span>
                Upload your downloaded{' '}
                <span className='font-medium text-foreground'>.dare.json</span>{' '}
                file to the app and run it — your workflow will execute as a
                standalone Syftbox app.
              </span>
            </li>
          </ol>

          <div className='flex items-start gap-2 rounded-md bg-muted p-2.5 text-sm text-muted-foreground'>
            <Info className='mt-0.5 h-4 w-4 shrink-0' />
            <span>
              Any workflow you download can be run this way — share the JSON
              with teammates so they can run it on their own Syftbox.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportWorkflowDialog
