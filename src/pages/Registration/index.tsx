import React from "react";
import AuthCard from "../../components/AuthCard";
import AuthFormFooter from "../../components/AuthFormFooter";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";

const RegistrationScreen: React.FC = () => {
  const handleSubmit = (values: FormikValues) => {
    console.log("Submitted values:", values);
  };

  return (

      <AuthCard
        title='Create Account'
        subtitle='Create your account to get started'
        inputs={[
          { name: "username", label: "Username", type: "text" },
          { name: "email", label: "Email Address", type: "email" },
          { name: "password", label: "Password", type: "password" },
          {
            name: "confirmPassword",
            label: "Confirm Password",
            type: "password",
          },
          { name: "accessCode", label: "Access Code", type: "text" },
        ]}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      buttonText='Create Account'
      showprivacyPolicy
        footer={
          <AuthFormFooter
            text='Already have an account?'
            route='/login'
            routeText='Log in'
          />
        }
      />



  );
};

export default RegistrationScreen;
