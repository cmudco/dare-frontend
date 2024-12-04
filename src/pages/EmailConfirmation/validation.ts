import * as Yup from "yup";

export const initialValues = {
  verificationCode: "",
};

export const validationSchema = Yup.object({
  verificationCode: Yup.string()
    .required("Enter verification code")
    .matches(/^\d+$/, "Incorrect verification code")
});
