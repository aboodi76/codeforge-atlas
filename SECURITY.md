# Security Policy

## Supported status

CodeForge Atlas is currently pre-release. Security fixes are applied to the active development branch before any public release.

## Reporting a vulnerability

Please **do not** open a public issue for a suspected vulnerability. Send a private report to the repository owner containing a clear description, affected files or flow, reproduction steps, likely impact, and any suggested mitigation. Do not include secrets or production data.

Maintainers will acknowledge a complete report, assess reproducibility and impact, coordinate a fix, and publish a minimal disclosure after remediation when appropriate.

## Security design priorities

Atlas enforces user-scoped session access, validates model output against a strict report schema, clips large inputs, and redacts common credential-like patterns before analysis prompts are constructed. These controls reduce risk but are not a guarantee that arbitrary submitted source contains no sensitive information. Users remain responsible for what they submit.
