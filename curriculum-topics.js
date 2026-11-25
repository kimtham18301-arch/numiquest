// MOET GDPT 2018 (KNTT / CTST / Cánh Diều) Grade 1-9 Topic Streams & Real Exam Generators (v2.5.0)
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
      { id: 'all', vi: 'Tổng hợp Lớp 1', en: 'All Grade 1' },
      { id: 'g1_within10', vi: 'Cộng trừ phạm vi 10', en: 'Add/Sub within 10' },
      { id: 'g1_round10', vi: 'Cộng trừ tròn chục', en: 'Round tens' },
      { id: 'g1_col100', vi: 'Đặt tính PV 100 (không nhớ)', en: 'Column ±100 (no carry)', col: true },
      { id: 'g1_missing', vi: 'Điền số ? & Toán đố', en: 'Missing ? & Word' }
    ],
    2: [
      { id: 'all', vi: 'Tổng hợp Lớp 2', en: 'All Grade 2' },
      { id: 'g2_carry20', vi: 'Cộng trừ có nhớ PV 20', en: 'Carry/Borrow ≤20' },
      { id: 'g2_col100', vi: 'Đặt tính có nhớ PV 100', en: 'Column ±100 (carry)', col: true },
      { id: 'g2_col1000', vi: 'Đặt tính PV 1.000', en: 'Column within 1,000', col: true },
      { id: 'g2_mul25', vi: 'Bảng nhân & chia 2, 5', en: '×2, ×5, ÷2, ÷5' },
      { id: 'g2_units', vi: 'Đổi đơn vị (dm, cm, giờ)', en: 'Units (dm, cm, hr)' }
    ],
    3: [
      { id: 'all', vi: 'Tổng hợp Lớp 3', en: 'All Grade 3' },
      { id: 'g3_tables', vi: 'Bảng nhân chia 2–9', en: 'Times tables 2–9' },
      { id: 'g3_col10k', vi: 'Đặt tính ± đến 10.000', en: 'Column ±10,000', col: true },
      { id: 'g3_mul1', vi: 'Đặt tính ×/÷ với 1 chữ số', en: '2-3 digit ×/÷ 1 digit', col: true },
      { id: 'g3_rem', vi: 'Phép chia có dư', en: 'Remainders' },
      { id: 'g3_expr', vi: 'Biểu thức (có ngoặc)', en: 'Expressions & brackets' },
      { id: 'g3_units', vi: 'Đổi đơn vị (m, km, kg, g)', en: 'Units (m, km, kg, g)' }
    ],
    4: [
      { id: 'all', vi: 'Tổng hợp Lớp 4', en: 'All Grade 4' },
      { id: 'g4_col', vi: 'Đặt tính ± nhiều chữ số', en: 'Multi-digit column ±', col: true },
      { id: 'g4_mul2', vi: 'Đặt tính ×/÷ với 2 chữ số', en: '×/÷ by 2 digits', col: true },
      { id: 'g4_conv', vi: 'Tính bằng cách thuận tiện', en: 'Convenient mental math' },
      { id: 'g4_frac', vi: 'Phân số (+, −, ×, ÷)', en: 'Fractions' },
      { id: 'g4_avg', vi: 'Trung bình cộng & Đổi đơn vị', en: 'Average & Units' }
    ],
    5: [
      { id: 'all', vi: 'Tổng hợp Lớp 5', en: 'All Grade 5' },
      { id: 'g5_dec_col', vi: 'Đặt tính ± số thập phân', en: 'Column decimal ±', col: true },
      { id: 'g5_dec10', vi: 'Nhân/chia nhẩm 10, 100, 0,1', en: 'Decimal ×/÷ 10, 100' },
      { id: 'g5_pct', vi: 'Tỉ số phần trăm (%)', en: 'Percentages (%)' },
      { id: 'g5_units', vi: 'Đổi đơn vị diện tích & giờ', en: 'Area & Time units' },
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

  function makeQ(q, answer, near, skill, cfg, explanation, extra = {}) {
    const allowNeg = extra.allowNeg || String(answer).startsWith('-');
    return {
      id: typeof uid === 'function' ? uid() : 'tp_' + Math.random().toString(36).slice(2),
      q,
      answer: String(answer),
      options: buildOpts(answer, near, allowNeg),
      skill,
      config: { ...cfg },
      explanation,
      columnReady: Boolean(extra.columnReady)
    };
  }

  function generateTopicQuestion(topicId, cfg) {
    const g = Number(cfg.grade) || 1;
    switch (topicId) {
      // ---------- GRADE 1 ----------
      case 'g1_within10': {
        const isAdd = Math.random() < 0.55;
        if (isAdd) {
          const a = rInt(1, 9), b = rInt(1, 10 - a), ans = a + b;
          return makeQ(`${a} + ${b}`, ans, [ans + 1, ans - 1, ans + 2], 'natural:+', cfg, `${a} + ${b} = ${ans}`);
        }
        const a = rInt(2, 10), b = rInt(1, a), ans = a - b;
        return makeQ(`${a} − ${b}`, ans, [ans + 1, Math.max(0, ans - 1), ans + 2], 'natural:-', cfg, `${a} − ${b} = ${ans}`);
      }
      case 'g1_round10': {
        const isAdd = Math.random() < 0.55;
        if (isAdd) {
          const a = rInt(1, 8) * 10, b = rInt(1, Math.floor((100 - a) / 10)) * 10, ans = a + b;
          return makeQ(`${a} + ${b}`, ans, [ans + 10, Math.max(0, ans - 10), ans + 20], 'natural:+', cfg, `${a / 10} chục + ${b / 10} chục = ${ans / 10} chục = ${ans}`);
        }
        const a = rInt(2, 9) * 10, b = rInt(1, a / 10 - 1) * 10, ans = a - b;
        return makeQ(`${a} − ${b}`, ans, [ans + 10, Math.max(0, ans - 10), ans + 20], 'natural:-', cfg, `${a / 10} chục − ${b / 10} chục = ${ans / 10} chục = ${ans}`);
      }
      case 'g1_col100': {
        const isAdd = Math.random() < 0.55;
        if (isAdd) {
          const a10 = rInt(1, 7), a1 = rInt(1, 8), b10 = rInt(1, 9 - a10), b1 = rInt(1, 9 - a1);
          const a = a10 * 10 + a1, b = b10 * 10 + b1, ans = a + b;
          return makeQ(`${a} + ${b}`, ans, [ans + 10, ans - 10, ans + 1], 'natural:+', cfg,
            t(`Đặt tính thẳng cột (không nhớ):\n• Hàng đơn vị: ${a1} + ${b1} = ${a1 + b1}\n• Hàng chục: ${a10} + ${b10} = ${a10 + b10}\n→ Kết quả: ${ans}`, `Ones: ${a1}+${b1}=${a1 + b1}; Tens: ${a10}+${b10}=${a10 + b10} → ${ans}`),
            { columnReady: true });
        }
        const a10 = rInt(2, 9), a1 = rInt(2, 9), b10 = rInt(1, a10 - 1), b1 = rInt(1, a1);
        const a = a10 * 10 + a1, b = b10 * 10 + b1, ans = a - b;
        return makeQ(`${a} − ${b}`, ans, [ans + 10, Math.max(0, ans - 10), ans + 1], 'natural:-', cfg,
          t(`Đặt tính thẳng cột (không nhớ):\n• Hàng đơn vị: ${a1} − ${b1} = ${a1 - b1}\n• Hàng chục: ${a10} − ${b10} = ${a10 - b10}\n→ Kết quả: ${ans}`, `Ones: ${a1}-${b1}=${a1 - b1}; Tens: ${a10}-${b10}=${a10 - b10} → ${ans}`),
          { columnReady: true });
      }
      case 'g1_missing':
        return typeof generateMissingNumber === 'function' && Math.random() < 0.6
          ? generateMissingNumber({ ...cfg, grade: 1, ops: ['+', '-'] })
          : typeof generateWordProblem === 'function'
            ? generateWordProblem({ ...cfg, grade: 1, ops: ['+', '-'] })
            : generateTopicQuestion('g1_within10', cfg);

      // ---------- GRADE 2 ----------
      case 'g2_carry20': {
        if (Math.random() < 0.55) {
          const a = rInt(5, 9), b = rInt(11 - a, 9), ans = a + b;
          return makeQ(`${a} + ${b}`, ans, [ans - 1, ans + 1, ans - 10], 'natural:+', cfg,
            t(`Tách để gộp tròn 10: ${a} + ${10 - a} = 10, còn ${b - (10 - a)} → 10 + ${b - (10 - a)} = ${ans}`, `Make 10 first: ${a} + ${10 - a} = 10 → ${ans}`));
        }
        const a = rInt(11, 18), b = rInt(a - 9, 9), ans = a - b;
        return makeQ(`${a} − ${b}`, ans, [ans + 1, Math.max(0, ans - 1), ans + 2], 'natural:-', cfg,
          t(`Trừ để được 10 trước: ${a} − ${a - 10} = 10, trừ tiếp ${b - (a - 10)} → ${ans}`, `Subtract to 10 first → ${ans}`));
      }
      case 'g2_col100': {
        if (Math.random() < 0.55) {
          const a1 = rInt(4, 9), b1 = rInt(10 - a1, 9);
          const a10 = rInt(1, 6), b10 = rInt(1, 8 - a10);
          const a = a10 * 10 + a1, b = b10 * 10 + b1, ans = a + b;
          return makeQ(`${a} + ${b}`, ans, [ans - 10, ans + 10, ans + 1], 'natural:+', cfg,
            t(`Đặt tính có nhớ:\n• Đơn vị: ${a1} + ${b1} = ${a1 + b1}, viết ${(a1 + b1) % 10} nhớ 1\n• Chục: ${a10} + ${b10} + 1 = ${a10 + b10 + 1} → ${ans}`, `Carry 1 to tens → ${ans}`),
            { columnReady: true });
        }
        const a1 = rInt(0, 7), b1 = rInt(a1 + 1, 9);
        const a10 = rInt(3, 9), b10 = rInt(1, a10 - 1);
        const a = a10 * 10 + a1, b = b10 * 10 + b1, ans = a - b;
        return makeQ(`${a} − ${b}`, ans, [ans + 10, Math.max(0, ans - 10), ans + 1], 'natural:-', cfg,
          t(`Đặt tính có nhớ:\n• Đơn vị: ${10 + a1} − ${b1} = ${10 + a1 - b1}, nhớ 1 sang hàng chục\n• Chục: ${a10} − ${b10} − 1 = ${a10 - b10 - 1} → ${ans}`, `Borrow 1 ten → ${ans}`),
          { columnReady: true });
      }
      case 'g2_col1000': {
        if (Math.random() < 0.55) {
          const a = rInt(12, 65) * 10 + rInt(0, 4), b = rInt(11, 32) * 10 + rInt(0, 5), ans = a + b;
          return makeQ(`${a} + ${b}`, ans, [ans + 10, ans - 10, ans + 100], 'natural:+', cfg,
            t(`Đặt tính thẳng cột hàng trăm, chục, đơn vị: ${a} + ${b} = ${ans}`, `Align columns: ${a} + ${b} = ${ans}`),
            { columnReady: true });
        }
        const b = rInt(11, 45) * 10 + rInt(0, 4), ans = rInt(12, 48) * 10 + rInt(0, 5), a = b + ans;
        return makeQ(`${a} − ${b}`, ans, [ans + 10, Math.max(0, ans - 10), ans + 100], 'natural:-', cfg,
          t(`Đặt tính thẳng cột hàng trăm, chục, đơn vị: ${a} − ${b} = ${ans}`, `Align columns: ${a} − ${b} = ${ans}`),
          { columnReady: true });
      }
      case 'g2_mul25': {
        const f = pickAny([2, 5]), k = rInt(1, 10);
        if (Math.random() < 0.55) {
          return makeQ(`${f} × ${k}`, f * k, [f * (k + 1), Math.max(1, f * (k - 1)), f + k], 'natural:*', cfg, `${f} × ${k} = ${f * k}`);
        }
        return makeQ(`${f * k} ÷ ${f}`, k, [k + 1, Math.max(1, k - 1), k + 2], 'natural:/', cfg, `${f * k} ÷ ${f} = ${k} (vì ${f} × ${k} = ${f * k})`);
      }
      case 'g2_units': {
        const kind = pickAny(['dm_cm', 'm_dm', 'hr_min']);
        if (kind === 'dm_cm') {
          const v = rInt(2, 9);
          return makeQ(t(`Đổi: ${v} dm = ? cm`, `Convert: ${v} dm = ? cm`), v * 10, [v * 100, v + 10, v * 10 + 10], 'units:len', cfg, `1 dm = 10 cm → ${v} dm = ${v} × 10 = ${v * 10} cm`);
        }
        if (kind === 'm_dm') {
          const v = rInt(2, 9);
          return makeQ(t(`Đổi: ${v} m = ? dm`, `Convert: ${v} m = ? dm`), v * 10, [v * 100, v + 10, v * 10 + 10], 'units:len', cfg, `1 m = 10 dm → ${v} m = ${v} × 10 = ${v * 10} dm`);
        }
        const h = pickAny([1, 2]);
        const extra = pickAny([10, 15, 20, 30]);
        const ans = h * 60 + extra;
        return makeQ(t(`Đổi: ${h} giờ ${extra} phút = ? phút`, `Convert: ${h}h ${extra}m = ? min`), ans, [ans + 10, ans - 10, h * 100 + extra], 'units:time', cfg, `1 giờ = 60 phút → ${h} × 60 + ${extra} = ${ans} phút`);
      }

      // ---------- GRADE 3 ----------
      case 'g3_tables': {
        const a = rInt(2, 9), b = rInt(2, 9);
        if (Math.random() < 0.55) {
          return makeQ(`${a} × ${b}`, a * b, [a * b + a, a * b - a, a * b + b], 'natural:*', cfg, `${a} × ${b} = ${a * b}`);
        }
        return makeQ(`${a * b} ÷ ${a}`, b, [b + 1, Math.max(1, b - 1), b + 2], 'natural:/', cfg, `${a * b} ÷ ${a} = ${b}`);
      }
      case 'g3_col10k': {
        if (Math.random() < 0.55) {
          const a = rInt(125, 4850), b = rInt(135, 4950), ans = a + b;
          return makeQ(`${a} + ${b}`, ans, [ans + 10, ans - 10, ans + 100], 'natural:+', cfg, `Đặt tính thẳng cột từ phải sang trái: ${a} + ${b} = ${ans}`, { columnReady: true });
        }
        const b = rInt(125, 3500), ans = rInt(135, 4200), a = b + ans;
        return makeQ(`${a} − ${b}`, ans, [ans + 10, ans - 10, ans + 100], 'natural:-', cfg, `Đặt tính thẳng cột từ phải sang trái: ${a} − ${b} = ${ans}`, { columnReady: true });
      }
      case 'g3_mul1': {
        if (Math.random() < 0.65) {
          const a = rInt(12, 325), b = rInt(2, 9), ans = a * b;
          return makeQ(`${a} × ${b}`, ans, [ans + b, Math.max(1, ans - b), ans + 10], 'natural:*', cfg,
            t(`Đặt tính nhân lần lượt từ phải sang trái: ${a} × ${b} = ${ans}`, `Multiply right to left: ${a} × ${b} = ${ans}`),
            { columnReady: true });
        }
        const b = rInt(2, 9), qVal = rInt(12, 85), a = b * qVal;
        return makeQ(`${a} ÷ ${b}`, qVal, [qVal + 1, qVal - 1, qVal + 10], 'natural:/', cfg, `Chia từ trái sang phải: ${a} ÷ ${b} = ${qVal}`);
      }
      case 'g3_rem': {
        const b = rInt(2, 9), qVal = rInt(4, 24), rem = rInt(1, b - 1), a = b * qVal + rem;
        const ans = `${qVal} ${t('dư', 'r')} ${rem}`;
        return makeQ(`${a} ÷ ${b}`, ans, [`${qVal + 1} ${t('dư', 'r')} ${rem}`, `${qVal} ${t('dư', 'r')} ${rem === 1 ? rem + 1 : rem - 1}`, `${qVal - 1} ${t('dư', 'r')} ${rem}`], 'remainder:/', cfg, `${b} × ${qVal} = ${b * qVal} → ${a} − ${b * qVal} = ${rem}`);
      }
      case 'g3_expr': {
        if (Math.random() < 0.5) {
          const b = rInt(2, 9), c = rInt(2, 9), a = rInt(10, 45), ans = a + b * c;
          return makeQ(`${a} + ${b} × ${c}`, ans, [(a + b) * c, ans + 1, ans - 1], 'natural:expression', cfg,
            t(`Nhân chia trước, cộng trừ sau:\n• ${b} × ${c} = ${b * c}\n• ${a} + ${b * c} = ${ans}`, `Multiply first: ${b}×${c}=${b * c} → ${a}+${b * c}=${ans}`));
        }
        const d = rInt(2, 8), qVal = rInt(4, 12), sum = d * qVal, a = rInt(5, sum - 4), b = sum - a;
        return makeQ(`(${a} + ${b}) ÷ ${d}`, qVal, [qVal + 1, qVal - 1, qVal + 2], 'natural:expression', cfg,
          t(`Tính trong ngoặc trước:\n• ${a} + ${b} = ${sum}\n• ${sum} ÷ ${d} = ${qVal}`, `Brackets first: ${a}+${b}=${sum} → ${sum}÷${d}=${qVal}`));
      }
      case 'g3_units': {
        const kind = pickAny(['m_cm', 'km_m', 'kg_g']);
        if (kind === 'm_cm') {
          const m = rInt(2, 9), cm = pickAny([0, 15, 25, 50]);
          const ans = m * 100 + cm;
          return makeQ(cm ? t(`Đổi: ${m} m ${cm} cm = ? cm`, `${m} m ${cm} cm = ? cm`) : t(`Đổi: ${m} m = ? cm`, `${m} m = ? cm`), ans, [m * 10 + cm, ans + 100, ans - 10], 'units:len', cfg, `1 m = 100 cm → ${m} × 100${cm ? ' + ' + cm : ''} = ${ans} cm`);
        }
        if (kind === 'km_m') {
          const km = rInt(2, 8);
          return makeQ(t(`Đổi: ${km} km = ? m`, `${km} km = ? m`), km * 1000, [km * 100, km * 1000 + 100, km * 10], 'units:len', cfg, `1 km = 1.000 m → ${km} km = ${km * 1000} m`);
        }
        const kg = rInt(2, 7), gVal = pickAny([0, 200, 500]);
        const ans = kg * 1000 + gVal;
        return makeQ(gVal ? t(`Đổi: ${kg} kg ${gVal} g = ? g`, `${kg} kg ${gVal} g = ? g`) : t(`Đổi: ${kg} kg = ? g`, `${kg} kg = ? g`), ans, [kg * 100 + gVal, ans + 100, ans - 100], 'units:mass', cfg, `1 kg = 1.000 g → ${kg} × 1.000${gVal ? ' + ' + gVal : ''} = ${ans} g`);
      }

      // ---------- GRADE 4 ----------
      case 'g4_col': {
        if (Math.random() < 0.55) {
          const a = rInt(1250, 48500), b = rInt(1350, 45500), ans = a + b;
          return makeQ(`${a} + ${b}`, ans, [ans + 100, ans - 100, ans + 10], 'natural:+', cfg, `Đặt tính thẳng hàng: ${a} + ${b} = ${ans}`, { columnReady: true });
        }
        const b = rInt(1250, 25000), ans = rInt(1350, 32000), a = b + ans;
        return makeQ(`${a} − ${b}`, ans, [ans + 100, ans - 100, ans + 10], 'natural:-', cfg, `Đặt tính thẳng hàng: ${a} − ${b} = ${ans}`, { columnReady: true });
      }
      case 'g4_mul2': {
        if (Math.random() < 0.65) {
          const a = rInt(14, 145), b = rInt(11, 29), ans = a * b;
          return makeQ(`${a} × ${b}`, ans, [ans + a, Math.max(1, ans - a), ans + 10], 'natural:*', cfg, `Đặt tính nhân với số có 2 chữ số: ${a} × ${b} = ${ans}`, { columnReady: true });
        }
        const b = rInt(11, 25), qVal = rInt(6, 35), a = b * qVal;
        return makeQ(`${a} ÷ ${b}`, qVal, [qVal + 1, qVal - 1, qVal + 2], 'natural:/', cfg, `${a} ÷ ${b} = ${qVal} (vì ${b} × ${qVal} = ${a})`);
      }
      case 'g4_conv':
        return typeof generate === 'function' ? customGenerate({ ...cfg, grade: 4, type: 'natural', types: ['natural'], questionStyle: 'convenient' }) : null;
      case 'g4_frac':
        return plainGenerate({ ...cfg, grade: 4, type: 'fraction', types: ['fraction'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' });
      case 'g4_avg': {
        if (Math.random() < 0.55) {
          const avgVal = rInt(12, 45), diff = rInt(3, 14);
          const a = avgVal - diff, b = avgVal + diff;
          return makeQ(t(`Trung bình cộng của ${a} và ${b} là ?`, `Average of ${a} and ${b} is ?`), avgVal, [avgVal + 1, avgVal - 1, a + b], 'natural:avg', cfg, `(${a} + ${b}) ÷ 2 = ${a + b} ÷ 2 = ${avgVal}`);
        }
        const kind = pickAny(['tan_kg', 'ta_kg', 'm2_dm2']);
        if (kind === 'tan_kg') {
          const v = rInt(2, 9);
          return makeQ(t(`Đổi: ${v} tấn = ? kg`, `${v} tons = ? kg`), v * 1000, [v * 100, v * 10, v * 1000 + 100], 'units:mass', cfg, `1 tấn = 1.000 kg → ${v} tấn = ${v * 1000} kg`);
        }
        if (kind === 'ta_kg') {
          const v = rInt(2, 12);
          return makeQ(t(`Đổi: ${v} tạ = ? kg`, `${v} quintals = ? kg`), v * 100, [v * 10, v * 1000, v * 100 + 10], 'units:mass', cfg, `1 tạ = 100 kg → ${v} tạ = ${v * 100} kg`);
        }
        const v = rInt(2, 15);
        return makeQ(t(`Đổi: ${v} m² = ? dm²`, `${v} m² = ? dm²`), v * 100, [v * 10, v * 1000, v * 100 + 10], 'units:area', cfg, `1 m² = 100 dm² → ${v} m² = ${v * 100} dm²`);
      }

      // ---------- GRADE 5 ----------
      case 'g5_dec_col': {
        const isAdd = Math.random() < 0.55;
        if (isAdd) {
          const a = Number((rInt(125, 4850) / 100).toFixed(2)), b = Number((rInt(115, 3450) / 100).toFixed(2));
          const ans = Number((a + b).toFixed(2));
          return makeQ(`${fmtNum(a)} + ${fmtNum(b)}`, fmtNum(ans), [Number((ans + 0.1).toFixed(2)), Number((ans + 1).toFixed(2)), Number(Math.max(0, ans - 0.1).toFixed(2))], 'decimal:+', cfg,
            t(`Đặt tính thẳng dấu phẩy:\n${fmtNum(a)} + ${fmtNum(b)} = ${fmtNum(ans)}`, `Align decimal points: ${fmtNum(a)} + ${fmtNum(b)} = ${fmtNum(ans)}`),
            { columnReady: true });
        }
        const b = Number((rInt(115, 2450) / 100).toFixed(2)), diff = Number((rInt(125, 3250) / 100).toFixed(2));
        const a = Number((b + diff).toFixed(2));
        return makeQ(`${fmtNum(a)} − ${fmtNum(b)}`, fmtNum(diff), [Number((diff + 0.1).toFixed(2)), Number((diff + 1).toFixed(2)), Number(Math.max(0, diff - 0.1).toFixed(2))], 'decimal:-', cfg,
          t(`Đặt tính thẳng dấu phẩy:\n${fmtNum(a)} − ${fmtNum(b)} = ${fmtNum(diff)}`, `Align decimal points: ${fmtNum(a)} − ${fmtNum(b)} = ${fmtNum(diff)}`),
          { columnReady: true });
      }
      case 'g5_dec10': {
        const dec = Number((rInt(12, 485) / 100).toFixed(2));
        const factor = pickAny([10, 100, 0.1]);
        const ans = Number((dec * factor).toFixed(4));
        const hintStr = factor === 0.1
          ? t('Nhân với 0,1: chuyển dấu phẩy sang TRÁI 1 chữ số.', 'Multiply by 0.1: shift decimal 1 place LEFT.')
          : t(`Nhân với ${factor}: chuyển dấu phẩy sang PHẢI ${factor === 10 ? 1 : 2} chữ số.`, `Multiply by ${factor}: shift decimal ${factor === 10 ? 1 : 2} place(s) RIGHT.`);
        return makeQ(`${fmtNum(dec)} × ${fmtNum(factor)}`, fmtNum(ans), [Number((ans * 10).toFixed(3)), Number((ans / 10).toFixed(4)), Number((ans + 1).toFixed(3))], 'decimal:*', cfg, `${fmtNum(dec)} × ${fmtNum(factor)} = ${fmtNum(ans)}\n• ${hintStr}`);
      }
      case 'g5_pct': {
        const kind = pickAny(['valOf', 'ratio', 'findBase']);
        if (kind === 'valOf') {
          const pct = pickAny([10, 20, 25, 50, 75]);
          const base = pickAny([40, 60, 80, 100, 120, 200]);
          const ans = (pct * base) / 100;
          return makeQ(t(`Tính ${pct}% của ${base}`, `Find ${pct}% of ${base}`), fmtNum(ans), [ans + 5, Math.max(1, ans - 5), ans * 2], 'percent:%', cfg, `${base} × ${pct} ÷ 100 = ${fmtNum(ans)}`);
        }
        if (kind === 'ratio') {
          const pairs = [[1, 4, 25], [1, 2, 50], [3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 5, 60], [1, 10, 10]];
          const [n, d, pct] = pickAny(pairs);
          const mul = rInt(2, 8);
          return makeQ(t(`Tỉ số phần trăm của ${n * mul} và ${d * mul} là bao nhiêu %?`, `${n * mul} is what % of ${d * mul}?`), pct, [pct + 10, Math.max(5, pct - 10), pct + 5], 'percent:%', cfg, `(${n * mul} ÷ ${d * mul}) × 100% = ${pct}%`);
        }
        const pct = pickAny([10, 20, 25, 50]);
        const base = pickAny([40, 60, 80, 100, 200]);
        const part = (pct * base) / 100;
        return makeQ(t(`Biết ${pct}% của x là ${part}. Tìm x?`, `${pct}% of x is ${part}. Find x?`), base, [base + 20, Math.max(10, base - 20), part * 2], 'percent:%', cfg, `x = ${part} ÷ ${pct} × 100 = ${base}`);
      }
      case 'g5_units': {
        const kind = pickAny(['ha_m2', 'm2_dm2', 'hr_min']);
        if (kind === 'ha_m2') {
          const v = pickAny([0.1, 0.25, 0.5, 0.75, 0.8]);
          const ans = Math.round(v * 10000);
          return makeQ(t(`Đổi: ${fmtNum(v)} ha = ? m²`, `${fmtNum(v)} ha = ? m²`), ans, [ans / 10, ans + 100, ans + 1000], 'units:area', cfg, `1 ha = 10.000 m² → ${fmtNum(v)} × 10.000 = ${ans} m²`);
        }
        if (kind === 'm2_dm2') {
          const v = Number((rInt(12, 95) / 10).toFixed(1));
          const ans = Math.round(v * 100);
          return makeQ(t(`Đổi: ${fmtNum(v)} m² = ? dm²`, `${fmtNum(v)} m² = ? dm²`), ans, [ans / 10, ans * 10, ans + 10], 'units:area', cfg, `1 m² = 100 dm² → ${fmtNum(v)} × 100 = ${ans} dm²`);
        }
        const h = pickAny([1.5, 2.5, 0.5, 1.25]);
        const ans = Math.round(h * 60);
        return makeQ(t(`Đổi: ${fmtNum(h)} giờ = ? phút`, `${fmtNum(h)} hours = ? min`), ans, [ans + 15, ans - 15, Math.round(h * 100)], 'units:time', cfg, `1 giờ = 60 phút → ${fmtNum(h)} × 60 = ${ans} phút`);
      }
      case 'g5_motion': {
        const v = pickAny([30, 40, 45, 50, 60]), tHr = pickAny([2, 3, 4]);
        const s = v * tHr;
        const ask = pickAny(['s', 'v', 't']);
        if (ask === 's') return makeQ(t(`Xe đi với vận tốc ${v} km/giờ trong ${tHr} giờ. Quãng đường là ? km`, `Speed ${v} km/h for ${tHr}h. Distance = ? km`), s, [s + v, s - v, v + tHr], 'motion:s', cfg, `s = v × t = ${v} × ${tHr} = ${s} km`);
        if (ask === 'v') return makeQ(t(`Đi quãng đường ${s} km hết ${tHr} giờ. Vận tốc là ? km/giờ`, `Distance ${s} km in ${tHr}h. Speed = ? km/h`), v, [v + 5, v - 5, v + 10], 'motion:v', cfg, `v = s ÷ t = ${s} ÷ ${tHr} = ${v} km/giờ`);
        return makeQ(t(`Đi quãng đường ${s} km với vận tốc ${v} km/giờ hết ? giờ`, `Distance ${s} km at ${v} km/h takes ? hours`), tHr, [tHr + 1, Math.max(1, tHr - 1), tHr + 2], 'motion:t', cfg, `t = s ÷ v = ${s} ÷ ${v} = ${tHr} giờ`);
      }

      // ---------- GRADE 6 ----------
      case 'g6_int':
        return plainGenerate({ ...cfg, grade: 6, type: 'negative', types: ['negative'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' });
      case 'g6_pow': {
        if (Math.random() < 0.45) {
          const a = rInt(2, 5), e1 = rInt(2, 3), b = rInt(2, 5), e2 = 2;
          const ans = a ** e1 + b ** e2;
          return makeQ(`${a}^${e1} + ${b}^${e2}`, ans, [a * e1 + b * e2, ans + 2, ans - 2], 'power:^', cfg, `${a}^${e1} = ${a ** e1}; ${b}^${e2} = ${b ** e2} → ${a ** e1} + ${b ** e2} = ${ans}`);
        }
        const base = pickAny([2, 3, 5]), n = base === 2 ? rInt(3, 6) : base === 3 ? rInt(2, 4) : rInt(2, 3);
        const val = base ** n;
        return makeQ(t(`Tìm n biết: ${base}^n = ${val}`, `Find n: ${base}^n = ${val}`), n, [n + 1, Math.max(1, n - 1), n + 2], 'power:n', cfg, `Vì ${val} = ${base}^${n} nên n = ${n}`);
      }
      case 'g6_findx': {
        const a = rInt(2, 6), x = rInt(3, 15), b = rInt(5, 25);
        if (Math.random() < 0.55) {
          const rhs = a * x - b;
          return makeQ(t(`Tìm x: ${a}x − ${b} = ${rhs}`, `Solve: ${a}x − ${b} = ${rhs}`), x, [x + 1, x - 1, x + 2], 'equation:x', cfg, `${a}x = ${rhs} + ${b} = ${a * x} → x = ${a * x} ÷ ${a} = ${x}`);
        }
        const total = rInt(60, 120), c = rInt(4, 15), rhs = total - (x + c);
        return makeQ(t(`Tìm x: ${total} − (x + ${c}) = ${rhs}`, `Solve: ${total} − (x + ${c}) = ${rhs}`), x, [x + 2, Math.max(1, x - 2), x + c], 'equation:x', cfg, `x + ${c} = ${total} − ${rhs} = ${x + c} → x = ${x}`);
      }
      case 'g6_frac':
        return plainGenerate({ ...cfg, grade: 6, type: 'fraction', types: ['fraction'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' });
      case 'g6_div': {
        const pairs = [[12, 18], [16, 24], [15, 25], [18, 27], [8, 12], [6, 9], [10, 15], [14, 21]];
        const [a, b] = pickAny(pairs);
        if (Math.random() < 0.5) {
          const ans = gcd2(a, b);
          return makeQ(t(`Tìm ƯCLN(${a}, ${b})`, `Find GCD(${a}, ${b})`), ans, [ans * 2, Math.max(1, ans - 1), ans + 2], 'number:gcd', cfg, `Ước chung lớn nhất của ${a} và ${b} là ${ans}`);
        }
        const ans = lcm2(a, b);
        return makeQ(t(`Tìm BCNN(${a}, ${b})`, `Find LCM(${a}, ${b})`), ans, [a * b, ans + a, Math.max(1, ans - b)], 'number:lcm', cfg, `Bội chung nhỏ nhất của ${a} và ${b} là ${ans}`);
      }

      // ---------- GRADE 7 ----------
      case 'g7_rat':
        return plainGenerate({ ...cfg, grade: 7, type: pickAny(['fraction', 'negative', 'decimal']), types: ['fraction', 'negative', 'decimal'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' });
      case 'g7_ratio': {
        if (Math.random() < 0.55) {
          const k = rInt(2, 6), b = rInt(2, 7), d = rInt(2, 7);
          const a = k * b, c = k * d;
          return makeQ(t(`Tìm x trong tỉ lệ thức: x/${b} = ${c}/${d}`, `Solve proportion: x/${b} = ${c}/${d}`), a, [a + b, Math.max(1, a - b), c], 'ratio:x', cfg, `x = (${b} × ${c}) ÷ ${d} = ${a}`);
        }
        const m = rInt(2, 5), n = rInt(3, 6), k = rInt(2, 6), sum = (m + n) * k, x = m * k;
        return makeQ(t(`Biết x/${m} = y/${n} và x + y = ${sum}. Tìm x?`, `x/${m} = y/${n} and x + y = ${sum}. Find x?`), x, [n * k, x + k, Math.max(1, x - k)], 'ratio:sum', cfg, `Áp dụng tính chất dãy tỉ số bằng nhau: x/${m} = y/${n} = (x+y)/(${m}+${n}) = ${sum}/${m + n} = ${k} → x = ${m} × ${k} = ${x}`);
      }
      case 'g7_sqrt_abs': {
        const root = rInt(3, 12), neg = -rInt(2, 15), ans = root + Math.abs(neg);
        return makeQ(`√${root * root} + |${neg}|`, ans, [root + neg, ans + 1, ans - 1], 'sqrt:abs', cfg, `√${root * root} = ${root} và |${neg}| = ${Math.abs(neg)} → ${root} + ${Math.abs(neg)} = ${ans}`);
      }
      case 'g7_alg': {
        const a = rInt(2, 4), b = rInt(1, 5), c = rInt(1, 9), xv = rInt(2, 5);
        const ans = a * xv * xv - b * xv + c;
        return makeQ(t(`Cho P(x) = ${a}x² − ${b}x + ${c}. Tính P(${xv})`, `Given P(x) = ${a}x² − ${b}x + ${c}, find P(${xv})`), ans, [ans + b, ans - b, a * xv + c], 'algebra:poly', cfg, `P(${xv}) = ${a}×${xv}² − ${b}×${xv} + ${c} = ${a * xv * xv} − ${b * xv} + ${c} = ${ans}`);
      }

      // ---------- GRADE 8 ----------
      case 'g8_id': {
        const b = rInt(3, 16), diff = pickAny([10, 20]), a = b + diff, ans = a * a - b * b;
        return makeQ(`${a}^2 − ${b}^2`, ans, [(a - b) * (a - b), ans + 10, ans - 10], 'identity:diffSq', cfg, `(${a} − ${b})(${a} + ${b}) = ${a - b} × ${a + b} = ${ans}`);
      }
      case 'g8_eq': {
        const a = rInt(2, 5), x = rInt(-4, 9) || 3, c = rInt(1, 6), d = rInt(2, 10);
        const rhs = a * (x - c) + d;
        return makeQ(t(`Giải phương trình: ${a}(x − ${c}) + ${d} = ${rhs}`, `Solve: ${a}(x − ${c}) + ${d} = ${rhs}`), x, [x + 1, x - 1, -x], 'equation:linear', cfg, `${a}(x − ${c}) = ${rhs - d} → x − ${c} = ${x - c} → x = ${x}`, { allowNeg: true });
      }
      case 'g8_poly': {
        const a = rInt(2, 6), xv = rInt(2, 6), ans = (xv + a) * (xv - a);
        return makeQ(t(`Tính giá trị (x + ${a})(x − ${a}) tại x = ${xv}`, `Evaluate (x + ${a})(x − ${a}) at x = ${xv}`), ans, [xv * xv + a * a, ans + 2, ans - 2], 'algebra:poly', cfg, `(x + ${a})(x − ${a}) = x² − ${a}² = ${xv * xv} − ${a * a} = ${ans}`, { allowNeg: true });
      }
      case 'g8_rat':
        return plainGenerate({ ...cfg, grade: 8, type: pickAny(['negative', 'fraction']), types: ['negative', 'fraction'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' });

      // ---------- GRADE 9 ----------
      case 'g9_sqrt': {
        const r1 = rInt(2, 13), r2 = rInt(2, 11), sign = pickAny(['+', '-']);
        const ans = sign === '+' ? r1 + r2 : r1 - r2;
        return makeQ(`√${r1 * r1} ${sign === '-' ? '−' : '+'} √${r2 * r2}`, ans, [ans + 2, ans - 2, r1 + r2 + 1], 'sqrt:√', cfg, `√${r1 * r1} = ${r1}, √${r2 * r2} = ${r2} → ${r1} ${sign === '-' ? '−' : '+'} ${r2} = ${ans}`, { allowNeg: true });
      }
      case 'g9_cbrt': {
        const r1 = pickAny([2, 3, 4, 5]), r2 = pickAny([-3, -2, 2, 3]), ans = r1 + r2;
        return makeQ(`∛(${r1 ** 3}) + ∛(${r2 ** 3})`, ans, [ans + 1, ans - 1, r1 - r2], 'cbrt:∛', cfg, `∛(${r1 ** 3}) = ${r1}, ∛(${r2 ** 3}) = ${r2} → ${r1} + (${r2}) = ${ans}`, { allowNeg: true });
      }
      case 'g9_eq': {
        if (Math.random() < 0.5) {
          const rhs = rInt(2, 6), a = rInt(2, 4), x = rInt(2, 9), b = a * x - rhs * rhs;
          const bStr = b >= 0 ? `− ${b}` : `+ ${Math.abs(b)}`;
          return makeQ(t(`Giải PT căn thức: √(${a}x ${bStr}) = ${rhs}`, `Solve: √(${a}x ${bStr}) = ${rhs}`), x, [x + 1, Math.max(1, x - 1), x + 2], 'equation:sqrt', cfg, `Bình phương hai vế: ${a}x ${bStr} = ${rhs * rhs} → ${a}x = ${a * x} → x = ${x}`);
        }
        const x1 = rInt(1, 7), x2 = rInt(2, 8), sum = x1 + x2, prod = x1 * x2;
        const askSum = Math.random() < 0.5;
        return makeQ(
          askSum
            ? t(`PT x² − ${sum}x + ${prod} = 0 có tổng 2 nghiệm x₁ + x₂ = ?`, `For x² − ${sum}x + ${prod} = 0, x₁ + x₂ = ?`)
            : t(`PT x² − ${sum}x + ${prod} = 0 có tích 2 nghiệm x₁·x₂ = ?`, `For x² − ${sum}x + ${prod} = 0, x₁·x₂ = ?`),
          askSum ? sum : prod,
          askSum ? [-sum, prod, sum + 1] : [sum, -prod, prod + 1],
          'equation:vieta', cfg,
          t(`Theo hệ thức Vi-ét cho x² + bx + c = 0: x₁ + x₂ = −b = ${sum}, x₁·x₂ = c = ${prod}.`, `Vieta's formulas: x₁ + x₂ = ${sum}, x₁·x₂ = ${prod}.`),
          { allowNeg: true }
        );
      }
      case 'g9_func': {
        const a = pickAny([-3, -2, 2, 3, 4]), b = rInt(-5, 9) || 2, xv = rInt(-3, 5);
        const ans = a * xv + b;
        const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
        return makeQ(t(`Hàm số y = ${a}x ${bStr}. Tính y khi x = ${xv}`, `For y = ${a}x ${bStr}, find y when x = ${xv}`), ans, [ans + a, ans - a, -ans], 'func:linear', cfg, `Thay x = ${xv}: y = ${a}×(${xv}) ${bStr} = ${ans}`, { allowNeg: true });
      }
      default:
        return null;
    }
  }

  // Hook generate() to support topic streams cleanly
  const genBeforeTopics = typeof generate === 'function' ? generate : null;
  if (genBeforeTopics) {
    generate = function (c) {
      const cfg = c || (typeof window !== 'undefined' && window.config) || config;
      const g = cfg && cfg.grade && cfg.grade !== 'custom' ? Number(cfg.grade) : null;
      const topic = cfg && cfg.topic ? String(cfg.topic) : 'all';

      if (topic && topic !== 'all') {
        const tq = generateTopicQuestion(topic, cfg);
        if (tq) return tq;
      }
      // When practicing "Tổng hợp Lớp X" (normal style & full grade ops), mix in authentic exam topics (~40%)
      const gradeMeta = typeof NUMI_GRADES !== 'undefined' ? NUMI_GRADES[g] : null;
      const isFullGradeOps = !cfg.ops || !gradeMeta || cfg.ops.length >= gradeMeta.ops.length;
      if (g && NUMI_GRADE_TOPICS[g] && isFullGradeOps && (!cfg.questionStyle || cfg.questionStyle === 'normal') && Math.random() < 0.4) {
        const specialized = NUMI_GRADE_TOPICS[g].filter(x => x.id !== 'all');
        if (specialized.length) {
          const picked = pickAny(specialized);
          const tq = generateTopicQuestion(picked.id, cfg);
          if (tq) return tq;
        }
      }
      return genBeforeTopics(cfg);
    };
    if (typeof window !== 'undefined') window.generate = generate;
    if (typeof global !== 'undefined') global.generate = generate;
  }

  // Inject Grade Topic Stream pills into Setup & keep synced with applyGrade()
  function renderTopicPillsForGrade(gradeNum) {
    const host = $('#gradeTopicsWrap');
    if (!host) return;
    const g = Number(gradeNum);
    const list = NUMI_GRADE_TOPICS[g];
    if (!list) {
      host.hidden = true;
      host.innerHTML = '';
      if (typeof config !== 'undefined') config.topic = 'all';
      return;
    }
    const curTopic = (typeof config !== 'undefined' && list.some(x => x.id === config.topic)) ? config.topic : 'all';
    if (typeof config !== 'undefined') config.topic = curTopic;
    host.hidden = false;
    host.innerHTML = `
      <div class="grade-topics-head">
        <span>🎯 ${t(`Luồng chuyên đề Lớp ${g} (Chuẩn đề kiểm tra):`, `Grade ${g} Exam Topics:`)}</span>
      </div>
      <div class="grade-topics-list">
        ${list.map(tp => `<button type="button" class="grade-topic-pill ${curTopic === tp.id ? 'active' : ''}" data-grade-topic="${esc(tp.id)}">${tp.col ? '📐 ' : ''}${esc(typeof lang !== 'undefined' && lang === 'en' ? tp.en : tp.vi)}</button>`).join('')}
      </div>
    `;
    $$('[data-grade-topic]').forEach(btn => {
      btn.onclick = () => {
        const chosen = btn.dataset.gradeTopic;
        config.topic = chosen;
        if (typeof window !== 'undefined') window.config = config;
        if (typeof global !== 'undefined') global.config = config;
        $$('[data-grade-topic]').forEach(b => b.classList.toggle('active', b.dataset.gradeTopic === chosen));
        const info = list.find(x => x.id === chosen);
        const sumEl = $('#lessonSummary');
        if (sumEl && info && chosen !== 'all') {
          sumEl.textContent = `${t('Chuyên đề:', 'Topic:')} ${lang === 'en' ? info.en : info.vi} · ${$('#lessonCount')?.value || config.count} ${t('câu', 'qs')} · ${$('#lessonSeconds')?.value || config.seconds}s/${t('câu', 'q')}`;
        }
      };
    });
  }

  if (typeof window !== 'undefined') {
    window.onGradeApplied = gk => {
      if (typeof config !== 'undefined') config.topic = 'all';
      renderTopicPillsForGrade(gk === 'custom' ? null : gk);
    };
  }
  if (typeof global !== 'undefined') {
    global.onGradeApplied = gk => {
      if (typeof config !== 'undefined') config.topic = 'all';
      renderTopicPillsForGrade(gk === 'custom' ? null : gk);
    };
  }

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
      .grade-topics-head{font-size:12.5px;font-weight:800;color:#2f533c;margin-bottom:8px}
      .grade-topics-list{display:flex;flex-wrap:wrap;gap:6px}
      .grade-topic-pill{min-height:34px;padding:6px 12px;border-radius:999px;border:1.5px solid #d4e3cc;background:#f7fbf5;color:#2e4e3a;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s ease}
      .grade-topic-pill:hover:not(.active){background:#eaf4e6;border-color:#8cb685}
      .grade-topic-pill.active,.grade-topic-pill.active:hover{background:#2d6a51!important;border-color:#1f4f3c!important;color:#fff!important;box-shadow:0 2px 8px rgba(45,106,81,.22)}
      body.dark-mode .grade-topics-wrap{border-top-color:#2b4637}
      body.dark-mode .grade-topics-head{color:#c9e4d4}
      body.dark-mode .grade-topic-pill{background:#18271f;border-color:#2d4a3a;color:#cde4d6}
      body.dark-mode .grade-topic-pill.active{background:#2d6a51!important;border-color:#4ba880!important;color:#fff!important}
    `;
    document.head.append(style);
  }

  const exp = { NUMI_GRADE_TOPICS, generateTopicQuestion };
  if (typeof window !== 'undefined') Object.assign(window, exp);
  if (typeof global !== 'undefined') Object.assign(global, exp);
})();
