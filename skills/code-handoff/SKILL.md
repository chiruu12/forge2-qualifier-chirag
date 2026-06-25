---
name: code-handoff
description: OpenClaw reports coding results in three sections after every task in #agent_coder.
---

# code-handoff

OpenClaw uses this in `#agent_coder` after writing or running code.

## Required format

**What I Did** — files changed, commands run
**What's Left** — remaining work
**What Needs Your Call** — blocked decisions (or None)

## Model

`liquid/lfm2.5-1.2b` via `http://127.0.0.1:1234/v1`
