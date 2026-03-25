/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import stylisticPlugin from '@stylistic/eslint-plugin';
import headerPlugin, { HeaderOptions, HeaderRuleConfig } from '@tony.ganchev/eslint-plugin-header';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importSortPlugin from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

export default defineConfig([
    {
        ignores: ['dist', 'node_modules'],
    },
    stylisticPlugin.configs.customize({
        braceStyle: '1tbs',
        indent: 4,
        quotes: 'single',
        semi: true,
        arrowParens: true,
        quoteProps: 'as-needed',
    }),
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
            '@stylistic': stylisticPlugin,
            '@tony.ganchev/header': headerPlugin,
            '@typescript-eslint': tsPlugin as unknown as ESLint.Plugin,
            import: importPlugin,
            'react-hooks': reactHooks as unknown as ESLint.Plugin,
            'react-refresh': reactRefresh,
            'simple-import-sort': importSortPlugin,
        },
        rules: {
            ...reactHooks.configs.flat.recommended.rules,
            ...tsPlugin.configs.recommended.rules,
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'variable',
                    format: [
                        'camelCase',
                        // React is disgusting!
                        'PascalCase',
                    ],
                },
                {
                    selector: 'function',
                    format: [
                        'camelCase',
                        // React is disgusting!
                        'PascalCase',
                    ],
                },
                {
                    selector: 'enumMember',
                    format: ['camelCase'],
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
            ],
            '@stylistic/operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
            '@stylistic/max-len': [
                'error',
                {
                    code: 120,
                    comments: 80,
                },
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
                                template: ' * @copyright 2026 Tony Ganchev',
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
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-duplicates': 'error',
        },
    },
]);
