/**
 * Example Mii — the default character loaded on first run.
 * @module exampleMii
 */

export const EXAMPLE_MII = {
  id: '00000000-0000-4000-8000-000000000001',
  schemaVersion: 3,
  createdAt: '2026-04-19T00:00:00.000Z',
  updatedAt: '2026-04-19T00:00:00.000Z',
  name: 'Example',
  personality: { introvertExtrovert: 70, calmIntense: 40, seriousSilly: 75 },
  appearance: {
    skinTone: 'light',
    bodyShape: 'regular',
    outfit: { style: 'hoodie', primaryColor: '#7F77DD', secondaryColor: '#534AB7' },
    accessory: 'glasses',
    face: {
      faceShape: 'oval',
      hairStyle: 'bob',
      hairColor: '#3B2416',
      eyeShape: 'round',
      eyeColor: '#2D1810',
      mouthShape: 'smile',
      eyebrows: 'arched',
      nose: 'none',
      eyelashes: false,
      expression: 'none',
      blush: true,
      freckles: false,
      beautyMark: false,
      scar: false,
    },
  },
  meta: { notes: '' },
};
