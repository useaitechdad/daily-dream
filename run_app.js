const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('apps/mii-designer/index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

dom.window.localStorage = {
  _data: {},
  setItem(k, v) { this._data[k] = String(v); },
  getItem(k) { return this._data.hasOwnProperty(k) ? this._data[k] : null; },
  removeItem(k) { delete this._data[k]; },
  get length() { return Object.keys(this._data).length; },
  key(i) { return Object.keys(this._data)[i]; }
};
dom.window.crypto = { randomUUID: () => "mock-uuid" };
dom.window.URL = { revokeObjectURL: () => {}, createObjectURL: () => {} };
dom.window.Blob = class Blob {};
dom.window.requestAnimationFrame = (cb) => cb();

const scriptContent = fs.readFileSync('apps/mii-designer/app.js', 'utf8');
const scriptEl = dom.window.document.createElement("script");
scriptEl.textContent = scriptContent;
dom.window.document.body.appendChild(scriptEl);

try {
  console.log("clicking save...");
  const btn = dom.window.document.getElementById('btn-save');
  btn.click();
  console.log("localStorage keys:", Object.keys(dom.window.localStorage._data));
  const tc = dom.window.document.getElementById('toast-container');
  if (tc) console.log("Toast:", tc.textContent);
} catch(e) {
  console.error(e);
}
