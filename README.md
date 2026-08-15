# CodeForge Atlas

[![Verify](https://github.com/aboodi76/codeforge-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/aboodi76/codeforge-atlas/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-8be9d0.svg)](LICENSE)
[![Status: Public beta](https://img.shields.io/badge/status-public%20beta-151625.svg)](https://github.com/aboodi76/codeforge-atlas/releases)

> **Change intelligence for codebases that matter.**

CodeForge Atlas is a private-by-default AI workspace that helps engineers understand a proposed code change before implementation. It turns a supplied source file and change intent into a constrained engineering readout: **direct evidence**, **explicit assumptions**, a lightweight **system map**, change-impact risks, review findings, generated documentation, test guidance, and contextual follow-up questions.

## Why Atlas

Most developer tools begin after an engineer has decided what to change. Atlas is designed for the step before that decision: understanding what the supplied code can support, what remains uncertain, and what should be verified. It does not run submitted code, inspect unseen repositories, or present generated suggestions as production facts.

| Capability | What it delivers |
|---|---|
| **Atlas preflight** | A structured analysis for a focused source file and stated change intent. |
| **Evidence vs. assumptions** | Separate sections for supported findings and inferences that still require validation. |
| **Impact report** | Risk-ranked areas, reasons for concern, and concrete verification steps. |
| **System map** | Nodes and relationships limited to entities visible in the supplied source. |
| **Engineering outputs** | Review findings, docstring and README drafts, and unit-test guidance. |
| **Session memory** | Private per-user sessions, reports, and contextual conversation history. |

## Product boundaries

Atlas is an engineering aid, not an autonomous deployment system. Treat every generated recommendation as review input. Do not submit secrets, private credentials, regulated data, or source code you are not authorized to share.

## Stack

The application uses React, TypeScript, Tailwind CSS, Express, tRPC, Drizzle ORM, session authentication, and an LLM integration with strict JSON-schema output for Atlas reports.

## Local development

```bash
pnpm install
pnpm dev
```

Run verification before opening a pull request:

```bash
pnpm check
pnpm test
pnpm build
```

The database schema is defined in `drizzle/schema.ts`. Generate migrations with `pnpm drizzle-kit generate`; inspect every generated migration before applying it to a shared environment.

## Repository map

| Path | Purpose |
|---|---|
| `client/src/pages/` | Landing page, workspace, session history, and profile views. |
| `server/routers/atlas.ts` | Authenticated tRPC contract for Atlas sessions, analysis, and chat. |
| `server/atlas.ts` | Input redaction, report schema, analysis prompt, and output validation. |
| `server/atlas*.test.ts` | Unit tests for report safety and protected session procedures. |
| `drizzle/` | Data schema and generated database migrations. |
| `docs/` | Architecture and legal-readiness drafts. |

## Responsible contribution

Please read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md) before participating. The documents in `docs/legal/` are **drafts for review**, not legal advice and not a substitute for counsel in the launch jurisdiction.

## License

Copyright 2026 CodeForge Atlas contributors. Licensed under the [MIT License](LICENSE).

## Status

This repository is a public beta. User-facing legal policies and production data handling still require qualified legal review before commercial launch.
