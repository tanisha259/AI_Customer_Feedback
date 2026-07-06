import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CLASSIFY_MODEL = "gemini-2.5-flash";
const ANSWER_MODEL = "gemini-2.5-flash";
const REPORT_MODEL = "gemini-2.5-flash";
const EMBEDDING_MODEL = "gemini-embedding-2";

function stripFences(s: string) {
  return s.replace(/```json/gi, "").replace(/```/g, "").trim();
}

const ClassificationSchema = z.object({
  sentiment: z.enum(["POS", "NEU", "NEG"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).min(1),
  featureArea: z.string(),
  rationale: z.string(),
});
export type Classification = z.infer<typeof ClassificationSchema>;

/**
 * AI1 — Auto-classification (Section 08).
 * Sends existing theme names so Gemini reuses them instead of inventing a
 * new theme per item, then validates the response before it ever touches
 * the database.
 */
export async function classifyFeedback(
  content: string,
  existingThemeNames: string[]
): Promise<Classification> {
  const prompt = `You are LOOP's classification engine. Classify this single piece of customer feedback.
Existing theme list (reuse one or more where they genuinely fit; propose a new short theme name only if nothing fits): ${existingThemeNames.join(", ")}.

Feedback: """${content}"""

Return ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"sentiment":"POS|NEU|NEG","sentimentScore":-1 to 1 number,"themes":["Theme A"],"featureArea":"short 2-4 word label","rationale":"one short sentence"}`;

  const model = genAI.getGenerativeModel({
    model: CLASSIFY_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = JSON.parse(stripFences(raw));
    return ClassificationSchema.parse(parsed);
  } catch (error) {
    // Fallback if parsing fails.
    return {
      sentiment: "NEU",
      sentimentScore: 0,
      themes: ["Feature Requests"],
      featureArea: "General",
      rationale: "Classifier response could not be parsed — flagged for manual review.",
    };
  }
}

/**
 * Embeddings for Ask LOOP's retrieval step (AI3). Uses Google Gemini.
 * Called once per feedback item on ingest, and once per question.
 */
export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export type CitedFeedback = { id: string; content: string; channel: string; sentiment: string | null };

/**
 * AI3 — Ask LOOP grounded Q&A.
 */
export async function answerFromFeedback(question: string, items: CitedFeedback[]): Promise<string> {
  if (items.length === 0) {
    return "There's no feedback in the workspace yet that relates to this question.";
  }
  const contextBlock = items
    .map((c, i) => `[${i + 1}] (${c.channel}, ${c.sentiment ?? "unclassified"}) "${c.content}"`)
    .join("\n");

  const prompt = `You are Ask LOOP, a grounded Q&A assistant over a company's customer feedback. Answer the question using ONLY the feedback items listed below. Do not invent feedback that isn't listed. If the provided items don't answer the question, say so plainly. Reference items by their [number]. Keep the answer to 2-4 sentences plus a short list of what customers said.

Feedback items:
${contextBlock}

Question: ${question}`;

  const model = genAI.getGenerativeModel({ model: ANSWER_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export type ReportStats = {
  total: number;
  negPct: number;
  posPct: number;
  topThemes: { name: string; count: number }[];
  spike: { name: string; pct: number } | null;
  negQuotes: string[];
  posQuotes: string[];
};

/**
 * AI4 — Voice-of-Customer report.
 */
export async function generateReportNarrative(periodLabel: string, stats: ReportStats): Promise<string> {
  const prompt = `You are LOOP's report writer. Write a concise Voice-of-Customer digest for "${periodLabel}" using ONLY the data below — do not invent numbers or quotes not listed.

Total feedback items: ${stats.total}
Negative %: ${stats.negPct}%
Positive %: ${stats.posPct}%
Top themes (name: count): ${stats.topThemes.map((t) => `${t.name}: ${t.count}`).join(", ")}
Spiking theme vs prior period: ${stats.spike ? `${stats.spike.name} (+${stats.spike.pct}%)` : "none notable"}
Sample negative quotes: ${stats.negQuotes.map((q) => `"${q}"`).join(" | ")}
Sample positive quotes: ${stats.posQuotes.map((q) => `"${q}"`).join(" | ")}

Write four short sections with these exact headers on their own line: "Summary", "Top Themes", "Sentiment Shifts", "Recommended Actions". Keep it tight — a Head of Product should read it in 90 seconds. Plain text only, no markdown symbols.`;

  const model = genAI.getGenerativeModel({ model: REPORT_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
