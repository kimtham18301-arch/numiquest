'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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

function loadAppContext() {
  const storage = new Map();
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
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
    encodeURIComponent,
    decodeURIComponent,
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
    fetch: async () => ({ ok: false, json: async () => ({}) }),
    addEventListener() {},
    scrollTo() {},
    confirm() { return true; }
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  sandbox.self = sandbox;

  const ctx = vm.createContext(sandbox);
  const rootDir = path.resolve(__dirname, '..');
  const scripts = [
    'app.js',
    'discovery.js',
    'challenge.js',
    'farm.js',
    'milktea.js',
    'cloud-config.js',
    'cloud.js',
    'admin.js',
    'ui.js',
    'advanced.js',
    'refresh.js',
    'analytics.js',
    'review-exit.js',
    'adaptive-sprint.js',
    'classroom.js',
    'pedagogy.js',
    'engagement.js'
  ];
  for (const file of scripts) {
    const code = fs.readFileSync(path.join(rootDir, file), 'utf8');
    vm.runInContext(code, ctx, { filename: file });
  }
  return ctx;
}

test('natural mode (normal, convenient, expression) never generates negative answers or options', () => {
  const ctx = loadAppContext();
  for (const style of ['normal', 'convenient', 'expression']) {
    for (let i = 0; i < 150; i++) {
      const q = ctx.generate({
        type: 'natural',
        types: ['natural'],
        ops: ['+', '-', '*', '/'],
        digits: [1, 2],
        questionStyle: style,
        termCount: 3
      });
      assert.ok(q && q.q && q.answer !== undefined, `Missing question fields for style=${style}`);
      const ansNum = Number(String(q.answer).replace(',', '.'));
      assert.ok(Number.isFinite(ansNum) && ansNum >= 0, `Negative or invalid answer ${q.answer} for "${q.q}" (${style})`);
      assert.ok(Array.isArray(q.options) && q.options.length >= 2, 'Options should be non-empty array');
      for (const opt of q.options) {
        assert.ok(!String(opt).startsWith('-'), `Negative distractor "${opt}" in natural mode (${style}) for "${q.q}"`);
      }
      assert.ok(q.options.some(opt => ctx.isAnswerMatch(opt, q.answer)), `Answer ${q.answer} not found in options ${JSON.stringify(q.options)}`);
    }
  }
});

test('fraction, decimal, negative, and remainder generators produce valid options', () => {
  const ctx = loadAppContext();
  for (const type of ['fraction', 'decimal', 'negative', 'remainder']) {
    for (let i = 0; i < 40; i++) {
      const q = ctx.generate({
        type,
        types: [type],
        ops: type === 'remainder' ? ['/'] : ['+', '-', '*', '/'],
        digits: [1, 2],
        questionStyle: 'normal'
      });
      assert.ok(q && q.q && q.answer, `Missing question for type=${type}`);
      assert.equal(q.options.length, 4, `Expected 4 options for type=${type}`);
      assert.ok(q.options.some(opt => ctx.isAnswerMatch(opt, q.answer)), `Options missing answer for type=${type}: ${q.answer}`);
    }
  }
});

test('isAnswerMatch handles decimals with comma/dot and fractions', () => {
  const ctx = loadAppContext();
  assert.equal(ctx.isAnswerMatch('3,5', '3.5'), true);
  assert.equal(ctx.isAnswerMatch('0.25', '0,25'), true);
  assert.equal(ctx.isAnswerMatch('3/4', '3/4'), true);
  assert.equal(ctx.isAnswerMatch('3/4', '4/3'), false);
});

test('validBackup accepts valid backup and rejects malformed payloads', () => {
  const ctx = loadAppContext();
  assert.equal(ctx.validBackup({ version: 1, name: 'Minh Khôi', history: [], mistakes: [], xp: 100, best: 50 }), true);
  assert.equal(ctx.validBackup(null), false);
  assert.equal(ctx.validBackup({ version: 2, name: 'Test', xp: 0 }), false);
  assert.equal(ctx.validBackup({ version: 1, name: 'Test', history: 'not-an-array', mistakes: [], xp: 0 }), false);
  assert.equal(ctx.validBackup({ version: 1, name: 'Test', history: [], mistakes: [], xp: -5 }), false);
});

test('numiAnimalEl converts SVG markup string into a real Element without throwing', () => {
  const ctx = loadAppContext();
  const el = ctx.numiAnimalEl('bunny', 'test-cls');
  assert.ok(el, 'Expected Element from numiAnimalEl');
  el.setAttribute('class', 'animal test-cls');
  assert.equal(el.getAttribute('class'), 'animal test-cls');
});

test('computeAdaptiveConfig scales difficulty up on streak and down on repeated mistakes', () => {
  const ctx = loadAppContext();
  const up = ctx.computeAdaptiveConfig({ type: 'natural', digits: [1], adaptive: true }, 4, {});
  assert.equal(up.levelDelta, 1);
  assert.deepEqual(Array.from(up.cfg.digits), [1, 2]);

  const down = ctx.computeAdaptiveConfig({ type: 'natural', digits: [2], adaptive: true }, -2, {});
  assert.equal(down.levelDelta, -1);
  assert.deepEqual(Array.from(down.cfg.digits), [1]);

  const disabled = ctx.computeAdaptiveConfig({ type: 'natural', digits: [1], adaptive: false }, 5, {});
  assert.equal(disabled.levelDelta, 0);
});

test('daily quests track today progress and prevent duplicate claims', () => {
  const ctx = loadAppContext();
  const todayIso = new Date().toISOString();
  ctx.state.history.push({ date: todayIso, mode: 'sprint60', correct: 9, total: 10, time: 6.0 });
  const quests = ctx.getDailyQuests();
  assert.equal(quests.length, 3);
  assert.equal(quests.every(q => q.done), true);

  const xpBefore = ctx.state.xp;
  ctx.claimDailyQuest('q_warm');
  assert.equal(ctx.state.xp, xpBefore + 20);
  // Duplicate claim should not grant XP again
  ctx.claimDailyQuest('q_warm');
  assert.equal(ctx.state.xp, xpBefore + 20);
});

test('classroom workflow supports creating rooms, joining by code, assigning, and submitting', async () => {
  const ctx = loadAppContext();
  const room = await ctx.createClassroom('Lớp 4A', 4);
  assert.ok(room && room.id && room.join_code.length === 6);

  await assert.rejects(() => ctx.joinClassroomByCode('XXXXXX'));
  const joinedId = await ctx.joinClassroomByCode(room.join_code);
  assert.equal(joinedId, room.id);

  const asg = await ctx.createAssignment(room.id, 'Tuần 12 - Phép nhân', '2026-12-01', { type: 'natural', count: 10 });
  assert.ok(asg && asg.id);

  await ctx.submitAssignmentResult(asg.id, 9, 10, 4.5);
  const studentView = await ctx.fetchStudentAssignments();
  assert.equal(studentView.classrooms.length, 1);
  assert.equal(studentView.assignments.length, 1);
  assert.equal(studentView.submissions.length, 1);
  assert.equal(studentView.submissions[0].correct, 9);
});

test('pedagogy generators (missing, word), visual math SVG, and spaced repetition work', () => {
  const ctx = loadAppContext();
  for (const style of ['missing', 'word']) {
    for (let i = 0; i < 30; i++) {
      const q = ctx.generate({ type: 'natural', ops: ['+', '-', '*', '/'], digits: [1, 2], questionStyle: style });
      assert.ok(q && q.q && q.answer, `Missing fields for ${style}`);
      assert.equal(q.options.length, 4);
      assert.ok(q.options.some(o => ctx.isAnswerMatch(o, q.answer)));
      assert.ok(Number(q.answer) >= 0);
    }
  }
  const nl = ctx.buildVisualMathSvg({ q: '-5 + 8' });
  assert.ok(nl.includes('<svg') && nl.includes('visual-math-svg'));
  const fb = ctx.buildVisualMathSvg({ q: '3/4 + 1/2' });
  assert.ok(fb.includes('<svg') && fb.includes('rect'));

  const now = Date.now();
  const sorted = ctx.prioritizeMistakesByDue([
    { id: 'future', nextReviewAt: now + 86400000 },
    { id: 'due', nextReviewAt: now - 1000 }
  ]);
  assert.equal(sorted[0].id, 'due');
});

test('engagement accessories, seeded friend challenge, and speech formatting work', () => {
  const ctx = loadAppContext();
  ctx.state.xp = 100;
  assert.equal(ctx.buyOrEquipAccessory('glasses'), true);
  assert.equal(ctx.state.xp, 50);
  assert.equal(ctx.state.accessories.equipped, 'glasses');
  assert.ok(ctx.animal('bunny').includes('buddy-acc'));

  const code = ctx.encodeChallengeCode(12345, 4);
  const parsed = ctx.decodeChallengeCode(code);
  assert.equal(parsed.grade, 4);
  const q1 = ctx.generateSeededQuestions(parsed.seed, { type: 'natural', ops: ['+'], digits: [1] }, 5);
  const q2 = ctx.generateSeededQuestions(parsed.seed, { type: 'natural', ops: ['+'], digits: [1] }, 5);
  assert.deepEqual(q1.map(x => x.q), q2.map(x => x.q));

  assert.equal(ctx.formatMathForSpeech('3 + 4 = ?', 'vi'), '3 cộng 4 bằng mấy');
});
