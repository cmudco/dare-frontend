// Illustrative mock data for the Research Workspace prototype.
// Topic: "What makes the Nordic model work?" — citations and findings below
// are fictional placeholders for demo purposes.

import type {
  AgentRun,
  KnowledgeItem,
  MemoryProposal,
  MemorySnapshot,
  ReviewItem,
  SoulVirtue,
  SourceFile,
} from './types'

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

export const MEMORY: MemorySnapshot[] = [
  {
    id: 'm1',
    label: 'Working thesis',
    detail:
      'Nordic outcomes come from a bundle — high social trust + universal services + "flexicurity" labour markets — not high tax rates alone.',
    capturedAt: 'Captured last session',
  },
  {
    id: 'm2',
    label: 'Open question',
    detail:
      'How much of the success is causal policy vs. pre-existing trust and homogeneity — and does the bundle transfer to large, diverse economies?',
    capturedAt: 'Flagged 3 days ago',
  },
]

export const SOURCE_FILES: SourceFile[] = [
  {
    id: 'f1',
    name: 'Esping-Andersen_Three_Worlds_of_Welfare_Capitalism.pdf',
    kind: 'Book chapter',
    pages: 38,
    addedAt: 'Added last week',
  },
  {
    id: 'f2',
    name: 'OECD_Survey_Nordic_Labour_Markets.pdf',
    kind: 'Report',
    pages: 142,
    addedAt: 'Added last week',
  },
  {
    id: 'f3',
    name: 'Flexicurity_Denmark_case_study.pdf',
    kind: 'Working paper',
    pages: 27,
    addedAt: 'Added this month',
  },
]

// Pre-seeded approved knowledge so the Project Knowledge view is not empty
// on first load — demonstrates that rationale + confidence travel with a source.
export const SEED_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: 'k1',
    title: 'The Three Worlds of Welfare Capitalism: A Comparative Frame',
    authors: 'Esping-Andersen, G.',
    venue: 'Princeton University Press',
    year: 1990,
    url: 'https://doi.org/10.0000/twwc.1990.001',
    toolSource: 'Library',
    whyItMatters:
      'Gives the typology that frames why the Nordic "social-democratic" regime differs in kind, not just degree.',
    rationale:
      'Establishes the comparative welfare-regime framework this project argues within — the baseline for distinguishing the Nordic bundle from liberal and conservative regimes.',
    confidence: 93,
    confidenceRationale: 'Foundational text; cited across the field.',
    citationSignal: 'supporting',
    citationContext:
      '"...regimes differ not merely in spending but in how they decommodify welfare and structure social solidarity."',
    provenance: {
      tool: 'Library',
      retrievedAt: 'Approved last week',
      retrievalDepth: 'Full text',
      soulFileVersion: 'v3',
    },
    status: 'approved',
    usedIn: ['Section 1 — Framing', 'Section 3 — Typology'],
  },
]

// Candidate sources Scout "returns" when the researcher runs it.
export const SCOUT_CANDIDATES: ReviewItem[] = [
  {
    id: 's1',
    title: 'Social Trust and Intergenerational Mobility Across OECD Economies',
    authors: 'Lindqvist, E.; Hassan, R.',
    venue: 'Journal of Comparative Economics',
    year: 2024,
    url: 'https://doi.org/10.0000/jce.2024.0142',
    toolSource: 'Consensus',
    whyItMatters:
      'Links high social trust + universal services to stronger mobility — the core "what works" mechanism.',
    rationale:
      'Panel across 28 OECD economies finds universal-service provision and social trust jointly predict mobility, beyond tax level alone. Supports the bundle thesis over the "high taxes" caricature.',
    confidence: 90,
    confidenceRationale:
      'Strong topical match; isolates mechanism rather than aggregate spend.',
    citationSignal: 'supporting',
    citationContext:
      '"Mobility gains track universal access and trust, not marginal tax rates per se."',
    provenance: {
      tool: 'Consensus',
      retrievedAt: 'Just now',
      retrievalDepth: 'Title + abstract + full-text snippet',
      soulFileVersion: 'v3',
    },
    status: 'pending',
  },
  {
    id: 's2',
    title: 'Was It the Welfare State? Pre-1950 Roots of Nordic Equality',
    authors: 'Bjørnsson, K.',
    venue: 'Scandinavian Economic History Review',
    year: 2023,
    url: 'https://doi.org/10.0000/sehr.2023.0210',
    toolSource: 'Scite',
    whyItMatters:
      'Argues the equality/trust predate the welfare state — so it may be culture/history, not policy. The strongest counter-position.',
    rationale:
      'Contends Nordic equality and trust were largely in place before the modern welfare state, implying limited transferability. Engaging it head-on hardens the argument against a reviewer raising it later.',
    confidence: 76,
    confidenceRationale:
      'High relevance but opposing causal story; Scite shows mostly disputing citations.',
    citationSignal: 'disputing',
    citationContext:
      '"The institutions arrived after the equality they are credited with producing."',
    provenance: {
      tool: 'Scite',
      retrievedAt: 'Just now',
      retrievalDepth: 'Title + abstract + citation context',
      soulFileVersion: 'v3',
    },
    status: 'pending',
  },
  {
    id: 's3',
    title: 'Tax Morale and Administrative Capacity in High-Tax States',
    authors: 'Okonkwo, T.; Sætre, M.',
    venue: 'Public Administration Review',
    year: 2022,
    url: 'https://doi.org/10.0000/par.2022.0091',
    toolSource: 'Library',
    whyItMatters:
      'Explains why high taxes are compliable in the Nordics — relevant to transfer, but descriptive.',
    rationale:
      'Maps the administrative capacity and tax-morale conditions that make high taxation sustainable. Useful background on the transfer question, though it is descriptive rather than causal.',
    confidence: 68,
    confidenceRationale:
      'Adjacent topic; informs feasibility, not the core causal claim.',
    citationSignal: 'tangential',
    citationContext:
      '"Compliance rests on perceived fairness and state capacity, not rates alone."',
    provenance: {
      tool: 'Library',
      retrievedAt: 'Just now',
      retrievalDepth: 'Title + abstract',
      soulFileVersion: 'v3',
    },
    status: 'pending',
  },
  {
    id: 's4',
    title: 'Flexicurity: Reconciling Labour-Market Flexibility and Security',
    authors: 'Madsen, P. K.',
    venue: 'Work, Employment and Society',
    year: 2023,
    url: 'https://doi.org/10.0000/wes.2023.0457',
    toolSource: 'Consensus',
    whyItMatters:
      'A concrete, transferable mechanism — Denmark’s flexicurity raised both employment and security.',
    rationale:
      'Case evidence that the flexicurity model decouples job security from employment security, a component that could plausibly transfer independently of culture.',
    confidence: 85,
    confidenceRationale: 'Direct match on a named, exportable mechanism.',
    citationSignal: 'supporting',
    citationContext:
      '"Security is attached to the worker, not the job — and employment held up through downturns."',
    provenance: {
      tool: 'Consensus',
      retrievedAt: 'Just now',
      retrievalDepth: 'Title + abstract + full-text snippet',
      soulFileVersion: 'v3',
    },
    status: 'pending',
  },
]

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
export const MEMORY_PROPOSALS: MemoryProposal[] = [
  {
    id: 'mp_1',
    role: 'Scout',
    content:
      'For this scholar, prioritise sources that isolate the mechanism (trust, flexicurity) over aggregate tax-rate comparisons.',
    proposedAt: 'From run · yesterday',
  },
  {
    id: 'mp_2',
    role: 'Paper Assistant',
    content:
      'Track the open question on causal-vs-cultural origins as a recurring claim to resolve.',
    proposedAt: 'From run · yesterday',
  },
]
