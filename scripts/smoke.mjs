import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const packageName = packageJson.name

function assert(condition, message) {
  if (!condition) throw new Error(`${packageName} smoke: ${message}`)
}

const requiredFiles = [
  'lib/index.js',
  'lib/client.js',
  'lib/types/index.d.ts',
  'lib/types/client/index.d.ts',
  'pics/conversation_view_tab.png',
  'pics/trajectory_system_prompt_detail_tab.png',
  'cordis.patch.yml',
  'src/client/InspectionView.tsx',
]
for (const file of requiredFiles) assert(existsSync(resolve(root, file)), `missing ${file}`)

const host = readFileSync(resolve(root, 'lib/index.js'), 'utf8')
const client = readFileSync(resolve(root, 'lib/client.js'), 'utf8')
const locales = readFileSync(resolve(root, 'src/client/locales.ts'), 'utf8')
const manifest = JSON.stringify(packageJson)
assert(!manifest.includes('dsh-client-web-react'), 'must not depend on dsh-client-web-react')
assert(!host.includes('dsh-client-web-react') && !client.includes('dsh-client-web-react'), 'bundle leaked dsh-client-web-react')
assert(host.includes('"dsh-system-prompt"'), 'host package identity is missing')
assert(client.includes('id: "dsh-system-prompt"'), 'client ModuleLoader id is missing')
assert(client.includes('conversation.view'), 'conversation session tab is missing')
assert(client.includes('dsh-system-prompt-trajectory-detail-section'), 'trajectory Section bridge is missing')
assert(/'trajectory.sections':\s*'组成部分'/.test(locales) && client.includes('t("trajectory.sections")'), 'trajectory Section translation is missing')
assert(host.includes('/dsh-system-prompt'), 'session RPC channel is missing')
assert(!Object.hasOwn(packageJson.exports, './invariant'), 'empty invariant must not be published')
assert(packageJson.files.includes('pics'), 'published README screenshots are missing')
const patch = readFileSync(resolve(root, 'cordis.patch.yml'), 'utf8')
assert(/- id: connection\s+inject: \[webRuntime, webServer\]/.test(patch), 'Web Connection requires webServer injection')
assert(host.includes('endpoint === "session"'), 'session endpoint is missing')
assert(!host.includes('endpoint === "global"'), 'session plugin must not expose a global endpoint')
assert(!client.includes('sidebar.footer.action'), 'session plugin must not register a sidebar action')
assert(client.includes('--dsh-trajectory-bottom-clearance'), 'trajectory panel must reserve composer clearance')
assert(packageJson.exports?.['./src/*'] === './src/*', 'source export is incomplete')
assert(packageJson.exports?.['./cordis.patch.yml'] === './cordis.patch.yml', 'patch export is incomplete')
assert(packageJson.dsh?.bundle?.patch === './cordis.patch.yml', 'bundle patch is incomplete')
assert(packageJson.scripts?.prepare === undefined, 'GitHub install must not require a prepare script')

console.log(`${packageName} smoke: ok`)
