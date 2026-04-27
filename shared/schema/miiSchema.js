/**
 * Mii schema validation, constants, and factory.
 * Importable by both the designer app and future phases.
 *
 * @module miiSchema
 */

export const SCHEMA_VERSION = 3;

export const SKIN_TONES = ['pale', 'light', 'tan', 'olive', 'brown', 'deep'];
export const BODY_SHAPES = ['narrow', 'regular', 'stocky'];
export const OUTFIT_STYLES = ['tshirt', 'hoodie', 'dress', 'stripes', 'jacket', 'overalls', 'suit', 'cape', 'tanktop', 'kimono'];
export const ACCESSORIES = ['none', 'glasses', 'hat', 'bow', 'headphones', 'sunglasses', 'crown', 'bandana', 'earrings', 'mask', 'horns'];

/** Outfit styles that use a secondary color */
export const TWO_COLOR_STYLES = ['hoodie', 'stripes', 'jacket', 'overalls', 'suit', 'cape', 'kimono'];

/** Face feature enums */
export const FACE_SHAPES = ['oval', 'round', 'square', 'pointy', 'wide', 'pear'];
export const HAIR_STYLES = ['bob', 'long', 'pigtails', 'spiky', 'curly', 'buzz', 'ponytail', 'afro', 'parted', 'slicked'];
export const EYE_SHAPES = ['round', 'almond', 'sleepy', 'wide', 'angry', 'sparkle', 'anime', 'huge', 'dot', 'spiral', 'lashes', 'heart', 'star', 'xEyes', 'money', 'void', 'wink', 'cross'];
export const MOUTH_SHAPES = ['smile', 'smirk', 'grin', 'pout', 'flat', 'open', 'zigzag', 'tongue', 'teeth', 'cat', 'kiss', 'megaMouth', 'vampire', 'duck', 'drool', 'scream'];
export const EYEBROW_STYLES = ['none', 'arched', 'flat', 'angry', 'worried', 'thick', 'thin'];
export const NOSE_STYLES = ['none', 'dot', 'triangle', 'round', 'button'];
export const EXPRESSION_EFFECTS = ['none', 'sweatDrop', 'angerVein', 'sparkle', 'blushLines', 'tears'];

const HEX_COLOR_RE = /^#[0-9A-F]{6}$/;
const EMOJI_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

/** Default face values (Luna's look) */
export const DEFAULT_FACE = {
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
};

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
 * Validate a Mii object against the v3 schema.
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

    // face
    if (!obj.appearance.face || typeof obj.appearance.face !== 'object') {
      errors.push('appearance.face must be an object');
    } else {
      const face = obj.appearance.face;
      if (!FACE_SHAPES.includes(face.faceShape)) {
        errors.push(`appearance.face.faceShape must be one of: ${FACE_SHAPES.join(', ')}`);
      }
      if (!HAIR_STYLES.includes(face.hairStyle)) {
        errors.push(`appearance.face.hairStyle must be one of: ${HAIR_STYLES.join(', ')}`);
      }
      if (typeof face.hairColor !== 'string' || !HEX_COLOR_RE.test(face.hairColor)) {
        errors.push('appearance.face.hairColor must be a hex color like #RRGGBB (uppercase)');
      }
      if (!EYE_SHAPES.includes(face.eyeShape)) {
        errors.push(`appearance.face.eyeShape must be one of: ${EYE_SHAPES.join(', ')}`);
      }
      if (typeof face.eyeColor !== 'string' || !HEX_COLOR_RE.test(face.eyeColor)) {
        errors.push('appearance.face.eyeColor must be a hex color like #RRGGBB (uppercase)');
      }
      if (!MOUTH_SHAPES.includes(face.mouthShape)) {
        errors.push(`appearance.face.mouthShape must be one of: ${MOUTH_SHAPES.join(', ')}`);
      }
      if (!EYEBROW_STYLES.includes(face.eyebrows)) {
        errors.push(`appearance.face.eyebrows must be one of: ${EYEBROW_STYLES.join(', ')}`);
      }
      if (!NOSE_STYLES.includes(face.nose)) {
        errors.push(`appearance.face.nose must be one of: ${NOSE_STYLES.join(', ')}`);
      }
      if (!EXPRESSION_EFFECTS.includes(face.expression)) {
        errors.push(`appearance.face.expression must be one of: ${EXPRESSION_EFFECTS.join(', ')}`);
      }
      if (typeof face.eyelashes !== 'boolean') {
        errors.push('appearance.face.eyelashes must be a boolean');
      }
      if (typeof face.blush !== 'boolean') {
        errors.push('appearance.face.blush must be a boolean');
      }
      if (typeof face.freckles !== 'boolean') {
        errors.push('appearance.face.freckles must be a boolean');
      }
      if (typeof face.beautyMark !== 'boolean') {
        errors.push('appearance.face.beautyMark must be a boolean');
      }
      if (typeof face.scar !== 'boolean') {
        errors.push('appearance.face.scar must be a boolean');
      }
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
 * Migrate a v1 Mii record to v2.
 * Pure function — does not mutate the input.
 *
 * @param {object} v1Mii - A schemaVersion 1 record
 * @returns {object} A valid schemaVersion 2 record
 */
export function migrateV1ToV2(v1Mii) {
  const migrated = JSON.parse(JSON.stringify(v1Mii));

  // Drop the top-level face object
  delete migrated.face;

  // Add appearance.face with v2 defaults (no v3 fields)
  migrated.appearance.face = {
    hairStyle: 'bob',
    hairColor: '#3B2416',
    eyeShape: 'round',
    eyeColor: '#2D1810',
    mouthShape: 'smile',
    eyebrows: 'arched',
    blush: true,
    freckles: false,
  };

  // Bump schema version
  migrated.schemaVersion = 2;

  return migrated;
}

/**
 * Migrate a v2 Mii record to v3.
 * Adds new face fields (faceShape, nose, eyelashes, expression, beautyMark, scar)
 * with sensible defaults. Pure function — does not mutate the input.
 *
 * @param {object} v2Mii - A schemaVersion 2 record
 * @returns {object} A valid schemaVersion 3 record
 */
export function migrateV2ToV3(v2Mii) {
  const migrated = JSON.parse(JSON.stringify(v2Mii));

  // Add new face fields with defaults, preserving existing face data
  const existingFace = migrated.appearance.face || {};
  migrated.appearance.face = {
    faceShape: 'oval',
    ...existingFace,
    nose: existingFace.nose || 'none',
    eyelashes: existingFace.eyelashes ?? false,
    expression: existingFace.expression || 'none',
    beautyMark: existingFace.beautyMark ?? false,
    scar: existingFace.scar ?? false,
  };

  // Bump schema version
  migrated.schemaVersion = 3;

  return migrated;
}

/**
 * Create a blank Mii with sensible defaults. Caller must set a name before saving.
 * @returns {object}
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function createBlankMii() {
  const now = new Date().toISOString();
  return {
    id: generateUUID(),
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
      face: { ...DEFAULT_FACE },
    },
    meta: {
      notes: '',
    },
  };
}
