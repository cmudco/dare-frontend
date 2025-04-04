import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoaderProps {
  size?: number
  className?: string
}

const Loader: React.FC<LoaderProps> = ({ size = 24, className }) => {
  return (
    <Loader2
      className={cn('animate-spin text-red-500', className)}
      width={size}
      height={size}
    />
  )
}

export default Loader
