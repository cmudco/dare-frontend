import * as Yup from 'yup'

export const EmailConfirmationValues = {
  verificationCode: '',
}

export const EmailConfirmationSchema = Yup.object({
  verificationCode: Yup.string()
    .required('Enter verification code')
    .matches(/^\d+$/, 'Incorrect verification code'),
})
