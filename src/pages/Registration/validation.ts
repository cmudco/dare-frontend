import * as Yup from "yup";

export const initialValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  accessCode: "",
};

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  accessCode?: string;
}

export const validationSchema = Yup.object({
  username: Yup.string()
    .matches(
      /^[a-zA-Z0-9][a-zA-Z0-9.]*[a-zA-Z0-9]$/,
      "Sorry, only letters, numbers, periods (.) are allowed. The first character should be a letter or number. The last character should be a letter or number."
    )
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
