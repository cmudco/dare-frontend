import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(
  new URL('../src/redux/utils/modelSyncHelpers.ts', import.meta.url),
  'utf8'
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
})
const {
  selectAppropriateModel,
  syncModelsWithImageGenerationState,
  isModelPickerReady,
} = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)
const models = [{ id: 'sonnet' }, { id: 'other' }]

test('new chats never choose a model from API ordering', () => {
  assert.equal(selectAppropriateModel(null, models), null)
  assert.equal(selectAppropriateModel(undefined, [...models].reverse()), null)
})
test('catalog refresh preserves an explicitly selected available model', () => {
  assert.equal(selectAppropriateModel('other', models), 'other')
})
test('removed models and empty catalogs require a new choice', () => {
  assert.equal(selectAppropriateModel('retired', models), null)
  assert.equal(selectAppropriateModel('other', []), null)
})
test('starting another conversation resets model selection', () => {
  const state = { pickerEntries: models, selectedModel: 'other' }
  syncModelsWithImageGenerationState(state, false)
  assert.equal(state.selectedModel, null)
})
test('switching to an incompatible mode requires an explicit choice', () => {
  const state = {
    pickerEntries: [...models, { id: 'image', isImageGenerator: true }],
    selectedModel: 'other',
  }
  syncModelsWithImageGenerationState(state, true, state.selectedModel)
  assert.deepEqual(
    state.pickerEntries.map((model) => model.id),
    ['image']
  )
  assert.equal(state.selectedModel, null)
})

const readyConversation = {
  conversationListStatus: 'succeeded',
  modelCatalogStatus: 'succeeded',
  routeConversationId: 'existing-chat',
  activeConversationId: 'existing-chat',
  conversationCount: 1,
}
test('refresh waits for both the conversation list and model catalog', () => {
  for (const status of ['idle', 'pending', 'failed']) {
    assert.equal(
      isModelPickerReady({
        ...readyConversation,
        conversationListStatus: status,
      }),
      false
    )
    assert.equal(
      isModelPickerReady({ ...readyConversation, modelCatalogStatus: status }),
      false
    )
  }
  assert.equal(isModelPickerReady(readyConversation), true)
})
test('dashboard navigation waits for the existing conversation to resolve', () => {
  assert.equal(
    isModelPickerReady({
      ...readyConversation,
      routeConversationId: undefined,
      activeConversationId: undefined,
    }),
    false
  )
  assert.equal(
    isModelPickerReady({
      ...readyConversation,
      activeConversationId: undefined,
    }),
    false
  )
  assert.equal(
    isModelPickerReady({
      ...readyConversation,
      activeConversationId: 'previous-chat',
    }),
    false
  )
})
test('a genuinely empty account can prompt once loading finishes', () => {
  assert.equal(
    isModelPickerReady({
      ...readyConversation,
      routeConversationId: undefined,
      activeConversationId: undefined,
      conversationCount: 0,
    }),
    true
  )
})
