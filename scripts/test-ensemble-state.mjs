import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { build } from 'esbuild'

// Bundle the real reducers and action creators; block HTTP at the transport boundary.
const bundle = await build({
  stdin: {
    contents: `
      export { default as reducer } from './src/redux/ensembleSlice';
      export * from './src/redux/ensembleSlice';
      export { userLogin, userLogout } from './src/redux/asyncThunks/user';
    `,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  plugins: [
    {
      name: 'block-http',
      setup(builder) {
        builder.onResolve({ filter: /^@\/utils\/requests$/ }, () => ({
          path: 'requests',
          namespace: 'test',
        }))
        builder.onLoad({ filter: /.*/, namespace: 'test' }, () => ({
          contents:
            'export async function baseRequest() { throw new Error("HTTP unavailable") }',
          loader: 'js',
        }))
      },
    },
  ],
})
const {
  reducer,
  fetchEnsembleBriefs,
  saveEnsemblePreset,
  removeEnsemblePreset,
  userLogin,
  userLogout,
} = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
)

const preset = {
  id: 1,
  name: 'Debate',
  responder: '',
  evaluator: '',
  chairman: '',
  angles: ['For'],
}
const payload = {
  defaults: {
    responder: 'Respond',
    evaluator: 'Review',
    chairman: 'Synthesize',
  },
  presets: [preset],
}
const loaded = () =>
  reducer(
    reducer(undefined, fetchEnsembleBriefs.pending('fetch', undefined)),
    fetchEnsembleBriefs.fulfilled(payload, 'fetch', undefined)
  )

test('failed loads show an error and a retry can populate defaults and presets', () => {
  let state = reducer(
    undefined,
    fetchEnsembleBriefs.pending('first', undefined)
  )
  state = reducer(
    state,
    fetchEnsembleBriefs.rejected(new Error('Offline'), 'first', undefined)
  )
  assert.equal(state.loading, false)
  assert.equal(state.loaded, false)
  assert.equal(state.error, 'Offline')
  state = reducer(state, fetchEnsembleBriefs.pending('retry', undefined))
  assert.equal(state.error, null)
  state = reducer(
    state,
    fetchEnsembleBriefs.fulfilled(payload, 'retry', undefined)
  )
  assert.deepEqual(state.presets, [preset])
  assert.deepEqual(state.defaults, payload.defaults)
})

test('saving another preset with the same name preserves both server records', () => {
  let state = reducer(loaded(), saveEnsemblePreset.pending('save', preset))
  state = reducer(
    state,
    saveEnsemblePreset.fulfilled({ ...preset, id: 2 }, 'save', preset)
  )
  assert.deepEqual(
    state.presets.map((item) => item.id),
    [1, 2]
  )
})

test('failed saves and deletes retain presets and report their errors', () => {
  let state = reducer(loaded(), saveEnsemblePreset.pending('save', preset))
  state = reducer(
    state,
    saveEnsemblePreset.rejected(new Error('Save failed'), 'save', preset)
  )
  assert.equal(state.error, 'Save failed')
  assert.equal(state.saving, false)
  state = reducer(state, removeEnsemblePreset.pending('delete', 1))
  state = reducer(
    state,
    removeEnsemblePreset.rejected(new Error('Delete failed'), 'delete', 1)
  )
  assert.equal(state.error, 'Delete failed')
  assert.equal(state.deleting, false)
  assert.deepEqual(state.presets, [preset])
})

test('successful deletion removes only the selected preset', () => {
  let state = reducer(loaded(), removeEnsemblePreset.pending('delete', 1))
  state = reducer(state, removeEnsemblePreset.fulfilled(1, 'delete', 1))
  assert.deepEqual(state.presets, [])
})

test('logout clears private presets and ignores outstanding requests', () => {
  let state = loaded()
  state = reducer(state, fetchEnsembleBriefs.pending('fetch-old', undefined))
  state = reducer(state, saveEnsemblePreset.pending('save-old', preset))
  state = reducer(state, removeEnsemblePreset.pending('delete-old', 1))
  state = reducer(state, userLogout.pending('logout', undefined))
  state = reducer(
    state,
    fetchEnsembleBriefs.fulfilled(payload, 'fetch-old', undefined)
  )
  state = reducer(
    state,
    saveEnsemblePreset.fulfilled(preset, 'save-old', preset)
  )
  state = reducer(
    state,
    removeEnsemblePreset.rejected(new Error('Late error'), 'delete-old', 1)
  )
  assert.equal(state.defaults, null)
  assert.deepEqual(state.presets, [])
  assert.equal(state.loaded, false)
  assert.equal(state.error, null)
})

test('login starts with an empty preset cache', () => {
  const state = reducer(
    loaded(),
    userLogin.pending('login', { email: 'next@example.com', password: 'test' })
  )
  assert.deepEqual(state.presets, [])
  assert.equal(state.loaded, false)
})
