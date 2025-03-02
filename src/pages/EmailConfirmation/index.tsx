import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthFormFooter from "../../components/Auth/AuthFormFooter";
import AuthCard from "../../components/Auth/AuthCard";
import * as Yup from "yup";
import { AppDispatch } from "../../redux/store";
import { resendVerification } from "../../redux/aynscThunks/user";

const EmailConfirmationScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const email = location.state?.email;
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  const handleResendVerification = async () => {
    try {
      const resultAction = await dispatch(resendVerification({ email })).unwrap();
      if (resendVerification.rejected.match(resultAction)) {
        return;
      }
      setResendSuccess(true);
    } catch (err) {
      console.error("Failed to resend verification email:", err);
    }
  };

  const handleSubmit = () => {
    navigate("/login");
  };

  const formikConfig = {
    initialValues: {},
    validationSchema: Yup.object({}),
    onSubmit: handleSubmit,
  };

  return (
    <AuthCard
      title="Email Confirmation"
      subtitle="A verification link has been sent to your email. Please check your email and click on the link to verify your account."
      inputs={[]}
      formikConfig={formikConfig}
      buttonText="Back to login"
      showBackButton={false}
      footer={
        <>
          <AuthFormFooter
            text="Didn't receive an email?"
            routeText="Resend"
            onClick={handleResendVerification}
          />
          {resendSuccess && (
            <div className="text-xs w-max mt-3 bg-green-500 text-white py-2 px-4 rounded-md shadow-sm font-medium">
              Verification email resent successfully.
            </div>
          )}
        </>
      }
    />
  );
};

export default EmailConfirmationScreen;
