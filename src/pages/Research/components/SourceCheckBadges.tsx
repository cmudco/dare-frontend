import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Provenance } from '@/redux/types/research'

interface Props {
  check?: Provenance['check']
}

/** What DARE found when it checked the source before staging it. */
const SourceCheckBadges = ({ check }: Props) => {
  if (!check) return null
  if (!check.flags.length) {
    return check.read ? (
      <Badge
        variant='green'
        className='gap-1'
        title='Link opened and quote found on the page'
      >
        <ShieldCheck className='h-3 w-3' />
        Checked
      </Badge>
    ) : null
  }
  return (
    <>
      {check.flags.map((flag) => (
        <Badge key={flag} variant='yellow' className='gap-1'>
          <AlertTriangle className='h-3 w-3' />
          {flag}
        </Badge>
      ))}
    </>
  )
}

export default SourceCheckBadges
