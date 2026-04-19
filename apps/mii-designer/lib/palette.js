/**
 * Color palettes and descriptor mappings for Mii rendering and prompt building.
 *
 * @module palette
 */

/** Skin tone name → hex color for SVG rendering */
export const SKIN_TONE_COLORS = {
  pale:  '#F5D4B8',
  light: '#E8B591',
  tan:   '#C98E6F',
  olive: '#A97054',
  brown: '#7D4E38',
  deep:  '#4A2D1E',
};

/** Skin tone name → human-readable descriptor for the face prompt */
export const SKIN_TONE_DESCRIPTORS = {
  pale:  'pale fair skin',
  light: 'light skin',
  tan:   'tan skin',
  olive: 'olive skin',
  brown: 'medium brown skin',
  deep:  'deep brown skin',
};

/**
 * Personality slider → descriptor mapping.
 * Each row maps a range boundary to a descriptor phrase.
 * Ranges: 0-20, 21-40, 41-60, 61-80, 81-100.
 */
export const PERSONALITY_DESCRIPTORS = {
  introvertExtrovert: [
    'shy, reserved',
    'quiet, thoughtful',
    'balanced',
    'friendly, open',
    'outgoing, animated',
  ],
  calmIntense: [
    'serene, relaxed',
    'easygoing',
    'steady',
    'spirited, alert',
    'fiery, energetic',
  ],
  seriousSilly: [
    'solemn, composed',
    'measured, dry',
    'even-tempered',
    'playful',
    'goofy, mischievous',
  ],
};

/**
 * Convert a slider value (0-100) to its descriptor string.
 * @param {string} trait - One of the personality trait keys
 * @param {number} value - Integer 0-100
 * @returns {string}
 */
export function getPersonalityDescriptor(trait, value) {
  const descriptors = PERSONALITY_DESCRIPTORS[trait];
  if (!descriptors) return 'balanced';
  if (value <= 20) return descriptors[0];
  if (value <= 40) return descriptors[1];
  if (value <= 60) return descriptors[2];
  if (value <= 80) return descriptors[3];
  return descriptors[4];
}

/** Body shape name → torso width in SVG units (at 240×320 base) */
export const BODY_WIDTHS = {
  narrow:  40,
  regular: 56,
  stocky:  72,
};
