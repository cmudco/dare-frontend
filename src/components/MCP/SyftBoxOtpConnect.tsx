import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Loader2, Shield } from 'lucide-react'
import { toast } from '@/utils/toast'

interface SyftBoxOtpConnectProps {
  serverName: string
}

/**
 * SyftBox connect flow: request OTP, then verify to establish MCP connection.
 */
const SyftBoxOtpConnect = ({ serverName }: SyftBoxOtpConnectProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
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
      navigate('/dashboard')
    } catch (err) {
      const message =
        typeof err === 'string' ? err : 'Invalid or expired code. Try again.'
      toast.error(message)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-start gap-3 rounded-lg border border-dashed bg-muted/30 p-4'>
        <Shield className='mt-0.5 h-5 w-5 shrink-0 text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>
          Connect your SyftBox account: request a one-time code, then enter it
          below to finish linking.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label>Step 1 — Request code</Label>
          <Button
            type='button'
            variant='secondary'
            onClick={handleRequestOtp}
            disabled={requesting}
            className='w-full sm:w-auto'
          >
            {requesting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending…
              </>
            ) : (
              'Request authentication code'
            )}
          </Button>
          {otpRequested && (
            <p className='text-sm text-muted-foreground'>
              Check your mailbox — we sent a verification code to your email. If
              you don&apos;t see it, look in spam or junk.
            </p>
          )}
        </div>

        {otpRequested && (
          <div className='space-y-2'>
            <Label htmlFor='syftbox-otp'>Step 2 — Enter code</Label>
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
            <Button
              type='button'
              onClick={() => void handleVerify()}
              disabled={verifying || !otp.trim()}
              className='mt-2'
            >
              {verifying ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verifying…
                </>
              ) : (
                'Verify and connect'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SyftBoxOtpConnect
