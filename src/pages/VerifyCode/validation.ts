import * as Yup from 'yup'

export type VerifyCodeFormValues = {
  verifyCode: string
}

export const verifyCodeInitialValues: VerifyCodeFormValues = {
  verifyCode: '',
}

export const verifyCodeValidationSchema = Yup.object().shape({
  verifyCode: Yup.string().required('Enter Code'),
})
