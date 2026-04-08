---
name: horse-around
description: Coordinates multiple AI agents working in parallel on complex projects using file-based communication. Use when the user wants to coordinate parallel AI sessions, manage multi-chat workflows, set up task coordination systems, or when they mention "parallel AI", "swarm commander", "multiple chats", or "horsin around".
---

# Horse Around - Parallel AI Coordination

Coordinates multiple AI agents working in parallel using file-based communication.

## Core Principles

- Orchestrator coordinates only. Execution happens in parallel subagents.
- Launch ALL chat subagents simultaneously in parallel batch with `is_background: true`. Sequential launches prevent parallelism.
- Tasks exceeding estimate by 10% must STOP and alert.
- File-based communication through markdown files.
- Each subagent has one focused responsibility.

## Setup Workflow

1. Create coordination directories:
   - **PowerShell**: `New-Item -ItemType Directory -Force -Path coordination/orders,coordination/answers,coordination/questions,coordination/alerts,coordination/logs`
   - **Bash**: `mkdir -p coordination/{orders,answers,questions,alerts,logs}`
2. Create `coordination/COMMAND_CENTER.md` from `templates/COMMAND_CENTER_template.md`
3. Identify parallel tasks with no dependencies
4. Create order files: `coordination/orders/order_chat_[LETTER]_[ROUND].md` from `templates/order_template.md`
5. Launch ALL generalPurpose subagents in parallel batch with `is_background: true`

Order files require: mission, context, tasks with estimates, deliverables, time tracking, success criteria.

Subagent execution: read order file, track time, update every 15 minutes, stop if 10% over estimate, create answer file on completion.

## Parallel Launch Pattern

Launch ALL subagents simultaneously in the same parallel batch. Do not launch sequentially.

For each chat (Chat A, B, C, etc.), create one generalPurpose subagent configured to:
- Read the corresponding order file: `coordination/orders/order_chat_[LETTER]_[ROUND].md`
- Execute tasks independently with time tracking
- Create answer file on completion

Launch all subagents in a single parallel batch, one subagent per chat/task, all with `is_background: true`. Sequential launches prevent true parallelism.

## Time Management

Timeout threshold = estimate + 10%. If not 90% done by threshold, STOP and create alert.

Time tracking template:
```markdown
| Task | Estimated | Started | Actual | Status |
|------|-----------|---------|--------|--------|
| Task 1 | [X]m | | | Pending |
| Task 2 | [X]m | | | Pending |
| **Total** | **[X]m** | | | |
**Timeout threshold:** [Total + 10%] minutes
```

## File Types

- Orders: `orders/order_chat_[LETTER]_[ROUND].md` - Task assignments
- Answers: `answers/answer_chat_[LETTER]_[ROUND].md` - Results reporting
- Questions: `questions/question_[FROM]_to_[TO]_[N].md` - Inter-chat questions
- Alerts: `alerts/alert_[CHAT]_[TYPE].md` - Timeout/blocker notifications
- Command Center: `COMMAND_CENTER.md` - Master dashboard

## Templates

Available in `templates/`: `order_template.md`, `answer_template.md`, `COMMAND_CENTER_template.md`, `question_template.md`, `alert_template.md`

## Best Practices

Orchestrator: coordinate only, launch ALL subagents simultaneously in parallel batch with `is_background: true`, break into parallel tasks, check Command Center every 15 minutes, respond to blockers within 10 minutes.

Subagent: read entire order first, track time immediately, update every 15 minutes, follow 10% timeout rule, ask questions early, complete answer template.

## Common Patterns

- Handoff: Chat A creates artifact → Chat B uses in next round
- Mirror: Chat A builds → Chat B tests in parallel
- Specialist: Assign by expertise (backend/frontend/testing)

## Scaling

2-3 chats: simple coordination. 4-5 chats: optimal. 6+ chats: consider deputy commander.
