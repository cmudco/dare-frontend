import * as Yup from "yup";

export const initialValues = {
  emailOrUsername: "",
  password: "",
};

export const validationSchema = Yup.object({
  emailOrUsername: Yup.string().required(
    "Enter your username or email address"
  ),
  password: Yup.string().required("Enter a password"),
});
