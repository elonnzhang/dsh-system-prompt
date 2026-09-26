import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import { apply, inject } from '../lib/index.js'

test('session RPC returns owned data and leaves with its plugin', async () => {
  const ctx = new Context()
  let handler
  let registered = false
  ctx.provide('connection', { rpc: {
    handle(channel, next) {
      assert.equal(channel, '/dsh-system-prompt')
      handler = next
      registered = true
      return () => { registered = false }
    },
  } })
  ctx.provide('agents', { get: sessionId => sessionId === 'test-session' ? {
    id: sessionId,
    session: { snapshotEvents: () => [{
      type: 'user/message', seq: 1, time: 2,
      data: {
        source: { kind: 'plugin', plugin: 'test-plugin', form: 'context' },
        content: [{ type: 'text', text: 'injected text' }],
      },
    }] },
  } : undefined })
  const fiber = ctx.plugin({ inject, apply })
  try {
    await fiber.await()
    assert.equal(registered, true)
    const response = await handler('session', { sessionId: 'test-session' }, new AbortController().signal)
    assert.equal(response.ok, true)
    assert.equal(response.value.sessionId, 'test-session')
    assert.deepEqual(response.value.injectedMessages.map(row => row.text), ['injected text'])
    assert.doesNotThrow(() => structuredClone(response.value))
    const missing = await handler('session', { sessionId: 'missing' }, new AbortController().signal)
    assert.equal(missing.ok, false)
  } finally {
    await fiber.dispose()
  }
  assert.equal(registered, false)
})

test('inspection releases preset scope leases after prompt and tool reads', async () => {
  const ctx = new Context()
  let handler
  const scopeKey = {}
  const assemblyScopes = []
  const toolScopes = []
  let acquired = 0
  let released = 0
  ctx.provide('connection', { rpc: {
    handle(channel, next) {
      assert.equal(channel, '/dsh-system-prompt')
      handler = next
      return () => {}
    },
  } })
  ctx.provide('agents', { get: sessionId => sessionId === 'test-session' ? {
    id: sessionId,
    session: { header: { agentPreset: 'standard' } },
  } : undefined })
  ctx.provide('agentPresets', {
    async acquireScope(id) {
      assert.equal(id, 'standard')
      acquired += 1
      return { key: scopeKey, async [Symbol.asyncDispose]() { released += 1 } }
    },
  })
  ctx.provide('systemPrompt', {
    async assemble({ scope }) {
      assemblyScopes.push(scope)
      return { sections: [], contexts: [], variables: {} }
    },
  })
  ctx.provide('tools', {
    schemas(scope) {
      toolScopes.push(scope)
      return []
    },
  })
  const fiber = ctx.plugin({ inject, apply })
  let response
  try {
    await fiber.await()
    response = await handler('session', { sessionId: 'test-session' }, new AbortController().signal)
  } finally {
    await fiber.dispose()
  }
  assert.equal(response.ok, true)
  assert.equal(response.value.agentPreset, 'standard')
  assert.equal(acquired, 2)
  assert.equal(released, 2)
  assert.deepEqual(assemblyScopes, [undefined, scopeKey])
  assert.deepEqual(toolScopes, [undefined, scopeKey])
})
