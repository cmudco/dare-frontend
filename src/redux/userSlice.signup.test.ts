import { describe, expect, it } from 'vitest'
import reducer from './userSlice'
import { userRegister, verifyEmailRegistration } from './asyncThunks/user'

const registration = {
  name: 'Applicant',
  email: 'applicant@example.test',
  password1: 'Strong-password-1',
  password2: 'Strong-password-1',
}

describe('signup state', () => {
  it('does not authenticate after either registration path', () => {
    for (const approvalRequired of [true, false]) {
      const state = reducer(
        undefined,
        userRegister.fulfilled(
          { detail: 'Check your email.', approvalRequired },
          'one',
          registration
        )
      )
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.error).toBeNull()
    }
  })

  it('reports pending administrator approval after verification', () => {
    const state = reducer(
      undefined,
      verifyEmailRegistration.fulfilled(
        { detail: 'ok', approvalRequired: true },
        'one',
        { key: 'key' }
      )
    )
    expect(state.successMessage).toBe(
      'Email verified. Administrator approval is still required.'
    )
  })

  it('keeps the existing verified messages when approval is not pending', () => {
    const verified = reducer(
      undefined,
      verifyEmailRegistration.fulfilled({ detail: 'ok' }, 'one', { key: 'k' })
    )
    expect(verified.successMessage).toBe('Email verified successfully')
    const already = reducer(
      undefined,
      verifyEmailRegistration.fulfilled(
        { detail: 'ok', alreadyVerified: true },
        'one',
        { key: 'k' }
      )
    )
    expect(already.successMessage).toBe('Your email is already verified')
  })
})
