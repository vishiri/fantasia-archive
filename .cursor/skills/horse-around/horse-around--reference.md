# Horse Around - Complete Reference

Complete documentation for the parallel AI coordination system.

## Philosophy

Horse Around (also called Swarm Commander) coordinates multiple AI agents working in parallel on complex projects. Based on Extreme Go Horse methodology adapted for parallel execution.

**Core Principles:**
1. More horses = more speed - Use multiple AIs simultaneously
2. Files over meetings - All coordination through markdown files
3. 10% rule - Timeout at estimate + 10%
4. Ship it - Perfect is the enemy of deployed
5. Trust the stampede - Each horse knows its lane
6. Scale as needed - 2 horses or 10, the system adapts

## File Structure

```
coordination/
├── COMMAND_CENTER.md      # Master status dashboard
├── orders/                # Task assignments
│   ├── order_chat_A_1.md
│   └── order_chat_B_1.md
├── answers/               # Results reporting
│   ├── answer_chat_A_1.md
│   └── answer_chat_B_1.md
├── questions/             # Inter-chat communication
│   └── question_A_to_B_1.md
├── alerts/                # Problem notifications
│   └── alert_A_timeout.md
└── logs/                  # Interaction archive
    └── YYYY-MM-DD/
```

## The 10% Timeout Rule

**Core Principle:** If any task takes >10% longer than estimated, STOP and reassess.

**Example:**
- Task estimated: 30 minutes
- Timeout threshold: 33 minutes (30 + 10%)
- If not done by 33 minutes → STOP and create alert

**Why This Works:**
- Prevents wasting time on stuck tasks
- Forces early problem detection
- Promotes asking for help sooner
- Improves estimation accuracy over time

**Implementation:**
1. At task start: Set timeout threshold = estimate + 10%
2. Every 15 minutes: Update progress
3. At timeout: If not 90% done, STOP and create alert
4. In answer file: Document time variance and lessons learned

## Task Division Patterns

### Swim Lanes

Organize parallel work into specialized lanes:

| Lane | Focus | When to Use |
|------|-------|-------------|
| **Build** | Feature development | Always |
| **Ops** | Monitoring, deployments | Long-running tasks |
| **Investigation** | Bug hunting, root cause | Critical issues |
| **Data** | Migrations, analysis | Data changes |

### Common Patterns

**Handoff Pattern:**
- Round 1: Chat A creates artifact (e.g., API_SPEC.md)
- Round 2: Chat B uses artifact for integration

**Mirror Pattern:**
- Chat A builds feature
- Chat B tests it in parallel or immediately after

**Specialist Pattern:**
- Chat A: All backend work
- Chat B: All frontend work
- Chat C: All testing

## Order File Structure

**Location:** `coordination/orders/order_chat_[LETTER]_[ROUND].md`

**Required Sections:**
1. Header (From, To, Date, Priority, Duration)
2. Mission (one sentence)
3. Context (background, dependencies)
4. Tasks (numbered with time estimates)
5. Deliverables (what to create)
6. Time Tracking (template)
7. Success Criteria (checkboxes)
8. If You Get Stuck (guidance)
9. Related Work (other chats)

## Answer File Structure

**Location:** `coordination/answers/answer_chat_[LETTER]_[ROUND].md`

**Required Sections:**
1. Header (Task, Status, Date)
2. Summary (2-3 sentences)
3. Time Tracking (estimated vs actual)
4. Completed Tasks (what was done)
5. Deliverables (files created)
6. Issues Encountered (problems and solutions)
7. Success Criteria Check (which met)
8. Lessons Learned (for future estimates)
9. Next Steps (recommendations)

**Status Values:**
- `Complete` - All tasks finished, all criteria met
- `Partial` - Some tasks finished, can continue in next round
- `Blocked` - Cannot proceed without external input

## Command Center

**Location:** `coordination/COMMAND_CENTER.md`

**Purpose:** Single source of truth for project status.

**Key Sections:**
- Active Chats (status table)
- Recent Updates (timeline)
- Blockers & Alerts (current problems)
- Pending Questions (unanswered)
- Completed This Round (finished work)
- Dependencies Map (visual flow)
- Next Actions (commander to-do)
- Metrics (time tracking rollup)

**Update Frequency:**
- Every 15 minutes during active execution
- After each answer file received
- Immediately when blockers arise

## Communication Protocols

### Questions

**When to Use:** Need clarification, blocked by another chat, or need commander decision.

**File:** `coordination/questions/question_[FROM]_to_[TO]_[N].md`

**Required:**
- Clear, specific question
- Context (what working on, why need this)
- What tried already
- Impact (if not answered)
- Urgency level

### Alerts

**When to Use:** Timeout hit, blocked, or critical error.

**File:** `coordination/alerts/alert_[CHAT]_[TYPE].md`

**Types:**
- `timeout` - Exceeded time limit by 10%+
- `blocked` - Cannot proceed without external input
- `critical` - Unexpected error or failure

**Required:**
- Situation description
- Current progress
- Root cause
- Options considered
- Impact assessment
- Request to commander

## Best Practices

### For Commanders

**Planning:**
- Break work into truly parallel tasks (no dependencies in same round)
- Set realistic time estimates (add 20% buffer for first-time tasks)
- Create clear boundaries (one focus per chat)

**During Execution:**
- Check Command Center every 15 minutes
- Respond to blockers within 10 minutes
- Don't micro-manage - trust the process

**After Each Round:**
- Review all answer files
- Update estimates for next round
- Celebrate wins

### For Chat Agents

**Starting:**
- Read entire order before starting
- Set up time tracking immediately
- Clarify questions BEFORE starting work

**During Execution:**
- Update progress every 15 minutes
- Follow 10% timeout rule strictly
- Ask questions early, don't guess

**Completing:**
- Fill out complete answer template
- Be honest about problems
- Document lessons learned

## Scaling Guidelines

- **2-3 chats:** Simple coordination, casual management
- **4-5 chats:** Sweet spot, requires dedicated attention
- **6+ chats:** Consider deputy commander or squad structure

## Common Pitfalls

1. **Too Many Dependencies:** Chats constantly waiting on each other
   - Solution: Redesign round structure, create mock data for Round 1

2. **Vague Orders:** Questions flood in, output doesn't match expectations
   - Solution: Add specific examples, include success criteria

3. **Ignoring Timeouts:** Tasks run 2-3x over estimate
   - Solution: Enforce 10% rule strictly, break tasks smaller

4. **Scope Creep:** "While I was doing X, I also did Y and Z"
   - Solution: Clear boundaries, explicit "out of scope" list

5. **Communication Overload:** More time coordinating than working
   - Solution: Reduce parallel chat count, increase round duration

## Metrics

### Estimation Accuracy
```
Accuracy = Estimated Time / Actual Time × 100%
```
Target: 80-120%

### On-Time Rate
```
On-Time Rate = Tasks Completed Within Timeout / Total Tasks × 100%
```
Target: 90%+

### Blocker Resolution Time
```
Resolution Time = Time Question Answered - Time Question Asked
```
Target: <10 minutes

### Parallel Efficiency
```
Efficiency = Sum of All Task Durations / (Elapsed Wall Time × Number of Chats) × 100%
```
Target: 70%+

## Launch Message Template

Send this to each AI chat:

```
You are Chat [LETTER] in a parallel AI coordination system.

Your role: [Brief description]

Please read the attached file: order_chat_[LETTER]_[ROUND].md

Key rules:
1. Start with time tracking
2. Update progress every 15 minutes
3. If you exceed estimated time by 10%, STOP and report
4. Create answer_chat_[LETTER]_[ROUND].md when complete

Your mission: [Brief description from order]

Estimated time: [XX] minutes

Let's begin!
```

## Use Cases

**Quick Bug Fix (2 horses):**
- Chat A: Fix the bug
- Chat B: Write/update tests

**New Feature (3 horses):**
- Chat A: Backend implementation
- Chat B: Frontend implementation
- Chat C: Documentation

**Full Product Sprint (5+ horses):**
- Chat A: Backend API
- Chat B: Frontend components
- Chat C: Database schema
- Chat D: Test suite
- Chat E: CI/CD pipeline

**Research Project (3-4 horses):**
- Chat A: Literature review
- Chat B: Data analysis
- Chat C: Visualization
- Chat D: Report writing
