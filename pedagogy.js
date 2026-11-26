'use strict';
// Pedagogy Enhancements: Missing-Number Puzzles, Word Problems, Visual Math SVG, and Spaced Repetition
(() => {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function rangeForDigits(digits) {
    const d = Array.isArray(digits) && digits.length ? pickOne(digits.map(Number).filter(Boolean)) : 1;
    if (d <= 1) return [1, 9];
    if (d === 2) return [10, 49];
    return [20, 120];
  }

  function uniqueOptions(answer, candidates) {
    if (typeof antiTrickOptions === 'function') return antiTrickOptions(answer, candidates);
    const ansStr = String(answer);
    const set = new Set([ansStr]);
    for (const c of candidates) {
      const n = Number(c);
      if (Number.isFinite(n) && n >= 0) set.add(String(Math.round(n)));
      if (set.size >= 4) break;
    }
    let delta = 1;
    while (set.size < 4 && delta < 100) {
      const base = Number(answer) || 0;
      if (base + delta >= 0) set.add(String(base + delta));
      if (set.size < 4 && base - delta >= 0) set.add(String(base - delta));
      delta++;
    }
    return Array.from(set).sort(() => Math.random() - 0.5);
  }

  function generateMissingNumber(cfg = {}) {
    const grade = cfg.grade && cfg.grade !== 'custom' ? Number(cfg.grade) : null;
    let ops = (Array.isArray(cfg.ops) && cfg.ops.length ? cfg.ops : ['+', '-', '*']).filter(op => ['+', '-', '*', '/'].includes(op));
    if (grade === 1) ops = ops.filter(op => op === '+' || op === '-');
    const op = pickOne(ops.length ? ops : ['+']);
    const rawTypes = Array.isArray(cfg.types) && cfg.types.length ? cfg.types : [cfg.type || 'natural'];
    const canFrac = (!grade || grade >= 4) && rawTypes.includes('fraction');
    const chosenType = canFrac && (rawTypes.length === 1 || Math.random() < 1 / rawTypes.length) ? 'fraction' : 'natural';
    const hideFirst = Math.random() < 0.5;

    if (chosenType === 'fraction' && typeof gcd === 'function' && typeof frac === 'function') {
      const fam = pickOne([[2, 4], [3, 6], [2, 3, 6], [3, 4, 12], [2, 5, 10], [4, 8]]);
      const pickCoprime = d => {
        const cands = [];
        for (let x = 1; x <= Math.min(9, d * 2 - 1); x++) if (gcd(x, d) === 1) cands.push(x);
        return cands.length ? pickOne(cands) : 1;
      };
      for (let tries = 0; tries < 25; tries++) {
        const dA = pickOne(fam), dB = pickOne(fam);
        const nA = pickCoprime(dA), nB = pickCoprime(dB);
        let qStr = '', ansStr = '', expStr = '';
        if (op === '+') {
          const sumStr = frac(nA * dB + nB * dA, dA * dB);
          if (!sumStr.includes('/')) continue;
          if (hideFirst) {
            ansStr = `${nA}/${dA}`;
            qStr = `? + ${nB}/${dB} = ${sumStr}`;
            expStr = `${sumStr} − ${nB}/${dB} = ${ansStr}`;
          } else {
            ansStr = `${nB}/${dB}`;
            qStr = `${nA}/${dA} + ? = ${sumStr}`;
            expStr = `${sumStr} − ${nA}/${dA} = ${ansStr}`;
          }
        } else if (op === '-') {
          const totStr = frac(nA * dB + nB * dA, dA * dB);
          if (!totStr.includes('/')) continue;
          if (hideFirst) {
            ansStr = totStr;
            qStr = `? − ${nA}/${dA} = ${nB}/${dB}`;
            expStr = `${nB}/${dB} + ${nA}/${dA} = ${ansStr}`;
          } else {
            ansStr = `${nA}/${dA}`;
            qStr = `${totStr} − ? = ${nB}/${dB}`;
            expStr = `${totStr} − ${nB}/${dB} = ${ansStr}`;
          }
        } else if (op === '*') {
          const prodStr = frac(nA * nB, dA * dB);
          if (!prodStr.includes('/')) continue;
          if (hideFirst) {
            ansStr = `${nA}/${dA}`;
            qStr = `? × ${nB}/${dB} = ${prodStr}`;
            expStr = `${prodStr} ÷ ${nB}/${dB} = ${ansStr}`;
          } else {
            ansStr = `${nB}/${dB}`;
            qStr = `${nA}/${dA} × ? = ${prodStr}`;
            expStr = `${prodStr} ÷ ${nA}/${dA} = ${ansStr}`;
          }
        } else {
          const quotStr = frac(nA * dB, dA * nB);
          if (!quotStr.includes('/')) continue;
          if (hideFirst) {
            ansStr = `${nA}/${dA}`;
            qStr = `? ÷ ${nB}/${dB} = ${quotStr}`;
            expStr = `${quotStr} × ${nB}/${dB} = ${ansStr}`;
          } else {
            ansStr = `${nB}/${dB}`;
            qStr = `${nA}/${dA} ÷ ? = ${quotStr}`;
            expStr = `${nA}/${dA} ÷ ${quotStr} = ${ansStr}`;
          }
        }
        const fm = ansStr.match(/^(\d+)\/(\d+)$/);
        if (fm) {
          const an = +fm[1], ad = +fm[2];
          return {
            id: typeof uid === 'function' ? uid() : 'm_' + Math.random().toString(36).slice(2),
            q: qStr,
            answer: ansStr,
            options: uniqueOptions(ansStr, [frac(an + 1, ad), frac(Math.max(1, an - 1), ad), frac(an + 2, ad)]),
            skill: 'fraction:missing',
            config: { ...cfg, type: 'fraction', questionStyle: 'missing' },
            explanation: expStr
          };
        }
      }
    }

    const [lo, hi] = grade === 1 ? [1, 9] : grade === 2 ? [2, 30] : rangeForDigits(cfg.digits);
    let q = '', ans = 0, explanation = '';

    if (op === '+') {
      let a = randInt(lo, hi), b = randInt(lo, hi);
      if (grade === 1) {
        // MOET Grade 1: No carry within 10 or 20/100
        a = randInt(1, 9);
        b = randInt(1, Math.max(1, 10 - a));
      }
      const sum = a + b;
      if (hideFirst) {
        ans = a;
        q = `? + ${b} = ${sum}`;
        explanation = `${sum} − ${b} = ${a}`;
      } else {
        ans = b;
        q = `${a} + ? = ${sum}`;
        explanation = `${sum} − ${a} = ${b}`;
      }
    } else if (op === '-') {
      let b = randInt(lo, hi), diff = randInt(1, hi);
      if (grade === 1) {
        b = randInt(1, 8);
        diff = randInt(1, Math.max(1, 10 - b));
      }
      const a = b + diff;
      if (hideFirst) {
        ans = a;
        q = `? − ${b} = ${diff}`;
        explanation = `${diff} + ${b} = ${a}`;
      } else {
        ans = b;
        q = `${a} − ? = ${diff}`;
        explanation = `${a} − ${diff} = ${b}`;
      }
    } else if (op === '*') {
      const a = grade === 2 ? pickOne([2, 5]) : randInt(2, grade === 3 ? 9 : Math.min(12, hi));
      const b = grade === 2 ? randInt(1, 10) : randInt(2, grade === 3 ? 9 : Math.min(12, hi));
      const prod = a * b;
      if (hideFirst) {
        ans = a;
        q = `? × ${b} = ${prod}`;
        explanation = `${prod} ÷ ${b} = ${a}`;
      } else {
        ans = b;
        q = `${a} × ? = ${prod}`;
        explanation = `${prod} ÷ ${a} = ${b}`;
      }
    } else {
      const b = grade === 2 ? pickOne([2, 5]) : randInt(2, grade === 3 ? 9 : Math.min(12, hi));
      const quot = grade === 2 ? randInt(1, 10) : randInt(2, grade === 3 ? 9 : Math.min(12, hi));
      const a = b * quot;
      if (hideFirst) {
        ans = a;
        q = `? ÷ ${b} = ${quot}`;
        explanation = `${quot} × ${b} = ${a}`;
      } else {
        ans = b;
        q = `${a} ÷ ? = ${quot}`;
        explanation = `${a} ÷ ${quot} = ${b}`;
      }
    }

    return {
      id: typeof uid === 'function' ? uid() : 'm_' + Math.random().toString(36).slice(2),
      q,
      answer: String(ans),
      options: uniqueOptions(ans, [ans + 1, ans - 1, ans + 2, ans + 10]),
      skill: 'natural:missing',
      config: { ...cfg, type: 'natural', questionStyle: 'missing' },
      explanation
    };
  }

  function generateWordProblem(cfg = {}) {
    const grade = cfg.grade ? Number(cfg.grade) : null;
    let ops = (Array.isArray(cfg.ops) && cfg.ops.length ? cfg.ops : ['+', '-', '*']).filter(op => ['+', '-', '*', '/'].includes(op));
    if (grade === 1) ops = ops.filter(op => op === '+' || op === '-');
    const op = pickOne(ops.length ? ops : ['+']);
    const [lo, hi] = grade === 1 ? [1, 9] : grade === 2 ? [5, 35] : rangeForDigits(cfg.digits);
    const itemsVi = ['viên bi', 'cái kẹo', 'quyển vở', 'bút chì', 'bông hoa'];
    const itemsEn = ['marbles', 'candies', 'notebooks', 'pencils', 'flowers'];
    const idx = randInt(0, itemsVi.length - 1);
    const item = typeof lang !== 'undefined' && lang === 'en' ? itemsEn[idx] : itemsVi[idx];

    let q = '', ans = 0, explanation = '';
    if (op === '+') {
      const a = grade === 1 ? randInt(1, 9) : randInt(lo, hi);
      const b = grade === 1 ? randInt(1, Math.max(1, 10 - a)) : randInt(lo, hi);
      ans = a + b;
      q = t(
        `Lan có ${a} ${item}, được tặng thêm ${b} ${item}. Hỏi Lan có tất cả bao nhiêu ${item}?`,
        `Lan has ${a} ${item} and gets ${b} more. How many ${item} does she have in total?`
      );
      explanation = `${a} + ${b} = ${ans}`;
    } else if (op === '-') {
      const b = grade === 1 ? randInt(1, 7) : randInt(lo, hi);
      const ansVal = grade === 1 ? randInt(1, Math.max(1, 10 - b)) : randInt(1, hi);
      const a = b + ansVal;
      ans = ansVal;
      q = t(
        `Minh có ${a} ${item}, cho bạn ${b} ${item}. Hỏi Minh còn lại bao nhiêu ${item}?`,
        `Minh has ${a} ${item} and gives away ${b} ${item}. How many ${item} are left?`
      );
      explanation = `${a} − ${b} = ${ans}`;
    } else if (op === '*') {
      const boxes = grade === 2 ? pickOne([2, 5]) : randInt(2, 9);
      const each = grade === 2 ? randInt(2, 10) : randInt(2, grade === 3 ? 9 : Math.min(12, hi));
      ans = boxes * each;
      q = t(
        `Có ${boxes} hộp, mỗi hộp đựng ${each} ${item}. Hỏi có tất cả bao nhiêu ${item}?`,
        `There are ${boxes} boxes with ${each} ${item} each. How many ${item} in total?`
      );
      explanation = `${boxes} × ${each} = ${ans}`;
    } else {
      const groups = grade === 2 ? pickOne([2, 5]) : randInt(2, 9);
      const each = grade === 2 ? randInt(2, 10) : randInt(2, grade === 3 ? 9 : Math.min(12, hi));
      const total = groups * each;
      ans = each;
      q = t(
        `Chia đều ${total} ${item} vào ${groups} phần. Hỏi mỗi phần có bao nhiêu ${item}?`,
        `Share ${total} ${item} equally into ${groups} groups. How many ${item} in each group?`
      );
      explanation = `${total} ÷ ${groups} = ${ans}`;
    }

    return {
      id: typeof uid === 'function' ? uid() : 'w_' + Math.random().toString(36).slice(2),
      q,
      answer: String(ans),
      options: uniqueOptions(ans, [ans + 1, ans - 1, ans + 2, ans + 5]),
      skill: 'natural:word',
      config: { ...cfg, type: 'natural', questionStyle: 'word' },
      explanation
    };
  }

  // ---------------- Visual Math SVG Helper ----------------
  function buildVisualMathSvg(q) {
    if (!q || !q.q) return '';
    const raw = String(q.q).replaceAll('(', '').replaceAll(')', '').trim();

    // 1. Number line for small addition/subtraction (including negative numbers)
    const numMatch = raw.match(/^(-?\d+)\s*([+−-])\s*(-?\d+)$/);
    if (numMatch) {
      const a = Number(numMatch[1]), op = numMatch[2] === '+' ? '+' : '-', b = Number(numMatch[3]);
      const res = op === '+' ? a + b : a - b;
      if (Math.abs(a) <= 20 && Math.abs(b) <= 20 && Math.abs(res) <= 20) {
        const minV = Math.min(a, res, 0) - 1;
        const maxV = Math.max(a, res, 0) + 1;
        const span = Math.max(4, maxV - minV);
        const xOf = v => 24 + ((v - minV) / span) * 292;
        const x1 = xOf(a), x2 = xOf(res), midX = (x1 + x2) / 2;
        const ticks = [];
        const step = span > 14 ? 2 : 1;
        for (let v = minV; v <= maxV; v += step) {
          const tx = xOf(v);
          ticks.push(`<line x1="${tx}" y1="54" x2="${tx}" y2="62" stroke="#5b7564" stroke-width="1.5"/><text x="${tx}" y="76" font-size="10" text-anchor="middle" fill="#466050">${v}</text>`);
        }
        return `<div class="visual-math-box"><small>${t('Minh họa trên trục số:', 'Number line visual:')}</small><svg viewBox="0 0 340 86" class="visual-math-svg" role="img" aria-label="${t('Trục số minh họa', 'Number line diagram')}"><line x1="16" y1="58" x2="324" y2="58" stroke="#5b7564" stroke-width="2"/>${ticks.join('')}<path d="M ${x1} 52 Q ${midX} 16 ${x2} 52" fill="none" stroke="#d97706" stroke-width="2.5" stroke-dasharray="4 3"/><circle cx="${x1}" cy="58" r="4.5" fill="#2563eb"/><circle cx="${x2}" cy="58" r="5" fill="#16a34a"/><text x="${midX}" y="22" font-size="11" font-weight="700" text-anchor="middle" fill="#b45309">${op === '+' ? '+' : '−'}${Math.abs(b)}</text></svg></div>`;
      }
    }

    // 2. Fraction bars for fraction operations
    const fracMatch = raw.match(/^(\d+)\/(\d+)\s*([+−\-×÷*\/])\s*(\d+)\/(\d+)$/);
    if (fracMatch) {
      const n1 = Number(fracMatch[1]), d1 = Number(fracMatch[2]), n2 = Number(fracMatch[4]), d2 = Number(fracMatch[5]);
      if (d1 > 1 && d1 <= 12 && d2 > 1 && d2 <= 12) {
        const bar = (n, d, y, color) => {
          const w = 220 / d;
          return Array.from({ length: d }, (_, i) => `<rect x="${20 + i * w}" y="${y}" width="${w - 1.5}" height="18" rx="3" fill="${i < n ? color : '#e5ede6'}" stroke="#9cb8a4" stroke-width="1"/>`).join('') + `<text x="252" y="${y + 13}" font-size="12" font-weight="700" fill="#355240">${n}/${d}</text>`;
        };
        return `<div class="visual-math-box"><small>${t('Minh họa thanh phân số:', 'Fraction bar visual:')}</small><svg viewBox="0 0 300 62" class="visual-math-svg" role="img" aria-label="${t('Thanh phân số minh họa', 'Fraction bar diagram')}">${bar(n1, d1, 8, '#3b82f6')}${bar(n2, d2, 34, '#10b981')}</svg></div>`;
      }
    }
    return '';
  }

  // ---------------- Wrap generate() ----------------
  const generateBeforePedagogy = typeof generate === 'function' ? generate : null;
  if (generateBeforePedagogy) {
    generate = function (cfg) {
      const c = cfg || (typeof window !== 'undefined' && window.config) || config;
      if (c && c.questionStyle === 'missing') return generateMissingNumber(c);
      if (c && c.questionStyle === 'word') return generateWordProblem(c);
      return generateBeforePedagogy(c);
    };
    if (typeof window !== 'undefined') window.generate = generate;
    if (typeof global !== 'undefined') global.generate = generate;
  }

  // ---------------- Wrap setup() to expose new question styles ----------------
  const setupBeforePedagogy = typeof setup === 'function' ? setup : null;
  if (setupBeforePedagogy) {
    setup = function () {
      setupBeforePedagogy();
      const select = $('#config select[name="questionStyle"]');
      if (select && !select.querySelector('option[value="missing"]')) {
        select.insertAdjacentHTML('beforeend', `
          <option value="missing">${t('Tìm thành phần phép tính còn thiếu (?)', 'Missing number in calculation (?)')}</option>
        `);
        if (config.questionStyle === 'word') config.questionStyle = 'normal';
        if (config.questionStyle === 'missing') {
          select.value = config.questionStyle;
        }
      }
      const form = $('#config');
      const terms = form?.elements?.termCount;
      if (select && terms) {
        const prevChange = select.onchange;
        select.onchange = () => {
          if (prevChange) prevChange();
          if (select.value === 'missing' || select.value === 'word') terms.disabled = true;
        };
        select.onchange();
      }
    };
  }

  // ---------------- Wrap answerQuiz() to append Visual Math on wrong answer ----------------
  const answerBeforePedagogy = typeof answerQuiz === 'function' ? answerQuiz : null;
  if (answerBeforePedagogy) {
    answerQuiz = function (ans, questionId) {
      const qBefore = session?.questions?.[session.index];
      answerBeforePedagogy(ans, questionId);
      const panel = $('#workedAnswer');
      const cardHasFigure = Boolean($('#quizCard .q-inline-figure'));
      if (panel && !panel.hidden && qBefore && !cardHasFigure && !panel.querySelector('.visual-math-box')) {
        const svgHtml = buildVisualMathSvg(qBefore);
        if (svgHtml) {
          const btn = panel.querySelector('#nextQuizBtn');
          if (btn) btn.insertAdjacentHTML('beforebegin', svgHtml);
          else panel.insertAdjacentHTML('beforeend', svgHtml);
        }
      }
    };
  }

  // ---------------- Spaced Repetition for Mistakes Garden ----------------
  function prioritizeMistakesByDue(mistakes) {
    if (!Array.isArray(mistakes)) return [];
    const now = Date.now();
    return [...mistakes].sort((a, b) => {
      const aDue = (a.nextReviewAt || 0) <= now ? 0 : 1;
      const bDue = (b.nextReviewAt || 0) <= now ? 0 : 1;
      if (aDue !== bDue) return aDue - bDue;
      return (a.nextReviewAt || 0) - (b.nextReviewAt || 0);
    });
  }

  const startReviewBeforePedagogy = typeof startReview === 'function' ? startReview : null;
  if (startReviewBeforePedagogy) {
    startReview = function () {
      if (Array.isArray(state?.mistakes) && state.mistakes.length > 1) {
        state.mistakes = prioritizeMistakesByDue(state.mistakes);
      }
      startReviewBeforePedagogy();
    };
  }

  const style = document.createElement('style');
  style.textContent = `
    .visual-math-box{margin-top:10px;padding:10px;border-radius:12px;background:rgba(52,118,92,.06);border:1px solid rgba(52,118,92,.18);text-align:center}
    .visual-math-box small{display:block;font-weight:700;color:#466050;margin-bottom:4px}
    .visual-math-svg{width:100%;max-width:340px;height:auto;display:block;margin:0 auto}
    body.dark-mode .visual-math-box{background:#18241e;border-color:#2f4d3d}
    body.dark-mode .visual-math-box small{color:#a8bfb0}
  `;
  document.head.append(style);

  if (typeof window !== 'undefined') {
    window.generateMissingNumber = generateMissingNumber;
    window.generateWordProblem = generateWordProblem;
    window.buildVisualMathSvg = buildVisualMathSvg;
    window.prioritizeMistakesByDue = prioritizeMistakesByDue;
  }
  if (typeof global !== 'undefined') {
    global.generateMissingNumber = generateMissingNumber;
    global.generateWordProblem = generateWordProblem;
    global.buildVisualMathSvg = buildVisualMathSvg;
    global.prioritizeMistakesByDue = prioritizeMistakesByDue;
  }
})();
