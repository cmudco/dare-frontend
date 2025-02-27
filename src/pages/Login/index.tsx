import React, { useEffect } from "react";
import AuthCard from "../../components/Auth/AuthCard";
import AuthFormFooter from "../../components/Auth/AuthFormFooter";
import { LoginFormValues, loginInitialValues, loginValidationSchema } from "./validation";
// import { FormikValues } from "formik";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { fetchUserData, userLogin } from "../../redux/aynscThunks/user";
import { resetError } from "../../redux/userSlice";
import { useAppSelector } from "../../redux/hooks";

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useAppSelector((state) => state.user)

  useEffect(() => {
    dispatch(resetError())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (values: LoginFormValues) => {

    try {
      dispatch(userLogin(values)).unwrap;
      dispatch(fetchUserData()).unwrap;
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
  const formikConfig = {
    initialValues: loginInitialValues,
    validationSchema: loginValidationSchema,
    onSubmit: handleSubmit,
  };

  return (
    <AuthCard<LoginFormValues>
      title='Sign In to Dare Platform'
      inputs={[
        { name: "email", label: "Email", type: "email" },
        { name: "password", label: "Password", type: "password" },
      ]}
      formikConfig={formikConfig}
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
              // onClick={handleResendVerification}
              disabled={loading}
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
