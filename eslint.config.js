import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['**/dist/**', '**/node_modules/**', 'data/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.node },
    rules: {
      // Conventions from AGENTS.md.
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'No enums. Use an `as const` array or object (see AGENTS.md).',
        },
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports (see AGENTS.md).',
        },
      ],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    extends: [reactHooks.configs.flat['recommended-latest'], reactRefresh.configs.vite],
  },
  {
    // Tools that require a default export.
    files: ['**/*.config.{js,ts}'],
    rules: { 'no-restricted-syntax': 'off' },
  },
);
