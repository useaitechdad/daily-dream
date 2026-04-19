/**
 * Mii Designer — main orchestrator.
 * Owns the central state, wires controls to renderers, handles all user interactions.
 *
 * @module main
 */

import { SKIN_TONES, BODY_SHAPES, OUTFIT_STYLES, ACCESSORIES, TWO_COLOR_STYLES, createBlankMii, sanitizeName } from '../../shared/schema/miiSchema.js';
import { EXAMPLE_MII } from '../../shared/schema/exampleMii.js';
import { SKIN_TONE_COLORS } from './lib/palette.js';
import { renderMii, renderMiiThumbnail } from './lib/miiRenderer.js';
import { buildFacePrompt } from './lib/faceGenerator.js';
import { checkProxyAvailable, generateFaceImage } from './lib/apiClient.js';
import { saveMii, loadMii, listMiis, deleteMii, exportAll, exportOne, importMiis, downloadJson } from './lib/storage.js';
import { showToast } from './lib/toast.js';

/* ================================================================
   State Management
   ================================================================ */

/** @type {object} The current Mii being edited */
let state = structuredClone(EXAMPLE_MII);

/** @type {boolean} Whether the dev proxy is available (checked once on startup) */
let proxyAvailable = false;

/** @type {Function[]} Subscriber callbacks */
const subscribers = [];

function getState() {
  return state;
}

function setState(patch) {
  if (typeof patch === 'function') {
    state = { ...state, ...patch(state) };
  } else {
    state = { ...state, ...patch };
  }
  // Deep-merge nested objects
  if (patch.personality) {
    state.personality = { ...state.personality, ...patch.personality };
  }
  if (patch.appearance) {
    state.appearance = { ...state.appearance, ...patch.appearance };
    if (patch.appearance.outfit) {
      state.appearance.outfit = { ...state.appearance.outfit, ...patch.appearance.outfit };
    }
  }
  if (patch.face) {
    state.face = { ...state.face, ...patch.face };
  }
  if (patch.meta) {
    state.meta = { ...state.meta, ...patch.meta };
  }
  notify();
}

function subscribe(fn) {
  subscribers.push(fn);
}

function notify() {
  for (const fn of subscribers) {
    fn(state);
  }
}

/**
 * Load a full Mii object into the editor state.
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

const $name = document.getElementById('mii-name');
const $sliderIE = document.getElementById('slider-introvert-extrovert');
const $sliderCI = document.getElementById('slider-calm-intense');
const $sliderSS = document.getElementById('slider-serious-silly');
const $notes = document.getElementById('mii-notes');
const $skinSwatches = document.getElementById('skin-tone-swatches');
const $bodyShapeRow = document.getElementById('body-shape-row');
const $outfitStyle = document.getElementById('outfit-style');
const $primaryColor = document.getElementById('outfit-primary-color');
const $secondaryColor = document.getElementById('outfit-secondary-color');
const $secondaryColorRow = document.getElementById('secondary-color-row');
const $accessoryRow = document.getElementById('accessory-row');
const $faceVibe = document.getElementById('face-vibe');
const $btnGenerateFace = document.getElementById('btn-generate-face');
const $btnNewVibe = document.getElementById('btn-new-vibe');
const $facePreviewArea = document.getElementById('face-preview-area');
const $facePreviewImg = document.getElementById('face-preview-img');
const $proxyWarning = document.getElementById('proxy-warning');
const $previewContainer = document.getElementById('mii-preview-container');
const $previewName = document.getElementById('preview-name');
const $btnSave = document.getElementById('btn-save');
const $btnExportOne = document.getElementById('btn-export-one');
const $btnNew = document.getElementById('btn-new');
const $btnExportAll = document.getElementById('btn-export-all');
const $btnImport = document.getElementById('btn-import');
const $galleryGrid = document.getElementById('gallery-grid');
const $galleryEmpty = document.getElementById('gallery-empty');

/* ================================================================
   Populate dynamic controls
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

/* ================================================================
   Control → State binding
   ================================================================ */

function wireControls() {
  // Name
  $name.addEventListener('input', () => {
    setState({ name: $name.value });
  });

  // Personality sliders
  $sliderIE.addEventListener('input', () => {
    setState({ personality: { introvertExtrovert: parseInt($sliderIE.value, 10) } });
  });
  $sliderCI.addEventListener('input', () => {
    setState({ personality: { calmIntense: parseInt($sliderCI.value, 10) } });
  });
  $sliderSS.addEventListener('input', () => {
    setState({ personality: { seriousSilly: parseInt($sliderSS.value, 10) } });
  });

  // Notes
  $notes.addEventListener('input', () => {
    setState({ meta: { notes: $notes.value } });
  });

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
      // Default secondary if switching to a two-color style
      update.appearance.outfit.secondaryColor = '#3A6DB5';
    }
    setState(update);
  });

  // Colors
  $primaryColor.addEventListener('input', () => {
    setState({ appearance: { outfit: { primaryColor: $primaryColor.value.toUpperCase() } } });
  });
  $secondaryColor.addEventListener('input', () => {
    setState({ appearance: { outfit: { secondaryColor: $secondaryColor.value.toUpperCase() } } });
  });

  // Accessory
  $accessoryRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.accessory-btn');
    if (!btn) return;
    setState({ appearance: { accessory: btn.dataset.accessory } });
  });

  // Face vibe
  $faceVibe.addEventListener('input', () => {
    setState({ face: { vibe: $faceVibe.value } });
  });

  // Generate face
  $btnGenerateFace.addEventListener('click', handleGenerateFace);

  // New vibe
  $btnNewVibe.addEventListener('click', () => {
    $faceVibe.value = '';
    setState({ face: { vibe: '' } });
  });

  // Save
  $btnSave.addEventListener('click', handleSave);

  // Export one
  $btnExportOne.addEventListener('click', () => {
    const s = getState();
    if (!s.name.trim()) {
      showToast('Give your Mii a name before exporting!', 'error');
      return;
    }
    const filename = `${sanitizeName(s.name)}.mii.json`;
    downloadJson(filename, exportOne(s));
    showToast(`Exported ${s.name}!`, 'success');
  });

  // New Mii
  $btnNew.addEventListener('click', () => {
    const blank = createBlankMii();
    loadIntoEditor(blank);
    showToast('New Mii created — make it yours!', 'info');
  });

  // Export all
  $btnExportAll.addEventListener('click', () => {
    const all = listMiis();
    if (all.length === 0) {
      showToast('No Miis to export yet!', 'info');
      return;
    }
    downloadJson('miis.json', exportAll());
    showToast(`Exported ${all.length} Mii${all.length > 1 ? 's' : ''}!`, 'success');
  });

  // Import
  $btnImport.addEventListener('change', handleImport);
}

/* ================================================================
   Handlers
   ================================================================ */

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

  // Show loading
  $btnGenerateFace.disabled = true;
  const $label = $btnGenerateFace.querySelector('.btn-label');
  const $spinner = $btnGenerateFace.querySelector('.btn-spinner');
  $label.textContent = 'Generating…';
  $spinner.hidden = false;

  const prompt = buildFacePrompt(s);

  try {
    const result = await generateFaceImage(prompt);

    if (result.error) {
      showToast(result.error, 'error');
      return;
    }

    setState({
      face: {
        imageDataUrl: result.imageDataUrl,
        generatedAt: result.generatedAt,
        prompt: prompt,
        modelId: 'gemini-3.1-flash-image-preview',
      },
    });

    if (result.fromCache) {
      showToast('Face loaded from cache ✨', 'info');
    } else {
      showToast('Face generated! Looking good ✨', 'success');
    }

    // Show face preview
    $facePreviewImg.src = result.imageDataUrl;
    $facePreviewArea.hidden = false;
  } catch (err) {
    showToast(`Something went wrong: ${err.message}`, 'error');
  } finally {
    $label.textContent = '✨ Generate Face';
    $spinner.hidden = true;
    $btnGenerateFace.disabled = false;
  }
}

function handleSave() {
  const s = getState();
  if (!s.name.trim()) {
    showToast('Your Mii needs a name!', 'error');
    $name.focus();
    return;
  }

  // Sanitize name before save
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

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const result = importMiis(reader.result);

    if (result.errors.length > 0) {
      showToast(`Import issues: ${result.errors.join('; ')}`, 'error');
    }
    if (result.imported.length > 0) {
      showToast(`Imported ${result.imported.length} Mii${result.imported.length > 1 ? 's' : ''}!`, 'success');
      refreshGallery();
    }
    if (result.skipped.length > 0) {
      showToast(`Skipped ${result.skipped.length} duplicate${result.skipped.length > 1 ? 's' : ''}`, 'info');
    }
    if (result.imported.length === 0 && result.errors.length === 0 && result.skipped.length > 0) {
      showToast('All Miis already exist — nothing new to import', 'info');
    }

    // Reset file input so the same file can be re-imported
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
  // Skin tone swatches
  for (const btn of $skinSwatches.querySelectorAll('.swatch-btn')) {
    const isActive = btn.dataset.tone === s.appearance.skinTone;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
  }

  // Body shape
  for (const btn of $bodyShapeRow.querySelectorAll('.shape-btn')) {
    btn.classList.toggle('active', btn.dataset.shape === s.appearance.bodyShape);
  }

  // Accessory
  for (const btn of $accessoryRow.querySelectorAll('.accessory-btn')) {
    btn.classList.toggle('active', btn.dataset.accessory === s.appearance.accessory);
  }

  // Secondary color visibility
  const needsSecondary = TWO_COLOR_STYLES.includes(s.appearance.outfit.style);
  $secondaryColorRow.hidden = !needsSecondary;
}

/* ================================================================
   Gallery
   ================================================================ */

function refreshGallery() {
  const miis = listMiis();
  const currentId = getState().id;

  if (miis.length === 0) {
    $galleryEmpty.hidden = false;
    // Clear any existing cards
    const cards = $galleryGrid.querySelectorAll('.gallery-card');
    cards.forEach(c => c.remove());
    return;
  }

  $galleryEmpty.hidden = true;

  // Rebuild gallery
  const existingCards = $galleryGrid.querySelectorAll('.gallery-card');
  existingCards.forEach(c => c.remove());

  for (const mii of miis) {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    if (mii.id === currentId) card.classList.add('active');
    card.dataset.id = mii.id;

    const preview = document.createElement('div');
    preview.className = 'gallery-card-preview';
    preview.innerHTML = renderMiiThumbnail(mii);

    const name = document.createElement('div');
    name.className = 'gallery-card-name';
    name.textContent = mii.name;

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
    card.appendChild(name);
    card.appendChild(del);
    $galleryGrid.appendChild(card);
  }
}

/* ================================================================
   Sync controls to state (used when loading a Mii)
   ================================================================ */

function syncControlsToState() {
  const s = state;
  $name.value = s.name;
  $sliderIE.value = s.personality.introvertExtrovert;
  $sliderCI.value = s.personality.calmIntense;
  $sliderSS.value = s.personality.seriousSilly;
  $notes.value = s.meta.notes;
  $outfitStyle.value = s.appearance.outfit.style;
  $primaryColor.value = s.appearance.outfit.primaryColor;
  if (s.appearance.outfit.secondaryColor) {
    $secondaryColor.value = s.appearance.outfit.secondaryColor;
  }
  $faceVibe.value = s.face.vibe;

  // Face preview
  if (s.face.imageDataUrl) {
    $facePreviewImg.src = s.face.imageDataUrl;
    $facePreviewArea.hidden = false;
  } else {
    $facePreviewArea.hidden = true;
  }
}

/* ================================================================
   Initialization
   ================================================================ */

async function init() {
  buildSkinSwatches();
  wireControls();

  // Subscribe renderers
  subscribe(renderPreview);
  subscribe(updateControlHighlights);

  // Check proxy once on startup
  proxyAvailable = await checkProxyAvailable();
  if (!proxyAvailable) {
    $proxyWarning.hidden = false;
  }

  // Load initial state: if any Miis saved, load the most recent; otherwise use Example
  const saved = listMiis();
  if (saved.length > 0) {
    loadIntoEditor(saved[0]);
  } else {
    // Load the Example Mii
    loadIntoEditor(structuredClone(EXAMPLE_MII));
  }

  refreshGallery();
}

init();
