export enum VectorDBChoice {
  PINECONE = 0,
  WEAVIATE = 1,
}

export const getVectorDBName = (value: number): string => {
  switch (value) {
    case VectorDBChoice.PINECONE:
      return 'Pinecone (public)'
    case VectorDBChoice.WEAVIATE:
      return 'Weaviate (private)'
    default:
      return 'Unknown'
  }
}
