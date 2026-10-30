import { expect, it, vi } from 'vitest'
import { requestAccessAPI } from './accessRequests'
import { METHOD } from '@/utils/constants/requests'

const { baseRequestMock } = vi.hoisted(() => ({ baseRequestMock: vi.fn() }))
vi.mock('@/utils/requests', () => ({ baseRequest: baseRequestMock }))

it('requests access without attaching credentials or changing the applicant data', async () => {
  const input = {
    name: 'Applicant',
    email: 'applicant@example.test',
    reason: 'Research',
  }
  baseRequestMock.mockResolvedValueOnce({ detail: 'Request received' })
  expect(await requestAccessAPI(input)).toEqual({ detail: 'Request received' })
  expect(baseRequestMock).toHaveBeenCalledWith({
    url: 'users/api/access-requests/',
    method: METHOD.POST,
    includeAuthToken: false,
    data: input,
  })
})
