/**
 * GENERATED BUNDLE — do not edit directly.
 *
 * Canonical sources (edit these instead):
 *   shared/schema/miiSchema.js
 *  shared/schema/exampleMii.js
 *  apps/mii-designer/lib/palette.js
 *  apps/mii-designer/lib/toast.js
 *  apps/mii-designer/lib/miiRenderer.js
 *  apps/mii-designer/lib/storage.js
 *  apps/mii-designer/lib/miiAnimator.js
 *  apps/mii-designer/main.js
 *
 * This file is an IIFE so it works when opened via file:// (double-click).
 * ES modules are blocked on the file:// protocol by browser CORS policy.
 * Rebuild by running:  node apps/mii-designer/build.js
 */

(function () {
  'use strict';

/* ================================================================
   shared/schema/miiSchema.js
   ================================================================ */

/**
 * Mii schema validation, constants, and factory.
 * Importable by both the designer app and future phases.
 *
 * @module miiSchema
 */

const SCHEMA_VERSION = 4;

const SKIN_TONES = ['pale', 'light', 'tan', 'olive', 'brown', 'deep'];
const BODY_SHAPES = ['narrow', 'regular', 'stocky'];
const OUTFIT_STYLES = ['tshirt', 'hoodie', 'dress', 'stripes', 'jacket', 'overalls', 'suit', 'cape', 'tanktop', 'kimono'];
const ACCESSORIES = ['none', 'glasses', 'hat', 'bow', 'headphones', 'sunglasses', 'crown', 'bandana', 'earrings', 'mask', 'horns'];

/** Outfit styles that use a secondary color */
const TWO_COLOR_STYLES = ['hoodie', 'stripes', 'jacket', 'overalls', 'suit', 'cape', 'kimono'];

/** Face feature enums */
const FACE_SHAPES = ['oval', 'round', 'square', 'pointy', 'wide', 'pear'];
const HAIR_STYLES = ['bob', 'long', 'pigtails', 'spiky', 'curly', 'buzz', 'ponytail', 'afro', 'parted', 'slicked'];
const EYE_SHAPES = ['round', 'almond', 'sleepy', 'wide', 'angry', 'sparkle', 'anime', 'huge', 'dot', 'spiral', 'lashes', 'heart', 'star', 'xEyes', 'money', 'void', 'wink', 'cross'];
const MOUTH_SHAPES = ['smile', 'smirk', 'grin', 'pout', 'flat', 'open', 'zigzag', 'tongue', 'teeth', 'cat', 'kiss', 'megaMouth', 'vampire', 'duck', 'drool', 'scream'];
const EYEBROW_STYLES = ['none', 'arched', 'flat', 'angry', 'worried', 'thick', 'thin'];
const NOSE_STYLES = ['none', 'dot', 'triangle', 'round', 'button'];
const EXPRESSION_EFFECTS = ['none', 'sweatDrop', 'angerVein', 'sparkle', 'blushLines', 'tears'];

/** Voice enums for Gemini Live */
const VOICES = ['Aoede', 'Puck', 'Charon', 'Kore', 'Fenrir'];

const HEX_COLOR_RE = /^#[0-9A-F]{6}$/;
const EMOJI_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

/** Default face values (Luna's look) */
const DEFAULT_FACE = {
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
function stripEmoji(str) {
  return str.replace(EMOJI_RE, '');
}

/**
 * Sanitize a Mii name: trim whitespace, strip emoji, enforce max length.
 * @param {string} raw
 * @returns {string}
 */
function sanitizeName(raw) {
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
function validateMii(obj) {
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
    if (!VOICES.includes(obj.meta.voice)) {
      errors.push(`meta.voice must be one of: ${VOICES.join(', ')}`);
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
function migrateV1ToV2(v1Mii) {
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
function migrateV2ToV3(v2Mii) {
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
 * Migrate a v3 Mii record to v4.
 * Adds new meta fields (voice) with sensible defaults.
 * Pure function — does not mutate the input.
 *
 * @param {object} v3Mii - A schemaVersion 3 record
 * @returns {object} A valid schemaVersion 4 record
 */
function migrateV3ToV4(v3Mii) {
  const migrated = JSON.parse(JSON.stringify(v3Mii));

  // Add voice default
  const existingMeta = migrated.meta || {};
  migrated.meta = {
    ...existingMeta,
    voice: existingMeta.voice || VOICES[Math.floor(Math.random() * VOICES.length)],
  };

  // Bump schema version
  migrated.schemaVersion = 4;

  return migrated;
}

/**
 * Create a blank Mii with sensible defaults. Caller must set a name before saving.
 * @returns {object}
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function createBlankMii() {
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
      voice: VOICES[Math.floor(Math.random() * VOICES.length)],
    },
  };
}


/* ================================================================
   shared/schema/exampleMii.js
   ================================================================ */

/**
 * Example Mii — the default character loaded on first run.
 * @module exampleMii
 */

const EXAMPLE_MII = {
  id: '00000000-0000-4000-8000-000000000001',
  schemaVersion: 4,
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
  meta: {
    notes: '',
    voice: 'Aoede',
  },
};


/* ================================================================
   apps/mii-designer/lib/palette.js
   ================================================================ */

/**
 * Color palettes for Mii rendering.
 *
 * @module palette
 */

/** Skin tone name → hex color for SVG rendering */
const SKIN_TONE_COLORS = {
  pale:  '#F5D4B8',
  light: '#E8B591',
  tan:   '#C98E6F',
  olive: '#A97054',
  brown: '#7D4E38',
  deep:  '#4A2D1E',
};

/** Body shape name → torso half-width in SVG units (at 240×320 base) */
const BODY_WIDTHS = {
  narrow:  40,
  regular: 56,
  stocky:  72,
};


/* ================================================================
   apps/mii-designer/lib/toast.js
   ================================================================ */

/**
 * Lightweight toast notification system.
 * Appends a fixed-position container to the DOM on first use.
 *
 * @module toast
 */

let container = null;

function ensureContainer() {
  if (container) return;
  container = document.createElement('div');
  container.id = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success' | 'error' | 'info'} [type='info']
 * @param {number} [durationMs=3000]
 */
function showToast(message, type = 'info', durationMs = 3000) {
  ensureContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');

  toast.addEventListener('click', () => dismiss(toast));

  container.appendChild(toast);

  // Trigger entry animation on next frame
  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  setTimeout(() => dismiss(toast), durationMs);
}

function dismiss(toast) {
  toast.classList.remove('toast--visible');
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  // Fallback removal if transitionend doesn't fire
  setTimeout(() => toast.remove(), 400);
}


/* ================================================================
   apps/mii-designer/lib/miiRenderer.js
   ================================================================ */

/**
 * SVG rendering engine for Mii characters.
 * Composes layers bottom-to-top: body → arms → head → blush → freckles → beautyMark → scar →
 * nose → eyebrows → eyelashes → eyes → mouth → expression → hair → accessory.
 * Returns a complete SVG string from Mii state. Pure functions only — no side effects.
 *
 * @module miiRenderer
 */



const SPRITE_W = 240;
const SPRITE_H = 320;

/* -- Default head geometry (shared by all face-part renderers) -- */
const HEAD_CX = 120;
const HEAD_CY = 110;
const HEAD_RX = 72;
const HEAD_RY = 82;

/* -- Body geometry -- */
const BODY_TOP = 185;
const BODY_BOTTOM = 310;
const BODY_CX = 120;
const ARM_WIDTH = 14;
const ARM_LENGTH = 60;

/* ------------------------------------------------------------------ */
/*  Face shape geometry                                               */
/* ------------------------------------------------------------------ */

/**
 * Get head geometry overrides based on face shape.
 * @param {string} shape
 * @returns {{ rx: number, ry: number, path?: string }}
 */
function getHeadGeometry(shape) {
  switch (shape) {
    case 'round':  return { rx: 78, ry: 78 };
    case 'square': return { rx: 68, ry: 74 };
    case 'pointy': return { rx: 66, ry: 86 };
    case 'wide':   return { rx: 82, ry: 74 };
    case 'pear':   return { rx: 76, ry: 80 };
    case 'oval':
    default:       return { rx: HEAD_RX, ry: HEAD_RY };
  }
}

/**
 * Render the head shape SVG.
 * @param {string} shape
 * @param {string} skinColor
 * @returns {string}
 */
function renderHead(shape, skinColor) {
  const g = getHeadGeometry(shape);
  if (shape === 'square') {
    const w = g.rx * 2, h = g.ry * 2;
    return `<rect x="${HEAD_CX - g.rx}" y="${HEAD_CY - g.ry}" width="${w}" height="${h}" rx="18" fill="${skinColor}" />`;
  }
  if (shape === 'pear') {
    return `<path d="M${HEAD_CX} ${HEAD_CY - g.ry}
      Q${HEAD_CX + g.rx - 10} ${HEAD_CY - g.ry} ${HEAD_CX + g.rx - 6} ${HEAD_CY - 10}
      Q${HEAD_CX + g.rx + 4} ${HEAD_CY + 20} ${HEAD_CX + g.rx - 2} ${HEAD_CY + g.ry - 10}
      Q${HEAD_CX} ${HEAD_CY + g.ry + 6} ${HEAD_CX - g.rx + 2} ${HEAD_CY + g.ry - 10}
      Q${HEAD_CX - g.rx - 4} ${HEAD_CY + 20} ${HEAD_CX - g.rx + 6} ${HEAD_CY - 10}
      Q${HEAD_CX - g.rx + 10} ${HEAD_CY - g.ry} ${HEAD_CX} ${HEAD_CY - g.ry} Z"
      fill="${skinColor}" />`;
  }
  return `<ellipse cx="${HEAD_CX}" cy="${HEAD_CY}" rx="${g.rx}" ry="${g.ry}" fill="${skinColor}" />`;
}

/* ------------------------------------------------------------------ */
/*  Utility                                                           */
/* ------------------------------------------------------------------ */

/**
 * Darken a hex color by a given amount (0-255 per channel).
 * @param {string} hex
 * @param {number} amount
 * @returns {string}
 */
function darken(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
  const b = Math.max(0, (num & 0xFF) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase()}`;
}

/* ------------------------------------------------------------------ */
/*  Outfit renderers                                                  */
/* ------------------------------------------------------------------ */

function outfitTshirt(halfW, primary) {
  return `
    <rect x="${BODY_CX - halfW}" y="${BODY_TOP}" width="${halfW * 2}" height="${BODY_BOTTOM - BODY_TOP}" rx="12" fill="${primary}" />
    <path d="M${BODY_CX - halfW + 10} ${BODY_TOP} Q${BODY_CX} ${BODY_TOP + 20} ${BODY_CX + halfW - 10} ${BODY_TOP}"
          stroke="${darken(primary, 20)}" stroke-width="2" fill="none" />
  `;
}

function outfitHoodie(halfW, primary, secondary) {
  const hoodColor = secondary || darken(primary, 30);
  return `
    <rect x="${BODY_CX - halfW}" y="${BODY_TOP}" width="${halfW * 2}" height="${BODY_BOTTOM - BODY_TOP}" rx="12" fill="${primary}" />
    <ellipse cx="${HEAD_CX}" cy="${BODY_TOP - 2}" rx="${halfW - 4}" ry="18" fill="${hoodColor}" />
    <rect x="${BODY_CX - halfW + 8}" y="${BODY_TOP + 60}" width="${halfW * 2 - 16}" height="22" rx="6" fill="${darken(primary, 15)}" opacity="0.4" />
    <line x1="${BODY_CX - 6}" y1="${BODY_TOP + 4}" x2="${BODY_CX - 6}" y2="${BODY_TOP + 28}" stroke="${hoodColor}" stroke-width="2" stroke-linecap="round" />
    <line x1="${BODY_CX + 6}" y1="${BODY_TOP + 4}" x2="${BODY_CX + 6}" y2="${BODY_TOP + 28}" stroke="${hoodColor}" stroke-width="2" stroke-linecap="round" />
  `;
}

function outfitDress(halfW, primary) {
  const flareW = halfW + 16;
  return `
    <path d="M${BODY_CX - halfW} ${BODY_TOP} L${BODY_CX - flareW} ${BODY_BOTTOM} Q${BODY_CX} ${BODY_BOTTOM + 6} ${BODY_CX + flareW} ${BODY_BOTTOM} L${BODY_CX + halfW} ${BODY_TOP} Z"
          fill="${primary}" />
    <path d="M${BODY_CX - 14} ${BODY_TOP} Q${BODY_CX} ${BODY_TOP + 12} ${BODY_CX + 14} ${BODY_TOP}"
          stroke="${darken(primary, 20)}" stroke-width="2" fill="none" />
  `;
}

function outfitStripes(halfW, primary, secondary) {
  const stripeColor = secondary || darken(primary, 25);
  const stripeH = 10;
  const gap = 14;
  let stripes = '';
  for (let y = BODY_TOP + 16; y < BODY_BOTTOM - 20; y += gap + stripeH) {
    stripes += `<rect x="${BODY_CX - halfW + 4}" y="${y}" width="${halfW * 2 - 8}" height="${stripeH}" rx="3" fill="${stripeColor}" opacity="0.6" />`;
  }
  return `
    <rect x="${BODY_CX - halfW}" y="${BODY_TOP}" width="${halfW * 2}" height="${BODY_BOTTOM - BODY_TOP}" rx="12" fill="${primary}" />
    ${stripes}
  `;
}

function outfitJacket(halfW, primary, secondary) {
  const innerColor = secondary || '#FFFFFF';
  return `
    <rect x="${BODY_CX - halfW}" y="${BODY_TOP}" width="${halfW * 2}" height="${BODY_BOTTOM - BODY_TOP}" rx="12" fill="${primary}" />
    <path d="M${BODY_CX - 12} ${BODY_TOP} L${BODY_CX} ${BODY_TOP + 40} L${BODY_CX + 12} ${BODY_TOP}" fill="${innerColor}" />
    <line x1="${BODY_CX}" y1="${BODY_TOP}" x2="${BODY_CX}" y2="${BODY_BOTTOM - 10}"
          stroke="${darken(primary, 20)}" stroke-width="1.5" opacity="0.5" />
  `;
}

function outfitOveralls(halfW, primary, secondary) {
  const shirtColor = secondary || '#FFFFFF';
  return `
    <rect x="${BODY_CX - halfW}" y="${BODY_TOP}" width="${halfW * 2}" height="${BODY_BOTTOM - BODY_TOP}" rx="12" fill="${shirtColor}" />
    <rect x="${BODY_CX - halfW + 4}" y="${BODY_TOP + 30}" width="${halfW * 2 - 8}" height="${BODY_BOTTOM - BODY_TOP - 30}" rx="8" fill="${primary}" />
    <rect x="${BODY_CX - halfW + 8}" y="${BODY_TOP + 4}" width="10" height="30" rx="3" fill="${primary}" />
    <rect x="${BODY_CX + halfW - 18}" y="${BODY_TOP + 4}" width="10" height="30" rx="3" fill="${primary}" />
    <rect x="${BODY_CX - 12}" y="${BODY_TOP + 60}" width="24" height="18" rx="4" fill="${darken(primary, 15)}" opacity="0.4" />
  `;
}

function outfitSuit(halfW, primary, secondary) {
  const innerColor = secondary || '#FFFFFF';
  return `
    <rect x="${BODY_CX - halfW}" y="${BODY_TOP}" width="${halfW * 2}" height="${BODY_BOTTOM - BODY_TOP}" rx="12" fill="${primary}" />
    <path d="M${BODY_CX - 12} ${BODY_TOP} L${BODY_CX} ${BODY_TOP + 50} L${BODY_CX + 12} ${BODY_TOP}" fill="${innerColor}" />
    <line x1="${BODY_CX}" y1="${BODY_TOP + 50}" x2="${BODY_CX}" y2="${BODY_BOTTOM - 10}" stroke="${darken(primary, 20)}" stroke-width="1.5" />
    <rect x="${BODY_CX - halfW + 4}" y="${BODY_TOP + 8}" width="8" height="8" rx="2" fill="${darken(primary, 15)}" opacity="0.5" />
  `;
}

function outfitCape(halfW, primary, secondary) {
  const capeColor = secondary || darken(primary, 20);
  return `
    <path d="M${BODY_CX - halfW - 16} ${BODY_TOP - 5} Q${BODY_CX} ${BODY_TOP + 10} ${BODY_CX + halfW + 16} ${BODY_TOP - 5} L${BODY_CX + halfW + 20} ${BODY_BOTTOM + 10} Q${BODY_CX} ${BODY_BOTTOM - 5} ${BODY_CX - halfW - 20} ${BODY_BOTTOM + 10} Z" fill="${capeColor}" opacity="0.7" />
    <rect x="${BODY_CX - halfW}" y="${BODY_TOP}" width="${halfW * 2}" height="${BODY_BOTTOM - BODY_TOP}" rx="12" fill="${primary}" />
  `;
}

function outfitTanktop(halfW, primary) {
  const inset = 10;
  return `
    <rect x="${BODY_CX - halfW + inset}" y="${BODY_TOP}" width="${(halfW - inset) * 2}" height="${BODY_BOTTOM - BODY_TOP}" rx="10" fill="${primary}" />
    <path d="M${BODY_CX - halfW + inset + 6} ${BODY_TOP} Q${BODY_CX} ${BODY_TOP + 16} ${BODY_CX + halfW - inset - 6} ${BODY_TOP}" stroke="${darken(primary, 20)}" stroke-width="2" fill="none" />
  `;
}

function outfitKimono(halfW, primary, secondary) {
  const accentColor = secondary || darken(primary, 20);
  return `
    <rect x="${BODY_CX - halfW}" y="${BODY_TOP}" width="${halfW * 2}" height="${BODY_BOTTOM - BODY_TOP}" rx="12" fill="${primary}" />
    <path d="M${BODY_CX - 20} ${BODY_TOP} L${BODY_CX} ${BODY_TOP + 60} L${BODY_CX + 20} ${BODY_TOP}" fill="${darken(primary, 10)}" />
    <rect x="${BODY_CX - halfW}" y="${BODY_TOP + 55}" width="${halfW * 2}" height="14" rx="3" fill="${accentColor}" />
  `;
}

const OUTFIT_RENDERERS = {
  tshirt: outfitTshirt,
  hoodie: outfitHoodie,
  dress: outfitDress,
  stripes: outfitStripes,
  jacket: outfitJacket,
  overalls: outfitOveralls,
  suit: outfitSuit,
  cape: outfitCape,
  tanktop: outfitTanktop,
  kimono: outfitKimono,
};

/* ------------------------------------------------------------------ */
/*  Accessory renderers                                               */
/* ------------------------------------------------------------------ */

function accessoryGlasses() {
  const y = HEAD_CY - 4;
  return `
    <g class="accessory-glasses">
      <circle cx="${HEAD_CX - 22}" cy="${y}" r="16" fill="none" stroke="#3A3A3A" stroke-width="3" />
      <circle cx="${HEAD_CX + 22}" cy="${y}" r="16" fill="none" stroke="#3A3A3A" stroke-width="3" />
      <line x1="${HEAD_CX - 6}" y1="${y}" x2="${HEAD_CX + 6}" y2="${y}" stroke="#3A3A3A" stroke-width="2.5" />
      <line x1="${HEAD_CX - 38}" y1="${y}" x2="${HEAD_CX - HEAD_RX + 8}" y2="${y - 6}" stroke="#3A3A3A" stroke-width="2.5" />
      <line x1="${HEAD_CX + 38}" y1="${y}" x2="${HEAD_CX + HEAD_RX - 8}" y2="${y - 6}" stroke="#3A3A3A" stroke-width="2.5" />
    </g>
  `;
}

function accessoryHat() {
  return `
    <g class="accessory-hat">
      <ellipse cx="${HEAD_CX}" cy="${HEAD_CY - HEAD_RY + 12}" rx="${HEAD_RX + 10}" ry="10" fill="#5A4A3A" />
      <rect x="${HEAD_CX - 40}" y="${HEAD_CY - HEAD_RY - 32}" width="80" height="44" rx="12" fill="#5A4A3A" />
      <rect x="${HEAD_CX - 40}" y="${HEAD_CY - HEAD_RY}" width="80" height="8" rx="2" fill="#8B6F47" />
    </g>
  `;
}

function accessoryBow() {
  const bx = HEAD_CX + 36;
  const by = HEAD_CY - HEAD_RY + 18;
  return `
    <g class="accessory-bow">
      <ellipse cx="${bx - 14}" cy="${by}" rx="14" ry="10" fill="#E85A7A" />
      <ellipse cx="${bx + 14}" cy="${by}" rx="14" ry="10" fill="#E85A7A" />
      <circle cx="${bx}" cy="${by}" r="5" fill="#C94060" />
    </g>
  `;
}

function accessoryHeadphones() {
  return `
    <g class="accessory-headphones">
      <path d="M${HEAD_CX - HEAD_RX + 4} ${HEAD_CY - 10} Q${HEAD_CX} ${HEAD_CY - HEAD_RY - 30} ${HEAD_CX + HEAD_RX - 4} ${HEAD_CY - 10}"
            fill="none" stroke="#444" stroke-width="5" stroke-linecap="round" />
      <rect x="${HEAD_CX - HEAD_RX - 2}" y="${HEAD_CY - 20}" width="16" height="26" rx="6" fill="#444" />
      <rect x="${HEAD_CX - HEAD_RX}" y="${HEAD_CY - 16}" width="12" height="18" rx="4" fill="#666" />
      <rect x="${HEAD_CX + HEAD_RX - 14}" y="${HEAD_CY - 20}" width="16" height="26" rx="6" fill="#444" />
      <rect x="${HEAD_CX + HEAD_RX - 12}" y="${HEAD_CY - 16}" width="12" height="18" rx="4" fill="#666" />
    </g>
  `;
}

function accessorySunglasses() {
  const y = HEAD_CY - 4;
  return `
    <g>
      <rect x="${HEAD_CX - 38}" y="${y - 10}" width="28" height="20" rx="4" fill="#1A1A1A" />
      <rect x="${HEAD_CX + 10}" y="${y - 10}" width="28" height="20" rx="4" fill="#1A1A1A" />
      <line x1="${HEAD_CX - 10}" y1="${y}" x2="${HEAD_CX + 10}" y2="${y}" stroke="#1A1A1A" stroke-width="2.5" />
    </g>
  `;
}

function accessoryCrown() {
  const cy = HEAD_CY - HEAD_RY - 8;
  return `
    <polygon points="${HEAD_CX - 30},${cy + 16} ${HEAD_CX - 30},${cy} ${HEAD_CX - 15},${cy + 8} ${HEAD_CX},${cy - 6} ${HEAD_CX + 15},${cy + 8} ${HEAD_CX + 30},${cy} ${HEAD_CX + 30},${cy + 16}" fill="#FFD700" />
    <circle cx="${HEAD_CX}" cy="${cy - 2}" r="3" fill="#E85A5A" />
  `;
}

function accessoryBandana() {
  return `
    <path d="M${HEAD_CX - HEAD_RX + 6} ${HEAD_CY - HEAD_RY + 18} Q${HEAD_CX} ${HEAD_CY - HEAD_RY + 4} ${HEAD_CX + HEAD_RX - 6} ${HEAD_CY - HEAD_RY + 18}" fill="#E85A5A" />
    <line x1="${HEAD_CX + HEAD_RX - 10}" y1="${HEAD_CY - HEAD_RY + 18}" x2="${HEAD_CX + HEAD_RX + 6}" y2="${HEAD_CY - HEAD_RY + 30}" stroke="#E85A5A" stroke-width="4" stroke-linecap="round" />
  `;
}

function accessoryEarrings() {
  const ey = HEAD_CY + 20;
  return `
    <circle cx="${HEAD_CX - HEAD_RX + 4}" cy="${ey}" r="4" fill="#FFD700" />
    <circle cx="${HEAD_CX + HEAD_RX - 4}" cy="${ey}" r="4" fill="#FFD700" />
  `;
}

function accessoryMask() {
  return `
    <rect x="${HEAD_CX - 30}" y="${HEAD_CY + 8}" width="60" height="30" rx="10" fill="#EEEEEE" />
    <line x1="${HEAD_CX - 30}" y1="${HEAD_CY + 18}" x2="${HEAD_CX - HEAD_RX + 6}" y2="${HEAD_CY + 6}" stroke="#CCCCCC" stroke-width="2" />
    <line x1="${HEAD_CX + 30}" y1="${HEAD_CY + 18}" x2="${HEAD_CX + HEAD_RX - 6}" y2="${HEAD_CY + 6}" stroke="#CCCCCC" stroke-width="2" />
  `;
}

function accessoryHorns() {
  return `
    <path d="M${HEAD_CX - 28} ${HEAD_CY - HEAD_RY + 12} Q${HEAD_CX - 38} ${HEAD_CY - HEAD_RY - 20} ${HEAD_CX - 20} ${HEAD_CY - HEAD_RY - 10}" stroke="#8B4513" stroke-width="6" fill="none" stroke-linecap="round" />
    <path d="M${HEAD_CX + 28} ${HEAD_CY - HEAD_RY + 12} Q${HEAD_CX + 38} ${HEAD_CY - HEAD_RY - 20} ${HEAD_CX + 20} ${HEAD_CY - HEAD_RY - 10}" stroke="#8B4513" stroke-width="6" fill="none" stroke-linecap="round" />
  `;
}

const ACCESSORY_RENDERERS = {
  none: () => '',
  glasses: accessoryGlasses,
  hat: accessoryHat,
  bow: accessoryBow,
  headphones: accessoryHeadphones,
  sunglasses: accessorySunglasses,
  crown: accessoryCrown,
  bandana: accessoryBandana,
  earrings: accessoryEarrings,
  mask: accessoryMask,
  horns: accessoryHorns,
};

/* ------------------------------------------------------------------ */
/*  Arms                                                              */
/* ------------------------------------------------------------------ */

function renderArms(halfW, skinColor) {
  const leftX = BODY_CX - halfW - ARM_WIDTH / 2;
  const rightX = BODY_CX + halfW - ARM_WIDTH / 2;
  const armTop = BODY_TOP + 10;
  return `
    <rect x="${leftX}" y="${armTop}" width="${ARM_WIDTH}" height="${ARM_LENGTH}" rx="${ARM_WIDTH / 2}" fill="${skinColor}" />
    <rect x="${rightX}" y="${armTop}" width="${ARM_WIDTH}" height="${ARM_LENGTH}" rx="${ARM_WIDTH / 2}" fill="${skinColor}" />
  `;
}

/* ------------------------------------------------------------------ */
/*  Face part renderers                                               */
/* ------------------------------------------------------------------ */

/* Eye positions — consistent across all eye shapes */
const EYE_LEFT_X = HEAD_CX - 22;
const EYE_RIGHT_X = HEAD_CX + 22;
const EYE_Y = HEAD_CY - 8;

/**
 * Render eyes — symmetric pair with white glint.
 * @param {string} shape
 * @param {string} color
 * @returns {string}
 */
function renderEyes(shape, color) {
  const lx = EYE_LEFT_X, rx = EYE_RIGHT_X, ey = EYE_Y;
  const glint = `
    <circle cx="${lx - 4}" cy="${ey - 5}" r="3" fill="#FFFFFF" />
    <circle cx="${rx - 4}" cy="${ey - 5}" r="3" fill="#FFFFFF" />
  `;

  switch (shape) {
    case 'round':
      return `
        <ellipse cx="${lx}" cy="${ey}" rx="8" ry="10" fill="${color}" />
        <ellipse cx="${rx}" cy="${ey}" rx="8" ry="10" fill="${color}" />
        ${glint}
      `;
    case 'almond':
      return `
        <path d="M${lx - 9} ${ey} A 10 7 0 0 1 ${lx + 9} ${ey} A 10 7 0 0 1 ${lx - 9} ${ey} Z" fill="${color}" />
        <path d="M${rx - 9} ${ey} A 10 7 0 0 1 ${rx + 9} ${ey} A 10 7 0 0 1 ${rx - 9} ${ey} Z" fill="${color}" />
        <circle cx="${lx - 2}" cy="${ey - 2}" r="2" fill="#FFFFFF" />
        <circle cx="${rx - 2}" cy="${ey - 2}" r="2" fill="#FFFFFF" />
      `;
    case 'sleepy': {
      /* Half-closed: bottom semi-circle with a thick flat top line acting as the eyelid */
      return `
        <path d="M${lx - 9} ${ey} A 9 10 0 0 0 ${lx + 9} ${ey} Z" fill="${color}" />
        <path d="M${rx - 9} ${ey} A 9 10 0 0 0 ${rx + 9} ${ey} Z" fill="${color}" />
        <line x1="${lx - 10}" y1="${ey}" x2="${lx + 10}" y2="${ey}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
        <line x1="${rx - 10}" y1="${ey}" x2="${rx + 10}" y2="${ey}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
        <circle cx="${lx - 4}" cy="${ey + 3}" r="2.5" fill="#FFFFFF" />
        <circle cx="${rx - 4}" cy="${ey + 3}" r="2.5" fill="#FFFFFF" />
      `;
    }
    case 'wide':
      return `
        <ellipse cx="${lx}" cy="${ey}" rx="10" ry="13" fill="${color}" />
        <ellipse cx="${rx}" cy="${ey}" rx="10" ry="13" fill="${color}" />
        ${glint}
      `;
    case 'angry': {
      /* Angled — achieved by rotating a half-closed eye to avoid arc calculation bugs */
      return `
        <g transform="rotate(15, ${lx}, ${ey})">
          <path d="M${lx - 9} ${ey} A 9 9 0 0 0 ${lx + 9} ${ey} Z" fill="${color}" />
          <line x1="${lx - 10}" y1="${ey}" x2="${lx + 10}" y2="${ey}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
          <circle cx="${lx}" cy="${ey + 3}" r="2" fill="#FFFFFF" />
        </g>
        <g transform="rotate(-15, ${rx}, ${ey})">
          <path d="M${rx - 9} ${ey} A 9 9 0 0 0 ${rx + 9} ${ey} Z" fill="${color}" />
          <line x1="${rx - 10}" y1="${ey}" x2="${rx + 10}" y2="${ey}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
          <circle cx="${rx}" cy="${ey + 3}" r="2" fill="#FFFFFF" />
        </g>
      `;
    }
    case 'sparkle':
      return `
        <ellipse cx="${lx}" cy="${ey}" rx="9" ry="10" fill="${color}" />
        <ellipse cx="${rx}" cy="${ey}" rx="9" ry="10" fill="${color}" />
        <circle cx="${lx - 3}" cy="${ey - 4}" r="4" fill="#FFFFFF" />
        <circle cx="${lx + 3}" cy="${ey + 3}" r="2" fill="#FFFFFF" />
        <circle cx="${rx - 3}" cy="${ey - 4}" r="4" fill="#FFFFFF" />
        <circle cx="${rx + 3}" cy="${ey + 3}" r="2" fill="#FFFFFF" />
      `;
    case 'anime':
      return `
        <ellipse cx="${lx}" cy="${ey}" rx="11" ry="16" fill="${color}" />
        <ellipse cx="${rx}" cy="${ey}" rx="11" ry="16" fill="${color}" />
        <ellipse cx="${lx - 3}" cy="${ey - 6}" rx="4" ry="6" fill="#FFFFFF" />
        <circle cx="${lx + 3}" cy="${ey + 6}" r="2.5" fill="#FFFFFF" />
        <ellipse cx="${rx - 3}" cy="${ey - 6}" rx="4" ry="6" fill="#FFFFFF" />
        <circle cx="${rx + 3}" cy="${ey + 6}" r="2.5" fill="#FFFFFF" />
      `;
    case 'huge':
      return `
        <circle cx="${lx}" cy="${ey}" r="14" fill="${color}" />
        <circle cx="${rx}" cy="${ey}" r="14" fill="${color}" />
        <circle cx="${lx - 4}" cy="${ey - 5}" r="5" fill="#FFFFFF" />
        <circle cx="${rx - 4}" cy="${ey - 5}" r="5" fill="#FFFFFF" />
      `;
    case 'dot':
      return `
        <circle cx="${lx}" cy="${ey}" r="6" fill="${color}" />
        <circle cx="${rx}" cy="${ey}" r="6" fill="${color}" />
      `;
    case 'spiral':
      return `
        <circle cx="${lx}" cy="${ey}" r="10" fill="none" stroke="${color}" stroke-width="2.5" />
        <circle cx="${lx}" cy="${ey}" r="4" fill="${color}" />
        <circle cx="${rx}" cy="${ey}" r="10" fill="none" stroke="${color}" stroke-width="2.5" />
        <circle cx="${rx}" cy="${ey}" r="4" fill="${color}" />
      `;
    case 'lashes':
      return `
        <ellipse cx="${lx}" cy="${ey}" rx="9" ry="11" fill="${color}" />
        <ellipse cx="${rx}" cy="${ey}" rx="9" ry="11" fill="${color}" />
        ${glint}
        <line x1="${lx - 10}" y1="${ey - 8}" x2="${lx - 14}" y2="${ey - 14}" stroke="${color}" stroke-width="2" stroke-linecap="round" />
        <line x1="${lx}" y1="${ey - 11}" x2="${lx}" y2="${ey - 17}" stroke="${color}" stroke-width="2" stroke-linecap="round" />
        <line x1="${lx + 10}" y1="${ey - 8}" x2="${lx + 14}" y2="${ey - 14}" stroke="${color}" stroke-width="2" stroke-linecap="round" />
        <line x1="${rx - 10}" y1="${ey - 8}" x2="${rx - 14}" y2="${ey - 14}" stroke="${color}" stroke-width="2" stroke-linecap="round" />
        <line x1="${rx}" y1="${ey - 11}" x2="${rx}" y2="${ey - 17}" stroke="${color}" stroke-width="2" stroke-linecap="round" />
        <line x1="${rx + 10}" y1="${ey - 8}" x2="${rx + 14}" y2="${ey - 14}" stroke="${color}" stroke-width="2" stroke-linecap="round" />
      `;
    case 'heart':
      return `
        <path d="M${lx} ${ey + 6} C${lx - 12} ${ey - 2} ${lx - 12} ${ey - 12} ${lx} ${ey - 6} C${lx + 12} ${ey - 12} ${lx + 12} ${ey - 2} ${lx} ${ey + 6} Z" fill="${color}" />
        <path d="M${rx} ${ey + 6} C${rx - 12} ${ey - 2} ${rx - 12} ${ey - 12} ${rx} ${ey - 6} C${rx + 12} ${ey - 12} ${rx + 12} ${ey - 2} ${rx} ${ey + 6} Z" fill="${color}" />
      `;
    case 'star': {
      const starPath = (cx, cy, r) => {
        const pts = [];
        for (let i = 0; i < 5; i++) {
          const aOuter = (i * 72 - 90) * Math.PI / 180;
          const aInner = ((i * 72) + 36 - 90) * Math.PI / 180;
          pts.push(`${cx + r * Math.cos(aOuter)},${cy + r * Math.sin(aOuter)}`);
          pts.push(`${cx + r * 0.45 * Math.cos(aInner)},${cy + r * 0.45 * Math.sin(aInner)}`);
        }
        return pts.join(' ');
      };
      return `
        <polygon points="${starPath(lx, ey, 10)}" fill="${color}" />
        <polygon points="${starPath(rx, ey, 10)}" fill="${color}" />
      `;
    }
    case 'xEyes':
      return `
        <line x1="${lx - 7}" y1="${ey - 7}" x2="${lx + 7}" y2="${ey + 7}" stroke="${color}" stroke-width="3.5" stroke-linecap="round" />
        <line x1="${lx + 7}" y1="${ey - 7}" x2="${lx - 7}" y2="${ey + 7}" stroke="${color}" stroke-width="3.5" stroke-linecap="round" />
        <line x1="${rx - 7}" y1="${ey - 7}" x2="${rx + 7}" y2="${ey + 7}" stroke="${color}" stroke-width="3.5" stroke-linecap="round" />
        <line x1="${rx + 7}" y1="${ey - 7}" x2="${rx - 7}" y2="${ey + 7}" stroke="${color}" stroke-width="3.5" stroke-linecap="round" />
      `;
    case 'money':
      return `
        <circle cx="${lx}" cy="${ey}" r="11" fill="${color}" />
        <circle cx="${rx}" cy="${ey}" r="11" fill="${color}" />
        <text x="${lx}" y="${ey + 4}" text-anchor="middle" font-size="14" font-weight="bold" fill="#FFFFFF" font-family="sans-serif">$</text>
        <text x="${rx}" y="${ey + 4}" text-anchor="middle" font-size="14" font-weight="bold" fill="#FFFFFF" font-family="sans-serif">$</text>
      `;
    case 'void':
      return `
        <circle cx="${lx}" cy="${ey}" r="12" fill="#000000" />
        <circle cx="${rx}" cy="${ey}" r="12" fill="#000000" />
      `;
    case 'wink':
      return `
        <ellipse cx="${lx}" cy="${ey}" rx="8" ry="10" fill="${color}" />
        ${glint}
        <path d="M${rx - 10} ${ey} Q${rx} ${ey + 4} ${rx + 10} ${ey}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" />
      `;
    case 'cross':
      return `
        <ellipse cx="${lx + 6}" cy="${ey}" rx="8" ry="10" fill="${color}" />
        <circle cx="${lx + 2}" cy="${ey - 4}" r="3" fill="#FFFFFF" />
        <ellipse cx="${rx - 6}" cy="${ey}" rx="8" ry="10" fill="${color}" />
        <circle cx="${rx - 2}" cy="${ey - 4}" r="3" fill="#FFFFFF" />
      `;
    default:
      return renderEyes('round', color);
  }
}

/* Mouth is roughly at this Y, centered on HEAD_CX */
const MOUTH_Y = HEAD_CY + 24;

/**
 * Render mouth shape.
 * @param {string} shape
 * @returns {string}
 */
function renderMouth(shape) {
  const mx = HEAD_CX, my = MOUTH_Y;
  const stroke = '#2D1B1B';
  switch (shape) {
    case 'smile':
      return `<path d="M${mx - 13} ${my} Q${mx} ${my + 12} ${mx + 13} ${my}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" />`;
    case 'smirk':
      return `<path d="M${mx - 10} ${my + 2} Q${mx + 2} ${my - 4} ${mx + 13} ${my - 6}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" />`;
    case 'grin':
      return `
        <path d="M${mx - 16} ${my - 2} Q${mx} ${my + 16} ${mx + 16} ${my - 2}" stroke="${stroke}" stroke-width="2" fill="#BB4444" />
        <path d="M${mx - 16} ${my - 2} Q${mx} ${my + 16} ${mx + 16} ${my - 2}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" />
      `;
    case 'pout':
      return `<path d="M${mx - 9} ${my} Q${mx} ${my - 8} ${mx + 9} ${my}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" />`;
    case 'flat':
      return `<line x1="${mx - 12}" y1="${my}" x2="${mx + 12}" y2="${my}" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" />`;
    case 'open':
      return `
        <ellipse cx="${mx}" cy="${my + 2}" rx="11" ry="8" fill="#BB4444" />
        <ellipse cx="${mx}" cy="${my + 2}" rx="11" ry="8" fill="none" stroke="${stroke}" stroke-width="2" />
      `;
    case 'zigzag':
      return `<polyline points="${mx - 14},${my} ${mx - 7},${my - 5} ${mx},${my + 3} ${mx + 7},${my - 5} ${mx + 14},${my}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
    case 'tongue':
      return `
        <path d="M${mx - 13} ${my} Q${mx} ${my + 12} ${mx + 13} ${my}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <ellipse cx="${mx}" cy="${my + 10}" rx="6" ry="7" fill="#E87070" />
      `;
    case 'teeth':
      return `
        <path d="M${mx - 14} ${my - 2} Q${mx} ${my + 14} ${mx + 14} ${my - 2}" stroke="${stroke}" stroke-width="2" fill="#FFFFFF" />
        <line x1="${mx - 14}" y1="${my - 2}" x2="${mx + 14}" y2="${my - 2}" stroke="${stroke}" stroke-width="2" />
        <line x1="${mx - 5}" y1="${my - 2}" x2="${mx - 5}" y2="${my + 4}" stroke="${stroke}" stroke-width="1" />
        <line x1="${mx + 5}" y1="${my - 2}" x2="${mx + 5}" y2="${my + 4}" stroke="${stroke}" stroke-width="1" />
      `;
    case 'cat':
      return `
        <path d="M${mx - 8} ${my + 2} Q${mx} ${my - 4} ${mx + 8} ${my + 2}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <line x1="${mx}" y1="${my - 2}" x2="${mx}" y2="${my + 6}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" />
      `;
    case 'kiss':
      return `
        <ellipse cx="${mx}" cy="${my + 1}" rx="7" ry="6" fill="#E85A7A" />
        <ellipse cx="${mx}" cy="${my - 1}" rx="5" ry="3" fill="#F0859A" />
      `;
    case 'megaMouth':
      /* The whole face is mouth — giant grin from ear to ear, pushes up into the eye zone */
      return `
        <path d="M${mx - 50} ${my - 20} Q${mx} ${my + 40} ${mx + 50} ${my - 20}" stroke="${stroke}" stroke-width="2.5" fill="#BB4444" />
        <path d="M${mx - 50} ${my - 20} Q${mx} ${my - 10} ${mx + 50} ${my - 20}" fill="#FFFFFF" />
        <line x1="${mx - 30}" y1="${my - 20}" x2="${mx - 30}" y2="${my - 12}" stroke="${stroke}" stroke-width="1" />
        <line x1="${mx - 10}" y1="${my - 20}" x2="${mx - 10}" y2="${my - 10}" stroke="${stroke}" stroke-width="1" />
        <line x1="${mx + 10}" y1="${my - 20}" x2="${mx + 10}" y2="${my - 10}" stroke="${stroke}" stroke-width="1" />
        <line x1="${mx + 30}" y1="${my - 20}" x2="${mx + 30}" y2="${my - 12}" stroke="${stroke}" stroke-width="1" />
      `;
    case 'vampire':
      return `
        <path d="M${mx - 14} ${my - 2} Q${mx} ${my + 12} ${mx + 14} ${my - 2}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <polygon points="${mx - 8},${my - 2} ${mx - 5},${my + 8} ${mx - 2},${my - 2}" fill="#FFFFFF" stroke="${stroke}" stroke-width="1" />
        <polygon points="${mx + 2},${my - 2} ${mx + 5},${my + 8} ${mx + 8},${my - 2}" fill="#FFFFFF" stroke="${stroke}" stroke-width="1" />
      `;
    case 'duck':
      return `
        <ellipse cx="${mx}" cy="${my + 2}" rx="16" ry="8" fill="#F0A050" />
        <ellipse cx="${mx}" cy="${my - 1}" rx="14" ry="6" fill="#F0B868" />
        <line x1="${mx - 6}" y1="${my + 2}" x2="${mx + 6}" y2="${my + 2}" stroke="${stroke}" stroke-width="1.5" />
      `;
    case 'drool':
      return `
        <path d="M${mx - 13} ${my} Q${mx} ${my + 12} ${mx + 13} ${my}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <path d="M${mx + 8} ${my + 4} Q${mx + 10} ${my + 14} ${mx + 6} ${my + 22}" stroke="#7EC8E3" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6" />
        <ellipse cx="${mx + 5}" cy="${my + 24}" rx="4" ry="3" fill="#7EC8E3" opacity="0.5" />
      `;
    case 'scream':
      return `
        <ellipse cx="${mx}" cy="${my + 4}" rx="14" ry="18" fill="#BB4444" />
        <ellipse cx="${mx}" cy="${my + 4}" rx="14" ry="18" fill="none" stroke="${stroke}" stroke-width="2" />
        <ellipse cx="${mx}" cy="${my - 2}" rx="8" ry="3" fill="#1A0A0A" opacity="0.3" />
      `;
    default:
      return renderMouth('smile');
  }
}

/**
 * Render eyebrows. Color is derived from hair color, darkened slightly.
 * @param {string} style
 * @param {string} hairColor
 * @returns {string}
 */
function renderEyebrows(style, hairColor) {
  if (style === 'none') return '';
  const lx = EYE_LEFT_X, rx = EYE_RIGHT_X;
  const by = EYE_Y - 15;
  const color = darken(hairColor, 20);
  switch (style) {
    case 'arched':
      return `
        <path d="M${lx - 10} ${by + 3} Q${lx} ${by - 4} ${lx + 10} ${by + 1}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M${rx - 10} ${by + 1} Q${rx} ${by - 4} ${rx + 10} ${by + 3}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" />
      `;
    case 'flat':
      return `
        <line x1="${lx - 10}" y1="${by}" x2="${lx + 10}" y2="${by}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
        <line x1="${rx - 10}" y1="${by}" x2="${rx + 10}" y2="${by}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      `;
    case 'angry':
      /* Inner corners angled down toward nose */
      return `
        <path d="M${lx - 10} ${by - 3} L${lx + 10} ${by + 4}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
        <path d="M${rx - 10} ${by + 4} L${rx + 10} ${by - 3}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      `;
    case 'worried':
      return `
        <path d="M${lx - 10} ${by - 2} Q${lx} ${by + 5} ${lx + 10} ${by - 2}" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <path d="M${rx - 10} ${by - 2} Q${rx} ${by + 5} ${rx + 10} ${by - 2}" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" />
      `;
    case 'thick':
      return `
        <line x1="${lx - 11}" y1="${by}" x2="${lx + 11}" y2="${by}" stroke="${color}" stroke-width="5" stroke-linecap="round" />
        <line x1="${rx - 11}" y1="${by}" x2="${rx + 11}" y2="${by}" stroke="${color}" stroke-width="5" stroke-linecap="round" />
      `;
    case 'thin':
      return `
        <path d="M${lx - 10} ${by + 1} Q${lx} ${by - 3} ${lx + 10} ${by}" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round" />
        <path d="M${rx - 10} ${by} Q${rx} ${by - 3} ${rx + 10} ${by + 1}" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round" />
      `;
    default:
      return '';
  }
}

/**
 * Render blush — two soft ellipses on cheeks.
 * @param {boolean} enabled
 * @returns {string}
 */
function renderBlush(enabled) {
  if (!enabled) return '';
  const by = HEAD_CY + 12;
  return `
    <ellipse cx="${HEAD_CX - 34}" cy="${by}" rx="14" ry="9" fill="#F5A0A0" opacity="0.35" />
    <ellipse cx="${HEAD_CX + 34}" cy="${by}" rx="14" ry="9" fill="#F5A0A0" opacity="0.35" />
  `;
}

/**
 * Freckle positions — hand-written coordinates relative to HEAD_CX, HEAD_CY.
 * Three on each cheek. Do not change these without a deliberate design decision.
 */
const FRECKLE_POSITIONS = [
  { dx: -30, dy: 6  },
  { dx: -22, dy: 12 },
  { dx: -34, dy: 16 },
  { dx:  30, dy: 6  },
  { dx:  22, dy: 12 },
  { dx:  34, dy: 16 },
];

/**
 * Render freckles — small dots in a darkened skin tone.
 * @param {boolean} enabled
 * @param {string} skinColor
 * @returns {string}
 */
function renderFreckles(enabled, skinColor) {
  if (!enabled) return '';
  const color = darken(skinColor, 30);
  return FRECKLE_POSITIONS.map(({ dx, dy }) =>
    `<circle cx="${HEAD_CX + dx}" cy="${HEAD_CY + dy}" r="2.5" fill="${color}" opacity="0.7" />`
  ).join('');
}

/**
 * Render nose.
 * @param {string} style
 * @param {string} skinColor
 * @returns {string}
 */
function renderNose(style, skinColor) {
  if (style === 'none') return '';
  const nx = HEAD_CX, ny = HEAD_CY + 10;
  const dark = darken(skinColor, 30);
  switch (style) {
    case 'dot':
      return `<circle cx="${nx}" cy="${ny}" r="3" fill="${dark}" opacity="0.5" />`;
    case 'triangle':
      return `<polygon points="${nx},${ny - 4} ${nx - 4},${ny + 3} ${nx + 4},${ny + 3}" fill="${dark}" opacity="0.4" />`;
    case 'round':
      return `<ellipse cx="${nx}" cy="${ny}" rx="5" ry="4" fill="${dark}" opacity="0.3" />`;
    case 'button':
      return `
        <circle cx="${nx}" cy="${ny}" r="4" fill="${dark}" opacity="0.25" />
        <circle cx="${nx - 2}" cy="${ny + 1}" r="1.5" fill="${dark}" opacity="0.35" />
        <circle cx="${nx + 2}" cy="${ny + 1}" r="1.5" fill="${dark}" opacity="0.35" />
      `;
    default: return '';
  }
}

/**
 * Render eyelashes — curves above each eye.
 * @param {boolean} enabled
 * @param {string} hairColor
 * @returns {string}
 */
function renderEyelashes(enabled, hairColor) {
  if (!enabled) return '';
  const lx = EYE_LEFT_X, rx = EYE_RIGHT_X, ey = EYE_Y;
  const c = darken(hairColor, 15);
  return `
    <path d="M${lx - 11} ${ey - 6} Q${lx} ${ey - 14} ${lx + 11} ${ey - 6}" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" />
    <path d="M${rx - 11} ${ey - 6} Q${rx} ${ey - 14} ${rx + 11} ${ey - 6}" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" />
  `;
}

/**
 * Render expression overlay effects.
 * @param {string} effect
 * @returns {string}
 */
function renderExpression(effect) {
  if (effect === 'none') return '';
  switch (effect) {
    case 'sweatDrop':
      return `
        <path d="M${HEAD_CX + HEAD_RX - 10} ${HEAD_CY - HEAD_RY + 20} Q${HEAD_CX + HEAD_RX - 6} ${HEAD_CY - HEAD_RY + 10} ${HEAD_CX + HEAD_RX - 2} ${HEAD_CY - HEAD_RY + 20}
              Q${HEAD_CX + HEAD_RX - 6} ${HEAD_CY - HEAD_RY + 30} ${HEAD_CX + HEAD_RX - 10} ${HEAD_CY - HEAD_RY + 20} Z"
              fill="#7EC8E3" opacity="0.7" />
      `;
    case 'angerVein':
      return `
        <g transform="translate(${HEAD_CX + HEAD_RX - 24}, ${HEAD_CY - HEAD_RY + 10})">
          <line x1="0" y1="0" x2="8" y2="8" stroke="#E85A5A" stroke-width="2.5" stroke-linecap="round" />
          <line x1="8" y1="0" x2="0" y2="8" stroke="#E85A5A" stroke-width="2.5" stroke-linecap="round" />
          <line x1="4" y1="0" x2="4" y2="8" stroke="#E85A5A" stroke-width="2" stroke-linecap="round" />
          <line x1="0" y1="4" x2="8" y2="4" stroke="#E85A5A" stroke-width="2" stroke-linecap="round" />
        </g>
      `;
    case 'sparkle': {
      const s = (x, y, r) => {
        return `<polygon points="${x},${y - r} ${x + r * 0.3},${y - r * 0.3} ${x + r},${y} ${x + r * 0.3},${y + r * 0.3} ${x},${y + r} ${x - r * 0.3},${y + r * 0.3} ${x - r},${y} ${x - r * 0.3},${y - r * 0.3}" fill="#FFD700" opacity="0.8" />`;
      };
      return `${s(HEAD_CX - HEAD_RX + 8, HEAD_CY - 30, 6)} ${s(HEAD_CX + HEAD_RX - 12, HEAD_CY - 40, 5)} ${s(HEAD_CX + HEAD_RX - 4, HEAD_CY - 20, 4)}`;
    }
    case 'blushLines':
      return `
        <g opacity="0.4">
          <line x1="${HEAD_CX - 42}" y1="${HEAD_CY + 8}" x2="${HEAD_CX - 28}" y2="${HEAD_CY + 8}" stroke="#E85A7A" stroke-width="2" stroke-linecap="round" />
          <line x1="${HEAD_CX - 44}" y1="${HEAD_CY + 13}" x2="${HEAD_CX - 26}" y2="${HEAD_CY + 13}" stroke="#E85A7A" stroke-width="2" stroke-linecap="round" />
          <line x1="${HEAD_CX - 42}" y1="${HEAD_CY + 18}" x2="${HEAD_CX - 28}" y2="${HEAD_CY + 18}" stroke="#E85A7A" stroke-width="2" stroke-linecap="round" />
          <line x1="${HEAD_CX + 28}" y1="${HEAD_CY + 8}" x2="${HEAD_CX + 42}" y2="${HEAD_CY + 8}" stroke="#E85A7A" stroke-width="2" stroke-linecap="round" />
          <line x1="${HEAD_CX + 26}" y1="${HEAD_CY + 13}" x2="${HEAD_CX + 44}" y2="${HEAD_CY + 13}" stroke="#E85A7A" stroke-width="2" stroke-linecap="round" />
          <line x1="${HEAD_CX + 28}" y1="${HEAD_CY + 18}" x2="${HEAD_CX + 42}" y2="${HEAD_CY + 18}" stroke="#E85A7A" stroke-width="2" stroke-linecap="round" />
        </g>
      `;
    case 'tears':
      return `
        <path d="M${EYE_LEFT_X - 2} ${EYE_Y + 12} Q${EYE_LEFT_X - 4} ${EYE_Y + 22} ${EYE_LEFT_X - 6} ${EYE_Y + 30}" stroke="#7EC8E3" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6" />
        <path d="M${EYE_RIGHT_X + 2} ${EYE_Y + 12} Q${EYE_RIGHT_X + 4} ${EYE_Y + 22} ${EYE_RIGHT_X + 6} ${EYE_Y + 30}" stroke="#7EC8E3" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6" />
      `;
    default: return '';
  }
}

/**
 * Render beauty mark — small dot on the cheek.
 * @param {boolean} enabled
 * @returns {string}
 */
function renderBeautyMark(enabled) {
  if (!enabled) return '';
  return `<circle cx="${HEAD_CX + 28}" cy="${HEAD_CY + 18}" r="2.5" fill="#3A2A1A" opacity="0.7" />`;
}

/**
 * Render scar — small diagonal line across the cheek.
 * @param {boolean} enabled
 * @param {string} skinColor
 * @returns {string}
 */
function renderScar(enabled, skinColor) {
  if (!enabled) return '';
  const c = darken(skinColor, 40);
  return `<line x1="${HEAD_CX - 36}" y1="${HEAD_CY - 4}" x2="${HEAD_CX - 22}" y2="${HEAD_CY + 8}" stroke="${c}" stroke-width="2" stroke-linecap="round" opacity="0.5" />`;
}

/* ------------------------------------------------------------------ */
/*  Hair renderers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Render hair style.
 * All paths are anchored to the head ellipse (HEAD_CX, HEAD_CY, HEAD_RX, HEAD_RY).
 * Hair renders LAST (on top) so it overlaps the forehead.
 *
 * @param {string} style
 * @param {string} color
 * @returns {string}
 */
function renderHair(style, color) {
  const cx = HEAD_CX, cy = HEAD_CY, rx = HEAD_RX, ry = HEAD_RY;
  const topY = cy - ry;     /* top of head */
  const dark = darken(color, 25);

  switch (style) {
    case 'bob':
      return `
        <path d="M${cx - rx} ${cy + 20}
                 Q${cx - rx - 10} ${topY - 10} ${cx} ${topY - 18}
                 Q${cx + rx + 10} ${topY - 10} ${cx + rx} ${cy + 20}
                 Q${cx + rx - 15} ${cy + 20} ${cx + rx - 15} ${cy}
                 Q${cx} ${cy - 40} ${cx - rx + 15} ${cy}
                 Q${cx - rx + 15} ${cy + 20} ${cx - rx} ${cy + 20} Z"
              fill="${color}" />
      `;
    case 'long':
      return `
        <path d="M${cx - rx - 10} ${cy + 80}
                 Q${cx - rx - 15} ${topY - 5} ${cx} ${topY - 18}
                 Q${cx + rx + 15} ${topY - 5} ${cx + rx + 10} ${cy + 80}
                 Q${cx + rx} ${cy + 80} ${cx + rx - 12} ${cy}
                 Q${cx} ${cy - 40} ${cx - rx + 12} ${cy}
                 Q${cx - rx} ${cy + 80} ${cx - rx - 10} ${cy + 80} Z"
              fill="${color}" />
      `;
    case 'pigtails': {
      const pgY = cy - ry + 22;
      return `
        <path d="M${cx - rx} ${cy + 5}
                 Q${cx - rx - 10} ${topY} ${cx} ${topY - 16}
                 Q${cx + rx + 10} ${topY} ${cx + rx} ${cy + 5}
                 Q${cx} ${cy - 40} ${cx - rx} ${cy + 5} Z"
              fill="${color}" />
        <circle cx="${cx - rx - 2}" cy="${pgY}" r="18" fill="${color}" />
        <circle cx="${cx + rx + 2}" cy="${pgY}" r="18" fill="${color}" />
        <circle cx="${cx - rx - 2}" cy="${pgY}" r="10" fill="${dark}" opacity="0.3" />
        <circle cx="${cx + rx + 2}" cy="${pgY}" r="10" fill="${dark}" opacity="0.3" />
      `;
    }
    case 'spiky': {
      /* Jagged triangles pointing upward from the head cap */
      const spikes = [
        [cx - 36, topY - 2,  cx - 24, topY - 38, cx - 12, topY - 4],
        [cx - 16, topY - 6,  cx,      topY - 44, cx + 16, topY - 6],
        [cx + 12, topY - 4,  cx + 24, topY - 38, cx + 36, topY - 2],
      ].map(([x1, y1, x2, y2, x3, y3]) =>
        `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${color}" />`
      ).join('');
      return `
        ${spikes}
        <path d="M${cx - rx} ${cy + 5}
                 Q${cx - rx - 10} ${topY} ${cx} ${topY - 12}
                 Q${cx + rx + 10} ${topY} ${cx + rx} ${cy + 5}
                 Q${cx} ${cy - 40} ${cx - rx} ${cy + 5} Z"
              fill="${color}" />
      `;
    }
    case 'curly': {
      /* Cloud of overlapping circles forming a rounded mass */
      const curls = [
        { x: cx,      y: topY - 10, r: 26 },
        { x: cx - 30, y: topY,      r: 22 },
        { x: cx + 30, y: topY,      r: 22 },
        { x: cx - 50, y: topY + 18, r: 20 },
        { x: cx + 50, y: topY + 18, r: 20 },
        { x: cx - 20, y: topY - 4,  r: 20 },
        { x: cx + 20, y: topY - 4,  r: 20 },
      ];
      return curls.map(({ x, y, r }) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" />`).join('');
    }
    case 'buzz':
      /* Thin cap hugging the head — military short */
      return `
        <path d="M${cx - rx + 4} ${cy}
                 Q${cx - rx - 4} ${topY + 10} ${cx} ${topY}
                 Q${cx + rx + 4} ${topY + 10} ${cx + rx - 4} ${cy}
                 Q${cx} ${cy - 40} ${cx - rx + 4} ${cy} Z"
              fill="${color}" />
      `;
    case 'ponytail': {
      /* Cap + tail at the back (rendered behind, simulated at right for flat 2D) */
      const tailX = cx + rx + 6;
      return `
        <path d="M${tailX - 8} ${topY + 20}
                 Q${tailX + 20} ${cy + 40} ${tailX - 4} ${cy + 80}
                 Q${tailX - 14} ${cy + 80} ${tailX - 22} ${cy + 40}
                 Q${tailX - 26} ${topY + 30} ${tailX - 8} ${topY + 20} Z"
              fill="${color}" />
        <path d="M${cx - rx} ${cy + 5}
                 Q${cx - rx - 10} ${topY} ${cx} ${topY - 16}
                 Q${cx + rx + 10} ${topY} ${cx + rx} ${cy + 5}
                 Q${cx} ${cy - 40} ${cx - rx} ${cy + 5} Z"
              fill="${color}" />
      `;
    }
    case 'afro': {
      /* Large cloud of overlapping circles extending wide and high */
      const balls = [
        { x: cx,      y: topY - 22, r: 34 },
        { x: cx - 40, y: topY - 8,  r: 30 },
        { x: cx + 40, y: topY - 8,  r: 30 },
        { x: cx - 62, y: topY + 18, r: 26 },
        { x: cx + 62, y: topY + 18, r: 26 },
        { x: cx - 30, y: topY - 20, r: 26 },
        { x: cx + 30, y: topY - 20, r: 26 },
        { x: cx,      y: topY + 8,  r: 28 },
      ];
      return balls.map(({ x, y, r }) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" />`).join('');
    }
    case 'parted':
      /* Sweeps outward from a center part, exposing the forehead and eyebrows */
      return `
        <path d="M${cx - rx} ${cy + 20}
                 Q${cx - rx - 10} ${topY - 10} ${cx} ${topY - 18}
                 Q${cx + rx + 10} ${topY - 10} ${cx + rx} ${cy + 20}
                 Q${cx + rx - 10} ${cy} ${cx + rx - 15} ${cy - 30}
                 Q${cx + rx - 20} ${cy - 70} ${cx} ${topY + 5}
                 Q${cx - rx + 20} ${cy - 70} ${cx - rx + 15} ${cy - 30}
                 Q${cx - rx + 10} ${cy} ${cx - rx} ${cy + 20} Z"
              fill="${color}" />
      `;
    case 'slicked':
      /* Pulled tight back over the top of the head, leaving a clean, high hairline */
      return `
        <path d="M${cx - rx + 5} ${cy}
                 Q${cx - rx - 10} ${topY - 5} ${cx} ${topY - 16}
                 Q${cx + rx + 10} ${topY - 5} ${cx + rx - 5} ${cy}
                 Q${cx + rx - 10} ${cy - 45} ${cx} ${topY + 20}
                 Q${cx - rx + 10} ${cy - 45} ${cx - rx + 5} ${cy} Z"
              fill="${color}" />
      `;
    default:
      return renderHair('bob', color);
  }
}

/* ------------------------------------------------------------------ */
/*  Main render function                                              */
/* ------------------------------------------------------------------ */

/**
 * Render a complete Mii as an SVG string.
 * @param {object} mii - Mii state object (v2 schema)
 * @returns {string} Complete SVG markup
 */
function renderMii(mii) {
  const skinColor = SKIN_TONE_COLORS[mii.appearance.skinTone] || SKIN_TONE_COLORS.light;
  const halfW = (BODY_WIDTHS[mii.appearance.bodyShape] || BODY_WIDTHS.regular) / 2;
  const outfitStyle = mii.appearance.outfit.style || 'tshirt';
  const primaryColor = mii.appearance.outfit.primaryColor || '#5B8CDE';
  const secondaryColor = mii.appearance.outfit.secondaryColor;
  const accessory = mii.appearance.accessory || 'none';
  const face = mii.appearance.face || {};

  const outfitRenderer = OUTFIT_RENDERERS[outfitStyle] || OUTFIT_RENDERERS.tshirt;
  const accessoryRenderer = ACCESSORY_RENDERERS[accessory] || ACCESSORY_RENDERERS.none;

  const escapedName = (mii.name || 'Unnamed')
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SPRITE_W} ${SPRITE_H}" width="${SPRITE_W}" height="${SPRITE_H}" role="img" aria-label="Mii character: ${escapedName}">
    ${outfitRenderer(halfW, primaryColor, secondaryColor)}
    ${renderArms(halfW, skinColor)}
    ${renderHead(face.faceShape || 'oval', skinColor)}
    ${renderBlush(face.blush)}
    ${renderFreckles(face.freckles, skinColor)}
    ${renderBeautyMark(face.beautyMark)}
    ${renderScar(face.scar, skinColor)}
    ${renderNose(face.nose || 'none', skinColor)}
    ${renderEyebrows(face.eyebrows || 'arched', face.hairColor || '#3B2416')}
    ${renderEyelashes(face.eyelashes, face.hairColor || '#3B2416')}
    ${renderEyes(face.eyeShape || 'round', face.eyeColor || '#2D1810')}
    ${renderMouth(face.mouthShape || 'smile')}
    ${renderExpression(face.expression || 'none')}
    ${renderHair(face.hairStyle || 'bob', face.hairColor || '#3B2416')}
    ${accessoryRenderer()}
  </svg>`;
}

/**
 * Render a small thumbnail SVG (for gallery cards).
 * @param {object} mii
 * @returns {string}
 */
function renderMiiThumbnail(mii) {
  return renderMii(mii).replace(
    `width="${SPRITE_W}" height="${SPRITE_H}"`,
    'width="120" height="160"'
  );
}

/**
 * Render a tiny face-only preview for thumbnail buttons in the controls panel.
 * Uses a 48×48 viewBox focused on the head region.
 *
 * @param {object} facePatch - Partial face object with the feature to preview
 * @param {string} skinColor
 * @returns {string}
 */
function renderFaceThumb(facePatch, skinColor = '#E8B591') {
  /* Scale the head to fit a 48×48 box — translate and scale from original coords */
  const scale = 0.32;
  const ox = -HEAD_CX * scale + 24;
  const oy = -HEAD_CY * scale + 24;
  const face = { faceShape: 'oval', eyeShape: 'round', eyeColor: '#2D1810', mouthShape: 'smile',
                 eyebrows: 'arched', hairStyle: 'bob', hairColor: '#3B2416',
                 nose: 'none', blush: false, freckles: false, ...facePatch };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <g transform="translate(${ox.toFixed(1)}, ${oy.toFixed(1)}) scale(${scale})">
      ${renderHead(face.faceShape, skinColor)}
      ${renderBlush(face.blush)}
      ${renderNose(face.nose, skinColor)}
      ${renderEyebrows(face.eyebrows, face.hairColor)}
      ${renderEyes(face.eyeShape, face.eyeColor)}
      ${renderMouth(face.mouthShape)}
      ${renderHair(face.hairStyle, face.hairColor)}
    </g>
  </svg>`;
}


/* ================================================================
   apps/mii-designer/lib/storage.js
   ================================================================ */

/**
 * localStorage CRUD, import, and for Mii records.
 *
 * @module storage
 */



/**
 * Run all necessary migrations on a Mii record to bring it to the current schema version.
 * @param {object} mii
 * @returns {object}
 */
function autoMigrate(mii) {
  if (mii.schemaVersion === 1) mii = migrateV1ToV2(mii);
  if (mii.schemaVersion === 2) mii = migrateV2ToV3(mii);
  if (mii.schemaVersion === 3) mii = migrateV3ToV4(mii);
  return mii;
}

const MII_PREFIX = 'miis:';
const MAX_MIIS = 50;

/**
 * Save a Mii to localStorage. Validates before writing.
 * Sanitizes the name and updates the `updatedAt` timestamp.
 *
 * @param {object} mii
 * @returns {{ ok: boolean, errors?: string[] }}
 */
function saveMii(mii) {
  const prepared = {
    ...mii,
    name: sanitizeName(mii.name),
    updatedAt: new Date().toISOString(),
  };

  // Normalize secondaryColor based on style
  if (!TWO_COLOR_STYLES.includes(prepared.appearance.outfit.style)) {
    prepared.appearance = {
      ...prepared.appearance,
      outfit: { ...prepared.appearance.outfit, secondaryColor: null },
    };
  }

  // Uppercase hex colors (outfit)
  if (prepared.appearance.outfit.primaryColor) {
    prepared.appearance.outfit.primaryColor = prepared.appearance.outfit.primaryColor.toUpperCase();
  }
  if (prepared.appearance.outfit.secondaryColor) {
    prepared.appearance.outfit.secondaryColor = prepared.appearance.outfit.secondaryColor.toUpperCase();
  }
  // Uppercase hex colors (face)
  if (prepared.appearance.face) {
    if (prepared.appearance.face.hairColor) {
      prepared.appearance.face.hairColor = prepared.appearance.face.hairColor.toUpperCase();
    }
    if (prepared.appearance.face.eyeColor) {
      prepared.appearance.face.eyeColor = prepared.appearance.face.eyeColor.toUpperCase();
    }
  }

  const result = validateMii(prepared);
  if (!result.valid) {
    return { ok: false, errors: result.errors };
  }

  const count = listMiis().length;
  const isUpdate = localStorage.getItem(`${MII_PREFIX}${prepared.id}`) !== null;
  if (!isUpdate && count >= MAX_MIIS) {
    return { ok: false, errors: [`You've reached the maximum of ${MAX_MIIS} saved Miis. Delete some to make room!`] };
  }

  try {
    localStorage.setItem(`${MII_PREFIX}${prepared.id}`, JSON.stringify(prepared));
    return { ok: true };
  } catch (err) {
    return { ok: false, errors: [`Could not save: ${err.message}`] };
  }
}

/**
 * Load a single Mii by ID.
 * @param {string} id
 * @returns {object | null}
 */
function loadMii(id) {
  try {
    const raw = localStorage.getItem(`${MII_PREFIX}${id}`);
    if (!raw) return null;
    let mii = JSON.parse(raw);
    if (mii && mii.schemaVersion !== SCHEMA_VERSION) {
      mii = autoMigrate(mii);
      localStorage.setItem(`${MII_PREFIX}${mii.id}`, JSON.stringify(mii));
    }
    return mii;
  } catch {
    return null;
  }
}

/**
 * List all saved Miis, sorted by updatedAt descending.
 * @returns {object[]}
 */
function listMiis() {
  const miis = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(MII_PREFIX)) {
      try {
        let mii = JSON.parse(localStorage.getItem(key));
        if (mii && mii.schemaVersion !== SCHEMA_VERSION) {
          mii = autoMigrate(mii);
          localStorage.setItem(key, JSON.stringify(mii));
        }
        if (mii) miis.push(mii);
      } catch {
        // Skip corrupted entries
      }
    }
  }
  miis.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  return miis;
}

/**
 * Delete a Mii by ID.
 * @param {string} id
 */
function deleteMii(id) {
  localStorage.removeItem(`${MII_PREFIX}${id}`);
}

/**
 * Export all Miis as a JSON string (array).
 * @returns {string}
 */
function exportAll() {
  return JSON.stringify(listMiis(), null, 2);
}

/**
 * Export a single Mii as a JSON string.
 * @param {object} mii
 * @returns {string}
 */
function exportOne(mii) {
  return JSON.stringify(mii, null, 2);
}

/**
 * @typedef {Object} ImportResult
 * @property {object[]} imported
 * @property {object[]} skipped
 * @property {string[]} errors
 */

/**
 * Import Miis from a JSON string (single object or array).
 * Validates each record. Skips duplicates by ID.
 *
 * @param {string} jsonString
 * @returns {ImportResult}
 */
function importMiis(jsonString) {
  const result = { imported: [], skipped: [], errors: [] };

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    result.errors.push(`Invalid JSON: ${err.message}`);
    return result;
  }

  const records = Array.isArray(parsed) ? parsed : [parsed];

  for (let record of records) {
    // Auto-migrate old records on import
    if (record && record.schemaVersion !== SCHEMA_VERSION) {
      record = autoMigrate(record);
    }

    const validation = validateMii(record);
    if (!validation.valid) {
      result.errors.push(`"${record.name || 'unknown'}": ${validation.errors.join('; ')}`);
      continue;
    }

    // Check for duplicate
    if (localStorage.getItem(`${MII_PREFIX}${record.id}`) !== null) {
      result.skipped.push(record);
      continue;
    }

    try {
      localStorage.setItem(`${MII_PREFIX}${record.id}`, JSON.stringify(record));
      result.imported.push(record);
    } catch (err) {
      result.errors.push(`Could not save "${record.name}": ${err.message}`);
    }
  }

  return result;
}

/**
 * Trigger a file download of a JSON string.
 * @param {string} filename
 * @param {string} jsonString
 */
function downloadJson(filename, jsonString) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


/* ================================================================
   apps/mii-designer/lib/miiAnimator.js
   ================================================================ */

/**
 * Handles Web Audio playback and SVG animation for the Mii Dialogue stage.
 * @module miiAnimator
 */



let audioContext;
let websocket;
let isDialogueActive = false;

// We'll store the current configuration of the two talking Miis here
let activeMiis = {
  mii1: null,
  mii2: null
};

// State mapping
let agentStates = {
  mii1: 'IDLE',
  mii2: 'IDLE'
};

let nextAudioTime = 0;
let speakingTimeout = null;

// Visual tracking
let lastMouthSwap = 0;
let lastBlink = 0;
let isBlinking = false;

const MOUTH_SHAPES_SPEAKING = ['open', 'teeth', 'smile', 'megaMouth'];

function initDialogue(mii1, mii2, topic, onStateChange, onTranscript) {
  activeMiis.mii1 = mii1;
  activeMiis.mii2 = mii2;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  isDialogueActive = true;
  agentStates.mii1 = 'IDLE';
  agentStates.mii2 = 'IDLE';
  
  nextAudioTime = audioContext.currentTime;

  websocket = new WebSocket('ws://localhost:8000/ws');

  websocket.onopen = () => {
    onStateChange('Connected! Initializing agents...');
    
    const traitsToText = (p) => {
      if (!p) return "";
      let parts = [];
      if (p.introvertExtrovert < 33) parts.push("very introverted");
      else if (p.introvertExtrovert > 66) parts.push("very extroverted");
      
      if (p.calmIntense < 33) parts.push("very calm");
      else if (p.calmIntense > 66) parts.push("very intense");
      
      if (p.seriousSilly < 33) parts.push("very serious");
      else if (p.seriousSilly > 66) parts.push("very silly");
      
      return parts.length ? `You are ${parts.join(', and ')}.` : "";
    };

    const personality1 = `${traitsToText(mii1.personality)} ${mii1.meta?.notes || ''}`.trim();
    const personality2 = `${traitsToText(mii2.personality)} ${mii2.meta?.notes || ''}`.trim();

    websocket.send(JSON.stringify({
      action: 'start',
      mii1: { name: mii1.name, voice: mii1.meta?.voice || 'Aoede', personality: personality1 },
      mii2: { name: mii2.name, voice: mii2.meta?.voice || 'Kore', personality: personality2 },
      topic: topic
    }));
  };

  let hasError = false;

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'system') {
      onStateChange(data.message);
    } else if (data.type === 'error') {
      hasError = true;
      onStateChange('Error: ' + data.message);
      stopDialogue();
    } else if (data.type === 'state') {
      agentStates[data.agent] = data.state;
      if (data.state === 'SPEAKING') {
        onStateChange(`${activeMiis[data.agent].name} is speaking...`);
      }
    } else if (data.type === 'transcript') {
      onTranscript(data.agent, data.text);
    } else if (data.type === 'transcript_partial') {
      onTranscript(data.agent, data.text, true);
    } else if (data.type === 'audio') {
      playAudio(data.agent, data.data);
    }
  };

  websocket.onerror = (err) => {
    console.error('WebSocket Error', err);
    hasError = true;
    onStateChange('WebSocket Error. Is the Python server running?');
  };

  websocket.onclose = () => {
    if (!hasError) {
      onStateChange('Disconnected.');
    }
    stopDialogue();
  };

  // Start animation loop
  requestAnimationFrame(animationLoop);
}

function stopDialogue() {
  isDialogueActive = false;
  if (websocket) {
    websocket.close();
    websocket = null;
  }
}

// Convert base64 to Float32Array PCM for Web Audio
function base64ToFloat32(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  // Data is 16-bit little-endian PCM
  const pcm16 = new Int16Array(bytes.buffer);
  const pcmFloat = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    pcmFloat[i] = pcm16[i] / 32768.0;
  }
  return pcmFloat;
}

function playAudio(agent, base64Data) {
  if (!isDialogueActive) return;

  const floatData = base64ToFloat32(base64Data);
  const buffer = audioContext.createBuffer(1, floatData.length, 24000);
  buffer.getChannelData(0).set(floatData);

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  if (nextAudioTime < audioContext.currentTime) {
    nextAudioTime = audioContext.currentTime;
  }

  const startTime = nextAudioTime;
  source.start(startTime);
  nextAudioTime += buffer.duration;

  const startDelayMs = Math.max(0, (startTime - audioContext.currentTime) * 1000);
  const durationMs = buffer.duration * 1000;

  setTimeout(() => {
    if (!isDialogueActive) return;
    agentStates['mii1'] = 'LISTENING';
    agentStates['mii2'] = 'LISTENING';
    agentStates[agent] = 'SPEAKING';
  }, startDelayMs);

  clearTimeout(speakingTimeout);
  speakingTimeout = setTimeout(() => {
    if (!isDialogueActive) return;
    agentStates['mii1'] = 'LISTENING';
    agentStates['mii2'] = 'LISTENING';
  }, startDelayMs + durationMs + 100);
}

function updateMiiVisuals(agent, now) {
  const container = document.getElementById(agent === 'mii1' ? 'theater-mii-1' : 'theater-mii-2');
  if (!container) return;

  const miiData = JSON.parse(JSON.stringify(activeMiis[agent]));
  
  // Blinking logic
  if (now - lastBlink > 4000 + Math.random() * 2000) {
    isBlinking = true;
    lastBlink = now;
  }
  if (isBlinking && now - lastBlink > 150) {
    isBlinking = false;
  }

  if (isBlinking) {
    miiData.appearance.face.eyeShape = 'sleepy';
  }

  // Mouth flapping logic
  if (agentStates[agent] === 'SPEAKING') {
    if (now - lastMouthSwap > 100) {
      const idx = Math.floor(Math.random() * MOUTH_SHAPES_SPEAKING.length);
      container.dataset.mouth = MOUTH_SHAPES_SPEAKING[idx];
      lastMouthSwap = now;
    }
    miiData.appearance.face.mouthShape = container.dataset.mouth || 'open';
  }

  container.innerHTML = renderMii(miiData);
}

function animationLoop(timestamp) {
  if (!isDialogueActive) return;

  updateMiiVisuals('mii1', timestamp);
  updateMiiVisuals('mii2', timestamp);

  requestAnimationFrame(animationLoop);
}


/* ================================================================
   apps/mii-designer/main.js
   ================================================================ */

/**
 * Mii Designer — main orchestrator (canonical ES module source).
 * Owns the central state, wires controls to renderers, handles all user interactions.
 *
 * NOTE: app.js is a generated IIFE bundle built from this file + lib/*.js + shared/schema/miiSchema.js.
 * Edit THIS file. Do not edit app.js directly.
 *
 * @module main
 */









/* ================================================================
   State Management
   ================================================================ */

/** @type {object} The current Mii being edited */
let state = structuredClone(EXAMPLE_MII);

/** @type {Function[]} Subscriber callbacks */
const subscribers = [];

function getState() {
  return state;
}

function setState(patch) {
  let p = typeof patch === 'function' ? patch(state) : patch;
  if (p.personality) p.personality = { ...state.personality, ...p.personality };
  if (p.appearance) {
    let app = { ...state.appearance, ...p.appearance };
    if (p.appearance.outfit) app.outfit = { ...state.appearance.outfit, ...p.appearance.outfit };
    if (p.appearance.face)   app.face   = { ...state.appearance.face,   ...p.appearance.face };
    p.appearance = app;
  }
  if (p.meta) p.meta = { ...state.meta, ...p.meta };

  state = { ...state, ...p };
  notify();
}

function subscribe(fn) {
  subscribers.push(fn);
}

function notify() {
  for (const fn of subscribers) fn(state);
}

/**
 * Load a full Mii object into the editor state and sync all controls.
 * @param {object} mii
 */
function loadIntoEditor(mii) {
  state = structuredClone(mii);
  syncControlsToState();
  notify();
}

/* ================================================================
   DOM References
   ================================================================ */

const $name           = document.getElementById('mii-name');
const $sliderIE       = document.getElementById('slider-introvert-extrovert');
const $sliderCI       = document.getElementById('slider-calm-intense');
const $sliderSS       = document.getElementById('slider-serious-silly');
const $notes          = document.getElementById('meta-notes');
const $metaVoice      = document.getElementById('meta-voice');
const $skinSwatches   = document.getElementById('skin-tone-swatches');
const $bodyShapeRow   = document.getElementById('body-shape-row');
const $outfitStyle    = document.getElementById('outfit-style');
const $primaryColor   = document.getElementById('outfit-primary-color');
const $secondaryColor = document.getElementById('outfit-secondary-color');
const $secondaryColorRow = document.getElementById('secondary-color-row');
const $accessoryRow   = document.getElementById('accessory-row');
const $btnRandomizeFace = document.getElementById('btn-randomize-face');
const $hairStyleRow   = document.getElementById('hair-style-row');
const $hairColor      = document.getElementById('hair-color');
const $eyeShapeRow    = document.getElementById('eye-shape-row');
const $eyeColor       = document.getElementById('eye-color');
const $mouthShapeRow  = document.getElementById('mouth-shape-row');
const $eyebrowStyle   = document.getElementById('eyebrow-style');
const $faceBlush      = document.getElementById('face-blush');
const $faceFreckles   = document.getElementById('face-freckles');
const $faceShapeRow   = document.getElementById('face-shape-row');
const $noseStyle      = document.getElementById('nose-style');
const $expressionStyle = document.getElementById('expression-style');
const $faceEyelashes  = document.getElementById('face-eyelashes');
const $faceBeautyMark = document.getElementById('face-beauty-mark');
const $faceScar       = document.getElementById('face-scar');
const $previewContainer = document.getElementById('mii-preview-container');
const $previewName    = document.getElementById('preview-name');
const $btnSave        = document.getElementById('btn-save');
const $btnExportOne   = document.getElementById('btn-export-one');
const $btnNew         = document.getElementById('btn-new');
const $btnExportAll   = document.getElementById('btn-export-all');
const $btnImport      = document.getElementById('btn-import');
const $galleryGrid    = document.getElementById('gallery-grid');
const $galleryEmpty   = document.getElementById('gallery-empty');

// Dialogue elements
const $btnOpenDialogue = document.getElementById('btn-open-dialogue');
const $btnCloseDialogue = document.getElementById('btn-close-dialogue');
const $dialogueOverlay = document.getElementById('dialogue-overlay');
const $dialogueSetup = document.getElementById('dialogue-setup');
const $dialogueTheater = document.getElementById('dialogue-theater');
const $dialogueMii1 = document.getElementById('dialogue-mii-1');
const $dialogueMii2 = document.getElementById('dialogue-mii-2');
const $dialogueTopic = document.getElementById('dialogue-topic');
const $btnStartDialogue = document.getElementById('btn-start-dialogue');
const $btnStopDialogue = document.getElementById('btn-stop-dialogue');
const $dialogueStatus = document.getElementById('dialogue-status');
const $theaterBubble1 = document.getElementById('theater-bubble-1');
const $theaterBubble2 = document.getElementById('theater-bubble-2');
/* ================================================================
   Build dynamic controls
   ================================================================ */

function buildSkinSwatches() {
  $skinSwatches.innerHTML = '';
  for (const tone of SKIN_TONES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch-btn';
    btn.dataset.tone = tone;
    btn.style.backgroundColor = SKIN_TONE_COLORS[tone];
    btn.setAttribute('aria-label', `${tone} skin tone`);
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    $skinSwatches.appendChild(btn);
  }
}

/**
 * Build a row of SVG thumbnail buttons for a face feature.
 * @param {HTMLElement} container
 * @param {string[]} values - Enum values for this feature
 * @param {string} featureKey - Key in appearance.face (e.g. 'hairStyle')
 * @param {function(string): object} patchBuilder - Returns a facePatch for renderFaceThumb
 * @param {string} dataAttr - data-* attribute name on each button
 */
function buildThumbRow(container, values, featureKey, patchBuilder, dataAttr) {
  container.innerHTML = '';
  for (const value of values) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb-btn';
    btn.dataset[dataAttr] = value;
    btn.setAttribute('aria-label', value);
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.setAttribute('title', value);
    const skinColor = SKIN_TONE_COLORS[state.appearance.skinTone] || SKIN_TONE_COLORS.light;
    btn.innerHTML = renderFaceThumb(patchBuilder(value), skinColor);
    container.appendChild(btn);
  }
}

function buildFaceThumbRows() {
  buildThumbRow($faceShapeRow, FACE_SHAPES, 'faceShape',
    (v) => ({ faceShape: v }),
    'faceShape');
  buildThumbRow($hairStyleRow, HAIR_STYLES, 'hairStyle',
    (v) => ({ hairStyle: v, hairColor: state.appearance.face.hairColor || DEFAULT_FACE.hairColor }),
    'hairStyle');
  buildThumbRow($eyeShapeRow, EYE_SHAPES, 'eyeShape',
    (v) => ({ eyeShape: v, eyeColor: state.appearance.face.eyeColor || DEFAULT_FACE.eyeColor }),
    'eyeShape');
  buildThumbRow($mouthShapeRow, MOUTH_SHAPES, 'mouthShape',
    (v) => ({ mouthShape: v }),
    'mouthShape');
}

/* ================================================================
   Control → State binding
   ================================================================ */

function wireControls() {
  // Name
  $name.addEventListener('input', () => setState({ name: $name.value }));

  // Personality sliders
  $sliderIE.addEventListener('input', () =>
    setState({ personality: { introvertExtrovert: parseInt($sliderIE.value, 10) } }));
  $sliderCI.addEventListener('input', () =>
    setState({ personality: { calmIntense: parseInt($sliderCI.value, 10) } }));
  $sliderSS.addEventListener('input', () =>
    setState({ personality: { seriousSilly: parseInt($sliderSS.value, 10) } }));

  // Meta
  $notes.addEventListener('input', () => setState({ meta: { notes: $notes.value } }));
  $metaVoice.addEventListener('change', () => setState({ meta: { voice: $metaVoice.value } }));

  // Skin tone swatches
  $skinSwatches.addEventListener('click', (e) => {
    const btn = e.target.closest('.swatch-btn');
    if (!btn) return;
    setState({ appearance: { skinTone: btn.dataset.tone } });
  });

  // Body shape
  $bodyShapeRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.shape-btn');
    if (!btn) return;
    setState({ appearance: { bodyShape: btn.dataset.shape } });
  });

  // Outfit style
  $outfitStyle.addEventListener('change', () => {
    const style = $outfitStyle.value;
    const needsSecondary = TWO_COLOR_STYLES.includes(style);
    const update = { appearance: { outfit: { style } } };
    if (!needsSecondary) {
      update.appearance.outfit.secondaryColor = null;
    } else if (!state.appearance.outfit.secondaryColor) {
      update.appearance.outfit.secondaryColor = '#3A6DB5';
    }
    setState(update);
  });

  // Outfit colors
  $primaryColor.addEventListener('input', () =>
    setState({ appearance: { outfit: { primaryColor: $primaryColor.value.toUpperCase() } } }));
  $secondaryColor.addEventListener('input', () =>
    setState({ appearance: { outfit: { secondaryColor: $secondaryColor.value.toUpperCase() } } }));

  // Accessory
  $accessoryRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.accessory-btn');
    if (!btn) return;
    setState({ appearance: { accessory: btn.dataset.accessory } });
  });

  // Face — hair style thumbnails
  $hairStyleRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.thumb-btn');
    if (!btn) return;
    setState({ appearance: { face: { hairStyle: btn.dataset.hairStyle } } });
  });

  // Face — hair color
  $hairColor.addEventListener('input', () =>
    setState({ appearance: { face: { hairColor: $hairColor.value.toUpperCase() } } }));

  // Face — eye shape thumbnails
  $eyeShapeRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.thumb-btn');
    if (!btn) return;
    setState({ appearance: { face: { eyeShape: btn.dataset.eyeShape } } });
  });

  // Face — eye color
  $eyeColor.addEventListener('input', () =>
    setState({ appearance: { face: { eyeColor: $eyeColor.value.toUpperCase() } } }));

  // Face — mouth shape thumbnails
  $mouthShapeRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.thumb-btn');
    if (!btn) return;
    setState({ appearance: { face: { mouthShape: btn.dataset.mouthShape } } });
  });

  // Face — eyebrows
  $eyebrowStyle.addEventListener('change', () =>
    setState({ appearance: { face: { eyebrows: $eyebrowStyle.value } } }));

  // Face — blush / freckles / eyelashes / beautyMark / scar
  $faceBlush.addEventListener('change', () =>
    setState({ appearance: { face: { blush: $faceBlush.checked } } }));
  $faceFreckles.addEventListener('change', () =>
    setState({ appearance: { face: { freckles: $faceFreckles.checked } } }));
  $faceEyelashes.addEventListener('change', () =>
    setState({ appearance: { face: { eyelashes: $faceEyelashes.checked } } }));
  $faceBeautyMark.addEventListener('change', () =>
    setState({ appearance: { face: { beautyMark: $faceBeautyMark.checked } } }));
  $faceScar.addEventListener('change', () =>
    setState({ appearance: { face: { scar: $faceScar.checked } } }));

  // Face shape thumbnails
  $faceShapeRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.thumb-btn');
    if (!btn) return;
    setState({ appearance: { face: { faceShape: btn.dataset.faceShape } } });
  });

  // Nose
  $noseStyle.addEventListener('change', () =>
    setState({ appearance: { face: { nose: $noseStyle.value } } }));

  // Expression
  $expressionStyle.addEventListener('change', () =>
    setState({ appearance: { face: { expression: $expressionStyle.value } } }));

  // Randomize face
  $btnRandomizeFace.addEventListener('click', handleRandomizeFace);

  // Save / Export / New
  $btnSave.addEventListener('click', handleSave);
  $btnExportOne.addEventListener('click', handleExportOne);
  $btnNew.addEventListener('click', handleNew);
  $btnExportAll.addEventListener('click', handleExportAll);
  $btnImport.addEventListener('change', handleImport);

  // Dialogue Mode
  $btnOpenDialogue.addEventListener('click', handleOpenDialogue);
  $btnCloseDialogue.addEventListener('click', handleCloseDialogue);
  $btnStartDialogue.addEventListener('click', handleStartDialogue);
  $btnStopDialogue.addEventListener('click', handleStopDialogue);
}

/* ================================================================
   Handlers
   ================================================================ */

function handleRandomizeFace() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomHex = () => {
    const h = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
    return `#${h}`;
  };
  setState({
    appearance: {
      face: {
        faceShape:  pick(FACE_SHAPES),
        hairStyle:  pick(HAIR_STYLES),
        hairColor:  randomHex(),
        eyeShape:   pick(EYE_SHAPES),
        eyeColor:   randomHex(),
        mouthShape: pick(MOUTH_SHAPES),
        eyebrows:   pick(EYEBROW_STYLES),
        nose:       pick(NOSE_STYLES),
        expression: pick(EXPRESSION_EFFECTS),
        eyelashes:  Math.random() > 0.6,
        blush:      Math.random() > 0.5,
        freckles:   Math.random() > 0.7,
        beautyMark: Math.random() > 0.8,
        scar:       Math.random() > 0.85,
      },
    },
  });
  showToast('New face rolled! 🎲', 'success');
}

function handleSave() {
  try {
    const s = getState();
    if (!s.name.trim()) {
      showToast('Your Mii needs a name!', 'error');
      $name.focus();
      return;
    }
    const sanitized = sanitizeName(s.name);
    state.name = sanitized;
    state.updatedAt = new Date().toISOString();

    // Workaround for usability: If they are editing the default EXAMPLE_MII template,
    // saving it should create a NEW Mii instead of overwriting the example template's ID forever.
    if (state.id === EXAMPLE_MII.id) {
      state.id = generateUUID();
    }

    const result = saveMii(state);
    if (result.ok) {
      showToast(`${sanitized} saved! 💾`, 'success');
      refreshGallery();
    } else {
      showToast(result.errors.join('\n'), 'error');
    }
  } catch (err) {
    showToast(`Unexpected error: ${err.message}`, 'error');
    console.error("Save error:", err);
  }
}

function handleExportOne() {
  const s = getState();
  if (!s.name.trim()) {
    showToast('Give your Mii a name before exporting!', 'error');
    return;
  }
  const filename = `${sanitizeName(s.name)}.mii.json`;
  downloadJson(filename, exportOne(s));
  showToast(`Exported ${s.name}!`, 'success');
}

function handleNew() {
  loadIntoEditor(createBlankMii());
  showToast('New Mii created — make it yours!', 'info');
}

function handleExportAll() {
  const all = listMiis();
  if (all.length === 0) {
    showToast('No Miis to yet!', 'info');
    return;
  }
  downloadJson('miis.json', exportAll());
  showToast(`Exported ${all.length} Mii${all.length > 1 ? 's' : ''}!`, 'success');
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const result = importMiis(reader.result);
    if (result.errors.length > 0) showToast(`Import issues: ${result.errors.join('; ')}`, 'error');
    if (result.imported.length > 0) {
      showToast(`Imported ${result.imported.length} Mii${result.imported.length > 1 ? 's' : ''}!`, 'success');
      refreshGallery();
    }
    if (result.skipped.length > 0) showToast(`Skipped ${result.skipped.length} duplicate${result.skipped.length > 1 ? 's' : ''}`, 'info');
    if (result.imported.length === 0 && result.errors.length === 0 && result.skipped.length > 0) {
      showToast('All Miis already exist — nothing new to import', 'info');
    }
    e.target.value = '';
  };
  reader.readAsText(file);
}

/* ================================================================
   Dialogue Handlers
   ================================================================ */

function handleOpenDialogue() {
  const miis = listMiis();
  if (miis.length < 2) {
    showToast('You need at least 2 saved Miis to start a dialogue!', 'error');
    return;
  }
  
  $dialogueMii1.innerHTML = '';
  $dialogueMii2.innerHTML = '';
  miis.forEach(m => {
    const opt1 = document.createElement('option');
    opt1.value = m.id;
    opt1.textContent = m.name;
    $dialogueMii1.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = m.id;
    opt2.textContent = m.name;
    $dialogueMii2.appendChild(opt2);
  });
  
  if (miis.length > 1) {
    $dialogueMii2.value = miis[1].id;
  }

  $dialogueOverlay.classList.remove('hidden');
}

function handleCloseDialogue() {
  $dialogueOverlay.classList.add('hidden');
  handleStopDialogue();
}

function handleStartDialogue() {
  const miis = listMiis();
  const m1 = miis.find(m => String(m.id) === $dialogueMii1.value);
  const m2 = miis.find(m => String(m.id) === $dialogueMii2.value);
  
  if (m1.id === m2.id) {
    showToast('Please select two DIFFERENT Miis.', 'error');
    return;
  }

  $dialogueSetup.classList.add('hidden');
  $dialogueTheater.classList.remove('hidden');
  
  $dialogueMii1.disabled = true;
  $dialogueMii2.disabled = true;
  $dialogueTopic.disabled = true;
  $btnStartDialogue.disabled = true;

  $theaterBubble1.classList.add('hidden');
  $theaterBubble2.classList.add('hidden');
  $theaterBubble1.textContent = '';
  $theaterBubble2.textContent = '';

  initDialogue(
    m1, m2, $dialogueTopic.value, 
    (status) => {
      $dialogueStatus.textContent = status;
    },
    (agent, text, isPartial) => {
      const bubble = agent === 'mii1' ? $theaterBubble1 : $theaterBubble2;
      bubble.textContent = text;
      bubble.classList.remove('hidden');
      if (!isPartial) {
        setTimeout(() => {
          if (bubble.textContent === text) {
            bubble.classList.add('hidden');
          }
        }, 3000);
      }
    }
  );
}

function handleStopDialogue() {
  stopDialogue();
  $dialogueSetup.classList.remove('hidden');
  $dialogueTheater.classList.add('hidden');
  $dialogueMii1.disabled = false;
  $dialogueMii2.disabled = false;
  $dialogueTopic.disabled = false;
  $btnStartDialogue.disabled = false;
  $dialogueStatus.textContent = '';
}

/* ================================================================
   Rendering subscribers
   ================================================================ */

function renderPreview(s) {
  $previewContainer.innerHTML = renderMii(s);
  $previewName.textContent = s.name || 'Unnamed';
}

function updateControlHighlights(s) {
  // Skin swatches
  for (const btn of $skinSwatches.querySelectorAll('.swatch-btn')) {
    const active = btn.dataset.tone === s.appearance.skinTone;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-checked', active ? 'true' : 'false');
  }
  // Body shape
  for (const btn of $bodyShapeRow.querySelectorAll('.shape-btn')) {
    btn.classList.toggle('active', btn.dataset.shape === s.appearance.bodyShape);
  }
  // Accessory
  for (const btn of $accessoryRow.querySelectorAll('.accessory-btn')) {
    btn.classList.toggle('active', btn.dataset.accessory === s.appearance.accessory);
  }
  // Secondary color row
  $secondaryColorRow.hidden = !TWO_COLOR_STYLES.includes(s.appearance.outfit.style);

  // Face thumb rows
  const face = s.appearance.face || {};
  for (const btn of $faceShapeRow.querySelectorAll('.thumb-btn')) {
    const active = btn.dataset.faceShape === face.faceShape;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-checked', active ? 'true' : 'false');
  }
  for (const btn of $hairStyleRow.querySelectorAll('.thumb-btn')) {
    const active = btn.dataset.hairStyle === face.hairStyle;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-checked', active ? 'true' : 'false');
  }
  for (const btn of $eyeShapeRow.querySelectorAll('.thumb-btn')) {
    const active = btn.dataset.eyeShape === face.eyeShape;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-checked', active ? 'true' : 'false');
  }
  for (const btn of $mouthShapeRow.querySelectorAll('.thumb-btn')) {
    const active = btn.dataset.mouthShape === face.mouthShape;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-checked', active ? 'true' : 'false');
  }
}

/* ================================================================
   Gallery
   ================================================================ */

function refreshGallery() {
  const miis = listMiis();
  const currentId = getState().id;
  $galleryGrid.querySelectorAll('.gallery-card').forEach(c => c.remove());

  if (miis.length === 0) {
    $galleryEmpty.hidden = false;
    return;
  }
  $galleryEmpty.hidden = true;

  for (const mii of miis) {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    if (mii.id === currentId) card.classList.add('active');
    card.dataset.id = mii.id;

    const preview = document.createElement('div');
    preview.className = 'gallery-card-preview';
    preview.innerHTML = renderMiiThumbnail(mii);

    const nameEl = document.createElement('div');
    nameEl.className = 'gallery-card-name';
    nameEl.textContent = mii.name;

    const del = document.createElement('button');
    del.className = 'gallery-card-delete';
    del.type = 'button';
    del.textContent = '×';
    del.setAttribute('aria-label', `Delete ${mii.name}`);
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteMii(mii.id);
      showToast(`${mii.name} deleted`, 'info');
      refreshGallery();
    });

    card.addEventListener('click', () => {
      const loaded = loadMii(mii.id);
      if (loaded) {
        loadIntoEditor(loaded);
        refreshGallery();
        showToast(`Loaded ${loaded.name}`, 'info');
      }
    });

    card.appendChild(preview);
    card.appendChild(nameEl);
    card.appendChild(del);
    $galleryGrid.appendChild(card);
  }
}

/* ================================================================
   Sync controls to loaded state
   ================================================================ */

function syncControlsToState() {
  const s = state;
  $name.value    = s.name;
  $sliderIE.value = s.personality.introvertExtrovert;
  $sliderCI.value = s.personality.calmIntense;
  $sliderSS.value = s.personality.seriousSilly;
  $notes.value   = s.meta.notes || '';
  if (s.meta.voice) $metaVoice.value = s.meta.voice;
  $outfitStyle.value   = s.appearance.outfit.style;
  $primaryColor.value  = s.appearance.outfit.primaryColor;
  if (s.appearance.outfit.secondaryColor) {
    $secondaryColor.value = s.appearance.outfit.secondaryColor;
  }

  // Face controls
  const face = s.appearance.face || {};
  if (face.hairColor) $hairColor.value = face.hairColor;
  if (face.eyeColor)  $eyeColor.value  = face.eyeColor;
  $eyebrowStyle.value  = face.eyebrows  || 'arched';
  $noseStyle.value     = face.nose      || 'none';
  $expressionStyle.value = face.expression || 'none';
  $faceBlush.checked   = !!face.blush;
  $faceFreckles.checked = !!face.freckles;
  $faceEyelashes.checked = !!face.eyelashes;
  $faceBeautyMark.checked = !!face.beautyMark;
  $faceScar.checked    = !!face.scar;

  // Rebuild thumbnails so they reflect current hair/eye colors
  buildFaceThumbRows();
}

/* ================================================================
   Initialization
   ================================================================ */

function init() {
  buildSkinSwatches();
  buildFaceThumbRows();
  wireControls();

  subscribe(renderPreview);
  subscribe(updateControlHighlights);

  // Load initial state: most recent saved Mii or the Example
  const saved = listMiis();
  if (saved.length > 0) {
    loadIntoEditor(saved[0]);
  } else {
    loadIntoEditor(structuredClone(EXAMPLE_MII));
  }

  refreshGallery();
}

init();


})();
