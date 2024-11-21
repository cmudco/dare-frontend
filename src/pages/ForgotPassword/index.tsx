import React from "react";
import AuthCard from "../../components/AuthCard";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { useNavigate } from "react-router-dom";

const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (values: FormikValues) => {
    console.log("Submitted values:", values);
    navigate("/verify-code");
  };

  return (
    <AuthCard
      title='Forgot your password'
      subtitle="Don't worry, happens to all of us. Enter your email below to recover your password."
      inputs={[{ name: "email", label: "Email", type: "email" }]}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      buttonText='Recover Password'
      showBackButton
    />
  );
};

export default ForgotPasswordScreen;
