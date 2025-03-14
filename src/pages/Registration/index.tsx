import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthCard from "../../components/Auth/AuthCard";
import AuthFormFooter from "../../components/Auth/AuthFormFooter";
import { AppDispatch } from "../../redux/store";
import { userRegister } from "../../redux/aynscThunks/user";
import { SignupFormValues, signupInitialValues, signupValidationSchema } from "./validation";

import { resetError } from "../../redux/userSlice";


const RegistrationScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(resetError());
  }, [dispatch]);


  const handleSubmit = async (values: SignupFormValues) => {
    const formData = {
      name: values.name,
      email: values.email,
      password1: values.password1,
      password2: values.password2,
      // role: values.role,
    };

    try {
      const resultAction = await dispatch(userRegister(formData));
      if (userRegister.rejected.match(resultAction)) {
        return;
      }
      navigate("/confirmation", {
        state: { email: values.email, password: values.password1 },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formikConfig = {
    initialValues: signupInitialValues,
    validationSchema: signupValidationSchema,
    onSubmit: handleSubmit,
  };

  const inputs = [
    { name: "name", label: "Name", type: "text" },
    { name: "email", label: "Email Address", type: "email" },
    { name: "password1", label: "Password", type: "password" },
    {
      name: "password2",
      label: "Confirm Password", type: "password",
    },
  ];

  return (
    <AuthCard<SignupFormValues>
      title='Create Account'
      inputs={inputs}
      formikConfig={formikConfig}
      buttonText='Create Account'
      showprivacyPolicy
      footer={
        <>
          <AuthFormFooter
            text='Already have an account?'
            route='/login'
            routeText='Log in'
          />
        </>
      }
    >

    </AuthCard>
  );
};

export default RegistrationScreen;
