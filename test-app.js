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

const SCHEMA_VERSION = 2;

const SKIN_TONES = ['pale', 'light', 'tan', 'olive', 'brown', 'deep'];
const BODY_SHAPES = ['narrow', 'regular', 'stocky'];
const OUTFIT_STYLES = ['tshirt', 'hoodie', 'dress', 'stripes', 'jacket', 'overalls'];
const ACCESSORIES = ['none', 'glasses', 'hat', 'bow', 'headphones'];

/** Outfit styles that use a secondary color */
const TWO_COLOR_STYLES = ['hoodie', 'stripes', 'jacket', 'overalls'];

/** Face feature enums */
const HAIR_STYLES = ['bob', 'long', 'pigtails', 'spiky', 'curly', 'buzz', 'ponytail', 'afro'];
const EYE_SHAPES = ['round', 'almond', 'sleepy', 'wide', 'angry', 'sparkle'];
const MOUTH_SHAPES = ['smile', 'smirk', 'grin', 'pout', 'flat', 'open'];
const EYEBROW_STYLES = ['none', 'arched', 'flat', 'angry'];

const HEX_COLOR_RE = /^#[0-9A-F]{6}$/;
const EMOJI_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

/** Default face values (Luna's look) */
const DEFAULT_FACE = {
  hairStyle: 'bob',
  hairColor: '#3B2416',
  eyeShape: 'round',
  eyeColor: '#2D1810',
  mouthShape: 'smile',
  eyebrows: 'arched',
  blush: true,
  freckles: false,
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
 * Validate a Mii object against the v2 schema.
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
      if (typeof face.blush !== 'boolean') {
        errors.push('appearance.face.blush must be a boolean');
      }
      if (typeof face.freckles !== 'boolean') {
        errors.push('appearance.face.freckles must be a boolean');
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
function migrateV1ToV2(v1Mii) {
  const migrated = JSON.parse(JSON.stringify(v1Mii));

  // Drop the top-level face object
  delete migrated.face;

  // Add appearance.face with defaults
  migrated.appearance.face = { ...DEFAULT_FACE };

  // Bump schema version
  migrated.schemaVersion = SCHEMA_VERSION;

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
  schemaVersion: 2,
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
      hairStyle: 'bob',
      hairColor: '#3B2416',
      eyeShape: 'round',
      eyeColor: '#2D1810',
      mouthShape: 'smile',
      eyebrows: 'arched',
      blush: true,
      freckles: false,
    },
  },
  meta: { notes: '' },
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
 * Composes layers bottom-to-top: body → arms → head → blush → freckles → eyebrows → eyes → mouth → hair → accessory.
 * Returns a complete SVG string from Mii state. Pure functions only — no side effects.
 *
 * @module miiRenderer
 */



const SPRITE_W = 240;
const SPRITE_H = 320;

/* -- Head geometry (shared by all face-part renderers) -- */
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

const OUTFIT_RENDERERS = {
  tshirt: outfitTshirt,
  hoodie: outfitHoodie,
  dress: outfitDress,
  stripes: outfitStripes,
  jacket: outfitJacket,
  overalls: outfitOveralls,
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

const ACCESSORY_RENDERERS = {
  none: () => '',
  glasses: accessoryGlasses,
  hat: accessoryHat,
  bow: accessoryBow,
  headphones: accessoryHeadphones,
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
        <path d="M${tailX - 8}" y="${topY + 20}
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
    <ellipse cx="${HEAD_CX}" cy="${HEAD_CY}" rx="${HEAD_RX}" ry="${HEAD_RY}" fill="${skinColor}" />
    ${renderBlush(face.blush)}
    ${renderFreckles(face.freckles, skinColor)}
    ${renderEyebrows(face.eyebrows || 'arched', face.hairColor || '#3B2416')}
    ${renderEyes(face.eyeShape || 'round', face.eyeColor || '#2D1810')}
    ${renderMouth(face.mouthShape || 'smile')}
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
  const face = { eyeShape: 'round', eyeColor: '#2D1810', mouthShape: 'smile',
                 eyebrows: 'arched', hairStyle: 'bob', hairColor: '#3B2416',
                 blush: false, freckles: false, ...facePatch };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <g transform="translate(${ox.toFixed(1)}, ${oy.toFixed(1)}) scale(${scale})">
      <ellipse cx="${HEAD_CX}" cy="${HEAD_CY}" rx="${HEAD_RX}" ry="${HEAD_RY}" fill="${skinColor}" />
      ${renderBlush(face.blush)}
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
 * localStorage CRUD, 

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
    if (mii && mii.schemaVersion === 1) {
      mii = migrateV1ToV2(mii);
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
        if (mii && mii.schemaVersion === 1) {
          mii = migrateV1ToV2(mii);
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
    // Auto-migrate v1 records on import
    if (record && record.schemaVersion === 1) {
      record = migrateV1ToV2(record);
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
const $notes          = document.getElementById('mii-notes');
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
const $previewContainer = document.getElementById('mii-preview-container');
const $previewName    = document.getElementById('preview-name');
const $btnSave        = document.getElementById('btn-save');
const $btnExportOne   = document.getElementById('btn-export-one');
const $btnNew         = document.getElementById('btn-new');
const $btnExportAll   = document.getElementById('btn-export-all');
const $btnImport      = document.getElementById('btn-import');
const $galleryGrid    = document.getElementById('gallery-grid');
const $galleryEmpty   = document.getElementById('gallery-empty');

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

  // Notes
  $notes.addEventListener('input', () => setState({ meta: { notes: $notes.value } }));

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

  // Face — blush / freckles
  $faceBlush.addEventListener('change', () =>
    setState({ appearance: { face: { blush: $faceBlush.checked } } }));
  $faceFreckles.addEventListener('change', () =>
    setState({ appearance: { face: { freckles: $faceFreckles.checked } } }));

  // Randomize face
  $btnRandomizeFace.addEventListener('click', handleRandomizeFace);

  // Save / Export / New
  $btnSave.addEventListener('click', handleSave);
  $btnExportOne.addEventListener('click', handleExportOne);
  $btnNew.addEventListener('click', handleNew);
  $btnExportAll.addEventListener('click', handleExportAll);
  $btnImport.addEventListener('change', handleImport);
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
        hairStyle:  pick(HAIR_STYLES),
        hairColor:  randomHex(),
        eyeShape:   pick(EYE_SHAPES),
        eyeColor:   randomHex(),
        mouthShape: pick(MOUTH_SHAPES),
        eyebrows:   pick(['none', 'arched', 'flat', 'angry']),
        blush:      Math.random() > 0.5,
        freckles:   Math.random() > 0.7,
      },
    },
  });
  showToast('New face rolled! 🎲', 'success');
}

function handleSave() {
  const s = getState();
  if (!s.name.trim()) {
    showToast('Your Mii needs a name!', 'error');
    $name.focus();
    return;
  }
  const sanitized = sanitizeName(s.name);
  state.name = sanitized;
  state.updatedAt = new Date().toISOString();
  const result = saveMii(state);
  if (result.ok) {
    showToast(`${sanitized} saved! 💾`, 'success');
    refreshGallery();
  } else {
    showToast(result.errors.join('\n'), 'error');
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
  $notes.value   = s.meta.notes;
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
  $faceBlush.checked   = !!face.blush;
  $faceFreckles.checked = !!face.freckles;

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

module.exports = { saveMii, EXAMPLE_MII, getState, handleSave };