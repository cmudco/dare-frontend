import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthCard from "../../components/AuthCard";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { AppDispatch } from "../../redux/store";
import { forgotPassword } from "../../redux/userSlice"; // Assuming you have a forgotPassword action

const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (values: FormikValues) => {
    console.log("Submitted values:", values);

    const formData = {
      email: values.email,
    };

    const resultAction = await dispatch(forgotPassword(formData));

    if (forgotPassword.fulfilled.match(resultAction)) {
      navigate("/verify-code");
    } else if (forgotPassword.rejected.match(resultAction)) {
      console.error("Password recovery failed:", resultAction.payload);
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
