import { describe, expect, it } from 'vitest'
import { signupValidationSchema } from './validation'

const values = {
  name: 'Applicant',
  email: 'applicant@example.test',
  password1: 'Synthetic-password-846!',
  password2: 'Synthetic-password-846!',
}

describe('optional signup code', () => {
  it('allows omitted and blank codes for administrator review', async () => {
    await expect(signupValidationSchema.validate(values)).resolves.toBeDefined()
    await expect(
      signupValidationSchema.validate({ ...values, accessCode: '' })
    ).resolves.toBeDefined()
  })
  it('retains supplied codes and password validation', async () => {
    const result = await signupValidationSchema.validate({
      ...values,
      accessCode: ' invitation ',
    })
    expect(result.accessCode).toBe('invitation')
    await expect(
      signupValidationSchema.validate({ ...values, password2: 'different' })
    ).rejects.toThrow('Password does not match')
  })
})
