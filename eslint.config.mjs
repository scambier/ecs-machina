import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  {
    // Global ignores: https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores
    ignores: ['dist/**', 'build.js'],
    // DO NOT ADD ANYTHING ELSE IN THIS OBJECT
  },
  {
    files: ['**/*.{ts,js,mjs,cjs}'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      stylistic.configs.customize({
        indent: 2,
        quotes: 'single',
        semi: false,
      }),
    ],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/no-extraneous-class': 'error',
      'sort-imports': [
        'warn',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true,
        },
      ],

      // Style
      '@stylistic/object-curly-spacing': ['warn', 'always'],
      '@stylistic/array-bracket-newline': ['warn', 'consistent'],
      '@stylistic/operator-linebreak': ['error', 'after'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/max-statements-per-line': ['error', { max: 2 }],
      '@stylistic/comma-dangle': [
        'warn',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Files that you don't want to typecheck
    files: ['**/*.{mjs,cjs,js}'],
    extends: [tseslint.configs.disableTypeChecked],
  }
)
