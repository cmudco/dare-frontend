import { useState } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import {
  requestSyftboxOtp,
  verifySyftboxOtp,
} from '@/redux/asyncThunks/syftbox'
import { getMcpConnections } from '@/redux/asyncThunks/mcp'
import { getUserData } from '@/redux/asyncThunks/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from '@/utils/toast'

interface SyftBoxOtpConnectProps {
  serverName: string
}

/**
 * SyftBox connect flow: request OTP, then verify to establish MCP connection.
 */
const SyftBoxOtpConnect = ({ serverName }: SyftBoxOtpConnectProps) => {
  const dispatch = useAppDispatch()
  const [otp, setOtp] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const handleRequestOtp = async () => {
    setRequesting(true)
    try {
      await dispatch(requestSyftboxOtp()).unwrap()
      setOtpRequested(true)
      toast.success('Check your email — we sent a verification code.')
    } catch (err) {
      const message =
        typeof err === 'string' ? err : 'Could not send authentication code.'
      toast.error(message)
    } finally {
      setRequesting(false)
    }
  }

  const handleVerify = async () => {
    if (!otp.trim()) {
      toast.error('Enter the code you received.')
      return
    }
    setVerifying(true)
    try {
      await dispatch(verifySyftboxOtp(otp)).unwrap()
      toast.success(`Connected to ${serverName}`)
      await dispatch(getMcpConnections()).unwrap()
      try {
        await dispatch(getUserData()).unwrap()
      } catch {
        console.error('Failed to get user data')
      }
    } catch (err) {
      const message =
        typeof err === 'string' ? err : 'Invalid or expired code. Try again.'
      toast.error(message)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground'>
        Request a one-time code to your email, then enter it below to finish
        connecting.
      </p>

      <div className='space-y-2'>
        <Label>Request authentication code</Label>
        <div className='flex flex-wrap gap-3'>
          <Button
            type='button'
            variant='secondary'
            onClick={handleRequestOtp}
            disabled={requesting}
          >
            {requesting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending...
              </>
            ) : (
              'Send code'
            )}
          </Button>
        </div>
        {otpRequested && (
          <p className='text-xs text-muted-foreground'>
            Check your mailbox — we sent a verification code to your email. If
            you don&apos;t see it, look in spam or junk.
          </p>
        )}
      </div>

      {otpRequested && (
        <>
          <div className='space-y-2'>
            <Label htmlFor='syftbox-otp'>Verification code</Label>
            <Input
              id='syftbox-otp'
              type='text'
              inputMode='numeric'
              autoComplete='one-time-code'
              placeholder='Enter the code you received'
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleVerify()
              }}
            />
          </div>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Button
              type='button'
              onClick={() => void handleVerify()}
              disabled={verifying || !otp.trim()}
            >
              {verifying ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verifying...
                </>
              ) : (
                'Verify and connect'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default SyftBoxOtpConnect
