/**
 * Pure prompt builder for Mii face generation.
 * No side effects, no API calls, no caching — just string assembly.
 *
 * @module faceGenerator
 */

import { SKIN_TONE_DESCRIPTORS, SKIN_TONE_COLORS, getPersonalityDescriptor } from './palette.js';

/**
 * Build the face generation prompt from current Mii state.
 * Uses the exact template from the schema skill file.
 *
 * @param {object} mii - Current Mii state object
 * @returns {string} The complete prompt string
 */
export function buildFacePrompt(mii) {
  const name = mii.name || 'Character';

  const personalityParts = [
    getPersonalityDescriptor('introvertExtrovert', mii.personality.introvertExtrovert),
    getPersonalityDescriptor('calmIntense', mii.personality.calmIntense),
    getPersonalityDescriptor('seriousSilly', mii.personality.seriousSilly),
  ];
  const personalityDescriptors = personalityParts.join(', ');

  const skinToneDescriptor = SKIN_TONE_DESCRIPTORS[mii.appearance.skinTone] || 'light skin';
  const skinHex = SKIN_TONE_COLORS[mii.appearance.skinTone] || SKIN_TONE_COLORS.light;

  const vibeLine = mii.face.vibe
    ? `Extra vibe: ${mii.face.vibe}.`
    : '';

  const lines = [
    'Chibi anime face portrait. FACE ONLY — tightly cropped to just the face and hair. Front-facing, flat illustration style, clean lines.',
    '',
    `Character: ${name}, ${personalityDescriptors}. Skin tone: ${skinToneDescriptor}.`,
    vibeLine,
    '',
    `Background: solid flat color ${skinHex} (the exact skin tone color). The background MUST be this single solid color, NOT a pastel, NOT a gradient, NOT a scene.`,
    '',
    'CRITICAL: Show ONLY the face and hair. NO neck, NO shoulders, NO upper body, NO clothing, NO torso. Frame the image as a tight headshot — face fills 90% of the image. Cute chibi proportions, large expressive eyes, simple clean line art, NO text, NO watermark.',
  ];

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
