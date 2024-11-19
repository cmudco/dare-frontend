import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import TextInput from "../../components/TextInput"; // Reusable component
import { Button } from "@material-tailwind/react";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  accessCode?: string;
}

const RegistrationForm = () => {
  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessCode: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .matches(/^[a-zA-Z0-9][a-zA-Z0-9.]*[a-zA-Z0-9]$/, "Sorry, only letters, numbers, periods (.) are allowed. The first character should be a letter or number. The last character should be a letter or number.")
      .required("Username is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .matches(/@/, "Please include an ‘@’ in the email address")
      .required("Enter an Email Address"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Use 8 characters or more for your password"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), undefined], "Passwords must match")
      .required("Confirm password is required"),
    accessCode: Yup.string().required("Enter an access code"),
  });

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
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit} className="p-8  mx-auto shadow-md rounded-lg bg-white border-6 border-white lg:w-[40vw] md:w-[60vw] max-w-md:w-[80vw]  flex flex-col items-center justify-center" >
          <h1 className="text-2xl font-semibold text-center mb-6">Create Account</h1>

          <div className="lg:w-[60%] md:w-[70%] max-md:w-[90%]">
          <TextInput
            name="username"
            label="Username"
            type="text"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username && touched.username && errors.username}
          />

          <TextInput
            name="email"
            label="Email Address"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email && touched.email && errors.email}
          />

          <TextInput
            name="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password && touched.password && errors.password}
          />

          <TextInput
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword && touched.confirmPassword && errors.confirmPassword}
          />

          <TextInput
            name="accessCode"
            label="Access Code"
            type="text"
            value={values.accessCode}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.accessCode && touched.accessCode && errors.accessCode}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            color="red"
            size="lg"
            className="w-full mt-4"
            placeholder=""
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            Create Account
          </Button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-500">
              Log in
            </a>
          </p>
        </form>
      )}
    </Formik>
  );
};

export default RegistrationForm;