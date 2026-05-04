import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**', 'coverage/**', '**/test/**', 'apps/web/next-env.d.ts', 'apps/api/vitest.setup.ts', 'apps/api/src/get-carreras.js', 'apps/api/src/get-sectores.js',],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      unicorn,
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: true,
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
        },
      },
    },
    rules: {
      // Desactiva los que son falsos positivos por tRPC/TypeORM raw queries
      '@typescript-eslint/no-unsafe-assignment':    'off',
      '@typescript-eslint/no-unsafe-call':          'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return':        'off',

      // strict-boolean-expressions genera demasiado ruido con optional chaining
      '@typescript-eslint/strict-boolean-expressions': 'off',

      // any es necesario en tRPC/TypeORM raw queries y form handlers
      '@typescript-eslint/no-explicit-any':   'off',
      '@typescript-eslint/no-unused-vars':    ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      'no-console': 'off',  // desactiva globalmente
    },
  },
  {
    files: ['**/components/ui/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'warn',
    },
  },
  {
  // En tests, los mocks legítimamente usan any
  files: ['**/*.spec.ts', '**/*.test.ts', '**/vitest.setup.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any':   'off',
    '@typescript-eslint/no-unused-vars':    'off',  // mocks frecuentemente no se usan directamente
  },
},
  {
    // Backend NestJS — unicorn genera ruido con patrones de NestJS
    files: ['apps/api/**/*.ts'],
    rules: {
      'unicorn/no-static-only-class':        'off', // NestJS usa clases
      'unicorn/prefer-module':               'off', // CommonJS en NestJS
      'unicorn/prevent-abbreviations':       'off', // dto, req, res son estándar
    },
  },
);
