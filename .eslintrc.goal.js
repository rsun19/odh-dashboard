module.exports = {
  extends: './.eslintrc.js',
  rules: {
    'import/no-restricted-paths': [
      'warn',
      {
        zones: [
          {
            target: ['./frontend/src/!(pages|__tests__|__mocks__)/**/*', './src/*'],
            from: './frontend/src/pages/**/*',
            message:
              'Modules from `frontend/src/pages` may not be imported by modules outside of `frontend/src/pages`.',
          },
          {
            target: './frontend/src/api/**/*',
            from: ['./frontend/src/!(utilities|api)/**/*'],
            message: 'Modules in `frontend/src/api` may only import external modules from `frontend/src/utilities`.',
          },
          {
            target: './frontend/src/components/**/*',
            from: ['./frontend/src/!(utilities|components|images)/**/*'],
            message: 'Modules in `frontend/src/components` may only import external modules from `frontend/src/utilities``.',
          },
          {
            target: './frontend/src/utilities/**/*',
            from: ['./frontend/src/!(utilities)/**/*'],
            message: 'Modules in `frontend/src/utilities` may not import external modules',
          },
          {
            target: './frontend/src/typeHelpers.ts',
            from: './frontend/src/**/*',
            message: '`frontend/src/typeHelpers.ts` may not import external modules.',
          },
          {
            target: './frontend/src/types.ts',
            from: './frontend/src/**/*',
            message: '`frontend/src/types.ts` may not import external modules.',
          },
        ],
      },
    ],
  },
};
