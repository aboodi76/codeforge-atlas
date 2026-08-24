# CodeForge Atlas Development Governance

CodeForge Atlas is maintained as a **public-beta open-source project**. “Official” here means that the repository has a visible maintainer, documented engineering standards, a released version, and a defined path for making changes. It does not imply external accreditation, legal certification, or a guarantee of reliability.

## Current release posture

| Area | Current rule |
|---|---|
| Public source | The canonical public repository is [`aboodi76/codeforge-atlas`](https://github.com/aboodi76/codeforge-atlas). |
| License | Contributions are distributed under the MIT License. |
| Stable reference point | `v0.1.0` is the public-beta release baseline. |
| Default branch | `main` is the integration branch and must remain deployable. |
| Automated verification | The `Verify` workflow runs for repository changes. |
| Maintainer attribution | Public documentation identifies **aboodi12** as the current maintainer. |

## Change policy

Every change must correspond to a concrete improvement: a validated defect fix, security correction, test improvement, documented accessibility or performance gain, user-reported need, or an approved product enhancement. Cosmetic churn, unsupported adoption claims, hidden credentials, and changes that weaken privacy or ownership protections are not accepted.

| Change type | Minimum evidence before merge |
|---|---|
| Documentation-only | Accurate scope, working links, and no unsupported claims. |
| UI or behavior change | Clear user problem, responsive and accessible review, and updated tests where behavior changes. |
| Server, auth, or data change | Input validation, user-ownership review, explicit migration assessment, and failure-path test coverage. |
| AI-output change | Preserves the distinction between evidence and assumptions; includes safety and output-shape validation. |
| Dependency or security update | Source and risk documented; verification suite and build pass. |

## Required verification

Before a pull request is merged, run the repository checks below and resolve failures rather than bypassing them.

```bash
pnpm check
pnpm test
pnpm build
```

Each pull request should explain the user problem, the implementation decision, the verification performed, and any residual risk. Contributors must follow [CONTRIBUTING.md](../CONTRIBUTING.md), the repository’s security guidance, and the pull-request template.

## Release discipline

Releases should be versioned and accompanied by release notes that distinguish new capabilities, fixes, known limitations, and migration steps. A release must not claim user numbers, security certification, benchmark performance, ecosystem adoption, or revenue unless those statements are demonstrably true and appropriately sourced.

## Branch-protection controls

The `main` branch requires pull-request-based changes and a passing `quality` check from the `Verify` workflow. Protection is enforced for administrators, linear history is required, unresolved conversations block merging, and force pushes and branch deletions are blocked. A zero-review threshold is intentional for the current single-maintainer public beta; the required pull-request path and automated check still provide a reviewable, test-gated record. The maintainer should keep an emergency recovery path and re-check the workflow after policy changes.[1]

## Maintenance priorities

Prioritize work in this order: security and privacy; correctness and test reliability; user-reported defects; documentation; accessibility and performance; then new product capabilities. Work is tracked in issues or documented project tasks so that development remains reviewable rather than arbitrary.

## References

[1] [GitHub Docs — Managing a branch protection rule](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule) — pull-request requirements, required checks, force-push and deletion controls.
