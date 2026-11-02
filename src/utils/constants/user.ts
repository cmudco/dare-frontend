export enum VectorDbSource {
  PINECONE = 0,
  WEAVIATE = 1,
}

export const getVectorDBName = (value: number): string => {
  switch (value) {
    case VectorDbSource.PINECONE:
      return 'Pinecone (public)'
    case VectorDbSource.WEAVIATE:
      return 'Weaviate (private)'
    default:
      return 'Unknown'
  }
}

export enum AvatarType {
  INITIALS = 'initials',
  PRESET = 'preset',
  CUSTOM = 'custom',
}

export const EMAIL_DELIVERY_UNAVAILABLE_MESSAGE =
  "This server isn't set up to send email, so no verification link was sent. Contact your administrator to verify your account."
