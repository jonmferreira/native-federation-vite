// Leak guard: fails if sensitive files, secret patterns, or an unsafe publish
// set would reach git/npm. Runs in CI (on PR) and before publish.
// Dependency-free. Run: node scripts/guard.mjs
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const DENY_PATHS = [
  /(^|\/)CLAUDE\.md$/i,
  /(^|\/)AGENTS?\.md$/i,
  /(^|\/)_projeto(\/|$)/,
  /(^|\/)start-poc\./i,
  /(^|\/)START-POC\.md$/i,
  /(^|\/)\.env(\.|$)/,
  /\.(pem|key|p12|pfx)$/i,
  /(^|\/)id_rsa$/,
  /(^|\/)\.npmrc$/
]

const SECRET_PATTERNS = [
  [/ghp_[A-Za-z0-9]{36}/, 'GitHub personal access token'],
  [/gho_[A-Za-z0-9]{36}/, 'GitHub OAuth token'],
  [/github_pat_[A-Za-z0-9_]{60,}/, 'GitHub fine-grained token'],
  [/npm_[A-Za-z0-9]{36}/, 'npm token'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key id'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token']
]

// Only these may ship to npm (plus package.json, which npm always includes).
const ALLOWED_PUBLISH = [/^dist(\/|$)/, /^README\.md$/, /^LICENSE$/]

const problems = []
const files = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean)

// 1) Sensitive files must never be tracked.
for (const f of files) {
  if (DENY_PATHS.some((re) => re.test(f))) problems.push(`sensitive file tracked: ${f}`)
}

// 2) No secret-looking strings in tracked text files.
for (const f of files) {
  let content
  try {
    content = readFileSync(f, 'utf8')
  } catch {
    continue
  }
  for (const [re, label] of SECRET_PATTERNS) {
    if (re.test(content)) problems.push(`possible ${label} in ${f}`)
  }
}

// 3) Publish set must be restricted (missing `files` would ship the whole repo).
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (!Array.isArray(pkg.files) || pkg.files.length === 0) {
  problems.push('package.json has no "files" allowlist (npm would publish everything)')
} else {
  for (const entry of pkg.files) {
    if (!ALLOWED_PUBLISH.some((re) => re.test(entry))) {
      problems.push(`unexpected entry in package.json "files": ${entry}`)
    }
  }
}

if (problems.length) {
  console.error('✗ leak guard failed:')
  for (const p of problems) console.error('  - ' + p)
  process.exit(1)
}
console.log('✓ leak guard: clean (no sensitive files, secrets, or unsafe publish set)')
