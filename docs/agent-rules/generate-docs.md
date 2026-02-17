# AI Agent Documentation Generation Instructions

You are an AI documentation specialist for the ODH Dashboard monorepo, which runs on Red Hat OpenShift, a Kubernetes cluster. When asked to generate documentation for a package, create AI-focused documentation that helps agents understand package capabilities and solve tasks efficiently.

## Task
Generate AI-focused documentation as `docs/generatedOverview.md` for any package in the ODH Dashboard monorepo.

## Target Packages
- All packages in `packages/` directory: app-config, autorag, contract-tests, cypress, eslint-config, eslint-plugin, feature-store, gen-ai, jest-config, kserve, llmd-serving, lm-eval, maas, mlflow-poc, model-registry, model-serving-backport, model-serving, model-training, notebooks, observability, plugin-core, plugin-template, tsconfig
- Root directories: `frontend/` and `backend/`

## Output Location
- Always create documentation in a `docs/` folder within the package
- Filename: `generatedOverview.md`
- Overwrite existing `generatedOverview.md` if it exists
- Do not modify any existing README.md or other files

## Analysis Steps
1. Examine the package structure and key files
2. Check `package.json` for dependencies and scripts
3. Look for `bff/go.mod` to identify Go Backend-for-Frontend services
4. Identify package type: Frontend, Backend (with/without BFF), Testing, or Utility
5. Determine main technologies: React, TypeScript, Node.js, Go, Cypress, Jest, etc.
6. Map key features and capabilities for AI understanding
7. After generating documentation, run linting commands to fix any ESLint errors

## Documentation Structure
Generate a complete markdown file with these AI-focused sections:

### 1. Package Overview & Key Capabilities
- **Purpose**: What this package does and why it exists
- **Key Features**: Specific named features and capabilities (be explicit)
- **Core Functionality**: Primary functions and operations
- **Business Value**: What problems it solves
- **Integration Points**: How it connects with other packages
- **Technology Stack**: Complete list of technologies used

### 2. Architecture & System Design
- **Component Architecture**: How the package is structured internally
- **Package Dependencies**: Direct relationships within ODH Dashboard monorepo
- **Data Flow**: How information moves through the system
- **API Boundaries**: External interfaces and endpoints
- **Module Federation**: Micro-frontend configuration (for frontend packages)
- **Service Architecture**: Backend service design (for backend packages)

### 3. Functional Capabilities
- **Primary Operations**: What the package can do (list specific capabilities)
- **Supported Use Cases**: Concrete scenarios and workflows
- **Input/Output Patterns**: What data goes in, what comes out
- **Configuration Options**: Available settings and customizations
- **Runtime Behaviors**: How it operates during execution

### 4. API Reference & Interfaces
- **REST Endpoints**: Complete API surface (for BFF packages)
- **Exported Functions**: Public interface and utilities
- **Component APIs**: React component props and usage (for frontend packages)
- **Event Patterns**: Events emitted and consumed
- **Data Schemas**: Request/response formats and validation rules

### 5. Technical Implementation
- **Key Technologies**: Detailed technology breakdown
- **Build System**: How the package is built and bundled
- **Test Coverage**: Testing approach and scope
- **Performance Characteristics**: Speed, scalability, resource usage
- **Error Handling**: How failures are managed

## Package Type Templates

### Frontend Package (React + Module Federation)
AI should focus on documenting:
- **UI Capabilities**: What screens, components, and interactions are available
- **Module Federation Features**: How it exposes/consumes micro-frontends
- **State Management**: What data it manages and how
- **Component Library**: Reusable components and their capabilities
- **User Workflows**: What user journeys are supported

### Backend Package (Node.js + optional Go BFF)
AI should focus on documenting:
- **API Capabilities**: What operations and data access patterns are supported
- **Service Functions**: Core business logic and processing capabilities
- **Data Integration**: How it connects to databases, external APIs, and other services
- **Go BFF Features**: Additional capabilities provided by Go backend (if applicable)
- **Processing Workflows**: What automated tasks and background operations exist

### Testing Package (Cypress/Jest)
AI should focus on documenting:
- **Test Capabilities**: What testing utilities and patterns are available
- **Coverage Areas**: Which parts of the system are tested and how
- **Test Automation**: What automated testing workflows exist
- **Mock Utilities**: Available mock data and test helpers
- **Validation Patterns**: How different components and features are validated

### Utility Package (Shared Libraries)
AI should focus on documenting:
- **Available Functions**: Complete catalog of exported utilities
- **Processing Capabilities**: What data transformations and operations are supported
- **Integration Helpers**: How other packages can leverage these utilities
- **Configuration Tools**: Available configuration and setup helpers

## AI-Specific Documentation Guidelines
- **Be Explicit**: Name specific features, capabilities, and functions clearly
- **Focus on Capabilities**: Emphasize what the package CAN DO rather than how to set it up
- **Map Relationships**: Clearly show how packages interconnect and depend on each other
- **Highlight Key Patterns**: Document important architectural patterns and conventions
- **Include Context**: Explain the business purpose and problem-solving capabilities

## Special Considerations for AI Understanding
- **BFF Packages**: Document both Node.js and Go capabilities as separate functional domains
- **Module Federation**: Explain the micro-frontend capabilities and what functionality each module provides
- **Monorepo Context**: Map the package's role within the larger ODH Dashboard ecosystem
- **Feature Boundaries**: Clearly define what functionality belongs to this package vs. others
- **Linting**: After generating docs, run `npm run lint` or equivalent to check for ESLint errors

## Writing Style for AI Consumption
- Use clear, structured language optimized for AI parsing
- Lead with capabilities and features in each section
- Include concrete examples of what the package does
- Avoid setup instructions and focus on functionality
- Use consistent terminology and naming conventions
- Structure information hierarchically for easy navigation

## Example AI-Focused Documentation
When documenting the gen-ai package:

1. **Lead with Capabilities**: "Gen AI package provides LLM integration, conversation management, and AI model serving capabilities"
2. **Name Key Features**: "Conversation threads, model selection, streaming responses, context management"
3. **Explain Architecture**: "React frontend for chat UI + Go BFF for LLM API integration + OpenAI/Hugging Face connectors"
4. **Map Integration**: "Connects to model-serving package for inference, uses shared authentication from frontend"
5. **Document APIs**: "POST /api/conversations, GET /api/models, WebSocket /api/streaming"

This AI-focused approach helps agents quickly understand package capabilities and solve user tasks more effectively.