import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const THEME_LIST = [
  { name: "Onboarding", color: "#6E56CF" },
  { name: "Billing & Invoicing", color: "#E3A33E" },
  { name: "Mobile Experience", color: "#4F9A73" },
  { name: "Performance & Speed", color: "#D9534F" },
  { name: "Integrations & SSO", color: "#3B82A6" },
  { name: "Reporting & Exports", color: "#8A5CF6" },
  { name: "Customer Support", color: "#C2708A" },
  { name: "Pricing", color: "#B08968" },
  { name: "UI / UX Design", color: "#5C9EAD" },
  { name: "Feature Requests", color: "#7C9A4A" },
];

// Pre-classified so `npm run seed` works instantly with zero API calls and
// zero cost. New feedback ingested through the app (Section 08 / AI1) is
// classified live by Claude in lib/ai.ts — this seed data just gives you a
// realistic backlog to demo against on day one.
const SEED_FEEDBACK = [
  { content: "Onboarding took forever — I couldn't figure out how to invite my team.", channel: "Support Ticket", sentiment: "NEG", score: -0.6, themes: ["Onboarding"], featureArea: "Team invites", label: "Northwind Freight", status: "REVIEWED", daysAgo: 2 },
  { content: "The new dashboard is gorgeous and finally fast. Huge improvement over last quarter.", channel: "App Store Review", sentiment: "POS", score: 0.8, themes: ["UI / UX Design", "Performance & Speed"], featureArea: "Dashboard redesign", label: "Halcyon Labs", status: "ACTIONED", daysAgo: 4 },
  { content: "It does the job, but the mobile experience needs work — buttons are too small.", channel: "NPS Survey", sentiment: "NEU", score: -0.1, themes: ["Mobile Experience"], featureArea: "Mobile app", label: "Bramwell & Co", status: "NEW", daysAgo: 1 },
  { content: "Prospect wants SSO before they'll sign — third time this month we've lost a deal to this.", channel: "Sales Call Note", sentiment: "NEG", score: -0.5, themes: ["Integrations & SSO"], featureArea: "SSO", label: "Fenwick Group", status: "NEW", daysAgo: 0 },
  { content: "Love the new export feature, saved me an hour today. Please add scheduled exports next.", channel: "Community Post", sentiment: "POS", score: 0.7, themes: ["Reporting & Exports", "Feature Requests"], featureArea: "Exports", label: "Marden Studio", status: "REVIEWED", daysAgo: 6 },
  { content: "Billing page keeps timing out when I try to download an invoice. Happened three times this week.", channel: "Support Ticket", sentiment: "NEG", score: -0.7, themes: ["Billing & Invoicing", "Performance & Speed"], featureArea: "Invoice download", label: "Cobalt Retail", status: "ACTIONED", daysAgo: 8 },
  { content: "Support replied within ten minutes and actually fixed the problem. Best experience I've had with a SaaS tool.", channel: "NPS Survey", sentiment: "POS", score: 0.9, themes: ["Customer Support"], featureArea: "Support response time", label: "Elmsworth Inc", status: "REVIEWED", daysAgo: 3 },
  { content: "Pricing jumped 40% at renewal with zero warning. Considering switching to a competitor.", channel: "Sales Call Note", sentiment: "NEG", score: -0.8, themes: ["Pricing"], featureArea: "Renewal pricing", label: "Grovepoint Media", status: "NEW", daysAgo: 1 },
  { content: "Really like the new filters in the inbox, but the date picker is fiddly on smaller screens.", channel: "Community Post", sentiment: "NEU", score: 0.1, themes: ["UI / UX Design", "Mobile Experience"], featureArea: "Filters", label: "Halcyon Labs", status: "NEW", daysAgo: 2 },
  { content: "Can we get a Slack integration? We check feedback through Slack alerts on everything else.", channel: "NPS Survey", sentiment: "NEU", score: 0.0, themes: ["Integrations & SSO", "Feature Requests"], featureArea: "Slack integration", label: "Northwind Freight", status: "REVIEWED", daysAgo: 9 },
  { content: "App crashed twice today while uploading a CSV. Lost my progress both times.", channel: "Support Ticket", sentiment: "NEG", score: -0.75, themes: ["Performance & Speed"], featureArea: "CSV import", label: "Bramwell & Co", status: "NEW", daysAgo: 0 },
  { content: "The onboarding checklist is clear now — much better than the version from two months ago.", channel: "App Store Review", sentiment: "POS", score: 0.6, themes: ["Onboarding"], featureArea: "Onboarding checklist", label: "Fenwick Group", status: "ACTIONED", daysAgo: 12 },
  { content: "Reports are great but I can't schedule them to email leadership automatically.", channel: "Community Post", sentiment: "NEU", score: -0.2, themes: ["Reporting & Exports", "Feature Requests"], featureArea: "Scheduled reports", label: "Cobalt Retail", status: "NEW", daysAgo: 3 },
  { content: "Whoever designed the new theme clustering view deserves a raise. Exactly what we needed.", channel: "NPS Survey", sentiment: "POS", score: 0.85, themes: ["UI / UX Design"], featureArea: "Theme clustering", label: "Elmsworth Inc", status: "REVIEWED", daysAgo: 5 },
  { content: "Invoice math is wrong again this month — we were charged for seats we removed in March.", channel: "Support Ticket", sentiment: "NEG", score: -0.7, themes: ["Billing & Invoicing"], featureArea: "Seat billing", label: "Grovepoint Media", status: "ACTIONED", daysAgo: 15 },
  { content: "Mobile app logs me out every single day. Extremely annoying when I just want a quick check.", channel: "App Store Review", sentiment: "NEG", score: -0.65, themes: ["Mobile Experience", "Performance & Speed"], featureArea: "Session persistence", label: "Marden Studio", status: "NEW", daysAgo: 1 },
  { content: "Trial was smooth, sales call was helpful, decided to upgrade to the team plan today.", channel: "Sales Call Note", sentiment: "POS", score: 0.5, themes: ["Onboarding", "Pricing"], featureArea: "Trial conversion", label: "Northwind Freight", status: "REVIEWED", daysAgo: 4 },
  { content: "Would pay more for a proper audit log. Compliance keeps asking and we don't have one.", channel: "NPS Survey", sentiment: "NEU", score: 0.1, themes: ["Feature Requests"], featureArea: "Audit log", label: "Fenwick Group", status: "NEW", daysAgo: 2 },
  { content: "Search in the inbox doesn't handle typos at all. Searched 'onboarding' misspelled and got nothing.", channel: "Support Ticket", sentiment: "NEG", score: -0.4, themes: ["UI / UX Design"], featureArea: "Search", label: "Bramwell & Co", status: "NEW", daysAgo: 0 },
  { content: "Sentiment scores on the dashboard don't match what I'm reading in the raw tickets. Feels off.", channel: "Community Post", sentiment: "NEG", score: -0.3, themes: ["Reporting & Exports"], featureArea: "Sentiment accuracy", label: "Halcyon Labs", status: "REVIEWED", daysAgo: 7 },
  { content: "Just want to say the new empty states are a nice touch. Small thing but it shows care.", channel: "App Store Review", sentiment: "POS", score: 0.6, themes: ["UI / UX Design"], featureArea: "Empty states", label: "Cobalt Retail", status: "ACTIONED", daysAgo: 11 },
  { content: "SSO setup instructions are outdated, referenced a settings page that no longer exists.", channel: "Support Ticket", sentiment: "NEG", score: -0.55, themes: ["Integrations & SSO"], featureArea: "SSO docs", label: "Elmsworth Inc", status: "NEW", daysAgo: 1 },
  { content: "Loving how fast the app feels since the last update. Page loads are noticeably snappier.", channel: "NPS Survey", sentiment: "POS", score: 0.75, themes: ["Performance & Speed"], featureArea: "App performance", label: "Grovepoint Media", status: "REVIEWED", daysAgo: 6 },
  { content: "We need role-based permissions finer than admin/viewer — want a billing-only role.", channel: "Sales Call Note", sentiment: "NEU", score: 0.0, themes: ["Feature Requests"], featureArea: "Custom roles", label: "Marden Studio", status: "NEW", daysAgo: 3 },
  { content: "Every time I export a PDF report the formatting breaks on page two. Same issue for a month now.", channel: "Support Ticket", sentiment: "NEG", score: -0.6, themes: ["Reporting & Exports"], featureArea: "PDF export", label: "Northwind Freight", status: "NEW", daysAgo: 0 },
  { content: "Great onboarding call, rep actually understood our use case instead of reading a script.", channel: "Sales Call Note", sentiment: "POS", score: 0.7, themes: ["Onboarding", "Customer Support"], featureArea: "Sales onboarding", label: "Fenwick Group", status: "REVIEWED", daysAgo: 9 },
  { content: "Renewed for another year, pricing felt fair for what we use. Support has been solid too.", channel: "NPS Survey", sentiment: "POS", score: 0.65, themes: ["Pricing", "Customer Support"], featureArea: "Renewal", label: "Bramwell & Co", status: "ACTIONED", daysAgo: 18 },
  { content: "The app store review reply from your team was condescending. Please train support on tone.", channel: "App Store Review", sentiment: "NEG", score: -0.5, themes: ["Customer Support"], featureArea: "Support tone", label: "Halcyon Labs", status: "NEW", daysAgo: 2 },
  { content: "Dark mode please. Half the team works late and the bright dashboard is rough at night.", channel: "Community Post", sentiment: "NEU", score: 0.05, themes: ["Feature Requests", "UI / UX Design"], featureArea: "Dark mode", label: "Cobalt Retail", status: "NEW", daysAgo: 4 },
  { content: "Billing support finally resolved the seat count issue after three emails. Should not take that long.", channel: "Support Ticket", sentiment: "NEU", score: -0.25, themes: ["Billing & Invoicing", "Customer Support"], featureArea: "Billing support", label: "Elmsworth Inc", status: "REVIEWED", daysAgo: 5 },
  { content: "Mobile app is actually great now — the redesign fixed everything I complained about last year.", channel: "App Store Review", sentiment: "POS", score: 0.85, themes: ["Mobile Experience"], featureArea: "Mobile redesign", label: "Grovepoint Media", status: "ACTIONED", daysAgo: 20 },
  { content: "Asked about SSO again on today's call. This is now a blocker for signing the enterprise deal.", channel: "Sales Call Note", sentiment: "NEG", score: -0.6, themes: ["Integrations & SSO"], featureArea: "SSO", label: "Marden Studio", status: "NEW", daysAgo: 0 },
  { content: "The trends view showing spikes week over week is genuinely useful for our planning meetings.", channel: "NPS Survey", sentiment: "POS", score: 0.7, themes: ["Reporting & Exports"], featureArea: "Trends view", label: "Northwind Freight", status: "REVIEWED", daysAgo: 6 },
  { content: "Import failed silently on a 2,000 row CSV with no error message. Had to guess what went wrong.", channel: "Support Ticket", sentiment: "NEG", score: -0.65, themes: ["Performance & Speed"], featureArea: "CSV import", label: "Fenwick Group", status: "NEW", daysAgo: 1 },
  { content: "Pricing page is confusing — unclear what counts as a seat versus a viewer.", channel: "Community Post", sentiment: "NEU", score: -0.15, themes: ["Pricing", "UI / UX Design"], featureArea: "Pricing page", label: "Bramwell & Co", status: "NEW", daysAgo: 3 },
  { content: "The invoice PDF finally looks professional enough to forward straight to our finance team.", channel: "App Store Review", sentiment: "POS", score: 0.55, themes: ["Billing & Invoicing"], featureArea: "Invoice design", label: "Halcyon Labs", status: "REVIEWED", daysAgo: 7 },
  { content: "Would like a native integration with our helpdesk instead of manual CSV exports every week.", channel: "Sales Call Note", sentiment: "NEU", score: 0.0, themes: ["Integrations & SSO", "Feature Requests"], featureArea: "Helpdesk integration", label: "Cobalt Retail", status: "NEW", daysAgo: 2 },
  { content: "App froze during onboarding step three, had to refresh and start over. Frustrating first impression.", channel: "Support Ticket", sentiment: "NEG", score: -0.6, themes: ["Onboarding", "Performance & Speed"], featureArea: "Onboarding flow", label: "Elmsworth Inc", status: "NEW", daysAgo: 0 },
  { content: "Support team walked me through the SSO setup live on a call. Above and beyond.", channel: "NPS Survey", sentiment: "POS", score: 0.9, themes: ["Customer Support", "Integrations & SSO"], featureArea: "SSO support", label: "Grovepoint Media", status: "ACTIONED", daysAgo: 14 },
  { content: "Mobile notifications don't match what's actually new in the inbox. Confusing now.", channel: "App Store Review", sentiment: "NEG", score: -0.45, themes: ["Mobile Experience"], featureArea: "Notifications", label: "Marden Studio", status: "NEW", daysAgo: 1 },
] as const;

// Deterministic pseudo-embedding so Ask LOOP's retrieval works out of the box
// against seed data without spending API credits at seed time. Real
// ingestion (app/api/feedback/route.ts) calls the actual Voyage AI embeddings
// endpoint via lib/ai.ts::embedText — this is ONLY for fast, free seeding.
function pseudoEmbedding(text: string, dims = 256): number[] {
  const vec = new Array(dims).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  for (const w of words) {
    let hash = 0;
    for (let i = 0; i < w.length; i++) hash = (hash * 31 + w.charCodeAt(i)) >>> 0;
    vec[hash % dims] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

async function main() {
  console.log("Seeding LOOP demo workspace…");

  const workspace = await prisma.workspace.create({
    data: { name: "Northwind Analytics" },
  });

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const [admin, analyst, viewer] = await Promise.all([
    prisma.user.create({
      data: { name: "Priya Shah", email: "admin@northwind.demo", passwordHash, role: Role.ADMIN, workspaceId: workspace.id },
    }),
    prisma.user.create({
      data: { name: "Sam Ortiz", email: "analyst@northwind.demo", passwordHash, role: Role.ANALYST, workspaceId: workspace.id },
    }),
    prisma.user.create({
      data: { name: "Jordan Lee", email: "viewer@northwind.demo", passwordHash, role: Role.VIEWER, workspaceId: workspace.id },
    }),
  ]);

  const themeRecords = await Promise.all(
    THEME_LIST.map((t) =>
      prisma.theme.create({ data: { name: t.name, color: t.color, workspaceId: workspace.id } })
    )
  );
  const themeByName = new Map(themeRecords.map((t) => [t.name, t]));

  for (const item of SEED_FEEDBACK) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - item.daysAgo);

    const feedback = await prisma.feedback.create({
      data: {
        content: item.content,
        channel: item.channel,
        customerLabel: item.label,
        sentiment: item.sentiment as any,
        sentimentScore: item.score,
        featureArea: item.featureArea,
        rationale: "Seeded demo classification.",
        status: item.status as any,
        createdAt,
        workspaceId: workspace.id,
      },
    });

    await prisma.feedbackTheme.createMany({
      data: item.themes.map((themeName) => ({
        feedbackId: feedback.id,
        themeId: themeByName.get(themeName)!.id,
        confidence: 0.9,
      })),
    });

    await prisma.embedding.create({
      data: { feedbackId: feedback.id, vector: pseudoEmbedding(item.content) },
    });
  }

  console.log("Seed complete.");
  console.log("");
  console.log("Demo login credentials (workspace: Northwind Analytics)");
  console.log("  Admin:   admin@northwind.demo   / Password123!");
  console.log("  Analyst: analyst@northwind.demo / Password123!");
  console.log("  Viewer:  viewer@northwind.demo  / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
