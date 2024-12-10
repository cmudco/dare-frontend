import React from "react";
import AuthCard from "../../components/AuthCard";
import AuthFormFooter from "../../components/AuthFormFooter";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { firebaseLogin, verifyEmail, login, resendEmailVerification } from "../../redux/aynscThunks/user";

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const error = useSelector((state: RootState) => state.user.error);
  console.log(error)
  const handleSubmit = async (values: FormikValues) => {
    const loginData = {
      email: values.emailOrUsername,
      password: values.password,
    };

    const resultAction = await dispatch(firebaseLogin(loginData));

    if (!firebaseLogin.fulfilled.match(resultAction)) {
      return;
    }

    const emailAction = await dispatch(
      verifyEmail({ firebase_uid: resultAction.payload.firebaseUid })
    );

    if (!verifyEmail.fulfilled.match(emailAction)) {
      return;
    }

    const loginAction = await dispatch(
      login({
        id_token: resultAction.payload.idToken,
        email: loginData.email,
        password: loginData.password,
      })
    );

    if (!login.fulfilled.match(loginAction)) {
      return;
    }

    handleLoginSuccess(loginAction.payload);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoginSuccess = (payload: any) => {
    if (payload.setup_2fa_required) {
      navigate("/otp-required");
    } else if (payload.otp_required) {
      navigate("/verify-code");
    } else {
      navigate("/dashboard");
    }
  };

  const handleResendVerification = async () => {
    const loginData = {
      email: initialValues.emailOrUsername,
      password: initialValues.password,
    };
    await dispatch(resendEmailVerification(loginData));
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
          {error && (
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
