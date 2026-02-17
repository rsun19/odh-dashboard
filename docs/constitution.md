# ODH Dashboard Development Constitution

This document establishes the core principles and best practices that all AI agents must follow when working on the ODH Dashboard codebase. These principles prioritize code quality, performance, stability, and user experience consistency in this mission-critical brownfield TypeScript project serving thousands of users on Red Hat OpenShift.

## Core Principles

### 1. Stability and Performance First
- **Performance is paramount**: This dashboard serves thousands of users in production environments
- **Brownfield awareness**: Respect existing patterns and architecture decisions
- **Zero tolerance for breaking changes**: Ensure all modifications maintain backward compatibility
- **Memory efficiency**: Optimize for minimal memory footprint and efficient garbage collection
- **Bundle size consciousness**: Avoid unnecessary dependencies and leverage code splitting

### 2. Type Safety and Code Quality
- **Strict TypeScript**: Never use type assertions (`as` keyword) under any circumstances
- **Complete type coverage**: All functions, hooks, and components must have explicit typing
- **Input/output definitions**: Clearly define interfaces for all data structures
- **Error handling**: Implement comprehensive error boundaries and graceful degradation
- **Code consistency**: Follow established patterns and naming conventions

### 3. User Experience Consistency
- **PatternFly v6 only**: Use exclusively PatternFly components for all UI elements
- **CSS variables last resort**: Avoid custom styling; use PatternFly design tokens
- **Accessibility first**: Ensure WCAG 2.1 AA compliance for all UI components
- **Responsive design**: Support all viewport sizes using PatternFly's responsive system
- **Performance perception**: Implement proper loading states and progressive enhancement

## Testing Standards

### Unit Testing Requirements
- **Complete coverage**: Aim for 100% test coverage on all utility functions and custom hooks
- **No component unit tests**: React components should be tested via Cypress component tests
- **Test structure**: Use `.spec.ts` files in `__tests__` directories adjacent to source code
- **Naming convention**: Follow `describe('<function name>')` and `it('should ...')` patterns
- **Mock safety**: Use `jest.mocked(...)` for type-safe mocks
- **Input variations**: Test all edge cases including null, undefined, empty strings, and boundary values
- **Exception testing**: Assert expected exceptions are thrown appropriately
- **Isolation**: Each test must run independently without dependencies on execution order

### Custom Hook Testing Principles
- **Stability testing**: Verify hooks return identical values for identical inputs
- **Lifecycle testing**: Test async operations and state updates using `testHook` utility
- **Update count assertions**: Monitor hook execution cycles with `hookToHaveUpdateCount`
- **Memoization verification**: Ensure functions are properly memoized before export
- **Rerender testing**: Validate hook behavior across multiple renders

### Cypress Testing Standards
- **E2E for workflows**: Test complete user journeys on live clusters
- **Mock for components**: Use mocked tests for individual component validation
- **Page objects pattern**: Encapsulate selectors and actions in reusable page objects
- **Test ID selectors**: Use `data-testid` attributes as primary selection method
- **Network interception**: Mock API calls with type-safe `interceptK8s` and `interceptOdh`
- **Accessibility testing**: Run `cy.testA11y()` for WCAG compliance verification

## Custom React Hook Standards

### 1. Clear Interface Definition
```typescript
// Required: Explicit input and output types
interface UseExampleHookParams {
  readonly id: string;
  readonly options?: ExampleOptions;
}

interface UseExampleHookReturn {
  readonly data: ExampleData | null;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly refetch: () => Promise<void>;
}

const useExampleHook = (params: UseExampleHookParams): UseExampleHookReturn => {
  // Implementation
};
```

### 2. Single Responsibility Principle
- Each hook must solve exactly one goal
- Compose multiple hooks for complex objectives
- Avoid feature creep within individual hooks
- Clear separation of concerns between data fetching, state management, and side effects

### 3. Memoization Guidelines
```typescript
const useExampleHook = (params: UseExampleHookParams): UseExampleHookReturn => {
  // Primitives: No memoization required
  const isValid = params.id.length > 0;
  
  // Objects: Optional memoization (when computationally expensive)
  const config = useMemo(() => ({
    endpoint: `/api/${params.id}`,
    timeout: params.options?.timeout ?? 5000,
  }), [params.id, params.options?.timeout]);
  
  // Functions: ALWAYS memoize before export
  const refetch = useCallback(async () => {
    // Implementation
  }, [params.id]);
  
  return { data, loading, error, refetch };
};
```

## Code Quality Enforcement

### Static Analysis
- **ESLint compliance**: Zero warnings or errors in ESLint output
- **TypeScript strict mode**: All code must pass strict TypeScript compilation
- **Prettier formatting**: Consistent code formatting using project standards
- **Import organization**: Proper import ordering and unused import removal

### Performance Requirements
- **Bundle analysis**: Regular bundle size monitoring and optimization
- **React DevTools**: Profile components for unnecessary re-renders
- **Memory leak prevention**: Proper cleanup of subscriptions and event listeners
- **Lazy loading**: Implement code splitting for large features

### Security Standards
- **No hardcoded secrets**: Use environment variables and secure configuration
- **Input sanitization**: Validate and sanitize all user inputs
- **XSS prevention**: Use React's built-in protections and avoid `dangerouslySetInnerHTML`
- **CSRF protection**: Implement proper token-based authentication

## Documentation Standards

### Code Documentation
- **Self-documenting code**: Clear variable and function names that explain intent
- **Complex logic comments**: Explain "why" not "what" for complex algorithms
- **API documentation**: Document all public interfaces and their expected behavior
- **Error scenarios**: Document all possible error states and recovery mechanisms

## Deployment and Operations

### Red Hat OpenShift Console Integration
- **Console compatibility**: Ensure seamless integration with OpenShift Console APIs
- **Resource efficiency**: Optimize for shared console environment
- **Error reporting**: Implement comprehensive error tracking and reporting
- **Feature flags**: Use feature toggles for safe progressive rollouts

### Production Readiness
- **Monitoring hooks**: Implement health checks and performance metrics
- **Graceful degradation**: Handle service failures without blocking user workflows
- **Rollback capability**: Ensure all changes can be quickly reverted
- **Load testing**: Validate performance under expected production load

## Enforcement

### Pre-commit Requirements
- All tests must pass (unit, component, and e2e where applicable)
- ESLint and TypeScript compilation must succeed
- Bundle size analysis must show no significant increases
- Accessibility tests must pass

---

*This constitution serves as the foundational guide for all development work on ODH Dashboard. Adherence to these principles ensures we maintain the high standards of quality, performance, and reliability that our users depend on.*