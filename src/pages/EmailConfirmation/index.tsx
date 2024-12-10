import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthCard from "../../components/AuthCard";
import AuthFormFooter from "../../components/AuthFormFooter";
import { AppDispatch } from "../../redux/store";
import { resendEmailVerification } from "../../redux/aynscThunks/user";

const EmailConfirmationScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { email, password } = location.state || {};

  const handleResendVerification = async () => {
    const loginData = {
      email,
      password,
    };
    await dispatch(resendEmailVerification(loginData));
  };

  return (
    <AuthCard
      title='Email Confirmation'
      subtitle='A verification link has been sent to your email. Please check your email and click on the link to verify your account.'
      inputs={[]}
      initialValues={{}}
      validationSchema={null}
      onSubmit={() => navigate("/login")}
      buttonText='Back to login'
      showBackButton={false}
      footer={
        <AuthFormFooter
          text="Didn't receive an email?"
          routeText='Resend'
          onClick={handleResendVerification}
        />
      }
    ></AuthCard>
  );
};

export default EmailConfirmationScreen;
