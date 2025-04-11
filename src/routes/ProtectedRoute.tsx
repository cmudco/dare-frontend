import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { RootState } from '../redux/store'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.user)

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
