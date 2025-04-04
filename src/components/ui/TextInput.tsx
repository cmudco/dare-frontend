import React, { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Input } from './input'

interface TextInputProps {
  name: string
  label: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  error?: string | undefined
}

const TextInput: React.FC<TextInputProps> = ({
  name,
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className='w-full mb-5 relative'>
      <label htmlFor={name} className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
      <div className='relative'>
        <Input
          id={name}
          name={name}
          type={showPassword && type === 'password' ? 'text' : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
        />
        {type === 'password' && (
          <div
            className='absolute inset-y-0 right-3 flex items-center cursor-pointer'
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeSlashIcon className='h-5 w-5 text-gray-800' />
            ) : (
              <EyeIcon className='h-5 w-5 text-gray-800' />
            )}
          </div>
        )}
      </div>
      {error && <p className='text-xs text-red-500 mt-1'>{String(error)}</p>}
    </div>
  )
}

export default TextInput
