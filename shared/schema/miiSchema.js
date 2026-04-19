/**
 * Mii schema validation, constants, and factory.
 * Importable by both the designer app and future phases.
 *
 * @module miiSchema
 */

export const SCHEMA_VERSION = 1;

export const SKIN_TONES = ['pale', 'light', 'tan', 'olive', 'brown', 'deep'];
export const BODY_SHAPES = ['narrow', 'regular', 'stocky'];
export const OUTFIT_STYLES = ['tshirt', 'hoodie', 'dress', 'stripes', 'jacket', 'overalls'];
export const ACCESSORIES = ['none', 'glasses', 'hat', 'bow', 'headphones'];

/** Outfit styles that use a secondary color */
export const TWO_COLOR_STYLES = ['hoodie', 'stripes', 'jacket', 'overalls'];

const HEX_COLOR_RE = /^#[0-9A-F]{6}$/;
const EMOJI_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

/**
 * Strip emoji from a string.
 * @param {string} str
 * @returns {string}
 */
export function stripEmoji(str) {
  return str.replace(EMOJI_RE, '');
}

/**
 * Sanitize a Mii name: trim whitespace, strip emoji, enforce max length.
 * @param {string} raw
 * @returns {string}
 */
export function sanitizeName(raw) {
  return stripEmoji(raw).trim().slice(0, 20);
}

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} errors
 */

/**
 * Validate a Mii object against the canonical schema.
 * @param {object} obj
 * @returns {ValidationResult}
 */
export function validateMii(obj) {
  const errors = [];

  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['Input is not an object'] };
  }

  // id
  if (typeof obj.id !== 'string' || obj.id.length === 0) {
    errors.push('id must be a non-empty string');
  }

  // schemaVersion
  if (obj.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${SCHEMA_VERSION}, got ${obj.schemaVersion}`);
  }

  // timestamps
  for (const field of ['createdAt', 'updatedAt']) {
    if (typeof obj[field] !== 'string' || isNaN(Date.parse(obj[field]))) {
      errors.push(`${field} must be a valid ISO 8601 timestamp`);
    }
  }

  // name
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    errors.push('name must be a non-empty string');
  } else if (obj.name.length > 20) {
    errors.push('name must be 20 characters or fewer');
  }

  // personality
  if (!obj.personality || typeof obj.personality !== 'object') {
    errors.push('personality must be an object');
  } else {
    for (const key of ['introvertExtrovert', 'calmIntense', 'seriousSilly']) {
      const val = obj.personality[key];
      if (typeof val !== 'number' || !Number.isInteger(val) || val < 0 || val > 100) {
        errors.push(`personality.${key} must be an integer 0-100`);
      }
    }
  }

  // appearance
  if (!obj.appearance || typeof obj.appearance !== 'object') {
    errors.push('appearance must be an object');
  } else {
    if (!SKIN_TONES.includes(obj.appearance.skinTone)) {
      errors.push(`appearance.skinTone must be one of: ${SKIN_TONES.join(', ')}`);
    }
    if (!BODY_SHAPES.includes(obj.appearance.bodyShape)) {
      errors.push(`appearance.bodyShape must be one of: ${BODY_SHAPES.join(', ')}`);
    }
    if (!ACCESSORIES.includes(obj.appearance.accessory)) {
      errors.push(`appearance.accessory must be one of: ${ACCESSORIES.join(', ')}`);
    }

    // outfit
    if (!obj.appearance.outfit || typeof obj.appearance.outfit !== 'object') {
      errors.push('appearance.outfit must be an object');
    } else {
      const outfit = obj.appearance.outfit;
      if (!OUTFIT_STYLES.includes(outfit.style)) {
        errors.push(`appearance.outfit.style must be one of: ${OUTFIT_STYLES.join(', ')}`);
      }
      if (typeof outfit.primaryColor !== 'string' || !HEX_COLOR_RE.test(outfit.primaryColor)) {
        errors.push('appearance.outfit.primaryColor must be a hex color like #RRGGBB (uppercase)');
      }
      if (TWO_COLOR_STYLES.includes(outfit.style)) {
        if (typeof outfit.secondaryColor !== 'string' || !HEX_COLOR_RE.test(outfit.secondaryColor)) {
          errors.push('appearance.outfit.secondaryColor must be a hex color for this outfit style');
        }
      } else {
        if (outfit.secondaryColor !== null) {
          errors.push('appearance.outfit.secondaryColor must be null for this outfit style');
        }
      }
    }
  }

  // face
  if (!obj.face || typeof obj.face !== 'object') {
    errors.push('face must be an object');
  } else {
    if (typeof obj.face.prompt !== 'string') {
      errors.push('face.prompt must be a string');
    }
    if (typeof obj.face.vibe !== 'string') {
      errors.push('face.vibe must be a string (use empty string, not null)');
    }
    if (obj.face.imageDataUrl !== null && typeof obj.face.imageDataUrl !== 'string') {
      errors.push('face.imageDataUrl must be a string or null');
    }
    if (obj.face.generatedAt !== null && (typeof obj.face.generatedAt !== 'string' || isNaN(Date.parse(obj.face.generatedAt)))) {
      errors.push('face.generatedAt must be a valid ISO 8601 timestamp or null');
    }
    if (obj.face.modelId !== 'gemini-3.1-flash-image-preview') {
      errors.push('face.modelId must be "gemini-3.1-flash-image-preview"');
    }
  }

  // meta
  if (!obj.meta || typeof obj.meta !== 'object') {
    errors.push('meta must be an object');
  } else {
    if (typeof obj.meta.notes !== 'string') {
      errors.push('meta.notes must be a string');
    } else if (obj.meta.notes.length > 500) {
      errors.push('meta.notes must be 500 characters or fewer');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create a blank Mii with sensible defaults. Caller must set a name before saving.
 * @returns {object}
 */
export function createBlankMii() {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    name: '',
    personality: {
      introvertExtrovert: 50,
      calmIntense: 50,
      seriousSilly: 50,
    },
    appearance: {
      skinTone: 'light',
      bodyShape: 'regular',
      outfit: {
        style: 'tshirt',
        primaryColor: '#5B8CDE',
        secondaryColor: null,
      },
      accessory: 'none',
    },
    face: {
      prompt: '',
      vibe: '',
      imageDataUrl: null,
      generatedAt: null,
      modelId: 'gemini-3.1-flash-image-preview',
    },
    meta: {
      notes: '',
    },
  };
}
