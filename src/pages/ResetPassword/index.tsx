import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthCard from "../../components/Auth/AuthCard";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { AppDispatch } from "../../redux/store";
import { resetPassword } from "../../redux/aynscThunks/user";

const ResetPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (values: FormikValues) => {

    const formData = {
      password: values.password,
      confirmPassword: values.confirmPassword,
    };

    const resultAction = await dispatch(resetPassword(formData));

    if (resetPassword.fulfilled.match(resultAction)) {
      navigate("/login");
    } else if (resetPassword.rejected.match(resultAction)) {
      console.error("Password reset failed:", resultAction.payload);
    }
  };

  return (
    <AuthCard
      title='Set a password'
      subtitle='Your previous password has been reset. Please set a new password for your account.'
      inputs={[
        { name: "password", label: "Create Password", type: "password" },
        { name: "confirmPassword", label: "Confirm Password", type: "password" },
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
