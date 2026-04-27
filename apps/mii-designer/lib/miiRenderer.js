/**
 * SVG rendering engine for Mii characters.
 * Composes layers bottom-to-top: body → arms → head → blush → freckles → beautyMark → scar →
 * nose → eyebrows → eyelashes → eyes → mouth → expression → hair → accessory.
 * Returns a complete SVG string from Mii state. Pure functions only — no side effects.
 *
 * @module miiRenderer
 */

import { SKIN_TONE_COLORS, BODY_WIDTHS } from './palette.js';

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
export function renderMii(mii) {
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
export function renderMiiThumbnail(mii) {
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
export function renderFaceThumb(facePatch, skinColor = '#E8B591') {
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
