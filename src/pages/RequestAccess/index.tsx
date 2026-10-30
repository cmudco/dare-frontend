import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { AppDispatch, RootState } from '@/redux/store'
import { requestAccess } from '@/redux/asyncThunks/accessRequest'
import { Button } from '@/components/ui/button'

const RequestAccessScreen = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, response } = useSelector(
    (state: RootState) => state.accessRequest
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void dispatch(requestAccess({ name, email, reason }))
  }

  return (
    <main className='flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground'>
      <section className='w-full max-w-lg space-y-6 rounded-xl border border-border bg-card p-7 text-card-foreground shadow-sm'>
        <h1 className='text-2xl font-semibold'>Request access to DARE</h1>
        <p className='text-sm text-muted-foreground'>
          An administrator will review your request. If approved, we will email
          a single-use signup code to you. After registration, you will still
          need to verify your email address.
        </p>
        {response ? (
          <div role='status' className='space-y-3'>
            <CheckCircle2 className='h-6 w-6 text-primary' aria-hidden='true' />
            <p>{response.detail}</p>
            <p className='text-sm text-muted-foreground'>
              You do not have an account yet. Please wait for your invitation
              before registering.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1'>
              <label htmlFor='request-name' className='text-sm font-medium'>
                Name
              </label>
              <input
                id='request-name'
                name='name'
                autoComplete='name'
                required
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={loading}
                className='w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50'
              />
            </div>
            <div className='space-y-1'>
              <label htmlFor='request-email' className='text-sm font-medium'>
                Email address
              </label>
              <input
                id='request-email'
                name='email'
                type='email'
                autoComplete='email'
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                className='w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50'
              />
            </div>
            <div className='space-y-1'>
              <label htmlFor='request-reason' className='text-sm font-medium'>
                Why do you need access? (optional)
              </label>
              <textarea
                id='request-reason'
                name='reason'
                maxLength={1000}
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={loading}
                className='w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50'
              />
            </div>
            {error && (
              <div role='alert' className='flex gap-2 text-sm text-destructive'>
                <AlertCircle className='h-5 w-5 shrink-0' aria-hidden='true' />
                <p>{error}</p>
              </div>
            )}
            <Button type='submit' disabled={loading} className='w-full'>
              {loading ? 'Submitting request…' : 'Request access'}
            </Button>
          </form>
        )}
        <div className='flex flex-wrap justify-between gap-3 text-sm'>
          <Link
            to='/register'
            className='font-medium text-primary underline underline-offset-4'
          >
            Already have a code? Register
          </Link>
          <Link
            to='/login'
            className='font-medium text-primary underline underline-offset-4'
          >
            Back to login
          </Link>
        </div>
      </section>
    </main>
  )
}

export default RequestAccessScreen
