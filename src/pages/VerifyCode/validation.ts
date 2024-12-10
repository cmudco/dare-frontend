import * as Yup from "yup";

export const initialValues = {
  otp: "",
};

export const validationSchema = Yup.object({
  otp: Yup.string()
    .required("Enter verification code")
    .matches(/^\d+$/, "Incorrect verification code")
});
