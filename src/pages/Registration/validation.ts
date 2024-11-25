import * as Yup from "yup";

export const initialValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  accessCode: "",
};

export const validationSchema = Yup.object({
  username: Yup.string()
    .matches(
      /^[a-zA-Z0-9]/,
      "The first character should be a letter or number."
    )
    .matches(/[a-zA-Z0-9]$/, "The last character should be a letter or number.")
    .matches(
      /^[a-zA-Z0-9.]*$/,
      "Sorry, only letters, numbers, periods (.) are allowed."
    )
    .required("Username is required"),
  email: Yup.string()
    .matches(/@/, "Please include an '@' in the email address")
    .email("Please enter a valid email address")
    .required("Enter an Email Address"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Use 8 characters or more for your password"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Password does not match")
    .required("Confirm password is required"),
  accessCode: Yup.string()
    .required("Enter an access code")
    .matches(/^\d+$/, "Invalid access code. Please try again")
    .length(6, "The access code you entered is incorrect. Try again"),
});
