import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { FeedbackWidget } from '@/components/Feedback'
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
import WorkflowEditPage from '@/pages/Workflows/WorkflowEditPage.tsx'
import ProfileScreen from '@/pages/ProfileScreen/index.tsx'
import BillingScreen from '@/pages/Billing/index.tsx'
import OnboardingScreen from '@/pages/Onboarding/index.tsx'
import WorkflowCreatePage from '@/pages/Workflows/WorkflowCreatePage.tsx'
import Agents from '@/pages/Agents/index.tsx'
import ModelCards from '@/pages/ModelCards'
import MCPLayout from '@/pages/MCP/MCPLayout.tsx'
import MCPServerList from '@/pages/MCP/MCPServerList.tsx'
import MCPServerDetail from '@/pages/MCP/MCPServerDetail.tsx'
import MCPToolExecute from '@/pages/MCP/MCPToolExecute.tsx'
import MCPExecutionHistory from '@/pages/MCP/MCPExecutionHistory.tsx'
import MemoryScreen from '@/pages/Memory'

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.user)

  return (
    <BrowserRouter>
      <RouteListener>
        {isAuthenticated && <FeedbackWidget />}
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
            path='/onboarding'
            element={
              <ProtectedRoute>
                <OnboardingScreen />
              </ProtectedRoute>
            }
          />

          {/* Workflow builder pages - full canvas without header/sidebar */}
          <Route
            path='/workflows/create'
            element={
              <ProtectedRoute>
                <WorkflowCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/workflows/:id/edit'
            element={
              <ProtectedRoute>
                <WorkflowEditPage />
              </ProtectedRoute>
            }
          />

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
            <Route path='/agents' element={<Agents />} />
            <Route path='/workflows' element={<Workflows />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/help' element={<Help />} />
            <Route path='/mcp' element={<MCPLayout />}>
              <Route index element={<MCPServerList />} />
              <Route path=':serverSlug' element={<MCPServerDetail />} />
              <Route
                path=':serverSlug/tools/:toolName'
                element={<MCPToolExecute />}
              />
              <Route path='history' element={<MCPExecutionHistory />} />
            </Route>
            <Route path='/profile' element={<ProfileScreen />} />
            <Route path='/memory' element={<MemoryScreen />} />
            <Route path='/billing/' element={<BillingScreen />} />
          </Route>
          <Route path='/models/:slug' element={<ModelCards />} />
          <Route path='*' element={<div>404 - Page Not Found</div>} />
        </Routes>
      </RouteListener>
    </BrowserRouter>
  )
}

export default AppRoutes
