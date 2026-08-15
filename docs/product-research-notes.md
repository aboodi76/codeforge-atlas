# Product Research Notes

## Evidence gathered

The product should focus on increasing confidence in work on large, unfamiliar repositories rather than claiming that a generic code assistant always accelerates implementation. A randomized controlled trial by METR involving experienced maintainers working on their own large open-source repositories found that the early-2025 AI tools tested made the assigned issues take 19% longer on average, despite participants expecting an acceleration. This supports designing CodeForge Atlas around verifiable context, impact evidence, and human review instead of unattended code generation.[^metr]

An empirical study published in the *Journal of Systems and Software* reports that surveyed developers spent an average of 23% of their time on work made necessary by technical debt, with additional testing the most common added activity. This supports a workflow that maps risk, affected modules, and missing tests before a change is merged.[^tech-debt]

[^metr]: METR, [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/).
[^tech-debt]: Besker, Martini, and Bosch, [Software developer productivity loss due to technical debt](https://www.sciencedirect.com/science/article/abs/pii/S0164121219301335), *Journal of Systems and Software* (2019).
