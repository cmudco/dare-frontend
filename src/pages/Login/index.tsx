import React, { useState } from "react";
import AuthCard from "../../components/AuthCard";
import AuthFormFooter from "../../components/AuthFormFooter";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { firebaseLogin, login, verifyEmail, resendEmailVerification } from "../../redux/userSlice";

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Typed dispatch
  const [showResendButton, setShowResendButton] = useState(false);

  const handleSubmit = async (values: FormikValues) => {
    console.log("Submitted values:", values);
    const loginData = {
      email: values.emailOrUsername,
      password: values.password,
    };

    try {
      const resultAction = await dispatch(firebaseLogin(loginData));
      console.log("Result action:", resultAction);

      if (firebaseLogin.fulfilled.match(resultAction)) {
        console.log("Login successful!");
        console.log(resultAction);

        const emailAction = await dispatch(
          verifyEmail({ firebase_uid: resultAction.payload.firebaseUid })
        );

        if (verifyEmail.fulfilled.match(emailAction)) {
          await dispatch(
            login({
              id_token: resultAction.payload.idToken,
              email: loginData.email,
              password: loginData.password,
            })
          );
        } else {
          console.error("Email verification failed:", emailAction.payload);
          setShowResendButton(true);
        }
      } else {
        console.error("Login failed:", resultAction.payload);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleResendVerification = async () => {
    try {
      const loginData = {
        email: initialValues.emailOrUsername,
        password: initialValues.password,
      };
      await dispatch(resendEmailVerification(loginData));
      console.log("Resend verification email");
    } catch (error) {
      console.error("Error resending verification email:", error);
    }
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
        <>
          <AuthFormFooter
            text="Don't have an account?"
            route='/register'
            routeText='Signup'
          />
          {showResendButton && (
            <button
              onClick={handleResendVerification}
              className='text-xs w-max mt-3 bg-gray-500 text-white py-2 px-4 rounded-md shadow-sm font-medium'
            >
              Resend Verification Email?
            </button>
          )}
        </>
      }
    />
  );
};

export default LoginScreen;
