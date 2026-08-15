# CodeForge Atlas: Know the blast radius before you change code

Every senior developer has a war story: a "small refactor" in one module that quietly broke checkout, payments, or a cron job three layers deep in the dependency graph. You change one file. The impact hits five.

I built **CodeForge Atlas** because I wanted a tool that answers one question *before* I start typing: **what will this change touch, and how do I verify it's safe?**

## What Atlas actually does

Atlas is an open-source (MIT) AI workspace for code intelligence. You paste a file or upload source code, tell it what you're trying to change, and it returns a structured report that separates **direct evidence** from **assumptions**, maps the **affected modules**, and proposes a concrete **verification path** — the tests and checks to run before you merge.

### The four pillars

| Feature | What you get |
|---|---|
| **Change preflight** | A report distinguishing evidence vs. assumptions, with impacted modules and a pre-merge verification checklist |
| **System mapping** | A visual map connecting files, modules, and business rules — onboarding to an unfamiliar repo in minutes |
| **Auto docs & tests** | Documentation (docstrings, README) and unit tests generated directly from your code |
| **Engineering memory** | Every report, question, and verification path stays attached to the source context — searchable, private, forever |

### Privacy is a first-class feature

Atlas is **private by default**. Every session belongs to you. Nothing you analyze is shared, indexed, or made public. That's non-negotiable when you're analyzing production code.

## The stack

Atlas is built with **React 19 + Tailwind 4**, **Express + tRPC** for type-safe end-to-end APIs, and **Drizzle ORM + MySQL** for the data layer. The source is fully open under the MIT license, so you can self-host it, extend it, or audit it.

- Live demo: https://codeforgeai-kcyxffy4.manus.space
- Source: https://github.com/aboodi76/codeforge-atlas

## Who it's for

- **Solo devs and small teams** joining unfamiliar repos — understand before you change.
- **Maintainers** reviewing PRs who want structured impact analysis instead of gut feeling.
- **Anyone** who has ever said "it worked on my machine" and meant "I didn't know what else it touched."

## Roadmap

- Multi-file repository analysis (beyond single-file sessions)
- Git integration for pre-commit change preflights
- Exportable impact reports (Markdown, PDF)
- Language expansion beyond TypeScript/JavaScript

## Get involved

Stars, issues, and PRs are all welcome. If you hit a bug, open an issue — launch-week feedback gets priority fixes.

- **Repo**: https://github.com/aboodi76/codeforge-atlas
- **Demo**: https://codeforgeai-kcyxffy4.manus.space

Happy to answer questions in the comments.
