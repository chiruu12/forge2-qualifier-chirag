---
name: status-report
description: Post a What I Did / What's Left / What Needs Your Call update to Slack.
---

# status-report

Hermes fires this skill whenever a human asks for a status update, at the end of a planning cycle, or during the autonomous cron heartbeat.

## Trigger phrases

- "status update"
- "what's the status"
- "give me a status report"
- cron prompt in `hermes-config.yaml` (autonomous run)

## Procedure

1. Gather: tasks completed since last update, tasks remaining, decisions blocked on the human.
2. Reply in **exactly three sections**, in this order — no extra preamble:
   - **What I Did**
   - **What's Left**
   - **What Needs Your Call**
3. Keep each section to short bullet points (2–5 bullets).
4. Post to the current Slack channel (`#sprint_main` for human-facing, `#agent_log` for cron).

## Example output (verified in agent-log.md)

**What I Did**
- OpenClaw wrote and ran `examples/fizzbuzz.py` in `#agent_coder` (`liquid/lfm2.5-1.2b`).
- Laravel API seeded and reachable at `http://localhost:7900/api/boards`.
- Frontend wired to ngrok tunnel for live demo.

**What's Left**
- Redeploy Vercel with updated `VITE_API_URL` after ngrok restart.
- Capture final screenshot set for submission.

**What Needs Your Call**
- Approve moving "Wire frontend to API" card to Done after you verify the live URL.

## Human-in-the-loop gate

If **What Needs Your Call** is non-empty, Hermes **must not** proceed on that decision until the human replies in `#sprint_main`. This is the explicit approval checkpoint.

## Config reference

- Skill path: `skills/status-report/SKILL.md`
- Hermes loads skills from `./skills` (see `hermes-config.yaml`)
- Cron uses the same three-section format for autonomous posts to `#agent_log`
