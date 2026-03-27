import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ModeButtonProps {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
}

const ModeButton: React.FC<ModeButtonProps> = ({
  active,
  onClick,
  icon: Icon,
  label,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-all ${
      active
        ? 'bg-background text-primary shadow-sm'
        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
    }`}
  >
    <Icon className={`h-3.5 w-3.5 ${active ? 'text-primary' : ''}`} />
    <span className='hidden sm:inline'>{label}</span>
  </button>
)

export default ModeButton
