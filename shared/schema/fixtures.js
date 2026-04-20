/**
 * Test fixtures — varied v2 Miis that span the parameter space.
 * Used by miiSchema.test.js and for visual testing.
 *
 * @module fixtures
 */

/** v2 fixture: spiky-haired sporty character */
export const FIXTURE_KOJI = {
  id: '00000000-0000-4000-8000-000000000002',
  schemaVersion: 2,
  createdAt: '2026-04-19T01:00:00.000Z',
  updatedAt: '2026-04-19T01:00:00.000Z',
  name: 'Koji',
  personality: { introvertExtrovert: 85, calmIntense: 70, seriousSilly: 60 },
  appearance: {
    skinTone: 'tan',
    bodyShape: 'regular',
    outfit: { style: 'tshirt', primaryColor: '#3A8FDE', secondaryColor: null },
    accessory: 'none',
    face: {
      hairStyle: 'spiky',
      hairColor: '#1A1A1A',
      eyeShape: 'wide',
      eyeColor: '#2D1810',
      mouthShape: 'grin',
      eyebrows: 'arched',
      blush: false,
      freckles: false,
    },
  },
  meta: { notes: 'Sporty and energetic' },
};

/** v2 fixture: cute character with pigtails and freckles */
export const FIXTURE_LUNA = {
  id: '00000000-0000-4000-8000-000000000003',
  schemaVersion: 2,
  createdAt: '2026-04-19T02:00:00.000Z',
  updatedAt: '2026-04-19T02:00:00.000Z',
  name: 'Luna',
  personality: { introvertExtrovert: 30, calmIntense: 20, seriousSilly: 90 },
  appearance: {
    skinTone: 'pale',
    bodyShape: 'narrow',
    outfit: { style: 'dress', primaryColor: '#E88ACA', secondaryColor: null },
    accessory: 'bow',
    face: {
      hairStyle: 'pigtails',
      hairColor: '#D4A853',
      eyeShape: 'sparkle',
      eyeColor: '#4A90D9',
      mouthShape: 'smile',
      eyebrows: 'arched',
      blush: true,
      freckles: true,
    },
  },
  meta: { notes: '' },
};

/** v2 fixture: serious character with afro and flat brows */
export const FIXTURE_MARCUS = {
  id: '00000000-0000-4000-8000-000000000004',
  schemaVersion: 2,
  createdAt: '2026-04-19T03:00:00.000Z',
  updatedAt: '2026-04-19T03:00:00.000Z',
  name: 'Marcus',
  personality: { introvertExtrovert: 45, calmIntense: 80, seriousSilly: 15 },
  appearance: {
    skinTone: 'deep',
    bodyShape: 'stocky',
    outfit: { style: 'jacket', primaryColor: '#2A3040', secondaryColor: '#EEEEEE' },
    accessory: 'headphones',
    face: {
      hairStyle: 'afro',
      hairColor: '#111111',
      eyeShape: 'angry',
      eyeColor: '#3A2010',
      mouthShape: 'flat',
      eyebrows: 'flat',
      blush: false,
      freckles: false,
    },
  },
  meta: { notes: 'Cool and composed' },
};

/** v1 fixture for migration testing */
export const FIXTURE_V1_LEGACY = {
  id: '00000000-0000-4000-8000-000000000099',
  schemaVersion: 1,
  createdAt: '2026-04-19T00:00:00.000Z',
  updatedAt: '2026-04-19T00:00:00.000Z',
  name: 'OldMii',
  personality: { introvertExtrovert: 50, calmIntense: 50, seriousSilly: 50 },
  appearance: {
    skinTone: 'light',
    bodyShape: 'regular',
    outfit: { style: 'tshirt', primaryColor: '#5B8CDE', secondaryColor: null },
    accessory: 'none',
  },
  face: {
    prompt: 'some old prompt',
    vibe: 'wizard',
    imageDataUrl: null,
    generatedAt: null,
    modelId: 'gemini-3.1-flash-image-preview',
  },
  meta: { notes: '' },
};
