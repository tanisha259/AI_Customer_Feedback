/**
 * @file lib/search.ts
 * Pure-TypeScript vector similarity utilities for the Ask LOOP RAG pipeline.
 *
 * No external dependencies — keeps the edge-compatible bundle small.
 * All vectors are expected to be unit-normalised float32 arrays produced by
 * the Gemini embedding model (`gemini-embedding-2`).
 */

/**
 * Cosine similarity between two vectors, returns a value in [-1, 1].
 * Returns 0 if either vector is the zero vector to avoid division by zero.
 */
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

/** Represents a piece of text (payload) alongside its dense vector representation. */
export type Candidate<T> = { vector: number[]; payload: T };

/** Ranks candidates by cosine similarity to the query vector, descending. */
export function retrieveTopK<T>(queryVector: number[], candidates: Candidate<T>[], k = 6): T[] {
  return candidates
    .map((c) => ({ payload: c.payload, score: cosineSimilarity(queryVector, c.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((c) => c.payload);
}
