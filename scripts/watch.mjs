// Rebuild the standalone plugin when its source changes.

import { spawn } from 'node:child_process'
import { readdirSync, statSync, watch } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const watched = [resolve(root, 'src'), resolve(root, 'scripts')]
let child
let queued = false
let timer
let builtStamp = ''

function sourceStamp() {
  const files = []
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) walk(path)
      else {
        const stat = statSync(path)
        files.push(`${path}:${stat.mtimeMs}:${stat.size}`)
      }
    }
  }
  for (const directory of watched) walk(directory)
  for (const path of [resolve(root, 'tsdown.config.ts'), resolve(root, 'tsconfig.json'), resolve(root, 'package.json')]) {
    const stat = statSync(path)
    files.push(`${path}:${stat.mtimeMs}:${stat.size}`)
  }
  return files.sort().join('|')
}

function runBuild() {
  if (child !== undefined) {
    queued = true
    return
  }
  const stamp = sourceStamp()
  if (stamp === builtStamp) return
  builtStamp = stamp
  child = spawn('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' })
  child.once('exit', (code, signal) => {
    child = undefined
    if (code !== 0 || signal !== null) builtStamp = ''
    if (queued) {
      queued = false
      runBuild()
    }
  })
}

function scheduleBuild() {
  if (timer !== undefined) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = undefined
    runBuild()
  }, 120)
}

const handles = watched.map(path => watch(path, { recursive: true }, scheduleBuild))
const stop = () => {
  for (const handle of handles) handle.close()
  if (timer !== undefined) clearTimeout(timer)
  child?.kill('SIGTERM')
}
process.once('SIGINT', () => { stop(); process.exit(130) })
process.once('SIGTERM', () => { stop(); process.exit(143) })

runBuild()
