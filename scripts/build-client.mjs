// Browser half build. The host half follows dsh-plugin-template's tsdown
// contract; Harness loads the client half as a ModuleLoader closure instead of
// a normal ESM package, so it has a small dedicated esbuild step.

import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const id = 'dsh-system-prompt'
const esbuild = await import('esbuild').catch(() =>
  import(resolve(root, 'node_modules/.pnpm/node_modules/esbuild/lib/main.js')),
)

mkdirSync(resolve(root, 'lib'), { recursive: true })
await esbuild.build({
  entryPoints: [resolve(root, 'src/client/index.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  outfile: resolve(root, 'lib/client.js'),
  external: ['@deepseek-ai/*', 'react', 'react/*', 'react-dom', 'react-dom/*'],
  sourcemap: true,
  loader: { '.css': 'text' },
  define: { 'process.env.NODE_ENV': '"production"' },
  banner: {
    js: `window.__ModuleLoader__.load({
  id: ${JSON.stringify(id)},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
`,
  },
  footer: { js: `
    return module.exports;
  },
});
` },
  logLevel: 'info',
})
