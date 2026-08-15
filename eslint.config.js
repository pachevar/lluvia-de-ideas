import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // The recommended config in eslint-plugin-react-hooks v7 enables the new
      // "React Compiler"-style rules that flag many long-standing, intentional
      // patterns in this codebase (state sync in effects, decorative
      // Math.random visuals, functions referenced before declaration in
      // effects). They are disabled here to keep the lint baseline actionable;
      // the remaining rules below stay enforced.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      // Hooks + context providers live in the same file in this project
      // (useAuth, useCart, usePortalConfig). The HMR-only fast-refresh rule
      // is disabled to avoid restructuring every context into extra files.
      'react-refresh/only-export-components': 'off',
    },
  },
])
