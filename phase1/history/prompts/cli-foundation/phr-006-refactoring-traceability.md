---
id: phr-006
title: refactoring-traceability
stage: refactor
date: 2026-01-08T12:00:00Z
surface: claude-code
model: claude-haiku-4-5
feature: 001-cli-foundation
branch: 001-cli-foundation
user: khadija
command: /sp.plan (refactoring)
labels: [refactoring, traceability, milestone-consolidation, spec-driven, user-story-mapping]
links:
  spec: specs/001-cli-foundation/spec.md
  plan: specs/001-cli-foundation/plan.md
  tasks: specs/001-cli-foundation/tasks.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-cli-foundation/spec.md
  - specs/001-cli-foundation/plan.md
  - specs/001-cli-foundation/tasks.md
  - specs/001-cli-foundation/research.md
  - specs/001-cli-foundation/quickstart.md
  - specs/001-cli-foundation/data-model.md
tests: null
---

## Prompt

Refactor spec.md, plan.md, and tasks.md with the following goals:

1. Keep all User Stories (US-1 to US-5) in spec.md but mark US-1, US-2, US-3 as 'Core MVP'.
2. Refactor tasks.md: Reduce the 23 tasks into 5 main Milestones (M-001 to M-005).
3. Traceability: Each milestone in tasks.md MUST explicitly reference which User Story (e.g., US-1) it implements.
4. Simplify Plan: Remove heavy testing sections and focus on the src/ layout logic.
5. Update all supporting reference files (research.md, quickstart.md, data-model.md) to align with new structure.

Ensure judges see a clear link between Specs and Code.

## Response snapshot

Successfully refactored all specification and planning documents into a 5-Milestone structure with explicit user story traceability:

**Spec.md Updates**:
- Added `**[CORE MVP]**` markers to US-1, US-2, US-3 (lines 14, 30, 46)
- All 5 User Stories preserved (US-1 through US-5)
- Core MVP explicitly marked for judge visibility

**Tasks.md Restructuring**:
- Created Milestone Traceability Matrix (lines 22-30) mapping milestones to user stories
- Consolidated 23 tasks into 5 high-level milestones:
  * M-001: Foundation & Setup (T-001 to T-008) - Infrastructure
  * M-002: US-1 & US-2 (T-009 to T-016) - Add + List Tasks [CORE MVP]
  * M-003: US-3 (T-017 to T-019) - Mark Complete [CORE MVP]
  * M-004: US-4 & US-5 (T-020 to T-022) - Update + Delete [Secondary]
  * M-005: Code Quality (T-023) - SDD Compliance
- Each milestone explicitly references which User Story(ies) it implements
- Added completion status markers and notes

**Plan.md Simplification**:
- Removed: Verbose testing strategy sections
- Added: "src/ Code Structure & Traceability" section (lines 326-350) showing file-to-Task mapping
- Added: "Implementation Execution Path (For Judges)" section showing spec → plan → tasks → code flow

**Supporting Documents Updated**:
- research.md: Added Implementation Roadmap referencing 5-milestone structure
- quickstart.md: Added Milestone Implementation Order; Enhanced SDD Requirement examples
- data-model.md: Added Task ID reference (T-005) and Milestone reference (M-001)

**Key Achievement**: Created clear, unambiguous spec-to-code traceability for judge review.

## Outcome

- ✅ Impact: Established 5-Milestone architecture consolidating 23 tasks with explicit user story mapping. All judges can trace US-1 through US-3 (CORE MVP) through M-002 and M-003. US-4, US-5 clearly marked as secondary (M-004). All supporting documents aligned.
- 🧪 Tests: No formal tests required for specification refactoring; specification validity confirmed through cross-document consistency checks
- 📁 Files: 6 specification files updated: spec.md, plan.md, tasks.md, research.md, quickstart.md, data-model.md
- 🔁 Next prompts: /sp.implement (begin M-001 Foundation implementation with models.py and storage.py as T-005 and T-006)
- 🧠 Reflection: Spec-Driven Development requires clear traceability. By consolidating 23 tasks into 5 milestones and explicitly mapping each milestone to user stories, we enabled judges to understand scope and priority instantly. The Milestone Traceability Matrix (spec.md links → tasks.md milestones → code implementation) became the single source of truth. This design pattern scales well and prevents "vibe coding" by forcing explicit requirements-to-code mapping.

## Evaluation notes (flywheel)

- Failure modes observed: Initial version had unclear milestone naming; refined to explicit US-X references per milestone. User explicitly rejected extra summary files (judge_quick_reference.md), so removed those immediately.
- Graders run and results (PASS/FAIL): ✅ PASS (all 5 milestones have 0 uncovered tasks, traceability matrix complete, user story mapping explicit)
- Prompt variant (if applicable): Variant 2 (Spec-Kit Plus with Milestone consolidation)
- Next experiment (smallest change to try): Implement M-001 (T-001 through T-008) foundation with explicit [Task]: T-XXX comments in code; verify traceability links work for judges in actual code files

