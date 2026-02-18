/**
 * SeedMemoryButton Component
 *
 * Development-only button to seed demo memory data.
 */
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { config } from '@/config/environment'

interface SeedMemoryButtonProps {
  onSeed: () => void
  isSeeding: boolean
}

const SeedMemoryButton = ({ onSeed, isSeeding }: SeedMemoryButtonProps) => {
  // Only show in local development mode
  if (!config.isLocal) {
    return null
  }

  return (
    <Button
      variant='outline'
      onClick={onSeed}
      disabled={isSeeding}
      className='border-dashed border-purple-500/50 text-purple-400 hover:border-purple-500 hover:bg-purple-500/10'
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
