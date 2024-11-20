import * as Yup from "yup";

export const initialValues = {
  emailOrUsername: "",
  password: "",
};

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  accessCode?: string;
}

export const validationSchema = Yup.object({
  emailOrUsername: Yup.string().required(
    "Enter your username or email address"
  ),
  password: Yup.string().required("Password is required"),
});
