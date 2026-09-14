/**
 * Dev-only stand-in for the backend's `deliberation` events. Streams a fake
 * panel or council into the latest assistant message so the UI can be
 * exercised before the workflow engine fans out for real.
 *
 *   window.__dareSimulateDeliberation()               // panel of 3
 *   window.__dareSimulateDeliberation({ depth: 'council' })
 */
import type { Store } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import type {
  Deliberation,
  DeliberationParticipant,
  Message,
  PickerModel,
} from '@/redux/types/conversation'
import { SenderType } from '@/utils/constants/conversation'

type SimulateOptions = { depth?: 'panel' | 'council'; messageId?: string }

declare global {
  interface Window {
    __dareSimulateDeliberation?: (options?: SimulateOptions) => Promise<void>
  }
}

const DRAFTS = [
  'The question is mis-posed: rare Earth is a special case of an early great filter, not a rival to it. The load-bearing unknown is how often abiogenesis happens, and nothing we have measured constrains that yet.',
  'Both are priors, not explanations. Rare Earth says the filter sits behind us; the pessimistic filter says it sits ahead. The evidence so far, one data point, cannot separate them, so the honest answer is a posterior, not a pick.',
  'I would weight the eukaryote transition, not abiogenesis. Life appeared almost as soon as it could on Earth, which argues it is easy; complex cells took two billion years, which argues that step is the hard one.',
]

const ANSWER =
  'All three drafts agree the question is mis-posed: rare Earth is a special case of an early great filter, not a rival to it. Where they diverge is on which filter carries the weight. Two of them point at abiogenesis, one at the eukaryote transition, and the third draft has the stronger argument: life appeared on Earth almost as soon as it could, while complex cells took two billion years. So the best current answer is an early filter, most likely the jump to complex life, held loosely until we have a second data point.'

const FALLBACK: PickerModel[] = [
  {
    id: 'sim-1',
    name: 'Claude Sonnet 5',
    provider: 'anthropic',
    tier: 'premium',
  },
  { id: 'sim-2', name: 'GPT-5.6 Sol', provider: 'openai', tier: 'premium' },
  { id: 'sim-3', name: 'Gemini 3 Pro', provider: 'google', tier: 'advanced' },
].map((m) => ({ ...m }) as PickerModel)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const participant = (model: PickerModel): DeliberationParticipant => ({
  modelId: model.id,
  modelName: model.name,
  provider: model.provider,
  tier: model.tier,
  status: 'pending',
  text: '',
})

export const installDeliberationDevTools = (store: Store<RootState>) => {
  window.__dareSimulateDeliberation = async (options = {}) => {
    const state = store.getState().conversation
    const catalog =
      state.pickerEntries.length >= 3 ? state.pickerEntries : FALLBACK
    const bench = state.ensemble.responderIds
      .map((id) => catalog.find((e) => e.id === id))
      .filter((e): e is PickerModel => !!e)
    const models = bench.length >= 2 ? bench : catalog.slice(0, 3)
    const chairmanModel =
      catalog.find((e) => e.id === state.ensemble.chairmanId) ?? models[0]
    const depth =
      options.depth ??
      (state.ensemble.depth === 'council' ? 'council' : 'panel')

    let messageId = options.messageId
    if (!messageId) {
      const last = [...state.activeConversationMessages]
        .reverse()
        .find((m) => m.senderType === SenderType.AI_ASSISTANT)
      messageId = last?.id
    }
    if (!messageId) {
      messageId = `sim-${Date.now()}`
      const message: Message = {
        id: messageId,
        message: '',
        senderType: SenderType.AI_ASSISTANT,
        senderName: 'DARE',
        createdAt: new Date().toISOString(),
        streaming: true,
      }
      store.dispatch({ type: 'socket/message', payload: message })
    } else {
      store.dispatch({
        type: 'socket/ai_stream',
        payload: { id: messageId, message: '', streaming: true },
      })
    }

    const defaults = store.getState().ensemble.defaults
    const deliberation: Deliberation = {
      depth,
      responders: models.map((model, i) => ({
        ...participant(model),
        angle: state.ensemble.briefs.angles[i] || null,
      })),
      chairman: participant(chairmanModel),
      briefs: defaults
        ? {
            responder: {
              text: state.ensemble.briefs.responder ?? defaults.responder,
              custom: state.ensemble.briefs.responder !== null,
            },
            chairman: {
              text: state.ensemble.briefs.chairman ?? defaults.chairman,
              custom: state.ensemble.briefs.chairman !== null,
            },
          }
        : null,
    }
    const emit = () =>
      store.dispatch({
        type: 'socket/deliberation',
        payload: {
          messageId,
          deliberation: JSON.parse(JSON.stringify(deliberation)),
        },
      })
    emit()

    const startedAt = Date.now()
    const words = models.map((_, i) => DRAFTS[i % DRAFTS.length].split(' '))
    const cursors = models.map(() => 0)
    const started = models.map((_, i) => 350 + i * 420)
    const speeds = models.map((_, i) => 55 + i * 25)

    while (cursors.some((c, i) => c < words[i].length)) {
      const elapsed = Date.now() - startedAt
      models.forEach((_, i) => {
        const r = deliberation.responders[i]
        if (elapsed < started[i] || r.status === 'done') return
        r.status = 'streaming'
        cursors[i] = Math.min(
          words[i].length,
          Math.floor((elapsed - started[i]) / speeds[i])
        )
        r.text = words[i].slice(0, cursors[i]).join(' ')
        if (cursors[i] >= words[i].length) {
          r.status = 'done'
          r.ms = elapsed
        }
      })
      emit()
      await sleep(90)
    }

    if (depth === 'council') {
      await sleep(900)
      deliberation.evaluations = models.map((m, i) => ({
        evaluatorName: m.name,
        ranking: [...models].map((x) => x.name).sort(() => (i % 2 ? -1 : 1)),
      }))
      emit()
      await sleep(600)
    }

    deliberation.chairman.status = 'streaming'
    emit()
    const chairmanStart = Date.now()
    const answerWords = ANSWER.split(' ')
    for (let i = 1; i <= answerWords.length; i++) {
      store.dispatch({
        type: 'socket/ai_stream',
        payload: {
          id: messageId,
          message: answerWords.slice(0, i).join(' '),
          streaming: true,
        },
      })
      await sleep(45)
    }
    deliberation.chairman.status = 'done'
    deliberation.chairman.ms = Date.now() - chairmanStart
    deliberation.totalMs = Date.now() - startedAt
    deliberation.cost = '0.0412'
    deliberation.verdict = '2 agreed, 1 dissented'
    emit()
    store.dispatch({
      type: 'socket/ai_stream',
      payload: { id: messageId, message: ANSWER, streaming: false },
    })
  }
}
