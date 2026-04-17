import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { changePassword } from '@/redux/asyncThunks/user'
import { FormikHelpers, useFormik } from 'formik'
import { changePasswordValidationSchema } from '@/pages/ProfileScreen/validation'
import { ChangePasswordValues } from '@/redux/types/user'

export const ChangePasswordForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const isLoading = useSelector((state: RootState) => state.user.loading)
  const error = useSelector((state: RootState) => state.user.error)
  const [success, setSuccess] = useState(false)

  const passwordFormik = useFormik<ChangePasswordValues>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: changePasswordValidationSchema,
    onSubmit: async (
      values,
      { resetForm }: FormikHelpers<ChangePasswordValues>
    ) => {
      try {
        const formData = {
          old_password: values.currentPassword,
          new_password1: values.newPassword,
          new_password2: values.confirmPassword,
        }

        const resultAction = await dispatch(changePassword(formData))

        if (changePassword.fulfilled.match(resultAction)) {
          setSuccess(true)
          resetForm()
          setTimeout(() => {
            setSuccess(false)
          }, 3000)
        }
      } catch (error) {
        console.error('Error changing password:', error)
      }
    },
  })

  return (
    <Card data-tour='settings-password' className='p-6'>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold'>Change Password</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Update your account password for better security.
          </p>
        </div>

        <form onSubmit={passwordFormik.handleSubmit} className='space-y-4'>
          <div>
            <Label className='text-base font-normal' htmlFor='currentPassword'>
              Current Password
            </Label>
            <Input
              className={`mt-1 h-10 max-w-md ${
                passwordFormik.touched.currentPassword &&
                passwordFormik.errors.currentPassword
                  ? 'border-red-500'
                  : ''
              }`}
              id='currentPassword'
              type='password'
              placeholder='Enter your current password'
              {...passwordFormik.getFieldProps('currentPassword')}
            />
            {passwordFormik.touched.currentPassword &&
              passwordFormik.errors.currentPassword && (
                <p className='mt-1 text-xs text-red-500'>
                  {passwordFormik.errors.currentPassword}
                </p>
              )}
          </div>

          <div>
            <Label className='text-base font-normal' htmlFor='newPassword'>
              New Password
            </Label>
            <Input
              className={`mt-1 h-10 max-w-md ${
                passwordFormik.touched.newPassword &&
                passwordFormik.errors.newPassword
                  ? 'border-red-500'
                  : ''
              }`}
              id='newPassword'
              type='password'
              placeholder='Enter your new password'
              {...passwordFormik.getFieldProps('newPassword')}
            />
            {passwordFormik.touched.newPassword &&
              passwordFormik.errors.newPassword && (
                <p className='mt-1 text-xs text-red-500'>
                  {passwordFormik.errors.newPassword}
                </p>
              )}
          </div>

          <div>
            <Label className='text-base font-normal' htmlFor='confirmPassword'>
              Confirm New Password
            </Label>
            <Input
              className={`mt-1 h-10 max-w-md ${
                passwordFormik.touched.confirmPassword &&
                passwordFormik.errors.confirmPassword
                  ? 'border-red-500'
                  : ''
              }`}
              id='confirmPassword'
              type='password'
              placeholder='Confirm your new password'
              {...passwordFormik.getFieldProps('confirmPassword')}
            />
            {passwordFormik.touched.confirmPassword &&
              passwordFormik.errors.confirmPassword && (
                <p className='mt-1 text-xs text-red-500'>
                  {passwordFormik.errors.confirmPassword}
                </p>
              )}
          </div>

          {error && (
            <div className='mt-2'>
              <p className='text-xs font-medium text-red-500'>{error}</p>
            </div>
          )}

          {success && (
            <div className='mt-2'>
              <p className='text-xs font-medium text-green-500'>
                Password changed successfully!
              </p>
            </div>
          )}

          <Button
            type='submit'
            disabled={
              isLoading || !passwordFormik.isValid || !passwordFormik.dirty
            }
            variant='default'
            className='mt-4 h-[38px] text-base font-normal'
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </Card>
  )
}
