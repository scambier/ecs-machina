module.exports = {
  name: 'ECS-Machina documentation',
  out: './docs/.vuepress/dist/api',
  tsconfig: 'tsconfig.json',
  target: 'es6',
  mode: 'file',
  ignoreCompilerErrors: true,
  includeDeclarations: false,
  exclude: [
    '**/__tests__/**/*',
    'src/debug/**/*'
  ],
  excludeNotExported: true,
  excludePrivate: true,
  excludeProtected: true,
  excludeExternals: true
}