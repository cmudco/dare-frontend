import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthFormFooter from "../../components/Auth/AuthFormFooter";
import { EmailConfirmationSchema, EmailConfirmationValues } from "./validation";
import { FormikConfig } from "formik"; // Import Formik types
import AuthCard from "../../components/Auth/AuthCard";

interface EmailConfirmationFormValues {
  verificationCode: string;
}

const EmailConfirmationScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const dispatch = useDispatch<AppDispatch>();

  const { email, password } = location.state || {};

  const handleResendVerification = async () => {
    const loginData = {
      email,
      password,
    };
    // await dispatch(resendEmailVerification(loginData));
    navigate("/login");
  };

  const handleSubmit = (values: EmailConfirmationFormValues) => {
    console.log("Form submitted with values:", values);
  };

  const formikConfig: FormikConfig<EmailConfirmationFormValues> = {
    initialValues: EmailConfirmationValues,
    validationSchema: EmailConfirmationSchema,
    onSubmit: handleSubmit,
  };

  return (
    <AuthCard<EmailConfirmationFormValues>
      title='Email Confirmation'
      subtitle='A verification link has been sent to your email. Please check your email and click on the link to verify your account.'
      inputs={[]}
      formikConfig={formikConfig}
      buttonText='Back to login'
      showBackButton={false}
      footer={<AuthFormFooter
        text="Didn't receive an email?"
        routeText='Resend'
        onClick={handleResendVerification} />}
    />
  );
};

export default EmailConfirmationScreen;