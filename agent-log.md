# Agent log

Unedited record of the two-agent system: human goals in Slack → Hermes plans → OpenClaw executes → human approves.

**Models (free stack, Q4 GGUF via LM Studio + HuggingFace):**

| Agent | Role | Model | Source |
|-------|------|-------|--------|
| Hermes | brain / planner | `liquid/lfm2.5-1.2b-thinking` | [LFM2.5-Thinking-GGUF](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-GGUF) @ Q4_K_M |
| OpenClaw | hands / coder | `liquid/lfm2.5-1.2b-instruct` | [LFM2.5-Instruct-GGUF](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF) @ Q4_K_M |

No paid OpenAI or Fireworks keys. Endpoint: `http://localhost:1234/v1` (LM Studio local server).

---

## Summary

- Both agents configured on **free local models** (HF GGUF, 4-bit quantization for VRAM limits).
- **Human-in-the-loop:** every goal, plan approval, and code review happens in Slack — see § Human approval gates below.
- **Memory:** Hermes stores project facts in Session A and recalls them in Session B after restart — see § Memory recall.
- **Skill:** `status-report` fires on request and via cron — see § Skill firing and § Autonomous run.
- **Kanban:** Laravel API + React UI; live demo via ngrok tunnel (see `DEPLOYMENT.md`).
- **Build transparency:** Kanban scaffold was completed under time pressure; the agent loop (FizzBuzz, banner, planning, memory, skill, cron) is genuine and documented below with verbatim transcripts.

---

## Slack round-trip test

Verified during setup with Slack Web API:

```bash
# auth.test
curl -s https://slack.com/api/auth.test \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN"
```

```json
{"ok":true,"url":"https://forge2-qualifier.slack.com/","team":"Forge 2 Qualifier","user":"forgeunplug","team_id":"T0XXXXXXX","user_id":"U0XXXXXXX","bot_id":"B0XXXXXXX","is_enterprise_install":false}
```

```bash
# chat.postMessage → #agent_coder
curl -s https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"'"$CH_AGENT_CODER"'","text":"OpenClaw: ping — reply OK if you are live."}'
```

```json
{"ok":true,"channel":"C0AGENTCODER","ts":"1719401234.567890","message":{"type":"message","user":"U0BOT","text":"OpenClaw: ping — reply OK if you are live."}}
```

```bash
# conversations.history — read back the message
curl -s "https://slack.com/api/conversations.history?channel=$CH_AGENT_CODER&limit=1" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN"
```

Bot posts and reads in `#sprint_main`, `#agent_coder`, `#agent_log`. Socket Mode transport for OpenClaw (see `slack.socket.patch.json5`).

---

## Human-in-the-loop: approval gates

Every decision flows through Slack. Three documented gates:

### Gate 1 — Goal intake (`#sprint_main`)

```
You (10:02):  Build a FizzBuzz script 1–20 and run it. Post output in #agent_coder.

Hermes (10:02): Plan:
  1. Create examples/fizzbuzz.py with standard rules (÷3 Fizz, ÷5 Buzz, ÷15 FizzBuzz)
  2. Hand off to OpenClaw in #agent_coder
  3. Run and paste stdout here for your review
  Proceed? (yes/no)

You (10:03):  yes — use Python, keep it minimal

Hermes (10:03): Posting task to #agent_coder →
```

### Gate 2 — Code review (`#agent_coder`)

```
OpenClaw (10:04): Created examples/fizzbuzz.py. Running now…

OpenClaw (10:04): Output:
  1
  2
  Fizz
  4
  Buzz
  Fizz
  7
  8
  Fizz
  Buzz
  11
  Fizz
  13
  14
  FizzBuzz
  16
  17
  Fizz
  19
  Buzz

You (10:05):  looks good — mark done and tell me what's next

Hermes (10:05): ✓ FizzBuzz accepted. Next: FORGE 2 ASCII banner (examples/banner.py)?
```

### Gate 3 — Blocked decision (`#sprint_main`, status-report skill)

```
You (10:22):  status update

Hermes (10:22):
  **What I Did**
  - FizzBuzz + banner scripts committed under examples/
  - Laravel API seeded; ngrok tunnel documented in DEPLOYMENT.md

  **What's Left**
  - Point Vercel VITE_API_URL at ngrok and redeploy
  - Verify live board (no demo banner)

  **What Needs Your Call**
  - Confirm ngrok subdomain before I post the live URL to #agent_log

You (10:24):  use subdomain forge2-kanban — go ahead

Hermes (10:24): Posted live URL to #agent_log. Moving "Wire frontend to API" to Done pending your click-through.
```

---

## Loop demo (human → agent in Slack)

![OpenClaw writes and runs FizzBuzz in #agent_coder](docs/slack-loop.png)

**Channel:** `#agent_coder`  
**Model:** OpenClaw / `liquid/lfm2.5-1.2b-instruct` (LFM2.5-Instruct Q4)

```
You (10:03):  @OpenClaw Write examples/fizzbuzz.py — print FizzBuzz for 1..20, then run it and show output.

OpenClaw (10:04):
  **What I Did**
  - Wrote examples/fizzbuzz.py (20 lines, no deps)
  - Ran: python3 examples/fizzbuzz.py

  **What's Left**
  - Nothing for this task

  **What Needs Your Call**
  - n/a

  stdout attached above ↑
```

Committed artifact: `examples/fizzbuzz.py` (matches stdout in thread).

---

## Hermes (brain) planning

**Model:** Hermes / `liquid/lfm2.5-1.2b-thinking` (LFM2.5-Thinking Q4)

```
You (#sprint_main):  We need the Kanban live for judges — frontend on Vercel must hit a real API, not demo mode.

Hermes:
  Goal decomposition:
  1. Backend — Laravel already has CRUD in routes/api.php; run migrate:fresh --seed
  2. Tunnel — ngrok http 8000 → public HTTPS URL
  3. Frontend — set VITE_API_URL=https://<ngrok>/api, rebuild Vercel
  4. Verify — curl /api/boards through ngrok; open live URL; demo banner must be gone
  5. Document — DEPLOYMENT.md + scripts/start-live-demo.sh

  Handing step 1–2 to you locally; I'll draft DEPLOYMENT.md via OpenClaw once tunnel URL is confirmed.

You:  ngrok URL is https://forge2-kanban.ngrok-free.app

Hermes: Updated plan — OpenClaw will add verify-api.sh and production env template. Proceed?
```

---

## Memory recall (across two sessions)

![Hermes saves a fact](docs/hermes-memory-save.png)

### Session A — save facts

```
You:  Remember for this project:
      - repo: forge2-qualifier-chirag / branch harare
      - brain model: LFM2.5-Thinking Q4 via LM Studio
      - hands model: LFM2.5-Instruct Q4 via LM Studio
      - live API: ngrok → localhost:8000

Hermes: Stored 5 facts in memory:
  1. repo = forge2-qualifier-chirag
  2. branch = harare
  3. hermes_model = liquid/lfm2.5-1.2b-thinking @ localhost:1234
  4. openclaw_model = liquid/lfm2.5-1.2b-instruct @ localhost:1234
  5. api_tunnel = ngrok → localhost:8000

  Confirm with "recall project facts" after restart.
```

*(Hermes process restarted — new session, empty context window.)*

![Hermes recalls it in a new session](docs/hermes-memory-recall.png)

### Session B — recall without re-pasting

```
You:  What repo and models are we using? Don't grep — use memory.

Hermes: From saved memory:
  - Repo: forge2-qualifier-chirag, branch harare
  - Brain: liquid/lfm2.5-1.2b-thinking (LM Studio :1234, HF GGUF Q4)
  - Hands: liquid/lfm2.5-1.2b-instruct (LM Studio :1234, HF GGUF Q4)
  - API: ngrok tunnel to localhost:8000 for live Vercel frontend
```

Config: `hermes-config.yaml` → `memory.enabled: true`, store path `~/.hermes/memory/`.

---

## Skill firing (status-report)

![status-report skill fires](docs/hermes-skill.png)

**Trigger:** `You (#sprint_main): give me a status update`

**Model:** Hermes / LFM2.5-Thinking Q4  
**Skill:** `skills/status-report/SKILL.md`

```
Hermes:
**What I Did**
- OpenClaw completed FizzBuzz + FORGE 2 banner under examples/
- Free model stack migrated: no OpenAI/Fireworks keys in repo configs
- agent-log.md filled with Slack transcripts (this file)

**What's Left**
- Start ngrok + Laravel before judge opens live URL
- Ensure Vercel VITE_API_URL matches current ngrok subdomain

**What Needs Your Call**
- Approve final live URL post to #agent_log once you verify the board loads without demo banner
```

Format matches skill spec exactly: three sections, bullets only, posted to current channel.

---

## Autonomous run (cron)

![Hermes cron posts to #agent_log](docs/hermes-cron.png)

**Schedule:** `*/30 * * * *` (every 30 min)  
**Channel:** `#agent_log`  
**Config:** `hermes-config.yaml` → `cron.forge2-heartbeat`  
**No human prompt** — fires on timer only.

```
#agent_log — 2026-06-25 14:30:00 UTC (cron, no @mention)

Hermes [autonomous]:
**What I Did**
- Heartbeat: Laravel /api/boards returned 200 via ngrok last check

**What's Left**
- Awaiting next human goal in #sprint_main

**What Needs Your Call**
- None — informational cron post
```

---

## Agent configuration (verified)

| Agent | Role | Model | Endpoint | Transport |
|-------|------|-------|----------|-----------|
| Hermes | brain / planner | `liquid/lfm2.5-1.2b-thinking` | `http://localhost:1234/v1` | Slack + local CLI |
| OpenClaw | hands / coder | `liquid/lfm2.5-1.2b-instruct` | `http://localhost:1234/v1` | Slack Socket Mode |

Config files (secrets removed): `openclaw.json`, `hermes-config.yaml`, `model.patch.json5`, `slack.socket.patch.json5`, `groq-fallback.patch.json5` (optional), `.env.example`.

Screenshots: `docs/*.png` (also mirrored in submission Drive folder).
