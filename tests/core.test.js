'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadAppContext } = require('./helpers/app-context');

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
    password: '567890',
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
  await ctx.localSignIn('thayhung', '567890');
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
    password: '432100',
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
    pin: '123456',
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

test('MOET GDPT 2018 grade-by-grade curriculum rules (Grades 1-9) are enforced accurately', () => {
  const ctx = loadAppContext();

  // Grade 1: No carry (+), no borrow (-), within 100, no ×/÷/brackets
  for (let i = 0; i < 60; i++) {
    const q = ctx.generate({ ...ctx.NUMI_GRADES[1], grade: 1, type: 'natural', questionStyle: 'normal' });
    assert.ok(!q.q.includes('×') && !q.q.includes('÷') && !q.q.includes('('), `Grade 1 invalid op/bracket: ${q.q}`);
    const mAdd = q.q.match(/^(\d+) \+ (\d+)$/);
    if (mAdd) {
      const a = +mAdd[1], b = +mAdd[2];
      assert.ok(a + b <= 100, `Grade 1 sum > 100: ${q.q}`);
      if (a % 10 !== 0 || b % 10 !== 0) {
        assert.ok((a % 10) + (b % 10) <= 10, `Grade 1 carry exceeded: ${q.q}`);
      }
    }
    const mSub = q.q.match(/^(\d+) − (\d+)$/);
    if (mSub) {
      const a = +mSub[1], b = +mSub[2];
      assert.ok(a <= 100 && a >= b, `Grade 1 sub invalid: ${q.q}`);
      if (a > 10) assert.ok((a % 10) >= (b % 10), `Grade 1 borrow in ${q.q}`);
    }
  }

  // Grade 1-2 convenient mode: no multiplication or brackets in prompt
  for (const g of [1, 2]) {
    for (let i = 0; i < 25; i++) {
      const q = ctx.generate({ ...ctx.NUMI_GRADES[g], grade: g, type: 'natural', questionStyle: 'convenient' });
      assert.ok(!q.q.includes('×') && !q.q.includes('('), `Grade ${g} convenient must not use × or brackets: ${q.q}`);
    }
  }

  // Grade 2: × and ÷ strictly tables 2 and 5
  for (let i = 0; i < 40; i++) {
    const qMul = ctx.generate({ ...ctx.NUMI_GRADES[2], grade: 2, ops: ['*'], type: 'natural', questionStyle: 'normal' });
    const m = qMul.q.match(/^(\d+) × (\d+)$/);
    assert.ok(m && ([2, 5].includes(+m[1]) || [2, 5].includes(+m[2])), `Grade 2 mul not table 2/5: ${qMul.q}`);
    const qDiv = ctx.generate({ ...ctx.NUMI_GRADES[2], grade: 2, ops: ['/'], type: 'natural', questionStyle: 'normal' });
    const md = qDiv.q.match(/^(\d+) ÷ (\d+)$/);
    assert.ok(md && [2, 5].includes(+md[2]), `Grade 2 div not table 2/5: ${qDiv.q}`);
  }

  // Grade 4 convenient mode: distributive prompt is a×b + a×c (not already factored a×(b+c))
  for (let i = 0; i < 40; i++) {
    const q = ctx.generate({ ...ctx.NUMI_GRADES[4], grade: 4, type: 'natural', questionStyle: 'convenient' });
    assert.ok(!q.q.includes('('), `Grade 4 convenient prompt should not be pre-factored: ${q.q}`);
    assert.ok(q.options.some(opt => ctx.isAnswerMatch(opt, q.answer)));
  }

  // Grades 5-9 generate valid grade-specific skills (%, powers, sqrt/abs/alg, identities, cbrt/equations)
  for (const g of [5, 6, 7, 8, 9]) {
    const skills = new Set();
    for (let i = 0; i < 80; i++) {
      const q = ctx.generate({ ...ctx.NUMI_GRADES[g], grade: g, type: ctx.NUMI_GRADES[g].types[0], questionStyle: 'normal' });
      assert.ok(q && q.q && q.answer !== undefined);
      assert.equal(q.options.length, 4, `Grade ${g} expected 4 options for ${q.q}`);
      assert.ok(q.options.some(opt => ctx.isAnswerMatch(opt, q.answer)), `Grade ${g} missing answer ${q.answer} for ${q.q}`);
      skills.add(q.skill);
    }
    if (g === 5) assert.ok(skills.has('percent:%'), 'Grade 5 should include percentage mental math');
    if (g === 6) assert.ok(skills.has('power:^'), 'Grade 6 should include natural-exponent powers');
    if (g === 7) assert.ok(skills.has('sqrt:√') || skills.has('negative:abs') || skills.has('algebra:eval'), 'Grade 7 should include sqrt/abs/algebra');
    if (g === 8) assert.ok(skills.has('identity:diffSq') || skills.has('identity:sq'), 'Grade 8 should include algebraic identities');
    if (g === 9) assert.ok(skills.has('cbrt:∛') || skills.has('equation:x') || skills.has('sqrt:√'), 'Grade 9 should include roots/equations');
  }
});

test('new PINs/passwords must have at least 6 characters, but existing short PINs can still sign in', async () => {
  const ctx = loadAppContext();
  await assert.rejects(() => ctx.localSignUp('Be An', 'bean', '1234', 'fox', 2), /6/);
  await assert.rejects(() => ctx.createTeacherWithClass({ name: 'Co A', username: 'coa', password: '12345', className: 'Lop 3A', grade: 3 }), /6/);
  await ctx.localSignUp('Be An', 'bean', '123456', 'fox', 2);
  assert.equal(ctx.currentAuthUser().username, 'bean');
  await ctx.localSignOut();
  // seeded demo accounts keep their legacy 4-digit PIN and must still work
  await ctx.localSignIn('minhkhoi', '1234');
  assert.equal(ctx.currentAuthUser().username, 'minhkhoi');
  await ctx.localSignOut();
  await ctx.localSignIn('colan', '1234');
  assert.equal(ctx.currentAuthUser().role, 'teacher');
});

test('signing in with a short PIN forces a change, and PINs are never stored as plain text', async () => {
  const ctx = loadAppContext();
  await ctx.localSignIn('minhkhoi', '1234');
  assert.equal(ctx.getLocalUsers().minhkhoi.weakPin, true);
  await assert.rejects(() => ctx.updateUserPassword('12345'), /6/);
  await ctx.updateUserPassword('bonghoa1');
  const saved = ctx.getLocalUsers().minhkhoi;
  assert.equal(saved.weakPin, undefined);
  assert.equal(saved.password, undefined);
  assert.equal(saved.hash, await ctx.hashPassword('bonghoa1'));
  await ctx.localSignOut();
  await assert.rejects(() => ctx.localSignIn('minhkhoi', '1234'));
  await ctx.localSignIn('minhkhoi', 'bonghoa1');
  assert.equal(ctx.getLocalUsers().minhkhoi.weakPin, undefined);
});

test('quick-join rejects short PINs and defaults to a 6-character PIN', async () => {
  const ctx = loadAppContext();
  await assert.rejects(() => ctx.studentQuickJoinByCode({ code: '4ANUMI', name: 'Be Lan', pin: '1234' }), /6/);
  const ok = await ctx.studentQuickJoinByCode({ code: '4ANUMI', name: 'Be Lan' });
  assert.equal(ok.ok, true);
  await ctx.localSignOut();
  await ctx.localSignIn(ok.username, '123456');
  assert.equal(ctx.currentAuthUser().username, ok.username);
});

test('full system backup includes classes and restoring brings them back (split teacher/admin files)', async () => {
  const ctx = loadAppContext();
  const backup = ctx.buildFullSystemBackup();
  assert.ok(Array.isArray(backup.classes) && backup.classes.length > 0, 'backup carries the classes');
  const savedIds = backup.classes.map(c => c.id).sort();
  ctx.saveClasses([]);
  assert.equal(ctx.loadClasses().length, 0);
  assert.equal(ctx.restoreFullSystemBackup(JSON.parse(JSON.stringify(backup))), true);
  assert.deepEqual(ctx.loadClasses().map(c => c.id).sort(), savedIds);
  // the UI files see the same shared data layer
  assert.equal(typeof ctx.NumiClasses.getLastAuthMode, 'function');
  assert.equal(typeof ctx.renderTeacherWorkspace, 'function');
  assert.equal(typeof ctx.NumiAdminData.loadTargetedAssignments, 'function');
});

test('grade presets (GDPT 2018) keep questions in curriculum and mental-math sized', () => {
  const ctx = loadAppContext();
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  for (let g = 1; g <= 9; g++) {
    const gr = ctx.NUMI_GRADES[g];
    const cfg = { ...ctx.defaults, ops: gr.ops, types: gr.types, type: gr.types[0], digits: gr.digits, grade: g, questionStyle: 'normal' };
    for (let i = 0; i < 1500; i++) {
      const q = ctx.generate(cfg);
      const tag = `Lớp ${g}: "${q.q}" = ${q.answer}`;
      assert.equal(new Set(q.options).size, 4, `${tag} needs 4 distinct options [${q.options}]`);
      assert.ok(q.options.includes(q.answer), `${tag} options miss the answer`);
      const div = q.q.match(/^\(?(-?[\d,]+)\)? ÷ \(?(-?[\d,]+)\)?$/);
      if (div && q.skill.endsWith(':/') && !q.skill.startsWith('remainder')) {
        const [a, b] = [Math.abs(+div[1].replace(',', '.')), Math.abs(+div[2].replace(',', '.'))];
        if (g >= 3) assert.notEqual(a, b, `${tag} trivial x ÷ x`);
        if (g === 2) assert.ok([2, 5].includes(b) && a / b <= 10, `${tag} outside the ×2/×5 tables`);
      }
      const num = Number(String(q.answer).replace(',', '.'));
      if (g >= 5 && Number.isFinite(num)) assert.ok(Math.abs(num) < 10000, `${tag} too large for mental math`);
      const fr = [...q.q.matchAll(/(-?\d+)\/(\d+)/g)];
      if (fr.length === 2 && q.skill.startsWith('fraction')) {
        for (const f of fr) assert.equal(gcd(Math.abs(+f[1]), +f[2]), 1, `${tag} operand not in lowest terms`);
        const [d1, d2] = [+fr[0][2], +fr[1][2]];
        if (g === 4 && /:[+-]$/.test(q.skill)) assert.ok(d1 % d2 === 0 || d2 % d1 === 0, `${tag} Grade 4 denominators must divide`);
      }
    }
  }
});

test('distractors cannot be eliminated by units digit, denominator, or answer position', () => {
  const ctx = loadAppContext();
  const num = s => (/^-?\d+([.,]\d+)?$/.test(String(s)) ? Number(String(s).replace(',', '.')) : null);
  const last = s => String(s).replace(/\D/g, '').slice(-1);
  const rank = [0, 0, 0, 0];
  for (let g = 1; g <= 9; g++) {
    const gr = ctx.NUMI_GRADES[g];
    for (const style of g <= 5 ? ['normal', 'convenient', 'expression', 'missing', 'word'] : ['normal']) {
      const cfg = { ...ctx.defaults, ops: gr.ops, types: gr.types, type: gr.types[0], digits: gr.digits, grade: g, questionStyle: style, termCount: 3 };
      for (let i = 0; i < 300; i++) {
        const q = ctx.generate(cfg);
        const tag = `Lớp ${g} ${style}: "${q.q}" = ${q.answer} [${q.options}]`;
        const fa = String(q.answer).match(/^-?\d+\/(\d+)$/);
        if (fa) assert.ok(q.options.every(o => String(o).endsWith('/' + fa[1])), `${tag} denominator gives the answer away`);
        const v = num(q.answer);
        if (v === null || !q.options.every(o => num(o) !== null)) continue;
        if (Math.abs(v) >= 20 || /[.,]/.test(q.answer)) {
          assert.ok(q.options.every(o => last(o) === last(q.answer)), `${tag} units digit gives the answer away`);
        }
        rank[q.options.map(num).sort((x, y) => x - y).indexOf(v)]++;
      }
    }
  }
  const total = rank.reduce((a, b) => a + b, 0);
  for (const r of rank) assert.ok(r / total > 0.17 && r / total < 0.33, `answer position is predictable: ${rank}`);
});

test('v2.10.0: all Grade 1-5 deep exam topics, multi-topic synthesis, and Column Arithmetic parser work accurately', () => {
  const ctx = loadAppContext();

  // 1. Every specialized topic across Grades 1-9 (including 40 deep Grade 1-5 topics) produces valid questions
  let totalTopics = 0;
  let elemTopics = 0;
  for (let g = 1; g <= 9; g++) {
    const topics = ctx.NUMI_GRADE_TOPICS[g];
    assert.ok(Array.isArray(topics) && topics.length >= (g <= 5 ? 8 : 5), `Grade ${g} expected >= ${g <= 5 ? 8 : 5} topics, got ${topics?.length}`);
    for (const tp of topics) {
      if (tp.id === 'all') continue;
      totalTopics++;
      if (g <= 5) elemTopics++;
      for (let i = 0; i < 6; i++) {
        const q = ctx.generate({ ...ctx.NUMI_GRADES[g], grade: g, topic: tp.id, topics: [tp.id], questionStyle: 'normal' });
        assert.ok(q && q.q && q.answer !== undefined, `Topic ${tp.id} failed to generate`);
        assert.equal(q.options.length, 4, `Topic ${tp.id} must have 4 options (got ${q.options.length} for "${q.q}")`);
        assert.ok(q.options.some(opt => ctx.isAnswerMatch(opt, q.answer)), `Topic ${tp.id} missing answer "${q.answer}" in [${q.options.join(', ')}] for "${q.q}"`);
        assert.ok(q.explanation && q.explanation.length > 3, `Topic ${tp.id} missing explanation`);
        assert.ok(q.topicLabel && q.topicLabel.length > 2, `Topic ${tp.id} missing topicLabel`);
      }
    }
  }
  assert.ok(elemTopics >= 62, `Expected >= 62 specialized Grade 1-5 topics, got ${elemTopics}`);
  assert.ok(totalTopics >= 78, `Expected >= 78 specialized Grade 1-9 topics, got ${totalTopics}`);

  // 2. Multi-topic synthesis covers every selected topic evenly via round-robin deck
  const combo = ['g3_col10k', 'g3_geom', 'g3_fold_word'];
  const seen = new Set();
  for (let i = 0; i < combo.length; i++) {
    const q = ctx.generate({ ...ctx.NUMI_GRADES[3], grade: 3, topic: 'all', topics: combo, questionStyle: 'normal' });
    assert.ok(combo.includes(q.topicId), `Unexpected topicId ${q.topicId} for multi-topic mix`);
    seen.add(q.topicId);
  }
  assert.equal(seen.size, combo.length, `Multi-topic synthesis should cover all 3 topics evenly in 3 draws, saw [${[...seen]}]`);

  // 2b. Smart recommended count & timer presets adapt to Mental Math vs Column vs Knowledge Review
  const fastTiming = ctx.getRecommendedTiming(3, ['g3_tables']);
  assert.equal(fastTiming.count, 15);
  assert.equal(fastTiming.seconds, 12);
  const colTiming = ctx.getRecommendedTiming(4, ['g4_mul2']);
  assert.equal(colTiming.count, 8);
  assert.equal(colTiming.seconds, 50);
  const wordTiming = ctx.getRecommendedTiming(5, ['g5_motion']);
  assert.equal(wordTiming.count, 8);
  assert.equal(wordTiming.seconds, 45);
  const mixTiming = ctx.getRecommendedTiming(3, combo);
  assert.equal(mixTiming.count, 12);
  assert.equal(mixTiming.seconds, 45);

  // 3. Column Arithmetic parser ("Đặt tính rồi tính")
  const addCol = ctx.parseColumnArithmetic('47 + 38');
  assert.ok(addCol && addCol.op === '+' && addCol.expected === 85 && addCol.commaCol === -1);
  assert.equal(addCol.rowA.join('').trim(), '47');
  assert.equal(addCol.rowB.join('').trim(), '38');

  const subCol = ctx.parseColumnArithmetic('82 − 35');
  assert.ok(subCol && subCol.op === '−' && subCol.expected === 47);

  const mulCol = ctx.parseColumnArithmetic('124 × 3');
  assert.ok(mulCol && mulCol.op === '×' && mulCol.expected === 372 && mulCol.totalCols === 3);

  const decCol = ctx.parseColumnArithmetic('12,5 + 4,75');
  assert.ok(decCol && decCol.hasDec && decCol.decLen === 2 && decCol.expected === 17.25);
  assert.equal(decCol.rowA[decCol.commaCol], ',');
  assert.equal(decCol.rowB[decCol.commaCol], ',');
  assert.equal(decCol.rowA.join(''), '12,50');
  assert.equal(decCol.rowB.join(''), ' 4,75');

  // Non-column questions return null
  assert.equal(ctx.parseColumnArithmetic('Tìm x: 2x + 4 = 10'), null);
  assert.equal(ctx.parseColumnArithmetic('1/2 + 1/3'), null);
  assert.equal(ctx.parseColumnArithmetic('12 − 25'), null); // negative result excluded from elementary column calc
});

test('v2.11.1: reloading page while signed in as teacher boots directly into Teacher Workspace', () => {
  const ctx = loadAppContext({
    storage: {
      'numi-current-user-v1': JSON.stringify({
        id: 'colan',
        username: 'colan',
        name: 'Cô Lan',
        avatar: 'bunny',
        grade: 4,
        role: 'teacher',
        type: 'local'
      })
    }
  });
  assert.equal(ctx.view, 'teacher', 'Reloading as a teacher must boot directly into Teacher Workspace, not student home');
  assert.ok(ctx.document.querySelector('#app').innerHTML.includes('Lớp học của Cô Lan'), 'Teacher workspace content should render on reload');
});

test('v2.12.3: A4 worksheet PDF composer separates Student Exam (no pre-filled column tables, no answers) and Answer Key sheets', () => {
  const ctx = loadAppContext();
  const qs = ctx.generateWorksheetQuestions(2, ['g2_col100', 'g2_word'], 10);
  assert.equal(qs.length, 10, 'Should generate exact requested question count');
  assert.ok(qs.some(q => q.isColumnExercise), 'Grade 2 column topic should flag column exercises');

  for (const fmtMode of ['mixed', 'essay', 'mcq']) {
    const baseState = {
      grade: 2,
      topics: ['g2_col100', 'g2_word'],
      count: 10,
      format: fmtMode,
      title: 'PHIẾU ÔN TẬP LỚP 2',
      durationMin: 20,
      examCode: '01',
      questions: qs
    };
    const examHtml = ctx.buildWorksheetSheetHTML(baseState, { withAnswers: false, interactivePreview: false });
    const ansHtml = ctx.buildWorksheetSheetHTML(baseState, { withAnswers: true, interactivePreview: false });

    assert.ok(examHtml.includes('ws-paper-exam'), `Exam sheet marker missing in ${fmtMode}`);
    assert.ok(!examHtml.includes('ws-col-tbl') && !ansHtml.includes('ws-col-tbl'), 'Pre-filled column tables must NOT appear in printed PDF (scratchpad only)');
    assert.ok(!examHtml.includes('ws-essay-sol') && !examHtml.includes('ws-quick-key-grid'), `Exam sheet must NOT leak answers in ${fmtMode}`);
    assert.ok(ansHtml.includes('ws-paper-answers') && ansHtml.includes('ws-quick-key-grid'), `Answer sheet missing answers/key in ${fmtMode}`);
    assert.ok(!examHtml.includes('....................................................................'), 'Must never use long unbroken dot strings that overflow A4 preview');
    if (fmtMode !== 'mcq') {
      assert.ok(examHtml.includes('ws-blank-workbox'), `Exam sheet should provide blank squared workbox for self column work in ${fmtMode}`);
      if (fmtMode === 'essay') assert.ok(examHtml.includes('ws-dot-fill'), 'Essay writing lines must use CSS dotted borders');
      assert.ok(ansHtml.includes('ws-essay-sol'), `Answer sheet should include concise solutions in ${fmtMode}`);
    } else {
      assert.ok(ansHtml.includes('ws-opt-hit'), 'Answer sheet MCQ should highlight correct option');
    }

    // Sequential numbering Câu 1..10 in exact display order (never skipping numbers across Part I & Part II)
    const nums = [...examHtml.matchAll(/ws-q-num">Câu (\d+)\./g)].map(m => Number(m[1]));
    assert.deepEqual(nums, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], `Display numbering must be strictly sequential 1..10 in ${fmtMode}, got ${nums}`);
  }

  // Word-problem-only mixed sheet must NOT show "ĐẶT TÍNH RỒI TÍNH" in Part II heading and formats blanks cleanly
  const wordQs = ctx.generateWorksheetQuestions(5, ['g5_motion_adv'], 6);
  const wordExamHtml = ctx.buildWorksheetSheetHTML({
    grade: 5, topics: ['g5_motion_adv'], count: 6, format: 'mixed', title: 'LỚP 5', durationMin: 20, examCode: '02', questions: wordQs
  }, { withAnswers: false, interactivePreview: true });
  assert.ok(wordExamHtml.includes('PHẦN II. TỰ LUẬN'), 'Part II without column exercises should say PHẦN II. TỰ LUẬN');
  assert.ok(!wordExamHtml.includes('PHẦN II. ĐẶT TÍNH RỒI TÍNH'), 'Part II without column exercises must not show ĐẶT TÍNH RỒI TÍNH');
  assert.ok(wordExamHtml.includes('ws-dot-fill'), 'Word problem Part II should render responsive CSS dotted writing lines');
  assert.ok(!wordExamHtml.includes('là ? km/h'), 'Prose blanks should render as …… instead of raw ? placeholder');
});

test('v2.14.0: preset count picker splits questions evenly across chosen topics and keeps each topic default timer', () => {
  const ctx = loadAppContext();
  const chosen3 = ['g5_pct', 'g5_box_surface', 'g5_motion_adv']; // default timers: 35s, 45s, 50s
  const qs = ctx.generateUniqueQuestions(10, { ...ctx.NUMI_GRADES[5], grade: 5, topic: 'all', topics: chosen3, count: 10, questionStyle: 'normal' });
  assert.equal(qs.length, 10, 'Should generate exactly 10 questions');

  const counts = {};
  const expectedTimers = { g5_pct: 35, g5_box_surface: 45, g5_motion_adv: 50 };
  for (const q of qs) {
    assert.ok(chosen3.includes(q.topicId), `Unexpected topicId ${q.topicId}`);
    counts[q.topicId] = (counts[q.topicId] || 0) + 1;
    assert.equal(q.topicSeconds, expectedTimers[q.topicId], `${q.topicId} must keep its own default timer`);
    assert.equal(q.config.seconds, expectedTimers[q.topicId], `${q.topicId} q.config.seconds must match its own default timer`);
  }
  const sortedCounts = Object.values(counts).sort((a, b) => a - b);
  assert.deepEqual(sortedCounts, [3, 3, 4], `10 questions across 3 topics must split strictly evenly [3, 3, 4], got ${sortedCounts}`);

  // Verify getRecommendedTiming returns per-topic min/max timer range (35s..50s)
  const rec3 = ctx.getRecommendedTiming(5, chosen3);
  assert.equal(rec3.minSeconds, 35, 'minSeconds across g5_pct(35s), g5_box_surface(45s), g5_motion_adv(50s) must be 35');
  assert.equal(rec3.maxSeconds, 50, 'maxSeconds must be 50');

  // Verify buildBalancedTopicPlan directly across multiple counts
  for (const [n, expected] of [[10, [3, 3, 4]], [9, [3, 3, 3]], [5, [1, 2, 2]]]) {
    const plan = ctx.buildBalancedTopicPlan(chosen3, n);
    assert.equal(plan.length, n);
    const planCounts = Object.values(plan.reduce((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {})).sort((a, b) => a - b);
    assert.deepEqual(planCounts, expected, `buildBalancedTopicPlan(3 topics, ${n}) must produce ${expected}`);
  }

  // Worksheet generator also balances 10 questions evenly across 3 topics
  const wsQs = ctx.generateWorksheetQuestions(5, chosen3, 10);
  assert.equal(wsQs.length, 10);
  const wsCounts = Object.values(wsQs.reduce((acc, q) => { acc[q.topicId] = (acc[q.topicId] || 0) + 1; return acc; }, {})).sort((a, b) => a - b);
  assert.deepEqual(wsCounts, [3, 3, 4], `Worksheet 10 questions across 3 topics must also split [3, 3, 4], got ${wsCounts}`);
});

test('v2.14.1: review variants handle all 80 topics without undefined, teacher workspace keeps PDF button, setup syncs summary, and Sprint stays fast mental math', async () => {
  const ctx = loadAppContext();

  // 1. Every single GDPT 2018 topic (Grades 1-9) must produce a clean review variant with no undefined/NaN
  let checked = 0;
  for (let g = 1; g <= 9; g++) {
    const list = (ctx.NUMI_GRADE_TOPICS[g] || []).filter(tp => tp.id !== 'all');
    for (const tp of list) {
      const cfg = { grade: g, topic: tp.id, topics: [tp.id], count: 8, seconds: tp.seconds || 30, ops: ['+', '-'], digits: [2], types: ['natural'] };
      const q = ctx.generateTopicQuestion(tp.id, cfg);
      const rv = ctx.numiReviewVariant({ ...q, id: 'm_' + tp.id });
      assert.ok(rv && rv.q && !String(rv.q).includes('undefined') && !String(rv.q).includes('NaN'), `Broken review variant for g${g}/${tp.id}: ${rv?.q}`);
      assert.ok(rv.answer !== undefined && !String(rv.answer).includes('NaN'), `Broken review answer for g${g}/${tp.id}: ${rv?.answer}`);
      checked++;
    }
  }
  assert.equal(checked, 126, 'Expected all 126 specialized GDPT 2018 topics checked');

  // Seeded fraction mistake stays a fraction question
  const fracRv = ctx.numiReviewVariant({ id: 'm1', q: '3/4 + 1/2', answer: '5/4', options: ['5/4', '4/6', '3/6', '7/4'], config: { seconds: 20, type: 'fraction' }, skill: 'fraction:+' });
  assert.ok(String(fracRv.q).includes('/'), `Seeded fraction mistake should stay fraction, got: ${fracRv.q}`);

  // 2. Login page hides dangling Supabase label when googleEnabled is false
  ctx.window.NUMI_CLOUD_CONFIG = { url: 'https://example.supabase.co', publishableKey: 'sb_publishable_x', googleEnabled: false };
  ctx.openAccount('login');
  assert.equal(ctx.document.querySelector('#app').innerHTML.includes('Hoặc tài khoản Supabase'), false, 'Should not render empty Supabase heading when Google login is disabled');

  // 3. Setup initial render syncs #lessonSummary with grade topic bar
  await ctx.localSignIn('minhkhoi', '1234');
  ctx.setup();
  const sumText = ctx.document.querySelector('#lessonSummary')?.textContent || '';
  assert.ok(sumText.includes('13 dạng') || sumText.includes('Đề tổng hợp'), `Initial setup summary must reflect Grade 4 mixed preset, got: ${sumText}`);

  // 4. 60s Sprint clears slow column topic from config
  ctx.config.grade = 4;
  ctx.config.topic = 'g4_col';
  ctx.config.topics = ['g4_col'];
  ctx.startSprint60();
  const sprintHtml = ctx.document.querySelector('#app')?.innerHTML || '';
  const sprintMatch = sprintHtml.match(/class="sprint-problem">([\s\S]*?)<\/div>/);
  const sprintQ = (sprintMatch ? sprintMatch[1].replace(/<[^>]+>/g, '') : '').trim();
  ctx.stop();
  assert.ok(sprintQ.length > 0 && sprintQ.length <= 24 && !/\d{4}/.test(sprintQ), `60s Sprint must stay concise mental math (no 4-5 digit column arithmetic), got: ${sprintQ}`);
  ctx.nav('home');

  // 5. Teacher workspace keeps Print Worksheet PDF button across internal re-renders & avoids "lớp Lớp"
  await ctx.localSignIn('colan', '1234');
  const appEl = ctx.document.querySelector('#app');
  assert.equal(appEl.innerHTML.includes('lớp Lớp'), false, 'Should not repeat "lớp Lớp"');
  assert.ok(ctx.document.querySelector('#tchOpenWorksheetPdfBtn'), 'Teacher Workspace must show Print Worksheet PDF button on initial render');
  // Simulate level filter click (which triggers internal re-render via rerenderTeacherWorkspace)
  const lvlBtn = ctx.document.querySelector('[data-tch-lvl="primary"]');
  if (lvlBtn && typeof lvlBtn.onclick === 'function') lvlBtn.onclick();
  assert.ok(ctx.document.querySelector('#tchOpenWorksheetPdfBtn'), 'Print Worksheet PDF button must persist after internal teacher workspace re-render');
});

test('v2.15.0: THCS Number vs Geometry split, 3-tier progressive difficulty (Easy -> Medium -> Hard), Primary vs Secondary free-input timer rules, and Knowledge Hub work accurately', async () => {
  const ctx = loadAppContext();

  // 1. Every topic across Grades 1-9 generates clean questions across ALL 3 cognitive tiers (easy, medium, hard)
  for (let g = 1; g <= 9; g++) {
    const list = (ctx.NUMI_GRADE_TOPICS[g] || []).filter(tp => tp.id !== 'all');
    if (g >= 6) {
      const numTopics = list.filter(tp => tp.domain === 'number');
      const geomTopics = list.filter(tp => tp.domain === 'geometry');
      assert.ok(numTopics.length >= 8, `Grade ${g} must have >= 8 Number/Algebra topics, got ${numTopics.length}`);
      assert.ok(geomTopics.length >= 4, `Grade ${g} must have >= 4 Geometry topics, got ${geomTopics.length}`);
    }
    for (const tp of list) {
      for (const tier of ['easy', 'medium', 'hard']) {
        const q = ctx.generateTopicQuestion(tp.id, { ...ctx.NUMI_GRADES[g], grade: g, topic: tp.id, topics: [tp.id], difficulty: tier });
        assert.ok(q && q.q && !/undefined|NaN/.test(String(q.q)), `Invalid prompt for ${tp.id} (${tier}): ${q?.q}`);
        assert.ok(q.answer !== undefined && !/undefined|NaN/.test(String(q.answer)), `Invalid answer for ${tp.id} (${tier}): ${q?.answer}`);
        assert.equal(new Set(q.options).size, 4, `${tp.id} (${tier}) must produce 4 distinct options, got [${q.options}] for "${q.q}"`);
        assert.ok(q.options.some(o => ctx.isAnswerMatch(o, q.answer)), `${tp.id} (${tier}) missing answer "${q.answer}" in [${q.options}]`);
        assert.equal(q.difficulty, tier, `${tp.id} must tag difficulty=${tier}`);
        assert.ok(q.difficultyLabel && q.difficultyLabel.length > 4, `${tp.id} must include difficultyLabel`);
      }
    }
  }

  // 2. THCS domainFilter ('number' vs 'geometry') strictly isolates Number/Algebra vs Geometry questions
  for (const g of [6, 7, 8, 9]) {
    const numQs = ctx.generateUniqueQuestions(10, { ...ctx.NUMI_GRADES[g], grade: g, topic: 'all', topics: [], domainFilter: 'number', difficultyMode: 'progressive' });
    assert.equal(numQs.length, 10);
    assert.ok(numQs.every(q => q.domain === 'number'), `Grade ${g} domainFilter=number leaked non-number question`);

    const geomQs = ctx.generateUniqueQuestions(10, { ...ctx.NUMI_GRADES[g], grade: g, topic: 'all', topics: [], domainFilter: 'geometry', difficultyMode: 'progressive' });
    assert.equal(geomQs.length, 10);
    assert.ok(geomQs.every(q => q.domain === 'geometry'), `Grade ${g} domainFilter=geometry leaked non-geometry question`);

    // Progressive schedule orders Easy -> Medium -> Hard!
    const orderMap = { easy: 1, medium: 2, hard: 3 };
    for (let i = 1; i < numQs.length; i++) {
      assert.ok(orderMap[numQs[i].difficulty] >= orderMap[numQs[i - 1].difficulty], `Progressive difficulty must be non-decreasing at index ${i}`);
    }
    assert.equal(numQs[0].difficulty, 'easy');
    assert.equal(numQs[numQs.length - 1].difficulty, 'hard');
  }

  // 3. Timer rules: Primary (Grades 1-5) ALWAYS keeps timer; Secondary (Grades 6-9) Tự luận removes timer!
  for (const g of [1, 2, 3, 4, 5]) {
    assert.equal(ctx.isUntimedQuizSession({ grade: g, inputMode: 'choices' }, { skill: 'natural:+' }), false, `Grade ${g} MCQ must stay timed`);
    assert.equal(ctx.isUntimedQuizSession({ grade: g, inputMode: 'numpad' }, { skill: 'natural:+' }), false, `Grade ${g} Tự luận must stay timed for fast mental thinking`);
  }
  for (const g of [6, 7, 8, 9]) {
    assert.equal(ctx.isUntimedQuizSession({ grade: g, inputMode: 'choices', untimed: false }, { skill: 'equation:x' }), false, `Grade ${g} MCQ default is timed`);
    assert.equal(ctx.isUntimedQuizSession({ grade: g, inputMode: 'numpad' }, { skill: 'equation:x' }), true, `Grade ${g} Tự luận must be untimed`);
    assert.equal(ctx.isUntimedQuizSession({ grade: g, inputMode: 'choices', untimed: true }, { skill: 'equation:x' }), true, `Grade ${g} explicit untimed toggle works`);
  }

  // Live quiz render test: Grade 8 Tự luận displays untimed badge instead of countdown seconds
  await ctx.localSignIn('minhkhoi', '1234');
  ctx.config = { ...ctx.defaults, ...ctx.NUMI_GRADES[8], grade: 8, inputMode: 'numpad', count: 5, topic: 'g8_word_eq', topics: ['g8_word_eq'] };
  ctx.startQuiz();
  const clkTextSec = ctx.document.querySelector('#clock')?.textContent || '';
  assert.ok(clkTextSec.includes('Không giới hạn giờ') || clkTextSec.includes('Untimed'), `Grade 8 Tự luận clock should show Untimed, got: ${clkTextSec}`);
  ctx.stop();

  // Live quiz render test: Grade 4 Tự luận STILL runs countdown seconds
  ctx.config = { ...ctx.defaults, ...ctx.NUMI_GRADES[4], grade: 4, inputMode: 'numpad', count: 5, seconds: 30, topic: 'g4_seq_gauss', topics: ['g4_seq_gauss'] };
  ctx.startQuiz();
  const clkTextPri = ctx.document.querySelector('#clock')?.textContent || '';
  assert.ok(/^\d+(\.\d+)?s$/.test(clkTextPri), `Grade 4 Tự luận clock must run countdown timer, got: ${clkTextPri}`);
  ctx.stop();

  // 4. Knowledge Hub & Geometry Visual SVG work for all grades 1-9 (complete 3-strand GDPT 2018 coverage)
  let totalKnowledgeCards = 0;
  for (let g = 1; g <= 9; g++) {
    const bank = ctx.NUMI_KNOWLEDGE_BANK[g];
    assert.ok(bank, `Missing knowledge bank for Grade ${g}`);
    const domains = bank.sections.map(s => s.domain).join(',');
    assert.equal(domains, 'number,geometry,stats', `Grade ${g} knowledge bank must cover all 3 GDPT 2018 strands (number, geometry, stats)`);
    const validTopicIds = new Set((ctx.NUMI_GRADE_TOPICS[g] || []).map(tp => tp.id));
    let gradeCount = 0;
    for (const sec of bank.sections) {
      for (const it of sec.items) {
        gradeCount++;
        totalKnowledgeCards++;
        if (it.topicId) {
          assert.ok(validTopicIds.has(it.topicId), `Grade ${g} knowledge card "${it.tag}" links unknown topicId "${it.topicId}"`);
        }
      }
    }
    assert.ok(gradeCount >= 12, `Grade ${g} must have >= 12 comprehensive knowledge items, got ${gradeCount}`);
    const cardHtml = ctx.buildKnowledgeCardHtml(g, 'all');
    assert.ok(cardHtml.includes('kh-sec-card') && cardHtml.includes('kh-dom-stats'), `Knowledge card HTML missing sections/stats for Grade ${g}`);
  }
  assert.ok(totalKnowledgeCards >= 115, `Expected >= 115 total knowledge cards across Grades 1-9, got ${totalKnowledgeCards}`);
  const searchHtml8 = ctx.buildKnowledgeCardHtml(8, 'all', false, 'Thalès');
  assert.ok(searchHtml8.includes('Thalès') && !searchHtml8.includes('Đơn thức'), 'Knowledge search should filter Grade 8 cards accurately');
  const pythaQ = ctx.generateTopicQuestion('g8_geom_pytha', { grade: 8, difficulty: 'easy' });
  const geomSvg = ctx.buildVisualMathSvg(pythaQ);
  assert.ok(geomSvg.includes('<svg') && geomSvg.includes('visual-math-svg'), 'Pythagorean geometry question should render SVG diagram');
});
