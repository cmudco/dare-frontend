import React from 'react'
import { ChangePasswordForm } from './ChangePasswordForm'
// import { VectorDBConfigForm } from './VectorDBConfigForm'

const ProfileView: React.FC = () => {
  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex flex-col space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Profile</h1>
        <p className='text-muted-foreground'>
          View and manage your account settings
        </p>
      </div>
      <ChangePasswordForm />
      {/* <VectorDBConfigForm /> */}
    </div>
  )
}

export default ProfileView
