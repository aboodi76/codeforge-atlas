# Contributing to CodeForge Atlas

Thank you for considering a contribution. Atlas prioritizes **evidence-aware engineering**, privacy-conscious defaults, and reviewable changes.

## Before opening a pull request

Create a focused branch, explain the user problem in the pull request, and keep changes scoped. Do not include credentials, private source code, or real user data in issues, tests, screenshots, or fixtures.

Run the full local verification suite:

```bash
pnpm check
pnpm test
pnpm build
```

## Engineering expectations

| Area | Contribution standard |
|---|---|
| **Security** | Validate inputs, retain ownership checks, and never weaken redaction safeguards. |
| **AI behavior** | Distinguish evidence from assumptions; do not claim execution or unseen repository access. |
| **Data access** | Keep Atlas sessions scoped to the authenticated user. |
| **User interface** | Preserve keyboard access, clear loading/error states, and responsive behavior. |
| **Testing** | Add or update Vitest coverage for behavior changes, including failure paths. |

## Commit and review guidance

Use descriptive commit messages. Reviewers may request changes for safety, privacy, accessibility, maintainability, product scope, or documentation. By contributing, you agree that your contribution is provided under the repository license.

## Reporting concerns

Report security issues privately according to [SECURITY.md](SECURITY.md). For conduct concerns, contact the project maintainers privately rather than opening a public issue.
