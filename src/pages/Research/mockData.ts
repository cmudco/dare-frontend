// Illustrative mock data for the Research Workspace prototype.
// Topic: "What makes the Nordic model work?" — citations and findings below
// are fictional placeholders for demo purposes.

import type { AgentRun, SoulVirtue } from './types'

export const PROJECT = {
  title: 'What Makes the Nordic Model Work',
  question:
    'When does the Nordic high-tax, high-trust model produce strong outcomes — and which parts actually transfer to other economies?',
  scholar: 'Farhat Abbas',
  field: 'Political Economy · Comparative Public Policy',
}

export const ACTIVE_TOOLS = ['Consensus', 'Scite', 'Web search'] as const

export const SOUL_FILE = {
  version: 'v3',
  updated: '2 days ago',
  virtues: [
    {
      rank: 1,
      label: 'Never fabricate',
      note: 'Every statistic and citation must be real and checkable.',
    },
    {
      rank: 2,
      label: 'Signal uncertainty honestly',
      note: 'Separate what the data shows from what it merely suggests.',
    },
    {
      rank: 3,
      label: 'Do not overstate sources',
      note: 'A cross-country correlation is not proof of cause or transfer.',
    },
    {
      rank: 4,
      label: 'Separate values from evidence',
      note: 'Flag normative/ideological claims distinctly from empirical findings.',
    },
  ] satisfies SoulVirtue[],
}

// Delegated runs sent to the Hermes harness — the visible audit trail.
// Preview-only fallback in the canonical (API) shape; timestamps are relative to
// load time so the relative labels stay sensible.
const NOW = Date.now()
const ago = (ms: number): string => new Date(NOW - ms).toISOString()
const SECOND = 1000
const HOUR = 3_600_000
const DAY = 86_400_000

export const AGENT_RUNS: AgentRun[] = [
  {
    id: 3,
    role: 'scout',
    mode: 'scout',
    task: 'Mechanisms behind Nordic intergenerational mobility',
    status: 'running',
    statusDetail: '',
    soulFileVersion: 'v3',
    tools: ['consensus', 'scite'],
    stagedCount: 0,
    cost: 0,
    startedAt: ago(0),
    completedAt: null,
    ranAt: ago(0),
    hermesRunId: '',
    toolCalls: [
      {
        tool: 'consensus',
        query: 'social trust universal services intergenerational mobility',
        status: 'success',
        durationMs: 1600,
      },
    ],
  },
  {
    id: 2,
    role: 'critic',
    mode: 'scout',
    task: 'Pressure-test "high taxes cause Nordic growth" (claim in draft §2)',
    status: 'completed',
    statusDetail: '',
    soulFileVersion: 'v3',
    tools: ['scite'],
    stagedCount: 1,
    cost: 0.03,
    startedAt: ago(2 * HOUR + 26 * SECOND),
    completedAt: ago(2 * HOUR),
    ranAt: ago(2 * HOUR),
    hermesRunId: '',
    toolCalls: [
      {
        tool: 'scite',
        query: 'tax rate causal growth Nordic — supporting vs disputing',
        status: 'success',
        durationMs: 2200,
      },
    ],
  },
  {
    id: 1,
    role: 'scout',
    mode: 'scout',
    task: 'Flexicurity labour-market evidence and transferability',
    status: 'completed',
    statusDetail: '',
    soulFileVersion: 'v3',
    tools: ['consensus', 'web'],
    stagedCount: 4,
    cost: 0.1,
    startedAt: ago(DAY + 68 * SECOND),
    completedAt: ago(DAY),
    ranAt: ago(DAY),
    hermesRunId: '',
    toolCalls: [
      {
        tool: 'consensus',
        query: 'flexicurity Denmark employment security outcomes',
        status: 'success',
        durationMs: 1900,
      },
      {
        tool: 'web',
        query: 'OECD labour market security index Nordic',
        status: 'success',
        durationMs: 2500,
      },
    ],
  },
]

// What the agent proposes to remember — propose-only; the scholar accepts.
