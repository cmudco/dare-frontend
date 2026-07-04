import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * MCPConnectionResult — landing page for the MCP OAuth callback return.
 *
 * The backend completes the OAuth exchange and redirects the browser here with
 * ``?server=<slug>&status=success|error&message=<text>``. This route lives
 * OUTSIDE the ``enableMcp`` gate in AppRoutes so it always resolves — the
 * feature flag defaults to false while it is still loading right after the
 * redirect, and gating this page behind it dropped the user on the catch-all
 * 404 (the reported bug). It also gives a failed connection a real error state
 * with a retry, instead of silently succeeding-looking or 404-ing.
 */
const MCPConnectionResult = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const status = params.get('status')
  const server = params.get('server') || ''
  const message = params.get('message') || ''

  const isSuccess = status === 'success'

  const heading = useMemo(() => {
    if (isSuccess) return 'Connection successful'
    return 'Connection failed'
  }, [isSuccess])

  const body = useMemo(() => {
    if (message) return message
    return isSuccess
      ? 'The integration was connected.'
      : 'The integration could not be connected. Please try again.'
  }, [isSuccess, message])

  return (
    <div className='flex min-h-[60vh] items-center justify-center p-6'>
      <div className='flex max-w-md flex-col items-center rounded-xl border border-border bg-card p-8 text-center'>
        <div className='mb-4 rounded-full bg-muted p-3'>
          {isSuccess ? (
            <CheckCircle2 className='h-8 w-8 text-green-600 dark:text-green-400' />
          ) : (
            <XCircle className='h-8 w-8 text-destructive' />
          )}
        </div>
        <h1 className='text-lg font-semibold text-foreground'>{heading}</h1>
        <p className='mt-2 text-sm text-muted-foreground'>{body}</p>

        <div className='mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center'>
          {isSuccess && server ? (
            <Button onClick={() => navigate(`/mcp/${server}`)}>
              View integration
            </Button>
          ) : (
            !isSuccess && (
              <Button onClick={() => navigate('/mcp')}>Try again</Button>
            )
          )}
          <Button variant='outline' onClick={() => navigate('/mcp')}>
            Back to integrations
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MCPConnectionResult
