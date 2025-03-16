import React, { useEffect, useState } from "react";
import AuthCard from "../../components/Auth/AuthCard";
import AuthFormFooter from "../../components/Auth/AuthFormFooter";
import {
  LoginFormValues,
  loginInitialValues,
  loginValidationSchema,
} from "./validation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { getUserData, userLogin, resendVerification } from "../../redux/aynscThunks/user";
import { resetError } from "../../redux/userSlice";
import { useAppSelector } from "../../redux/hooks";

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAppSelector((state) => state.user);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    dispatch(resetError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(userLogin(values)).unwrap();
      await dispatch(getUserData()).unwrap();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleResendVerification = async (values: LoginFormValues) => {
    try {
      const resultAction = await dispatch(resendVerification(values));
      if (resendVerification.rejected.match(resultAction)) {
        return;
      }
      setResendSuccess(true);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    }
  };

  const formikConfig = {
    initialValues: loginInitialValues,
    validationSchema: loginValidationSchema,
    onSubmit: handleSubmit,
  };

  const inputs = [
    { name: "email", label: "Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
  ];

  return (
    <AuthCard<LoginFormValues>
      title="Sign In to Dare Platform"
      inputs={inputs}
      formikConfig={formikConfig}
      buttonText="Sign In"
      showForgotPassword
      onResendVerification={handleResendVerification}
      footer={
        <>
          <AuthFormFooter
            text="Don't have an account?"
            route="/register"
            routeText="Sign up"
          />

          {resendSuccess && (
            <div className="text-xs w-max mt-3 bg-green-500 text-white py-2 px-4 rounded-md shadow-sm font-medium">
              Verification email resent successfully. Please check your inbox.
            </div>
          )}
        </>
      }
    />
  );
};

export default LoginScreen;