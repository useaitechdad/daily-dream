/**
 * Schema validation and migration tests.
 * Run: node --test shared/schema/miiSchema.test.js
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  SCHEMA_VERSION,
  HAIR_STYLES, EYE_SHAPES, MOUTH_SHAPES, EYEBROW_STYLES,
  validateMii, createBlankMii, sanitizeName, stripEmoji,
  migrateV1ToV2,
} from './miiSchema.js';

import { EXAMPLE_MII } from './exampleMii.js';
import { FIXTURE_KOJI, FIXTURE_LUNA, FIXTURE_MARCUS, FIXTURE_V1_LEGACY } from './fixtures.js';

/* ---- validateMii ---- */

describe('validateMii', () => {
  it('accepts the Example Mii', () => {
    const result = validateMii(EXAMPLE_MII);
    assert.deepStrictEqual(result, { valid: true, errors: [] });
  });

  it('accepts all v2 fixture Miis', () => {
    for (const mii of [FIXTURE_KOJI, FIXTURE_LUNA, FIXTURE_MARCUS]) {
      const result = validateMii(mii);
      assert.deepStrictEqual(result.errors, [], `Failed for ${mii.name}: ${result.errors.join(', ')}`);
    }
  });

  it('rejects null input', () => {
    assert.strictEqual(validateMii(null).valid, false);
  });

  it('rejects missing id', () => {
    const bad = { ...EXAMPLE_MII, id: '' };
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects wrong schema version', () => {
    const bad = { ...EXAMPLE_MII, schemaVersion: 1 };
    const result = validateMii(bad);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('schemaVersion')));
  });

  it('rejects v1 records', () => {
    const result = validateMii(FIXTURE_V1_LEGACY);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('schemaVersion')));
  });

  it('rejects empty name', () => {
    const bad = { ...EXAMPLE_MII, name: '  ' };
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects name over 20 chars', () => {
    const bad = { ...EXAMPLE_MII, name: 'A'.repeat(21) };
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects out-of-range personality', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.personality.introvertExtrovert = 101;
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects non-integer personality', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.personality.introvertExtrovert = 50.5;
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects invalid skin tone', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.appearance.skinTone = 'neon';
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects invalid hair style', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.appearance.face.hairStyle = 'mohawk';
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects invalid eye shape', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.appearance.face.eyeShape = 'star';
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects invalid mouth shape', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.appearance.face.mouthShape = 'surprised';
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects invalid eyebrow style', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.appearance.face.eyebrows = 'bushy';
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects non-boolean blush', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.appearance.face.blush = 'yes';
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects non-boolean freckles', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.appearance.face.freckles = 1;
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects lowercase hex hair color', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.appearance.face.hairColor = '#3b2416';
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects lowercase hex eye color', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.appearance.face.eyeColor = '#2d1810';
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects missing appearance.face', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    delete bad.appearance.face;
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('rejects notes over 500 chars', () => {
    const bad = JSON.parse(JSON.stringify(EXAMPLE_MII));
    bad.meta.notes = 'x'.repeat(501);
    assert.strictEqual(validateMii(bad).valid, false);
  });

  it('accepts a fully valid custom v2 Mii', () => {
    const custom = {
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      schemaVersion: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Custom',
      personality: { introvertExtrovert: 0, calmIntense: 100, seriousSilly: 50 },
      appearance: {
        skinTone: 'deep',
        bodyShape: 'stocky',
        outfit: { style: 'overalls', primaryColor: '#444444', secondaryColor: '#FFFFFF' },
        accessory: 'hat',
        face: {
          hairStyle: 'afro',
          hairColor: '#111111',
          eyeShape: 'sparkle',
          eyeColor: '#4A90D9',
          mouthShape: 'open',
          eyebrows: 'angry',
          blush: false,
          freckles: true,
        },
      },
      meta: { notes: 'Test character' },
    };
    assert.deepStrictEqual(validateMii(custom), { valid: true, errors: [] });
  });
});

/* ---- migrateV1ToV2 ---- */

describe('migrateV1ToV2', () => {
  it('produces a valid v2 record from a v1 fixture', () => {
    const migrated = migrateV1ToV2(FIXTURE_V1_LEGACY);
    const result = validateMii(migrated);
    assert.deepStrictEqual(result.errors, [], `Migration produced invalid record: ${result.errors.join(', ')}`);
    assert.strictEqual(result.valid, true);
  });

  it('bumps schemaVersion to 2', () => {
    const migrated = migrateV1ToV2(FIXTURE_V1_LEGACY);
    assert.strictEqual(migrated.schemaVersion, 2);
  });

  it('removes the top-level face object', () => {
    const migrated = migrateV1ToV2(FIXTURE_V1_LEGACY);
    assert.strictEqual(migrated.face, undefined);
  });

  it('adds appearance.face with defaults', () => {
    const migrated = migrateV1ToV2(FIXTURE_V1_LEGACY);
    assert.strictEqual(migrated.appearance.face.hairStyle, 'bob');
    assert.strictEqual(migrated.appearance.face.eyeShape, 'round');
    assert.strictEqual(migrated.appearance.face.mouthShape, 'smile');
    assert.strictEqual(migrated.appearance.face.blush, true);
    assert.strictEqual(migrated.appearance.face.freckles, false);
  });

  it('preserves existing fields', () => {
    const migrated = migrateV1ToV2(FIXTURE_V1_LEGACY);
    assert.strictEqual(migrated.name, 'OldMii');
    assert.strictEqual(migrated.appearance.skinTone, 'light');
    assert.strictEqual(migrated.meta.notes, '');
  });

  it('does not mutate the input', () => {
    const original = JSON.parse(JSON.stringify(FIXTURE_V1_LEGACY));
    migrateV1ToV2(FIXTURE_V1_LEGACY);
    assert.deepStrictEqual(FIXTURE_V1_LEGACY, original);
  });
});

/* ---- createBlankMii ---- */

describe('createBlankMii', () => {
  it('produces a v2 record', () => {
    const blank = createBlankMii();
    assert.strictEqual(blank.schemaVersion, 2);
  });

  it('has appearance.face with defaults', () => {
    const blank = createBlankMii();
    assert.strictEqual(blank.appearance.face.hairStyle, 'bob');
    assert.strictEqual(blank.appearance.face.blush, true);
  });

  it('does not have a top-level face key', () => {
    const blank = createBlankMii();
    assert.strictEqual(blank.face, undefined);
  });
});

/* ---- sanitizeName ---- */

describe('sanitizeName', () => {
  it('trims whitespace', () => assert.strictEqual(sanitizeName('  hi  '), 'hi'));
  it('strips emoji', () => assert.strictEqual(sanitizeName('Cool🔥Kid'), 'CoolKid'));
  it('limits to 20 chars', () => assert.strictEqual(sanitizeName('A'.repeat(30)).length, 20));
  it('handles empty', () => assert.strictEqual(sanitizeName(''), ''));
});

/* ---- stripEmoji ---- */

describe('stripEmoji', () => {
  it('removes emoji', () => assert.strictEqual(stripEmoji('Hi👋'), 'Hi'));
  it('preserves plain text', () => assert.strictEqual(stripEmoji('Hello World'), 'Hello World'));
});
