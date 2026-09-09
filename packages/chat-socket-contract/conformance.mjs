import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { parseChatEvent, createChatSendPayload, normalizeMessageId } from './dist/index.js';
const fixtures = JSON.parse(readFileSync(new URL('./fixtures.json', import.meta.url), 'utf8'));
for (const fixture of fixtures.valid) {
  test(fixture.name, () => {
    const original = structuredClone(fixture.frame);
    const result = parseChatEvent(fixture.frame);
    assert.equal(result.success, true);
    for (const [key, expected] of Object.entries(fixture.expected)) assert.deepEqual(result.data[key], expected);
    assert.deepEqual(fixture.frame, original, 'normalization mutated the input');
  });
}
for (const [index, frame] of fixtures.invalid.entries()) {
  test(`reject malformed frame ${index}`, () => assert.equal(parseChatEvent(frame).success, false));
}
test('routing and all retrieval modes preserve opaque models and zero values', () => {
  for (const rag_mode of ['naive', 'advanced', 'agentic']) {
    for (const model_id of ['29', 'litellm:key:provider/model']) {
      const payload = createChatSendPayload('current', {conversationId:'stale',message:'Hi',model_id,rag_mode,document_similarity_threshold:0});
      assert.deepEqual(payload, {conversationId:'current',message:'Hi',model_id,rag_mode,document_similarity_threshold:0});
    }
  }
});
test('UI identity normalization retains zero and string identity', () => {
  assert.equal(normalizeMessageId(0), '0');
  assert.equal(normalizeMessageId('123'), '123');
});
