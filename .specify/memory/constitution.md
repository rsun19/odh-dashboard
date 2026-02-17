<!--
Sync Impact Report:
- Version change: Initial → 1.0.0
- Added sections: All core principles and governance framework
- Modified principles: N/A (initial version)
- Templates requiring updates: ✅ plan-template.md, ✅ spec-template.md (already aligned)
- Follow-up TODOs: None
-->

# ODH Dashboard Constitution

## Core Principles

### I. Code Quality Standards (NON-NEGOTIABLE)
All code MUST adhere to TypeScript strict mode with zero ESLint warnings; Components MUST follow PatternFly v6 design system for RHOAI/ODH mode and Material UI for Kubeflow mode; Code reviews MUST enforce architectural patterns, proper error handling, and security best practices; All functions and components MUST have clear, single responsibilities.

**Rationale**: The ODH Dashboard serves as a critical interface for enterprise AI/ML workflows. Poor code quality directly impacts user trust, system reliability, and maintainability across the monorepo structure.

### II. Comprehensive Testing Strategy (NON-NEGOTIABLE)
Every feature MUST include unit tests (Jest), component tests (Cypress), and E2E tests; Test coverage MUST be maintained at 80% minimum across all packages; Contract tests MUST be implemented for all BFF (Backend for Frontend) services; Mock data MUST be comprehensive and shared via @odh-dashboard/internal/__mocks__.

**Rationale**: The monorepo contains multiple packages with complex interactions. Testing failures cascade across packages and can break critical AI/ML workflows for end users.

### III. User Experience Consistency
UI components MUST maintain consistent patterns across all packages; User flows MUST be intuitive and follow established UX patterns; Accessibility MUST comply with WCAG 2.1 AA standards; Loading states, error handling, and feedback MUST be consistent across all interfaces.

**Rationale**: ODH Dashboard serves diverse user personas (data scientists, ML engineers, administrators). Inconsistent UX creates cognitive overhead and reduces productivity in AI/ML workflows.

### IV. Performance Requirements
Frontend builds MUST complete in under 5 minutes; Initial page load MUST be under 3 seconds; API responses MUST be under 500ms for dashboard operations; Bundle size MUST be optimized using Module Federation and code splitting.

**Rationale**: AI/ML workflows are time-sensitive. Performance bottlenecks in the dashboard directly impact data science productivity and model deployment timelines.

### V. Monorepo Discipline
Package boundaries MUST be respected with no circular dependencies; Shared utilities MUST be placed in appropriate packages (app-config, plugin-core); Turbo tasks MUST run efficiently with proper caching; Package-specific rules MUST be followed per individual AGENTS.md files.

**Rationale**: The monorepo structure enables code sharing but requires discipline to maintain. Violations lead to build failures and deployment issues across multiple feature teams.

## Technology Stack Requirements

All packages MUST use Node.js >=22.0.0 and npm >=10.0.0; Frontend MUST use React 18 with TypeScript; Backend MUST use Node.js/Express with Go >=1.24 for BFF services; Testing MUST use Jest for units, Cypress for E2E/component tests; Build system MUST use Webpack with Module Federation and Turbo for task running.

**Security**: No secrets or keys in repository; All API endpoints MUST implement proper authentication/authorization; Dependencies MUST be regularly updated for security patches.

## Quality Gates

All commits MUST pass lint, type-check, and unit tests before merge; E2E tests MUST pass for user-facing changes; Package-specific build requirements MUST be met; Pre-commit hooks MUST enforce code quality standards; Contract tests MUST pass for BFF changes.

**Review Requirements**: All PRs require approval from package maintainers; Security-related changes require additional security team review; Breaking changes require architecture team approval.

## Governance

This constitution supersedes all other development practices within the ODH Dashboard project. Amendments require documentation of impact, approval from project maintainers, and migration plan for affected packages.

All pull requests and code reviews MUST verify compliance with these principles. Violations must be addressed before merge. Package-specific guidance in individual AGENTS.md files supplements but cannot override these core principles.

For runtime development guidance and package-specific rules, consult the AGENTS.md file in the repository root and package-specific directories.

**Version**: 1.0.0 | **Ratified**: 2025-02-17 | **Last Amended**: 2025-02-17