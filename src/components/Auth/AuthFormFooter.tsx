import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'

interface AuthFormFooterProps {
  text: string
  route?: string
  routeText: string
  onClick?: () => void
}

const AuthFormFooter: React.FC<AuthFormFooterProps> = ({
  text,
  route,
  routeText,
  onClick,
}) => {
  return (
    <p className='mt-4 text-center text-sm text-gray-500'>
      {text}{' '}
      {route ? (
        <Link to={route} className='font-body font-bold text-[#023572]'>
          {routeText}
        </Link>
      ) : (
        <Button onClick={onClick} className='font-body font-bold'>
          {routeText}
        </Button>
      )}
    </p>
  )
}

export default AuthFormFooter
