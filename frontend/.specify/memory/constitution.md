<!--
Sync Impact Report:
- Version change: v1.1.0 → v1.1.1 (PATCH: added AGENTS.md reference and specialized agent rules guidance)
- Modified principles: Enhanced "Agent Development Guidance" section with AGENTS.md reference and specialized rules
- Added sections: None (enhanced existing section)
- Removed sections: None
- Templates requiring updates: ✅ All dependent templates validated
- Follow-up TODOs: None - all requirements incorporated
-->

# ODH Dashboard Constitution

## Core Principles

### I. TypeScript-First Development
All code MUST be written in TypeScript with strict type safety enabled. Type assertions are PROHIBITED under all circumstances. Functions and hooks MUST have explicit input and output types. Prefer proper type definitions over `any` or type assertions. Use discriminated unions and proper error handling patterns instead of forcing types.

**Rationale**: TypeScript provides compile-time safety crucial for a production dashboard serving thousands of users. Type assertions introduce runtime risks that can lead to production failures.

### II. PatternFly-First UI Components
All user interface components MUST use PatternFly v6 library components exclusively. Custom CSS variables are permitted ONLY as a last resort when PatternFly components cannot fulfill the requirement. Material UI components are allowed ONLY for Kubeflow mode compatibility. Maintain consistent UX patterns across all features.

**Rationale**: PatternFly ensures consistent Red Hat branding and accessibility compliance. Custom styling creates maintenance overhead and accessibility risks in an enterprise dashboard.

### III. Comprehensive Testing Coverage (NON-NEGOTIABLE)
Complete testing coverage is MANDATORY across all code layers: unit tests for utilities and hooks using Jest, Cypress component tests for UI interactions, and Cypress E2E tests for critical user workflows. Tests MUST be written before implementation where possible. All tests MUST run in isolation without dependencies on execution order. Mock data MUST be created within individual tests, not shared across tests.

**Rationale**: Production stability for thousands of users requires rigorous testing. The brownfield nature means changes can have wide-reaching impacts that only comprehensive testing can catch.

### IV. Performance and Stability Requirements
Code MUST prioritize performance and stability given the production scale of thousands of users. Implement proper memoization for React hooks (always memoize functions returned from hooks, optionally memoize objects, primitives don't need memoization). Use lazy loading, code splitting, and efficient data fetching patterns. Monitor bundle size and runtime performance metrics.

**Rationale**: Performance directly impacts user productivity in a dashboard environment. Poor performance compounds across thousands of concurrent users, affecting business operations.

### V. Custom Hook Standards
Custom React hooks MUST have clear input/output type definitions and solve a single, well-defined problem. Functions exported from hooks MUST always be memoized. Hook composition is encouraged to build complex functionality from simple, reusable hooks. Each hook MUST have comprehensive unit tests verifying both functionality and stability.

**Memoization Rules**: Primitives don't need to be memoized. Objects are optionally memoized. Always memoize functions you send out of your custom hooks. Internal hook logic must solve a single goal and may compose other custom hooks for that objective.

**Rationale**: Hooks are foundational building blocks in React applications. Poor hook design creates cascading re-render issues and maintenance problems across the entire application.

## Technology Standards

**Stack Requirements**: React 18 with TypeScript 5.8, PatternFly v6 for primary UI components, Webpack 5 with Module Federation for micro-frontend architecture. All dependencies MUST be kept current for security and performance.

**Code Quality**: ESLint and TypeScript strict mode MUST be enforced. Pre-commit hooks ensure code quality before commits. All code MUST pass linting and type checking without warnings or errors.

**Browser Compatibility**: Support modern browsers with automatic polyfill injection where needed. Target OpenShift Console integration requirements for enterprise environments.

**Deployment Context**: This is a frontend dashboard deployed on Red Hat OpenShift console serving a brownfield TypeScript project used by thousands of users.

## Development Workflow

**Feature Development**: Features MUST follow the established patterns in the codebase. Create reusable components in appropriate concept directories. Use established data fetching patterns and state management approaches.

**Testing Process**: Unit tests for all utilities and custom hooks using Jest, Cypress component tests for UI interactions, E2E tests for critical user workflows. Tests MUST be written for utilities and hooks. React components do not require unit tests but MUST have appropriate Cypress tests.

**Review Requirements**: All code changes require peer review focusing on type safety, performance implications, testing coverage, and PatternFly compliance. Breaking changes require additional architectural review.

**Documentation**: Code MUST be self-documenting through clear naming and TypeScript types. Complex business logic requires inline comments explaining the "why" not the "what".

## Agent Development Guidance

**Foundation Knowledge**: Agents working on any task MUST first read `AGENTS.md` in the root folder for specialized agent rules and repository overview. This provides essential context about the monorepo structure, available packages, and task-specific guidance.

**Frontend Context Understanding**: Agents working on frontend tasks MUST read `frontend/docs/generate-docs.md` for an overview of the frontend directory structure and capabilities to complete tasks faster and more accurately.

**Specialized Rules**: Before performing specific tasks, agents MUST read and follow the corresponding specialized rules from the `docs/agent-rules/` directory including documentation generation, Jira creation, contract tests, Cypress E2E tests, Cypress mock tests, and unit tests. Each task type has specific conventions and patterns that must be followed.

**Architecture Awareness**: Understand the micro-frontend Module Federation architecture and the relationship between the main frontend application and federated packages (gen-ai, model-registry, model-serving, etc.).

**Testing Alignment**: Follow the testing patterns established in `docs/testing.md` including proper test file naming (`.spec.ts`), directory structure (`__tests__`), and testing utilities usage.

## Governance

**Constitution Authority**: This constitution supersedes all other development practices and guidelines. Any conflicts between this document and other practices MUST be resolved in favor of this constitution.

**Amendment Process**: Constitution changes require documented justification, team consensus, and migration plan for existing code. All amendments MUST maintain backward compatibility where possible.

**Compliance Review**: All pull requests MUST demonstrate adherence to these principles. Reviewers MUST verify TypeScript strictness, PatternFly usage, testing coverage, and performance considerations.

**Quality Gates**: Automated CI/CD pipeline enforces linting, type checking, and test coverage thresholds. Failed quality gates block deployment to production environments.

**Exception Handling**: Deviations from these principles require documented technical justification and explicit approval. Emergency hotfixes may bypass normal processes but MUST be remediated within one sprint.

**Version**: 1.1.1 | **Ratified**: 2025-02-17 | **Last Amended**: 2025-02-17