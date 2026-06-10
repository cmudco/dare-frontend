/**
 * SeedMemoryButton Component
 *
 * Development-only button to seed demo memory data.
 */
import { Sparkles, Loader2 } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { config } from '@/config/environment'
import { cn } from '@/lib/utils'

interface SeedMemoryButtonProps {
  onSeed: () => void
  isSeeding: boolean
  className?: string
  size?: ButtonProps['size']
}

const SeedMemoryButton = ({
  onSeed,
  isSeeding,
  className,
  size = 'default',
}: SeedMemoryButtonProps) => {
  // Only show in local development mode
  if (!config.isLocal) {
    return null
  }

  return (
    <Button
      variant='outline'
      size={size}
      onClick={onSeed}
      disabled={isSeeding}
      className={cn(
        'border-dashed border-purple-500/50 text-purple-400 hover:border-purple-500 hover:bg-purple-500/10',
        className
      )}
    >
      {isSeeding ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Seeding...
        </>
      ) : (
        <>
          <Sparkles className='mr-2 h-4 w-4' />
          Seed Demo Data
        </>
      )}
    </Button>
  )
}

export default SeedMemoryButton
