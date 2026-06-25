# Evidence screenshots

Seven PNGs for the submission (committed here **and** mirrored in the Google Drive evidence folder):

| File | Status | Captures |
|------|--------|----------|
| `slack-loop.png` | ✅ in repo | `#agent_coder` — FizzBuzz run via exec (MLX model visible) |
| `kanban-backend.png` | ⚠️ add from Drive | `#agent_coder` — Laravel models + `routes/api.php` handoff |
| `kanban-frontend.png` | ⚠️ add from Drive | `#agent_coder` — React Kanban UI handoff |
| `hermes-memory-save.png` | ✅ in repo | Session A — Hermes stores repo/model facts |
| `hermes-memory-recall.png` | ✅ in repo | Session B — Hermes recalls after restart |
| `hermes-skill.png` | ✅ in repo | `#sprint_main` — status-report three-section output |
| `hermes-cron.png` | ✅ in repo | `#agent_log` — timestamped autonomous cron post |

Referenced from [`agent-log.md`](../agent-log.md). **Slack prompts:** [`SLACK_EVIDENCE.md`](SLACK_EVIDENCE.md).

**If screenshots live in Drive only:** copy `kanban-backend.png` and `kanban-frontend.png` into this folder, then `git add docs/*.png && git push` so judges see them in-repo.

**Capture tips:**
- Include model name (`lfm2.5-1.2b-thinking-mlx` / `liquid/lfm2.5-1.2b`) in LM Studio UI.
- For cron, show timestamp with no `@mention` or human prompt above the post.
- OpenClaw needs LM Studio context **32768** and tools `minimal` + `group:fs` + `group:runtime` (see `openclaw.json`).
