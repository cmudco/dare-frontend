import * as Yup from "yup";

export const initialValues = {
  verificationCode: "",
};

export interface FormErrors {
  verificationCode?: string;
}

export const validationSchema = Yup.object({
  verificationCode: Yup.string()
    .required("Verification code is required"),
});
