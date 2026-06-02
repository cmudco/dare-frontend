/**
 * Source data for the Repositories section of the unified About page.
 *
 * DARE is not a monorepo — its code lives in two separate GitHub repositories
 * under the `cmudco` org. Kept here (mirroring the landing page's links.ts
 * convention) so the team can confirm / swap entries in one place.
 *
 * URLs and languages were verified against the live GitHub repos. Both repos'
 * GitHub `description` fields are currently empty, so the descriptions below are
 * authored from project knowledge. The `license` reflects each repo's actual
 * LICENSE file: AGPL-3.0, copyright Carnegie Mellon University.
 */
export interface RepoEntry {
  name: string
  role: 'Frontend' | 'Backend'
  url: string
  description: string
  tags: string[]
  language: string
  license: string
}

export const REPOS: RepoEntry[] = [
  {
    name: 'dare-frontend',
    role: 'Frontend',
    url: 'https://github.com/cmudco/dare-frontend',
    description:
      'React/TypeScript single-page app — the DARE console UI, real-time chat, file management, and workflow builder.',
    tags: ['TypeScript', 'React 18', 'Vite', 'Redux Toolkit', 'Tailwind CSS'],
    language: 'TypeScript',
    license: 'AGPL-3.0',
  },
  {
    name: 'dare-backend',
    role: 'Backend',
    url: 'https://github.com/cmudco/dare-backend',
    description:
      'Django REST API — multi-LLM orchestration, RAG / vector database, authentication, billing, and file processing.',
    tags: ['Python', 'Django REST', 'PostgreSQL', 'Redis', 'Vector DB'],
    language: 'Python',
    license: 'AGPL-3.0',
  },
]
