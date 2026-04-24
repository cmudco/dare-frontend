export enum PolicySource {
  USER = 'USER',
  GROUP = 'GROUP',
  SYSTEM = 'SYSTEM',
}

export const POLICY_SOURCE_LABELS: Record<PolicySource, string> = {
  [PolicySource.USER]: 'User override',
  [PolicySource.GROUP]: 'Group policy',
  [PolicySource.SYSTEM]: 'System default',
}

export const POLICY_SOURCE_BADGE_VARIANT: Record<
  PolicySource,
  'purple' | 'blue' | 'gray'
> = {
  [PolicySource.USER]: 'purple',
  [PolicySource.GROUP]: 'blue',
  [PolicySource.SYSTEM]: 'gray',
}
