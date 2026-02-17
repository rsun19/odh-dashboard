# Generate Documentation Command

Generate comprehensive documentation for ODH Dashboard packages.

## Usage
```
/generate-docs [package-name]    # Generate docs for specific package
/generate-docs                  # Generate docs for ALL packages
```

## Examples
```
/generate-docs gen-ai           # Single package
/generate-docs cypress          # Single package  
/generate-docs frontend         # Single package
/generate-docs                  # ALL packages
```

## What This Does
- **With package name**: Generates documentation for the specified package
- **Without package name**: Generates documentation for ALL packages in the monorepo

Generates comprehensive documentation as `docs/generatedOverview.md` by:

1. Analyzing package structure and dependencies
2. Identifying package type (Frontend, Backend, Testing, Utility)
3. Detecting technologies (React, TypeScript, Go BFF, etc.)
4. Creating tailored documentation with appropriate sections
5. Saving to `docs/generatedOverview.md` (overwrites if exists)

## Instructions
Follow the documentation generation guidelines in `/docs/agent-rules/generate-docs.md` to:

- Analyze the package structure and key files
- Check `package.json` for dependencies and scripts  
- Look for `bff/go.mod` to identify Go Backend-for-Frontend services
- Determine package type and main technologies
- Generate complete documentation with sections for:
  - Package Overview
  - Architecture  
  - Prerequisites & Installation
  - Development Guide
  - API Reference (if applicable)
  - Testing
  - Project Structure
  - Contributing

## Output
Creates `{package}/docs/generatedOverview.md` with comprehensive documentation tailored to the package's specific needs and technologies.

## Available Packages
- **packages/**: app-config, autorag, contract-tests, cypress, eslint-config, eslint-plugin, feature-store, gen-ai, jest-config, kserve, llmd-serving, lm-eval, maas, mlflow-poc, model-registry, model-serving-backport, model-serving, model-training, notebooks, observability, plugin-core, plugin-template, tsconfig
- **root**: frontend, backend