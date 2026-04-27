/**
 * Mii Designer — main orchestrator (canonical ES module source).
 * Owns the central state, wires controls to renderers, handles all user interactions.
 *
 * NOTE: app.js is a generated IIFE bundle built from this file + lib/*.js + shared/schema/miiSchema.js.
 * Edit THIS file. Do not edit app.js directly.
 *
 * @module main
 */

import {
  SKIN_TONES, TWO_COLOR_STYLES,
  HAIR_STYLES, EYE_SHAPES, MOUTH_SHAPES, FACE_SHAPES,
  NOSE_STYLES, EYEBROW_STYLES, EXPRESSION_EFFECTS,
  DEFAULT_FACE, createBlankMii, sanitizeName, generateUUID,
} from '../../shared/schema/miiSchema.js';
import { EXAMPLE_MII } from '../../shared/schema/exampleMii.js';
import { SKIN_TONE_COLORS } from './lib/palette.js';
import { renderMii, renderMiiThumbnail, renderFaceThumb } from './lib/miiRenderer.js';
import { saveMii, loadMii, listMiis, deleteMii, exportAll, exportOne, importMiis, downloadJson } from './lib/storage.js';
import { showToast } from './lib/toast.js';
import { initDialogue, stopDialogue } from './lib/miiAnimator.js';

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
    showToast('No Miis to export yet!', 'info');
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
