import React from "react";
import AuthCard from "../../components/AuthCard";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { useNavigate } from "react-router-dom";

const VerifyCodeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (values: FormikValues) => {
    console.log("Submitted values:", values);
    navigate("/reset-password");
  };

  return (
    <AuthCard
      title='Verify Code'
      subtitle='An authentication code has been sent to your email.'
      inputs={[{ name: "verificationCode", label: "Enter Code", type: "text" }]}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      buttonText='Verify'
      showBackButton
      footer={
        <p className='text-left text-xs mt-2'>
          Didn't receive a code?{" "}
          <span className='text-red-500 text-xs font-body font-extrabold cursor-pointer'>
            Resend
          </span>
        </p>
      }
    />
  );
};

export default VerifyCodeScreen;
