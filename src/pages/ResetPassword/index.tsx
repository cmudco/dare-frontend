import React from "react";
import AuthCard from "../../components/AuthCard";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";

const ResetPasswordScreen: React.FC = () => {
  const handleSubmit = (values: FormikValues) => {
    console.log("Submitted values:", values);
  };

  return (
    <AuthCard
      title='Set a password'
      subtitle='Your previous password has been reset. Please set a new password for your account.'
      inputs={[
        { name: "password", label: "Create Password", type: "password" },
        {
          name: "confirmPassword",
          label: "Confirm Password",
          type: "password",
        },
      ]}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      buttonText='Set Password'
      showBackButton
    />
  );
};

export default ResetPasswordScreen;
