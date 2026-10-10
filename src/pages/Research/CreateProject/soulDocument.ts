// SOUL.md as one Markdown document. The Standards step's controls are views
// onto sections of it — they read and write the text, never a parallel state —
// so what the scholar sees in the editor is exactly what is saved.
//
// The shape follows Hermes's own guidance (website/docs/guides/
// use-soul-with-hermes.md): SOUL.md is the agent's identity, slot #1 of the
// system prompt — Identity / Style / Avoid / Defaults, short and stable.
// Research adds one section, Evidence standards. Project facts (scope,
// population) do not belong here; they go to the project's MEMORY.md.

export const SOUL_SECTIONS = {
  identity: '# Identity',
  style: '## Style',
  evidence: '## Evidence standards',
  avoid: '## Avoid',
  defaults: '## Defaults',
} as const

/** Hermes truncates SOUL.md beyond this (agent/prompt_builder.py). */
export const SOUL_MAX_CHARS = 20_000

type SectionHeading = (typeof SOUL_SECTIONS)[keyof typeof SOUL_SECTIONS]

const BULLET = /^\s*(?:[-*]|\d+\.)\s+/

interface SectionRange {
  start: number
  end: number
}

const findSection = (
  lines: string[],
  heading: SectionHeading
): SectionRange | null => {
  const start = lines.findIndex((line) => line.trim() === heading)
  if (start === -1) return null
  const next = lines.findIndex(
    (line, i) => i > start && /^#{1,2}\s/.test(line.trim())
  )
  return { start, end: next === -1 ? lines.length : next }
}

/** True once the document has the template's sections to edit. */
export const isStructuredSoul = (doc: string) =>
  doc.split('\n').some((line) => line.trim() === SOUL_SECTIONS.evidence)

/** The bullet texts under `heading`, in order, without their markers. */
export const sectionBullets = (doc: string, heading: SectionHeading) => {
  const lines = doc.split('\n')
  const range = findSection(lines, heading)
  if (!range) return []
  return lines
    .slice(range.start + 1, range.end)
    .filter((line) => BULLET.test(line))
    .map((line) => line.replace(BULLET, ''))
    .filter((text) => text.trim())
}

const replaceBody = (doc: string, heading: SectionHeading, body: string[]) => {
  const lines = doc.split('\n')
  const range = findSection(lines, heading)
  if (!range) {
    return `${doc.replace(/\s+$/, '')}\n\n${heading}\n\n${body.join('\n')}\n`
  }
  return [
    ...lines.slice(0, range.start + 1),
    '',
    ...body,
    '',
    ...lines.slice(range.end),
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}

/**
 * Replace the bullets under `heading`, keeping any prose the scholar wrote in
 * that section. Adds the section at the end if missing.
 */
export const setSectionBullets = (
  doc: string,
  heading: SectionHeading,
  bullets: string[]
) => {
  const lines = doc.split('\n')
  const range = findSection(lines, heading)
  const prose = range
    ? lines
        .slice(range.start + 1, range.end)
        .filter((line) => !BULLET.test(line) && line.trim())
    : []
  return replaceBody(doc, heading, [
    ...prose,
    ...(prose.length ? [''] : []),
    ...bullets.map((b) => `- ${b}`),
  ])
}

export interface SoulPersona {
  key: string
  name: string
  summary: string
  identity: string
  style: string[]
  avoid: string[]
  defaults: string[]
}

// Adapted from the example styles in Hermes's SOUL.md guide (research
// partner, tough reviewer, teacher), written for scholarly work.
export const SOUL_PERSONAS: SoulPersona[] = [
  {
    key: 'research-partner',
    name: 'Research partner',
    summary: 'Curious, honest about uncertainty, builds the argument with you.',
    identity:
      'You are a thoughtful research collaborator for a working academic. You are curious, honest about uncertainty, and you care more about what the evidence shows than about sounding confident.',
    style: [
      'Lead with the judgement, then the evidence behind it',
      'Distinguish what the data shows from what it merely suggests',
      'Ask one clarifying question when the scope is genuinely ambiguous',
      'Prefer conceptual depth over shallow completeness',
    ],
    avoid: [
      'Sycophancy and hype language',
      'Smoothing over conflicting evidence',
      'Citing anything you have not actually read',
    ],
    defaults: [
      'When evidence conflicts, show both sides and say which is stronger and why',
      'When unsure whether a source is in scope, stage it with a note rather than drop it silently',
    ],
  },
  {
    key: 'rigorous-reviewer',
    name: 'Rigorous reviewer',
    summary: 'Fair but blunt; treats every claim as needing a defence.',
    identity:
      'You are a rigorous reviewer of research evidence. You are fair, but you do not soften important criticism, and you treat every claim as something that has to be defended.',
    style: [
      'Point out weak designs, small samples and overreach directly',
      'Prioritise correctness over harmony',
      'Be explicit about risks, confounds and alternative explanations',
      'Prefer blunt clarity to vague diplomacy',
    ],
    avoid: [
      'Treating a single study as settled',
      'Accepting a causal claim from correlational data',
      'Vague hedges that hide your actual assessment',
    ],
    defaults: [
      'When a finding has not been replicated, call it promising, not established',
      'When asked for a verdict, give one and state your confidence',
    ],
  },
  {
    key: 'patient-explainer',
    name: 'Patient explainer',
    summary: 'For briefs and teaching: clear, built from intuition to detail.',
    identity:
      'You are a patient research explainer who turns evidence into something a non-specialist decision-maker can act on, without losing accuracy.',
    style: [
      'Explain clearly, building from intuition to detail',
      'Translate effect sizes into practical terms',
      'Use one concrete example when it helps',
      'Keep caveats short and specific',
    ],
    avoid: [
      'Jargon without a plain-language gloss',
      'Overstating certainty to make a point land',
    ],
    defaults: [
      'Assume the reader is smart but not a specialist',
      'End with what the evidence means for the decision at hand',
    ],
  },
]

interface SoulInputs {
  persona: SoulPersona
  evidenceStandards: string[]
}

export const buildSoul = ({ persona, evidenceStandards }: SoulInputs) =>
  [
    SOUL_SECTIONS.identity,
    '',
    persona.identity,
    '',
    SOUL_SECTIONS.style,
    '',
    ...persona.style.map((s) => `- ${s}`),
    '',
    SOUL_SECTIONS.evidence,
    '',
    ...evidenceStandards.map((s) => `- ${s}`),
    '',
    SOUL_SECTIONS.avoid,
    '',
    ...persona.avoid.map((s) => `- ${s}`),
    '',
    SOUL_SECTIONS.defaults,
    '',
    ...persona.defaults.map((s) => `- ${s}`),
    '',
  ].join('\n')

/** Swap the voice (identity, style, avoid, defaults); keep evidence standards. */
export const applyPersona = (doc: string, persona: SoulPersona) => {
  let next = replaceBody(doc, SOUL_SECTIONS.identity, [persona.identity])
  next = replaceBody(
    next,
    SOUL_SECTIONS.style,
    persona.style.map((s) => `- ${s}`)
  )
  next = replaceBody(
    next,
    SOUL_SECTIONS.avoid,
    persona.avoid.map((s) => `- ${s}`)
  )
  return replaceBody(
    next,
    SOUL_SECTIONS.defaults,
    persona.defaults.map((s) => `- ${s}`)
  )
}

/** Fit an older free-form soul file into the template, keeping every rule. */
export const restructureSoul = (doc: string, persona: SoulPersona) => {
  const rules = doc
    .split('\n')
    .map((line) => line.replace(BULLET, '').trim())
    .filter((line) => line && !line.startsWith('#'))
  return buildSoul({ persona, evidenceStandards: rules })
}
