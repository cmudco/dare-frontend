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
      'What DARE provides to users and how the frontend fits into the Dietrich Analysis Research Education Platform.',
  },
  {
    from: path.join(backendRoot, 'docs', 'getting-started.md'),
    to: 'getting-started.mdx',
    title: 'Getting Started',
    description: 'Run the DARE platform locally and verify the core services.',
  },
  {
    from: path.join(frontendRoot, 'README.md'),
    to: 'frontend/index.mdx',
    title: 'Frontend Overview',
    description:
      'React, TypeScript, routing, state, and UI structure for the Dare frontend.',
  },
  {
    from: path.join(frontendRoot, 'INSTALL.md'),
    to: 'frontend/install.mdx',
    title: 'Frontend Installation',
    description:
      'Install, configure, build, and serve the frontend application.',
  },
  {
    from: path.join(frontendRoot, 'docs', 'configuration.md'),
    to: 'frontend/configuration.mdx',
    title: 'Frontend Configuration',
    description:
      'Vite environment variables and per-environment frontend settings.',
  },
  {
    from: path.join(frontendRoot, 'docs', 'architecture.md'),
    to: 'frontend/architecture.mdx',
    title: 'Frontend Architecture',
    description:
      'Component structure, routing, Redux, API layer, and Socket.IO integration.',
  },
  {
    from: path.join(frontendRoot, 'CONTRIBUTING.md'),
    to: 'frontend/contributing.mdx',
    title: 'Frontend Contributing',
    description: 'Frontend issue, pull request, and coding standards.',
  },
  {
    from: path.join(frontendRoot, 'docs', 'RULES.md'),
    to: 'frontend/rules.mdx',
    title: 'Frontend Rules',
    description:
      'Project-specific frontend development rules and API contract conventions.',
  },
  {
    from: path.join(backendRoot, 'docs', 'index.md'),
    to: 'backend/index.mdx',
    title: 'Backend Overview',
    description:
      'Backend documentation index for API, architecture, operations, and standards.',
  },
  {
    from: path.join(backendRoot, 'README.md'),
    to: 'backend/readme.mdx',
    title: 'Backend README',
    description: 'Django REST and Socket.IO backend overview.',
  },
  {
    from: path.join(backendRoot, 'INSTALL.md'),
    to: 'backend/install.mdx',
    title: 'Backend Installation',
    description:
      'Backend installation paths, service dependencies, deployment, and troubleshooting.',
  },
  {
    from: path.join(backendRoot, 'docs', 'admin-guide.md'),
    to: 'backend/admin-guide.mdx',
    title: 'Administrator Guide',
    description:
      'User management, access codes, model access, analytics, and operational tasks.',
  },
  {
    from: path.join(backendRoot, 'docs', 'configuration.md'),
    to: 'backend/configuration.mdx',
    title: 'Backend Configuration',
    description:
      'Django, Redis, database, provider key, MCP, and observability settings.',
  },
  {
    from: path.join(backendRoot, 'docs', 'architecture.md'),
    to: 'backend/architecture.mdx',
    title: 'Backend Architecture',
    description: 'Backend components, request flows, and key design patterns.',
  },
  {
    from: path.join(backendRoot, 'docs', 'architecture', 'overview.md'),
    to: 'backend/architecture-overview.mdx',
    title: 'System Architecture',
    description:
      'System diagrams, service responsibilities, real-time architecture, and data flows.',
  },
  {
    from: path.join(backendRoot, 'docs', 'architecture', 'data-flows.md'),
    to: 'backend/data-flows.mdx',
    title: 'Data Flows',
    description:
      'Chat, file upload, workflow execution, authentication, and artifact flow diagrams.',
  },
  {
    from: path.join(backendRoot, 'docs', 'architecture', 'socketio-events.md'),
    to: 'backend/socketio-events.mdx',
    title: 'Socket.IO Event Contract',
    description: 'Real-time event payloads for chat and workflow namespaces.',
  },
  {
    from: path.join(backendRoot, 'docs', 'serialization.md'),
    to: 'backend/serialization.mdx',
    title: 'Serialization Contract',
    description:
      'camelCase and snake_case conversion rules for frontend/backend boundaries.',
  },
  {
    from: path.join(backendRoot, 'docs', 'deployment', 'infrastructure.md'),
    to: 'backend/deployment-infrastructure.mdx',
    title: 'Deployment Infrastructure',
    description:
      'Production infrastructure notes and existing deployment scripts.',
  },
  {
    from: path.join(backendRoot, 'docs', 'deployment', 'procedures.md'),
    to: 'backend/deployment-procedures.mdx',
    title: 'Deployment Procedures',
    description:
      'Deployment order and procedures for the DARE and SocraticBooks services.',
  },
  {
    from: path.join(backendRoot, 'docs', 'code-standards.md'),
    to: 'backend/code-standards.mdx',
    title: 'Code Standards',
    description: 'Backend and frontend coding conventions.',
  },
  {
    from: path.join(backendRoot, 'docs', 'api', 'dare-backend.md'),
    to: 'backend/api-reference.mdx',
    title: 'Backend API Reference',
    description:
      'Human-readable REST API overview and links to interactive Swagger and Redoc.',
  },
  {
    from: path.join(backendRoot, 'BRAND.md'),
    to: 'reference/brand.mdx',
    title: 'Brand Usage',
    description: 'DARE brand and trademark usage policy.',
  },
  {
    from: path.join(frontendRoot, 'LICENSE'),
    to: 'reference/license.mdx',
    title: 'License',
    description: 'Full GNU Affero General Public License v3.0 text for DARE.',
    format: 'license',
  },
  {
    from: path.join(frontendRoot, 'SECURITY.md'),
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
    .replace(
      /SocraticBooks-DARE Proxy Contract/g,
      'SocraticBooks-DARE Proxy Contract (planned)'
    )
    .trim()
}

async function writePage(page) {
  const input = await readFile(page.from, 'utf8')
  const body =
    page.format === 'license'
      ? [
          'The DARE frontend and backend are licensed under the GNU Affero General Public License v3.0 (AGPL-3.0-only).',
          '',
          '## Full license text',
          '',
          '```text',
          input.trim(),
          '```',
        ].join('\n')
      : cleanMarkdown(input, page.from)
  const output = `${frontmatter(page)}${body}\n`
  const destination = path.join(contentRoot, page.to)

  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, output)
}

async function writeStaticPages() {
  await writeFile(
    path.join(contentRoot, 'index.mdx'),
    `---
title: "DARE Documentation"
description: "Client guides and technical references for the Dietrich Analysis Research Education Platform."
---

<div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-fd-card via-fd-card to-fd-muted p-8">
  <div className="dare-hero-grid absolute inset-0" />
  <div className="relative max-w-3xl">
    <p className="mb-3 text-sm font-medium uppercase tracking-wider text-fd-muted-foreground">
      Dietrich Analysis Research Education Platform
    </p>
    <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl">
      Product guides and technical references for <span className="dare-gradient-text">DARE</span>.
    </h2>
    <p className="text-lg text-fd-muted-foreground">
      Start with the platform overview, then move into frontend, backend, operations, and reference material.
    </p>
  </div>
</div>

## Start here

<Cards>
  <Card title="Getting Started" href="/docs/getting-started">
    Run the full platform locally and verify backend, workers, frontend, and API docs.
  </Card>
  <Card title="Platform Overview" href="/docs/platform-overview">
    Understand the app surface: conversations, RAG files, workflows, prompts, artifacts, and MCP.
  </Card>
  <Card title="API Reference" href="/docs/api-reference">
    Use the human API overview first, then jump into Swagger or Redoc when a backend is running.
  </Card>
</Cards>

## Core references

<Cards>
  <Card title="Frontend Architecture" href="/docs/frontend/architecture">
    React routes, Redux state, Socket.IO integration, API layer, and component organization.
  </Card>
  <Card title="Backend Architecture" href="/docs/backend/architecture">
    Django REST, Socket.IO, service boundaries, request flows, and backend design patterns.
  </Card>
  <Card title="Socket.IO Events" href="/docs/backend/socketio-events">
    Chat and workflow namespace contracts for real-time platform behavior.
  </Card>
</Cards>
`
  )

  await writeFile(
    path.join(contentRoot, 'api-reference.mdx'),
    `---
title: "API Reference"
description: "Human-maintained API entrypoint with links to the backend's interactive OpenAPI tools."
---

The docs portal does not use OpenAPI as the foundation. The first version keeps the API reference human-readable and points to the backend's existing interactive tools when the backend is running.

## Interactive API tools

- Swagger UI: [/api/docs/](/api/docs/)
- Redoc: [/api/redoc/](/api/redoc/)
- Raw OpenAPI schema: [/api/schema/](/api/schema/)

## API overview

Use the backend API reference for authentication, major endpoint groups, and documentation improvement notes:

<Cards>
  <Card title="Backend API Reference" href="/docs/backend/api-reference">
    REST API overview maintained from the backend documentation.
  </Card>
  <Card title="Serialization Contract" href="/docs/backend/serialization">
    camelCase and snake_case boundaries between REST responses and Python internals.
  </Card>
  <Card title="Socket.IO Event Contract" href="/docs/backend/socketio-events">
    Real-time events are documented separately from REST endpoints.
  </Card>
</Cards>
`
  )
}

async function writeMeta() {
  await writeFile(
    path.join(contentRoot, 'meta.json'),
    `${JSON.stringify(
      {
        title: 'DARE Docs',
        pages: [
          'index',
          '---Start Here---',
          'getting-started',
          'platform-overview',
          'api-reference',
          '---Technical Docs---',
          'frontend',
          'backend',
          '---Reference---',
          'reference',
        ],
      },
      null,
      2
    )}\n`
  )

  await mkdir(path.join(contentRoot, 'frontend'), { recursive: true })
  await writeFile(
    path.join(contentRoot, 'frontend', 'meta.json'),
    `${JSON.stringify(
      {
        title: 'Frontend',
        defaultOpen: true,
        pages: [
          'index',
          'install',
          'configuration',
          'architecture',
          'contributing',
          'rules',
        ],
      },
      null,
      2
    )}\n`
  )

  await mkdir(path.join(contentRoot, 'backend'), { recursive: true })
  await writeFile(
    path.join(contentRoot, 'backend', 'meta.json'),
    `${JSON.stringify(
      {
        title: 'Backend',
        defaultOpen: true,
        pages: [
          'index',
          'readme',
          'install',
          'admin-guide',
          'configuration',
          'architecture',
          'architecture-overview',
          'data-flows',
          'socketio-events',
          'serialization',
          'deployment-infrastructure',
          'deployment-procedures',
          'code-standards',
          'api-reference',
        ],
      },
      null,
      2
    )}\n`
  )

  await mkdir(path.join(contentRoot, 'reference'), { recursive: true })
  await writeFile(
    path.join(contentRoot, 'reference', 'meta.json'),
    `${JSON.stringify(
      {
        title: 'Reference',
        defaultOpen: true,
        pages: ['license', 'brand', 'security', 'changelog'],
      },
      null,
      2
    )}\n`
  )
}

await rm(contentRoot, { recursive: true, force: true })
await mkdir(contentRoot, { recursive: true })

await writeStaticPages()
await Promise.all(pages.map(writePage))
await writeMeta()

console.log(`Synced ${pages.length + 2} docs pages into ${contentRoot}`)
