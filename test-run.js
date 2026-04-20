const fs = require('fs');

const miiSchemaRaw = fs.readFileSync('shared/schema/miiSchema.js', 'utf8')
  .replace(/export /g, '');
const exampleMiiRaw = fs.readFileSync('shared/schema/exampleMii.js', 'utf8')
  .replace(/export const/, 'const');
const storageRaw = fs.readFileSync('apps/mii-designer/lib/storage.js', 'utf8')
  .replace(/import.*?;/s, '')
  .replace(/export function/g, 'function');

global.localStorage = {
  _data: {},
  setItem(k, v) { this._data[k] = String(v); },
  getItem(k) { return this._data.hasOwnProperty(k) ? this._data[k] : null; },
  removeItem(k) { delete this._data[k]; },
  get length() { return Object.keys(this._data).length; },
  key(i) { return Object.keys(this._data)[i]; }
};

const fullCode = miiSchemaRaw + '\n' + exampleMiiRaw + '\n' + storageRaw + '\n' + `
let state = structuredClone(EXAMPLE_MII);
const res = saveMii(state);
console.log("Save output:", res);
`

eval(fullCode);
