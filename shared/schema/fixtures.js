/**
 * Test fixtures for schema validation and UI testing.
 * Each fixture is a valid Mii record with distinct appearance combinations.
 *
 * @module fixtures
 */

export const FIXTURES = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    schemaVersion: 1,
    createdAt: '2026-04-19T00:00:00.000Z',
    updatedAt: '2026-04-19T00:00:00.000Z',
    name: 'Example',
    personality: {
      introvertExtrovert: 70,
      calmIntense: 40,
      seriousSilly: 75,
    },
    appearance: {
      skinTone: 'light',
      bodyShape: 'regular',
      outfit: {
        style: 'hoodie',
        primaryColor: '#7F77DD',
        secondaryColor: '#534AB7',
      },
      accessory: 'glasses',
    },
    face: {
      prompt: '',
      vibe: '',
      imageDataUrl: null,
      generatedAt: null,
      modelId: 'gemini-3.1-flash-image-preview',
    },
    meta: { notes: '' },
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    schemaVersion: 1,
    createdAt: '2026-04-19T00:00:00.000Z',
    updatedAt: '2026-04-19T00:00:00.000Z',
    name: 'Mika',
    personality: {
      introvertExtrovert: 85,
      calmIntense: 85,
      seriousSilly: 85,
    },
    appearance: {
      skinTone: 'tan',
      bodyShape: 'narrow',
      outfit: {
        style: 'dress',
        primaryColor: '#E87CA0',
        secondaryColor: null,
      },
      accessory: 'bow',
    },
    face: {
      prompt: '',
      vibe: 'grumpy wizard with purple hair',
      imageDataUrl: null,
      generatedAt: null,
      modelId: 'gemini-3.1-flash-image-preview',
    },
    meta: { notes: 'Test fixture — high energy character' },
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    schemaVersion: 1,
    createdAt: '2026-04-19T00:00:00.000Z',
    updatedAt: '2026-04-19T00:00:00.000Z',
    name: 'Koji',
    personality: {
      introvertExtrovert: 15,
      calmIntense: 20,
      seriousSilly: 10,
    },
    appearance: {
      skinTone: 'deep',
      bodyShape: 'stocky',
      outfit: {
        style: 'overalls',
        primaryColor: '#4A7C59',
        secondaryColor: '#F5E6CA',
      },
      accessory: 'headphones',
    },
    face: {
      prompt: '',
      vibe: '',
      imageDataUrl: null,
      generatedAt: null,
      modelId: 'gemini-3.1-flash-image-preview',
    },
    meta: { notes: 'Test fixture — quiet introvert' },
  },
];
