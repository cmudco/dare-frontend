import {
  AllocateResponse,
  AllocateToMemberPayload,
  GroupWallet,
  OwnedGroupMember,
  OwnedGroupResponse,
  UpdateGroupPolicyPayload,
  UpsertUserOverridePayload,
  UpsertUserOverrideResponse,
} from '@/redux/types/billing'
import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

export const fetchOwnedGroupsAPI = async (): Promise<OwnedGroupResponse[]> => {
  return baseRequest<OwnedGroupResponse[]>({
    url: 'api/billing/group-wallets/owned/',
    method: METHOD.GET,
  })
}

export const fetchGroupMembersAPI = async (
  groupWalletId: number
): Promise<OwnedGroupMember[]> => {
  return baseRequest<OwnedGroupMember[]>({
    url: `api/billing/group-wallets/${groupWalletId}/members/`,
    method: METHOD.GET,
  })
}

export const updateGroupPolicyAPI = async (
  groupWalletId: number,
  payload: UpdateGroupPolicyPayload
): Promise<GroupWallet> => {
  return baseRequest<GroupWallet>({
    url: `api/billing/group-wallets/${groupWalletId}/`,
    method: METHOD.PATCH,
    data: payload,
  })
}

export const allocateToMemberAPI = async (
  groupWalletId: number,
  payload: AllocateToMemberPayload
): Promise<AllocateResponse> => {
  return baseRequest<AllocateResponse>({
    url: `api/billing/group-wallets/${groupWalletId}/allocate/`,
    method: METHOD.POST,
    data: payload,
  })
}

export const upsertUserOverrideAPI = async (
  groupWalletId: number,
  userId: number,
  payload: UpsertUserOverridePayload
): Promise<UpsertUserOverrideResponse> => {
  return baseRequest<UpsertUserOverrideResponse>({
    url: `api/billing/group-wallets/${groupWalletId}/members/${userId}/override/`,
    method: METHOD.PUT,
    data: payload,
  })
}

export const clearUserOverrideAPI = async (
  groupWalletId: number,
  userId: number
): Promise<void> => {
  await baseRequest<void>({
    url: `api/billing/group-wallets/${groupWalletId}/members/${userId}/override/`,
    method: METHOD.DELETE,
  })
}
