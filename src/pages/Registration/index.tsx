import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthCard from "../../components/AuthCard";
import AuthFormFooter from "../../components/AuthFormFooter";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { AppDispatch } from "../../redux/store";
import { userRegister } from "../../redux/aynscThunks/user";

const RegistrationScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (values: FormikValues) => {
    const formData = {
      username: values.username,
      email: values.email,
      password: values.password,
      confirm_password: values.confirmPassword,
      access_code: values.accessCode,
    };

    const resultAction = await dispatch(userRegister(formData));

    if (userRegister.fulfilled.match(resultAction)) {
      navigate("/confirmation", {
        state: { email: values.email, password: values.password },
      });
    }
  };

  return (
    <AuthCard
      title='Create Account'

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
