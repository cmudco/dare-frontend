import { describe, expect, it, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import reducer from './accessRequestSlice'
import { requestAccess } from './asyncThunks/accessRequest'
import { requestAccessAPI } from '@/api/accessRequests'

vi.mock('@/api/accessRequests', () => ({ requestAccessAPI: vi.fn() }))

const input = {
  name: 'Applicant',
  email: 'applicant@example.test',
  reason: 'Research',
}
const response = { detail: 'Request received; await administrator review.' }

describe('access-request lifecycle', () => {
  it('shows loading, success, and no account credentials', () => {
    const pending = reducer(undefined, requestAccess.pending('one', input))
    expect(pending.loading).toBe(true)
    expect(pending.response).toBeNull()
    const success = reducer(
      pending,
      requestAccess.fulfilled(response, 'one', input)
    )
    expect(success.loading).toBe(false)
    expect(success.response).toEqual(response)
    expect(success).not.toHaveProperty('token')
    expect(success).not.toHaveProperty('user')
  })

  it('shows a failure and clears it on retry', () => {
    const pending = reducer(undefined, requestAccess.pending('one', input))
    const failed = reducer(
      pending,
      requestAccess.rejected(null, 'one', input, 'Requests unavailable')
    )
    expect(failed.loading).toBe(false)
    expect(failed.error).toBe('Requests unavailable')
    const retry = reducer(failed, requestAccess.pending('two', input))
    expect(retry.error).toBeNull()
    expect(retry.loading).toBe(true)
  })

  it('ignores late success and failure from an earlier submission', () => {
    const first = reducer(undefined, requestAccess.pending('one', input))
    const second = reducer(first, requestAccess.pending('two', input))
    expect(
      reducer(second, requestAccess.fulfilled(response, 'one', input))
    ).toEqual(second)
    expect(
      reducer(second, requestAccess.rejected(null, 'one', input, 'Old error'))
    ).toEqual(second)
  })

  it('submits through the API and stores the generic response', async () => {
    vi.mocked(requestAccessAPI).mockResolvedValueOnce(response)
    const store = configureStore({ reducer })
    await store.dispatch(requestAccess(input))
    expect(requestAccessAPI).toHaveBeenCalledWith(input)
    expect(store.getState().response).toEqual(response)
  })

  it('preserves an actionable API error', async () => {
    vi.mocked(requestAccessAPI).mockRejectedValueOnce(
      new Error('Too many requests. Try later.')
    )
    const store = configureStore({ reducer })
    await store.dispatch(requestAccess(input))
    expect(store.getState().error).toBe('Too many requests. Try later.')
  })
})
