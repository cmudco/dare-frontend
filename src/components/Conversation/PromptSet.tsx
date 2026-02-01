/**
 * PromptSet Component
 *
 * A modal dialog with tabbed interface for selecting Prompts or Agent Templates.
 * Uses sub-components for each tab's content for better code organization.
 */

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { GoCommandPalette } from 'react-icons/go'
import { Bot } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '../ui/dialog'
import PromptTabContent from './PromptTabContent'
import AgentTabContent from './AgentTabContent'

const PromptSet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prompts' | 'agents'>('prompts')

  // Get selected agent name for tab badge
  const selectedAgentName = useSelector(
    (state: RootState) =>
      state.conversation.activeConversation?.selectedAgentName
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          className='h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white'
        >
          <GoCommandPalette className='h-5 w-5 text-muted-foreground transition-colors hover:text-foreground' />
        </Button>
      </DialogTrigger>

      <DialogContent className='w-[90vw] max-w-2xl rounded-lg border-border bg-background p-6 shadow-md [&>button]:hidden'>
        <div className='mb-4 flex items-center justify-between'>
          <DialogTitle className='text-lg font-bold text-foreground'>
            {activeTab === 'prompts' ? 'Select Prompt' : 'Agent Templates'}
          </DialogTitle>
        </div>

        {/* Tabs */}
        <div className='mb-4 flex gap-2 border-b border-border'>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'prompts'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('prompts')}
          >
            Prompts
          </button>
          <button
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'agents'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('agents')}
          >
            <Bot className='h-4 w-4' />
            Agent Templates
            {selectedAgentName && (
              <span className='ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary'>
                {selectedAgentName}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'prompts' && <PromptTabContent />}
        {activeTab === 'agents' && <AgentTabContent />}

        <div className='mt-4 flex justify-end'>
          <DialogClose asChild>
            <Button className='px-6'>Done</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PromptSet
