module.exports = {
  "parser": "@typescript-eslint/parser",
  "env": {
    "browser": true,
    "node": true
  },
  // tell the TypeScript parser that we want to use JSX syntax
  "parserOptions": {
    "tsx": true,
    "jsx": true,
    "js": true,
    "useJSXTextNode": true,
    "project": ["./frontend/tsconfig.json", "./backend/tsconfig.json"],
    "tsconfigRootDir": __dirname
  },
  "plugins": [
    "@typescript-eslint",
    "react-hooks",
    "eslint-plugin-react-hooks",
    "import",
    "no-only-tests",
    "no-relative-import-paths",
    "prettier"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier"
  ],
  "globals": {
    "window": "readonly",
    "describe": "readonly",
    "test": "readonly",
    "expect": "readonly",
    "it": "readonly",
    "process": "readonly",
    "document": "readonly"
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      "typescript": {
        "project": __dirname
      }
    }
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "import/extensions": "off",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "import/no-unresolved": "off",
    "prettier/prettier": [
      "error",
      {
        "arrowParens": "always",
        "singleQuote": true,
        "trailingComma": "all",
        "printWidth": 100
      }
    ]
  },
  "overrides": [
    {
      "files": ["./backend/**"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off"
      }
    },
    {
      "files": ["./frontend/**"],
      "rules": {
        "jsx-a11y/no-autofocus": ["error", { "ignoreNonDOM": true }],
        "jsx-a11y/anchor-is-valid": [
          "error",
            {
              "components": ["Link"],
              "specialLink": ["to"],
              "aspects": ["noHref", "invalidHref", "preferButton"]
            }
        ],
        "react/jsx-boolean-value": "error",
        "react/jsx-fragments": "error",
        "react/jsx-no-constructed-context-values": "error",
        "react/no-unused-prop-types": "error",
        "arrow-body-style": "error",
        "curly": "error",
        "no-only-tests/no-only-tests": "error",
        "@typescript-eslint/default-param-last": "error",
        "@typescript-eslint/dot-notation": ["error", { "allowKeywords": true }],
        "@typescript-eslint/lines-between-class-members": [
          "error",
          "always",
          { "exceptAfterSingleLine": false }
        ],
        "@typescript-eslint/method-signature-style": "error",
        "@typescript-eslint/naming-convention": [
          "error",
          {
            "selector": "variable",
            "format": ["camelCase", "PascalCase", "UPPER_CASE"]
          },
          {
            "selector": "function",
            "format": ["camelCase", "PascalCase"]
          },
          {
            "selector": "typeLike",
            "format": ["PascalCase"]
          }
        ],
        "@typescript-eslint/no-unused-expressions": [
          "error",
          {
            "allowShortCircuit": false,
            "allowTernary": false,
            "allowTaggedTemplates": false
          }
        ],
        "@typescript-eslint/no-redeclare": "error",
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/return-await": ["error", "in-try-catch"],
        "camelcase": "warn",
        "no-else-return": ["error", { "allowElseIf": false }],
        "eqeqeq": ["error", "always", { "null": "ignore" }],
        "react/jsx-curly-brace-presence": [2, { "props": "never", "children": "never" }],
        "no-restricted-imports": [
        "error",
          {
            "patterns": [
              {
                "group": ["~/api/**"],
                "message": "Read from '~/api' instead."
              },
              {
                "group": ["~/components/table/**", "!~/components/table/useTableColumnSort"],
                "message": "Read from '~/components/table' instead."
              },
              {
                "group": ["~/concepts/area/**"],
                "message": "Read from '~/concepts/area' instead."
              },
              {
                "group": ["~/components/table/useTableColumnSort"],
                "message": "The data will be sorted in the table, don't use this hook outside of '~/components/table' repo. For more information, please check the props of the Table component."
              }
            ]
          }
        ],
        "object-shorthand": ["error", "always"],
        "no-console": "error",
        "no-param-reassign": [
        "error",
          {
            "props": true,
            "ignorePropertyModificationsFor": ["acc", "e"],
            "ignorePropertyModificationsForRegex": ["^assignable[A-Z]"]
          }
        ],
        "@typescript-eslint/no-base-to-string": "error",
        "@typescript-eslint/no-unused-vars": "error",
        "react/self-closing-comp": "error",
        "@typescript-eslint/no-unnecessary-condition": "error",
        "react-hooks/exhaustive-deps": "error",
        "prefer-destructuring": [
          "error",
          {
            "VariableDeclarator": {
              "array": false,
              "object": true
            },
            "AssignmentExpression": {
              "array": true,
              "object": false
            }
          },
          {
            "enforceForRenamedProperties": false
          }
        ],
        "react-hooks/rules-of-hooks": "error",
        "import/order": [
        "error",
          {
            "pathGroups": [
            {
                "pattern": "~/**",
                "group": "external",
                "position": "after"
            }
            ],
            "pathGroupsExcludedImportTypes": ["builtin"],
            "groups": [
            "builtin",
            "external",
            "internal",
            "index",
            "sibling",
            "parent",
            "object",
            "unknown"
            ]
          }
        ],
        "no-restricted-properties": [
          "error",
          {
            "object": "Promise",
            "property": "allSettled",
            "message": "Avoid using Promise.allSettled, use allSettledPromises utility function instead."
          },
          {
            "property": "sort",
            "message": "Avoid using .sort, use .toSorted instead."
          }
        ],
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "import/no-named-as-default": "error",
        "import/no-extraneous-dependencies": [
        "error",
          {
            "devDependencies": true,
            "optionalDependencies": true
          }
        ],
        "no-relative-import-paths/no-relative-import-paths": [
        "warn",
          {
            "allowSameFolder": true,
            "rootDir": "src",
            "prefix": "~"
          }
        ],
        "react/prop-types": "off",
        "array-callback-return": ["error", { "allowImplicit": true }],
        "prefer-template": "error",
        "no-lone-blocks": "error",
        "no-lonely-if": "error",
        "no-promise-executor-return": "error",
        "no-restricted-globals": [
          "error",
          {
            "name": "isFinite",
            "message": "Use Number.isFinite instead https://github.com/airbnb/javascript#standard-library--isfinite"
          },
          {
            "name": "isNaN",
            "message": "Use Number.isNaN instead https://github.com/airbnb/javascript#standard-library--isnan"
          }
        ],
          "no-sequences": "error",
          "no-undef-init": "error",
          "no-unneeded-ternary": ["error", { "defaultAssignment": false }],
          "no-useless-computed-key": "error",
          "no-useless-return": "error",
          "symbol-description": "error",
          "yoda": "error",
          "func-names": "warn"
      }
    },
    {
      "files": ["./frontend/src/api/**"],
      "rules": {
        "no-restricted-imports": [
          "off",
          {
            "patterns": ["~/api/**"]
          }
        ]
      }
    },
    {
      "files": ["./frontend/src/__tests__/cypress/**/*.ts"],
      "parserOptions": {
        "project": ["./frontend/src/__tests__/cypress/tsconfig.json"]
      },
      "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
        "prettier",
        "plugin:cypress/recommended"
      ],
      "overrides": [
        {
          "files": ["./frontend/src/__tests__/cypress/cypress/pages/*.ts", "./frontend/src/__tests__/cypress/cypress/tests/e2e/*.ts"],
          "rules": {
            "no-restricted-syntax": [
              "error",
              {
                "selector": "CallExpression[callee.property.name='visit'][callee.object.name='cy']",
                "message": "Use `cy.visitWithLogin` in page objects and e2e tests instead of `cy.visit`."
              }
            ]
          }
        }
      ]
    },
    {
      "files": ["./frontend/**/*.ts", "./frontend/**/*.tsx"],
      "excludedFiles": ["./frontend/src/__mocks__/**", "./frontend/src/__tests__/**"],
      "rules": {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "Literal[value=/\\bRed Hat OpenShift AI\\b/i],JSXText[value=/\\bRed Hat OpenShift AI\\b/i]",
            "message": "Do not hard code product name `Red Hat OpenShift AI`. Use `~/utilities/const#ODH_PRODUCT_NAME` instead."
          },
          {
            "selector": "Literal[value=/\\bOpen Data Hub\\b/i],JSXText[value=/\\bOpen Data Hub\\b/i]",
            "message": "Do not hard code product name `Open Data Hub`. Use `~/utilities/const#ODH_PRODUCT_NAME` instead."
          }
        ]
      }
    }
  ]
}