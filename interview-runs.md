# Interview runs

Recorded runs for the tests that need real Claude Code sessions (rule 05 section 5.5). Local folder; it becomes the `ite-validation` repo in F-6.4.

## 2026-10-15, batch 1

Setup: Claude Code 2.1.293, default model, Windows 11. Each user turn is one `claude -p` call resuming the same session, run in a fresh temp folder. Isolation: `--setting-sources project,local --plugin-dir <ITE plugin> --strict-mcp-config`, so no user CLAUDE.md and no other plugins load. Transcripts: `runs/2026-10-15/`. Compiled folders: `runs/2026-10-15/folders/`. Cost: about 21 USD over 50 calls (R0 included), plus 5.87 USD for batch 2.

| Run | What | Turns |
|---|---|---|
| R0 | probe without isolation (user CLAUDE.md and all plugins loaded); discarded for language tests | 1 |
| R1 | `--quick` PT log-to-Jira, "ok" to every turn incl. stop offer and approval, then `/ite:compile`, `/ite:build` | 10 |
| R2 | full PT holiday-request app, "chega" after 7 turns, approve, `/ite:compile` | 10 |
| R3 | `--quick` PT n8n Typeform-to-Sheets, "não" to the stop offer, then `/ite:build` in a new session | 9 |
| R4 | PT Telegram reminder bot, 7 turns, then `/ite:start` in a new session | 8 |
| R5 | EN CSV invoices idea (R5a before the start.md fix, R5b after fix 1, R5 after fix 2) | 4 |
| R6 | EN Slack HR bot | 4 |
| R7 | PT stock sheet with node removed from PATH | 2 |

## Results

| Test | Result | Evidence |
|---|---|---|
| T-002 | pass | R1: coverage.json valid S-001, 12 areas in rule 01 order; goal inferred (R1 turn 1). |
| T-003 | pass after fix (batch 2) | 20 turns (first 4 of R1, R3, R4, R5, R6): 20/20 have one question mark, `Recommended:` and a one-sentence `Why:`; 7/20 join two asks with "and/e" (R1-4, R3-4, R4-2, R5-2, R5-4, R6-2, R6-4), which rule 01 1.3 counts as two. Score 13/20 < 19/20. Batch 2 (after the D-020 fix, same five ideas, files B2-*.md): 20/20 one question mark, 20/20 format, 19/20 by the automatic compound check (the one flag, "Quem vai ver e tratar estes tickets", asks one thing), so 20/20 by hand. |
| T-004 | pass | R1, R2: every question and recommendation in Portuguese; compiled folders English; check reports no W-NON-ENGLISH. |
| T-005 | pass after fix | R5a: stack clear, but inputs summary empty. Fix in commands/start.md (keep partial facts as open summaries; apply area hints). R5b regressed stack to open; second wording fix; R5: stack clear (Python), inputs summary mentions CSV, no question about stated facts. One sample after the fix. |
| T-006 | pass | R2: "chega" with 5 open areas; all 5 assumed with one D- and one T- each, listed in Portuguese. |
| T-008 | pass | R4: new session summarises decided areas, asks the first open area (stack), repeats no answered question, adds no duplicate turn. |
| T-009 | pass | R1: every rule 02 2.1 path exists; INDEX.md written last (mtime) and lists every file. |
| T-010 | pass | R2: llm not applicable; prompts/ holds only NOT_APPLICABLE.md (Area, Reason, Decided in); promptfoo `tests: []`; 0 errors. |
| T-019 | pass | R1: gate passes, both commands with the absolute path, nothing built. R3: blocked folder lists 15 numbered blockers with fix commands, no build command. |
| T-023 | pass | R1 (7 tests), R2 (5 tests): one line each in Portuguese, approve-or-edit question, approved_at null until "ok". |
| T-025 | pass | R7: warning with https://nodejs.org in Portuguese; coverage.json `mode: manual`, valid S-001. Continued without Node ("chega", approve, `/ite:compile`): banner `MANUAL MODE - not machine-verified` on the outcome screen first line and in INDEX.md; check-report.json has W-MANUAL-MODE. The real checker run later on a copy: 0 errors, 1 warning (W-MANUAL-MODE). |
| T-036 | pass | R1: 5 questions then stop offer; history 5 question turns + 1 stop_offer; 7 areas assumed with D-/T-; stop_reason user_stopped. R3: "não" → budget off (null) and the 6th question logs. |
| T-037 | pass after fix | R1 (quick, 7 assumed): 17 text lines, 23 with blank lines; compile.md now counts blank lines. R2 (after fix): about 19 lines incl. blanks, one line per assumed area with D-/T-, ends with build command and counts line. |

## Defects found

1. start.md did not record facts the idea gives for areas it does not settle (T-005). Fixed.
2. Outcome screen line count ignored blank lines (T-037). Fixed in compile.md.
3. The stop offer's answer was not stored. Fixed in plugin commit 5d78bc2: `assume-rest` and `budget off` take `--answer`; start.md passes it. Unit-tested; not yet seen in a recorded run.
4. Turn header counter was estimated (R3 showed 1/12 with 2 areas settled, then 2/12 twice). Fixed in 5d78bc2: start.md reads the count from coverage.json. Static test only; not yet seen in a recorded run.
5. Compound questions joined with "and" (T-003, D-020). Fixed: P-001 rules 1 and 10, skill examples and question bank; guard test added.
