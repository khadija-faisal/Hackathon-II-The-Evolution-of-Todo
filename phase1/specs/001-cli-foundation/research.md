# Phase 0: Research - CLI Foundation

**Date**: 2026-01-08 | **Status**: Complete | **Findings**: All clarifications resolved

---

## Python 3.9+ with Stdlib Only

**Decision**: Python 3.9+, standard library modules only

**Modules**: argparse (CLI), json (storage), pathlib (paths), dataclasses (entities), datetime (timestamps)

**Rationale**: Mature, widely-deployed, zero external dependencies (Constitution §V)

**Alternatives Rejected**: Click/docopt require external deps

---

## JSON Storage at ~/.todo/tasks.json

**Decision**: JSON array with atomic writes (temp file → rename)

**Rationale**: Human-readable, standard format. Atomic writes prevent partial updates on crash. Corruption recovery: backup + reinit.

**Alternatives Rejected**: SQLite (external DB forbidden), YAML (less standard), non-atomic writes (data loss risk)

---

## CLI Framework: argparse

**Decision**: stdlib argparse for command routing

**Rationale**: Builtin, zero deps, supports subcommands, auto help generation

**Alternatives Rejected**: Click/docopt (external deps)

---

## Two-State Task Status

**Decision**: "pending" or "completed" (from spec §160)

**Rationale**: Spec defines exactly two states, no undo/redo needed (§161)

**Alternatives Rejected**: Three-state enum (spec doesn't require)

---

## Auto-Increment IDs, No Reuse

**Decision**: ID = max(existing_ids) + 1, gaps preserved after deletion

**Rationale**: Spec §119 requires auto-increment from 1, §159 allows gaps

**Alternatives Rejected**: UUID (overkill), reuse deleted IDs (spec forbids)

---

## Dedicated Validation Layer

**Decision**: Separate validation module with clear error messages per Constitution §VI

**Rationale**: Separates concerns, enables independent testing, enforces requirements

**Rules**:
- Title: non-empty, ≤255 chars
- ID: positive integer, must exist in list
- Status: "pending" or "completed" (internal only)

---

## Three-Layer Error Handling

**Decision**: Validation → Business Logic → I/O with try-catch at CLI

**Rationale**: Constitution §VI requires robust validation and clear feedback

**Pattern**: JSON corruption → backup to .bak + reinit; missing dir → auto-create

---

## Code Quality: PEP8, Type Hints, Docstrings, SDD

**Decision**: All code follows Constitution §II-VII

**PEP8**: 100-char lines, 4-space indent, zero linting violations
**Type Hints**: All function signatures typed
**Docstrings**: Google-style on all public functions/classes
**SDD**: Task ID comments in all code (§VII)

---

## Summary

✅ All technical decisions validated. No NEEDS CLARIFICATION items remain. Ready for implementation.

### Implementation Roadmap (per refactored tasks.md)

- **M-001**: Foundation & Setup (T-001 to T-008)
- **M-002**: CORE MVP - US-1 & US-2: Add + List (T-009 to T-016)
- **M-003**: CORE MVP - US-3: Mark Complete (T-017 to T-019)
- **M-004**: Secondary - US-4 & US-5: Update + Delete (T-020 to T-022)
- **M-005**: Code Quality & SDD Compliance (T-023)

All research decisions align with these milestones. Each decision supports CORE MVP first, then extended features.
