import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/store'
import { updateConversationSettings } from '../../redux/userSlice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Label } from '../ui/label'
import { Card } from '../ui/card'

const ConversationSettingsForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const conversationSettings = useSelector(
    (state: RootState) => state.user.conversationSettings
  )

  const fontSize = conversationSettings?.fontSize || 'sm'

  const fontSizeOptions = [
    { value: 'xs', label: 'Extra Small' },
    { value: 'sm', label: 'Small' },
    { value: 'base', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
  ]

  const handleFontSizeChange = (newFontSize: string) => {
    dispatch(
      updateConversationSettings({
        fontSize: newFontSize as 'xs' | 'sm' | 'base' | 'lg' | 'xl',
      })
    )
  }

  return (
    <Card
      data-tour='settings-conversation'
      className='border-border bg-card p-6'
    >
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold text-card-foreground'>
            Conversation Preferences
          </h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Customize how messages appear in your conversations.
          </p>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label
              htmlFor='font-size-select'
              className='text-sm font-medium text-foreground'
            >
              Message Font Size
            </Label>
            <p className='text-xs text-muted-foreground'>
              Choose the font size for both your messages and AI responses.
            </p>
            <Select value={fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger
                id='font-size-select'
                className='w-full max-w-xs border-border bg-background text-foreground'
              >
                <SelectValue placeholder='Select font size' />
              </SelectTrigger>
              <SelectContent className='border-border bg-popover'>
                {fontSizeOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className='text-popover-foreground hover:bg-accent'
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='mt-4 rounded-lg bg-muted p-4'>
          <p className='mb-2 text-sm font-medium text-muted-foreground'>
            Preview:
          </p>
          <div
            className={`text-foreground ${fontSize === 'xs' ? 'text-xs' : ''} ${fontSize === 'sm' ? 'text-sm' : ''} ${fontSize === 'base' ? 'text-base' : ''} ${fontSize === 'lg' ? 'text-lg' : ''} ${fontSize === 'xl' ? 'text-xl' : ''} `}
          >
            This is how your messages will appear in conversations.
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ConversationSettingsForm
