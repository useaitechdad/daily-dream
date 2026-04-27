/**
 * localStorage CRUD, import, and export for Mii records.
 *
 * @module storage
 */

import { validateMii, sanitizeName, TWO_COLOR_STYLES, migrateV1ToV2, migrateV2ToV3, SCHEMA_VERSION } from '../../../shared/schema/miiSchema.js';

/**
 * Run all necessary migrations on a Mii record to bring it to the current schema version.
 * @param {object} mii
 * @returns {object}
 */
function autoMigrate(mii) {
  if (mii.schemaVersion === 1) mii = migrateV1ToV2(mii);
  if (mii.schemaVersion === 2) mii = migrateV2ToV3(mii);
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
export function saveMii(mii) {
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
export function loadMii(id) {
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
export function listMiis() {
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
export function deleteMii(id) {
  localStorage.removeItem(`${MII_PREFIX}${id}`);
}

/**
 * Export all Miis as a JSON string (array).
 * @returns {string}
 */
export function exportAll() {
  return JSON.stringify(listMiis(), null, 2);
}

/**
 * Export a single Mii as a JSON string.
 * @param {object} mii
 * @returns {string}
 */
export function exportOne(mii) {
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
export function importMiis(jsonString) {
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
export function downloadJson(filename, jsonString) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
