/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import headerPlugin, { HeaderOptions, HeaderRuleConfig } from '@tony.ganchev/eslint-plugin-header';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      '@tony.ganchev/header': headerPlugin,
      '@typescript-eslint': tsPlugin as unknown as ESLint.Plugin,
      'react-hooks': reactHooks as unknown as ESLint.Plugin,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@tony.ganchev/header/header': [
        'error',
        {
          header: {
            commentType: 'block',
            lines: [
              '*',
              {
                pattern: /^ \* @copyright \d{4} Tony Ganchev$/,
                template: ' * @copyright 2026 Tony Ganchev'
              },
              ' * @license MIT',
              ' *',
              ' * This source code is licensed under the MIT license found in the',
              ' * LICENSE.md file in the root directory of this source tree.',
              ' ',
            ],
          },
          trailingEmptyLines: {
            minimum: 2,
          },
        } as HeaderOptions,
      ] as HeaderRuleConfig,
    },
  },
]);
