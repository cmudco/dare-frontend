import { Formik, FormikHelpers } from "formik";
import TextInput from "../../components/TextInput"; // Reusable component
import { Button } from "@material-tailwind/react";
import { initialValues, validationSchema, FormErrors } from "./validation";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

const ResetPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (
    values: typeof initialValues,
    { setErrors }: FormikHelpers<typeof initialValues>
  ) => {
    console.log("Form submitted:", values);

    // Simulate a backend validation error for the password field
    const errors: FormErrors = { password: "This password is too weak" };
    setErrors(errors);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }) => (
        <form
          onSubmit={handleSubmit}
          className='p-16 mx-auto shadow-md rounded-lg bg-white border-6 border-white lg:w-[50vw] md:w-[60vw] w-[80vw] flex flex-col items-center justify-center gap-3 relative min-h-[50vh]  '
        >
          <p
            className='absolute top-5 left-9 w-full text-xs mt-4 cursor-pointer text-left flex items-center gap-1'
            onClick={() => navigate("/login")}
          >
            <ArrowLeftIcon className='h-5 w-5' />
            Back to login
          </p>

          <img
            src='/icons/Logo.png'
            alt='company icon'
            className='absolute -top-10 w-24'
          />

          <h1 className='text-2xl font-black text-center mb-4'>Set a password</h1>
          <p className='text-center text-sm mb-6'>
            Your previous password has been reset. Please set a new password for your account.
          </p>

          <div className='lg:w-[70%] md:w-[70%] w-[80%]'>
            <TextInput
              name='password'
              label='Create Password'
              type='password'
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password && touched.password && errors.password}
            />

            <TextInput
              name='confirmPassword'
              label='Confirm Password'
              type='password'
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                errors.confirmPassword &&
                touched.confirmPassword &&
                errors.confirmPassword
              }
            />

            <Button
              type='submit'
              disabled={isSubmitting}
              size='sm'
              className='w-full mt-4 bg-primary normal-case font-medium text-md'
            >
              Set Password
            </Button>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default ResetPassword;