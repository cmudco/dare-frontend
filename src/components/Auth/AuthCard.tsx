import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, FormikConfig, FormikValues } from "formik";
import TextInput from "../UI/TextInput";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { Spinner } from "@material-tailwind/react";

interface InputField {
  name: string;
  label: string;
  type: string;
}

interface AuthCardProps<T extends FormikValues> {
  title: string;
  subtitle?: string;
  inputs: InputField[];
  formikConfig: FormikConfig<T>;
  buttonText: string;
  showBackButton?: boolean;
  showForgotPassword?: boolean;
  showprivacyPolicy?: boolean;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  roleSelect?: React.ReactNode;
  onResendVerification?: (values: T) => void;
}

const AuthCard = <T extends FormikValues>({
  title,
  subtitle,
  inputs,
  formikConfig,
  buttonText,
  showBackButton = false,
  showForgotPassword = false,
  showprivacyPolicy = false,
  footer,
  children,
  roleSelect,
  onResendVerification,
}: AuthCardProps<T>) => {
  const navigate = useNavigate();
  const error = useSelector((state: RootState) => state.user.error);
  const loading = useSelector((state: RootState) => state.user.loading);

  const showResendButton =
    onResendVerification &&
    error &&
    error.toLowerCase().includes("e-mail is not verified");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="absolute sm:block hidden w-full h-full">
        <img src="/shapes/BgCircle.png" alt="" />
      </div>
      <div className="p-8 mx-auto shadow-md rounded-2xl bg-white border-6 border-white xl:w-[40vw] lg:w-[50vw] md:w-[60vw] w-[80vw] flex flex-col items-center justify-center relative xl:min-h-[55vh] min-h-[50vh]">
        {showBackButton && (
          <div
            className="absolute top-5 left-9 w-full text-xs mt-4 cursor-pointer text-left flex items-center gap-1"
            onClick={() => navigate("/login")}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="hidden lg:block">Back to login</span>
          </div>
        )}

        <img
          src="/icons/Logo.png"
          alt="company icon"
          className="absolute -top-10 w-24"
        />

        <h1 className="text-2xl font-black text-center mb-8">{title}</h1>
        {subtitle && <p className="text-center text-sm mb-6">{subtitle}</p>}

        {children}

        <Formik {...formikConfig}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form className="lg:w-[70%] md:w-[70%] w-[80%]">
              {inputs.map((input) => (
                <TextInput
                  key={input.name}
                  name={input.name}
                  label={input.label}
                  type={input.type}
                  value={values[input.name] || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    errors[input.name] && touched[input.name]
                      ? String(errors[input.name])
                      : ""
                  }
                />
              ))}

              {roleSelect}

              {showForgotPassword && (
                <div className="flex justify-end text-sm mb-4">
                  <Link to="/forgot-password" className="text-red-500 font-medium">
                    Forgot Password?
                  </Link>
                </div>
              )}

              {buttonText && (
                <button
                  type="submit"
                  className="w-full mt-3 bg-primary text-white py-2 px-4 rounded-md shadow-sm text-md font-medium flex justify-center items-center"
                >
                  {loading ? (
                    <Spinner
                      color="red"
                      className="w-10"
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    />
                  ) : (
                    buttonText
                  )}
                </button>
              )}

              {error && (
                <div className="mt-3">
                  <p className="text-red-500 text-xs font-medium text-center">
                    {error}
                  </p>
                  {showResendButton && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => onResendVerification && onResendVerification(values)}
                        disabled={loading}
                        className="text-xs w-max mt-3 bg-gray-500 text-white py-2 px-4 rounded-md shadow-sm font-medium"
                      >
                        Resend Verification Email?
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Form>
          )}
        </Formik>

        {footer && <div className="mt-4">{footer}</div>}
      </div>

      {showprivacyPolicy && (
        <p className="text-center text-sm text-gray-500 pt-10">
          By signing up, you are agreeing to Dare's Terms of Service and Privacy Policy.
        </p>
      )}
    </div>
  );
};

export default AuthCard;
