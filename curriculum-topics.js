// MOET GDPT 2018 (KNTT / CTST / Cánh Diều) Grade 1-9 Topic Streams, Grade 1-5 Deep Exam Pack & Multi-Topic Synthesis (v2.10.0)
(() => {
  'use strict';

  function rInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function pickAny(arr) {
    return arr[rInt(0, arr.length - 1)];
  }
  function gcd2(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    return b ? gcd2(b, a % b) : a;
  }
  function lcm2(a, b) {
    return Math.abs(a * b) / (gcd2(a, b) || 1);
  }
  function fmtNum(n) {
    if (typeof fmt === 'function') return fmt(n);
    return String(Math.round(n * 10000) / 10000);
  }
  function buildOpts(answer, near = [], allowNeg = false) {
    const ansStr = String(answer);
    if (typeof antiTrickOptions === 'function') {
      return antiTrickOptions(ansStr, near, { allowNegative: !!allowNeg });
    }
    const set = new Set([ansStr]);
    const pushVal = v => {
      if (v === undefined || v === null) return;
      const s = typeof v === 'number' ? fmtNum(v) : String(v);
      if (!s || s === 'NaN') return;
      if (!allowNeg && s.startsWith('-')) return;
      set.add(s);
    };
    near.forEach(pushVal);
    const numVal = parseFloat(ansStr.replace(',', '.'));
    const isDec = ansStr.includes(',') || ansStr.includes('.');
    const step = isDec ? 0.5 : 1;
    let d = 1;
    while (set.size < 4 && d < 60) {
      if (Number.isFinite(numVal)) {
        pushVal(Math.round((numVal + d * step) * 1000) / 1000);
        if (set.size < 4) pushVal(Math.round((numVal - d * step) * 1000) / 1000);
      } else {
        pushVal(d);
      }
      d++;
    }
    const list = Array.from(set).slice(0, 4);
    return typeof shuffle === 'function' ? shuffle(list) : list.sort(() => Math.random() - 0.5);
  }

  const NUMI_GRADE_TOPICS = {
    1: [
      { id: 'all', vi: 'Tổng hợp tất cả dạng Lớp 1', en: 'All Grade 1 Mixed' },
      { id: 'g1_within10', vi: 'Cộng trừ PV 10', en: 'Add/Sub ≤10' },
      { id: 'g1_round10', vi: 'Cộng trừ tròn chục', en: 'Round tens' },
      { id: 'g1_col100', vi: 'Đặt tính PV 100 (không nhớ)', en: 'Column ±100', col: true },
      { id: 'g1_place_cmp', vi: 'Cấu tạo số & Liền trước/sau', en: 'Place Value & Order' },
      { id: 'g1_two_step', vi: 'Tính 2 bước, Đo cm & Xem giờ', en: '2-Step, cm & Clock' },
      { id: 'g1_missing', vi: 'Điền số ? thích hợp', en: 'Missing Number ?' },
      { id: 'g1_word', vi: 'Toán lời văn Lớp 1', en: 'Grade 1 Word Problems' }
    ],
    2: [
      { id: 'all', vi: 'Tổng hợp tất cả dạng Lớp 2', en: 'All Grade 2 Mixed' },
      { id: 'g2_carry20', vi: 'Cộng trừ có nhớ PV 20', en: 'Carry/Borrow ≤20' },
      { id: 'g2_col100', vi: 'Đặt tính có nhớ PV 100', en: 'Column ±100 (carry)', col: true },
      { id: 'g2_col1000', vi: 'Đặt tính PV 1.000', en: 'Column ≤1,000', col: true },
      { id: 'g2_mul25', vi: 'Bảng nhân & chia 2, 5', en: '×2, ×5, ÷2, ÷5' },
      { id: 'g2_find_x', vi: 'Tìm thành phần chưa biết (?)', en: 'Find Missing Term' },
      { id: 'g2_units', vi: 'Đổi đơn vị (dm, cm, m, giờ)', en: 'Length & Time Units' },
      { id: 'g2_geom_time', vi: 'Đường gấp khúc & Giờ 24h', en: 'Polyline & 24h Clock' },
      { id: 'g2_word', vi: 'Lời văn Nhiều hơn / Ít hơn', en: 'More/Less Word Problems' }
    ],
    3: [
      { id: 'all', vi: 'Tổng hợp tất cả dạng Lớp 3', en: 'All Grade 3 Mixed' },
      { id: 'g3_tables', vi: 'Bảng nhân chia 2–9', en: 'Times tables 2–9' },
      { id: 'g3_col10k', vi: 'Đặt tính ± đến 10.000', en: 'Column ±10,000', col: true },
      { id: 'g3_mul1', vi: 'Đặt tính ×/÷ với 1 chữ số', en: '2-3d ×/÷ 1d', col: true },
      { id: 'g3_rem', vi: 'Phép chia có dư', en: 'Remainders' },
      { id: 'g3_expr', vi: 'Biểu thức (có ngoặc)', en: 'Expressions & Brackets' },
      { id: 'g3_find_x', vi: 'Tìm x (4 phép tính)', en: 'Solve for x' },
      { id: 'g3_geom', vi: 'Chu vi & Diện tích (Vuông, HCN)', en: 'Perimeter & Area' },
      { id: 'g3_fold_word', vi: 'Gấp/Giảm số lần & Rút đơn vị', en: 'Multiples & Unitary' },
      { id: 'g3_units', vi: 'Đổi đơn vị (m, km, kg, g)', en: 'Units (m, km, kg, g)' }
    ],
    4: [
      { id: 'all', vi: 'Tổng hợp tất cả dạng Lớp 4', en: 'All Grade 4 Mixed' },
      { id: 'g4_col', vi: 'Đặt tính ± nhiều chữ số', en: 'Multi-digit Column ±', col: true },
      { id: 'g4_mul2', vi: 'Đặt tính ×/÷ với 2 chữ số', en: '×/÷ by 2 digits', col: true },
      { id: 'g4_conv', vi: 'Tính bằng cách thuận tiện', en: 'Convenient Mental Math' },
      { id: 'g4_frac', vi: 'Phân số (+, −, ×, ÷)', en: 'Fractions' },
      { id: 'g4_sum_diff', vi: 'Tổng – Hiệu & Phân số của số', en: 'Sum-Diff & Fraction of N' },
      { id: 'g4_geom', vi: 'Hình học (Bình hành, Thoi, HCN)', en: 'Parallelogram & Rhombus' },
      { id: 'g4_avg', vi: 'Trung bình cộng & Đổi đơn vị', en: 'Average & Units' },
      { id: 'g4_div_rules', vi: 'Chia hết (2,3,5,9) & Thế kỉ/Giây', en: 'Divisibility & Century' }
    ],
    5: [
      { id: 'all', vi: 'Tổng hợp tất cả dạng Lớp 5', en: 'All Grade 5 Mixed' },
      { id: 'g5_dec_col', vi: 'Đặt tính ± số thập phân', en: 'Column Decimal ±', col: true },
      { id: 'g5_dec10', vi: 'Nhân/chia nhẩm 10, 100, 0,1', en: 'Decimal ×/÷ 10, 100' },
      { id: 'g5_dec_muldiv', vi: 'Tính thuận tiện & Chia thập phân', en: 'Decimal Mental & Division' },
      { id: 'g5_pct', vi: 'Tỉ số phần trăm (3 dạng)', en: 'Percentages (3 types)' },
      { id: 'g5_geom', vi: 'Hình học (Tam giác, Thang, Tròn, V)', en: 'Triangle, Circle & Volume' },
      { id: 'g5_sum_ratio', vi: 'Tổng–Tỉ, Hiệu–Tỉ & Hỗn số', en: 'Ratios & Mixed Numbers' },
      { id: 'g5_units', vi: 'Đổi đơn vị (ha, m², giờ/phút)', en: 'Area & Time Units' },
      { id: 'g5_motion', vi: 'Toán chuyển động (v, s, t)', en: 'Speed · Distance · Time' }
    ],
    6: [
      { id: 'all', vi: 'Tổng hợp Lớp 6', en: 'All Grade 6' },
      { id: 'g6_int', vi: 'Số nguyên âm Z (+, −, ×, ÷)', en: 'Signed Integers Z' },
      { id: 'g6_pow', vi: 'Lũy thừa số mũ tự nhiên', en: 'Natural Powers (aⁿ)' },
      { id: 'g6_findx', vi: 'Tìm x (chuyển vế, ngoặc)', en: 'Solve for x' },
      { id: 'g6_frac', vi: 'Phân số & Thập phân', en: 'Fractions & Decimals' },
      { id: 'g6_div', vi: 'ƯCLN & BCNN', en: 'GCD & LCM' }
    ],
    7: [
      { id: 'all', vi: 'Tổng hợp Lớp 7', en: 'All Grade 7' },
      { id: 'g7_rat', vi: 'Số hữu tỉ Q & Lũy thừa', en: 'Rationals & Powers' },
      { id: 'g7_ratio', vi: 'Tỉ lệ thức & Dãy tỉ số', en: 'Proportions' },
      { id: 'g7_sqrt_abs', vi: 'Căn bậc hai & Trị tuyệt đối', en: 'Square Root & |x|' },
      { id: 'g7_alg', vi: 'Giá trị biểu thức & Đa thức', en: 'Polynomials' }
    ],
    8: [
      { id: 'all', vi: 'Tổng hợp Lớp 8', en: 'All Grade 8' },
      { id: 'g8_id', vi: '7 Hằng đẳng thức tính nhanh', en: 'Algebraic Identities' },
      { id: 'g8_eq', vi: 'Giải phương trình bậc nhất', en: 'Linear Equations' },
      { id: 'g8_poly', vi: 'Đa thức & Phân thức', en: 'Polynomials & Fractions' },
      { id: 'g8_rat', vi: 'Số hữu tỉ & Lũy thừa', en: 'Rationals & Powers' }
    ],
    9: [
      { id: 'all', vi: 'Tổng hợp Lớp 9', en: 'All Grade 9' },
      { id: 'g9_sqrt', vi: 'Biến đổi Căn bậc hai', en: 'Square Root Expressions' },
      { id: 'g9_cbrt', vi: 'Căn bậc ba (∛)', en: 'Cube Roots (∛)' },
      { id: 'g9_eq', vi: 'PT vô tỷ & Hệ thức Vi-ét', en: 'Radical Eq & Vieta' },
      { id: 'g9_func', vi: 'Hàm số y = ax + b', en: 'Linear Functions' }
    ]
  };

  function getTopicMeta(topicId, gradeHint) {
    const g = Number(gradeHint);
    if (g && NUMI_GRADE_TOPICS[g]) {
      const hit = NUMI_GRADE_TOPICS[g].find(x => x.id === topicId);
      if (hit) return hit;
    }
    for (const list of Object.values(NUMI_GRADE_TOPICS)) {
      const hit = list.find(x => x.id === topicId);
      if (hit) return hit;
    }
    return null;
  }

  function formatTopicBadge(topicId, gradeHint) {
    const meta = getTopicMeta(topicId, gradeHint);
    if (!meta || meta.id === 'all') return '';
    const label = typeof lang !== 'undefined' && lang === 'en' ? meta.en : meta.vi;
    return `${meta.col ? '📐 ' : '🎯 '}${label}`;
  }

  function makeQ(q, answer, near, skill, cfg, explanation, extra = {}) {
    const allowNeg = extra.allowNeg || String(answer).startsWith('-');
    return {
      id: typeof uid === 'function' ? uid() : 'tp_' + Math.random().toString(36).slice(2),
      q,
      answer: String(answer),
      options: extra.exactOptions || buildOpts(answer, near, allowNeg),
      skill,
      config: { ...cfg },
      explanation,
      columnReady: Boolean(extra.columnReady),
      topicId: extra.topicId || cfg.topic || null,
      topicLabel: extra.topicLabel || ''
    };
  }

  function tagTopic(qObj, topicId, g) {
    if (!qObj) return qObj;
    qObj.topicId = topicId;
    qObj.topicLabel = formatTopicBadge(topicId, g);
    return qObj;
  }

  function generateTopicQuestion(topicId, cfg) {
    const g = Number(cfg.grade) || 1;
    let res = null;
    switch (topicId) {
      // ---------- GRADE 1 ----------
      case 'g1_within10': {
        const isAdd = Math.random() < 0.55;
        if (isAdd) {
          const a = rInt(1, 9), b = rInt(1, 10 - a), ans = a + b;
          res = makeQ(`${a} + ${b}`, ans, [ans + 1, ans - 1, ans + 2], 'natural:+', cfg, `${a} + ${b} = ${ans}`);
        } else {
          const a = rInt(2, 10), b = rInt(1, a), ans = a - b;
          res = makeQ(`${a} − ${b}`, ans, [ans + 1, Math.max(0, ans - 1), ans + 2], 'natural:-', cfg, `${a} − ${b} = ${ans}`);
        }
        break;
      }
      case 'g1_round10': {
        const isAdd = Math.random() < 0.55;
        if (isAdd) {
          const a = rInt(1, 8) * 10, b = rInt(1, Math.floor((100 - a) / 10)) * 10, ans = a + b;
          res = makeQ(`${a} + ${b}`, ans, [ans + 10, Math.max(0, ans - 10), ans + 20], 'natural:+', cfg, `${a / 10} chục + ${b / 10} chục = ${ans / 10} chục = ${ans}`);
        } else {
          const a = rInt(2, 9) * 10, b = rInt(1, a / 10 - 1) * 10, ans = a - b;
          res = makeQ(`${a} − ${b}`, ans, [ans + 10, Math.max(0, ans - 10), ans + 20], 'natural:-', cfg, `${a / 10} chục − ${b / 10} chục = ${ans / 10} chục = ${ans}`);
        }
        break;
      }
      case 'g1_col100': {
        const isAdd = Math.random() < 0.55;
        if (isAdd) {
          const a10 = rInt(1, 7), a1 = rInt(1, 8), b10 = rInt(1, 9 - a10), b1 = rInt(1, 9 - a1);
          const a = a10 * 10 + a1, b = b10 * 10 + b1, ans = a + b;
          res = makeQ(`${a} + ${b}`, ans, [ans + 10, ans - 10, ans + 1], 'natural:+', cfg,
            t(`Đặt tính thẳng cột (không nhớ):\n• Hàng đơn vị: ${a1} + ${b1} = ${a1 + b1}\n• Hàng chục: ${a10} + ${b10} = ${a10 + b10}\n→ Kết quả: ${ans}`, `Ones: ${a1}+${b1}=${a1 + b1}; Tens: ${a10}+${b10}=${a10 + b10} → ${ans}`),
            { columnReady: true });
        } else {
          const a10 = rInt(2, 9), a1 = rInt(2, 9), b10 = rInt(1, a10 - 1), b1 = rInt(1, a1);
          const a = a10 * 10 + a1, b = b10 * 10 + b1, ans = a - b;
          res = makeQ(`${a} − ${b}`, ans, [ans + 10, Math.max(0, ans - 10), ans + 1], 'natural:-', cfg,
            t(`Đặt tính thẳng cột (không nhớ):\n• Hàng đơn vị: ${a1} − ${b1} = ${a1 - b1}\n• Hàng chục: ${a10} − ${b10} = ${a10 - b10}\n→ Kết quả: ${ans}`, `Ones: ${a1}-${b1}=${a1 - b1}; Tens: ${a10}-${b10}=${a10 - b10} → ${ans}`),
            { columnReady: true });
        }
        break;
      }
      case 'g1_place_cmp': {
        const kind = pickAny(['compose', 'next', 'prev', 'maxmin']);
        if (kind === 'compose') {
          const tens = rInt(2, 9), ones = rInt(1, 9), ans = tens * 10 + ones;
          res = makeQ(t(`Số gồm ${tens} chục và ${ones} đơn vị là ?`, `Number with ${tens} tens and ${ones} ones is ?`), ans, [ones * 10 + tens, ans + 10, ans - 10], 'natural:place', cfg, `${tens} chục = ${tens * 10}; thêm ${ones} đơn vị → ${tens * 10} + ${ones} = ${ans}`);
        } else if (kind === 'next') {
          const n = rInt(10, 98), ans = n + 1;
          res = makeQ(t(`Số liền sau của ${n} là ?`, `Number right after ${n} is ?`), ans, [n - 1, n + 10, n + 2], 'natural:order', cfg, `Số liền sau hơn số đó 1 đơn vị: ${n} + 1 = ${ans}`);
        } else if (kind === 'prev') {
          const n = rInt(12, 99), ans = n - 1;
          res = makeQ(t(`Số liền trước của ${n} là ?`, `Number right before ${n} is ?`), ans, [n + 1, Math.max(1, n - 10), Math.max(1, n - 2)], 'natural:order', cfg, `Số liền trước kém số đó 1 đơn vị: ${n} − 1 = ${ans}`);
        } else {
          // Use 4 distinct tens with SAME ones digit so kids compare tens place cleanly (and anti-guessing passes!)
          const ones = rInt(1, 9);
          const tensPool = [2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5).slice(0, 4);
          const nums = tensPool.map(tn => tn * 10 + ones);
          const askMax = Math.random() < 0.55;
          const ans = askMax ? Math.max(...nums) : Math.min(...nums);
          const opts = typeof shuffle === 'function' ? shuffle(nums.map(String)) : nums.map(String);
          res = makeQ(
            askMax
              ? t(`Số lớn nhất trong các số ${nums.join(', ')} là ?`, `Largest of ${nums.join(', ')} is ?`)
              : t(`Số bé nhất trong các số ${nums.join(', ')} là ?`, `Smallest of ${nums.join(', ')} is ?`),
            ans, [], 'natural:cmp', cfg,
            t(`So sánh chữ số hàng chục của các số ${nums.join(', ')} → đáp án là ${ans}.`, `Compare the tens digits of ${nums.join(', ')} → ${ans}.`),
            { exactOptions: opts }
          );
        }
        break;
      }
      case 'g1_two_step': {
        const kind = pickAny(['expr', 'cm', 'clock']);
        if (kind === 'expr') {
          const a = rInt(11, 18), b = rInt(1, a - 10), c = rInt(1, 9 - (a - b - 10));
          const ans = a - b + c;
          res = makeQ(`${a} − ${b} + ${c}`, ans, [ans + 1, Math.max(1, ans - 1), ans + 2], 'natural:expression', cfg, `Tính từ trái sang phải:\n• ${a} − ${b} = ${a - b}\n• ${a - b} + ${c} = ${ans}`);
        } else if (kind === 'cm') {
          const a10 = rInt(1, 4), a1 = rInt(1, 5), b10 = rInt(1, 4), b1 = rInt(1, 9 - a1);
          const a = a10 * 10 + a1, b = b10 * 10 + b1, ans = a + b;
          res = makeQ(t(`Tính: ${a} cm + ${b} cm = ? cm`, `${a} cm + ${b} cm = ? cm`), ans, [ans + 10, ans - 10, ans + 20], 'units:len', cfg, `${a} + ${b} = ${ans} cm`);
        } else {
          const h = rInt(2, 9), add = rInt(1, 3), ans = h + add;
          res = makeQ(t(`Bây giờ là ${h} giờ, ${add} giờ nữa là ? giờ`, `It is ${h} o'clock now; in ${add} hours it is ? o'clock`), ans, [ans + 1, Math.max(1, ans - 1), h - add > 0 ? h - add : ans + 2], 'units:time', cfg, `${h} giờ + ${add} giờ = ${ans} giờ`);
        }
        break;
      }
      case 'g1_missing': {
        if (Math.random() < 0.55) {
          const a = rInt(11, 45), b = rInt(1, 9 - (a % 10));
          const sum = a + b;
          res = makeQ(`${a} + ? = ${sum}`, b, [b + 1, Math.max(1, b - 1), b + 2], 'natural:missing', cfg, `Muốn tìm số còn thiếu: ${sum} − ${a} = ${b}`);
        } else {
          const b = rInt(2, 8), ans = rInt(1, 9 - b), a = 10 + b + ans;
          res = makeQ(`${a} − ? = ${10 + b}`, ans, [ans + 1, Math.max(1, ans - 1), ans + 2], 'natural:missing', cfg, `${a} − ${10 + b} = ${ans}`);
        }
        break;
      }
      case 'g1_word': {
        const scenarios = [
          () => {
            const a = rInt(11, 24), b = rInt(2, 9 - (a % 10)), ans = a + b;
            return makeQ(t(`Lan có ${a} quyển vở, mẹ mua thêm ${b} quyển. Lan có tất cả ? quyển`, `Lan had ${a} notebooks and got ${b} more. Total = ?`), ans, [ans + 10, Math.max(1, ans - 10), ans + 1], 'word:+', cfg, `Phép cộng: ${a} + ${b} = ${ans} (quyển vở)`);
          },
          () => {
            const a10 = rInt(2, 5), a1 = rInt(4, 9), b1 = rInt(1, a1 - 1), a = a10 * 10 + a1, ans = a - b1;
            return makeQ(t(`Trên cây có ${a} quả táo, chim ăn mất ${b1} quả. Còn lại ? quả`, `A tree had ${a} apples, ${b1} were eaten. Left = ?`), ans, [ans + 10, Math.max(1, ans - 10), ans + 1], 'word:-', cfg, `Phép trừ: ${a} − ${b1} = ${ans} (quả táo)`);
          },
          () => {
            const a = rInt(2, 5) * 10, b = rInt(1, 4) * 10, ans = a + b;
            return makeQ(t(`Tổ Một trồng ${a} cây, Tổ Hai trồng ${b} cây. Cả hai tổ trồng ? cây`, `Team 1 planted ${a} trees, Team 2 planted ${b}. Total = ?`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'word:+', cfg, `Cả hai tổ trồng: ${a} + ${b} = ${ans} (cây)`);
          }
        ];
        res = pickAny(scenarios)();
        break;
      }

      // ---------- GRADE 2 ----------
      case 'g2_carry20': {
        if (Math.random() < 0.55) {
          const a = rInt(5, 9), b = rInt(11 - a, 9), ans = a + b;
          res = makeQ(`${a} + ${b}`, ans, [ans - 1, ans + 1, ans - 10], 'natural:+', cfg,
            t(`Tách để gộp tròn 10: ${a} + ${10 - a} = 10, còn ${b - (10 - a)} → 10 + ${b - (10 - a)} = ${ans}`, `Make 10 first: ${a} + ${10 - a} = 10 → ${ans}`));
        } else {
          const a = rInt(11, 18), b = rInt(a - 9, 9), ans = a - b;
          res = makeQ(`${a} − ${b}`, ans, [ans + 1, Math.max(0, ans - 1), ans + 2], 'natural:-', cfg,
            t(`Trừ để được 10 trước: ${a} − ${a - 10} = 10, trừ tiếp ${b - (a - 10)} → ${ans}`, `Subtract to 10 first → ${ans}`));
        }
        break;
      }
      case 'g2_col100': {
        if (Math.random() < 0.55) {
          const a1 = rInt(4, 9), b1 = rInt(10 - a1, 9);
          const a10 = rInt(1, 6), b10 = rInt(1, 8 - a10);
          const a = a10 * 10 + a1, b = b10 * 10 + b1, ans = a + b;
          res = makeQ(`${a} + ${b}`, ans, [ans - 10, ans + 10, ans + 1], 'natural:+', cfg,
            t(`Đặt tính có nhớ:\n• Đơn vị: ${a1} + ${b1} = ${a1 + b1}, viết ${(a1 + b1) % 10} nhớ 1\n• Chục: ${a10} + ${b10} + 1 = ${a10 + b10 + 1} → ${ans}`, `Carry 1 to tens → ${ans}`),
            { columnReady: true });
        } else {
          const a1 = rInt(0, 7), b1 = rInt(a1 + 1, 9);
          const a10 = rInt(3, 9), b10 = rInt(1, a10 - 1);
          const a = a10 * 10 + a1, b = b10 * 10 + b1, ans = a - b;
          res = makeQ(`${a} − ${b}`, ans, [ans + 10, Math.max(0, ans - 10), ans + 1], 'natural:-', cfg,
            t(`Đặt tính có nhớ:\n• Đơn vị: ${10 + a1} − ${b1} = ${10 + a1 - b1}, nhớ 1 sang hàng chục\n• Chục: ${a10} − ${b10} − 1 = ${a10 - b10 - 1} → ${ans}`, `Borrow 1 ten → ${ans}`),
            { columnReady: true });
        }
        break;
      }
      case 'g2_col1000': {
        if (Math.random() < 0.55) {
          const a = rInt(12, 65) * 10 + rInt(0, 4), b = rInt(11, 32) * 10 + rInt(0, 5), ans = a + b;
          res = makeQ(`${a} + ${b}`, ans, [ans + 10, ans - 10, ans + 100], 'natural:+', cfg,
            t(`Đặt tính thẳng cột hàng trăm, chục, đơn vị: ${a} + ${b} = ${ans}`, `Align columns: ${a} + ${b} = ${ans}`),
            { columnReady: true });
        } else {
          const b = rInt(11, 45) * 10 + rInt(0, 4), ans = rInt(12, 48) * 10 + rInt(0, 5), a = b + ans;
          res = makeQ(`${a} − ${b}`, ans, [ans + 10, Math.max(0, ans - 10), ans + 100], 'natural:-', cfg,
            t(`Đặt tính thẳng cột hàng trăm, chục, đơn vị: ${a} − ${b} = ${ans}`, `Align columns: ${a} − ${b} = ${ans}`),
            { columnReady: true });
        }
        break;
      }
      case 'g2_mul25': {
        const f = pickAny([2, 5]), k = rInt(1, 10);
        if (Math.random() < 0.55) {
          res = makeQ(`${f} × ${k}`, f * k, [f * (k + 1), Math.max(1, f * (k - 1)), f + k], 'natural:*', cfg, `${f} × ${k} = ${f * k}`);
        } else {
          res = makeQ(`${f * k} ÷ ${f}`, k, [k + 1, Math.max(1, k - 1), k + 2], 'natural:/', cfg, `${f * k} ÷ ${f} = ${k} (vì ${f} × ${k} = ${f * k})`);
        }
        break;
      }
      case 'g2_find_x': {
        const kind = pickAny(['addend', 'minuend', 'subtrahend']);
        if (kind === 'addend') {
          const xVal = rInt(14, 48), b = rInt(12, 39), sum = xVal + b;
          res = makeQ(`? + ${b} = ${sum}`, xVal, [xVal + 10, Math.max(1, xVal - 10), sum + b], 'natural:missing', cfg, `Muốn tìm số hạng chưa biết, lấy tổng trừ số hạng đã biết:\n${sum} − ${b} = ${xVal}`);
        } else if (kind === 'minuend') {
          const b = rInt(14, 38), diff = rInt(15, 45), xVal = b + diff;
          res = makeQ(`? − ${b} = ${diff}`, xVal, [xVal + 10, Math.max(1, xVal - 10), Math.abs(diff - b)], 'natural:missing', cfg, `Muốn tìm số bị trừ, lấy hiệu cộng số trừ:\n${diff} + ${b} = ${xVal}`);
        } else {
          const xVal = rInt(12, 42), diff = rInt(14, 45), a = xVal + diff;
          res = makeQ(`${a} − ? = ${diff}`, xVal, [xVal + 10, Math.max(1, xVal - 10), a + diff], 'natural:missing', cfg, `Muốn tìm số trừ, lấy số bị trừ trừ đi hiệu:\n${a} − ${diff} = ${xVal}`);
        }
        break;
      }
      case 'g2_units': {
        const kind = pickAny(['dm_cm', 'm_dm', 'hr_min']);
        if (kind === 'dm_cm') {
          const v = rInt(2, 9);
          res = makeQ(t(`Đổi: ${v} dm = ? cm`, `Convert: ${v} dm = ? cm`), v * 10, [v * 100, v + 10, v * 10 + 10], 'units:len', cfg, `1 dm = 10 cm → ${v} dm = ${v} × 10 = ${v * 10} cm`);
        } else if (kind === 'm_dm') {
          const v = rInt(2, 9);
          res = makeQ(t(`Đổi: ${v} m = ? dm`, `Convert: ${v} m = ? dm`), v * 10, [v * 100, v + 10, v * 10 + 10], 'units:len', cfg, `1 m = 10 dm → ${v} m = ${v} × 10 = ${v * 10} dm`);
        } else {
          const h = pickAny([1, 2]), extra = pickAny([10, 15, 20, 30]), ans = h * 60 + extra;
          res = makeQ(t(`Đổi: ${h} giờ ${extra} phút = ? phút`, `Convert: ${h}h ${extra}m = ? min`), ans, [ans + 10, ans - 10, h * 100 + extra], 'units:time', cfg, `1 giờ = 60 phút → ${h} × 60 + ${extra} = ${ans} phút`);
        }
        break;
      }
      case 'g2_geom_time': {
        if (Math.random() < 0.55) {
          const a = rInt(8, 22), b = rInt(9, 25), c = rInt(7, 20), ans = a + b + c;
          res = makeQ(t(`Đường gấp khúc có 3 đoạn dài ${a} cm, ${b} cm và ${c} cm. Tổng độ dài là ? cm`, `Polyline has 3 segments: ${a} cm, ${b} cm, ${c} cm. Total length = ? cm`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'geom:polyline', cfg, `Độ dài đường gấp khúc bằng tổng 3 đoạn:\n${a} + ${b} + ${c} = ${ans} cm`);
        } else {
          const pm = rInt(1, 9), ans = pm + 12;
          res = makeQ(t(`${pm} giờ chiều còn gọi là ? giờ (theo hệ 24 giờ)`, `${pm} PM in 24-hour time is ?`), ans, [ans + 1, ans - 1, pm + 10], 'units:time', cfg, `Sau 12 giờ trưa, cộng thêm 12:\n${pm} + 12 = ${ans} giờ`);
        }
        break;
      }
      case 'g2_word': {
        const kind = pickAny(['more', 'less', 'mul25']);
        if (kind === 'more') {
          const a = rInt(18, 48), diff = rInt(12, 29), ans = a + diff;
          res = makeQ(t(`Lan hái được ${a} bông hoa, Mai hái nhiều hơn Lan ${diff} bông. Mai hái ? bông`, `Lan picked ${a} flowers, Mai picked ${diff} more. Mai picked ?`), ans, [ans + 10, Math.max(10, ans - 10), Math.abs(a - diff)], 'word:+', cfg, `Bài toán nhiều hơn → làm phép cộng:\n${a} + ${diff} = ${ans} (bông hoa)`);
        } else if (kind === 'less') {
          const a = rInt(36, 78), diff = rInt(14, 28), ans = a - diff;
          res = makeQ(t(`An có ${a} viên bi, Bình có ít hơn An ${diff} viên. Bình có ? viên bi`, `An has ${a} marbles, Binh has ${diff} fewer. Binh has ?`), ans, [ans + 10, Math.max(1, ans - 10), a + diff], 'word:-', cfg, `Bài toán ít hơn → làm phép trừ:\n${a} − ${diff} = ${ans} (viên bi)`);
        } else {
          const perBox = pickAny([2, 5]), boxes = rInt(3, 9), ans = perBox * boxes;
          res = makeQ(t(`Mỗi hộp có ${perBox} cái bánh. Hỏi ${boxes} hộp có tất cả ? cái bánh`, `Each box has ${perBox} cakes. ${boxes} boxes have ? cakes`), ans, [ans + perBox, Math.max(2, ans - perBox), perBox + boxes], 'word:*', cfg, `Số bánh trong ${boxes} hộp:\n${perBox} × ${boxes} = ${ans} (cái bánh)`);
        }
        break;
      }

      // ---------- GRADE 3 ----------
      case 'g3_tables': {
        const a = rInt(2, 9), b = rInt(2, 9);
        if (Math.random() < 0.55) {
          res = makeQ(`${a} × ${b}`, a * b, [a * b + a, a * b - a, a * b + b], 'natural:*', cfg, `${a} × ${b} = ${a * b}`);
        } else {
          res = makeQ(`${a * b} ÷ ${a}`, b, [b + 1, Math.max(1, b - 1), b + 2], 'natural:/', cfg, `${a * b} ÷ ${a} = ${b}`);
        }
        break;
      }
      case 'g3_col10k': {
        if (Math.random() < 0.55) {
          const a = rInt(125, 4850), b = rInt(135, 4950), ans = a + b;
          res = makeQ(`${a} + ${b}`, ans, [ans + 10, ans - 10, ans + 100], 'natural:+', cfg, `Đặt tính thẳng cột từ phải sang trái: ${a} + ${b} = ${ans}`, { columnReady: true });
        } else {
          const b = rInt(125, 3500), ans = rInt(135, 4200), a = b + ans;
          res = makeQ(`${a} − ${b}`, ans, [ans + 10, ans - 10, ans + 100], 'natural:-', cfg, `Đặt tính thẳng cột từ phải sang trái: ${a} − ${b} = ${ans}`, { columnReady: true });
        }
        break;
      }
      case 'g3_mul1': {
        if (Math.random() < 0.65) {
          const a = rInt(12, 325), b = rInt(2, 9), ans = a * b;
          res = makeQ(`${a} × ${b}`, ans, [ans + b, Math.max(1, ans - b), ans + 10], 'natural:*', cfg,
            t(`Đặt tính nhân lần lượt từ phải sang trái: ${a} × ${b} = ${ans}`, `Multiply right to left: ${a} × ${b} = ${ans}`),
            { columnReady: true });
        } else {
          const b = rInt(2, 9), qVal = rInt(12, 85), a = b * qVal;
          res = makeQ(`${a} ÷ ${b}`, qVal, [qVal + 1, qVal - 1, qVal + 10], 'natural:/', cfg, `Chia từ trái sang phải: ${a} ÷ ${b} = ${qVal}`);
        }
        break;
      }
      case 'g3_rem': {
        const b = rInt(2, 9), qVal = rInt(4, 24), rem = rInt(1, b - 1), a = b * qVal + rem;
        const ans = `${qVal} ${t('dư', 'r')} ${rem}`;
        res = makeQ(`${a} ÷ ${b}`, ans, [`${qVal + 1} ${t('dư', 'r')} ${rem}`, `${qVal} ${t('dư', 'r')} ${rem === 1 ? rem + 1 : rem - 1}`, `${qVal - 1} ${t('dư', 'r')} ${rem}`], 'remainder:/', cfg, `${b} × ${qVal} = ${b * qVal} → ${a} − ${b * qVal} = ${rem}`);
        break;
      }
      case 'g3_expr': {
        if (Math.random() < 0.5) {
          const b = rInt(2, 9), c = rInt(2, 9), a = rInt(10, 45), ans = a + b * c;
          res = makeQ(`${a} + ${b} × ${c}`, ans, [(a + b) * c, ans + 10, ans - 10], 'natural:expression', cfg,
            t(`Nhân chia trước, cộng trừ sau:\n• ${b} × ${c} = ${b * c}\n• ${a} + ${b * c} = ${ans}`, `Multiply first: ${b}×${c}=${b * c} → ${a}+${b * c}=${ans}`));
        } else {
          const d = rInt(2, 8), qVal = rInt(4, 12), sum = d * qVal, a = rInt(5, sum - 4), b = sum - a;
          res = makeQ(`(${a} + ${b}) ÷ ${d}`, qVal, [qVal + 1, qVal - 1, qVal + 2], 'natural:expression', cfg,
            t(`Tính trong ngoặc trước:\n• ${a} + ${b} = ${sum}\n• ${sum} ÷ ${d} = ${qVal}`, `Brackets first: ${a}+${b}=${sum} → ${sum}÷${d}=${qVal}`));
        }
        break;
      }
      case 'g3_find_x': {
        const kind = pickAny(['mul', 'divDividend', 'divDivisor', 'add']);
        if (kind === 'mul') {
          const b = rInt(3, 9), xVal = rInt(4, 15), p = b * xVal;
          res = makeQ(t(`Tìm x: x × ${b} = ${p}`, `Find x: x × ${b} = ${p}`), xVal, [xVal + 1, Math.max(1, xVal - 1), xVal + 2], 'equation:x', cfg, `Muốn tìm thừa số chưa biết, lấy tích chia thừa số đã biết:\nx = ${p} ÷ ${b} = ${xVal}`);
        } else if (kind === 'divDividend') {
          const b = rInt(3, 9), qVal = rInt(4, 12), xVal = b * qVal;
          res = makeQ(t(`Tìm x: x ÷ ${b} = ${qVal}`, `Find x: x ÷ ${b} = ${qVal}`), xVal, [xVal + 10, Math.max(10, xVal - 10), xVal + b], 'equation:x', cfg, `Muốn tìm số bị chia, lấy thương nhân số chia:\nx = ${qVal} × ${b} = ${xVal}`);
        } else if (kind === 'divDivisor') {
          const xVal = rInt(2, 9), qVal = rInt(3, 10), a = xVal * qVal;
          res = makeQ(t(`Tìm x: ${a} ÷ x = ${qVal}`, `Find x: ${a} ÷ x = ${qVal}`), xVal, [xVal + 1, Math.max(1, xVal - 1), xVal + 2], 'equation:x', cfg, `Muốn tìm số chia, lấy số bị chia chia cho thương:\nx = ${a} ÷ ${qVal} = ${xVal}`);
        } else {
          const b = rInt(125, 380), xVal = rInt(115, 420), sum = b + xVal;
          res = makeQ(t(`Tìm x: x + ${b} = ${sum}`, `Find x: x + ${b} = ${sum}`), xVal, [xVal + 10, xVal - 10, xVal + 100], 'equation:x', cfg, `x = ${sum} − ${b} = ${xVal}`);
        }
        break;
      }
      case 'g3_geom': {
        const kind = pickAny(['sqP', 'sqA', 'rectP', 'rectA', 'circleD']);
        if (kind === 'sqP') {
          const a = rInt(4, 18), ans = a * 4;
          res = makeQ(t(`Chu vi hình vuông có cạnh ${a} cm là ? cm`, `Perimeter of square with side ${a} cm is ? cm`), ans, [a * a, ans + 10, Math.max(4, ans - 10)], 'geom:perimeter', cfg, `Chu vi hình vuông = cạnh × 4 = ${a} × 4 = ${ans} cm`);
        } else if (kind === 'sqA') {
          const a = rInt(4, 12), ans = a * a;
          res = makeQ(t(`Diện tích hình vuông có cạnh ${a} cm là ? cm²`, `Area of square with side ${a} cm is ? cm²`), ans, [a * 4, ans + 10, Math.max(4, ans - 10)], 'geom:area', cfg, `Diện tích hình vuông = cạnh × cạnh = ${a} × ${a} = ${ans} cm²`);
        } else if (kind === 'rectP') {
          const w = rInt(4, 12), l = w + rInt(2, 10), ans = (l + w) * 2;
          res = makeQ(t(`Chu vi hình chữ nhật dài ${l} cm, rộng ${w} cm là ? cm`, `Perimeter of ${l}×${w} cm rectangle is ? cm`), ans, [l + w, l * w, ans + 10], 'geom:perimeter', cfg, `Chu vi HCN = (dài + rộng) × 2 = (${l} + ${w}) × 2 = ${ans} cm`);
        } else if (kind === 'rectA') {
          const w = rInt(3, 9), l = w + rInt(2, 9), ans = l * w;
          res = makeQ(t(`Diện tích hình chữ nhật dài ${l} cm, rộng ${w} cm là ? cm²`, `Area of ${l}×${w} cm rectangle is ? cm²`), ans, [(l + w) * 2, ans + 10, Math.max(6, ans - 10)], 'geom:area', cfg, `Diện tích HCN = dài × rộng = ${l} × ${w} = ${ans} cm²`);
        } else {
          const r = rInt(3, 15), d = r * 2;
          res = makeQ(t(`Hình tròn có bán kính ${r} cm thì đường kính là ? cm`, `Circle with radius ${r} cm has diameter ? cm`), d, [d + 2, Math.max(2, d - 2), d + 10], 'geom:circle', cfg, `Đường kính gấp 2 lần bán kính: d = ${r} × 2 = ${d} cm`);
        }
        break;
      }
      case 'g3_fold_word': {
        const kind = pickAny(['foldUp', 'foldDown', 'partOf', 'unitary']);
        if (kind === 'foldUp') {
          const a = rInt(6, 24), k = rInt(3, 7), ans = a * k;
          res = makeQ(t(`Gấp ${a} lên ${k} lần thì được ?`, `${a} multiplied by ${k} is ?`), ans, [a + k, ans + 10, Math.max(10, ans - 10)], 'word:*', cfg, `Gấp lên ${k} lần → nhân với ${k}: ${a} × ${k} = ${ans}`);
        } else if (kind === 'foldDown') {
          const k = rInt(3, 8), ans = rInt(4, 14), a = ans * k;
          res = makeQ(t(`Giảm ${a} đi ${k} lần thì được ?`, `${a} divided by ${k} is ?`), ans, [ans + 1, Math.max(1, ans - 1), a - k], 'word:/', cfg, `Giảm đi ${k} lần → chia cho ${k}: ${a} ÷ ${k} = ${ans}`);
        } else if (kind === 'partOf') {
          const d = rInt(3, 7), ans = rInt(4, 14), total = d * ans;
          res = makeQ(t(`Tìm 1/${d} của ${total}`, `Find 1/${d} of ${total}`), ans, [ans + 1, Math.max(1, ans - 1), ans + 2], 'word:/', cfg, `Tìm 1/${d} của ${total}: ${total} ÷ ${d} = ${ans}`);
        } else {
          const boxes1 = rInt(3, 6), perBox = rInt(4, 9), total1 = boxes1 * perBox, boxes2 = boxes1 + rInt(2, 4), ans = boxes2 * perBox;
          res = makeQ(t(`Có ${boxes1} hộp chứa ${total1} cái bút. Hỏi ${boxes2} hộp như thế có ? cái bút`, `${boxes1} boxes hold ${total1} pens. How many pens in ${boxes2} boxes?`), ans, [ans + 10, Math.max(10, ans - 10), ans + perBox], 'word:unitary', cfg, `Bước 1 (rút về 1 hộp): ${total1} ÷ ${boxes1} = ${perBox} cái bút\nBước 2 (${boxes2} hộp): ${perBox} × ${boxes2} = ${ans} cái bút`);
        }
        break;
      }
      case 'g3_units': {
        const kind = pickAny(['m_cm', 'km_m', 'kg_g']);
        if (kind === 'm_cm') {
          const m = rInt(2, 9), cm = pickAny([0, 15, 25, 50]);
          const ans = m * 100 + cm;
          res = makeQ(cm ? t(`Đổi: ${m} m ${cm} cm = ? cm`, `${m} m ${cm} cm = ? cm`) : t(`Đổi: ${m} m = ? cm`, `${m} m = ? cm`), ans, [m * 10 + cm, ans + 100, ans - 10], 'units:len', cfg, `1 m = 100 cm → ${m} × 100${cm ? ' + ' + cm : ''} = ${ans} cm`);
        } else if (kind === 'km_m') {
          const km = rInt(2, 8);
          res = makeQ(t(`Đổi: ${km} km = ? m`, `${km} km = ? m`), km * 1000, [km * 100, km * 1000 + 100, km * 10], 'units:len', cfg, `1 km = 1.000 m → ${km} km = ${km * 1000} m`);
        } else {
          const kg = rInt(2, 7), gVal = pickAny([0, 200, 500]), ans = kg * 1000 + gVal;
          res = makeQ(gVal ? t(`Đổi: ${kg} kg ${gVal} g = ? g`, `${kg} kg ${gVal} g = ? g`) : t(`Đổi: ${kg} kg = ? g`, `${kg} kg = ? g`), ans, [kg * 100 + gVal, ans + 100, ans - 100], 'units:mass', cfg, `1 kg = 1.000 g → ${kg} × 1.000${gVal ? ' + ' + gVal : ''} = ${ans} g`);
        }
        break;
      }

      // ---------- GRADE 4 ----------
      case 'g4_col': {
        if (Math.random() < 0.55) {
          const a = rInt(1250, 48500), b = rInt(1350, 45500), ans = a + b;
          res = makeQ(`${a} + ${b}`, ans, [ans + 100, ans - 100, ans + 10], 'natural:+', cfg, `Đặt tính thẳng hàng: ${a} + ${b} = ${ans}`, { columnReady: true });
        } else {
          const b = rInt(1250, 25000), ans = rInt(1350, 32000), a = b + ans;
          res = makeQ(`${a} − ${b}`, ans, [ans + 100, ans - 100, ans + 10], 'natural:-', cfg, `Đặt tính thẳng hàng: ${a} − ${b} = ${ans}`, { columnReady: true });
        }
        break;
      }
      case 'g4_mul2': {
        if (Math.random() < 0.65) {
          const a = rInt(14, 145), b = rInt(11, 29), ans = a * b;
          res = makeQ(`${a} × ${b}`, ans, [ans + a, Math.max(1, ans - a), ans + 10], 'natural:*', cfg, `Đặt tính nhân với số có 2 chữ số: ${a} × ${b} = ${ans}`, { columnReady: true });
        } else {
          const b = rInt(11, 25), qVal = rInt(6, 35), a = b * qVal;
          res = makeQ(`${a} ÷ ${b}`, qVal, [qVal + 1, qVal - 1, qVal + 10], 'natural:/', cfg, `${a} ÷ ${b} = ${qVal} (vì ${b} × ${qVal} = ${a})`);
        }
        break;
      }
      case 'g4_conv':
        res = typeof customGenerate === 'function' ? customGenerate({ ...cfg, grade: 4, type: 'natural', types: ['natural'], questionStyle: 'convenient' }) : null;
        break;
      case 'g4_frac':
        res = typeof plainGenerate === 'function' ? plainGenerate({ ...cfg, grade: 4, type: 'fraction', types: ['fraction'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' }) : null;
        break;
      case 'g4_sum_diff': {
        if (Math.random() < 0.55) {
          const small = rInt(12, 42), diff = rInt(4, 24), big = small + diff, sum = big + small;
          const askBig = Math.random() < 0.5;
          const ans = askBig ? big : small;
          res = makeQ(
            askBig
              ? t(`Tổng hai số là ${sum}, hiệu hai số là ${diff}. Tìm số lớn?`, `Sum is ${sum}, difference is ${diff}. Larger number = ?`)
              : t(`Tổng hai số là ${sum}, hiệu hai số là ${diff}. Tìm số bé?`, `Sum is ${sum}, difference is ${diff}. Smaller number = ?`),
            ans, [ans + 10, Math.max(2, ans - 10), askBig ? small : big], 'word:sumdiff', cfg,
            askBig
              ? `Số lớn = (Tổng + Hiệu) ÷ 2 = (${sum} + ${diff}) ÷ 2 = ${sum + diff} ÷ 2 = ${big}`
              : `Số bé = (Tổng − Hiệu) ÷ 2 = (${sum} − ${diff}) ÷ 2 = ${sum - diff} ÷ 2 = ${small}`
          );
        } else {
          const d = pickAny([3, 4, 5, 6, 8]), n = rInt(2, d - 1), unit = rInt(4, 15), total = d * unit, ans = n * unit;
          res = makeQ(t(`Tìm ${n}/${d} của ${total}`, `Find ${n}/${d} of ${total}`), ans, [ans + 10, Math.max(2, ans - 10), unit], 'fraction:of', cfg, `Muốn tìm ${n}/${d} của ${total}, ta tính: ${total} ÷ ${d} × ${n} = ${unit} × ${n} = ${ans}`);
        }
        break;
      }
      case 'g4_geom': {
        const kind = pickAny(['para', 'rhombus', 'rectSide']);
        if (kind === 'para') {
          const base = rInt(8, 24), h = rInt(5, 16), ans = base * h;
          res = makeQ(t(`Diện tích hình bình hành đáy ${base} cm, chiều cao ${h} cm là ? cm²`, `Area of parallelogram (base ${base} cm, height ${h} cm) = ? cm²`), ans, [ans + 10, Math.max(10, ans - 10), (base + h) * 2], 'geom:area', cfg, `Diện tích hình bình hành = đáy × chiều cao = ${base} × ${h} = ${ans} cm²`);
        } else if (kind === 'rhombus') {
          const m = rInt(3, 12) * 2, n = rInt(5, 17), ans = (m * n) / 2;
          res = makeQ(t(`Diện tích hình thoi có 2 đường chéo ${m} cm và ${n} cm là ? cm²`, `Area of rhombus with diagonals ${m} cm & ${n} cm = ? cm²`), ans, [m * n, ans + 10, Math.max(10, ans - 10)], 'geom:area', cfg, `Diện tích hình thoi = (m × n) ÷ 2 = (${m} × ${n}) ÷ 2 = ${ans} cm²`);
        } else {
          const w = rInt(6, 15), l = w + rInt(3, 12), area = l * w;
          res = makeQ(t(`Hình chữ nhật có diện tích ${area} cm² và chiều rộng ${w} cm. Chiều dài là ? cm`, `Rectangle area is ${area} cm², width is ${w} cm. Length = ? cm`), l, [l + 2, Math.max(2, l - 2), l + 10], 'geom:side', cfg, `Chiều dài = Diện tích ÷ Chiều rộng = ${area} ÷ ${w} = ${l} cm`);
        }
        break;
      }
      case 'g4_avg': {
        if (Math.random() < 0.55) {
          const avgVal = rInt(12, 45), diff = rInt(3, 14);
          const a = avgVal - diff, b = avgVal + diff;
          res = makeQ(t(`Trung bình cộng của ${a} và ${b} là ?`, `Average of ${a} and ${b} is ?`), avgVal, [avgVal + 10, Math.max(2, avgVal - 10), a + b], 'natural:avg', cfg, `(${a} + ${b}) ÷ 2 = ${a + b} ÷ 2 = ${avgVal}`);
        } else {
          const kind = pickAny(['tan_kg', 'ta_kg', 'm2_dm2']);
          if (kind === 'tan_kg') {
            const v = rInt(2, 9);
            res = makeQ(t(`Đổi: ${v} tấn = ? kg`, `${v} tons = ? kg`), v * 1000, [v * 100, v * 10, v * 1000 + 100], 'units:mass', cfg, `1 tấn = 1.000 kg → ${v} tấn = ${v * 1000} kg`);
          } else if (kind === 'ta_kg') {
            const v = rInt(2, 12);
            res = makeQ(t(`Đổi: ${v} tạ = ? kg`, `${v} quintals = ? kg`), v * 100, [v * 10, v * 1000, v * 100 + 10], 'units:mass', cfg, `1 tạ = 100 kg → ${v} tạ = ${v * 100} kg`);
          } else {
            const v = rInt(2, 15);
            res = makeQ(t(`Đổi: ${v} m² = ? dm²`, `${v} m² = ? dm²`), v * 100, [v * 10, v * 1000, v * 100 + 10], 'units:area', cfg, `1 m² = 100 dm² → ${v} m² = ${v * 100} dm²`);
          }
        }
        break;
      }
      case 'g4_div_rules': {
        const kind = pickAny(['div9', 'century', 'minSec']);
        if (kind === 'div9') {
          const d1 = rInt(1, 7), d3 = rInt(1, 8);
          const rem = (d1 + d3) % 9;
          const aDigit = rem === 0 ? 9 : 9 - rem;
          res = makeQ(t(`Tìm chữ số a (1–9) để số ${d1}a${d3} chia hết cho 9`, `Find digit a (1–9) so ${d1}a${d3} is divisible by 9`), aDigit, [aDigit === 9 ? 6 : aDigit + 1, Math.max(1, aDigit - 1), (aDigit + 3) % 9 || 3], 'number:div', cfg, `Số chia hết cho 9 có tổng các chữ số chia hết cho 9:\n${d1} + a + ${d3} = ${d1 + d3} + a chia hết cho 9 → a = ${aDigit}`);
        } else if (kind === 'century') {
          const cent = rInt(11, 21), yr = (cent - 1) * 100 + rInt(1, 98);
          res = makeQ(t(`Năm ${yr} thuộc thế kỉ thứ mấy?`, `Year ${yr} belongs to which century?`), cent, [cent - 1, cent + 1, cent - 2], 'units:time', cfg, `Từ năm ${(cent - 1) * 100 + 1} đến ${cent * 100} thuộc thế kỉ ${cent} → đáp án: ${cent}`);
        } else {
          const m = rInt(2, 7), s = pickAny([15, 20, 25, 30, 45]), ans = m * 60 + s;
          res = makeQ(t(`Đổi: ${m} phút ${s} giây = ? giây`, `Convert: ${m} min ${s} sec = ? sec`), ans, [ans + 10, ans - 10, ans + 60], 'units:time', cfg, `1 phút = 60 giây → ${m} × 60 + ${s} = ${ans} giây`);
        }
        break;
      }

      // ---------- GRADE 5 ----------
      case 'g5_dec_col': {
        const isAdd = Math.random() < 0.55;
        if (isAdd) {
          const a = Number((rInt(125, 4850) / 100).toFixed(2)), b = Number((rInt(115, 3450) / 100).toFixed(2));
          const ans = Number((a + b).toFixed(2));
          res = makeQ(`${fmtNum(a)} + ${fmtNum(b)}`, fmtNum(ans), [Number((ans + 0.1).toFixed(2)), Number((ans + 1).toFixed(2)), Number(Math.max(0, ans - 0.1).toFixed(2))], 'decimal:+', cfg,
            t(`Đặt tính thẳng dấu phẩy:\n${fmtNum(a)} + ${fmtNum(b)} = ${fmtNum(ans)}`, `Align decimal points: ${fmtNum(a)} + ${fmtNum(b)} = ${fmtNum(ans)}`),
            { columnReady: true });
        } else {
          const b = Number((rInt(115, 2450) / 100).toFixed(2)), diff = Number((rInt(125, 3250) / 100).toFixed(2));
          const a = Number((b + diff).toFixed(2));
          res = makeQ(`${fmtNum(a)} − ${fmtNum(b)}`, fmtNum(diff), [Number((diff + 0.1).toFixed(2)), Number((diff + 1).toFixed(2)), Number(Math.max(0, diff - 0.1).toFixed(2))], 'decimal:-', cfg,
            t(`Đặt tính thẳng dấu phẩy:\n${fmtNum(a)} − ${fmtNum(b)} = ${fmtNum(diff)}`, `Align decimal points: ${fmtNum(a)} − ${fmtNum(b)} = ${fmtNum(diff)}`),
            { columnReady: true });
        }
        break;
      }
      case 'g5_dec10': {
        const dec = Number((rInt(12, 485) / 100).toFixed(2));
        const factor = pickAny([10, 100, 0.1]);
        const ans = Number((dec * factor).toFixed(4));
        const hintStr = factor === 0.1
          ? t('Nhân với 0,1: chuyển dấu phẩy sang TRÁI 1 chữ số.', 'Multiply by 0.1: shift decimal 1 place LEFT.')
          : t(`Nhân với ${factor}: chuyển dấu phẩy sang PHẢI ${factor === 10 ? 1 : 2} chữ số.`, `Multiply by ${factor}: shift decimal ${factor === 10 ? 1 : 2} place(s) RIGHT.`);
        res = makeQ(`${fmtNum(dec)} × ${fmtNum(factor)}`, fmtNum(ans), [Number((ans * 10).toFixed(3)), Number((ans / 10).toFixed(4)), Number((ans + 1).toFixed(3))], 'decimal:*', cfg, `${fmtNum(dec)} × ${fmtNum(factor)} = ${fmtNum(ans)}\n• ${hintStr}`);
        break;
      }
      case 'g5_dec_muldiv': {
        const kind = pickAny(['convMul', 'convAdd', 'divInt']);
        if (kind === 'convMul') {
          const mid = rInt(3, 14);
          if (Math.random() < 0.5) {
            const ans = 10 * mid;
            res = makeQ(`2,5 × ${mid} × 4`, ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'decimal:convenient', cfg, `Nhóm 2,5 × 4 = 10 trước:\n(2,5 × 4) × ${mid} = 10 × ${mid} = ${ans}`);
          } else {
            const ans = 10 * mid;
            res = makeQ(`1,25 × ${mid} × 8`, ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'decimal:convenient', cfg, `Nhóm 1,25 × 8 = 10 trước:\n(1,25 × 8) × ${mid} = 10 × ${mid} = ${ans}`);
          }
        } else if (kind === 'convAdd') {
          const a = Number((rInt(12, 78) / 10).toFixed(1));
          const b = Number((10 - a).toFixed(1));
          const mid = Number((rInt(15, 65) / 10).toFixed(1));
          const ans = Number((10 + mid).toFixed(1));
          res = makeQ(`${fmtNum(a)} + ${fmtNum(mid)} + ${fmtNum(b)}`, fmtNum(ans), [Number((ans + 1).toFixed(1)), Number((ans - 1).toFixed(1)), Number((ans + 2).toFixed(1))], 'decimal:convenient', cfg, `Gộp cặp tròn 10 trước:\n(${fmtNum(a)} + ${fmtNum(b)}) + ${fmtNum(mid)} = 10 + ${fmtNum(mid)} = ${fmtNum(ans)}`);
        } else {
          const d = rInt(2, 8), qDec = Number((rInt(12, 85) / 10).toFixed(1)), a = Number((d * qDec).toFixed(1));
          res = makeQ(`${fmtNum(a)} ÷ ${d}`, fmtNum(qDec), [Number((qDec + 1).toFixed(1)), Number((qDec + 0.1).toFixed(1)), Number(Math.max(0.1, qDec - 1).toFixed(1))], 'decimal:/', cfg, `Chia phần nguyên trước rồi đặt dấu phẩy vào thương:\n${fmtNum(a)} ÷ ${d} = ${fmtNum(qDec)}`);
        }
        break;
      }
      case 'g5_pct': {
        const kind = pickAny(['valOf', 'ratio', 'findBase']);
        if (kind === 'valOf') {
          const pct = pickAny([10, 20, 25, 50, 75]);
          const base = pickAny([40, 60, 80, 100, 120, 200]);
          const ans = (pct * base) / 100;
          res = makeQ(t(`Tính ${pct}% của ${base}`, `Find ${pct}% of ${base}`), fmtNum(ans), [ans + 10, Math.max(1, ans - 10), ans * 2], 'percent:%', cfg, `${base} × ${pct} ÷ 100 = ${fmtNum(ans)}`);
        } else if (kind === 'ratio') {
          const pairs = [[1, 4, 25], [1, 2, 50], [3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 5, 60], [1, 10, 10]];
          const [n, d, pct] = pickAny(pairs);
          const mul = rInt(2, 8);
          res = makeQ(t(`Tỉ số phần trăm của ${n * mul} và ${d * mul} là bao nhiêu %?`, `${n * mul} is what % of ${d * mul}?`), pct, [pct + 10, Math.max(5, pct - 10), pct + 20], 'percent:%', cfg, `(${n * mul} ÷ ${d * mul}) × 100% = ${pct}%`);
        } else {
          const pct = pickAny([10, 20, 25, 50]);
          const base = pickAny([40, 60, 80, 100, 200]);
          const part = (pct * base) / 100;
          res = makeQ(t(`Biết ${pct}% của x là ${part}. Tìm x?`, `${pct}% of x is ${part}. Find x?`), base, [base + 20, Math.max(10, base - 20), part * 2], 'percent:%', cfg, `x = ${part} ÷ ${pct} × 100 = ${base}`);
        }
        break;
      }
      case 'g5_geom': {
        const kind = pickAny(['tri', 'trap', 'circleC', 'cubeV', 'boxV']);
        if (kind === 'tri') {
          const base = rInt(3, 12) * 2, h = rInt(5, 16), ans = (base * h) / 2;
          res = makeQ(t(`Diện tích hình tam giác đáy ${base} cm, chiều cao ${h} cm là ? cm²`, `Triangle area (base ${base} cm, height ${h} cm) = ? cm²`), ans, [base * h, ans + 10, Math.max(5, ans - 10)], 'geom:area', cfg, `Diện tích tam giác = (đáy × chiều cao) ÷ 2 = (${base} × ${h}) ÷ 2 = ${ans} cm²`);
        } else if (kind === 'trap') {
          const a = rInt(6, 14), b = rInt(4, 12), h = rInt(2, 7) * 2, ans = ((a + b) * h) / 2;
          res = makeQ(t(`Diện tích hình thang có 2 đáy ${a} cm, ${b} cm và chiều cao ${h} cm là ? cm²`, `Trapezoid area (bases ${a}, ${b} cm, h=${h} cm) = ? cm²`), ans, [(a + b) * h, ans + 10, Math.max(10, ans - 10)], 'geom:area', cfg, `Diện tích hình thang = (đáy lớn + đáy bé) × chiều cao ÷ 2 = (${a} + ${b}) × ${h} ÷ 2 = ${ans} cm²`);
        } else if (kind === 'circleC') {
          const d = pickAny([2, 3, 4, 5, 10]), ans = Number((d * 3.14).toFixed(2));
          res = makeQ(t(`Chu vi hình tròn đường kính ${d} cm là ? cm (lấy π = 3,14)`, `Circumference of circle d=${d} cm (π=3.14) = ? cm`), fmtNum(ans), [Number((ans + 1).toFixed(2)), Number((ans + 2).toFixed(2)), Number(Math.max(1, ans - 1).toFixed(2))], 'geom:circle', cfg, `Chu vi hình tròn = đường kính × 3,14 = ${d} × 3,14 = ${fmtNum(ans)} cm`);
        } else if (kind === 'cubeV') {
          const a = rInt(2, 9), ans = a * a * a;
          res = makeQ(t(`Thể tích hình lập phương cạnh ${a} cm là ? cm³`, `Volume of cube with edge ${a} cm = ? cm³`), ans, [a * a * 6, ans + 10, Math.max(4, ans - 10)], 'geom:volume', cfg, `Thể tích lập phương = a × a × a = ${a} × ${a} × ${a} = ${ans} cm³`);
        } else {
          const l = rInt(4, 10), w = rInt(3, 8), h = rInt(2, 6), ans = l * w * h;
          res = makeQ(t(`Thể tích hình hộp chữ nhật ${l} cm × ${w} cm × ${h} cm là ? cm³`, `Volume of ${l}×${w}×${h} cm box = ? cm³`), ans, [ans + 10, Math.max(10, ans - 10), (l + w + h) * 2], 'geom:volume', cfg, `Thể tích hình hộp chữ nhật = dài × rộng × cao = ${l} × ${w} × ${h} = ${ans} cm³`);
        }
        break;
      }
      case 'g5_sum_ratio': {
        const kind = pickAny(['sumRatio', 'diffRatio', 'mixedDec']);
        if (kind === 'sumRatio') {
          const p1 = rInt(1, 3), p2 = rInt(p1 + 1, 5), unit = rInt(4, 14), sum = (p1 + p2) * unit;
          const askSmall = Math.random() < 0.55;
          const ans = askSmall ? p1 * unit : p2 * unit;
          res = makeQ(
            askSmall
              ? t(`Tổng hai số là ${sum}, tỉ số là ${p1}/${p2}. Số bé là ?`, `Sum is ${sum}, ratio is ${p1}/${p2}. Smaller number = ?`)
              : t(`Tổng hai số là ${sum}, tỉ số là ${p1}/${p2}. Số lớn là ?`, `Sum is ${sum}, ratio is ${p1}/${p2}. Larger number = ?`),
            ans, [ans + 10, Math.max(2, ans - 10), askSmall ? p2 * unit : p1 * unit], 'word:ratio', cfg,
            `Tổng số phần bằng nhau: ${p1} + ${p2} = ${p1 + p2} phần\nGiá trị 1 phần: ${sum} ÷ ${p1 + p2} = ${unit}\n→ ${askSmall ? `Số bé = ${unit} × ${p1}` : `Số lớn = ${unit} × ${p2}`} = ${ans}`
          );
        } else if (kind === 'diffRatio') {
          const k = rInt(3, 5), small = rInt(6, 22), big = small * k, diff = big - small;
          res = makeQ(t(`Hiệu hai số là ${diff}, số lớn gấp ${k} lần số bé. Tìm số bé?`, `Difference is ${diff}, larger is ${k}× smaller. Smaller = ?`), small, [small + 10, Math.max(2, small - 10), big], 'word:ratio', cfg, `Hiệu số phần bằng nhau: ${k} − 1 = ${k - 1} phần\n→ Số bé = ${diff} ÷ ${k - 1} = ${small}`);
        } else {
          const whole = rInt(1, 9);
          const fracPairs = [[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [2, 5, 0.4], [3, 5, 0.6], [4, 5, 0.8]];
          const [n, d, dv] = pickAny(fracPairs);
          const ans = Number((whole + dv).toFixed(2));
          res = makeQ(t(`Viết hỗn số ${whole} và ${n}/${d} dưới dạng số thập phân`, `Convert mixed number ${whole} ${n}/${d} to decimal`), fmtNum(ans), [Number((ans + 1).toFixed(2)), Number((ans + 0.1).toFixed(2)), Number(Math.max(0.1, ans - 1).toFixed(2))], 'decimal:mixed', cfg, `${n}/${d} = ${fmtNum(dv)} → ${whole} + ${fmtNum(dv)} = ${fmtNum(ans)}`);
        }
        break;
      }
      case 'g5_units': {
        const kind = pickAny(['ha_m2', 'm2_dm2', 'hr_min']);
        if (kind === 'ha_m2') {
          const v = pickAny([0.1, 0.25, 0.5, 0.75, 0.8]);
          const ans = Math.round(v * 10000);
          res = makeQ(t(`Đổi: ${fmtNum(v)} ha = ? m²`, `${fmtNum(v)} ha = ? m²`), ans, [ans / 10, ans + 100, ans + 1000], 'units:area', cfg, `1 ha = 10.000 m² → ${fmtNum(v)} × 10.000 = ${ans} m²`);
        } else if (kind === 'm2_dm2') {
          const v = Number((rInt(12, 95) / 10).toFixed(1));
          const ans = Math.round(v * 100);
          res = makeQ(t(`Đổi: ${fmtNum(v)} m² = ? dm²`, `${fmtNum(v)} m² = ? dm²`), ans, [ans / 10, ans * 10, ans + 10], 'units:area', cfg, `1 m² = 100 dm² → ${fmtNum(v)} × 100 = ${ans} dm²`);
        } else {
          const h = pickAny([1.5, 2.5, 0.5, 1.25]);
          const ans = Math.round(h * 60);
          res = makeQ(t(`Đổi: ${fmtNum(h)} giờ = ? phút`, `${fmtNum(h)} hours = ? min`), ans, [ans + 10, ans - 10, Math.round(h * 100)], 'units:time', cfg, `1 giờ = 60 phút → ${fmtNum(h)} × 60 = ${ans} phút`);
        }
        break;
      }
      case 'g5_motion': {
        const v = pickAny([30, 40, 45, 50, 60]), tHr = pickAny([2, 3, 4]);
        const s = v * tHr;
        const ask = pickAny(['s', 'v', 't']);
        if (ask === 's') res = makeQ(t(`Xe đi với vận tốc ${v} km/giờ trong ${tHr} giờ. Quãng đường là ? km`, `Speed ${v} km/h for ${tHr}h. Distance = ? km`), s, [s + v, s - v, v + tHr], 'motion:s', cfg, `s = v × t = ${v} × ${tHr} = ${s} km`);
        else if (ask === 'v') res = makeQ(t(`Đi quãng đường ${s} km hết ${tHr} giờ. Vận tốc là ? km/giờ`, `Distance ${s} km in ${tHr}h. Speed = ? km/h`), v, [v + 10, v - 10, v + 20], 'motion:v', cfg, `v = s ÷ t = ${s} ÷ ${tHr} = ${v} km/giờ`);
        else res = makeQ(t(`Đi quãng đường ${s} km với vận tốc ${v} km/giờ hết ? giờ`, `Distance ${s} km at ${v} km/h takes ? hours`), tHr, [tHr + 1, Math.max(1, tHr - 1), tHr + 2], 'motion:t', cfg, `t = s ÷ v = ${s} ÷ ${v} = ${tHr} giờ`);
        break;
      }

      // ---------- GRADE 6 ----------
      case 'g6_int':
        res = typeof plainGenerate === 'function' ? plainGenerate({ ...cfg, grade: 6, type: 'negative', types: ['negative'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' }) : null;
        break;
      case 'g6_pow': {
        if (Math.random() < 0.45) {
          const a = rInt(2, 5), e1 = rInt(2, 3), b = rInt(2, 5), e2 = 2;
          const ans = a ** e1 + b ** e2;
          res = makeQ(`${a}^${e1} + ${b}^${e2}`, ans, [a * e1 + b * e2, ans + 10, Math.max(2, ans - 10)], 'power:^', cfg, `${a}^${e1} = ${a ** e1}; ${b}^${e2} = ${b ** e2} → ${a ** e1} + ${b ** e2} = ${ans}`);
        } else {
          const base = pickAny([2, 3, 5]), n = base === 2 ? rInt(3, 6) : base === 3 ? rInt(2, 4) : rInt(2, 3);
          const val = base ** n;
          res = makeQ(t(`Tìm n biết: ${base}^n = ${val}`, `Find n: ${base}^n = ${val}`), n, [n + 1, Math.max(1, n - 1), n + 2], 'power:n', cfg, `Vì ${val} = ${base}^${n} nên n = ${n}`);
        }
        break;
      }
      case 'g6_findx': {
        const a = rInt(2, 6), x = rInt(-6, 10) || 4, b = rInt(3, 18), rhs = a * x + b;
        res = makeQ(t(`Tìm x: ${a}x + ${b} = ${rhs}`, `Find x: ${a}x + ${b} = ${rhs}`), x, [x + 1, x - 1, -x], 'equation:x', cfg, `${a}x = ${rhs} − ${b} = ${rhs - b} → x = ${rhs - b} ÷ ${a} = ${x}`, { allowNeg: true });
        break;
      }
      case 'g6_frac':
        res = typeof plainGenerate === 'function' ? plainGenerate({ ...cfg, grade: 6, type: 'fraction', types: ['fraction'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' }) : null;
        break;
      case 'g6_div': {
        const d = pickAny([4, 6, 8, 9, 12]), m1 = pickAny([2, 3, 5]), m2 = pickAny([3, 4, 5, 7]);
        const a = d * m1, b = d * (m2 === m1 ? m2 + 1 : m2);
        if (Math.random() < 0.55) {
          const ans = gcd2(a, b);
          res = makeQ(`ƯCLN(${a}, ${b})`, ans, [ans * 2, Math.max(1, Math.floor(ans / 2)), ans + 2], 'number:gcd', cfg, `Ước chung lớn nhất của ${a} và ${b} là ${ans}`);
        } else {
          const p = pickAny([[6, 8], [6, 9], [8, 12], [10, 15], [12, 18], [4, 6], [9, 12], [6, 10]]);
          const ans = lcm2(p[0], p[1]);
          res = makeQ(`BCNN(${p[0]}, ${p[1]})`, ans, [p[0] * p[1], ans + 10, Math.max(2, ans - 10)], 'number:lcm', cfg, `Bội chung nhỏ nhất của ${p[0]} và ${p[1]} là ${ans}`);
        }
        break;
      }

      // ---------- GRADE 7 ----------
      case 'g7_rat':
        res = typeof plainGenerate === 'function' ? plainGenerate({ ...cfg, grade: 7, type: pickAny(['fraction', 'negative']), types: ['fraction', 'negative'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' }) : null;
        break;
      case 'g7_ratio': {
        const b = rInt(2, 9), c = rInt(2, 9), k = rInt(2, 6);
        const xVal = c * k, d = b * k;
        res = makeQ(t(`Tìm x: x/${b} = ${xVal}/${d}`, `Solve: x/${b} = ${xVal}/${d}`), c, [c + 1, Math.max(1, c - 1), c + 2], 'ratio:x', cfg, `Từ tỉ lệ thức suy ra: x = (${b} × ${xVal}) ÷ ${d} = ${c}`);
        break;
      }
      case 'g7_sqrt_abs': {
        if (Math.random() < 0.5) {
          const r1 = rInt(3, 12), r2 = rInt(2, 10), sign = pickAny(['+', '-']);
          const ans = sign === '+' ? r1 + r2 : r1 - r2;
          res = makeQ(`√${r1 * r1} ${sign === '-' ? '−' : '+'} √${r2 * r2}`, ans, [ans + 1, ans - 1, ans + 2], 'sqrt:√', cfg, `√${r1 * r1} = ${r1}; √${r2 * r2} = ${r2} → ${r1} ${sign === '-' ? '−' : '+'} ${r2} = ${ans}`, { allowNeg: true });
        } else {
          const a = -rInt(4, 18), b = rInt(3, 15), ans = Math.abs(a) + b;
          res = makeQ(`|${a}| + ${b}`, ans, [a + b, ans + 10, Math.max(1, ans - 10)], 'negative:abs', cfg, `|${a}| = ${Math.abs(a)} → ${Math.abs(a)} + ${b} = ${ans}`);
        }
        break;
      }
      case 'g7_alg': {
        const k = rInt(2, 6), c = rInt(-8, 9) || 3, xVal = rInt(-4, 6) || 2;
        const ans = k * xVal + c;
        const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
        res = makeQ(t(`Tính P(x) = ${k}x ${cStr} tại x = ${xVal}`, `Evaluate P(x) = ${k}x ${cStr} at x = ${xVal}`), ans, [ans + k, ans - k, -ans], 'algebra:eval', cfg, `P(${xVal}) = ${k} × (${xVal}) ${cStr} = ${k * xVal} ${cStr} = ${ans}`, { allowNeg: true });
        break;
      }

      // ---------- GRADE 8 ----------
      case 'g8_id': {
        if (Math.random() < 0.55) {
          const b = rInt(3, 18), diff = pickAny([10, 20]), a = b + diff, ans = a * a - b * b;
          res = makeQ(`${a}^2 − ${b}^2`, ans, [(a - b) * (a - b), ans + 10, ans - 10], 'identity:diffSq', cfg, `a² − b² = (a − b)(a + b) = (${a} − ${b}) × (${a} + ${b}) = ${a - b} × ${a + b} = ${ans}`);
        } else {
          const base = pickAny([20, 30, 40, 50]), d = pickAny([-2, -1, 1, 2]), n = base + d, ans = n * n;
          const sgn = d > 0 ? '+' : '−', ad = Math.abs(d);
          res = makeQ(`${n}^2`, ans, [base * base + d * d, ans + 10, ans - 10], 'identity:sq', cfg, `${n}² = (${base} ${sgn} ${ad})² = ${base * base} ${sgn} ${2 * base * ad} + ${ad * ad} = ${ans}`);
        }
        break;
      }
      case 'g8_eq': {
        const a = rInt(2, 7), c = rInt(1, a - 1), xVal = rInt(-6, 8) || 3, b = rInt(2, 15), d = (a - c) * xVal + b;
        res = makeQ(t(`Giải PT: ${a}x + ${b} = ${c}x + ${d}`, `Solve: ${a}x + ${b} = ${c}x + ${d}`), xVal, [xVal + 1, xVal - 1, -xVal], 'equation:x', cfg, `(${a} − ${c})x = ${d} − ${b} → ${a - c}x = ${d - b} → x = ${xVal}`, { allowNeg: true });
        break;
      }
      case 'g8_poly': {
        const a = rInt(2, 5), xVal = rInt(-3, 5) || 2, b = rInt(1, 6), ans = xVal * xVal + a * xVal - b;
        res = makeQ(t(`Tính giá trị x^2 + ${a}x − ${b} khi x = ${xVal}`, `Find x^2 + ${a}x − ${b} at x = ${xVal}`), ans, [ans + 2, ans - 2, ans + 10], 'algebra:poly', cfg, `(${xVal})² + ${a}×(${xVal}) − ${b} = ${xVal * xVal} + ${a * xVal} − ${b} = ${ans}`, { allowNeg: true });
        break;
      }
      case 'g8_rat':
        res = typeof plainGenerate === 'function' ? plainGenerate({ ...cfg, grade: 8, type: pickAny(['fraction', 'negative']), types: ['fraction', 'negative'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' }) : null;
        break;

      // ---------- GRADE 9 ----------
      case 'g9_sqrt': {
        const r1 = rInt(3, 14), r2 = rInt(2, 12), k = rInt(2, 4), ans = k * r1 - r2;
        res = makeQ(`${k}√${r1 * r1} − √${r2 * r2}`, ans, [ans + 2, ans - 2, r1 - r2], 'sqrt:√', cfg, `${k} × ${r1} − ${r2} = ${k * r1} − ${r2} = ${ans}`, { allowNeg: true });
        break;
      }
      case 'g9_cbrt': {
        const r = pickAny([-5, -4, -3, -2, 2, 3, 4, 5]), cube = r * r * r;
        res = makeQ(`∛(${cube})`, r, [-r, r + 1, r - 1], 'cbrt:∛', cfg, `Vì (${r})³ = ${cube} nên ∛(${cube}) = ${r}`, { allowNeg: true });
        break;
      }
      case 'g9_eq': {
        if (Math.random() < 0.55) {
          const xVal = rInt(2, 9), b = rInt(1, 7), val = xVal + b, root = rInt(2, 5);
          const aCoef = rInt(2, 5), rhs = root * root, ans = (rhs + b) / aCoef;
          if (Number.isInteger(ans) && ans > 0) {
            res = makeQ(t(`Tìm x biết: √(${aCoef}x − ${b}) = ${root}`, `Solve: √(${aCoef}x − ${b}) = ${root}`), ans, [ans + 1, Math.max(1, ans - 1), ans + 2], 'equation:sqrt', cfg, `Bình phương 2 vế: ${aCoef}x − ${b} = ${rhs} → ${aCoef}x = ${rhs + b} → x = ${ans}`);
          } else {
            res = makeQ(t(`Tìm x biết: √x = ${val}`, `Solve: √x = ${val}`), val * val, [val * 2, val * val + 10, val * val - 10], 'equation:sqrt', cfg, `Bình phương 2 vế: x = ${val}² = ${val * val}`);
          }
        } else {
          const x1 = rInt(-5, 6) || 2, x2 = rInt(-4, 7) || 3;
          const sum = x1 + x2, prod = x1 * x2;
          const askSum = Math.random() < 0.5;
          const sTerm = -sum === 0 ? '' : (-sum > 0 ? `+ ${-sum}x` : `− ${Math.abs(-sum)}x`);
          const pTerm = prod >= 0 ? `+ ${prod}` : `− ${Math.abs(prod)}`;
          const eqStr = `x^2 ${sTerm} ${pTerm} = 0`.replace(/\s+/g, ' ');
          const ans = askSum ? sum : prod;
          res = makeQ(
            askSum ? t(`PT ${eqStr} có tổng 2 nghiệm x₁ + x₂ = ?`, `Sum of roots of ${eqStr} is ?`) : t(`PT ${eqStr} có tích 2 nghiệm x₁·x₂ = ?`, `Product of roots of ${eqStr} is ?`),
            ans, [-ans, ans + 1, ans - 1], 'equation:vieta', cfg,
            `Theo hệ thức Vi-ét: x₁ + x₂ = −b/a = ${sum}; x₁·x₂ = c/a = ${prod}`,
            { allowNeg: true }
          );
        }
        break;
      }
      case 'g9_func': {
        const a = pickAny([-3, -2, 2, 3, 4]), b = rInt(-6, 8) || 2, xv = rInt(-3, 5) || 2, ans = a * xv + b;
        const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
        res = makeQ(t(`Hàm số y = ${a}x ${bStr}. Tính y khi x = ${xv}`, `For y = ${a}x ${bStr}, find y when x = ${xv}`), ans, [ans + a, ans - a, -ans], 'func:linear', cfg, `Thay x = ${xv}: y = ${a}×(${xv}) ${bStr} = ${ans}`, { allowNeg: true });
        break;
      }
      default:
        return null;
    }
    return tagTopic(res, topicId, g);
  }

  // Round-robin shuffled topic deck so mixed-format sessions cover EVERY selected topic evenly without clumps!
  const topicDecks = new Map();
  function nextFromDeck(deckKey, ids) {
    if (!ids.length) return null;
    let deck = topicDecks.get(deckKey);
    if (!deck || !deck.length) {
      deck = [...ids];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      topicDecks.set(deckKey, deck);
    }
    return deck.pop();
  }

  // Hook generate() to support single topic, multi-topic synthesis (config.topics), and balanced Grade 1-5/6-9 mixed streams
  const genBeforeTopics = typeof generate === 'function' ? generate : null;
  if (genBeforeTopics) {
    generate = function (c) {
      const cfg = c || (typeof window !== 'undefined' && window.config) || config;
      const g = cfg && cfg.grade && cfg.grade !== 'custom' ? Number(cfg.grade) : null;
      const topic = cfg && cfg.topic ? String(cfg.topic) : 'all';
      const topicsArr = Array.isArray(cfg?.topics) ? cfg.topics.filter(id => id && id !== 'all') : [];

      // 1. Explicit multi-topic mix chosen by student/parent/teacher
      if (topicsArr.length > 0) {
        const deckKey = `custom:${g || 0}:${topicsArr.slice().sort().join(',')}`;
        const chosenId = nextFromDeck(deckKey, topicsArr);
        if (chosenId) {
          const tq = generateTopicQuestion(chosenId, cfg);
          if (tq) return tq;
        }
      }

      // 2. Explicit single specialized topic
      if (topic && topic !== 'all') {
        const tq = generateTopicQuestion(topic, cfg);
        if (tq) return tq;
      }

      // 3. "Tổng hợp tất cả dạng Lớp X" (normal style & full grade ops):
      //    Grades 1-5 get 80% rich balanced multi-format synthesis; Grades 6-9 get 45% specialized exam mix.
      const gradeMeta = typeof NUMI_GRADES !== 'undefined' ? NUMI_GRADES[g] : null;
      const isFullGradeOps = !cfg.ops || !gradeMeta || cfg.ops.length >= gradeMeta.ops.length;
      const mixProb = g && g <= 5 ? 0.8 : 0.45;
      if (g && NUMI_GRADE_TOPICS[g] && isFullGradeOps && (!cfg.questionStyle || cfg.questionStyle === 'normal') && Math.random() < mixProb) {
        const specializedIds = NUMI_GRADE_TOPICS[g].filter(x => x.id !== 'all').map(x => x.id);
        if (specializedIds.length) {
          const pickedId = nextFromDeck(`all:${g}`, specializedIds);
          const tq = generateTopicQuestion(pickedId, cfg);
          if (tq) return tq;
        }
      }
      return genBeforeTopics(cfg);
    };
    if (typeof window !== 'undefined') window.generate = generate;
    if (typeof global !== 'undefined') global.generate = generate;
  }

  // Inject Grade Topic Stream pills (supporting single + multi-topic synthesis & Grade 1-5 quick presets!)
  function renderTopicPillsForGrade(gradeNum) {
    const host = $('#gradeTopicsWrap');
    if (!host) return;
    const g = Number(gradeNum);
    const list = NUMI_GRADE_TOPICS[g];
    if (!list) {
      host.hidden = true;
      host.innerHTML = '';
      if (typeof config !== 'undefined') { config.topic = 'all'; config.topics = []; }
      return;
    }
    const validIds = new Set(list.filter(x => x.id !== 'all').map(x => x.id));
    let selectedList = Array.isArray(config?.topics) ? config.topics.filter(id => validIds.has(id)) : [];
    if (!selectedList.length && config?.topic && validIds.has(config.topic)) {
      selectedList = [config.topic];
    }
    const isAllMode = selectedList.length === 0;
    const colIds = list.filter(x => x.col).map(x => x.id);

    const syncConfigTopics = nextArr => {
      selectedList = nextArr.filter(id => validIds.has(id));
      if (selectedList.length === 0 || selectedList.length === validIds.size) {
        selectedList = [];
        config.topic = 'all';
        config.topics = [];
      } else if (selectedList.length === 1) {
        config.topic = selectedList[0];
        config.topics = [...selectedList];
      } else {
        config.topic = 'all';
        config.topics = [...selectedList];
      }
      if (typeof window !== 'undefined') window.config = config;
      if (typeof global !== 'undefined') global.config = config;
      renderTopicPillsForGrade(g);
      const sumEl = $('#lessonSummary');
      if (sumEl) {
        const cnt = $('#lessonCount')?.value || config.count;
        const sec = $('#lessonSeconds')?.value || config.seconds;
        if (selectedList.length === 0) {
          sumEl.textContent = `${t(`Đề tổng hợp ${validIds.size} dạng Lớp ${g}`, `Grade ${g} Mixed (${validIds.size} formats)`)} · ${cnt} ${t('câu', 'qs')} · ${sec}s/${t('câu', 'q')}`;
        } else {
          const names = selectedList.slice(0, 2).map(id => {
            const it = list.find(x => x.id === id);
            return it ? (lang === 'en' ? it.en : it.vi) : id;
          });
          const extraTxt = selectedList.length > 2 ? ` +${selectedList.length - 2}` : '';
          sumEl.textContent = `${t('Ghép dạng:', 'Topics:')} ${names.join(' · ')}${extraTxt} · ${cnt} ${t('câu', 'qs')} · ${sec}s/${t('câu', 'q')}`;
        }
      }
    };

    const statusBadge = isAllMode
      ? t(`Đang bật Đề tổng hợp (${validIds.size} dạng trộn đều)`, `Full Mixed Exam (${validIds.size} formats)`)
      : t(`Đang chọn ${selectedList.length}/${validIds.size} dạng (chạm thêm để ghép nhiều dạng)`, `${selectedList.length}/${validIds.size} selected (tap more to combine)`);

    host.hidden = false;
    host.innerHTML = `
      <div class="grade-topics-head">
        <div class="grade-topics-title">
          <span>🎯 ${t(`Luồng chuyên đề Lớp ${g} (Chọn 1 hoặc ghép nhiều dạng):`, `Grade ${g} Exam Topics (Pick 1 or combine many):`)}</span>
          <span class="grade-topics-status">${statusBadge}</span>
        </div>
        ${colIds.length ? `<button type="button" class="grade-topics-quick-col" id="quickColTopicsBtn">📐 ${t('Chỉ bài Đặt tính', 'Column Only')}</button>` : ''}
      </div>
      <div class="grade-topics-list">
        ${list.map(tp => {
          const active = tp.id === 'all' ? isAllMode : selectedList.includes(tp.id);
          const prefix = tp.id === 'all' ? '✨ ' : tp.col ? '📐 ' : '';
          return `<button type="button" class="grade-topic-pill ${active ? 'active' : ''}" data-grade-topic="${esc(tp.id)}">${prefix}${esc(typeof lang !== 'undefined' && lang === 'en' ? tp.en : tp.vi)}</button>`;
        }).join('')}
      </div>
    `;

    $$('[data-grade-topic]').forEach(btn => {
      btn.onclick = () => {
        const chosen = btn.dataset.gradeTopic;
        if (chosen === 'all') {
          syncConfigTopics([]);
          return;
        }
        const next = selectedList.includes(chosen)
          ? selectedList.filter(id => id !== chosen)
          : [...selectedList, chosen];
        syncConfigTopics(next);
      };
    });

    const quickCol = $('#quickColTopicsBtn');
    if (quickCol && colIds.length) {
      quickCol.onclick = () => syncConfigTopics(colIds);
    }
  }

  const resetTopicsOnGrade = gk => {
    if (typeof config !== 'undefined') {
      config.topic = 'all';
      config.topics = [];
    }
    renderTopicPillsForGrade(gk === 'custom' ? null : gk);
  };
  if (typeof window !== 'undefined') window.onGradeApplied = resetTopicsOnGrade;
  if (typeof global !== 'undefined') global.onGradeApplied = resetTopicsOnGrade;

  const setupBeforeTopics = typeof setup === 'function' ? setup : null;
  if (setupBeforeTopics) {
    setup = function () {
      setupBeforeTopics();
      const box = $('.grade-picker-box');
      if (box && !$('#gradeTopicsWrap')) {
        const wrap = document.createElement('div');
        wrap.id = 'gradeTopicsWrap';
        wrap.className = 'grade-topics-wrap';
        box.append(wrap);
      }
      renderTopicPillsForGrade(config.grade);
    };
    if (typeof window !== 'undefined') window.setup = setup;
    if (typeof global !== 'undefined') global.setup = setup;
  }

  // Inject styles
  if (typeof document !== 'undefined' && document.head) {
    const style = document.createElement('style');
    style.textContent = `
      .grade-topics-wrap{margin-top:12px;padding-top:12px;border-top:1.5px dashed #dce8d6}
      .grade-topics-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px}
      .grade-topics-title{display:flex;flex-direction:column;gap:2px;font-size:12.5px;font-weight:800;color:#2f533c}
      .grade-topics-status{font-size:11.5px;font-weight:700;color:#4f7a60}
      .grade-topics-quick-col{min-height:28px!important;padding:4px 10px!important;border-radius:999px!important;border:1.5px solid #c2dcc6!important;background:#eef8f0!important;color:#1f583c!important;font-size:11.5px!important;font-weight:800!important;cursor:pointer}
      .grade-topics-quick-col:hover{background:#dcf1e2!important;border-color:#74ad86!important}
      .grade-topics-list{display:flex;flex-wrap:wrap;gap:6px}
      .grade-topic-pill{min-height:34px;padding:6px 11px;border-radius:999px;border:1.5px solid #d4e3cc;background:#f7fbf5;color:#2e4e3a;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s ease}
      .grade-topic-pill:hover:not(.active){background:#eaf4e6;border-color:#8cb685}
      .grade-topic-pill.active,.grade-topic-pill.active:hover{background:#2d6a51!important;border-color:#1f4f3c!important;color:#fff!important;box-shadow:0 2px 8px rgba(45,106,81,.22)}
      body.dark-mode .grade-topics-wrap{border-top-color:#2b4637}
      body.dark-mode .grade-topics-title{color:#c9e4d4}
      body.dark-mode .grade-topics-status{color:#8dc1a3}
      body.dark-mode .grade-topics-quick-col{background:#193225!important;border-color:#35614a!important;color:#9ee3bc!important}
      body.dark-mode .grade-topic-pill{background:#18271f;border-color:#2d4a3a;color:#cde4d6}
      body.dark-mode .grade-topic-pill.active{background:#2d6a51!important;border-color:#4ba880!important;color:#fff!important}
    `;
    document.head.append(style);
  }

  const exp = { NUMI_GRADE_TOPICS, generateTopicQuestion };
  if (typeof window !== 'undefined') Object.assign(window, exp);
  if (typeof global !== 'undefined') Object.assign(global, exp);
})();
