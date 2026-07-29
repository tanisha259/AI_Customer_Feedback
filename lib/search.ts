/** Cosine similarity between two equal-length vectors, in [-1, 1]. */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export type Candidate<T> = { vector: number[]; payload: T };

/** Ranks candidates by cosine similarity to the query vector, descending. */
export function retrieveTopK<T>(queryVector: number[], candidates: Candidate<T>[], k = 6): T[] {
  return candidates
    .map((c) => ({ payload: c.payload, score: cosineSimilarity(queryVector, c.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((c) => c.payload);
}
