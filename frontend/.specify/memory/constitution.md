<!--
Sync Impact Report:
- Version change: v1.1.1 → v1.2.0 (MINOR: Enhanced testing standards, performance requirements, and agent guidance sections)
- Modified principles: 
  - Enhanced "Comprehensive Testing Coverage" with specific testing framework guidance and strict coverage requirements
  - Enhanced "Performance and Stability Requirements" with specific brownfield context and deployment constraints
  - Enhanced "Agent Development Guidance" with mandatory reading requirements and artifact location guidance
  - Enhanced "Technology Standards" with strict dependency and quality enforcement
- Added sections: Strengthened brownfield-specific guidance and OpenShift Console deployment context
- Removed sections: None
- Templates requiring updates: ✅ All dependent templates validated
- Follow-up TODOs: None - all requirements incorporated
-->

# ODH Dashboard Constitution

## Core Principles

### I. TypeScript-First Development (NON-NEGOTIABLE)
All code MUST be written in TypeScript with strict type safety enabled. Type assertions are PROHIBITED under all circumstances. Functions and hooks MUST have explicit input and output types. Prefer proper type definitions over `any` or type assertions. Use discriminated unions and proper error handling patterns instead of forcing types. All code MUST pass TypeScript strict mode validation without warnings or errors.

**Rationale**: TypeScript provides compile-time safety crucial for a production dashboard serving thousands of users. Type assertions introduce runtime risks that can lead to production failures in a brownfield environment where changes have wide-reaching impacts.

### II. PatternFly-First UI Components (NON-NEGOTIABLE)
All user interface components MUST use PatternFly v6 library components exclusively. Custom CSS variables are permitted ONLY as a last resort when PatternFly components cannot fulfill the requirement. Material UI components are allowed ONLY for Kubeflow mode compatibility. Maintain consistent UX patterns across all features. Custom styling creates technical debt and accessibility risks.

**Rationale**: PatternFly ensures consistent Red Hat branding and accessibility compliance required for OpenShift Console integration. Custom styling creates maintenance overhead and accessibility risks in an enterprise dashboard serving thousands of users.

### III. Comprehensive Testing Coverage (NON-NEGOTIABLE)
Complete testing coverage is MANDATORY across all code layers with specific framework requirements:
- **Unit Tests**: Jest for all utilities and custom hooks with 100% coverage target
- **Component Tests**: Cypress component tests for UI interactions and user workflows
- **E2E Tests**: Cypress end-to-end tests for critical user paths and integration scenarios
- **Test Isolation**: All tests MUST run independently without execution order dependencies
- **Mock Data**: Individual test mock creation, no shared test data across test suites
- **Test Structure**: Follow established patterns from `docs/agent-rules/` for consistent test organization

Tests MUST be written before or alongside implementation. All code changes require corresponding test updates.

**Rationale**: Production stability for thousands of users requires rigorous testing. The brownfield nature means changes can have cascading impacts that only comprehensive testing can detect and prevent.

### IV. Performance and Stability Requirements (NON-NEGOTIABLE)
Code MUST prioritize performance and stability given the production scale and brownfield context:
- **React Optimization**: Proper memoization patterns (always memoize functions from hooks, optionally memoize objects, primitives don't need memoization)
- **Bundle Management**: Lazy loading, code splitting, and efficient Module Federation patterns
- **Performance Monitoring**: Bundle size tracking and runtime performance metrics
- **Memory Management**: Proper cleanup of event listeners, intervals, and React effects
- **Error Boundaries**: Comprehensive error handling to prevent cascading failures
- **Deployment Context**: Optimized for Red Hat OpenShift Console integration requirements

**Rationale**: Performance directly impacts user productivity in a dashboard environment. Poor performance compounds across thousands of concurrent users in enterprise deployments, affecting business operations.

### V. Custom Hook Standards (NON-NEGOTIABLE)
Custom React hooks MUST follow strict development standards:
- **Type Safety**: Clear input/output type definitions with strict TypeScript compliance
- **Single Responsibility**: Each hook solves one well-defined problem and may compose other hooks
- **Memoization Rules**: 
  - Primitives: No memoization needed
  - Objects: Optional memoization based on performance requirements
  - Functions: ALWAYS memoize functions returned from hooks
- **Testing Requirements**: Comprehensive unit tests for all custom hooks verifying functionality and performance
- **Hook Composition**: Encouraged for building complex functionality from simple, reusable building blocks

**Rationale**: Hooks are foundational building blocks in React applications. Poor hook design creates cascading re-render issues and maintenance problems across the entire brownfield application.

## Technology Standards

**Stack Requirements**: React 18 with TypeScript 5.8+, PatternFly v6 for primary UI, Webpack 5 with Module Federation for micro-frontend architecture. All dependencies MUST be kept current for security and performance in the enterprise environment.

**Code Quality Enforcement**: 
- ESLint and TypeScript strict mode MUST be enforced without exceptions
- Pre-commit hooks ensure code quality before commits
- All code MUST pass linting and type checking with zero warnings or errors
- Automated CI/CD quality gates block deployment on quality failures

**Browser Compatibility**: Support modern browsers with automatic polyfill injection. Target OpenShift Console integration requirements for enterprise environments with specific version compatibility.

**Deployment Context**: This is a frontend dashboard deployed on Red Hat OpenShift console serving a brownfield TypeScript project used by thousands of users in production environments.

## Development Workflow

**Feature Development**: Features MUST follow established patterns in the brownfield codebase. Create reusable components in appropriate concept directories. Use established data fetching patterns and state management approaches consistent with existing architecture.

**Testing Process**: 
- Unit tests for all utilities and custom hooks using Jest
- Cypress component tests for UI interactions and complex workflows  
- E2E tests for critical user workflows and integration scenarios
- Tests MUST be written for utilities and hooks
- React components require appropriate Cypress tests but not Jest unit tests

**Review Requirements**: All code changes require peer review focusing on type safety, performance implications, testing coverage, PatternFly compliance, and alignment with brownfield architecture patterns.

**Documentation Standards**: Code MUST be self-documenting through clear naming and TypeScript types. Complex business logic requires inline comments explaining the "why" not the "what". Follow existing documentation patterns in the codebase.

## Agent Development Guidance

**Foundation Knowledge (MANDATORY)**: 
- Agents working on ANY task MUST first read `AGENTS.md` in the root folder for specialized agent rules, repository overview, and monorepo structure understanding
- Frontend-specific tasks require reading `frontend/docs/generate-docs.md` for comprehensive frontend directory structure and capabilities overview
- This foundational reading is NON-NEGOTIABLE for accurate and efficient task completion

**Specialized Rules Compliance**: Before performing specific tasks, agents MUST read and follow corresponding specialized rules from `docs/agent-rules/` including:
- Documentation generation patterns and standards
- Jira creation workflows and templates  
- Contract test development and validation
- Cypress E2E test creation and maintenance
- Cypress mock test patterns and organization
- Unit test standards and coverage requirements

**Artifact Location Requirements**: All spec-kit artifacts MUST be placed in the appropriate subdirectory (frontend, backend, or packages) based on the current working directory when the speckit command was first invoked.

**Architecture Awareness**: Understand the Module Federation micro-frontend architecture and relationships between the main frontend application and federated packages (gen-ai, model-registry, model-serving, maas, etc.).

**Testing Framework Alignment**: Follow testing patterns and conventions established in project documentation, including proper file naming conventions (`.spec.ts`), directory structure (`__tests__`), and testing utilities usage.

## Governance

**Constitution Authority**: This constitution supersedes all other development practices and guidelines. Any conflicts between this document and other practices MUST be resolved in favor of this constitution.

**Amendment Process**: Constitution changes require documented justification, team consensus, and migration plan for existing code. All amendments MUST maintain backward compatibility where possible and consider brownfield migration impacts.

**Compliance Review**: All pull requests MUST demonstrate adherence to these principles. Reviewers MUST verify TypeScript strictness, PatternFly usage, testing coverage, performance considerations, and alignment with brownfield architecture.

**Quality Gates**: Automated CI/CD pipeline enforces linting, type checking, and test coverage thresholds. Failed quality gates block deployment to production environments without exception.

**Exception Handling**: Deviations from these principles require documented technical justification and explicit approval from technical leadership. Emergency hotfixes may bypass normal processes but MUST be remediated within one sprint cycle.

**Version**: 1.2.0 | **Ratified**: 2025-02-17 | **Last Amended**: 2025-02-17