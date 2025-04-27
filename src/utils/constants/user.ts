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
