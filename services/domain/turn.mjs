import { createHash } from 'node:crypto';

export function advanceTurn(state, command, priorReceipt = null) {
  validateState(state);
  validateCommand(command);

  const commandDigest = createHash('sha256')
    .update(JSON.stringify({
      operation: 'advance-turn',
      sessionId: state.sessionId,
      actorId: command.actorId,
      expectedVersion: command.expectedVersion,
    }))
    .digest('hex');

  if (priorReceipt !== null) {
    if (
      priorReceipt.sessionId !== state.sessionId ||
      priorReceipt.actorId !== command.actorId ||
      priorReceipt.idempotencyKey !== command.idempotencyKey ||
      priorReceipt.commandDigest !== commandDigest
    ) {
      throw conflict('IDEMPOTENCY_CONFLICT', 'The receipt belongs to another command.');
    }
    validateState(priorReceipt.result);
    return { state: structuredClone(priorReceipt.result), receipt: priorReceipt, replayed: true };
  }

  if (state.version !== command.expectedVersion) {
    throw conflict('VERSION_CONFLICT', 'Refresh the session before advancing the turn.');
  }
  const nextIndex = (state.activeIndex + 1) % state.turnOrder.length;
  const nextState = {
    ...state,
    turnOrder: [...state.turnOrder],
    activeIndex: nextIndex,
    round: state.round + (nextIndex === 0 ? 1 : 0),
    version: state.version + 1,
  };
  validateState(nextState);

  return {
    state: nextState,
    receipt: {
      sessionId: state.sessionId,
      actorId: command.actorId,
      idempotencyKey: command.idempotencyKey,
      commandDigest,
      result: structuredClone(nextState),
    },
    replayed: false,
  };
}

function validateState(state) {
  if (
    !state ||
    typeof state.sessionId !== 'string' ||
    state.sessionId.trim() === '' ||
    !Array.isArray(state.turnOrder) ||
    state.turnOrder.length === 0 ||
    state.turnOrder.some((player) => typeof player !== 'string' || player.trim() === '') ||
    new Set(state.turnOrder).size !== state.turnOrder.length ||
    !Number.isSafeInteger(state.activeIndex) ||
    state.activeIndex < 0 ||
    state.activeIndex >= state.turnOrder.length ||
    !Number.isSafeInteger(state.round) ||
    state.round < 1 ||
    !Number.isSafeInteger(state.version) ||
    state.version < 0
  ) {
    throw new TypeError('The turn state is invalid.');
  }
}

function validateCommand(command) {
  if (
    !command ||
    typeof command.actorId !== 'string' ||
    command.actorId.trim() === '' ||
    typeof command.idempotencyKey !== 'string' ||
    command.idempotencyKey.trim() === '' ||
    !Number.isSafeInteger(command.expectedVersion) ||
    command.expectedVersion < 0
  ) {
    throw new TypeError('The turn command is invalid.');
  }
}

function conflict(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
