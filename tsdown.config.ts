import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: 'esm',
  platform: 'node',
  target: 'node22',
  // 输出 lib/index.js 与 lib/index.d.ts（platform: 'node' 默认会输出 .mjs/.d.mts）。
  fixedExtension: false,
  dts: true,
  clean: true,
  deps: {
    // 关键：任何 node_modules 依赖都不打进产物。
    // cordis 与 dsh-* 必须由运行中的 dsh 安装提供 —— 把它们打进来会出现第二份
    // Context / Service 基类，插件将无法与宿主互通。
    neverBundle: true,
    dts: { neverBundle: true },
  },
})
