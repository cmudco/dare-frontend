// Illustrative mock data for the Research Workspace prototype.
// Citations and findings below are fictional placeholders for demo purposes.

import type {
  KnowledgeItem,
  MemorySnapshot,
  ReviewItem,
  SoulVirtue,
  SourceFile,
} from './types'

export const PROJECT = {
  title: 'Distributed Governance in AI Research',
  question:
    'When does institutional oversight strengthen rather than compromise researcher autonomy in AI-enabled studies?',
  scholar: 'Alex London',
  field: 'Philosophy · Bioethics · AI & Research Ethics',
}

export const ACTIVE_TOOLS = ['PubMed', 'Scite', 'Consensus'] as const

export const SOUL_FILE = {
  version: 'Alex v3',
  updated: '2 days ago',
  virtues: [
    {
      rank: 1,
      label: 'Never fabricate',
      note: 'Structural rule — agents cannot route around it.',
    },
    {
      rank: 2,
      label: 'Signal uncertainty honestly',
      note: 'Flag what genuinely needs checking, not everything.',
    },
    {
      rank: 3,
      label: 'Do not overstate sources',
      note: 'A source that partially supports a claim is labelled as such.',
    },
    {
      rank: 4,
      label: 'Preserve ethical nuance',
      note: 'Respect for persons · beneficence · justice held in view.',
    },
  ] satisfies SoulVirtue[],
}

export const MEMORY: MemorySnapshot[] = [
  {
    id: 'm1',
    label: 'Working thesis',
    detail:
      'Oversight is autonomy-enhancing when it is participatory and reduces downstream coercion.',
    capturedAt: 'Captured last session',
  },
  {
    id: 'm2',
    label: 'Open question',
    detail:
      'Need to pin down the scope of IRB authority over post-deployment model monitoring.',
    capturedAt: 'Flagged 3 days ago',
  },
]

export const SOURCE_FILES: SourceFile[] = [
  {
    id: 'f1',
    name: 'London_2023_Collaborative_Governance.pdf',
    kind: 'Journal article',
    pages: 24,
    addedAt: 'Added last week',
  },
  {
    id: 'f2',
    name: 'NASEM_Research_Oversight_Report.pdf',
    kind: 'Report',
    pages: 188,
    addedAt: 'Added last week',
  },
  {
    id: 'f3',
    name: 'Belmont_Report_annotated.pdf',
    kind: 'Primary source',
    pages: 10,
    addedAt: 'Added this month',
  },
]

// Pre-seeded approved knowledge so the Project Knowledge view is not empty
// on first load — demonstrates that rationale + confidence travel with a source.
export const SEED_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: 'k1',
    title:
      'Participatory Oversight and the Preservation of Researcher Autonomy',
    authors: 'London, A.',
    venue: 'Journal of Research Ethics',
    year: 2023,
    url: 'https://doi.org/10.0000/jre.2023.0142',
    toolSource: 'Library',
    whyItMatters:
      'Grounds the core claim that participatory oversight is autonomy-enhancing.',
    rationale:
      'Directly argues that oversight mechanisms designed with researcher participation tend to strengthen, rather than erode, autonomy — the central tension of this project.',
    confidence: 94,
    confidenceRationale: 'Author match + cited in your prior work.',
    citationSignal: 'supporting',
    citationContext:
      '"...governance that is co-designed with investigators expands rather than constrains the space of responsible choice."',
    provenance: {
      tool: 'Library',
      retrievedAt: 'Approved last week',
      retrievalDepth: 'Full text',
      soulFileVersion: 'Alex v3',
    },
    status: 'approved',
    usedIn: ['Section 2.1 — Framing', 'Section 4 — Argument'],
  },
]

// Candidate sources Scout "returns" when the researcher runs it.
export const SCOUT_CANDIDATES: ReviewItem[] = [
  {
    id: 's1',
    title: 'Institutional Review and Investigator Discretion: A Reassessment',
    authors: 'Mensah, R.; Alvarez, P.',
    venue: 'Bioethics Quarterly',
    year: 2024,
    url: 'https://doi.org/10.0000/bq.2024.0091',
    toolSource: 'PubMed',
    whyItMatters:
      'Empirical evidence that well-scoped review boards increase, not reduce, investigator discretion.',
    rationale:
      'Surveys 340 investigators and finds that clarity of oversight scope correlates with a stronger felt sense of autonomy. Provides the empirical leg your largely conceptual argument currently lacks.',
    confidence: 91,
    confidenceRationale:
      'Strong topical overlap; co-cited with London (2023) in 6 papers.',
    citationSignal: 'supporting',
    citationContext:
      '"Investigators reported greater confidence in their own judgement where the boundaries of review were explicit and predictable."',
    provenance: {
      tool: 'PubMed',
      retrievedAt: 'Just now',
      retrievalDepth: 'Title + abstract + full-text snippet',
      soulFileVersion: 'Alex v3',
    },
    status: 'pending',
  },
  {
    id: 's2',
    title: 'The Bureaucratic Drag of Ethics Review',
    authors: 'Okonkwo, T.',
    venue: 'Science & Society',
    year: 2022,
    url: 'https://doi.org/10.0000/ss.2022.0210',
    toolSource: 'Scite',
    whyItMatters:
      'Argues the opposite — that oversight systematically erodes autonomy. Worth engaging directly.',
    rationale:
      'Presents the strongest version of the counter-position. Engaging it head-on would harden your argument rather than letting a reviewer raise it later.',
    confidence: 78,
    confidenceRationale:
      'High relevance but opposing stance; Scite shows mostly disputing citations.',
    citationSignal: 'disputing',
    citationContext:
      '"Each layer of review displaces a decision the researcher was once trusted to make alone."',
    provenance: {
      tool: 'Scite',
      retrievedAt: 'Just now',
      retrievalDepth: 'Title + abstract + citation context',
      soulFileVersion: 'Alex v3',
    },
    status: 'pending',
  },
  {
    id: 's3',
    title: 'Post-Deployment Monitoring of Clinical AI: Who Holds Authority?',
    authors: 'Reyes, M.; Two, K.; Halvorsen, J.',
    venue: 'npj Digital Medicine',
    year: 2025,
    url: 'https://doi.org/10.0000/npjdm.2025.0033',
    toolSource: 'Consensus',
    whyItMatters:
      'Speaks to your open question on the scope of IRB authority after deployment.',
    rationale:
      'Maps current ambiguity in who governs models once they are in clinical use. Relevant to your flagged open question, though it is descriptive rather than normative.',
    confidence: 69,
    confidenceRationale:
      'Adjacent topic; Consensus rates the field consensus as "emerging / mixed".',
    citationSignal: 'tangential',
    citationContext:
      '"Authority over a deployed model is presently shared, contested, and rarely specified in advance."',
    provenance: {
      tool: 'Consensus',
      retrievedAt: 'Just now',
      retrievalDepth: 'Title + abstract',
      soulFileVersion: 'Alex v3',
    },
    status: 'pending',
  },
  {
    id: 's4',
    title: 'Co-Designing Governance: Lessons from Multi-Site Research Networks',
    authors: 'Bianchi, L.; Osei, D.',
    venue: 'Research Policy',
    year: 2023,
    url: 'https://doi.org/10.0000/rp.2023.0457',
    toolSource: 'PubMed',
    whyItMatters:
      'Concrete cases where investigators helped design the oversight they work under.',
    rationale:
      'Three case studies of participatory governance design. Gives you grounded examples to anchor an otherwise abstract claim about co-design.',
    confidence: 85,
    confidenceRationale: 'Direct match on "co-design" + "governance" framing.',
    citationSignal: 'supporting',
    citationContext:
      '"Where networks invited investigators into rule-making, compliance and trust rose together."',
    provenance: {
      tool: 'PubMed',
      retrievedAt: 'Just now',
      retrievalDepth: 'Title + abstract + full-text snippet',
      soulFileVersion: 'Alex v3',
    },
    status: 'pending',
  },
]
