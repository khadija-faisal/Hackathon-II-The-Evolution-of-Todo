---
id: PHR-001
title: 5-Phase Roadmap and Scope Guard Amendment
stage: constitution
date: 2026-01-07
surface: cli
model: claude-haiku-4-5-20251001
feature: project-roadmap
branch: main
user: khadija
command: /sp.constitution
labels: [roadmap, scope-guard, phase-based-delivery, constitutional-amendment]
links:
  spec: .specify/memory/constitution.md
  ticket: null
  adr: null
  pr: null
files:
  modified:
    - .specify/memory/constitution.md
tests: null
---

## Prompt

Please update our constitution.md using the Spec-Kit MCP workflow. I need to formalize our project roadmap and ensure strict scope control.

1. Add the 'Project Roadmap' section after the header:

Phase I (Active): In-Memory Python Console App (Python, Claude Code, Spec-Kit).

Phase II: Full-Stack Web Application (Next.js, FastAPI, SQLModel, Neon DB).

Phase III: AI-Powered Todo Chatbot (OpenAI ChatKit, Agents SDK, MCP SDK).

Phase IV: Local Kubernetes Deployment (Docker, Minikube, Helm, kubectl-ai).

Phase V: Advanced Cloud Deployment (Kafka, Dapr, DigitalOcean DOKS).

2. Add a 'Scope Guard' Principle: Define a rule that any attempt to introduce dependencies or architecture from Phases II–V (like FastAPI, SQL, Docker, or Cloud services) in Phase I must be flagged as a constitutional violation and rejected.

3. Update 'Sync Impact Report': Update the version to 1.1.0 and log the change: 'Added 5-Phase Roadmap and Phase I Scope Guarding'.

Please apply these changes to constitution.md now while maintaining the existing SDD (Spec-Driven Development) rules.

*User later refined request*: set core principles according to all phase not the specific one and also update stack technology according all phase, we will work phase by phase, means first we complete phase one the others as well just add rules about this

## Response snapshot

Updated constitution.md from v1.0.0 → v1.1.0 with comprehensive changes:

**Key Additions:**
- Project Roadmap section at document start (Phases I–V with detailed objectives, tech stacks, and exit criteria)
- Restructured Core Principles (I. Quality-First, II. User-First Interfaces, III. Modular Architecture, IV. Data Persistence, V. SDD Workflow) to apply universally across all phases
- Phase-Based Development Workflow section with:
  - Phase Completion Rules (active phase lock, completion criteria, advancement gates)
  - Technology Stack Rules (explicit constraints for each phase I–V)
  - Violation Protocol (Scope Guard with flagging, logging, and remediation rules)
- Governance section clarifying amendment procedures and compliance review

**Title Change:** "Todo Console App Constitution" → "todo app Constitution"

**Version Bump:** 1.0.0 → 1.1.0 (MINOR: new sections + principle restructuring)

**Sync Impact Report:** Updated with complete rationale, modified principles, added sections, and template update status.

## Outcome

- ✅ Impact: Constitution now formally documents 5-phase roadmap with strict phase-based development rules, preventing scope creep across phases while enabling sequential delivery
- 🧪 Tests: Manual validation of document structure, placeholder resolution, version consistency
- 📁 Files: 1 file modified (.specify/memory/constitution.md)
- 🔁 Next prompts: Update AGENTS.md to reference phase-based scope rules; create initial Phase I spec.md
- 🧠 Reflection: User's second refinement request clarified intent to generalize principles across all phases rather than focusing solely on Phase I scope guard. Restructuring core principles to be phase-agnostic while adding explicit per-phase constraints makes constitution more maintainable and prevents scope drift.

## Evaluation notes (flywheel)

- Failure modes observed: Initial attempt focused on Phase I only; user clarified need for all-phase applicability
- Graders run and results (PASS/FAIL): PASS — constitution structure valid, version bump correct, all placeholders resolved
- Prompt variant (if applicable): User refinement → expanded from "Scope Guard Principle" to "Universal Principles + Phase-Based Workflow"
- Next experiment: Consider adding per-phase checklist template to constitution for phase completion validation
