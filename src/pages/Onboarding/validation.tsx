import * as yup from 'yup'

export interface OnboardingFormValues {
  role: string
  industry: string
  purpose: string
  referralSource: string
}

export const onboardingInitialValues: OnboardingFormValues = {
  role: '',
  industry: '',
  purpose: '',
  referralSource: '',
}

export const onboardingValidationSchema = yup.object({
  role: yup.string().required('Role/Profession is required'),
  industry: yup.string().required('Industry/Major is required'),
  purpose: yup.string().required('Please tell us your goals'),
  referralSource: yup
    .string()
    .required('Please tell us how you heard about DARE'),
})
