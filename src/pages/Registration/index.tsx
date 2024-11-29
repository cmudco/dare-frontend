import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthCard from "../../components/AuthCard";
import AuthFormFooter from "../../components/AuthFormFooter";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { AppDispatch } from "../../redux/store";
import { register } from "../../redux/userSlice";

const RegistrationScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (values: FormikValues) => {
    console.log("Submitted values:", values);

    const formData = {
      username: values.username,
      email: values.email,
      password: values.password,
      confirm_password: values.confirmPassword,
      access_code: values.accessCode,
    };

    const resultAction = await dispatch(register(formData));

    if (register.fulfilled.match(resultAction)) {
      navigate("/verify-code");
    } else if (register.rejected.match(resultAction)) {
      console.error("Registration failed:", resultAction.payload);
    }
  };

  return (
    <AuthCard
      title='Create Account'
      // subtitle=''
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
