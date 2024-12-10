import * as Yup from "yup";

export const initialValues = {
  password: "",
  confirmPassword: "",
};

export const validationSchema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Use 8 characters or more for your password"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "Passwords must match")
    .required("Confirm password is required"),
});
