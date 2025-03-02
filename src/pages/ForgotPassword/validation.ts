import * as Yup from "yup";

type ForgotPasswordFormValues = {
    email: string;
};

export const forgotPasswordInitialValues: ForgotPasswordFormValues = {
    email: "",
};

export const forgotPasswordValidationSchema = Yup.object({
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
});
