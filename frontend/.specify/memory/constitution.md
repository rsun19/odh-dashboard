<!--
Sync Impact Report:
- Version change: none → 1.0.0
- Modified principles: Initial constitution creation
- Added sections: All sections are new
- Removed sections: None
- Templates requiring updates: ✅ All templates reviewed and validated
- Follow-up TODOs: None
-->

# ODH Dashboard Frontend Constitution

## Core Principles

### I. PatternFly-First UI Development

All user interface components MUST use PatternFly v6 as the primary component library. Material UI MUST only be used for Kubeflow compatibility mode. Custom CSS MUST be avoided except as a last resort using CSS variables only. This ensures consistent user experience across the Red Hat OpenShift AI dashboard and maintains design system compliance.

**Rationale**: PatternFly provides enterprise-grade accessibility, consistency with OpenShift console, and reduces maintenance overhead compared to custom styling solutions.

### II. TypeScript Strict Mode (NON-NEGOTIABLE)

All code MUST be written in TypeScript with strict mode enabled. Type assertions MUST NOT be used under any circumstances. All functions, components, and data structures MUST have explicit type definitions. Generic types MUST be properly constrained and meaningful.

**Rationale**: TypeScript strict mode prevents runtime errors, improves code maintainability, and provides better developer experience. Type assertions undermine type safety and create hidden runtime risks in a mission-critical dashboard serving thousands of users.

### III. Complete Testing Coverage (NON-NEGOTIABLE)

Every utility function and custom hook MUST have comprehensive unit tests using Jest. React components MUST have Cypress component or integration tests. E2E tests MUST cover critical user workflows. Test files MUST follow the `.spec.ts` naming convention and be located in adjacent `__tests__` directories.

**Rationale**: Complete test coverage ensures stability and performance for a brownfield application used by thousands of users in production environments. Testing prevents regressions and enables confident refactoring.

### IV. Custom Hook Best Practices

Custom React hooks MUST follow strict patterns: 1) Clear input/output type definitions with strict typing, 2) Single responsibility principle - solve one goal that may compose other hooks, 3) Primitive values need not be memoized, objects MAY be memoized, functions sent out of hooks MUST always be memoized.

**Rationale**: Proper hook patterns prevent unnecessary re-renders, improve performance, and create predictable behavior patterns that other developers can rely on.

### V. Performance-First Architecture

All code MUST prioritize performance and stability due to the brownfield nature and thousands of active users. Bundle splitting MUST be used for federated modules. Components MUST implement proper memoization patterns. Network requests MUST be optimized with proper caching and error handling.

**Rationale**: Performance directly impacts user productivity in data science workflows. Slow interfaces reduce efficiency and create negative user experiences in enterprise environments.

## Module Federation Standards

All federated modules MUST implement proper error boundaries and fallback handling. Shared dependencies MUST be managed efficiently to prevent duplication. Module-to-module communication MUST use standardized event patterns. Route registration MUST be dynamic and properly scoped.

**Integration Requirements**: Modules MUST export standardized interfaces, implement proper cleanup mechanisms, and maintain compatibility with the host application's React 18 and PatternFly v6 dependencies.

## Code Quality Standards

ESLint configuration MUST be strictly enforced with zero warnings allowed. Pre-commit hooks MUST validate formatting, linting, and TypeScript compilation. Code reviews MUST verify PatternFly usage, test coverage, and performance considerations.

**Documentation Requirements**: All complex components MUST have inline documentation. API interfaces MUST be fully documented with TypeScript. Before completing tasks, agents MUST read `frontend/docs/generatedOverview.md` for context and `AGENTS.md` for specialized rules.

## Governance

This constitution supersedes all other development practices and conventions. All pull requests MUST demonstrate compliance with these principles. Performance optimizations MUST be justified with measurements. Breaking changes MUST include migration plans and backward compatibility strategies.

**Compliance Review**: Code reviews MUST verify adherence to PatternFly standards, TypeScript strict mode, testing requirements, and performance considerations. Any deviation MUST be explicitly justified and approved by architecture review.

**Spec Artifacts Location**: All spec-kit artifacts MUST be placed in `/frontend/.specify/specs` as this constitution was invoked from the frontend directory context.

**Agent Context**: Agents MUST consult `frontend/docs/generatedOverview.md` for comprehensive frontend overview and `AGENTS.md` for specialized agent rules when completing tasks.

**Version**: 1.0.0 | **Ratified**: 2025-02-17 | **Last Amended**: 2025-02-17