import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Swap for whichever current Claude model fits your cost/latency needs.
const CLASSIFY_MODEL = "claude-sonnet-5";
const ANSWER_MODEL = "claude-sonnet-5";
const REPORT_MODEL = "claude-sonnet-5";

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
 * Sends existing theme names so Claude reuses them instead of inventing a
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

  const message = await anthropic.messages.create({
    model: CLASSIFY_MODEL,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  try {
    const parsed = JSON.parse(stripFences(raw));
    return ClassificationSchema.parse(parsed);
  } catch {
    // Retry once with a stricter reminder before falling back — Section 09.1.
    const retry = await anthropic.messages.create({
      model: CLASSIFY_MODEL,
      max_tokens: 300,
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: raw },
        { role: "user", content: "That was not valid JSON matching the schema. Return ONLY the JSON object, nothing else." },
      ],
    });
    const retryRaw = retry.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    try {
      return ClassificationSchema.parse(JSON.parse(stripFences(retryRaw)));
    } catch {
      return {
        sentiment: "NEU",
        sentimentScore: 0,
        themes: ["Feature Requests"],
        featureArea: "General",
        rationale: "Classifier response could not be parsed after one retry — flagged for manual review.",
      };
    }
  }
}

/**
 * Embeddings for Ask LOOP's retrieval step (AI3). Uses Voyage AI, Anthropic's
 * recommended embeddings partner, so no separate OpenAI account is needed.
 * Called once per feedback item on ingest, and once per question.
 */
export async function embedText(text: string): Promise<number[]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: text, model: "voyage-3" }),
  });
  if (!res.ok) {
    throw new Error(`Voyage embeddings request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.data[0].embedding as number[];
}

export type CitedFeedback = { id: string; content: string; channel: string; sentiment: string | null };

/**
 * AI3 — Ask LOOP grounded Q&A. Retrieval happens in the caller (app/api/
 * insights/route.ts) via lib/search.ts; this function only ever sees the
 * feedback items retrieval already selected, and is explicitly instructed
 * not to go beyond them. Grounding is mandatory per Section 09.2.
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

  const message = await anthropic.messages.create({
    model: ANSWER_MODEL,
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
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
 * AI4 — Voice-of-Customer report. Stats are pre-computed in
 * app/api/reports/route.ts straight from Postgres; Claude only writes the
 * narrative around real numbers, per Section 09.3, so it can't hallucinate
 * figures.
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

  const message = await anthropic.messages.create({
    model: REPORT_MODEL,
    max_tokens: 700,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
