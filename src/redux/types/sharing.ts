export enum ShareableEntityType {
  Conversation = 'conversation',
  Workflow = 'workflow',
  Prompt = 'prompt',
}

export interface ShareRequest {
  contentType: ShareableEntityType
  objectId: string | number
  emails: string[]
  message?: string
}

export interface ShareSuccessItem {
  id: number
  email: string
}

export interface ShareFailureItem {
  email: string
  reason: string
}

export interface ShareResponse {
  shared: ShareSuccessItem[]
  failed: ShareFailureItem[]
}

export interface SharedItem {
  id: number
  contentType: ShareableEntityType
  objectId: string
  sharedByEmail: string
  sharedWithEmail: string | null
  isGroupShare: boolean
  groupAccessCode: string | null
  message: string
  entityTitle: string
  entityDescription: string
  entityContent: string
  entityVersion: number | null
  entityMode: string
  entityStepCount: number | null
  createdAt: string
}

export interface ShareWithGroupRequest {
  contentType: ShareableEntityType
  objectId: string | number
  message?: string
}

export interface ShareRecipient {
  id: number
  email: string | null
  isGroupShare: boolean
  groupAccessCode: string | null
  sharedAt: string
}

export interface GroupMember {
  email: string
  name: string
}

export interface MyGroupResponse {
  hasGroup: boolean
  group: {
    id: number
    accessCode: string
    memberCount: number
  } | null
  members: GroupMember[]
}

export interface SharingEntity {
  type: ShareableEntityType
  id: string | number
  title: string
  isPublished: boolean
  canPublish: boolean
  isForked: boolean
}

export interface SharingState {
  sharedWithMe: SharedItem[]
  recipients: ShareRecipient[]
  loading: boolean
  recipientsLoading: boolean
  error: string | null
  isOpen: boolean
  entity: SharingEntity | null
  lastShareResult: ShareResponse | null
  groupInfo: MyGroupResponse | null
  groupInfoLoading: boolean
}
