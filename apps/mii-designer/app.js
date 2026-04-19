/**
 * Mii Designer — self-contained app bundle.
 *
 * This file inlines all module dependencies so the app works when opened
 * via file:// (double-click). The individual lib/*.js files remain as the
 * canonical source and are used by the dev server and tests.
 *
 * Architecture:
 *   1. Schema constants & validation (from shared/schema/miiSchema.js)
 *   2. Example Mii (from shared/schema/exampleMii.js)
 *   3. Palette & descriptors (from lib/palette.js)
 *   4. Toast notifications (from lib/toast.js)
 *   5. SVG renderer (from lib/miiRenderer.js)
 *   6. Prompt builder (from lib/faceGenerator.js)
 *   7. API client + cache (from lib/apiClient.js)
 *   8. Storage (from lib/storage.js)
 *   9. Main orchestrator (from main.js)
 */
'use strict';
(function () {

/* ================================================================
   1. SCHEMA CONSTANTS & VALIDATION
   ================================================================ */

const SCHEMA_VERSION = 1;
const SKIN_TONES = ['pale', 'light', 'tan', 'olive', 'brown', 'deep'];
const BODY_SHAPES = ['narrow', 'regular', 'stocky'];
const OUTFIT_STYLES = ['tshirt', 'hoodie', 'dress', 'stripes', 'jacket', 'overalls'];
const ACCESSORIES = ['none', 'glasses', 'hat', 'bow', 'headphones'];
const TWO_COLOR_STYLES = ['hoodie', 'stripes', 'jacket', 'overalls'];

const HEX_COLOR_RE = /^#[0-9A-F]{6}$/;
const EMOJI_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

function stripEmoji(str) {
  return str.replace(EMOJI_RE, '');
}

function sanitizeName(raw) {
  return stripEmoji(raw).trim().slice(0, 20);
}

function validateMii(obj) {
  const errors = [];
  if (!obj || typeof obj !== 'object') return { valid: false, errors: ['Input is not an object'] };

  if (typeof obj.id !== 'string' || obj.id.length === 0) errors.push('id must be a non-empty string');
  if (obj.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion must be ${SCHEMA_VERSION}`);

  for (const field of ['createdAt', 'updatedAt']) {
    if (typeof obj[field] !== 'string' || isNaN(Date.parse(obj[field]))) errors.push(`${field} must be a valid ISO 8601 timestamp`);
  }

  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) errors.push('name must be a non-empty string');
  else if (obj.name.length > 20) errors.push('name must be 20 characters or fewer');

  if (!obj.personality || typeof obj.personality !== 'object') {
    errors.push('personality must be an object');
  } else {
    for (const key of ['introvertExtrovert', 'calmIntense', 'seriousSilly']) {
      const val = obj.personality[key];
      if (typeof val !== 'number' || !Number.isInteger(val) || val < 0 || val > 100) errors.push(`personality.${key} must be an integer 0-100`);
    }
  }

  if (!obj.appearance || typeof obj.appearance !== 'object') {
    errors.push('appearance must be an object');
  } else {
    if (!SKIN_TONES.includes(obj.appearance.skinTone)) errors.push(`appearance.skinTone must be one of: ${SKIN_TONES.join(', ')}`);
    if (!BODY_SHAPES.includes(obj.appearance.bodyShape)) errors.push(`appearance.bodyShape must be one of: ${BODY_SHAPES.join(', ')}`);
    if (!ACCESSORIES.includes(obj.appearance.accessory)) errors.push(`appearance.accessory must be one of: ${ACCESSORIES.join(', ')}`);

    if (!obj.appearance.outfit || typeof obj.appearance.outfit !== 'object') {
      errors.push('appearance.outfit must be an object');
    } else {
      const outfit = obj.appearance.outfit;
      if (!OUTFIT_STYLES.includes(outfit.style)) errors.push(`appearance.outfit.style must be one of: ${OUTFIT_STYLES.join(', ')}`);
      if (typeof outfit.primaryColor !== 'string' || !HEX_COLOR_RE.test(outfit.primaryColor)) errors.push('appearance.outfit.primaryColor must be a hex color like #RRGGBB (uppercase)');
      if (TWO_COLOR_STYLES.includes(outfit.style)) {
        if (typeof outfit.secondaryColor !== 'string' || !HEX_COLOR_RE.test(outfit.secondaryColor)) errors.push('appearance.outfit.secondaryColor must be a hex color for this outfit style');
      } else {
        if (outfit.secondaryColor !== null) errors.push('appearance.outfit.secondaryColor must be null for this outfit style');
      }
    }
  }

  if (!obj.face || typeof obj.face !== 'object') {
    errors.push('face must be an object');
  } else {
    if (typeof obj.face.prompt !== 'string') errors.push('face.prompt must be a string');
    if (typeof obj.face.vibe !== 'string') errors.push('face.vibe must be a string (use empty string, not null)');
    if (obj.face.imageDataUrl !== null && typeof obj.face.imageDataUrl !== 'string') errors.push('face.imageDataUrl must be a string or null');
    if (obj.face.generatedAt !== null && (typeof obj.face.generatedAt !== 'string' || isNaN(Date.parse(obj.face.generatedAt)))) errors.push('face.generatedAt must be a valid ISO 8601 timestamp or null');
    if (obj.face.modelId !== 'gemini-3.1-flash-image-preview') errors.push('face.modelId must be "gemini-3.1-flash-image-preview"');
  }

  if (!obj.meta || typeof obj.meta !== 'object') {
    errors.push('meta must be an object');
  } else {
    if (typeof obj.meta.notes !== 'string') errors.push('meta.notes must be a string');
    else if (obj.meta.notes.length > 500) errors.push('meta.notes must be 500 characters or fewer');
  }

  return { valid: errors.length === 0, errors };
}

function createBlankMii() {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    name: '',
    personality: { introvertExtrovert: 50, calmIntense: 50, seriousSilly: 50 },
    appearance: {
      skinTone: 'light',
      bodyShape: 'regular',
      outfit: { style: 'tshirt', primaryColor: '#5B8CDE', secondaryColor: null },
      accessory: 'none',
    },
    face: { prompt: '', vibe: '', imageDataUrl: null, generatedAt: null, modelId: 'gemini-3.1-flash-image-preview' },
    meta: { notes: '' },
  };
}

/* ================================================================
   2. EXAMPLE MII
   ================================================================ */

const EXAMPLE_MII = {
  id: '00000000-0000-4000-8000-000000000001',
  schemaVersion: 1,
  createdAt: '2026-04-19T00:00:00.000Z',
  updatedAt: '2026-04-19T00:00:00.000Z',
  name: 'Example',
  personality: { introvertExtrovert: 70, calmIntense: 40, seriousSilly: 75 },
  appearance: {
    skinTone: 'light',
    bodyShape: 'regular',
    outfit: { style: 'hoodie', primaryColor: '#7F77DD', secondaryColor: '#534AB7' },
    accessory: 'glasses',
  },
  face: { prompt: '', vibe: '', imageDataUrl: null, generatedAt: null, modelId: 'gemini-3.1-flash-image-preview' },
  meta: { notes: '' },
};

/* ================================================================
   3. PALETTE & DESCRIPTORS
   ================================================================ */

const SKIN_TONE_COLORS = {
  pale: '#F5D4B8', light: '#E8B591', tan: '#C98E6F',
  olive: '#A97054', brown: '#7D4E38', deep: '#4A2D1E',
};

const SKIN_TONE_DESCRIPTORS = {
  pale: 'pale fair skin', light: 'light skin', tan: 'tan skin',
  olive: 'olive skin', brown: 'medium brown skin', deep: 'deep brown skin',
};

const PERSONALITY_DESCRIPTORS = {
  introvertExtrovert: ['shy, reserved', 'quiet, thoughtful', 'balanced', 'friendly, open', 'outgoing, animated'],
  calmIntense: ['serene, relaxed', 'easygoing', 'steady', 'spirited, alert', 'fiery, energetic'],
  seriousSilly: ['solemn, composed', 'measured, dry', 'even-tempered', 'playful', 'goofy, mischievous'],
};

function getPersonalityDescriptor(trait, value) {
  const d = PERSONALITY_DESCRIPTORS[trait];
  if (!d) return 'balanced';
  if (value <= 20) return d[0];
  if (value <= 40) return d[1];
  if (value <= 60) return d[2];
  if (value <= 80) return d[3];
  return d[4];
}

const BODY_WIDTHS = { narrow: 40, regular: 56, stocky: 72 };

/* ================================================================
   4. TOAST NOTIFICATIONS
   ================================================================ */

let toastContainer = null;

function ensureToastContainer() {
  if (toastContainer) return;
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastContainer);
}

function showToast(message, type, durationMs) {
  type = type || 'info';
  durationMs = durationMs || 3000;
  ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.addEventListener('click', function () { dismissToast(toast); });
  toastContainer.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.add('toast--visible'); });
  setTimeout(function () { dismissToast(toast); }, durationMs);
}

function dismissToast(toast) {
  toast.classList.remove('toast--visible');
  toast.addEventListener('transitionend', function () { toast.remove(); }, { once: true });
  setTimeout(function () { toast.remove(); }, 400);
}

/* ================================================================
   5. SVG RENDERER
   ================================================================ */

const SPRITE_W = 240;
const SPRITE_H = 320;
const HEAD_CX = 120;
const HEAD_CY = 110;
const HEAD_RX = 72;
const HEAD_RY = 82;
const FACE_INSET = 10;
const BODY_TOP = 185;
const BODY_BOTTOM = 310;
const BODY_CX = 120;
const ARM_WIDTH = 14;
const ARM_LENGTH = 60;

function darken(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
  const b = Math.max(0, (num & 0xFF) - amount);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function outfitTshirt(halfW, primary) {
  return '<rect x="' + (BODY_CX - halfW) + '" y="' + BODY_TOP + '" width="' + (halfW * 2) + '" height="' + (BODY_BOTTOM - BODY_TOP) + '" rx="12" fill="' + primary + '" />' +
    '<path d="M' + (BODY_CX - halfW + 10) + ' ' + BODY_TOP + ' Q' + BODY_CX + ' ' + (BODY_TOP + 20) + ' ' + (BODY_CX + halfW - 10) + ' ' + BODY_TOP + '" stroke="' + darken(primary, 20) + '" stroke-width="2" fill="none" />';
}

function outfitHoodie(halfW, primary, secondary) {
  const hoodColor = secondary || darken(primary, 30);
  return '<rect x="' + (BODY_CX - halfW) + '" y="' + BODY_TOP + '" width="' + (halfW * 2) + '" height="' + (BODY_BOTTOM - BODY_TOP) + '" rx="12" fill="' + primary + '" />' +
    '<ellipse cx="' + HEAD_CX + '" cy="' + (BODY_TOP - 2) + '" rx="' + (halfW - 4) + '" ry="18" fill="' + hoodColor + '" />' +
    '<rect x="' + (BODY_CX - halfW + 8) + '" y="' + (BODY_TOP + 60) + '" width="' + (halfW * 2 - 16) + '" height="22" rx="6" fill="' + darken(primary, 15) + '" opacity="0.4" />' +
    '<line x1="' + (BODY_CX - 6) + '" y1="' + (BODY_TOP + 4) + '" x2="' + (BODY_CX - 6) + '" y2="' + (BODY_TOP + 28) + '" stroke="' + hoodColor + '" stroke-width="2" stroke-linecap="round" />' +
    '<line x1="' + (BODY_CX + 6) + '" y1="' + (BODY_TOP + 4) + '" x2="' + (BODY_CX + 6) + '" y2="' + (BODY_TOP + 28) + '" stroke="' + hoodColor + '" stroke-width="2" stroke-linecap="round" />';
}

function outfitDress(halfW, primary) {
  const flareW = halfW + 16;
  return '<path d="M' + (BODY_CX - halfW) + ' ' + BODY_TOP + ' L' + (BODY_CX - flareW) + ' ' + BODY_BOTTOM + ' Q' + BODY_CX + ' ' + (BODY_BOTTOM + 6) + ' ' + (BODY_CX + flareW) + ' ' + BODY_BOTTOM + ' L' + (BODY_CX + halfW) + ' ' + BODY_TOP + ' Z" fill="' + primary + '" />' +
    '<path d="M' + (BODY_CX - 14) + ' ' + BODY_TOP + ' Q' + BODY_CX + ' ' + (BODY_TOP + 12) + ' ' + (BODY_CX + 14) + ' ' + BODY_TOP + '" stroke="' + darken(primary, 20) + '" stroke-width="2" fill="none" />';
}

function outfitStripes(halfW, primary, secondary) {
  const stripeColor = secondary || darken(primary, 25);
  let stripes = '';
  const stripeH = 10;
  const gap = 14;
  for (let y = BODY_TOP + 16; y < BODY_BOTTOM - 20; y += gap + stripeH) {
    stripes += '<rect x="' + (BODY_CX - halfW + 4) + '" y="' + y + '" width="' + (halfW * 2 - 8) + '" height="' + stripeH + '" rx="3" fill="' + stripeColor + '" opacity="0.6" />';
  }
  return '<rect x="' + (BODY_CX - halfW) + '" y="' + BODY_TOP + '" width="' + (halfW * 2) + '" height="' + (BODY_BOTTOM - BODY_TOP) + '" rx="12" fill="' + primary + '" />' + stripes;
}

function outfitJacket(halfW, primary, secondary) {
  const innerColor = secondary || '#FFFFFF';
  return '<rect x="' + (BODY_CX - halfW) + '" y="' + BODY_TOP + '" width="' + (halfW * 2) + '" height="' + (BODY_BOTTOM - BODY_TOP) + '" rx="12" fill="' + primary + '" />' +
    '<path d="M' + (BODY_CX - 12) + ' ' + BODY_TOP + ' L' + BODY_CX + ' ' + (BODY_TOP + 40) + ' L' + (BODY_CX + 12) + ' ' + BODY_TOP + '" fill="' + innerColor + '" />' +
    '<line x1="' + BODY_CX + '" y1="' + BODY_TOP + '" x2="' + BODY_CX + '" y2="' + (BODY_BOTTOM - 10) + '" stroke="' + darken(primary, 20) + '" stroke-width="1.5" opacity="0.5" />';
}

function outfitOveralls(halfW, primary, secondary) {
  const shirtColor = secondary || '#FFFFFF';
  return '<rect x="' + (BODY_CX - halfW) + '" y="' + BODY_TOP + '" width="' + (halfW * 2) + '" height="' + (BODY_BOTTOM - BODY_TOP) + '" rx="12" fill="' + shirtColor + '" />' +
    '<rect x="' + (BODY_CX - halfW + 4) + '" y="' + (BODY_TOP + 30) + '" width="' + (halfW * 2 - 8) + '" height="' + (BODY_BOTTOM - BODY_TOP - 30) + '" rx="8" fill="' + primary + '" />' +
    '<rect x="' + (BODY_CX - halfW + 8) + '" y="' + (BODY_TOP + 4) + '" width="10" height="30" rx="3" fill="' + primary + '" />' +
    '<rect x="' + (BODY_CX + halfW - 18) + '" y="' + (BODY_TOP + 4) + '" width="10" height="30" rx="3" fill="' + primary + '" />' +
    '<rect x="' + (BODY_CX - 12) + '" y="' + (BODY_TOP + 60) + '" width="24" height="18" rx="4" fill="' + darken(primary, 15) + '" opacity="0.4" />';
}

const OUTFIT_RENDERERS = {
  tshirt: outfitTshirt, hoodie: outfitHoodie, dress: outfitDress,
  stripes: outfitStripes, jacket: outfitJacket, overalls: outfitOveralls,
};

function accessoryGlasses() {
  const y = HEAD_CY - 4;
  return '<circle cx="' + (HEAD_CX - 22) + '" cy="' + y + '" r="16" fill="none" stroke="#3A3A3A" stroke-width="3" />' +
    '<circle cx="' + (HEAD_CX + 22) + '" cy="' + y + '" r="16" fill="none" stroke="#3A3A3A" stroke-width="3" />' +
    '<line x1="' + (HEAD_CX - 6) + '" y1="' + y + '" x2="' + (HEAD_CX + 6) + '" y2="' + y + '" stroke="#3A3A3A" stroke-width="2.5" />' +
    '<line x1="' + (HEAD_CX - 38) + '" y1="' + y + '" x2="' + (HEAD_CX - HEAD_RX + 8) + '" y2="' + (y - 6) + '" stroke="#3A3A3A" stroke-width="2.5" />' +
    '<line x1="' + (HEAD_CX + 38) + '" y1="' + y + '" x2="' + (HEAD_CX + HEAD_RX - 8) + '" y2="' + (y - 6) + '" stroke="#3A3A3A" stroke-width="2.5" />';
}

function accessoryHat() {
  return '<ellipse cx="' + HEAD_CX + '" cy="' + (HEAD_CY - HEAD_RY + 12) + '" rx="' + (HEAD_RX + 10) + '" ry="10" fill="#5A4A3A" />' +
    '<rect x="' + (HEAD_CX - 40) + '" y="' + (HEAD_CY - HEAD_RY - 32) + '" width="80" height="44" rx="12" fill="#5A4A3A" />' +
    '<rect x="' + (HEAD_CX - 40) + '" y="' + (HEAD_CY - HEAD_RY) + '" width="80" height="8" rx="2" fill="#8B6F47" />';
}

function accessoryBow() {
  const bx = HEAD_CX + 36;
  const by = HEAD_CY - HEAD_RY + 18;
  return '<ellipse cx="' + (bx - 14) + '" cy="' + by + '" rx="14" ry="10" fill="#E85A7A" />' +
    '<ellipse cx="' + (bx + 14) + '" cy="' + by + '" rx="14" ry="10" fill="#E85A7A" />' +
    '<circle cx="' + bx + '" cy="' + by + '" r="5" fill="#C94060" />';
}

function accessoryHeadphones() {
  return '<path d="M' + (HEAD_CX - HEAD_RX + 4) + ' ' + (HEAD_CY - 10) + ' Q' + HEAD_CX + ' ' + (HEAD_CY - HEAD_RY - 30) + ' ' + (HEAD_CX + HEAD_RX - 4) + ' ' + (HEAD_CY - 10) + '" fill="none" stroke="#444" stroke-width="5" stroke-linecap="round" />' +
    '<rect x="' + (HEAD_CX - HEAD_RX - 2) + '" y="' + (HEAD_CY - 20) + '" width="16" height="26" rx="6" fill="#444" />' +
    '<rect x="' + (HEAD_CX - HEAD_RX) + '" y="' + (HEAD_CY - 16) + '" width="12" height="18" rx="4" fill="#666" />' +
    '<rect x="' + (HEAD_CX + HEAD_RX - 14) + '" y="' + (HEAD_CY - 20) + '" width="16" height="26" rx="6" fill="#444" />' +
    '<rect x="' + (HEAD_CX + HEAD_RX - 12) + '" y="' + (HEAD_CY - 16) + '" width="12" height="18" rx="4" fill="#666" />';
}

const ACCESSORY_RENDERERS = {
  none: function () { return ''; },
  glasses: accessoryGlasses,
  hat: accessoryHat,
  bow: accessoryBow,
  headphones: accessoryHeadphones,
};

function placeholderFace() {
  return '<ellipse cx="' + (HEAD_CX - 20) + '" cy="' + (HEAD_CY - 8) + '" rx="7" ry="9" fill="#3A3A3A" />' +
    '<ellipse cx="' + (HEAD_CX + 20) + '" cy="' + (HEAD_CY - 8) + '" rx="7" ry="9" fill="#3A3A3A" />' +
    '<circle cx="' + (HEAD_CX - 18) + '" cy="' + (HEAD_CY - 12) + '" r="3" fill="#FFF" />' +
    '<circle cx="' + (HEAD_CX + 22) + '" cy="' + (HEAD_CY - 12) + '" r="3" fill="#FFF" />' +
    '<path d="M' + (HEAD_CX - 12) + ' ' + (HEAD_CY + 18) + ' Q' + HEAD_CX + ' ' + (HEAD_CY + 28) + ' ' + (HEAD_CX + 12) + ' ' + (HEAD_CY + 18) + '" stroke="#3A3A3A" stroke-width="2.5" fill="none" stroke-linecap="round" />' +
    '<ellipse cx="' + (HEAD_CX - 32) + '" cy="' + (HEAD_CY + 8) + '" rx="10" ry="6" fill="#F5A0A0" opacity="0.4" />' +
    '<ellipse cx="' + (HEAD_CX + 32) + '" cy="' + (HEAD_CY + 8) + '" rx="10" ry="6" fill="#F5A0A0" opacity="0.4" />';
}

function renderArms(halfW, skinColor) {
  const leftX = BODY_CX - halfW - ARM_WIDTH / 2;
  const rightX = BODY_CX + halfW - ARM_WIDTH / 2;
  const armTop = BODY_TOP + 10;
  return '<rect x="' + leftX + '" y="' + armTop + '" width="' + ARM_WIDTH + '" height="' + ARM_LENGTH + '" rx="' + (ARM_WIDTH / 2) + '" fill="' + skinColor + '" />' +
    '<rect x="' + rightX + '" y="' + armTop + '" width="' + ARM_WIDTH + '" height="' + ARM_LENGTH + '" rx="' + (ARM_WIDTH / 2) + '" fill="' + skinColor + '" />';
}

function renderMii(mii) {
  const skinColor = SKIN_TONE_COLORS[mii.appearance.skinTone] || SKIN_TONE_COLORS.light;
  const halfW = (BODY_WIDTHS[mii.appearance.bodyShape] || BODY_WIDTHS.regular) / 2;
  const outfitStyle = mii.appearance.outfit.style || 'tshirt';
  const primaryColor = mii.appearance.outfit.primaryColor || '#5B8CDE';
  const secondaryColor = mii.appearance.outfit.secondaryColor;
  const accessory = mii.appearance.accessory || 'none';
  const faceDataUrl = mii.face ? mii.face.imageDataUrl : null;

  const outfitFn = OUTFIT_RENDERERS[outfitStyle] || OUTFIT_RENDERERS.tshirt;
  const accessoryFn = ACCESSORY_RENDERERS[accessory] || ACCESSORY_RENDERERS.none;

  const clipId = 'face-clip-' + (mii.id || 'preview');

  let headLayer;
  let faceLayer;
  if (faceDataUrl) {
    // When a generated face exists, it IS the head — skip the skin-toned ellipse.
    // Clip the face image to the full head shape (no inset) so it fills cleanly.
    headLayer = '';
    faceLayer = '<defs><clipPath id="' + clipId + '"><ellipse cx="' + HEAD_CX + '" cy="' + HEAD_CY + '" rx="' + HEAD_RX + '" ry="' + HEAD_RY + '" /></clipPath></defs>' +
      '<image href="' + faceDataUrl + '" x="' + (HEAD_CX - HEAD_RX) + '" y="' + (HEAD_CY - HEAD_RY) + '" width="' + (HEAD_RX * 2) + '" height="' + (HEAD_RY * 2) + '" clip-path="url(#' + clipId + ')" preserveAspectRatio="xMidYMid slice" />';
  } else {
    // No face — show skin-colored head with placeholder chibi face
    headLayer = '<ellipse cx="' + HEAD_CX + '" cy="' + HEAD_CY + '" rx="' + HEAD_RX + '" ry="' + HEAD_RY + '" fill="' + skinColor + '" />';
    faceLayer = placeholderFace();
  }

  const escapedName = (mii.name || 'Unnamed').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + SPRITE_W + ' ' + SPRITE_H + '" width="' + SPRITE_W + '" height="' + SPRITE_H + '" role="img" aria-label="Mii character: ' + escapedName + '">' +
    outfitFn(halfW, primaryColor, secondaryColor) +
    renderArms(halfW, skinColor) +
    headLayer +
    faceLayer +
    accessoryFn() +
    '</svg>';
}

function renderMiiThumbnail(mii) {
  return renderMii(mii).replace('width="' + SPRITE_W + '" height="' + SPRITE_H + '"', 'width="120" height="160"');
}

/* ================================================================
   6. PROMPT BUILDER
   ================================================================ */

function buildFacePrompt(mii) {
  const name = mii.name || 'Character';
  const personalityDescriptors = [
    getPersonalityDescriptor('introvertExtrovert', mii.personality.introvertExtrovert),
    getPersonalityDescriptor('calmIntense', mii.personality.calmIntense),
    getPersonalityDescriptor('seriousSilly', mii.personality.seriousSilly),
  ].join(', ');
  const skinToneDescriptor = SKIN_TONE_DESCRIPTORS[mii.appearance.skinTone] || 'light skin';
  const skinHex = SKIN_TONE_COLORS[mii.appearance.skinTone] || SKIN_TONE_COLORS.light;
  const vibeLine = mii.face.vibe ? 'Extra vibe: ' + mii.face.vibe + '.' : '';

  const lines = [
    'Chibi anime face portrait. FACE ONLY — tightly cropped to just the face and hair. Front-facing, flat illustration style, clean lines.',
    '',
    'Character: ' + name + ', ' + personalityDescriptors + '. Skin tone: ' + skinToneDescriptor + '.',
    vibeLine,
    '',
    'Background: solid flat color ' + skinHex + ' (the exact skin tone color). The background MUST be this single solid color, NOT a pastel, NOT a gradient, NOT a scene.',
    '',
    'CRITICAL: Show ONLY the face and hair. NO neck, NO shoulders, NO upper body, NO clothing, NO torso. Frame the image as a tight headshot — face fills 90% of the image. Cute chibi proportions, large expressive eyes, simple clean line art, NO text, NO watermark.',
  ];

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* ================================================================
   7. API CLIENT + CACHE
   ================================================================ */

const PROXY_BASE = 'http://localhost:3001';
const CACHE_PREFIX = 'faceCache:';

async function checkProxyAvailable() {
  try {
    const res = await fetch(PROXY_BASE + '/health', { method: 'HEAD', signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch { return false; }
}

async function sha256Short(input) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('').slice(0, 16);
}

async function getCachedFace(prompt) {
  const hash = await sha256Short(prompt);
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + hash);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    return (cached && cached.imageDataUrl) ? cached : null;
  } catch { return null; }
}

async function cacheFace(prompt, imageDataUrl, generatedAt) {
  const hash = await sha256Short(prompt);
  try { localStorage.setItem(CACHE_PREFIX + hash, JSON.stringify({ imageDataUrl: imageDataUrl, generatedAt: generatedAt })); }
  catch { /* quota exceeded — best effort */ }
}

async function generateFaceImage(prompt) {
  const cached = await getCachedFace(prompt);
  if (cached) return { imageDataUrl: cached.imageDataUrl, generatedAt: cached.generatedAt, fromCache: true };

  try {
    const res = await fetch(PROXY_BASE + '/api/generate-face', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt }),
    });
    if (!res.ok) { const body = await res.text(); return { error: 'API error (' + res.status + '): ' + body }; }
    const data = await res.json();
    if (!data.imageDataUrl) return { error: 'No image data in API response' };
    const generatedAt = new Date().toISOString();
    await cacheFace(prompt, data.imageDataUrl, generatedAt);
    return { imageDataUrl: data.imageDataUrl, generatedAt: generatedAt, fromCache: false };
  } catch (err) {
    return { error: 'Network error: ' + err.message };
  }
}

/* ================================================================
   8. STORAGE
   ================================================================ */

const MII_PREFIX = 'miis:';
const MAX_MIIS = 50;

function saveMiiToStorage(mii) {
  const prepared = JSON.parse(JSON.stringify(mii));
  prepared.name = sanitizeName(prepared.name);
  prepared.updatedAt = new Date().toISOString();

  if (!TWO_COLOR_STYLES.includes(prepared.appearance.outfit.style)) {
    prepared.appearance.outfit.secondaryColor = null;
  }
  if (prepared.appearance.outfit.primaryColor) {
    prepared.appearance.outfit.primaryColor = prepared.appearance.outfit.primaryColor.toUpperCase();
  }
  if (prepared.appearance.outfit.secondaryColor) {
    prepared.appearance.outfit.secondaryColor = prepared.appearance.outfit.secondaryColor.toUpperCase();
  }

  const result = validateMii(prepared);
  if (!result.valid) return { ok: false, errors: result.errors };

  const count = listAllMiis().length;
  const isUpdate = localStorage.getItem(MII_PREFIX + prepared.id) !== null;
  if (!isUpdate && count >= MAX_MIIS) return { ok: false, errors: ['You\'ve reached the maximum of ' + MAX_MIIS + ' saved Miis. Delete some to make room!'] };

  try {
    localStorage.setItem(MII_PREFIX + prepared.id, JSON.stringify(prepared));
    return { ok: true };
  } catch (err) {
    return { ok: false, errors: ['Could not save: ' + err.message] };
  }
}

function loadMiiFromStorage(id) {
  try {
    const raw = localStorage.getItem(MII_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function listAllMiis() {
  const miis = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(MII_PREFIX)) {
      try {
        const mii = JSON.parse(localStorage.getItem(key));
        if (mii) miis.push(mii);
      } catch { /* skip corrupted */ }
    }
  }
  miis.sort(function (a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); });
  return miis;
}

function deleteMiiFromStorage(id) {
  localStorage.removeItem(MII_PREFIX + id);
}

function exportAllMiis() {
  return JSON.stringify(listAllMiis(), null, 2);
}

function exportOneMii(mii) {
  return JSON.stringify(mii, null, 2);
}

function importMiisFromJson(jsonString) {
  const result = { imported: [], skipped: [], errors: [] };
  let parsed;
  try { parsed = JSON.parse(jsonString); }
  catch (err) { result.errors.push('Invalid JSON: ' + err.message); return result; }

  const records = Array.isArray(parsed) ? parsed : [parsed];
  for (const record of records) {
    const validation = validateMii(record);
    if (!validation.valid) { result.errors.push('"' + (record.name || 'unknown') + '": ' + validation.errors.join('; ')); continue; }
    if (localStorage.getItem(MII_PREFIX + record.id) !== null) { result.skipped.push(record); continue; }
    try {
      localStorage.setItem(MII_PREFIX + record.id, JSON.stringify(record));
      result.imported.push(record);
    } catch (err) { result.errors.push('Could not save "' + record.name + '": ' + err.message); }
  }
  return result;
}

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
   9. MAIN ORCHESTRATOR
   ================================================================ */

let state = JSON.parse(JSON.stringify(EXAMPLE_MII));
let proxyAvailable = false;
const subscribers = [];

function getState() { return state; }

function setState(patch) {
  // Deep merge nested objects
  if (patch.personality) {
    state.personality = Object.assign({}, state.personality, patch.personality);
  }
  if (patch.appearance) {
    if (patch.appearance.outfit) {
      state.appearance.outfit = Object.assign({}, state.appearance.outfit, patch.appearance.outfit);
    }
    const { outfit, ...restAppearance } = patch.appearance;
    Object.assign(state.appearance, restAppearance);
  }
  if (patch.face) {
    state.face = Object.assign({}, state.face, patch.face);
  }
  if (patch.meta) {
    state.meta = Object.assign({}, state.meta, patch.meta);
  }
  // Top-level simple fields
  const nested = ['personality', 'appearance', 'face', 'meta'];
  for (const key in patch) {
    if (!nested.includes(key)) state[key] = patch[key];
  }
  notify();
}

function subscribe(fn) { subscribers.push(fn); }

function notify() {
  for (const fn of subscribers) fn(state);
}

function loadIntoEditor(mii) {
  state = JSON.parse(JSON.stringify(mii));
  syncControlsToState();
  notify();
}

/* ---- DOM references ---- */
const $ = function (id) { return document.getElementById(id); };
const $name = $('mii-name');
const $sliderIE = $('slider-introvert-extrovert');
const $sliderCI = $('slider-calm-intense');
const $sliderSS = $('slider-serious-silly');
const $notes = $('mii-notes');
const $skinSwatches = $('skin-tone-swatches');
const $bodyShapeRow = $('body-shape-row');
const $outfitStyle = $('outfit-style');
const $primaryColor = $('outfit-primary-color');
const $secondaryColor = $('outfit-secondary-color');
const $secondaryColorRow = $('secondary-color-row');
const $accessoryRow = $('accessory-row');
const $faceVibe = $('face-vibe');
const $btnGenerateFace = $('btn-generate-face');

const $facePreviewArea = $('face-preview-area');
const $facePreviewImg = $('face-preview-img');
const $proxyWarning = $('proxy-warning');
const $previewContainer = $('mii-preview-container');
const $previewName = $('preview-name');
const $btnSave = $('btn-save');
const $btnExportOne = $('btn-export-one');
const $btnNew = $('btn-new');
const $btnExportAll = $('btn-export-all');
const $btnImport = $('btn-import');
const $galleryGrid = $('gallery-grid');
const $galleryEmpty = $('gallery-empty');

/* ---- Build skin swatches ---- */
function buildSkinSwatches() {
  $skinSwatches.innerHTML = '';
  for (const tone of SKIN_TONES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch-btn';
    btn.dataset.tone = tone;
    btn.style.backgroundColor = SKIN_TONE_COLORS[tone];
    btn.setAttribute('aria-label', tone + ' skin tone');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    $skinSwatches.appendChild(btn);
  }
}

/* ---- Wire controls ---- */
function wireControls() {
  $name.addEventListener('input', function () { setState({ name: $name.value }); });
  $sliderIE.addEventListener('input', function () { setState({ personality: { introvertExtrovert: parseInt($sliderIE.value, 10) } }); });
  $sliderCI.addEventListener('input', function () { setState({ personality: { calmIntense: parseInt($sliderCI.value, 10) } }); });
  $sliderSS.addEventListener('input', function () { setState({ personality: { seriousSilly: parseInt($sliderSS.value, 10) } }); });
  $notes.addEventListener('input', function () { setState({ meta: { notes: $notes.value } }); });

  $skinSwatches.addEventListener('click', function (e) {
    const btn = e.target.closest('.swatch-btn');
    if (btn) setState({ appearance: { skinTone: btn.dataset.tone } });
  });

  $bodyShapeRow.addEventListener('click', function (e) {
    const btn = e.target.closest('.shape-btn');
    if (btn) setState({ appearance: { bodyShape: btn.dataset.shape } });
  });

  $outfitStyle.addEventListener('change', function () {
    const style = $outfitStyle.value;
    const needsSecondary = TWO_COLOR_STYLES.includes(style);
    const update = { appearance: { outfit: { style: style } } };
    if (!needsSecondary) {
      update.appearance.outfit.secondaryColor = null;
    } else if (!state.appearance.outfit.secondaryColor) {
      update.appearance.outfit.secondaryColor = '#3A6DB5';
    }
    setState(update);
  });

  $primaryColor.addEventListener('input', function () {
    setState({ appearance: { outfit: { primaryColor: $primaryColor.value.toUpperCase() } } });
  });
  $secondaryColor.addEventListener('input', function () {
    setState({ appearance: { outfit: { secondaryColor: $secondaryColor.value.toUpperCase() } } });
  });

  $accessoryRow.addEventListener('click', function (e) {
    const btn = e.target.closest('.accessory-btn');
    if (btn) setState({ appearance: { accessory: btn.dataset.accessory } });
  });

  $faceVibe.addEventListener('input', function () { setState({ face: { vibe: $faceVibe.value } }); });

  $btnGenerateFace.addEventListener('click', handleGenerateFace);

  $btnSave.addEventListener('click', handleSave);

  $btnExportOne.addEventListener('click', function () {
    const s = getState();
    if (!s.name.trim()) { showToast('Give your Mii a name before exporting!', 'error'); return; }
    downloadJson(sanitizeName(s.name) + '.mii.json', exportOneMii(s));
    showToast('Exported ' + s.name + '!', 'success');
  });

  $btnNew.addEventListener('click', function () {
    loadIntoEditor(createBlankMii());
    showToast('New Mii created — make it yours!', 'info');
  });

  $btnExportAll.addEventListener('click', function () {
    const all = listAllMiis();
    if (all.length === 0) { showToast('No Miis to export yet!', 'info'); return; }
    downloadJson('miis.json', exportAllMiis());
    showToast('Exported ' + all.length + ' Mii' + (all.length > 1 ? 's' : '') + '!', 'success');
  });

  $btnImport.addEventListener('change', handleImport);
}

/* ---- Face generation ---- */
async function handleGenerateFace() {
  if (!proxyAvailable) {
    $proxyWarning.hidden = false;
    showToast('Dev server not running — see the instructions below', 'error');
    return;
  }

  const s = getState();
  if (!s.name.trim()) {
    showToast('Name your Mii first so the face matches!', 'error');
    return;
  }

  $btnGenerateFace.disabled = true;
  const labelEl = $btnGenerateFace.querySelector('.btn-label');
  const spinnerEl = $btnGenerateFace.querySelector('.btn-spinner');
  labelEl.textContent = 'Generating…';
  spinnerEl.hidden = false;

  const prompt = buildFacePrompt(s);

  try {
    const result = await generateFaceImage(prompt);
    if (result.error) { showToast(result.error, 'error'); return; }

    setState({
      face: {
        imageDataUrl: result.imageDataUrl,
        generatedAt: result.generatedAt,
        prompt: prompt,
        modelId: 'gemini-3.1-flash-image-preview',
      },
    });

    showToast(result.fromCache ? 'Face loaded from cache ✨' : 'Face generated! Looking good ✨', 'success');

    $facePreviewImg.src = result.imageDataUrl;
    $facePreviewArea.hidden = false;
  } catch (err) {
    showToast('Something went wrong: ' + err.message, 'error');
  } finally {
    labelEl.textContent = '✨ Generate Face';
    spinnerEl.hidden = true;
    $btnGenerateFace.disabled = false;
  }
}

/* ---- Save ---- */
function handleSave() {
  const s = getState();
  if (!s.name.trim()) {
    showToast('Your Mii needs a name!', 'error');
    $name.focus();
    return;
  }

  state.name = sanitizeName(s.name);
  state.updatedAt = new Date().toISOString();

  const result = saveMiiToStorage(state);
  if (result.ok) {
    showToast(state.name + ' saved! 💾', 'success');
    refreshGallery();
  } else {
    showToast(result.errors.join('\n'), 'error');
  }
}

/* ---- Import ---- */
function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const result = importMiisFromJson(reader.result);
    if (result.errors.length > 0) showToast('Import issues: ' + result.errors.join('; '), 'error');
    if (result.imported.length > 0) {
      showToast('Imported ' + result.imported.length + ' Mii' + (result.imported.length > 1 ? 's' : '') + '!', 'success');
      refreshGallery();
    }
    if (result.skipped.length > 0) showToast('Skipped ' + result.skipped.length + ' duplicate' + (result.skipped.length > 1 ? 's' : ''), 'info');
    e.target.value = '';
  };
  reader.readAsText(file);
}

/* ---- Render subscribers ---- */
function renderPreview(s) {
  $previewContainer.innerHTML = renderMii(s);
  $previewName.textContent = s.name || 'Unnamed';
}

function updateControlHighlights(s) {
  $skinSwatches.querySelectorAll('.swatch-btn').forEach(function (btn) {
    const isActive = btn.dataset.tone === s.appearance.skinTone;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });

  $bodyShapeRow.querySelectorAll('.shape-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.shape === s.appearance.bodyShape);
  });

  $accessoryRow.querySelectorAll('.accessory-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.accessory === s.appearance.accessory);
  });

  $secondaryColorRow.hidden = !TWO_COLOR_STYLES.includes(s.appearance.outfit.style);
}

/* ---- Gallery ---- */
function refreshGallery() {
  const miis = listAllMiis();
  const currentId = getState().id;

  $galleryGrid.querySelectorAll('.gallery-card').forEach(function (c) { c.remove(); });

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
    del.setAttribute('aria-label', 'Delete ' + mii.name);

    del.addEventListener('click', function (e) {
      e.stopPropagation();
      deleteMiiFromStorage(mii.id);
      showToast(mii.name + ' deleted', 'info');
      refreshGallery();
    });

    card.addEventListener('click', function () {
      const loaded = loadMiiFromStorage(mii.id);
      if (loaded) {
        loadIntoEditor(loaded);
        refreshGallery();
        showToast('Loaded ' + loaded.name, 'info');
      }
    });

    card.appendChild(preview);
    card.appendChild(nameEl);
    card.appendChild(del);
    $galleryGrid.appendChild(card);
  }
}

/* ---- Sync controls to state ---- */
function syncControlsToState() {
  $name.value = state.name;
  $sliderIE.value = state.personality.introvertExtrovert;
  $sliderCI.value = state.personality.calmIntense;
  $sliderSS.value = state.personality.seriousSilly;
  $notes.value = state.meta.notes;
  $outfitStyle.value = state.appearance.outfit.style;
  $primaryColor.value = state.appearance.outfit.primaryColor;
  if (state.appearance.outfit.secondaryColor) {
    $secondaryColor.value = state.appearance.outfit.secondaryColor;
  }
  $faceVibe.value = state.face.vibe;

  if (state.face.imageDataUrl) {
    $facePreviewImg.src = state.face.imageDataUrl;
    $facePreviewArea.hidden = false;
  } else {
    $facePreviewArea.hidden = true;
  }
}

/* ---- Init ---- */
async function init() {
  buildSkinSwatches();
  wireControls();

  subscribe(renderPreview);
  subscribe(updateControlHighlights);

  proxyAvailable = await checkProxyAvailable();
  if (!proxyAvailable) {
    $proxyWarning.hidden = false;
  }

  const saved = listAllMiis();
  if (saved.length > 0) {
    loadIntoEditor(saved[0]);
  } else {
    loadIntoEditor(JSON.parse(JSON.stringify(EXAMPLE_MII)));
  }

  refreshGallery();
}

init();

})();
