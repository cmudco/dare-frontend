import React from "react";
import AuthCard from "../../components/AuthCard";
import AuthFormFooter from "../../components/AuthFormFooter";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";

const LoginScreen: React.FC = () => {
  const handleSubmit = (values: FormikValues) => {
    console.log("Submitted values:", values);
  };

  return (
    <AuthCard
      title='Sign In to Dare Platform'
      inputs={[
        { name: "emailOrUsername", label: "Username/Email", type: "text" },
        { name: "password", label: "Password", type: "password" },
      ]}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      buttonText='Sign In'
      showForgotPassword={true}
      footer={
        <AuthFormFooter
          text="Don't have an account?"
          route='/register'
          routeText='Signup'
        />
      }
    />
  );
};

export default LoginScreen;
