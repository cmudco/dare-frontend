import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthCard from "../../components/Auth/AuthCard";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { AppDispatch } from "../../redux/store";
import { forgotPassword } from "../../redux/aynscThunks/user";

const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (values: FormikValues) => {
    const formData = {
      email: values.email,
    };

    const resultAction = await dispatch(forgotPassword(formData));

    if (forgotPassword.fulfilled.match(resultAction)) {
      navigate("/verify-code");
    }
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
