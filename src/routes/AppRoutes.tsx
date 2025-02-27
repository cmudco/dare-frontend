import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Files from "../pages/Files";
import VerifyScreen from "../pages/VerifyCode";
import LoginScreen from "../pages/Login";
import ResetScreen from "../pages/ResetPassword";
import ForgotScreen from "../pages/ForgotPassword";
import RegistrationScreen from "../pages/Registration";
import ChatScreen from "../pages/Chat";
import UserView from "../components/Layout/UserView";
import QrVerificationScreen from "../pages/QrVerification";
import OTPRequired from "../pages/OTPRequired";
import EmailConfirmationScreen from "../pages/EmailConfirmation";
import RouteListener from "./RouteListener";
import Prompt from "../pages/Prompts";
import ProtectedRoute from "./ProtectedRoute";

import Help from "../pages/Help";
import Settings from "../pages/Settings/index.tsx";
import VerifyEmailScreen from "@/pages/VerifyEmail/index.tsx";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <RouteListener>
        <Routes>
          <Route path='/login' element={<LoginScreen />} />
          <Route path='/register' element={<RegistrationScreen />} />
          <Route path='/users/confirm-email' element={<VerifyEmailScreen />} />
          <Route path='/forgot-password' element={<ForgotScreen />} />
          <Route path='/verify-code' element={<VerifyScreen />} />
          <Route path='/reset-password' element={<ResetScreen />} />
          <Route path='/qr-verification' element={<QrVerificationScreen />} />
          <Route path='/otp-required' element={<OTPRequired />} />
          <Route path='/confirmation' element={<EmailConfirmationScreen />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UserView />
              </ProtectedRoute>
            }
          >
            <Route path='/chat' element={<ChatScreen />} />
            <Route path='/chat/:id' element={<ChatScreen />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/files' element={<Files />} />
            <Route path='/prompts' element={<Prompt />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/help' element={<Help />} />
          </Route>

          <Route path='*' element={<div>404 - Page Not Found</div>} />
        </Routes>
      </RouteListener>
    </BrowserRouter>
  );
};

export default AppRoutes;
