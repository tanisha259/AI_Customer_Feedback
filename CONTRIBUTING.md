# Contributing to Project LOOP

Thank you for your interest in contributing! Here's everything you need to get started.

## Prerequisites

- **Node.js** `>=18.17.0` (see `.nvmrc`)
- **PostgreSQL** database (Neon or Supabase free tier recommended)
- A **Google Gemini API** key

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AI_Customer_Feedback.git
   cd AI_Customer_Feedback
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the environment template and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
5. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Branch Naming

| Type    | Pattern                   | Example                        |
| ------- | ------------------------- | ------------------------------ |
| Feature | `feat/<short-description>`| `feat/csv-export`              |
| Bug Fix | `fix/<short-description>` | `fix/auth-redirect-loop`       |
| Chore   | `chore/<short-description>`| `chore/update-dependencies`   |
| Docs    | `docs/<short-description>`| `docs/improve-readme`          |

## Code Style

- Run `npm run lint:fix` before committing to auto-fix ESLint issues.
- Run `npm run format` to apply Prettier formatting.
- All TypeScript files must have no `strict` mode errors.

## Submitting Pull Requests

- Keep PRs focused on a single concern.
- Write a clear description explaining **what** changed and **why**.
- Reference any related issues with `Closes #<issue-number>`.
- Update `CHANGELOG.md` under the `[Unreleased]` section.
- Update relevant documentation if the behavior changes.

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(scope): <short summary>

[optional body]
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `test`.

Thank you for contributing! 🎉
