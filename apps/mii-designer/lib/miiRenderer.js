/**
 * SVG rendering engine for Mii characters.
 * Composes four layers: body → head → face → accessory.
 * Returns a complete SVG string from Mii state.
 *
 * @module miiRenderer
 */

import { SKIN_TONE_COLORS, BODY_WIDTHS } from './palette.js';

const SPRITE_W = 240;
const SPRITE_H = 320;

// Head geometry
const HEAD_CX = 120;
const HEAD_CY = 110;
const HEAD_RX = 72;
const HEAD_RY = 82;

// Face clip inset (smaller than head so face doesn't touch edges)
const FACE_INSET = 10;

// Body starts below the head
const BODY_TOP = 185;
const BODY_BOTTOM = 310;
const BODY_CX = 120;

// Arm geometry
const ARM_WIDTH = 14;
const ARM_LENGTH = 60;

/* ------------------------------------------------------------------ */
/*  Outfit style renderers                                            */
/*  Each returns an SVG fragment (string) for the torso area.         */
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
    <!-- Hood shape behind the head -->
    <ellipse cx="${HEAD_CX}" cy="${BODY_TOP - 2}" rx="${halfW - 4}" ry="18" fill="${hoodColor}" />
    <!-- Pocket -->
    <rect x="${BODY_CX - halfW + 8}" y="${BODY_TOP + 60}" width="${halfW * 2 - 16}" height="22" rx="6" fill="${darken(primary, 15)}" opacity="0.4" />
    <!-- Drawstrings -->
    <line x1="${BODY_CX - 6}" y1="${BODY_TOP + 4}" x2="${BODY_CX - 6}" y2="${BODY_TOP + 28}" stroke="${hoodColor}" stroke-width="2" stroke-linecap="round" />
    <line x1="${BODY_CX + 6}" y1="${BODY_TOP + 4}" x2="${BODY_CX + 6}" y2="${BODY_TOP + 28}" stroke="${hoodColor}" stroke-width="2" stroke-linecap="round" />
  `;
}

function outfitDress(halfW, primary) {
  const flareW = halfW + 16;
  return `
    <path d="M${BODY_CX - halfW} ${BODY_TOP}
             L${BODY_CX - flareW} ${BODY_BOTTOM}
             Q${BODY_CX} ${BODY_BOTTOM + 6} ${BODY_CX + flareW} ${BODY_BOTTOM}
             L${BODY_CX + halfW} ${BODY_TOP} Z"
          fill="${primary}" />
    <!-- Neckline -->
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
    <!-- Inner shirt V visible at the neck -->
    <path d="M${BODY_CX - 12} ${BODY_TOP} L${BODY_CX} ${BODY_TOP + 40} L${BODY_CX + 12} ${BODY_TOP}"
          fill="${innerColor}" />
    <!-- Lapel lines -->
    <line x1="${BODY_CX}" y1="${BODY_TOP}" x2="${BODY_CX}" y2="${BODY_BOTTOM - 10}"
          stroke="${darken(primary, 20)}" stroke-width="1.5" opacity="0.5" />
  `;
}

function outfitOveralls(halfW, primary, secondary) {
  const shirtColor = secondary || '#FFFFFF';
  return `
    <!-- Shirt underneath -->
    <rect x="${BODY_CX - halfW}" y="${BODY_TOP}" width="${halfW * 2}" height="${BODY_BOTTOM - BODY_TOP}" rx="12" fill="${shirtColor}" />
    <!-- Overalls body -->
    <rect x="${BODY_CX - halfW + 4}" y="${BODY_TOP + 30}" width="${halfW * 2 - 8}" height="${BODY_BOTTOM - BODY_TOP - 30}" rx="8" fill="${primary}" />
    <!-- Left strap -->
    <rect x="${BODY_CX - halfW + 8}" y="${BODY_TOP + 4}" width="10" height="30" rx="3" fill="${primary}" />
    <!-- Right strap -->
    <rect x="${BODY_CX + halfW - 18}" y="${BODY_TOP + 4}" width="10" height="30" rx="3" fill="${primary}" />
    <!-- Pocket -->
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
  const r = 16;
  return `
    <g class="accessory-glasses">
      <circle cx="${HEAD_CX - 22}" cy="${y}" r="${r}" fill="none" stroke="#3A3A3A" stroke-width="3" />
      <circle cx="${HEAD_CX + 22}" cy="${y}" r="${r}" fill="none" stroke="#3A3A3A" stroke-width="3" />
      <line x1="${HEAD_CX - 6}" y1="${y}" x2="${HEAD_CX + 6}" y2="${y}" stroke="#3A3A3A" stroke-width="2.5" />
      <line x1="${HEAD_CX - 38}" y1="${y}" x2="${HEAD_CX - HEAD_RX + 8}" y2="${y - 6}" stroke="#3A3A3A" stroke-width="2.5" />
      <line x1="${HEAD_CX + 38}" y1="${y}" x2="${HEAD_CX + HEAD_RX - 8}" y2="${y - 6}" stroke="#3A3A3A" stroke-width="2.5" />
    </g>
  `;
}

function accessoryHat() {
  return `
    <g class="accessory-hat">
      <!-- Brim -->
      <ellipse cx="${HEAD_CX}" cy="${HEAD_CY - HEAD_RY + 12}" rx="${HEAD_RX + 10}" ry="10" fill="#5A4A3A" />
      <!-- Crown -->
      <rect x="${HEAD_CX - 40}" y="${HEAD_CY - HEAD_RY - 32}" width="80" height="44" rx="12" fill="#5A4A3A" />
      <!-- Band -->
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
      <!-- Band -->
      <path d="M${HEAD_CX - HEAD_RX + 4} ${HEAD_CY - 10}
               Q${HEAD_CX} ${HEAD_CY - HEAD_RY - 30}
               ${HEAD_CX + HEAD_RX - 4} ${HEAD_CY - 10}"
            fill="none" stroke="#444" stroke-width="5" stroke-linecap="round" />
      <!-- Left ear cup -->
      <rect x="${HEAD_CX - HEAD_RX - 2}" y="${HEAD_CY - 20}" width="16" height="26" rx="6" fill="#444" />
      <rect x="${HEAD_CX - HEAD_RX}" y="${HEAD_CY - 16}" width="12" height="18" rx="4" fill="#666" />
      <!-- Right ear cup -->
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
/*  Placeholder face (shown when no AI face is generated)             */
/* ------------------------------------------------------------------ */

function placeholderFace() {
  return `
    <g class="placeholder-face">
      <!-- Eyes -->
      <ellipse cx="${HEAD_CX - 20}" cy="${HEAD_CY - 8}" rx="7" ry="9" fill="#3A3A3A" />
      <ellipse cx="${HEAD_CX + 20}" cy="${HEAD_CY - 8}" rx="7" ry="9" fill="#3A3A3A" />
      <!-- Eye glints -->
      <circle cx="${HEAD_CX - 18}" cy="${HEAD_CY - 12}" r="3" fill="#FFF" />
      <circle cx="${HEAD_CX + 22}" cy="${HEAD_CY - 12}" r="3" fill="#FFF" />
      <!-- Mouth -->
      <path d="M${HEAD_CX - 12} ${HEAD_CY + 18} Q${HEAD_CX} ${HEAD_CY + 28} ${HEAD_CX + 12} ${HEAD_CY + 18}"
            stroke="#3A3A3A" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <!-- Blush -->
      <ellipse cx="${HEAD_CX - 32}" cy="${HEAD_CY + 8}" rx="10" ry="6" fill="#F5A0A0" opacity="0.4" />
      <ellipse cx="${HEAD_CX + 32}" cy="${HEAD_CY + 8}" rx="10" ry="6" fill="#F5A0A0" opacity="0.4" />
    </g>
  `;
}

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
/*  Main render function                                              */
/* ------------------------------------------------------------------ */

/**
 * Render a complete Mii as an SVG string.
 * @param {object} mii - Mii state object (follows the canonical schema shape)
 * @returns {string} Complete SVG markup
 */
export function renderMii(mii) {
  const skinColor = SKIN_TONE_COLORS[mii.appearance.skinTone] || SKIN_TONE_COLORS.light;
  const halfW = (BODY_WIDTHS[mii.appearance.bodyShape] || BODY_WIDTHS.regular) / 2;
  const outfitStyle = mii.appearance.outfit.style || 'tshirt';
  const primaryColor = mii.appearance.outfit.primaryColor || '#5B8CDE';
  const secondaryColor = mii.appearance.outfit.secondaryColor;
  const accessory = mii.appearance.accessory || 'none';
  const faceDataUrl = mii.face?.imageDataUrl || null;

  const outfitRenderer = OUTFIT_RENDERERS[outfitStyle] || OUTFIT_RENDERERS.tshirt;
  const accessoryRenderer = ACCESSORY_RENDERERS[accessory] || ACCESSORY_RENDERERS.none;

  // When a generated face exists, it IS the head — no skin-colored ellipse.
  // When no face, show the skin ellipse + placeholder chibi features.
  let headLayer;
  let faceLayer;
  if (faceDataUrl) {
    headLayer = '';
    faceLayer = `
      <defs>
        <clipPath id="${clipId}">
          <ellipse cx="${HEAD_CX}" cy="${HEAD_CY}" rx="${HEAD_RX}" ry="${HEAD_RY}" />
        </clipPath>
      </defs>
      <image href="${faceDataUrl}"
             x="${HEAD_CX - HEAD_RX}" y="${HEAD_CY - HEAD_RY}"
             width="${HEAD_RX * 2}" height="${HEAD_RY * 2}"
             clip-path="url(#${clipId})"
             preserveAspectRatio="xMidYMid slice" />
    `;
  } else {
    headLayer = `<ellipse cx="${HEAD_CX}" cy="${HEAD_CY}" rx="${HEAD_RX}" ry="${HEAD_RY}" fill="${skinColor}" />`;
    faceLayer = placeholderFace();
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SPRITE_W} ${SPRITE_H}" width="${SPRITE_W}" height="${SPRITE_H}" role="img" aria-label="Mii character: ${mii.name || 'Unnamed'}">
    <!-- Body -->
    ${outfitRenderer(halfW, primaryColor, secondaryColor)}
    <!-- Arms -->
    ${renderArms(halfW, skinColor)}
    <!-- Head -->
    ${headLayer}
    <!-- Face -->
    ${faceLayer}
    <!-- Accessory -->
    ${accessoryRenderer()}
  </svg>`;
}

/**
 * Render a small thumbnail SVG (for gallery cards).
 * Same visual, smaller viewport hint.
 * @param {object} mii
 * @returns {string}
 */
export function renderMiiThumbnail(mii) {
  const svg = renderMii(mii);
  // Replace the explicit width/height with smaller values for thumbnail use
  return svg.replace(`width="${SPRITE_W}" height="${SPRITE_H}"`, 'width="120" height="160"');
}

/* ------------------------------------------------------------------ */
/*  Utility                                                           */
/* ------------------------------------------------------------------ */

/**
 * Darken a hex color by a given amount (0-255).
 * @param {string} hex - e.g. '#7F77DD'
 * @param {number} amount
 * @returns {string} Darkened hex color
 */
function darken(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
  const b = Math.max(0, (num & 0xFF) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
