import { Formik, FormikHelpers } from "formik";
import TextInput from "../../components/TextInput"; // Reusable component
import { Button } from "@material-tailwind/react";
import { initialValues, validationSchema } from "./validation";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (
    values: typeof initialValues,
    { setErrors }: FormikHelpers<typeof initialValues>
  ) => {
    console.log("Form submitted:", values);

    // Simulate API call or any further actions
    setTimeout(() => {
      alert("Password reset link has been sent to your email!");
      navigate("/verify-code");
    }, 1000);
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
          className='p-8 mx-auto shadow-md rounded-lg bg-white border-6 border-white lg:w-[50vw] md:w-[60vw] w-[80vw] flex flex-col items-center justify-center  gap-3 relative min-h-[50vh]'
        >
          <p
            className='absolute top-5 left-9 w-full text-xs  mt-4 cursor-pointer text-left flex items-center gap-1'
            onClick={() => navigate("/login")}
          >
            <ArrowLeftIcon className='h-5 w-5 ' />
            Back to login
          </p>
          <img
            src='/icons/Logo.png'
            alt='company icon'
            className='absolute -top-10 w-24'
          />

          <h1 className='text-2xl font-black text-center mb-4'>
            Forgot your password
          </h1>
          <p className='text-center text-sm text-black-900 mb-6'>
            Don’t worry, happens to all of us. Enter your email below to recover
            your password.
          </p>

          <div className='lg:w-[70%] md:w-[70%] w-[80%]'>
            <TextInput
              name='email'
              label='Email'
              type='email'
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email && touched.email && errors.email}
            />

            <Button
              type='submit'
              disabled={isSubmitting}
              size='sm'
              className='w-full mt-4 bg-primary normal-case font-medium text-md'
            >
              Submit
            </Button>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default ForgotPassword;
