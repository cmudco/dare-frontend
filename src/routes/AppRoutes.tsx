import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";
import Files from "../pages/Files";
import VerifyScreen from "../pages/VerifyCode";
import LoginScreen from "../pages/Login";
import ResetScreen from "../pages/ResetPassword";
import ForgotScreen from "../pages/ForgotPassword";
import RegistrationScreen from "../pages/Registration";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<LoginScreen />} />
        <Route path='/register' element={<RegistrationScreen />} />
        <Route path='/forgot-password' element={<ForgotScreen />} />
        <Route path='/verify-code' element={<VerifyScreen />} />
        <Route path='/reset-password' element={<ResetScreen />} />

        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/files' element={<Files />} />
        <Route path='*' element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
