import { Formik, FormikHelpers } from "formik";
import TextInput from "../../components/TextInput"; // Reusable component
import { Button } from "@material-tailwind/react";
import { initialValues, validationSchema } from "./validation";

const LoginForm = () => {
  const handleSubmit = (
    values: typeof initialValues,
    { setErrors }: FormikHelpers<typeof initialValues>
  ) => {
    console.log("Form submittedç:", values);
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
          className='p-8 mx-auto shadow-md rounded-lg bg-white border-6 border-white lg:w-[50vw] md:w-[60vw] w-[80vw] flex flex-col items-center justify-center relative'
        >
          <img
            src='/icons/Logo.png'
            alt='company icon'
            className='absolute -top-10 w-24'
          />

          <h1 className='text-2xl font-black text-center mb-6 mt-2'>Sign In to Dare Platform</h1>

          <div className='lg:w-[70%] md:w-[70%] w-[80%]'>
            <TextInput
              name='emailOrUsername'
              label='Username/Email'
              type='text'
              value={values.emailOrUsername}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                errors.emailOrUsername &&
                touched.emailOrUsername &&
                errors.emailOrUsername
              }
            />

            <TextInput
              name='password'
              label='Password'
              type='password'
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password && touched.password && errors.password}
            />
            <div className='flex justify-end text-sm mb-4'>
              <a href='/forgot-password' className='text-red-500 font-medium'>
                Forgot Password?
              </a>
            </div>

            <Button
              type='submit'
              disabled={isSubmitting}
              size='sm'
              className='w-full mt-3 bg-primary normal-case font-thin text-md'
            >
              Sign In
            </Button>
          </div>

          <p className='text-center text-sm text-gray-500 mt-4'>
            Don't have an account?{" "}
            <a href='/register' className='text-primary font-body font-bold'>
              Signup
            </a>
          </p>
        </form>
      )}
    </Formik>
  );
};

export default LoginForm;
