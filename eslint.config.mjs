import { fixupConfigRules } from '@eslint/compat'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
})

export default [
	{
		ignores: [
			'**/dist',
			'**/.eslintrc.cjs',
			'**/node_modules',
			'frontend/node_modules/',
			'backend/node_modules/',
			'**/.eslintrc.js',
			'**/.prettierrc',
		],
	},
	...fixupConfigRules(
		compat.extends(
			'eslint:recommended',
			'plugin:react/recommended',
			'plugin:react-hooks/recommended',
			'plugin:react/jsx-runtime',
			'plugin:prettier/recommended',
		),
	),
	{
		plugins: {
			'react-refresh': reactRefresh,
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},

			ecmaVersion: 'latest',
			sourceType: 'module',
		},

		settings: {
			react: {
				version: '18.2',
			},
		},

		rules: {
			'prettier/prettier': 'error',
			indent: ['error', 'tab'],
			'linebreak-style': ['error', 'windows'],
			quotes: ['error', 'single'],
			semi: ['error', 'never'],
			eqeqeq: 'error',
			'no-trailing-spaces': 'error',
			'object-curly-spacing': ['error', 'always'],
			'arrow-spacing': [
				'error',
				{
					before: true,
					after: true,
				},
			],
			'no-console': 0,
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'no-unused-vars': 'warn',
		},
	},
]
