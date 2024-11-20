import { Formik, FormikHelpers } from "formik";
import { initialValues, validationSchema, FormErrors } from "./validation";
import TextInput from "../../components/TextInput"; // Reusable component
import { Button } from "@material-tailwind/react";

const RegistrationForm = () => {
  const handleSubmit = (
    values: typeof initialValues,
    { setErrors }: FormikHelpers<typeof initialValues>
  ) => {
    console.log("Form submitted:", values);

    // Simulate a backend validation error for the username field
    const errors: FormErrors = { username: "This username is already taken" };
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
          className='p-8  mx-auto shadow-md rounded-lg bg-white border-6 border-white lg:w-[50vw] md:w-[60vw] w-[80vw]  flex flex-col items-center justify-center relative'
        >
          <img
            src='/icons/Logo.png'
            alt='company icon'
            className='absolute -top-10 w-24 '
          />

            <h1 className='text-2xl font-black text-center mb-6 mt-2 '>
            Create Account
            </h1>

          <div className='lg:w-[70%] md:w-[70%] w-[80%]'>
            <TextInput
              name='username'
              label='Username'
              type='text'
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.username && touched.username && errors.username}
            />

            <TextInput
              name='email'
              label='Email Address'
              type='email'
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email && touched.email && errors.email}
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

            <TextInput
              name='accessCode'
              label='Access Code'
              type='text'
              value={values.accessCode}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                errors.accessCode && touched.accessCode && errors.accessCode
              }
            />

            <Button
              type='submit'
              disabled={isSubmitting}
              size='sm'
              className='w-full mt-3 bg-primary normal-case font-thin text-md'
              placeholder=''
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              Create Account
            </Button>
          </div>

          <p className='text-center text-sm text-gray-500 mt-4'>
            Already have an account?{" "}
            <a href='/login' className='text-primary font-body font-bold'>
              Log in
            </a>
          </p>
        </form>
      )}
    </Formik>
  );
};

export default RegistrationForm;
