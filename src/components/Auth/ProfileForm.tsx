import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { updateProfilePicture } from '@/redux/asyncThunks/user'
import { ProfileSettings } from '@/redux/types/user'

export const ProfileForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.user.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState<ProfileSettings>({
    first_name: '',
    last_name: '',
  })

  useEffect(() => {
    if (user?.name) {
      const nameArray = user.name.split(' ')
      const first_name = nameArray[0]
      const last_name = nameArray.length > 1 ? nameArray[1] : ''
      setSettings({
        first_name,
        last_name,
      })
    }
  }, [user])

  const updateProfileHandler = async (formData: FormData) => {
    try {
      const resultAction = await dispatch(updateProfilePicture(formData))
      if (updateProfilePicture.rejected.match(resultAction)) {
        setIsSubmitting(false)
        return
      }
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      setIsSubmitting(false)
    }
  }

  const handleProfileUpdate = () => {
    if (settings.first_name) {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append('first_name', settings.first_name)
      formData.append('last_name', settings.last_name)
      updateProfileHandler(formData)
    }
  }

  return (
    <div className='max-w-2xl'>
      <div className='mt-6 flex flex-1 gap-4'>
        <div className='flex w-1/2 flex-col space-y-2'>
          <Label className='text-base font-normal' htmlFor='firstName'>
            First Name
          </Label>
          <Input
            className='h-10'
            id='firstName'
            name='firstName'
            placeholder='Enter first name'
            value={settings.first_name}
            onChange={(event) =>
              setSettings({
                ...settings,
                first_name: event.target.value,
              })
            }
          />
        </div>
        <div className='flex w-1/2 flex-col space-y-2'>
          <Label className='text-base font-normal' htmlFor='lastName'>
            Last Name
          </Label>
          <Input
            className='h-10'
            id='lastName'
            name='lastName'
            placeholder='Enter last name'
            value={settings.last_name}
            onChange={(event) =>
              setSettings({
                ...settings,
                last_name: event.target.value,
              })
            }
          />
        </div>
      </div>

      <div className='mt-4 space-y-2'>
        <Label className='text-base font-normal' htmlFor='email'>
          Email
        </Label>
        <Input
          disabled
          className='h-10'
          id='email'
          name='email'
          placeholder='Enter your email address'
          value={user?.email}
        />
      </div>

      <Button
        type='submit'
        disabled={isSubmitting || !settings.first_name}
        variant='default'
        className='mt-4 h-[38px] text-base font-normal'
        onClick={handleProfileUpdate}
      >
        Update Profile
      </Button>
    </div>
  )
}
