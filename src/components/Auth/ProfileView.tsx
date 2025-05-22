import React from 'react'
import { ChangePasswordForm } from './ChangePasswordForm'
import { ChunkSettingsForm } from './ChunkSettingsForm'
// import { VectorDBConfigForm } from './VectorDBConfigForm'

const ProfileView: React.FC = () => {
  return (
    <div className='flex h-full flex-col'>
      <div className='flex flex-col space-y-2 px-10 pt-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Profile</h1>
      </div>
      <div className='p-8'>
        <ChangePasswordForm />
        <ChunkSettingsForm />
        {/* <VectorDBConfigForm /> */}
      </div>
    </div>
  )
}

export default ProfileView
