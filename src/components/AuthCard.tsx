import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, FormikValues } from "formik";
import TextInput from "./TextInput";

interface InputField {
  name: string;
  label: string;
  type: string;
}

interface AuthCardProps {
  title: string;
  subtitle?: string;
  inputs: InputField[];
  validationSchema: any;
  onSubmit: (values: FormikValues) => void;
  buttonText: string;
  showBackButton?: boolean;
  showForgotPassword?: boolean;
  showprivacyPolicy?: boolean;
  footer?: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  inputs,
  initialValues,
  validationSchema,
  onSubmit,
  buttonText,
  showBackButton = false,
  showForgotPassword = false,
  showprivacyPolicy = false,
  footer,
}) => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <div className='absolute sm:block hidden w-full h-full'>
        <img src='/shapes/BgCircle.png' alt='' />
      </div>
      <div className='p-8 mx-auto shadow-md rounded-2xl bg-white border-6 border-white xl:w-[40vw] lg:w-[50vw] md:w-[60vw] w-[80vw] flex flex-col items-center justify-center relative xl:min-h-[55vh] min-h-[50vh]'>
        {showBackButton && (
          <div
            className='absolute top-5 left-9 w-full text-xs mt-4 cursor-pointer text-left flex items-center gap-1'
            onClick={() => navigate("/login")}
          >
            <ArrowLeftIcon className='h-5 w-5' />
            <span className='hidden lg:block'>Back to login</span>
          </div>
        )}

        <img
          src='/icons/Logo.png'
          alt='company icon'
          className='absolute -top-10 w-24'
        />

        <h1 className='text-2xl font-black text-center mb-8'>{title}</h1>
        {subtitle && <p className='text-center text-sm mb-6'>{subtitle}</p>}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form className='lg:w-[70%] md:w-[70%] w-[80%]'>
              {inputs.map((input) => (
                <TextInput
                  key={input.name}
                  name={input.name}
                  label={input.label}
                  type={input.type}
                  value={values[input.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    errors[input.name] && touched[input.name]
                      ? String(errors[input.name])
                      : ""
                  }
                />
              ))}

              {showForgotPassword && (
                <div className='flex justify-end text-sm mb-4'>
                  <Link
                    to='/forgot-password'
                    className='text-red-500 font-medium'
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full mt-3 bg-primary text-white py-2 px-4 rounded-md shadow-sm text-md font-medium'
              >
                {buttonText}
              </button>
            </Form>
          )}
        </Formik>

        {footer && <div className='mt-4'>{footer}</div>}
      </div>
      {showprivacyPolicy && (
        <p className='text-center text-sm text-gray-500 pt-10 '>
          By signing up, you are agreeing to Dare's Terms of Service and Privacy
          Policy.
        </p>
      )}
    </div>
  );
};

export default AuthCard;
