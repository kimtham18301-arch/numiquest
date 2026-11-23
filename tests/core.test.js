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
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    performance: { now: () => Date.now() },
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
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
    'pedagogy.js',
    'engagement.js',
    'admin-dashboard.js',
    'scratchpad-kbd.js',
    'teacher-classes.js'
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

test('bubble tea goals earn pearls, claim cups with bonus XP, and render atlas directly', () => {
  const ctx = loadAppContext();
  const tea = ctx.teaState();
  assert.equal(tea.size, 'S');
  assert.equal(tea.pearls, 0);

  for (let i = 0; i < 30; i++) ctx.teaEarnPearl();
  assert.equal(ctx.teaGoal().ready, true);

  const xpBefore = ctx.state.xp;
  ctx.teaClaimCup();
  assert.equal(ctx.teaState().pearls, 0);
  assert.equal(ctx.teaTotalCups(), 1);
  assert.equal(ctx.state.xp, xpBefore + 20);

  ctx.atlas();
  const html = ctx.document.querySelector('#app').innerHTML;
  assert.ok(html.includes('tea-goals'));
  assert.equal(html.includes('goalTabMap'), false);
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

test('engagement accessories and speech formatting work', () => {
  const ctx = loadAppContext();
  ctx.state.xp = 100;
  assert.equal(ctx.buyOrEquipAccessory('glasses'), true);
  assert.equal(ctx.state.xp, 50);
  assert.equal(ctx.state.accessories.equipped, 'glasses');
  assert.ok(ctx.animal('bunny').includes('buddy-acc'));

  assert.equal(ctx.formatMathForSpeech('3 + 4 = ?', 'vi'), '3 cộng 4 bằng mấy');
});

test('targeted assignments target specific students, support share links, and track per-student submissions', () => {
  const ctx = loadAppContext();
  const asg = ctx.createTargetedAssignment({
    title: 'Ôn phân số riêng',
    dueDate: '2026-12-10',
    targetStudents: ['hs1', 'hs2'],
    config: { grade: 4, type: 'fraction', ops: ['+'], count: 10, seconds: 20 }
  });
  assert.ok(asg && asg.id);
  assert.deepEqual(Array.from(asg.targetStudents), ['hs1', 'hs2']);

  assert.equal(ctx.getAssignmentsForStudent('hs1').pending.length, 1);
  assert.equal(ctx.getAssignmentsForStudent('hs2').pending.length, 1);
  assert.equal(ctx.getAssignmentsForStudent('hs3').pending.length, 0);

  const sub = ctx.submitTargetedAssignment(asg.id, 9, 10, 4.2, 'hs1');
  assert.equal(sub.correct, 9);

  assert.equal(ctx.getAssignmentsForStudent('hs1').pending.length, 0);
  assert.equal(ctx.getAssignmentsForStudent('hs1').completed.length, 1);
  assert.equal(ctx.getAssignmentsForStudent('hs2').pending.length, 1);

  const link = ctx.buildHomeworkShareLink(asg);
  assert.ok(link.includes('#hw='));
  const parsed = ctx.parseHomeworkShareHash(link.slice(link.indexOf('#')));
  assert.equal(parsed.id, asg.id);
  assert.equal(parsed.t, 'Ôn phân số riêng');
  assert.deepEqual(Array.from(parsed.u), ['hs1', 'hs2']);

  assert.equal(ctx.deleteTargetedAssignment(asg.id), true);
  assert.equal(ctx.getAssignmentsForStudent('hs2').pending.length, 0);
});

test('admin account stays in admin workspace and is excluded from student directory', async () => {
  const ctx = loadAppContext();
  await ctx.localSignIn('admin', 'admin123');
  assert.equal(ctx.isCurrentUserAdmin(), true);
  assert.equal(ctx.view, 'admin');
  const students = ctx.getFilteredStudents();
  assert.equal(students.some(s => s.username === 'admin' || s.role === 'admin'), false);
  // Calling nav('home') or home() as admin redirects back to admin view
  ctx.nav('home');
  assert.equal(ctx.view, 'admin');
  ctx.home();
  assert.equal(ctx.view, 'admin');
  ctx.setup();
  assert.equal(ctx.view, 'admin');
});

test('admin dashboard analytics, student edit, batch promotion, remedial assignment, and full backup work', async () => {
  const ctx = loadAppContext();
  await ctx.localSignIn('admin', 'admin123');
  const students = ctx.getFilteredStudents();
  const analytics = ctx.computeAdminAnalytics(students);
  assert.equal(analytics.days.length, 7);
  assert.ok(analytics.atRiskStudents.length >= 1);

  assert.equal(ctx.updateStudentByAdmin('minhkhoi', { name: 'Minh Khôi A+', grade: 5, bonusXp: 50 }), true);
  assert.equal(ctx.getLocalUsers().minhkhoi.grade, 5);

  const promoted = ctx.batchPromoteGrade(5, 6);
  assert.ok(promoted >= 1);
  assert.equal(ctx.getLocalUsers().minhkhoi.grade, 6);

  const rem = await ctx.assignRemedialForStudent('minhkhoi');
  assert.ok(rem.assignment && rem.assignment.id);
  assert.equal(rem.assignment.config.type, 'fraction');
  assert.deepEqual(Array.from(rem.assignment.targetStudents), ['minhkhoi']);

  const backup = ctx.buildFullSystemBackup();
  assert.equal(backup.format, 'numiquick-system-v1');
  ctx.localStorage.removeItem('numi-targeted-assignments-v1');
  assert.equal(ctx.restoreFullSystemBackup(backup), true);
  const restored = ctx.loadTargetedAssignments();
  assert.ok(restored.some(a => a.id === rem.assignment.id));
});

test('numiAnimalOriginal preserves distinct animal icons regardless of active buddy', () => {
  const ctx = loadAppContext();
  ctx.localStorage.setItem('numi-buddy-profile-v1', JSON.stringify({ name: 'Kiki', avatar: 'fox' }));
  const bunnySvg = ctx.numiAnimalOriginal('bunny');
  const foxSvg = ctx.numiAnimalOriginal('fox');
  const activeBuddySvg = ctx.animal('bunny');
  assert.notEqual(bunnySvg, foxSvg);
  assert.equal(activeBuddySvg.includes(foxSvg.slice(10, 80)), true);
});

test('translate targets nav labels without matching body[data-view] and nav syncs body.dataset.view', async () => {
  const ctx = loadAppContext();
  await ctx.localSignIn('minhkhoi', '1234');
  const fakeBodyChild = { textContent: 'KEEP_ME' };
  const navHomeLabel = { textContent: '' };
  const navPracticeLabel = { textContent: '' };
  const origQS = ctx.document.querySelector.bind(ctx.document);
  ctx.document.querySelector = sel => {
    if (sel === '[data-view="home"] i') return fakeBodyChild;
    if (sel === 'nav [data-view="home"] i') return navHomeLabel;
    if (sel === 'nav [data-view="setup"] i') return navPracticeLabel;
    return origQS(sel);
  };
  ctx.document.body.dataset.view = 'setup';
  ctx.translate();
  assert.equal(fakeBodyChild.textContent, 'KEEP_ME');
  assert.equal(navHomeLabel.textContent, 'Trang chủ');
  assert.equal(navPracticeLabel.textContent, 'Luyện tập');
  ctx.nav('stats');
  assert.equal(ctx.document.body.dataset.view, 'stats');
});

test('student and admin views navigate cleanly without removed feature errors', async () => {
  const ctx = loadAppContext();
  await ctx.localSignIn('minhkhoi', '1234');
  for (const v of ['home', 'setup', 'atlas', 'stats', 'profile', 'guide']) {
    ctx.nav(v);
    assert.equal(ctx.view, v);
  }
  await ctx.localSignIn('admin', 'admin123');
  assert.equal(ctx.view, 'admin');
  ctx.nav('home');
  assert.equal(ctx.view, 'admin');
});

test('setup step numbering, stats review button, footer login status, and profile 4 distinct buddy icons work', async () => {
  const ctx = loadAppContext();
  await ctx.localSignIn('minhkhoi', '1234');

  // 1. Footer status updated after login
  const footerLocal = ctx.document.querySelector('footer .local');
  ctx.cloudBadge();
  assert.ok(footerLocal.textContent.includes('Minh Khôi'), `Expected logged-in footer, got: ${footerLocal.textContent}`);

  // 2. Profile renders 4 distinct animal SVGs even when active buddy is 'fox'
  ctx.renderProfile();
  const profileHtml = ctx.document.querySelector('#app').innerHTML;
  const chipsStart = profileHtml.indexOf('profile-buddy-chips');
  assert.ok(chipsStart > -1);
  const chipsSegment = profileHtml.slice(chipsStart, profileHtml.indexOf('profile-password-card'));
  const chipSvgs = chipsSegment.match(/<svg[\s\S]*?<\/svg>/g) || [];
  assert.equal(chipSvgs.length, 4);
  assert.equal(new Set(chipSvgs).size, 4, 'All 4 buddy choice buttons must render distinct SVGs');

  // 3. Stats renders direct Garden review button when mistakes exist
  ctx.state.mistakes = [{ id: 'm1', q: '3/4 + 1/2', answer: '5/4', options: ['5/4', '4/6', '3/6', '7/4'], config: { seconds: 20, type: 'fraction' } }];
  ctx.stats();
  const statsHtml = ctx.document.querySelector('#app').innerHTML;
  assert.ok(statsHtml.includes('onclick="startReview()"'), 'Stats should expose direct Garden review button when mistakes exist');

  // 4. Setup renumbers all 6 fieldsets cleanly (1..6) without duplicate step 4
  ctx.state.mistakes = [];
  const stepSpans = ['1', '2', '3', '4', '5'].map(n => ({ textContent: n }));
  const formMock = {
    className: '',
    style: {},
    dataset: {},
    elements: {
      questionStyle: { value: 'normal', onchange: null },
      termCount: { value: 3, disabled: false }
    },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener() {},
    append() {},
    insertBefore(newEl) {
      if (String(newEl?.innerHTML || '').includes('<span>4</span>')) {
        stepSpans.splice(3, 0, { textContent: '4' });
      }
    },
    querySelector(sel) {
      if (sel === '.session-size legend span') return stepSpans[4] || null;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === 'fieldset legend span') return stepSpans;
      return [];
    }
  };
  ctx.FormData = class {
    get(k) { return k === 'count' ? '10' : k === 'seconds' ? '15' : 'choices'; }
    getAll() { return ['1']; }
  };
  const origQS = ctx.document.querySelector.bind(ctx.document);
  const appEl = origQS('#app');
  ctx.document.querySelector = sel => {
    if (sel === '#config') return String(appEl.innerHTML || '').includes('id="config"') ? formMock : null;
    return origQS(sel);
  };
  ctx.setup();
  assert.deepEqual(stepSpans.map(s => s.textContent), ['1', '2', '3', '4', '5', '6']);
});

test('keyboard shortcuts (1-4, S, Enter) and scratchpad toggle work in quiz', async () => {
  const ctx = loadAppContext();
  await ctx.localSignIn('minhkhoi', '1234');
  ctx.config.inputMode = 'choices';
  ctx.startQuiz();
  try {
    let clickedIdx = -1;
    const fakeButtons = [0, 1, 2, 3].map(i => ({
      disabled: false,
      click() { clickedIdx = i; }
    }));
    const origQSA = ctx.document.querySelectorAll.bind(ctx.document);
    ctx.document.querySelectorAll = sel => {
      if (sel === '#quizCard [data-answer]') return fakeButtons;
      return origQSA(sel);
    };

    let prevented = false;
    const handledChoice = ctx.handleQuizKeydown({
      key: '3',
      target: { tagName: 'BODY' },
      preventDefault() { prevented = true; }
    });
    assert.equal(handledChoice, true);
    assert.equal(prevented, true);
    assert.equal(clickedIdx, 2);

    // Toggle scratchpad via S key
    assert.equal(ctx.toggleScratchpad(false), false);
    const handledS = ctx.handleQuizKeydown({
      key: 's',
      target: { tagName: 'BODY' },
      preventDefault() {}
    });
    assert.equal(handledS, true);
    assert.equal(ctx.toggleScratchpad(false), false);

    // formatQuestionPrompt never appends duplicate "= ?" when question already contains "?" or "="
    assert.equal(ctx.formatQuestionPrompt('44 + ? = 54'), '44 + ? = 54');
    assert.equal(ctx.formatQuestionPrompt('Lan có 5 táo, thêm 3 táo. Hỏi có mấy táo?'), 'Lan có 5 táo, thêm 3 táo. Hỏi có mấy táo?');
    assert.equal(ctx.formatQuestionPrompt('44 + 10'), '44 + 10 = ?');
  } finally {
    ctx.stop();
  }
});

test('teacher classrooms, code join, teacher workspace isolation, and class backup/restore work', async () => {
  const ctx = loadAppContext();
  const initialClasses = ctx.loadClasses();
  assert.ok(initialClasses.some(c => c.teacherUsername === 'colan' && c.code === '4ANUMI'));

  // Teachers are excluded from admin student directory
  await ctx.localSignIn('admin', 'admin123');
  const adminStudents = ctx.getFilteredStudents();
  assert.equal(adminStudents.some(s => s.role === 'teacher' || s.username === 'colan'), false);

  // Admin creates a new teacher + class
  const created = await ctx.createTeacherWithClass({
    name: 'Thầy Hùng',
    username: 'thayhung',
    password: '5678',
    className: 'Lớp 5B',
    grade: 5
  });
  assert.equal(created.teacher.role, 'teacher');
  assert.equal(created.cls.teacherUsername, 'thayhung');
  assert.ok(created.cls.code.length >= 4);

  // Student joins by class code
  const joined = ctx.joinClassByCode(created.cls.code, 'baoan');
  assert.equal(joined.ok, true);
  assert.equal(joined.already, false);
  assert.equal(ctx.getClassesForStudent('baoan').some(c => c.id === created.cls.id), true);

  // Teacher signs in -> stays in teacher workspace & only sees their own enrolled students
  await ctx.localSignIn('thayhung', '5678');
  assert.equal(ctx.isCurrentUserTeacher(), true);
  assert.equal(ctx.view, 'teacher');
  const ownStudents = ctx.getStudentsForTeacher('thayhung', created.cls.id);
  assert.deepEqual(ownStudents.map(s => s.username), ['baoan']);
  ctx.nav('home');
  assert.equal(ctx.view, 'teacher');

  // Full backup & restore preserves classes
  const backup = ctx.buildFullSystemBackup();
  assert.ok(Array.isArray(backup.classes) && backup.classes.some(c => c.id === created.cls.id));
  ctx.deleteClassById(created.cls.id);
  assert.equal(ctx.loadClasses().some(c => c.id === created.cls.id), false);
  assert.equal(ctx.restoreFullSystemBackup(backup), true);
  assert.equal(ctx.loadClasses().some(c => c.id === created.cls.id), true);
});

test('teacher self-setup by level/grade, saved code student quick-join, strict teacher isolation, and share link import work', async () => {
  const ctx = loadAppContext();

  // Teacher sets up their own account + secondary class with custom saved code
  const setupRes = await ctx.createTeacherWithClass({
    name: 'Thầy Nam',
    username: 'thaynam',
    password: '4321',
    level: 'secondary',
    grade: 7,
    className: 'Lớp 7B',
    code: '7BNAM',
    autoSignIn: true
  });
  assert.equal(setupRes.cls.level, 'secondary');
  assert.equal(setupRes.cls.grade, 7);
  assert.equal(setupRes.cls.code, '7BNAM');
  assert.equal(ctx.isCurrentUserTeacher(), true);
  assert.equal(ctx.view, 'teacher');
  assert.equal(ctx.getClassesForTeacher('thaynam', 'secondary').length, 1);
  assert.equal(ctx.getClassesForTeacher('thaynam', 'primary').length, 0);

  // Build invite link with encoded metadata and test cross-device import
  const inviteUrl = ctx.buildClassJoinLink(setupRes.cls);
  assert.ok(inviteUrl.includes('#join=7BNAM&cls='));

  // Student joins using ONLY class code + name -> auto-enrolled at grade 7
  await ctx.localSignOut();
  const joinRes = await ctx.studentQuickJoinByCode({
    code: '7bnam',
    name: 'Nguyễn Minh Anh',
    pin: '1234',
    avatar: 'fox'
  });
  assert.equal(joinRes.ok, true);
  assert.equal(joinRes.cls.code, '7BNAM');
  assert.equal(ctx.currentAuthUser().grade, 7);
  assert.equal(ctx.getClassesForStudent(joinRes.username).some(c => c.code === '7BNAM'), true);

  // Strict teacher isolation: Thầy Nam manages Minh Anh, Cô Lan does NOT
  assert.equal(ctx.canTeacherManageStudent('thaynam', joinRes.username), true);
  assert.equal(ctx.canTeacherManageStudent('colan', joinRes.username), false);
  assert.equal(ctx.getStudentsForTeacher('colan').some(s => s.username === joinRes.username), false);

  // Cross-device hash import restores class code if missing locally
  ctx.deleteClassById(setupRes.cls.id);
  assert.equal(ctx.findClassByCode('7BNAM'), null);
  const parsedCode = ctx.parseIncomingJoinHash(inviteUrl.slice(inviteUrl.indexOf('#')));
  assert.equal(parsedCode, '7BNAM');
  const imported = ctx.findClassByCode('7BNAM');
  assert.ok(imported && imported.name === 'Lớp 7B' && imported.level === 'secondary' && imported.grade === 7);
});
