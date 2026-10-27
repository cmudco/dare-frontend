import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const docsSite = path.resolve(here, '..')
const frontendRoot = path.resolve(docsSite, '..')
const backendRoot = path.resolve(frontendRoot, '..', 'dare-backend')
const contentRoot = path.join(docsSite, 'content', 'docs')

const pages = [
  {
    from: path.join(frontendRoot, 'README.md'),
    to: 'platform-overview.mdx',
    title: 'Platform Overview',
    description:
      'What the Dietrich Analysis Research Education (DARE) Platform provides and how its parts fit together.',
  },
  {
    from: path.join(backendRoot, 'docs', 'tutorials', 'getting-started.md'),
    to: 'tutorials/getting-started.mdx',
    title: 'Getting Started',
    description:
      'Run the backend, worker and frontend locally, create an account, and send a first chat.',
  },
  {
    from: path.join(backendRoot, 'docs', 'tutorials', 'quickstart.md'),
    to: 'tutorials/backend-quickstart.mdx',
    title: 'Backend Quick Start',
    description:
      'Run the backend alone: Docker one-command stack, or local Python in a venv.',
  },
  {
    from: path.join(frontendRoot, 'docs', 'tutorials', 'quickstart.md'),
    to: 'tutorials/frontend-quickstart.mdx',
    title: 'Frontend Quick Start',
    description:
      'Run the frontend locally: install, set two env vars, and start the dev server.',
  },
  {
    from: path.join(backendRoot, 'docs', 'tutorials', 'memory-walkthrough.md'),
    to: 'tutorials/memory-walkthrough.mdx',
    title: 'Memory Walkthrough',
    description:
      'A guided, in-browser tour of how chat memory is written and read.',
  },
  {
    from: path.join(backendRoot, 'docs', 'how-to', 'deploy.md'),
    to: 'how-to/deploy-backend.mdx',
    title: 'Deploy the Backend',
    description:
      'Production deployment with Docker or bare metal, upgrades, and rollback.',
  },
  {
    from: path.join(frontendRoot, 'docs', 'how-to', 'deploy.md'),
    to: 'how-to/deploy-frontend.mdx',
    title: 'Deploy the Frontend',
    description:
      'Build the static bundle and serve dist/, with an optional Docker recipe.',
  },
  {
    from: path.join(backendRoot, 'docs', 'how-to', 'administer-dare.md'),
    to: 'how-to/administer-dare.mdx',
    title: 'Administer DARE',
    description:
      'Users, roles, access codes, model groups, analytics, and operational tasks.',
  },
  {
    from: path.join(backendRoot, 'docs', 'how-to', 'deploy-research-mode.md'),
    to: 'how-to/deploy-research-mode.mdx',
    title: 'Deploy Research Mode',
    description:
      'Run research mode agents on a Hermes host and connect it to DARE.',
  },
  {
    from: path.join(backendRoot, 'docs', 'how-to', 'run-quillmark.md'),
    to: 'how-to/run-quillmark.mdx',
    title: 'Run the Quillmark Renderer',
    description:
      'Run the PDF document renderer locally and configure it for a deployment.',
  },
  {
    from: path.join(backendRoot, '.github', 'CONTRIBUTING.md'),
    to: 'how-to/contribute-backend.mdx',
    title: 'Contribute to the Backend',
    description: 'Backend issues, pull requests, and review expectations.',
  },
  {
    from: path.join(frontendRoot, '.github', 'CONTRIBUTING.md'),
    to: 'how-to/contribute-frontend.mdx',
    title: 'Contribute to the Frontend',
    description: 'Frontend issues, pull requests, and review expectations.',
  },
  {
    from: path.join(backendRoot, 'docs', 'reference', 'configuration.md'),
    to: 'reference/backend-configuration.mdx',
    title: 'Backend Configuration',
    description:
      'Every backend environment variable, with type, default, and description.',
  },
  {
    from: path.join(frontendRoot, 'docs', 'reference', 'configuration.md'),
    to: 'reference/frontend-configuration.mdx',
    title: 'Frontend Configuration',
    description:
      'Vite environment variables and per-environment frontend settings.',
  },
  {
    from: path.join(backendRoot, 'docs', 'reference', 'rest-api.md'),
    to: 'reference/rest-api.mdx',
    title: 'REST API',
    description:
      'REST API overview, with links to the live Swagger UI, ReDoc and OpenAPI schema.',
  },
  {
    from: path.join(backendRoot, 'docs', 'reference', 'socketio-events.md'),
    to: 'reference/socketio-events.mdx',
    title: 'Socket.IO Events',
    description:
      'Real-time event payloads for the /chat and /workflow namespaces.',
  },
  {
    from: path.join(backendRoot, 'docs', 'reference', 'serialization.md'),
    to: 'reference/serialization.mdx',
    title: 'Serialization',
    description:
      'camelCase and snake_case rules at the frontend/backend boundary.',
  },
  {
    from: path.join(
      backendRoot,
      'docs',
      'reference',
      'socratic-bots-integration.md'
    ),
    to: 'reference/socratic-bots-integration.mdx',
    title: 'Socratic Bots Integration',
    description:
      'How Socratic Bots calls DARE, and the rules for changing that contract.',
  },
  {
    from: path.join(
      backendRoot,
      'docs',
      'reference',
      'non-chat-model-usage.md'
    ),
    to: 'reference/non-chat-model-usage.mdx',
    title: 'Non-chat Model Usage',
    description:
      'Every model call DARE makes outside the chat reply, and how each is chosen.',
  },
  {
    from: path.join(backendRoot, 'docs', 'reference', 'rules.md'),
    to: 'reference/backend-rules.mdx',
    title: 'Backend Rules',
    description: 'The engineering rules every backend change follows.',
  },
  {
    from: path.join(frontendRoot, 'docs', 'reference', 'rules.md'),
    to: 'reference/frontend-rules.mdx',
    title: 'Frontend Rules',
    description: 'The engineering rules every frontend change follows.',
  },
  {
    from: path.join(backendRoot, 'docs', 'explanation', 'architecture.md'),
    to: 'explanation/architecture.mdx',
    title: 'Platform Architecture',
    description:
      "The DARE platform, the backend's main parts, and the choices behind them.",
  },
  {
    from: path.join(frontendRoot, 'docs', 'explanation', 'architecture.md'),
    to: 'explanation/frontend-architecture.mdx',
    title: 'Frontend Architecture',
    description:
      'Component structure, routing, Redux, the API layer, and Socket.IO integration.',
  },
  {
    from: path.join(backendRoot, 'docs', 'explanation', 'data-flows.md'),
    to: 'explanation/data-flows.mdx',
    title: 'Data Flows',
    description:
      'Chat, file upload, workflow, authentication, and artifact sequences.',
  },
  {
    from: path.join(frontendRoot, 'docs', 'explanation', 'document-processing.md'),
    to: 'explanation/document-processing.mdx',
    title: 'Document Processing',
    description:
      'Basic and Advanced processing, vision models, and failed-image retries.',
  },
  {
    from: path.join(
      backendRoot,
      'docs',
      'explanation',
      'document-ingestion.md'
    ),
    to: 'explanation/document-ingestion.mdx',
    title: 'Document Ingestion',
    description:
      'How an upload becomes a verified search index, and how interrupted runs recover.',
  },
  {
    from: path.join(backendRoot, 'docs', 'explanation', 'tool-loop.md'),
    to: 'explanation/tool-loop.mdx',
    title: 'Tool Loop',
    description: 'How a chat turn calls tools across rounds and providers.',
  },
  {
    from: path.join(frontendRoot, 'docs', 'brand.md'),
    to: 'reference/brand.mdx',
    title: 'DARE Brand Guidelines & Usage Policy',
    description:
      'Version 0.1 of the Dietrich Analysis Research Education (DARE) Platform brand and usage policy.',
  },
  {
    from: path.join(frontendRoot, 'LICENSE'),
    to: 'reference/license.mdx',
    title: 'License',
    description: 'Full GNU Affero General Public License v3.0 text for DARE.',
    format: 'license',
  },
  {
    from: path.join(frontendRoot, '.github', 'SECURITY.md'),
    to: 'reference/security.mdx',
    title: 'Security Policy',
    description:
      'Supported versions, vulnerability reporting, safe harbor, and operator hardening.',
  },
  {
    from: path.join(frontendRoot, 'CHANGELOG.md'),
    to: 'reference/changelog.mdx',
    title: 'Frontend Changelog',
    description: 'Frontend release notes and documentation changes.',
  },
]

const sourceToUrl = new Map()
for (const page of pages) {
  const targetPath = path.resolve(page.from)
  sourceToUrl.set(
    targetPath,
    `/docs/${page.to.replace(/(^|\/)index\.mdx$/, '$1').replace(/\.mdx$/, '')}`.replace(
      /\/$/,
      ''
    )
  )
}
sourceToUrl.set(path.resolve(backendRoot, 'LICENSE'), '/docs/reference/license')

function frontmatter(page) {
  return [
    '---',
    `title: ${JSON.stringify(page.title)}`,
    `description: ${JSON.stringify(page.description)}`,
    '---',
    '',
  ].join('\n')
}

function stripFirstHeading(markdown) {
  return markdown.replace(/^# .+\n+/, '')
}

function resolveMarkdownLink(currentSource, target) {
  const [rawPath, hash = ''] = target.split('#')
  if (!rawPath) return target

  const resolved = path.resolve(path.dirname(currentSource), rawPath)
  const candidates = [
    resolved,
    resolved.endsWith('.md') ? resolved : `${resolved}.md`,
    path.join(resolved, 'index.md'),
  ]

  for (const candidate of candidates) {
    const url = sourceToUrl.get(candidate)
    if (url) return `${url}${hash ? `#${hash}` : ''}`
  }

  return null
}

function rewriteLinks(markdown, currentSource) {
  return markdown.replace(
    /(!?)\[([^\]]+)\]\(([^)]+)\)/g,
    (match, bang, label, target) => {
      if (bang) return match
      if (/^(https?:|mailto:|#|\/)/.test(target)) return match

      const rewritten = resolveMarkdownLink(currentSource, target)
      if (rewritten) return `[${label}](${rewritten})`

      return `\`${label.replace(/`/g, '')}\``
    }
  )
}

function escapeMdxAngles(markdown) {
  let inFence = false

  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence
        return line
      }

      if (inFence) return line

      return line.replace(/<([^>\n]+)>/g, (_, value) => `&lt;${value}&gt;`)
    })
    .join('\n')
}

function cleanMarkdown(markdown, currentSource) {
  return escapeMdxAngles(
    rewriteLinks(stripFirstHeading(markdown), currentSource)
  )
    .replace(/\]\((?:\.\/|\.\.\/)?LICENSE\)/g, '](/docs/reference/license)')
    .replaceAll('http://localhost:8000/api/docs/', '/api/docs/')
    .replaceAll('http://localhost:8000/api/redoc/', '/api/redoc/')
    .replaceAll('http://localhost:8000/api/schema/', '/api/schema/')
    .replaceAll('](../docs-site/public/brand/', '](/brand/')
    .trim()
}

function renderPage(page, input) {
  const body =
    page.format === 'license'
      ? [
          'The DARE frontend and backend are licensed under the GNU Affero General Public License v3.0 (AGPL-3.0-only).',
          '',
          'The software license and the [DARE Brand Guidelines & Usage Policy](/docs/reference/brand) are independent instruments. The software license governs the code; it does not grant rights to the DARE name or marks.',
          '',
          '## Full license text',
          '',
          '```text',
          input.trim(),
          '```',
        ].join('\n')
      : cleanMarkdown(input, page.from)
  return `${frontmatter(page)}${body}\n`
}

const indexPage = `---
title: "DARE Documentation"
description: "Guides and technical references for the Dietrich Analysis Research Education (DARE) Platform."
---

<div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-fd-card via-fd-card to-fd-muted p-8">
  <div className="dare-hero-grid absolute inset-0" />
  <div className="relative max-w-3xl">
    <p className="mb-3 text-sm font-medium uppercase tracking-wider text-fd-muted-foreground">Dietrich Analysis Research Education (DARE) Platform</p>
    <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl">Product guides and technical references for <span className="dare-gradient-text">DARE</span>.</h2>
    <p className="text-lg text-fd-muted-foreground">Pages are grouped by what you are trying to do: learn, get something done, look something up, or understand why.</p>
  </div>
</div>

<Cards>
  <Card title="Tutorials" href="/docs/tutorials/getting-started">
    Learn by doing. Start with Getting Started: run the platform locally and send a first chat.
  </Card>
  <Card title="How-to guides" href="/docs/how-to/deploy-backend">
    Reach a goal: deploy, administer, run research mode, contribute.
  </Card>
  <Card title="Reference" href="/docs/reference/backend-configuration">
    Look things up: configuration, REST API, Socket.IO events, rules.
  </Card>
  <Card title="Explanation" href="/docs/explanation/architecture">
    Understand why: architecture, data flows, document ingestion, the tool loop.
  </Card>
</Cards>
`

function section(title, pages) {
  return { title, defaultOpen: true, pages }
}

const meta = {
  'meta.json': {
    title: 'DARE Docs',
    pages: [
      'index',
      'platform-overview',
      'tutorials',
      'how-to',
      'reference',
      'explanation',
    ],
  },
  'tutorials/meta.json': section('Tutorials', [
    'getting-started',
    'backend-quickstart',
    'frontend-quickstart',
    'memory-walkthrough',
  ]),
  'how-to/meta.json': section('How-to guides', [
    'deploy-backend',
    'deploy-frontend',
    'administer-dare',
    'deploy-research-mode',
    'run-quillmark',
    'contribute-backend',
    'contribute-frontend',
  ]),
  'reference/meta.json': section('Reference', [
    'backend-configuration',
    'frontend-configuration',
    'rest-api',
    'socketio-events',
    'serialization',
    'socratic-bots-integration',
    'non-chat-model-usage',
    'backend-rules',
    'frontend-rules',
    'security',
    'license',
    'brand',
    'changelog',
  ]),
  'explanation/meta.json': section('Explanation', [
    'architecture',
    'frontend-architecture',
    'data-flows',
    'document-processing',
    'document-ingestion',
    'tool-loop',
  ]),
}

// A frontend-only clone has no sibling dare-backend: keep the committed pages as they are.
if (!existsSync(backendRoot)) {
  console.log(
    `docs:sync skipped: no dare-backend checkout at ${backendRoot}; committed docs are unchanged`
  )
  process.exit(0)
}

const missing = pages.filter((page) => !existsSync(page.from))
if (missing.length) {
  console.error(
    `docs:sync failed: missing sources (is ../dare-backend on an up-to-date branch?)\n${missing
      .map((page) => `  ${page.from}`)
      .join('\n')}`
  )
  process.exit(1)
}

const rendered = await Promise.all(
  pages.map(async (page) => [
    page.to,
    renderPage(page, await readFile(page.from, 'utf8')),
  ])
)

await rm(contentRoot, { recursive: true, force: true })
const files = [['index.mdx', indexPage], ...rendered]
for (const [name, value] of Object.entries(meta)) {
  files.push([name, `${JSON.stringify(value, null, 2)}\n`])
}
for (const [name, content] of files) {
  const destination = path.join(contentRoot, name)
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, content)
}

console.log(`Synced ${rendered.length + 1} docs pages into ${contentRoot}`)
