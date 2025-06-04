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
    dispatch(updateConversationSettings({
      fontSize: newFontSize as 'xs' | 'sm' | 'base' | 'lg' | 'xl'
    }))
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Conversation Preferences</h3>
          <p className="text-sm text-gray-600 mt-1">
            Customize how messages appear in your conversations.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="font-size-select" className="text-sm font-medium">
              Message Font Size
            </Label>
            <p className="text-xs text-gray-500">
              Choose the font size for both your messages and AI responses.
            </p>
            <Select value={fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger id="font-size-select" className="w-full max-w-xs">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2 font-medium">Preview:</p>
          <div className={`
            ${fontSize === 'xs' ? 'text-xs' : ''}
            ${fontSize === 'sm' ? 'text-sm' : ''}
            ${fontSize === 'base' ? 'text-base' : ''}
            ${fontSize === 'lg' ? 'text-lg' : ''}
            ${fontSize === 'xl' ? 'text-xl' : ''}
          `}>
            This is how your messages will appear in conversations.
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ConversationSettingsForm
