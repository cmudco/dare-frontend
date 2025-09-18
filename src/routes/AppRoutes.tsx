import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Files from '../pages/Files'
import VerifyCodeScreen from '../pages/VerifyCode'
import LoginScreen from '../pages/Login'
import ForgotScreen from '../pages/ForgotPassword'
import RegistrationScreen from '../pages/Registration'
import CoversationScreen from '../pages/Conversation/index.tsx'
import UserView from '../components/Layout/UserView'
import EmailConfirmationScreen from '../pages/EmailConfirmation'
import RouteListener from './RouteListener'
import Prompt from '../pages/Prompts'
import ProtectedRoute from './ProtectedRoute'
import Help from '../pages/Help'
import Settings from '../pages/Settings/index.tsx'
import ResetPasswordScreen from '../pages/ResetPassword'
import ForgotPasswordSuccess from '../components/Success.tsx'
import VerifyEmailScreen from '@/components/Auth/VerifyEmail.tsx'
import Workflows from '@/pages/Workflows/index.tsx'
import ProfileScreen from '@/pages/ProfileScreen/index.tsx'
import BillingScreen from '@/pages/Billing/index.tsx'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <RouteListener>
        <Routes>
          <Route path='/login' element={<LoginScreen />} />
          <Route path='/register' element={<RegistrationScreen />} />
          <Route path='/users/confirm-email' element={<VerifyEmailScreen />} />
          <Route path='/forgot-password' element={<ForgotScreen />} />
          <Route
            path='/forgot-password-success'
            element={<ForgotPasswordSuccess />}
          />
          <Route path='/verify-code' element={<VerifyCodeScreen />} />
          <Route
            path='/password-reset/confirm/:uid/:token'
            element={<ResetPasswordScreen />}
          />
          <Route path='/confirmation' element={<EmailConfirmationScreen />} />

          <Route
            path='/'
            element={
              <ProtectedRoute>
                <UserView />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path='/conversation' element={<CoversationScreen />} />
            <Route path='/conversation/:id' element={<CoversationScreen />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/files' element={<Files />} />
            <Route path='/prompts' element={<Prompt />} />
            <Route path='/workflows' element={<Workflows />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/help' element={<Help />} />
            <Route path='/profile' element={<ProfileScreen />} />
            <Route path='/billing/' element={<BillingScreen />} />
          </Route>
          <Route path='*' element={<div>404 - Page Not Found</div>} />
        </Routes>
      </RouteListener>
    </BrowserRouter>
  )
}

export default AppRoutes
