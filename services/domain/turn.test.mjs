import assert from 'node:assert/strict';
import test from 'node:test';

import { advanceTurn } from './turn.mjs';

const initial = {
  sessionId: 'table-1',
  turnOrder: ['player-a', 'player-b'],
  activeIndex: 0,
  round: 1,
  version: 7,
};
const command = {
  actorId: 'host-1',
  idempotencyKey: 'request-1',
  expectedVersion: 7,
};

test('advances one turn without mutating the stored state', () => {
  const result = advanceTurn(initial, command);
  assert.equal(result.replayed, false);
  assert.equal(result.state.activeIndex, 1);
  assert.equal(result.state.round, 1);
  assert.equal(result.state.version, 8);
  assert.deepEqual(initial, {
    sessionId: 'table-1',
    turnOrder: ['player-a', 'player-b'],
    activeIndex: 0,
    round: 1,
    version: 7,
  });
});

test('wraps the turn order and increments the round', () => {
  const result = advanceTurn({ ...initial, activeIndex: 1 }, command);
  assert.equal(result.state.activeIndex, 0);
  assert.equal(result.state.round, 2);
});

test('replays the original response even when the session version has advanced', () => {
  const original = advanceTurn(initial, command);
  const current = { ...original.state, activeIndex: 0, round: 2, version: 9 };
  const retry = advanceTurn(current, command, original.receipt);
  assert.equal(retry.replayed, true);
  assert.deepEqual(retry.state, original.state);
  assert.equal(current.version, 9);
});

test('rejects idempotency-key reuse with a different command body', () => {
  const original = advanceTurn(initial, command);
  assert.throws(
    () => advanceTurn(original.state, { ...command, expectedVersion: 8 }, original.receipt),
    { code: 'IDEMPOTENCY_CONFLICT' },
  );
});

test('a second concurrent command loses after the first version is persisted', () => {
  const winner = advanceTurn(initial, command);
  assert.throws(
    () => advanceTurn(winner.state, { ...command, idempotencyKey: 'request-2' }),
    { code: 'VERSION_CONFLICT' },
  );
});

test('rejects a receipt for a different actor or session', () => {
  const result = advanceTurn(initial, command);
  assert.throws(
    () => advanceTurn(initial, { ...command, actorId: 'other-host' }, result.receipt),
    { code: 'IDEMPOTENCY_CONFLICT' },
  );
  assert.throws(
    () => advanceTurn({ ...initial, sessionId: 'other-table' }, command, result.receipt),
    { code: 'IDEMPOTENCY_CONFLICT' },
  );
});

test('rejects empty turn orders, repeated players and malformed versions', () => {
  for (const state of [
    { ...initial, turnOrder: [] },
    { ...initial, turnOrder: ['a', 'a'] },
    { ...initial, activeIndex: 2 },
    { ...initial, version: -1 },
    { ...initial, round: 0 },
  ]) {
    assert.throws(() => advanceTurn(state, command), TypeError);
  }
  assert.throws(() => advanceTurn(initial, { ...command, idempotencyKey: '' }), TypeError);
});
