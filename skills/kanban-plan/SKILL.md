---
name: kanban-plan
description: Decompose a Kanban or repo goal into phased steps and wait for human approval before handing work to OpenClaw.
---

# kanban-plan

Hermes uses this when a human posts a build goal in `#sprint_main`.

## Trigger phrases

- "build the kanban"
- "add API endpoint"
- "wire the frontend"
- "next phase"

## Procedure

1. Restate the goal in one sentence.
2. Break work into numbered phases (max 5). Each phase names files or commands.
3. Ask: **Proceed with phase N? (yes/no)**
4. Do not invoke OpenClaw until the human replies **yes**.
5. After approval, post the task to `#agent_coder` for `liquid/lfm2.5-1.2b`.

## Human-in-the-loop gate

Planning stops at yes/no. Revise the plan if the human says no.
