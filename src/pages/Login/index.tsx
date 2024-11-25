import React from "react";
import AuthCard from "../../components/AuthCard";
import AuthFormFooter from "../../components/AuthFormFooter";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { login } from "../../redux/userSlice";

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Typed dispatch

  const handleSubmit = (values: FormikValues) => {
    console.log("Submitted values:", values);
    const loginData = {
      username: values.emailOrUsername,
      password: values.password,
    };

    dispatch(login(loginData));
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
