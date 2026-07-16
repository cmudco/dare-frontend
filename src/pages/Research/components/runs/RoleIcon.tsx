import { MessageCircleQuestion, Search } from 'lucide-react'
import { AgentRunRole } from '@/utils/constants/research'

// Scout runs search; Critic runs assess. A small glyph to tell them apart.
const RoleIcon = ({ role }: { role: string }) =>
  role === AgentRunRole.CRITIC ? (
    <MessageCircleQuestion className='h-4 w-4 text-muted-foreground' />
  ) : (
    <Search className='h-4 w-4 text-muted-foreground' />
  )

export default RoleIcon
