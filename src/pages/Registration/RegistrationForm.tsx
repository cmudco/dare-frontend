import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";

import { registrationValidationSchema } from "./validation"; // Ensure this validation schema is defined

// Toggle password visibility
const RegistrationForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessCode: "",
  };

  const handleSubmit = (values: any) => {
    console.log("Form submitted:", values);
  };

  return (
    <div className="relative w-full h-screen bg-[#FEF8F9]">
      {/* Background Circle */}
      <div className="absolute w-[733px] h-[733px] left-1/2 top-[-350px] transform -translate-x-1/2 bg-[#EE183C] opacity-10 blur-[200px]" />

      {/* Noise Texture */}
      <div className="absolute w-full h-full bg-[url(.png)] mix-blend-overlay opacity-35" />

      {/* Form Box */}
      <div className="absolute w-[588px] h-[618px] left-[50%] top-[20%] transform -translate-x-1/2 border border-[#DCDCDD] rounded-lg">
        <Formik
          initialValues={initialValues}
          validationSchema={registrationValidationSchema} // Use your validation schema
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col items-center p-6 bg-gradient-to-b from-[#FBFAFB] to-[#FFFFFF] border-6 border-white shadow-xl rounded-lg">
              <h1 className="text-3xl font-semibold mb-6 text-center text-black">Create Account</h1>

              {/* Username Field */}
              <div className="mb-4 w-full">
                <label htmlFor="username" className="block text-sm font-medium">Username</label>
                <Field
                  type="text"
                  id="username"
                  name="username"
                  className="w-full p-2 border rounded-md mt-2 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter your username"
                />
                <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Email Field */}
              <div className="mb-4 w-full">
                <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-2 border rounded-md mt-2 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter your email"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Password Field */}
              <div className="mb-4 w-full">
                <label htmlFor="password" className="block text-sm font-medium">Password</label>
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="w-full p-2 border rounded-md mt-2 focus:ring-2 focus:ring-indigo-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 11V7a3 3 0 00-3-3H7a3 3 0 00-3 3v10a3 3 0 003 3h7a3 3 0 003-3v-4" />
                    </svg>
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Confirm Password Field */}
              <div className="mb-4 w-full">
                <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Field
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full p-2 border rounded-md mt-2 focus:ring-2 focus:ring-indigo-400"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 11V7a3 3 0 00-3-3H7a3 3 0 00-3 3v10a3 3 0 003 3h7a3 3 0 003-3v-4" />
                    </svg>
                  </button>
                </div>
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Access Code Field */}
              <div className="mb-4 w-full">
                <label htmlFor="accessCode" className="block text-sm font-medium">Access Code</label>
                <Field
                  type="text"
                  id="accessCode"
                  name="accessCode"
                  className="w-full p-2 border rounded-md mt-2 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter your access code"
                />
                <ErrorMessage name="accessCode" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 mt-4"
              >
                Create Account
              </button>

              {/* Login Redirect */}
              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <a href="/login" className="text-indigo-500">Log in</a>
              </p>

              {/* Footer Text */}
              <p className="text-center text-xs text-gray-500 mt-4">
                By signing up, you are agreeing to Dare's Terms of Service and Privacy Policy.
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RegistrationForm;