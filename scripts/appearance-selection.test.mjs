import assert from 'node:assert/strict';
import test from 'node:test';
import { appearanceForSettings } from '../src/appearance-selection.ts';

const COMMITTED = {
  base: 'momo-01',
  palette: 'peach',
  eyes: 'sparkle',
  accessory: 'none',
};

test('settings keep the submitted appearance visible while signing is pending', () => {
  const pending = {
    base: 'momo-01',
    palette: 'mint',
    eyes: 'round',
    accessory: 'bow',
  };

  assert.equal(appearanceForSettings(COMMITTED, pending), pending);
});

test('settings use the committed appearance when no save is pending', () => {
  assert.equal(appearanceForSettings(COMMITTED, null), COMMITTED);
});
