import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_RUNTIME_CONFIG_TIMEOUT_MS,
  readRuntimeConfig,
} from '../src/runtime-config.ts';

test('schema errors immediately fall back to normal routing values', async () => {
  let schemaError;
  let unsubscribeCalls = 0;
  const api = {
    onSchemaError(callback) {
      schemaError = callback;
      return () => {
        unsubscribeCalls += 1;
      };
    },
    get() {
      return new Promise(() => {});
    },
  };

  const resultPromise = readRuntimeConfig(api, 1_000);
  schemaError({ code: 'no-schema', error: 'no configuration schema is registered' });

  assert.deepEqual(await resultPromise, {});
  assert.equal(unsubscribeCalls, 1);
});

test('available runtime values remain available for local development', async () => {
  const api = {
    onSchemaError() {
      return () => {};
    },
    async get() {
      return { nostrPetLocalRelayMirror: true };
    },
  };

  assert.deepEqual(await readRuntimeConfig(api), {
    nostrPetLocalRelayMirror: true,
  });
});

test('a missing response is bounded even when no schema error is delivered', async () => {
  const startedAt = Date.now();
  const api = {
    onSchemaError() {
      return () => {};
    },
    get() {
      return new Promise(() => {});
    },
  };

  assert.deepEqual(await readRuntimeConfig(api, 20), {});
  assert.ok(Date.now() - startedAt < 500);
  assert.equal(DEFAULT_RUNTIME_CONFIG_TIMEOUT_MS, 1_000);
});
