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

const FontSizeSettings: React.FC = () => {
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
    <div className="space-y-2">
      <Label htmlFor="font-size-select" className="text-sm font-medium">
        Message Font Size
      </Label>
      <Select value={fontSize} onValueChange={handleFontSizeChange}>
        <SelectTrigger id="font-size-select" className="w-full">
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
  )
}

export default FontSizeSettings
