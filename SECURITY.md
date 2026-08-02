# Security Policy

## Supported Versions

The following versions of Project LOOP currently receive security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes             |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, **please do not open a public GitHub issue**.

Instead, report it privately via GitHub's [Security Advisories](https://github.com/tanisha259/AI_Customer_Feedback/security/advisories/new) feature, or send an e-mail directly to the maintainer.

You can expect:
- **Acknowledgement** within 48 hours.
- **Status update** within 5 business days.
- **Credit** in the release notes if you'd like it.

## Security Best Practices for Deployment

- Never commit your `.env` file. Use `.env.example` as a template.
- Rotate `NEXTAUTH_SECRET` and `GEMINI_API_KEY` regularly.
- Ensure your PostgreSQL connection string uses `sslmode=require`.
- Keep all dependencies up to date (`npm audit` to check for known vulnerabilities).
