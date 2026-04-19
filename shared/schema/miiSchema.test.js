/**
 * Schema validation tests — uses Node's built-in test runner.
 * Run with: node --test shared/schema/miiSchema.test.js
 *
 * @module miiSchema.test
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { validateMii, createBlankMii, sanitizeName, stripEmoji, SCHEMA_VERSION } from './miiSchema.js';
import { EXAMPLE_MII } from './exampleMii.js';
import { FIXTURES } from './fixtures.js';

describe('validateMii', () => {
  it('accepts the Example Mii', () => {
    const result = validateMii(EXAMPLE_MII);
    assert.equal(result.valid, true, `Errors: ${result.errors.join(', ')}`);
  });

  it('accepts all fixture Miis', () => {
    for (const fixture of FIXTURES) {
      const result = validateMii(fixture);
      assert.equal(result.valid, true, `${fixture.name} failed: ${result.errors.join(', ')}`);
    }
  });

  it('rejects null input', () => {
    const result = validateMii(null);
    assert.equal(result.valid, false);
  });

  it('rejects missing id', () => {
    const mii = createBlankMii();
    delete mii.id;
    const result = validateMii(mii);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('id')));
  });

  it('rejects wrong schema version', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.schemaVersion = 99;
    const result = validateMii(mii);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('schemaVersion')));
  });

  it('rejects empty name', () => {
    const mii = createBlankMii();
    const result = validateMii(mii);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('name')));
  });

  it('rejects name over 20 chars', () => {
    const mii = createBlankMii();
    mii.name = 'A'.repeat(21);
    const result = validateMii(mii);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('20')));
  });

  it('rejects personality values out of range', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.personality.introvertExtrovert = 150;
    const result = validateMii(mii);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('introvertExtrovert')));
  });

  it('rejects non-integer personality values', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.personality.calmIntense = 50.5;
    const result = validateMii(mii);
    assert.equal(result.valid, false);
  });

  it('rejects invalid skin tone', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.appearance.skinTone = 'neon';
    const result = validateMii(mii);
    assert.equal(result.valid, false);
  });

  it('rejects invalid body shape', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.appearance.bodyShape = 'huge';
    const result = validateMii(mii);
    assert.equal(result.valid, false);
  });

  it('rejects lowercase hex colors', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.appearance.outfit.primaryColor = '#aabbcc';
    const result = validateMii(mii);
    assert.equal(result.valid, false);
  });

  it('rejects non-null secondaryColor for single-color outfits', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.appearance.outfit.style = 'tshirt';
    mii.appearance.outfit.secondaryColor = '#FF0000';
    const result = validateMii(mii);
    assert.equal(result.valid, false);
  });

  it('requires secondaryColor for two-color outfits', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.appearance.outfit.style = 'hoodie';
    mii.appearance.outfit.secondaryColor = null;
    const result = validateMii(mii);
    assert.equal(result.valid, false);
  });

  it('rejects invalid accessory', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.appearance.accessory = 'sword';
    const result = validateMii(mii);
    assert.equal(result.valid, false);
  });

  it('rejects face.vibe as null (must be empty string)', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.face.vibe = null;
    const result = validateMii(mii);
    assert.equal(result.valid, false);
  });

  it('rejects notes over 500 chars', () => {
    const mii = createBlankMii();
    mii.name = 'Test';
    mii.meta.notes = 'x'.repeat(501);
    const result = validateMii(mii);
    assert.equal(result.valid, false);
  });

  it('accepts a fully valid custom Mii', () => {
    const mii = createBlankMii();
    mii.name = 'TestMii';
    const result = validateMii(mii);
    assert.equal(result.valid, true, `Errors: ${result.errors.join(', ')}`);
  });
});

describe('sanitizeName', () => {
  it('trims whitespace', () => {
    assert.equal(sanitizeName('  hello  '), 'hello');
  });

  it('truncates to 20 chars', () => {
    assert.equal(sanitizeName('A'.repeat(30)).length, 20);
  });

  it('strips emoji', () => {
    assert.equal(sanitizeName('Hello 🌟 World'), 'Hello  World');
  });

  it('handles empty string', () => {
    assert.equal(sanitizeName(''), '');
  });
});

describe('stripEmoji', () => {
  it('removes common emoji', () => {
    assert.equal(stripEmoji('Hi 😊👋'), 'Hi ');
  });

  it('leaves plain text alone', () => {
    assert.equal(stripEmoji('Just text'), 'Just text');
  });
});

describe('createBlankMii', () => {
  it('returns a valid structure with defaults', () => {
    const mii = createBlankMii();
    assert.equal(mii.schemaVersion, SCHEMA_VERSION);
    assert.equal(mii.personality.introvertExtrovert, 50);
    assert.equal(mii.personality.calmIntense, 50);
    assert.equal(mii.personality.seriousSilly, 50);
    assert.equal(mii.appearance.skinTone, 'light');
    assert.equal(mii.appearance.bodyShape, 'regular');
    assert.equal(mii.face.imageDataUrl, null);
    assert.equal(mii.face.vibe, '');
    assert.equal(typeof mii.id, 'string');
    assert.ok(mii.id.length > 0);
  });

  it('generates unique IDs', () => {
    const a = createBlankMii();
    const b = createBlankMii();
    assert.notEqual(a.id, b.id);
  });
});
