# Results

| Idea | Version | started_at | Frozen tests passed (%) | ITE tests passed (%) | Manual corrections | Total time (min, incl. interview) | Tokens / cost | Interview questions | Tripwires fired |
|---|---|---|---|---|---|---|---|---|---|
| 1-email-triage | A |  |  |  |  |  |  |  |  |
| 1-email-triage | B |  |  |  |  |  |  |  |  |
| 2-invoice-pdfs | A |  |  |  |  |  |  |  |  |
| 2-invoice-pdfs | B |  |  |  |  |  |  |  |  |
| 3-student-market-research | A |  |  |  |  |  |  |  |  |
| 3-student-market-research | B |  |  |  |  |  |  |  |  |
| 4-web-app | A | 2026-10-16T10:28:57Z | 87.5 | 46.2 | 0 | 1.5 | 0.22 USD (list-price estimate) | 0 (no interview) | 0 |
| 4-web-app | B | 2026-10-16T10:26:59Z | 100 | 100 | 13 (all bare "continue", 0 content corrections) | 41.1 | 6.84 USD (list-price estimate: interview 2.21 + build 4.63) | 15 | 0 |
| 4-web-app | B-quick |  |  |  |  |  |  |  |  |
| 5-social-crosspost | A |  |  |  |  |  |  |  |  |
| 5-social-crosspost | B |  |  |  |  |  |  |  |  |

## Frozen tests

| Idea | Writer (Reddit username) | Message link | Message date | Commit hash | Push timestamp (from gh api activity) |
|---|---|---|---|---|---|
| 1-email-triage | not recorded (Reddit, post removed) | none (post removed) | 2026-10-15 or 2026-10-16 (reported by the maintainer) | 42603c1 | 2026-10-16T10:12:38Z (push 8c3c6e6..42603c1) |
| 2-invoice-pdfs | not recorded (Reddit, post removed) | none (post removed) | 2026-10-15 or 2026-10-16 (reported by the maintainer) | 42603c1 | 2026-10-16T10:12:38Z (push 8c3c6e6..42603c1) |
| 3-student-market-research | not recorded (Reddit, post removed) | none (post removed) | 2026-10-15 or 2026-10-16 (reported by the maintainer) | 42603c1 | 2026-10-16T10:12:38Z (push 8c3c6e6..42603c1) |
| 4-web-app | not recorded (Reddit, post removed) | none (post removed) | 2026-10-15 or 2026-10-16 (reported by the maintainer) | 42603c1 | 2026-10-16T10:12:38Z (push 8c3c6e6..42603c1) |
| 5-social-crosspost | not recorded (Reddit, post removed) | none (post removed) | 2026-10-15 or 2026-10-16 (reported by the maintainer) | 42603c1 | 2026-10-16T10:12:38Z (push 8c3c6e6..42603c1) |

## Pass bar

## Notes per idea

### 4-web-app
- Both versions were run on 2026-10-16 by Claude Code sessions playing the user, on the maintainer's order: one session played the user for A, another for B. Earlier attempts (A to A3, B to B2) are void and kept in runs/2026-10-16/ with the reason: arguments split by a shell, the user-level CLAUDE.md loading despite --setting-sources (fixed with claudeMdExcludes), and the A build agent running taskkill on every node.exe, which killed the Node drivers (fixed with a PowerShell driver).
- Isolation for A4 and B3: Claude Code 2.1.293, default model, --setting-sources project,local, --strict-mcp-config, user CLAUDE.md excluded, --permission-mode auto for both builds; the B interview ran with the ITE plugin and a tool allowlist.
- A4 built a guestbook in one turn; the user started it, added an entry, saw it listed and stopped (seems to work). The session playing A's user had read FROZEN-TESTS.md before the run; it sent no corrections.
- B3: interview 10:26:59 to about 10:38:40, build session 10:38:45 to 11:08:05Z. The generated CLAUDE.md asks for one task per turn, so the build needed 13 "continue" messages; they count as manual corrections under step 3, and none changed the outcome. 13 of 15 build tasks done; the 2 left need the owner. A driver bug kept sending "continue" after the build ended (turns 15 to 244); those turns are excluded from time and cost and labelled in the transcript.
- Frozen tests were scored by the session that played A's user, not by the writer, who is not reachable (post removed). Details: 4-web-app/SCORES.md.
- Better with B: every frozen check, the database-error message, local-only access, no silent truncation. Worse: 41 min against 1.5 min, about 31 times the list-price cost, and 13 "continue" prompts. Surprise: A passed 7 of 8 frozen checks with no interview.
