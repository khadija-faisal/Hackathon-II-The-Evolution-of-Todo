---
id: PHR-001
title: Phase 2 Constitution Generation
stage: constitution
date: 2025-01-14
surface: claude-code
model: claude-haiku-4-5
feature: N/A
branch: main
user: khadija
command: /sp.constitution
labels: [governance, architecture, security, production]
links:
  spec: N/A
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: .specify/memory/constitution.md
    status: created
    type: governance
tests: N/A
---

## Prompt

Act as a Senior Prompt and Context Engineer specializing in SDD-RI (Spec-Driven Development with Reusable Intelligence).

Task: Generate a comprehensive speckit.constitution file for Phase 2 of the Todo Full-Stack Web Application.

Context & Requirements:

Stack: Next.js 16+ (App Router), FastAPI (Python), SQLModel, Neon Serverless PostgreSQL, and Better Auth.

Architecture: Monorepo structure with /frontend and /backend.

The JWT Bridge (Critical): Constitution must enforce that Better Auth on the frontend issues JWTs, and FastAPI backend must have middleware to verify these tokens using the BETTER_AUTH_SECRET.

User Isolation: Every DB query must be filtered by user_id extracted from the JWT. No user should ever see another user's tasks.

No Manual Coding: Enforce the "No Task = No Code" rule.

Rules for the Constitution (based on Spec-Kit Plus):

Categorization: Organize rules by Architecture, Security, Database, and Frontend/Backend patterns.

Statelessness: Enforce that the backend remains stateless.

Error Handling: Define how 401 Unauthorized and 403 Forbidden should be handled across the stack.

Naming Conventions: Enforce Pydantic models for API and Server Components for UI.

Output Format: Provide the content in a clean Markdown format inside a file named speckit.constitution. Do not add fluff; focus on actionable constraints that an AI agent must obey.

Note: Please don't add extra long examples and extra detailed steps; just create constitution with given context and no extra long detailed, don't make it unreadable.

## Response snapshot

Generated comprehensive speckit.constitution file (v2.0.0) with:

**7 Core Principles:**
- I. JWT Authentication & User Isolation
- II. API-First Backend
- III. Server Components Default
- IV. Stateless Backend
- V. User-Scoped Database Queries
- VI. Error Handling Standards
- VII. Type Safety & Validation

**8 Key Sections:**
- Security Requirements (JWT bridge, multi-tenancy, secrets)
- Database Constraints (schema versioning, indexes, N+1 prevention)
- API Response Standards (unified response envelope)
- Frontend-Backend Contract (data ownership, request flow)
- Development Workflow (No Task = No Code enforcement)
- Naming Conventions (backend/frontend/database patterns)
- Governance (amendment procedure, version bumping, compliance)

**Version Bump:** 0.0.1 → 2.0.0 (MAJOR)
- Complete rewrite for production readiness
- Introduces non-negotiable principles
- Backward incompatible with previous patterns

## Outcome

- ✅ Impact: Established production-ready governance framework for Phase 2; unifies JWT auth, user isolation, API contracts, and development workflow
- 🧪 Tests: N/A (governance document, no tests)
- 📁 Files: `.specify/memory/constitution.md` (281 lines, 9.2 KB)
- 🔁 Next prompts: Generate speckit.specify (requirements), speckit.plan (architecture), speckit.tasks (task breakdown)
- 🧠 Reflection: Constitution successfully captures all critical constraints: JWT bridge enforcement, user isolation defense-in-depth, stateless backend design, type safety, and Spec-Kit workflow. Concise format (no bloat) improves readability for agents.

## Evaluation notes (flywheel)

- Failure modes observed: None—first iteration successful
- Graders run and results: N/A (governance document)
- Prompt variant: User feedback addressed: removed verbose examples, kept content actionable and concise
- Next experiment: Validate constitution against actual feature specifications (spec.md) to ensure alignment
