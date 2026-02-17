<!--
Sync Impact Report:
- Version change: 1.0.0 (initial)
- Modified principles: Initial creation with 5 core principles
- Added sections: Development Standards, Quality Assurance
- Removed sections: N/A (initial creation)
- Templates requiring updates: ✅ All templates validated for consistency
- Follow-up TODOs: None
-->

# ODH Dashboard Frontend Constitution

## Core Principles

### I. TypeScript-First Development
Strict typing is MANDATORY for all code. Use explicit type definitions with complete interfaces. Objects and functions MUST have clearly defined input and output types. Type assertions are PROHIBITED under ALL circumstances. All custom React hooks MUST have strict typing for inputs and outputs, solving a single goal through composition if needed. Primitives don't need memoization, objects are optionally memoized, but functions exported from custom hooks MUST always be memoized.

**Rationale**: With thousands of users depending on this dashboard, type safety prevents runtime errors and ensures maintainability in this brownfield TypeScript project.

### II. PatternFly-Only UI Components
All user interface components MUST use PatternFly v6 library exclusively. Custom CSS styling is PROHIBITED except as an absolute last resort using CSS variables. Material UI is only permitted in Kubeflow mode. No custom styling solutions or component libraries outside PatternFly are allowed for RHOAI/ODH mode.

**Rationale**: Consistency across the Red Hat OpenShift console ecosystem requires standardized UI components. PatternFly ensures accessibility, brand compliance, and reduces maintenance overhead.

### III. Comprehensive Testing Coverage
Complete test coverage is MANDATORY for all utility functions, custom hooks, API utilities, data transformations, and business logic. Unit tests MUST use Jest with React Testing Library. Integration tests MUST be implemented for new library contracts, contract changes, inter-service communication, and shared schemas. Follow TDD: tests written → user approved → tests fail → implement. Use `data-testid` attributes for component testing, accessibility selectors as fallback. NEVER use DOM structure or CSS selectors.

**Rationale**: With thousands of production users, comprehensive testing prevents regressions and ensures system reliability. The brownfield nature requires defensive testing practices.

### IV. Performance-First Architecture
Performance optimization is NON-NEGOTIABLE. All code changes MUST consider performance impact. Implement proper memoization strategies: memoize functions in custom hooks, optionally memoize objects, skip primitive memoization. Monitor and prevent excessive re-renders. Lazy loading MUST be implemented for non-critical components. Bundle size increases require justification.

**Rationale**: Dashboard serves thousands of concurrent users on Red Hat OpenShift. Performance directly impacts user experience and system scalability.

### V. Code Quality Standards
Code MUST follow existing patterns and conventions found in the codebase. Prefer editing existing files over creating new ones. Check package.json for available libraries before introducing new dependencies. Follow established naming conventions, framework choices, and architectural patterns. Security best practices are MANDATORY - never expose or commit secrets/keys.

**Rationale**: Consistency in a large monorepo with multiple teams requires strict adherence to established patterns. Security is paramount in enterprise environments.

## Development Standards

All development MUST follow the monorepo structure with proper package boundaries. React 18 patterns are required. Module Federation with Webpack MUST be respected for package architecture. Turbo task runner MUST be used for build orchestration. Node.js >= 22.0.0 and npm >= 10.0.0 are required. Go >= 1.24 is required for packages with Backend-For-Frontend (BFF) services.

## Quality Assurance

Agents MUST read `frontend/docs/generate-docs.md` for frontend directory overview and `AGENTS.md` in the root for specialized agent rules before completing tasks. All spec-kit artifacts MUST be placed in `frontend/.specify` directory. Lint and type-check commands MUST pass before any code submission. E2E tests using Cypress MUST cover critical user workflows.

## Governance

This constitution supersedes all other development practices. All code reviews MUST verify compliance with these principles. Complexity that violates these principles MUST be justified and approved. Changes to core principles require documentation, approval, and migration plan. Non-compliance issues MUST be addressed immediately.

**Version**: 1.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-17