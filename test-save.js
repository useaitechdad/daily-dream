const fs = require('fs');

global.localStorage = {
  _data: {},
  setItem(k, v) { this._data[k] = v; },
  getItem(k) { return this._data[k] || null; },
  removeItem(k) { delete this._data[k]; },
  get length() { return Object.keys(this._data).length; },
  key(i) { return Object.keys(this._data)[i]; }
};

let appCode = fs.readFileSync('apps/mii-designer/app.js', 'utf8');

// just export the functions!
appCode = appCode + '\nmodule.exports = { saveMii, EXAMPLE_MII, getState, handleSave };';
fs.writeFileSync('test-app.js', appCode);

// now run it!
try {
  const { saveMii, EXAMPLE_MII } = require('./test-app.js');
  console.log(saveMii(EXAMPLE_MII));
} catch(e) { console.error(e); }
