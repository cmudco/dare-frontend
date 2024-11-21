import * as Yup from "yup";

export const initialValues = {
  emailOrUsername: "",
  password: "",
};

export const validationSchema = Yup.object({
  emailOrUsername: Yup.string()
    .required("Enter your username or email address")
    .test("valid-format", "Enter valid credentials", function (value) {
      return /^[a-zA-Z0-9._]{3,}$/.test(value);
    }),
  password: Yup.string().required("Enter a password"),
});
