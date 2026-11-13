import * as Yup from 'yup'

export const requestAccessValidationSchema = Yup.object({
  name: Yup.string().trim().max(255).required('Name is required'),
  email: Yup.string()
    .trim()
    .email('Enter a valid email address')
    .max(254)
    .required('Email is required'),
  reason: Yup.string().max(1000, 'Use no more than 1000 characters'),
})
