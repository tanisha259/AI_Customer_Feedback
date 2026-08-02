# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Custom 404 (`not-found.tsx`) and global error boundary (`error.tsx`).
- Global loading skeleton (`loading.tsx`) for route transitions.
- `robots.ts` and `sitemap.ts` for SEO crawlability.
- Viewport theme-color metadata in root layout.
- `lint:fix` and `format` scripts to `package.json`.
- Minimum Node.js engine requirement (`>=18.17.0`).
- Security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`) via `next.config.mjs`.
- Text-selection highlight styles in `globals.css`.
- JSDoc comments on `ThemeProvider` component.
- Explanatory comment for Prisma singleton pattern in `lib/db.ts`.

## [1.0.0] - 2024-01-01

### Added
- Initial project structure with Next.js App Router.
- Multi-tenant architecture with workspace-scoped data isolation.
- Role-based access control (Admin, Analyst, Viewer) via `lib/rbac.ts`.
- AI-powered feedback classification using Google Gemini API.
- Feedback ingestion with manual entry and bulk CSV upload.
- Theme clustering and trend analysis dashboard.
- Ask LOOP RAG-based Q&A chat interface.
- Voice of Customer (VoC) report generation.
- Authentication with NextAuth.js and Prisma adapter.
- Recharts-powered analytics dashboard.
- Dark/light mode with `next-themes`.
- Basic documentation and configuration files.
