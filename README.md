<div align="center">
  <h1>🚀 Project LOOP</h1>
  <h3>AI Customer Feedback Intelligence Platform</h3>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Claude_AI-FF6B6B?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude AI" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

<br/>

## 📖 About The Project

**The Business Problem:**
Modern businesses struggle to extract actionable insights from the overwhelming volume of customer feedback they receive across various channels. Manual analysis is time-consuming, prone to human error, and fails to identify emerging trends quickly enough for product teams to act upon.

**The Solution:**
**Project LOOP** is a cutting-edge AI Customer Feedback Intelligence Platform designed to automate the ingestion, categorization, and analysis of customer feedback. By leveraging Anthropic's Claude AI, LOOP transforms raw feedback into structured data, actionable insights, and comprehensive Voice of Customer (VoC) reports, enabling data-driven decision-making at scale.

---

## 🌐 Live Demo

🔗 **[View Live Application Here](http://ai-customer-feedback-three.vercel.app/)**

---

## 🎥 Demo GIF

> *(Placeholder for a GIF showcasing the core application workflow)*
>
> ![Demo](https://drive.google.com/file/d/1glowH2rnTVyMrOSBgVPEwF1JkUr7IZqg/view?usp=drivesdk) 


---

## ✨ Key Features

- 🏢 **Multi-Tenant Architecture:** Securely isolate data across different organizations or client spaces.
- 🔐 **Role-Based Access Control:** Configurable permissions for Admin, Analyst, and Viewer roles.
- 📥 **Feedback Ingestion:** Support for manual entry and bulk CSV uploads of customer feedback.
- 🤖 **AI Auto-Classification:** Automated categorization of feedback sentiment, intent, and product areas using Claude AI.
- 📊 **Theme Clustering & Trend Analysis:** Identify recurring topics and track how customer sentiment evolves over time.
- 💬 **Ask LOOP (RAG-based Q&A):** Chat with your feedback data! Ask questions like "What are users saying about the new UI?" and get AI-generated answers based on real customer data.
- 📄 **Voice of Customer Reports:** Generate professional, ready-to-share summaries of customer insights.
- 📈 **Analytics Dashboard:** Visual representation of key metrics, sentiment distribution, and top feature requests.

---

## 🛠️ Tech Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | React, Next.js (App Router), Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Next.js API Routes, Node.js, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **AI / ML** | Anthropic Claude API (Classification & RAG) |
| **Authentication**| NextAuth.js / Clerk (Add your specific auth here) |
| **Deployment** | Vercel |

---

## 🏗️ System Architecture

```mermaid
graph LR
    subgraph Client
        Browser[Web Browser]
    end

    subgraph Vercel
        App[Next.js App Router]
        API[API Routes]
    end

    subgraph Database
        DB[(PostgreSQL)]
    end

    subgraph External
        Claude[Claude AI API]
    end

    Browser -->|HTTP/REST| App
    Browser -->|HTTP/REST| API
    App --> API
    API <-->|Prisma ORM| DB
    API <-->|Prompts & Data| Claude
```

---

## 🗄️ Database Schema Overview

The core data model revolves around the following entities:

- **Organization:** Represents a tenant within the system.
- **User:** Users belonging to an Organization, with specific Roles.
- **Feedback:** The core entity containing the raw text, source, and metadata.
- **Classification:** AI-generated metadata (sentiment, category, tags) linked to a Feedback entry.
- **Theme:** Clustered topics derived from multiple Feedback entries.

*(Consider adding an image of your Prisma Studio or ERD here)*

---

## 📂 Project Folder Structure

```text
├── prisma/               # Database schema and migrations
├── public/               # Static assets (images, icons)
├── src/
│   ├── app/              # Next.js App Router (Pages, Layouts, API Routes)
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility functions, Prisma client, AI service configs
│   ├── types/            # TypeScript type definitions
│   └── hooks/            # Custom React hooks
├── .env.example          # Example environment variables
├── package.json          # Project dependencies
└── tailwind.config.ts    # Tailwind CSS configuration
```

---

## 🚀 Installation & Local Setup

Follow these steps to run Project LOOP locally:

**1. Clone the repository**
```bash
git clone https://github.com/tanisha259/AI_Customer_Feedback.git
cd AI_Customer_Feedback
```

**2. Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

**3. Set up Environment Variables**
Copy the `.env.example` file to `.env` and fill in your credentials.
```bash
cp .env.example .env
```

**4. Initialize the Database**
Generate the Prisma client and push the schema to your PostgreSQL database.
```bash
npx prisma generate
npx prisma db push
```

**5. Run the development server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/loop_db"

# Authentication (e.g., NextAuth secret)
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AI Integration
ANTHROPIC_API_KEY="sk-ant-your-claude-api-key"

# Add any other required keys (e.g., AWS, Resend, etc.)
```

---

## 💻 Usage

1. **Sign Up / Log In:** Create an account to access the dashboard.
2. **Create Organization:** Set up a workspace for your team.
3. **Upload Data:** Navigate to the Feedback section and upload a CSV of existing customer reviews, or add them manually.
4. **AI Processing:** Wait a few moments as the system processes and classifies the data.
5. **Explore Insights:** Visit the Dashboard and Trends pages to see visual representations of the data.
6. **Ask LOOP:** Go to the AI Q&A tab and type a natural language question about your customers.

---

## 🔌 API Features Summary

The application exposes several RESTful API endpoints for integration:

- `POST /api/feedback/ingest` - Accepts new feedback entries.
- `POST /api/ai/classify` - Triggers the classification pipeline for unanalyzed feedback.
- `GET /api/reports/voc` - Generates and retrieves the latest VoC summary.
- `POST /api/ai/chat` - Endpoint for the RAG-based Ask LOOP feature.

---


## 🔮 Future Enhancements

- [ ] **Slack/Discord Integration:** Real-time alerts for highly negative feedback.
- [ ] **Jira/Linear Sync:** Automatically create tickets for identified bugs or highly requested features.
- [ ] **Multi-Language Support:** Auto-translate and classify feedback in languages other than English.
- [ ] **Public Roadmaps:** Generate public-facing feature roadmaps based on popular feedback.

---

## 🧠 Challenges Faced & Learning Outcomes

Building Project LOOP presented several technical challenges:

- **AI Latency:** Processing large batches of feedback through the LLM was slow. *Solution:* Implemented background job processing and batched API requests to respect rate limits and improve UX.
- **RAG Accuracy:** Initial Q&A responses lacked context. *Solution:* Refined the prompt engineering and optimized the vector embeddings/search strategy to ensure the AI only used factual feedback data.
- **Complex UI State:** Managing the state of filters, selected feedback, and active themes. *Solution:* Leveraged URL search params and context providers for a clean, shareable state management approach.

Through this project, I significantly deepened my understanding of **Next.js App Router**, **LLM Integration (Prompt Engineering & RAG)**, and designing **scalable database schemas** for multi-tenant SaaS applications.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 👨‍💻 Author

**Tanisha**

- GitHub: [@tanisha259](https://github.com/tanisha259)

---
*If you like this project, please give it a ⭐️!*
