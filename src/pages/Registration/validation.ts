import * as Yup from 'yup'

export type SignupFormValues = {
  name: string
  email: string
  password1: string
  password2: string
  // role: string;
}

export const signupInitialValues: SignupFormValues = {
  name: '',
  email: '',
  password1: '',
  password2: '',
  // role: "",
}

export const signupValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .required('Please enter email address')
    .email('Please enter a valid email'),
  password1: Yup.string()
    .min(8, 'Use 8 characters or more for your password')
    .required('Password is required'),
  password2: Yup.string()
    .oneOf([Yup.ref('password1')], 'Password does not match')
    .required('Confirm Password is required'),
  // role: Yup.string()
  //     .oneOf(["professor", "student"], "Please select a role")
  //     .required("Role is required"),
})
