import * as Yup from "yup";

export type LoginFormValues = {
    email: string;
    password: string;
};

export const loginInitialValues: LoginFormValues = {
    email: "",
    password: "",
};

export const loginValidationSchema = Yup.object({
    email: Yup.string()
        .required("Enter valid credentials.")
        .email("Please enter a valid email address"),
    password: Yup.string().required("Enter a password"),
});

export const emailValidationSchema = Yup.object({
    email: Yup.string()
        .matches(/@/, "Please include an '@' in the email address")
        .email("Please enter a valid email address")
        .required("Enter an Email Address"),
});
