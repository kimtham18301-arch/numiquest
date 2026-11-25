'use strict';
// Loads the app scripts, in the order index.html lists them, into one vm context with a mock DOM.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..', '..');

// Script files in page order, read from index.html so tests follow any split/rename automatically.
function pageScripts() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)].map(m => m[1]);
}

function createMockElement(tag = 'div') {
  const el = {
    tagName: String(tag).toUpperCase(),
    className: '',
    id: '',
    innerHTML: '',
    textContent: '',
    style: {},
    dataset: {},
    children: [],
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() { return false; }
    },
    setAttribute(k, v) { this[k] = String(v); },
    getAttribute(k) { return this[k] ?? null; },
    removeAttribute(k) { delete this[k]; },
    append() {},
    prepend() {},
    replaceWith() {},
    insertAdjacentElement() {},
    insertAdjacentHTML() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    before() {},
    remove() {},
    focus() {},
    close() {},
    showModal() {},
    content: { firstElementChild: null }
  };
  return el;
}

// options.fetch  : fake fetch for cloud tests (default: every request fails, no network)
// options.exclude: page scripts to skip (cloud-classes.js schedules background sync, so it is off by default)
// options.timers : false replaces setTimeout with a no-op so debounced cloud saves only run when a test calls them
function loadAppContext(options = {}) {
  const { fetch: fakeFetch, exclude = ['cloud-classes.js'], timers = true, storage: initialStorage } = options;
  const storage = new Map(initialStorage ? Object.entries(initialStorage) : []);
  const rootEl = createMockElement('main');
  rootEl.id = 'app';

  const makeTemplate = () => {
    const tpl = createMockElement('template');
    Object.defineProperty(tpl, 'innerHTML', {
      set(val) {
        const child = createMockElement('svg');
        child._raw = String(val);
        tpl.content = { firstElementChild: child };
      },
      get() { return ''; }
    });
    return tpl;
  };

  const documentMock = {
    title: '',
    documentElement: { lang: 'vi' },
    head: { append() {} },
    body: { dataset: {}, append() {}, classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } } },
    fonts: { ready: Promise.resolve() },
    createElement(tag) {
      return tag === 'template' ? makeTemplate() : createMockElement(tag);
    },
    createTreeWalker() {
      return { nextNode() { return null; } };
    },
    querySelector(sel) {
      if (sel === '#app') return rootEl;
      if (sel === '#config' && !String(rootEl.innerHTML || '').includes('id="config"')) return null;
      if (!this._els) this._els = new Map();
      if (!this._els.has(sel)) this._els.set(sel, createMockElement('div'));
      return this._els.get(sel);
    },
    querySelectorAll() { return []; },
    addEventListener() {}
  };

  const sandbox = {
    console,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    Date,
    Set,
    Map,
    RegExp,
    Error,
    Promise,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    setTimeout: timers ? setTimeout : () => 0,
    clearTimeout,
    setInterval,
    clearInterval,
    performance: { now: () => Date.now() },
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
    URL,
    URLSearchParams,
    encodeURIComponent,
    decodeURIComponent,
    btoa,
    atob,
    crypto: globalThis.crypto,
    TextEncoder,
    TextDecoder,
    localStorage: {
      getItem(k) { return storage.has(k) ? storage.get(k) : null; },
      setItem(k, v) { storage.set(k, String(v)); },
      removeItem(k) { storage.delete(k); }
    },
    document: documentMock,
    navigator: {},
    location: { href: 'http://localhost/', pathname: '/', search: '', hash: '' },
    history: { replaceState() {} },
    MutationObserver: class { observe() {} disconnect() {} },
    NodeFilter: { SHOW_TEXT: 4 },
    fetch: fakeFetch || (async () => ({ ok: false, status: 503, text: async () => '', json: async () => ({}) })),
    addEventListener() {},
    scrollTo() {},
    confirm() { return true; }
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  sandbox.self = sandbox;

  const ctx = vm.createContext(sandbox);
  const scripts = pageScripts().filter(f => !exclude.includes(f));
  for (const file of scripts) {
    const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
    vm.runInContext(code, ctx, { filename: file });
  }
  // Top-level let/const (cloudSession, cloudStatus...) are not properties of the context: read them with run().
  ctx.run = code => vm.runInContext(code, ctx);
  return ctx;
}

module.exports = { loadAppContext, createMockElement, pageScripts, ROOT };
