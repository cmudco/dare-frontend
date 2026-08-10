/**
 * Sample memories
 *
 * Client-side demo data for exploring the Memory page design without a live
 * MemU/Postgres backend. Loaded into the store in sample mode; never persisted.
 */
import { MemoryType, type MemoryItem } from '@/redux/types/memory'

export const SAMPLE_MEMORIES: MemoryItem[] = [
  // Profile — semantic · hot
  {
    id: 'sample-profile-1',
    memoryType: MemoryType.PROFILE,
    content:
      'Maya is a PhD candidate in learning sciences at Carnegie Mellon, studying how students build intuition for complex systems.',
    categories: ['identity', 'research'],
    createdAt: '2026-06-02T14:10:00Z',
    updatedAt: '2026-07-28T09:30:00Z',
  },
  {
    id: 'sample-profile-2',
    memoryType: MemoryType.PROFILE,
    content:
      'Prefers direct, compact answers first, with the reasoning available underneath — not the other way around.',
    categories: ['communication'],
    createdAt: '2026-06-05T16:42:00Z',
  },
  {
    id: 'sample-profile-3',
    memoryType: MemoryType.PROFILE,
    content:
      'Writes everything in Markdown and expects citations in APA 7 for anything headed into the dissertation.',
    categories: ['working-preferences', 'writing'],
    createdAt: '2026-06-11T11:05:00Z',
  },
  {
    id: 'sample-profile-4',
    memoryType: MemoryType.PROFILE,
    content:
      'Never include student names or identifiable data from her study transcripts in generated text.',
    categories: ['constraints', 'privacy'],
    createdAt: '2026-06-11T11:09:00Z',
  },

  // Knowledge — semantic · cold
  {
    id: 'sample-knowledge-1',
    memoryType: MemoryType.KNOWLEDGE,
    content:
      'Her dissertation committee meets on the first Friday of each month; Dr. Osei chairs it.',
    categories: ['dissertation', 'schedule'],
    createdAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 'sample-knowledge-2',
    memoryType: MemoryType.KNOWLEDGE,
    content:
      'The pilot study uses NetLogo models of ant colonies to teach emergence to 9th graders.',
    categories: ['research', 'methods'],
    createdAt: '2026-06-24T15:20:00Z',
  },
  {
    id: 'sample-knowledge-3',
    memoryType: MemoryType.KNOWLEDGE,
    content:
      'IRB approval for the classroom study expires on December 15, 2026 — renewal takes about six weeks.',
    categories: ['research', 'deadlines'],
    createdAt: '2026-07-01T09:00:00Z',
  },
  {
    id: 'sample-knowledge-4',
    memoryType: MemoryType.KNOWLEDGE,
    content:
      'Uses the Santa Fe Institute complexity syllabus as the backbone for her literature review.',
    categories: ['sources', 'literature'],
    createdAt: '2026-07-08T13:45:00Z',
  },

  // Behaviors — procedural
  {
    id: 'sample-behavior-1',
    memoryType: MemoryType.BEHAVIOR,
    content:
      'When summarizing papers, always pull the methodology and sample size into a table before the prose summary.',
    categories: ['summaries', 'papers'],
    createdAt: '2026-06-28T10:30:00Z',
  },
  {
    id: 'sample-behavior-2',
    memoryType: MemoryType.BEHAVIOR,
    content:
      'When drafting emails to her committee, keep them under 150 words and lead with the ask.',
    categories: ['email', 'committee'],
    createdAt: '2026-07-03T17:12:00Z',
  },
  {
    id: 'sample-behavior-3',
    memoryType: MemoryType.BEHAVIOR,
    content:
      'When generating interview questions, mark each one as descriptive, comparative, or causal.',
    categories: ['interviews', 'methods'],
    createdAt: '2026-07-15T08:55:00Z',
  },

  // Events — episodic
  {
    id: 'sample-event-1',
    memoryType: MemoryType.EVENT,
    content:
      'On July 18 the pilot classroom session ran short — only 4 of 7 planned activities finished; she flagged pacing as the issue.',
    categories: ['pilot-study', 'field-notes'],
    createdAt: '2026-07-18T19:40:00Z',
  },
  {
    id: 'sample-event-2',
    memoryType: MemoryType.EVENT,
    content:
      'Her proposal defense was moved from September 4 to September 18 at the committee’s request.',
    categories: ['dissertation', 'schedule'],
    createdAt: '2026-07-22T12:15:00Z',
  },
  {
    id: 'sample-event-3',
    memoryType: MemoryType.EVENT,
    content:
      'Decided against running a control group this semester after Dr. Osei raised recruitment concerns.',
    categories: ['research', 'decisions'],
    createdAt: '2026-07-30T16:05:00Z',
  },
]
