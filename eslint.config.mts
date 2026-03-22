/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import headerPlugin, { HeaderOptions, HeaderRuleConfig } from '@tony.ganchev/eslint-plugin-header';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import { Linter } from 'eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
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
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules as Record<string, Linter.RuleEntry>,
      ...reactHooks.configs.recommended.rules as Record<string, Linter.RuleEntry>,
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
