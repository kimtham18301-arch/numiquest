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
      { id: 'all', vi: 'Tổng hợp tất cả dạng Lớp 1', en: 'All Grade 1 Mixed', kind: 'all', count: 10, seconds: 30 },
      { id: 'g1_within10', vi: 'Cộng trừ PV 10', en: 'Add/Sub ≤10', kind: 'mental', count: 10, seconds: 15 },
      { id: 'g1_round10', vi: 'Cộng trừ tròn chục', en: 'Round tens', kind: 'mental', count: 10, seconds: 18 },
      { id: 'g1_col100', vi: 'Đặt tính PV 100 (không nhớ)', en: 'Column ±100', kind: 'column', col: true, count: 10, seconds: 30 },
      { id: 'g1_place_cmp', vi: 'Cấu tạo số & Liền trước/sau', en: 'Place Value & Order', kind: 'knowledge', count: 10, seconds: 25 },
      { id: 'g1_seq_split', vi: 'Quy luật dãy số & Tách–gộp', en: 'Sequences & Number Bonds', kind: 'knowledge', count: 10, seconds: 25 },
      { id: 'g1_cmp_expr', vi: 'So sánh & Tính nhanh biểu thức', en: 'Compare & Quick Sum', kind: 'mental', count: 10, seconds: 20 },
      { id: 'g1_two_step', vi: 'Tính 2 bước, Đo cm & Xem giờ', en: '2-Step, cm & Clock', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g1_geom_basic', vi: 'Hình học cơ bản & Lịch tuần', en: 'Basic Shapes & Weekdays', kind: 'knowledge', count: 8, seconds: 25 },
      { id: 'g1_missing', vi: 'Điền số ? thích hợp', en: 'Missing Number ?', kind: 'knowledge', count: 10, seconds: 25 },
      { id: 'g1_word', vi: 'Toán lời văn Lớp 1', en: 'Grade 1 Word Problems', kind: 'knowledge', count: 8, seconds: 40 }
    ],
    2: [
      { id: 'all', vi: 'Tổng hợp tất cả dạng Lớp 2', en: 'All Grade 2 Mixed', kind: 'all', count: 10, seconds: 35 },
      { id: 'g2_carry20', vi: 'Cộng trừ có nhớ PV 20', en: 'Carry/Borrow ≤20', kind: 'mental', count: 12, seconds: 18 },
      { id: 'g2_col100', vi: 'Đặt tính có nhớ PV 100', en: 'Column ±100 (carry)', kind: 'column', col: true, count: 10, seconds: 30 },
      { id: 'g2_col1000', vi: 'Đặt tính PV 1.000', en: 'Column ≤1,000', kind: 'column', col: true, count: 8, seconds: 35 },
      { id: 'g2_num1000', vi: 'Cấu tạo số 3 chữ số (≤1.000)', en: '3-Digit Place Value', kind: 'knowledge', count: 10, seconds: 25 },
      { id: 'g2_mul25', vi: 'Bảng nhân & chia 2, 5', en: '×2, ×5, ÷2, ÷5', kind: 'mental', count: 12, seconds: 15 },
      { id: 'g2_find_x', vi: 'Tìm thành phần chưa biết (?)', en: 'Find Missing Term', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g2_units', vi: 'Đổi đơn vị (dm, cm, m, giờ)', en: 'Length & Time Units', kind: 'knowledge', count: 10, seconds: 25 },
      { id: 'g2_kg_lit', vi: 'Đại lượng kg, lít, mm & km', en: 'kg, Liters, mm & km', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g2_geom_time', vi: 'Đường gấp khúc & Giờ 24h', en: 'Polyline & 24h Clock', kind: 'knowledge', count: 8, seconds: 35 },
      { id: 'g2_peri_shape', vi: 'Chu vi Tam giác & Tứ giác', en: 'Triangle & Quad Perimeter', kind: 'knowledge', count: 8, seconds: 35 },
      { id: 'g2_stat_table', vi: 'Đọc bảng số liệu thống kê', en: 'Reading Data Tables', kind: 'knowledge', count: 8, seconds: 35 },
      { id: 'g2_word', vi: 'Lời văn Nhiều hơn / Ít hơn', en: 'More/Less Word Problems', kind: 'knowledge', count: 8, seconds: 45 }
    ],
    3: [
      { id: 'all', vi: 'Tổng hợp tất cả dạng Lớp 3', en: 'All Grade 3 Mixed', kind: 'all', count: 12, seconds: 35 },
      { id: 'g3_tables', vi: 'Bảng nhân chia 2–9', en: 'Times tables 2–9', kind: 'mental', count: 15, seconds: 12 },
      { id: 'g3_col10k', vi: 'Đặt tính ± đến 10.000', en: 'Column ±10,000', kind: 'column', col: true, count: 8, seconds: 40 },
      { id: 'g3_col100k', vi: 'Đặt tính ± đến 100.000', en: 'Column ±100,000', kind: 'column', col: true, count: 8, seconds: 45 },
      { id: 'g3_mul1', vi: 'Đặt tính ×/÷ với 1 chữ số', en: '2-3d ×/÷ 1d', kind: 'column', col: true, count: 8, seconds: 40 },
      { id: 'g3_rem', vi: 'Phép chia có dư', en: 'Remainders', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g3_num100k', vi: 'Số La Mã & Làm tròn số', en: 'Roman Numerals & Rounding', kind: 'knowledge', count: 10, seconds: 25 },
      { id: 'g3_expr', vi: 'Biểu thức (có ngoặc)', en: 'Expressions & Brackets', kind: 'knowledge', count: 10, seconds: 35 },
      { id: 'g3_find_x', vi: 'Tìm x (4 phép tính)', en: 'Solve for x', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g3_geom', vi: 'Chu vi & Diện tích (Vuông, HCN)', en: 'Perimeter & Area', kind: 'knowledge', count: 8, seconds: 40 },
      { id: 'g3_midpoint', vi: 'Trung điểm & Hình khối (Đỉnh/Cạnh)', en: 'Midpoint & 3D Shapes', kind: 'knowledge', count: 10, seconds: 25 },
      { id: 'g3_fold_word', vi: 'Gấp/Giảm số lần & Rút đơn vị', en: 'Multiples & Unitary', kind: 'knowledge', count: 8, seconds: 45 },
      { id: 'g3_units', vi: 'Đổi đơn vị (m, km, kg, g)', en: 'Units (m, km, kg, g)', kind: 'knowledge', count: 10, seconds: 25 },
      { id: 'g3_money_ml', vi: 'Tiền VN, ml & Lịch năm/tháng', en: 'Money, ml & Calendar', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g3_stat_prob', vi: 'Bảng số liệu thống kê', en: 'Statistics Tables', kind: 'knowledge', count: 8, seconds: 35 }
    ],
    4: [
      { id: 'all', vi: 'Tổng hợp tất cả dạng Lớp 4', en: 'All Grade 4 Mixed', kind: 'all', count: 12, seconds: 40 },
      { id: 'g4_col', vi: 'Đặt tính ± nhiều chữ số', en: 'Multi-digit Column ±', kind: 'column', col: true, count: 8, seconds: 45 },
      { id: 'g4_mul2', vi: 'Đặt tính ×/÷ với 2 chữ số', en: '×/÷ by 2 digits', kind: 'column', col: true, count: 8, seconds: 50 },
      { id: 'g4_conv', vi: 'Tính bằng cách thuận tiện', en: 'Convenient Mental Math', kind: 'mental', count: 10, seconds: 25 },
      { id: 'g4_million_round', vi: 'Làm tròn & Biểu thức chứa chữ', en: 'Rounding & Letter Expr', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g4_frac', vi: 'Phân số (+, −, ×, ÷)', en: 'Fractions', kind: 'knowledge', count: 10, seconds: 35 },
      { id: 'g4_frac_cmp', vi: 'Rút gọn & Phân số bằng nhau', en: 'Simplify & Equal Fractions', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g4_sum_diff', vi: 'Tổng – Hiệu & Phân số của số', en: 'Sum-Diff & Fraction of N', kind: 'knowledge', count: 8, seconds: 45 },
      { id: 'g4_angle', vi: 'Đo góc (Nhọn, Vuông, Tù, Bẹt °)', en: 'Angles & Degrees (°)', kind: 'knowledge', count: 10, seconds: 25 },
      { id: 'g4_geom', vi: 'Hình học (Bình hành, Thoi, HCN)', en: 'Parallelogram & Rhombus', kind: 'knowledge', count: 8, seconds: 40 },
      { id: 'g4_area_units', vi: 'Đổi diện tích & Tấn, tạ, yến', en: 'Area & Mass Units', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g4_avg', vi: 'Trung bình cộng & Đổi đơn vị', en: 'Average & Units', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g4_div_rules', vi: 'Chia hết (2,3,5,9) & Thế kỉ/Giây', en: 'Divisibility & Century', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g4_stat_chart', vi: 'Biểu đồ cột & Rút về đơn vị', en: 'Bar Charts & Unitary', kind: 'knowledge', count: 8, seconds: 40 }
    ],
    5: [
      { id: 'all', vi: 'Tổng hợp tất cả dạng Lớp 5', en: 'All Grade 5 Mixed', kind: 'all', count: 12, seconds: 40 },
      { id: 'g5_dec_col', vi: 'Đặt tính ± số thập phân', en: 'Column Decimal ±', kind: 'column', col: true, count: 8, seconds: 40 },
      { id: 'g5_dec_place', vi: 'Làm tròn & Đổi sang số thập phân', en: 'Decimal Rounding & Units', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g5_dec10', vi: 'Nhân/chia nhẩm 10, 100, 0,1', en: 'Decimal ×/÷ 10, 100', kind: 'mental', count: 12, seconds: 15 },
      { id: 'g5_dec_muldiv', vi: 'Tính thuận tiện & Chia thập phân', en: 'Decimal Mental & Division', kind: 'mental', count: 10, seconds: 30 },
      { id: 'g5_dec_findx', vi: 'Tìm x & Biểu thức số thập phân', en: 'Decimal Equations & Expr', kind: 'knowledge', count: 10, seconds: 35 },
      { id: 'g5_pct', vi: 'Tỉ số phần trăm (3 dạng)', en: 'Percentages (3 types)', kind: 'knowledge', count: 10, seconds: 35 },
      { id: 'g5_geom', vi: 'Hình phẳng (Tam giác, Thang, Tròn)', en: 'Triangle, Trapezoid, Circle', kind: 'knowledge', count: 8, seconds: 45 },
      { id: 'g5_box_surface', vi: 'DT xung quanh/TP & Thể tích (m³, dm³)', en: 'Surface Area & Volume', kind: 'knowledge', count: 8, seconds: 45 },
      { id: 'g5_time_calc', vi: 'Cộng, trừ, nhân, chia Thời gian', en: 'Time Arithmetic', kind: 'knowledge', count: 8, seconds: 40 },
      { id: 'g5_sum_ratio', vi: 'Tổng–Tỉ, Hiệu–Tỉ & Hỗn số', en: 'Ratios & Mixed Numbers', kind: 'knowledge', count: 8, seconds: 50 },
      { id: 'g5_units', vi: 'Đổi đơn vị (ha, m², giờ/phút)', en: 'Area & Time Units', kind: 'knowledge', count: 10, seconds: 30 },
      { id: 'g5_motion', vi: 'Chuyển động cơ bản (v, s, t)', en: 'Speed · Distance · Time', kind: 'knowledge', count: 8, seconds: 45 },
      { id: 'g5_motion_adv', vi: 'Chuyển động Ngược/Cùng chiều & Dòng nước', en: 'Meeting, Catch-up & River', kind: 'knowledge', count: 8, seconds: 50 },
      { id: 'g5_stat_pie', vi: 'Biểu đồ quạt tròn, Giảm giá & Xác suất', en: 'Pie Charts, Discounts & Prob', kind: 'knowledge', count: 8, seconds: 40 }
    ],
    6: [
      { id: 'all', vi: 'Tổng hợp Lớp 6', en: 'All Grade 6', kind: 'all', count: 12, seconds: 30 },
      { id: 'g6_int', vi: 'Số nguyên âm Z (+, −, ×, ÷)', en: 'Signed Integers Z', kind: 'mental', count: 12, seconds: 20 },
      { id: 'g6_pow', vi: 'Lũy thừa số mũ tự nhiên', en: 'Natural Powers (aⁿ)', kind: 'mental', count: 12, seconds: 20 },
      { id: 'g6_findx', vi: 'Tìm x (chuyển vế, ngoặc)', en: 'Solve for x', kind: 'knowledge', count: 10, seconds: 35 },
      { id: 'g6_frac', vi: 'Phân số & Thập phân', en: 'Fractions & Decimals', kind: 'knowledge', count: 10, seconds: 35 },
      { id: 'g6_div', vi: 'ƯCLN & BCNN', en: 'GCD & LCM', kind: 'knowledge', count: 10, seconds: 35 }
    ],
    7: [
      { id: 'all', vi: 'Tổng hợp Lớp 7', en: 'All Grade 7', kind: 'all', count: 12, seconds: 30 },
      { id: 'g7_rat', vi: 'Số hữu tỉ Q & Lũy thừa', en: 'Rationals & Powers', kind: 'mental', count: 12, seconds: 25 },
      { id: 'g7_ratio', vi: 'Tỉ lệ thức & Dãy tỉ số', en: 'Proportions', kind: 'knowledge', count: 10, seconds: 35 },
      { id: 'g7_sqrt_abs', vi: 'Căn bậc hai & Trị tuyệt đối', en: 'Square Root & |x|', kind: 'mental', count: 12, seconds: 20 },
      { id: 'g7_alg', vi: 'Giá trị biểu thức & Đa thức', en: 'Polynomials', kind: 'knowledge', count: 10, seconds: 35 }
    ],
    8: [
      { id: 'all', vi: 'Tổng hợp Lớp 8', en: 'All Grade 8', kind: 'all', count: 12, seconds: 30 },
      { id: 'g8_id', vi: '7 Hằng đẳng thức tính nhanh', en: 'Algebraic Identities', kind: 'mental', count: 12, seconds: 25 },
      { id: 'g8_eq', vi: 'Giải phương trình bậc nhất', en: 'Linear Equations', kind: 'knowledge', count: 10, seconds: 35 },
      { id: 'g8_poly', vi: 'Đa thức & Phân thức', en: 'Polynomials & Fractions', kind: 'knowledge', count: 10, seconds: 35 },
      { id: 'g8_rat', vi: 'Số hữu tỉ & Lũy thừa', en: 'Rationals & Powers', kind: 'mental', count: 12, seconds: 25 }
    ],
    9: [
      { id: 'all', vi: 'Tổng hợp Lớp 9', en: 'All Grade 9', kind: 'all', count: 12, seconds: 30 },
      { id: 'g9_sqrt', vi: 'Biến đổi Căn bậc hai', en: 'Square Root Expressions', kind: 'mental', count: 12, seconds: 25 },
      { id: 'g9_cbrt', vi: 'Căn bậc ba (∛)', en: 'Cube Roots (∛)', kind: 'mental', count: 12, seconds: 20 },
      { id: 'g9_eq', vi: 'PT vô tỷ & Hệ thức Vi-ét', en: 'Radical Eq & Vieta', kind: 'knowledge', count: 10, seconds: 40 },
      { id: 'g9_func', vi: 'Hàm số y = ax + b', en: 'Linear Functions', kind: 'knowledge', count: 10, seconds: 35 }
    ]
  };

  // Merge expanded Primary Number/Word-Problem topics & full THCS Number vs Geometry streams (v2.15.0)
  const PRIMARY_GEOM_IDS = new Set([
    'g1_geom_basic', 'g2_geom_time', 'g2_peri_shape', 'g3_geom', 'g3_midpoint',
    'g4_angle', 'g4_geom', 'g5_geom', 'g5_box_surface'
  ]);
  for (let g = 1; g <= 5; g++) {
    if (Array.isArray(NUMI_GRADE_TOPICS[g])) {
      NUMI_GRADE_TOPICS[g].forEach(tp => {
        if (!tp.domain) tp.domain = tp.id === 'all' ? 'all' : (PRIMARY_GEOM_IDS.has(tp.id) ? 'geometry' : 'number');
      });
    }
    const ext = typeof NUMI_CURRICULUM_EXT !== 'undefined' ? NUMI_CURRICULUM_EXT : null;
    if (ext && ext.EXTRA_PRIMARY_TOPICS && Array.isArray(ext.EXTRA_PRIMARY_TOPICS[g])) {
      for (const extraTp of ext.EXTRA_PRIMARY_TOPICS[g]) {
        if (!NUMI_GRADE_TOPICS[g].some(x => x.id === extraTp.id)) {
          NUMI_GRADE_TOPICS[g].push({ ...extraTp });
        }
      }
    }
  }
  if (typeof NUMI_CURRICULUM_EXT !== 'undefined' && NUMI_CURRICULUM_EXT.SECONDARY_GRADE_TOPICS) {
    for (let g = 6; g <= 9; g++) {
      if (Array.isArray(NUMI_CURRICULUM_EXT.SECONDARY_GRADE_TOPICS[g])) {
        NUMI_GRADE_TOPICS[g] = NUMI_CURRICULUM_EXT.SECONDARY_GRADE_TOPICS[g].map(tp => ({ ...tp }));
      }
    }
  }

  function getRecommendedTiming(gradeNum, selectedIds = []) {
    const g = Number(gradeNum);
    const list = NUMI_GRADE_TOPICS[g];
    if (!list) return { count: 10, seconds: 20, minSeconds: 20, maxSeconds: 20 };
    const clean = (Array.isArray(selectedIds) ? selectedIds : [])
      .map(id => list.find(x => x.id === id && x.id !== 'all'))
      .filter(Boolean);
    if (clean.length === 0) {
      const allItem = list.find(x => x.id === 'all');
      const specSecs = list.filter(x => x.id !== 'all').map(x => x.seconds || 25);
      const minS = specSecs.length ? Math.min(...specSecs) : (allItem?.seconds || 30);
      const maxS = specSecs.length ? Math.max(...specSecs) : (allItem?.seconds || 30);
      return { count: allItem?.count || 10, seconds: allItem?.seconds || 30, minSeconds: minS, maxSeconds: maxS };
    }
    if (clean.length === 1) {
      const s = clean[0].seconds || 30;
      return { count: clean[0].count || 10, seconds: s, minSeconds: s, maxSeconds: s };
    }
    const secs = clean.map(x => x.seconds || 25);
    const minSec = Math.min(...secs);
    const maxSec = Math.max(...secs);
    const count = Math.max(8, Math.min(15, clean.length * 4));
    return { count, seconds: Math.min(60, maxSec), minSeconds: minSec, maxSeconds: Math.min(60, maxSec) };
  }

  function buildBalancedTopicPlan(topicIds, count) {
    const unique = Array.from(new Set((Array.isArray(topicIds) ? topicIds : []).filter(id => id && id !== 'all')));
    const total = Math.max(1, Number(count) || 1);
    if (!unique.length) return [];
    const shuffleArr = arr => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const shuffledTopics = shuffleArr(unique);
    const base = Math.floor(total / shuffledTopics.length);
    const rem = total % shuffledTopics.length;
    const plan = [];
    shuffledTopics.forEach((id, idx) => {
      const qty = base + (idx < rem ? 1 : 0);
      for (let k = 0; k < qty; k++) plan.push(id);
    });
    return shuffleArr(plan);
  }

  function formatSplitHint(totalCount, numTopics) {
    const n = Math.max(1, Number(totalCount) || 1);
    const k = Math.max(1, Number(numTopics) || 1);
    if (k <= 1) return '';
    if (n < k) return t(`random ${n} dạng khác nhau`, `${n} distinct random topics`);
    const base = Math.floor(n / k);
    const rem = n % k;
    if (k <= 4) {
      const parts = Array.from({ length: k }, (_, i) => base + (i < rem ? 1 : 0));
      return `${parts.join(' + ')} ${t('câu', 'qs')}`;
    }
    return rem === 0 ? `${base} ${t('câu/dạng', 'qs/topic')}` : `${base}–${base + 1} ${t('câu/dạng', 'qs/topic')}`;
  }

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

  function formatTopicBadge(topicId, gradeHint, cfgHint) {
    const meta = getTopicMeta(topicId, gradeHint);
    if (!meta || meta.id === 'all') return '';
    const label = typeof lang !== 'undefined' && lang === 'en' ? meta.en : meta.vi;
    const g = Number(gradeHint || cfgHint?.grade || 0);
    const effCfg = cfgHint || (typeof config !== 'undefined' ? config : null);
    const untimed = typeof isUntimedQuizSession === 'function' && isUntimedQuizSession(effCfg, { config: { grade: g } });
    const secVal = Number(effCfg?.customPresetSeconds) || meta.seconds;
    return `${label}${!untimed && secVal ? ` · ${secVal}s` : ''}`;
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

  function tagTopic(qObj, topicId, g, cfgUsed) {
    if (!qObj) return qObj;
    const meta = getTopicMeta(topicId, g);
    qObj.topicId = topicId;
    qObj.domain = meta?.domain || qObj.domain || 'number';
    qObj.topicLabel = formatTopicBadge(topicId, g, cfgUsed || qObj.config);
    const ext = typeof NUMI_CURRICULUM_EXT !== 'undefined' ? NUMI_CURRICULUM_EXT : null;
    if (!qObj.difficulty) {
      qObj.difficulty = ext && typeof ext.resolveTier === 'function' ? ext.resolveTier(cfgUsed || qObj.config) : 'medium';
    }
    if (!qObj.difficultyLabel) {
      qObj.difficultyLabel = ext && typeof ext.difficultyBadgeLabel === 'function'
        ? ext.difficultyBadgeLabel(qObj.difficulty)
        : '';
    }
    if (meta && meta.seconds) {
      qObj.topicSeconds = meta.seconds;
      qObj.config = { ...(qObj.config || {}), seconds: meta.seconds, difficulty: qObj.difficulty };
    }
    return qObj;
  }

  function generateTopicQuestion(topicId, cfg = {}) {
    const g = Number(cfg.grade) || 1;
    const ext = typeof NUMI_CURRICULUM_EXT !== 'undefined' ? NUMI_CURRICULUM_EXT : null;
    if (ext && typeof ext.generateExtendedTopicQuestion === 'function') {
      const extRes = ext.generateExtendedTopicQuestion(topicId, cfg);
      if (extRes) return tagTopic(extRes, topicId, g, cfg);
    }
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
          const a10 = rInt(1, 4), a1 = rInt(1, 7), a = a10 * 10 + a1, b = rInt(1, 9 - a1);
          const sum = a + b;
          res = makeQ(`${a} + ? = ${sum}`, b, [b + 1, Math.max(1, b - 1), b + 2], 'natural:missing', cfg, `Muốn tìm số còn thiếu: ${sum} − ${a} = ${b}`);
        } else {
          const b = rInt(2, 8), ans = rInt(1, 9 - b), a = 10 + b + ans;
          res = makeQ(`${a} − ? = ${10 + b}`, ans, [ans + 1, Math.max(1, ans - 1), ans + 2], 'natural:missing', cfg, `${a} − ${10 + b} = ${ans}`);
        }
        break;
      }
      case 'g1_seq_split': {
        const kind = pickAny(['seq2', 'seq5', 'seq10', 'split']);
        if (kind === 'seq2') {
          const start = rInt(1, 5) * 2;
          const seq = [start, start + 2, start + 4, start + 6];
          const hideIdx = rInt(1, 3), ans = seq[hideIdx];
          const disp = seq.map((v, i) => i === hideIdx ? '?' : String(v)).join(', ');
          res = makeQ(t(`Điền số tiếp vào dãy: ${disp}`, `Fill the sequence: ${disp}`), ans, [ans + 1, Math.max(1, ans - 1), ans + 2], 'natural:seq', cfg, `Dãy số tăng thêm 2 đơn vị mỗi bước → số cần điền là ${ans}`);
        } else if (kind === 'seq5') {
          const start = rInt(1, 10) * 5;
          const seq = [start, start + 5, start + 10, start + 15];
          const hideIdx = rInt(1, 3), ans = seq[hideIdx];
          const disp = seq.map((v, i) => i === hideIdx ? '?' : String(v)).join(', ');
          res = makeQ(t(`Điền số vào dãy đếm cách 5: ${disp}`, `Count by 5s: ${disp}`), ans, [ans + 10, Math.max(5, ans - 10), ans + 5], 'natural:seq', cfg, `Mỗi số sau hơn số trước 5 đơn vị → đáp án: ${ans}`);
        } else if (kind === 'seq10') {
          const start = rInt(1, 5) * 10;
          const seq = [start, start + 10, start + 20, start + 30];
          const hideIdx = rInt(1, 3), ans = seq[hideIdx];
          const disp = seq.map((v, i) => i === hideIdx ? '?' : String(v)).join(', ');
          res = makeQ(t(`Điền số tròn chục: ${disp}`, `Round tens sequence: ${disp}`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'natural:seq', cfg, `Mỗi số sau tăng thêm 1 chục (+10) → đáp án: ${ans}`);
        } else {
          const tens = rInt(2, 9) * 10, ones = rInt(1, 9), n = tens + ones;
          if (Math.random() < 0.5) {
            res = makeQ(`${n} = ${tens} + ?`, ones, [ones + 1, Math.max(1, ones - 1), ones + 2], 'natural:place', cfg, `Tách ${n} thành ${tens} và ${ones} → số cần điền là ${ones}`);
          } else {
            res = makeQ(`${n} = ? + ${ones}`, tens, [tens + 10, Math.max(10, tens - 10), tens + 20], 'natural:place', cfg, `Tách ${n} thành ${tens} và ${ones} → số cần điền là ${tens}`);
          }
        }
        break;
      }
      case 'g1_cmp_expr': {
        const kind = pickAny(['maxLess', 'sumLargest1', 'quick3']);
        if (kind === 'maxLess') {
          const a = rInt(2, 6), ans = rInt(2, 9 - a), bound = a + ans + 1;
          res = makeQ(t(`Số lớn nhất điền vào ô ? để ${a} + ? < ${bound} là ?`, `Largest number for ${a} + ? < ${bound} is ?`), ans, [ans + 1, Math.max(1, ans - 1), ans + 2], 'natural:cmp', cfg, `Vì ${a} + ${ans} = ${a + ans} < ${bound} (còn ${a} + ${ans + 1} = ${bound}) nên số lớn nhất là ${ans}`);
        } else if (kind === 'sumLargest1') {
          const b = rInt(1, 8) * 10, ans = 9 + b;
          res = makeQ(t(`Tổng của số lớn nhất có 1 chữ số và ${b} là ?`, `Sum of largest 1-digit number and ${b} is ?`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'natural:+', cfg, `Số lớn nhất có 1 chữ số là 9 → 9 + ${b} = ${ans}`);
        } else {
          const a = rInt(2, 6) * 10, b = rInt(1, 3) * 10, c = rInt(1, 9), ans = a + b + c;
          res = makeQ(`${a} + ${b} + ${c}`, ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'natural:+', cfg, `Cộng tròn chục trước: ${a} + ${b} = ${a + b}, cộng tiếp ${c} = ${ans}`);
        }
        break;
      }
      case 'g1_geom_basic': {
        const bank = [
          { q: t('Hình tam giác có mấy cạnh?', 'How many sides does a triangle have?'), a: 3, near: [2, 4, 5], exp: 'Hình tam giác có 3 cạnh và 3 đỉnh.' },
          { q: t('Hình vuông có mấy cạnh bằng nhau?', 'How many equal sides does a square have?'), a: 4, near: [2, 3, 5], exp: 'Hình vuông có 4 cạnh bằng nhau.' },
          { q: t('Hình chữ nhật có mấy cạnh?', 'How many sides does a rectangle have?'), a: 4, near: [3, 5, 6], exp: 'Hình chữ nhật có 4 cạnh (2 cạnh dài và 2 cạnh ngắn).' },
          { q: t('Khối lập phương có mấy mặt?', 'How many faces does a cube have?'), a: 6, near: [4, 5, 8], exp: 'Khối lập phương có 6 mặt đều là hình vuông.' },
          { q: t('Một tuần lễ có mấy ngày?', 'How many days are in a week?'), a: 7, near: [5, 6, 8], exp: 'Một tuần lễ có 7 ngày (từ Thứ Hai đến Chủ Nhật).' },
          { q: t('Hôm nay là Thứ Hai, 3 ngày nữa là Thứ mấy?', 'If today is Monday (2), 3 days later is day ?'), a: 5, near: [4, 6, 7], exp: 'Thứ Hai (2) + 3 ngày = Thứ Năm (5).' },
          { q: t('Hôm nay là Thứ Tư, 2 ngày nữa là Thứ mấy?', 'If today is Wednesday (4), 2 days later is day ?'), a: 6, near: [5, 7, 3], exp: 'Thứ Tư (4) + 2 ngày = Thứ Sáu (6).' }
        ];
        const item = pickAny(bank);
        res = makeQ(item.q, item.a, item.near, 'geom:basic', cfg, item.exp);
        break;
      }
      case 'g1_word': {
        const scenarios = [
          () => {
            const a10 = rInt(1, 2), a1 = rInt(1, 7), a = a10 * 10 + a1, b = rInt(2, 9 - a1), ans = a + b;
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
      case 'g2_num1000': {
        const kind = pickAny(['compose', 'expand', 'next100']);
        if (kind === 'compose') {
          const h = rInt(1, 9), tn = rInt(0, 9), o = rInt(1, 9), ans = h * 100 + tn * 10 + o;
          res = makeQ(t(`Số gồm ${h} trăm, ${tn} chục và ${o} đơn vị là ?`, `Number with ${h} hundreds, ${tn} tens, ${o} ones is ?`), ans, [ans + 10, Math.max(100, ans - 10), ans + 100], 'natural:place', cfg, `${h} trăm = ${h * 100}; ${tn} chục = ${tn * 10}; ${o} đơn vị → ${ans}`);
        } else if (kind === 'expand') {
          const h = rInt(2, 9) * 100, tn = rInt(1, 9) * 10, o = rInt(1, 9), n = h + tn + o;
          res = makeQ(`${n} = ${h} + ? + ${o}`, tn, [tn + 10, Math.max(10, tn - 10), tn + 20], 'natural:place', cfg, `Phân tích số ${n} = ${h} + ${tn} + ${o} → đáp án: ${tn}`);
        } else {
          const h = rInt(1, 8) * 100, ans = h + 100;
          res = makeQ(t(`Số tròn trăm liền sau của ${h} là ?`, `Next round hundred after ${h} is ?`), ans, [h + 10, ans + 100, Math.max(100, h - 100)], 'natural:order', cfg, `Số tròn trăm liền sau tăng thêm 100: ${h} + 100 = ${ans}`);
        }
        break;
      }
      case 'g2_kg_lit': {
        const kind = pickAny(['lit', 'kg', 'cm_mm', 'km_m']);
        if (kind === 'lit') {
          const a = rInt(14, 48), b = rInt(12, 36), ans = a + b;
          res = makeQ(t(`Can thứ nhất có ${a} lít dầu, can thứ hai có ${b} lít dầu. Cả hai can có ? lít`, `Can 1 has ${a} L, can 2 has ${b} L. Total = ? L`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'units:vol', cfg, `Tổng số lít dầu: ${a} + ${b} = ${ans} lít`);
        } else if (kind === 'kg') {
          const a = rInt(35, 85), b = rInt(14, 29), ans = a - b;
          res = makeQ(t(`Bao gạo nặng ${a} kg, đã dùng hết ${b} kg. Còn lại ? kg`, `A ${a} kg rice bag used ${b} kg. Remaining = ? kg`), ans, [ans + 10, Math.max(1, ans - 10), a + b], 'units:mass', cfg, `Số gạo còn lại: ${a} − ${b} = ${ans} kg`);
        } else if (kind === 'cm_mm') {
          const v = rInt(2, 9), ans = v * 10;
          res = makeQ(t(`Đổi: ${v} cm = ? mm`, `Convert: ${v} cm = ? mm`), ans, [ans + 10, ans + 20, v * 100], 'units:len', cfg, `1 cm = 10 mm → ${v} cm = ${ans} mm`);
        } else {
          const v = rInt(2, 8), ans = v * 1000;
          res = makeQ(t(`Đổi: ${v} km = ? m`, `Convert: ${v} km = ? m`), ans, [v * 100, ans + 1000, Math.max(1000, ans - 1000)], 'units:len', cfg, `1 km = 1.000 m → ${v} km = ${ans} m`);
        }
        break;
      }
      case 'g2_peri_shape': {
        if (Math.random() < 0.55) {
          const a = rInt(8, 22), b = rInt(9, 24), c = rInt(10, 25), ans = a + b + c;
          res = makeQ(t(`Chu vi hình tam giác có 3 cạnh ${a} cm, ${b} cm, ${c} cm là ? cm`, `Perimeter of triangle (${a}, ${b}, ${c} cm) = ? cm`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'geom:perimeter', cfg, `Chu vi hình tam giác = tổng độ dài 3 cạnh = ${a} + ${b} + ${c} = ${ans} cm`);
        } else {
          const a = rInt(6, 15), b = rInt(7, 16), c = rInt(8, 15), d = rInt(6, 14), ans = a + b + c + d;
          res = makeQ(t(`Chu vi hình tứ giác có 4 cạnh ${a} cm, ${b} cm, ${c} cm, ${d} cm là ? cm`, `Perimeter of quad (${a}, ${b}, ${c}, ${d} cm) = ? cm`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'geom:perimeter', cfg, `Chu vi hình tứ giác = tổng 4 cạnh = ${a} + ${b} + ${c} + ${d} = ${ans} cm`);
        }
        break;
      }
      case 'g2_stat_table': {
        let t1 = rInt(11, 26), t2 = rInt(14, 30), t3 = rInt(18, 36);
        if (Math.max(t1, t2, t3) === Math.min(t1, t2, t3)) t3 += 6;
        if (Math.random() < 0.55) {
          const ans = t1 + t2 + t3;
          res = makeQ(t(`Bảng số sách đọc: Tổ 1: ${t1}, Tổ 2: ${t2}, Tổ 3: ${t3}. Cả 3 tổ đọc ? quyển`, `Books read: Team 1: ${t1}, Team 2: ${t2}, Team 3: ${t3}. Total = ?`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'stat:table', cfg, `Tổng số sách cả 3 tổ: ${t1} + ${t2} + ${t3} = ${ans} quyển`);
        } else {
          const mx = Math.max(t1, t2, t3), mn = Math.min(t1, t2, t3), ans = mx - mn;
          res = makeQ(t(`Số hoa hái được: An: ${t1}, Bình: ${t2}, Chi: ${t3}. Bạn nhiều nhất hơn bạn ít nhất ? bông`, `Flowers: An ${t1}, Binh ${t2}, Chi ${t3}. Max minus min = ?`), ans, [ans + 10, Math.max(1, ans + 2), mx + mn], 'stat:table', cfg, `Nhiều nhất là ${mx}, ít nhất là ${mn} → hơn nhau: ${mx} − ${mn} = ${ans} bông`);
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
      case 'g3_col100k': {
        if (Math.random() < 0.55) {
          const a = rInt(12400, 48500), b = rInt(11500, 45500), ans = a + b;
          res = makeQ(`${a} + ${b}`, ans, [ans + 100, ans - 100, ans + 1000], 'natural:+', cfg, `Đặt tính thẳng hàng từ phải sang trái: ${a} + ${b} = ${ans}`, { columnReady: true });
        } else {
          const b = rInt(12500, 38500), ans = rInt(11500, 46500), a = b + ans;
          res = makeQ(`${a} − ${b}`, ans, [ans + 100, ans - 100, ans + 1000], 'natural:-', cfg, `Đặt tính thẳng hàng từ phải sang trái: ${a} − ${b} = ${ans}`, { columnReady: true });
        }
        break;
      }
      case 'g3_num100k': {
        const kind = pickAny(['roman', 'round100', 'round10', 'digitVal']);
        if (kind === 'roman') {
          const romans = [['IV', 4], ['VI', 6], ['VII', 7], ['VIII', 8], ['IX', 9], ['XI', 11], ['XII', 12], ['XIV', 14], ['XV', 15], ['XVI', 16], ['XIX', 19], ['XX', 20]];
          const [sym, val] = pickAny(romans);
          res = makeQ(t(`Số La Mã ${sym} có giá trị là số nào?`, `What number is Roman numeral ${sym}?`), val, [val + 1, Math.max(1, val - 1), val + 2], 'number:roman', cfg, `Quy tắc số La Mã (I=1, V=5, X=10): ${sym} = ${val}`);
        } else if (kind === 'round100') {
          const base = rInt(12, 85) * 100, rem = pickAny([18, 24, 37, 42, 56, 68, 79, 85]);
          const n = base + rem, ans = rem >= 50 ? base + 100 : base;
          res = makeQ(t(`Làm tròn số ${n} đến hàng trăm ta được ?`, `Round ${n} to the nearest hundred: ?`), ans, [ans + 100, Math.max(100, ans - 100), ans + 200], 'number:round', cfg, `Chữ số hàng chục là ${Math.floor(rem / 10)} ${rem >= 50 ? '≥ 5 nên làm tròn lên' : '< 5 nên làm tròn xuống'} → ${ans}`);
        } else if (kind === 'round10') {
          const base = rInt(12, 95) * 10, rem = pickAny([1, 2, 3, 4, 6, 7, 8, 9]);
          const n = base + rem, ans = rem >= 5 ? base + 10 : base;
          res = makeQ(t(`Làm tròn số ${n} đến hàng chục ta được ?`, `Round ${n} to the nearest ten: ?`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'number:round', cfg, `Chữ số hàng đơn vị là ${rem} ${rem >= 5 ? '≥ 5 nên làm tròn lên' : '< 5 nên làm tròn xuống'} → ${ans}`);
        } else {
          const d = rInt(2, 9), n = rInt(1, 8) * 10000 + d * 1000 + rInt(112, 899), ans = d * 1000;
          res = makeQ(t(`Trong số ${n}, chữ số ${d} ở hàng nghìn có giá trị là ?`, `In ${n}, value of digit ${d} in thousands place is ?`), ans, [d * 100, d * 10000, ans + 1000], 'natural:place', cfg, `Chữ số ${d} đứng ở hàng nghìn nên có giá trị là ${ans}`);
        }
        break;
      }
      case 'g3_midpoint': {
        const bank = [
          () => {
            const half = rInt(6, 28), ab = half * 2;
            return makeQ(t(`M là trung điểm của đoạn thẳng AB dài ${ab} cm. Độ dài đoạn AM là ? cm`, `M is midpoint of AB (${ab} cm). Length of AM = ? cm`), half, [half + 2, Math.max(2, half - 2), half + 10], 'geom:midpoint', cfg, `Trung điểm chia đoạn thẳng thành 2 phần bằng nhau:\nAM = ${ab} ÷ 2 = ${half} cm`);
          },
          () => {
            const half = rInt(7, 25), ab = half * 2;
            return makeQ(t(`O là trung điểm đoạn thẳng CD, biết OC = ${half} cm. Độ dài đoạn CD là ? cm`, `O is midpoint of CD, OC = ${half} cm. Length of CD = ? cm`), ab, [ab + 10, Math.max(4, ab - 10), half], 'geom:midpoint', cfg, `CD gấp 2 lần OC: CD = ${half} × 2 = ${ab} cm`);
          },
          () => {
            const facts = [
              { q: t('Hình hộp chữ nhật có mấy đỉnh?', 'How many vertices does a rectangular prism have?'), a: 8, near: [6, 10, 12], exp: 'Hình hộp chữ nhật (và hình lập phương) có 8 đỉnh, 12 cạnh, 6 mặt.' },
              { q: t('Hình lập phương có mấy cạnh?', 'How many edges does a cube have?'), a: 12, near: [6, 8, 10], exp: 'Hình lập phương có 12 cạnh bằng nhau.' },
              { q: t('Hình hộp chữ nhật có mấy mặt?', 'How many faces does a rectangular prism have?'), a: 6, near: [4, 8, 12], exp: 'Hình hộp chữ nhật có 6 mặt đều là hình chữ nhật.' }
            ];
            const it = pickAny(facts);
            return makeQ(it.q, it.a, it.near, 'geom:3d', cfg, it.exp);
          }
        ];
        res = pickAny(bank)();
        break;
      }
      case 'g3_money_ml': {
        const kind = pickAny(['money', 'ml', 'calendar']);
        if (kind === 'money') {
          const p1 = rInt(3, 12), p2 = rInt(4, 15), pay = pickAny([30, 50]);
          const ans = pay - (p1 + p2);
          res = makeQ(t(`An mua bút hết ${p1} nghìn đồng và vở hết ${p2} nghìn đồng. Đưa ${pay} nghìn đồng được trả lại ? nghìn đồng`, `An spent ${p1}k & ${p2}k VND, paid ${pay}k. Change = ?k VND`), ans, [ans + 10, Math.max(1, ans - 10), p1 + p2], 'units:money', cfg, `Tổng tiền mua: ${p1} + ${p2} = ${p1 + p2} nghìn\nTiền trả lại: ${pay} − ${p1 + p2} = ${ans} nghìn đồng`);
        } else if (kind === 'ml') {
          const l = rInt(1, 5), ml = pickAny([0, 250, 500, 750]), ans = l * 1000 + ml;
          res = makeQ(ml ? t(`Đổi: ${l} lít ${ml} ml = ? ml`, `${l} L ${ml} ml = ? ml`) : t(`Đổi: ${l} lít = ? ml`, `${l} L = ? ml`), ans, [ans + 100, Math.max(100, ans - 100), ans + 1000], 'units:vol', cfg, `1 lít = 1.000 ml → ${l} × 1.000${ml ? ' + ' + ml : ''} = ${ans} ml`);
        } else {
          const m31 = pickAny([1, 3, 5, 7, 8, 10, 12]);
          const m30 = pickAny([4, 6, 9, 11]);
          if (Math.random() < 0.5) {
            res = makeQ(t(`Tháng ${m31} có bao nhiêu ngày?`, `How many days are in month ${m31}?`), 31, [28, 29, 30], 'units:time', cfg, `Các tháng 1, 3, 5, 7, 8, 10, 12 đều có 31 ngày.`);
          } else {
            res = makeQ(t(`Tháng ${m30} có bao nhiêu ngày?`, `How many days are in month ${m30}?`), 30, [28, 29, 31], 'units:time', cfg, `Các tháng 4, 6, 9, 11 đều có 30 ngày.`);
          }
        }
        break;
      }
      case 'g3_stat_prob': {
        let a = rInt(18, 34), b = rInt(20, 38), c = rInt(24, 42), d = rInt(19, 35);
        if (Math.max(a, b, c, d) === Math.min(a, b, c, d)) c += 7;
        if (Math.random() < 0.55) {
          const ans = a + b + c + d;
          res = makeQ(t(`Số học sinh giỏi 4 lớp: 3A: ${a}, 3B: ${b}, 3C: ${c}, 3D: ${d}. Cả khối có ? học sinh giỏi`, `Top students: 3A:${a}, 3B:${b}, 3C:${c}, 3D:${d}. Total = ?`), ans, [ans + 10, Math.max(20, ans - 10), ans + 20], 'stat:table', cfg, `Tổng 4 lớp: ${a} + ${b} + ${c} + ${d} = ${ans} học sinh`);
        } else {
          const mx = Math.max(a, b, c, d), mn = Math.min(a, b, c, d), ans = mx - mn;
          res = makeQ(t(`Số cây trồng 4 ngày: ${a}, ${b}, ${c}, ${d}. Ngày nhiều nhất hơn ngày ít nhất ? cây`, `Trees planted over 4 days: ${a}, ${b}, ${c}, ${d}. Max − min = ?`), ans, [ans + 2, Math.max(1, ans - 2), ans + 10], 'stat:table', cfg, `Ngày nhiều nhất: ${mx} cây; ít nhất: ${mn} cây → chênh lệch: ${mx} − ${mn} = ${ans} cây`);
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
      case 'g4_million_round': {
        const kind = pickAny(['letter2', 'round1000', 'digitVal']);
        if (kind === 'letter2') {
          const m = rInt(12, 45), n = rInt(4, 12), k = rInt(2, 6), ans = m + n * k;
          res = makeQ(t(`Tính giá trị biểu thức m + n × ${k} với m = ${m}, n = ${n}`, `Evaluate m + n × ${k} when m = ${m}, n = ${n}`), ans, [ans + 10, Math.max(10, ans - 10), (m + n) * k], 'algebra:eval', cfg, `Thay số rồi tính nhân trước:\n${m} + ${n} × ${k} = ${m} + ${n * k} = ${ans}`);
        } else if (kind === 'round1000') {
          const base = rInt(12, 85) * 1000, rem = pickAny([140, 280, 420, 560, 720, 890]);
          const n = base + rem, ans = rem >= 500 ? base + 1000 : base;
          res = makeQ(t(`Làm tròn số ${n} đến hàng nghìn được ?`, `Round ${n} to nearest thousand: ?`), ans, [ans + 1000, Math.max(1000, ans - 1000), ans + 2000], 'number:round', cfg, `Chữ số hàng trăm là ${Math.floor(rem / 100)} ${rem >= 500 ? '≥ 5 nên làm tròn lên' : '< 5 nên làm tròn xuống'} → ${ans}`);
        } else {
          const d = rInt(2, 9), n = d * 10000 + rInt(1234, 8765), ans = d * 10000;
          res = makeQ(t(`Trong số ${n}, chữ số ${d} ở hàng chục nghìn có giá trị là ?`, `In ${n}, value of digit ${d} in ten-thousands place is ?`), ans, [d * 1000, ans + 10000, Math.max(10000, ans - 10000)], 'natural:place', cfg, `Chữ số ${d} đứng ở hàng chục nghìn nên có giá trị là ${ans}`);
        }
        break;
      }
      case 'g4_frac_cmp': {
        if (Math.random() < 0.5) {
          const basePairs = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [3, 7], [5, 6]];
          const [n, d] = pickAny(basePairs), k = rInt(2, 7);
          const ans = `${n}/${d}`;
          res = makeQ(t(`Rút gọn phân số ${n * k}/${d * k} về phân số tối giản`, `Simplify ${n * k}/${d * k}`), ans, [`${n + 1}/${d}`, `${Math.max(1, n - 1)}/${d}`, `${n + 2}/${d}`], 'ratio:simplify', cfg, `Chia cả tử và mẫu cho ${k}: (${n * k} ÷ ${k}) / (${d * k} ÷ ${k}) = ${ans}`);
        } else {
          const d1 = pickAny([3, 4, 5, 6, 8]), n1 = rInt(1, d1 - 1), k = rInt(2, 6);
          const ans = n1 * k, d2 = d1 * k;
          res = makeQ(t(`Điền số thích hợp: ${n1}/${d1} = ?/${d2}`, `Fill in: ${n1}/${d1} = ?/${d2}`), ans, [ans + 1, Math.max(1, ans - 1), ans + d1], 'ratio:frac', cfg, `Mẫu tăng ${k} lần (${d1} × ${k} = ${d2}) nên tử cũng nhân ${k}: ${n1} × ${k} = ${ans}`);
        }
        break;
      }
      case 'g4_angle': {
        const bank = [
          { q: t('Góc vuông có số đo bằng ? độ', 'A right angle measures ? degrees'), a: 90, near: [60, 120, 180], exp: 'Góc vuông luôn có số đo đúng bằng 90°.' },
          { q: t('Góc bẹt có số đo bằng ? độ', 'A straight angle measures ? degrees'), a: 180, near: [90, 120, 360], exp: 'Góc bẹt bằng 2 góc vuông = 180°.' },
          { q: t('Góc bẹt gấp mấy lần góc vuông?', 'A straight angle is how many times a right angle?'), a: 2, near: [3, 4, 5], exp: '180° ÷ 90° = 2 lần.' },
          { q: t('Nửa góc vuông có số đo bằng ? độ', 'Half of a right angle measures ? degrees'), a: 45, near: [35, 55, 65], exp: '90° ÷ 2 = 45° (góc nhọn).' },
          { q: t('Lúc 3 giờ đúng, kim giờ và kim phút tạo thành góc ? độ', 'At 3:00, clock hands form a ? degree angle'), a: 90, near: [60, 120, 180], exp: 'Lúc 3 giờ (hoặc 9 giờ), hai kim vuông góc nhau = 90°.' },
          { q: t('Lúc 6 giờ đúng, kim giờ và kim phút tạo thành góc ? độ', 'At 6:00, clock hands form a ? degree angle'), a: 180, near: [90, 120, 150], exp: 'Lúc 6 giờ, hai kim thẳng hàng tạo thành góc bẹt = 180°.' },
          { q: t('Lúc 2 giờ đúng, kim giờ và kim phút tạo thành góc ? độ', 'At 2:00, clock hands form a ? degree angle'), a: 60, near: [30, 90, 120], exp: 'Mỗi giờ trên đồng hồ ứng với 30° → 2 giờ = 2 × 30° = 60°.' }
        ];
        const it = pickAny(bank);
        res = makeQ(it.q, it.a, it.near, 'geom:angle', cfg, it.exp);
        break;
      }
      case 'g4_area_units': {
        const kind = pickAny(['yen_kg', 'ta_yen', 'dm2_cm2', 'cm2_mm2']);
        if (kind === 'yen_kg') {
          const y = rInt(2, 9), kg = pickAny([0, 5, 8]), ans = y * 10 + kg;
          res = makeQ(kg ? t(`Đổi: ${y} yến ${kg} kg = ? kg`, `${y}0 + ${kg} kg = ? kg`) : t(`Đổi: ${y} yến = ? kg`, `${y} yen = ? kg`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'units:mass', cfg, `1 yến = 10 kg → ${y} × 10${kg ? ' + ' + kg : ''} = ${ans} kg`);
        } else if (kind === 'ta_yen') {
          const ta = rInt(2, 8), y = pickAny([2, 4, 5]), ans = ta * 100 + y * 10;
          res = makeQ(t(`Đổi: ${ta} tạ ${y} yến = ? kg`, `${ta} quintals ${y} yen = ? kg`), ans, [ans + 10, ans + 100, Math.max(100, ans - 100)], 'units:mass', cfg, `1 tạ = 100 kg, 1 yến = 10 kg → ${ta * 100} + ${y * 10} = ${ans} kg`);
        } else if (kind === 'dm2_cm2') {
          const d = rInt(2, 9), c = pickAny([15, 25, 40, 50]), ans = d * 100 + c;
          res = makeQ(t(`Đổi: ${d} dm² ${c} cm² = ? cm²`, `${d} dm² ${c} cm² = ? cm²`), ans, [ans + 10, ans + 100, Math.max(100, ans - 100)], 'units:area', cfg, `1 dm² = 100 cm² → ${d} × 100 + ${c} = ${ans} cm²`);
        } else {
          const c = rInt(3, 15), ans = c * 100;
          res = makeQ(t(`Đổi: ${c} cm² = ? mm²`, `${c} cm² = ? mm²`), ans, [c * 10, ans + 100, Math.max(100, ans - 100)], 'units:area', cfg, `1 cm² = 100 mm² → ${c} × 100 = ${ans} mm²`);
        }
        break;
      }
      case 'g4_stat_chart': {
        if (Math.random() < 0.5) {
          const avgV = rInt(18, 42), d1 = rInt(2, 8), d2 = rInt(2, 6);
          const arr = [avgV - d1, avgV + d1, avgV - d2, avgV + d2];
          res = makeQ(t(`Biểu đồ cột số cây 4 lớp trồng: 4A: ${arr[0]}, 4B: ${arr[1]}, 4C: ${arr[2]}, 4D: ${arr[3]}. Trung bình mỗi lớp trồng ? cây`, `Bar chart trees: 4A:${arr[0]}, 4B:${arr[1]}, 4C:${arr[2]}, 4D:${arr[3]}. Average = ?`), avgV, [avgV + 10, Math.max(5, avgV - 10), avgV + 20], 'stat:chart', cfg, `Trung bình cộng = (${arr.join(' + ')}) ÷ 4 = ${avgV * 4} ÷ 4 = ${avgV} cây`);
        } else {
          const n1 = rInt(3, 7), price = rInt(6, 15), total1 = n1 * price, n2 = n1 + rInt(2, 5), ans = n2 * price;
          res = makeQ(t(`Mua ${n1} quyển vở hết ${total1} nghìn đồng. Mua ${n2} quyển vở như thế hết ? nghìn đồng`, `${n1} notebooks cost ${total1}k. ${n2} notebooks cost ?k`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'word:unitary', cfg, `Giá 1 quyển vở: ${total1} ÷ ${n1} = ${price} nghìn\nGiá ${n2} quyển: ${price} × ${n2} = ${ans} nghìn đồng`);
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
      case 'g5_dec_place': {
        const kind = pickAny(['m_cm', 'kg_g', 'round10', 'frac_dec']);
        if (kind === 'm_cm') {
          const m = rInt(1, 14), cm = pickAny([5, 12, 25, 35, 48, 75]), ans = Number((m + cm / 100).toFixed(2));
          res = makeQ(t(`Viết ${m} m ${cm} cm dưới dạng số thập phân (đơn vị mét)`, `Write ${m} m ${cm} cm as decimal meters`), fmtNum(ans), [Number((ans + 1).toFixed(2)), Number((ans + 0.1).toFixed(2)), Number(Math.max(0.1, ans - 1).toFixed(2))], 'decimal:units', cfg, `1 cm = 0,01 m → ${m} m ${cm} cm = ${fmtNum(ans)} m`);
        } else if (kind === 'kg_g') {
          const kg = rInt(1, 12), gVal = pickAny([200, 250, 500, 750]), ans = Number((kg + gVal / 1000).toFixed(2));
          res = makeQ(t(`Viết ${kg} kg ${gVal} g dưới dạng số thập phân (đơn vị kg)`, `Write ${kg} kg ${gVal} g as decimal kg`), fmtNum(ans), [Number((ans + 1).toFixed(2)), Number((ans + 0.1).toFixed(2)), Number(Math.max(0.1, ans - 1).toFixed(2))], 'decimal:units', cfg, `1 kg = 1.000 g → ${kg} kg ${gVal} g = ${fmtNum(ans)} kg`);
        } else if (kind === 'round10') {
          const whole = rInt(4, 35), t10 = rInt(1, 8), h100 = pickAny([2, 3, 4, 6, 7, 8]);
          const orig = Number((whole + t10 / 10 + h100 / 100).toFixed(2));
          const ans = Number((whole + (h100 >= 5 ? t10 + 1 : t10) / 10).toFixed(1));
          res = makeQ(t(`Làm tròn số ${fmtNum(orig)} đến hàng phần mười được ?`, `Round ${fmtNum(orig)} to nearest tenth: ?`), fmtNum(ans), [Number((ans + 1).toFixed(1)), Number((ans + 0.1).toFixed(1)), Number(Math.max(0.1, ans - 1).toFixed(1))], 'decimal:round', cfg, `Chữ số hàng phần trăm là ${h100} ${h100 >= 5 ? '≥ 5 nên làm tròn lên' : '< 5 nên giữ nguyên'} → ${fmtNum(ans)}`);
        } else {
          const pairs = [[1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [2, 5, 0.4], [3, 5, 0.6], [4, 5, 0.8], [3, 8, 0.375], [7, 20, 0.35], [9, 25, 0.36]];
          const [n, d, dv] = pickAny(pairs);
          res = makeQ(t(`Viết phân số ${n}/${d} dưới dạng số thập phân`, `Convert fraction ${n}/${d} to decimal`), fmtNum(dv), [Number((dv + 0.1).toFixed(3)), Number((dv + 1).toFixed(3)), Number((dv + 0.2).toFixed(3))], 'decimal:frac', cfg, `Lấy tử chia mẫu: ${n} ÷ ${d} = ${fmtNum(dv)}`);
        }
        break;
      }
      case 'g5_dec_findx': {
        const kind = pickAny(['addX', 'subX', 'mulX', 'expr']);
        if (kind === 'addX') {
          const xVal = Number((rInt(15, 95) / 10).toFixed(1)), b = Number((rInt(12, 68) / 10).toFixed(1)), sum = Number((xVal + b).toFixed(1));
          res = makeQ(t(`Tìm x: x + ${fmtNum(b)} = ${fmtNum(sum)}`, `Find x: x + ${fmtNum(b)} = ${fmtNum(sum)}`), fmtNum(xVal), [Number((xVal + 1).toFixed(1)), Number((xVal + 2).toFixed(1)), Number(Math.max(0.1, xVal - 1).toFixed(1))], 'equation:dec', cfg, `x = ${fmtNum(sum)} − ${fmtNum(b)} = ${fmtNum(xVal)}`);
        } else if (kind === 'subX') {
          const xVal = Number((rInt(14, 75) / 10).toFixed(1)), rem = Number((rInt(15, 85) / 10).toFixed(1)), a = Number((xVal + rem).toFixed(1));
          res = makeQ(t(`Tìm x: ${fmtNum(a)} − x = ${fmtNum(rem)}`, `Find x: ${fmtNum(a)} − x = ${fmtNum(rem)}`), fmtNum(xVal), [Number((xVal + 1).toFixed(1)), Number((xVal + 2).toFixed(1)), Number(Math.max(0.1, xVal - 1).toFixed(1))], 'equation:dec', cfg, `x = ${fmtNum(a)} − ${fmtNum(rem)} = ${fmtNum(xVal)}`);
        } else if (kind === 'mulX') {
          const xVal = rInt(3, 14), k = pickAny([0.5, 1.5, 2.5, 0.25]), prod = Number((xVal * k).toFixed(2));
          res = makeQ(t(`Tìm x: x × ${fmtNum(k)} = ${fmtNum(prod)}`, `Find x: x × ${fmtNum(k)} = ${fmtNum(prod)}`), xVal, [xVal + 1, Math.max(1, xVal - 1), xVal + 2], 'equation:dec', cfg, `x = ${fmtNum(prod)} ÷ ${fmtNum(k)} = ${xVal}`);
        } else {
          const a = Number((rInt(15, 85) / 10).toFixed(1)), b = pickAny([1.5, 2.5, 3.5]), c = pickAny([2, 4, 6]), ans = Number((a + b * c).toFixed(1));
          res = makeQ(`${fmtNum(a)} + ${fmtNum(b)} × ${c}`, fmtNum(ans), [Number((ans + 1).toFixed(1)), Number((ans + 2).toFixed(1)), Number(Math.max(0.1, ans - 1).toFixed(1))], 'decimal:expression', cfg, `Nhân trước, cộng sau:\n${fmtNum(b)} × ${c} = ${fmtNum(b * c)} → ${fmtNum(a)} + ${fmtNum(b * c)} = ${fmtNum(ans)}`);
        }
        break;
      }
      case 'g5_box_surface': {
        const kind = pickAny(['cubeSxq', 'cubeStp', 'boxSxq', 'dm3_cm3', 'm3_dm3']);
        if (kind === 'cubeSxq') {
          const a = rInt(2, 9), ans = a * a * 4;
          res = makeQ(t(`Diện tích xung quanh hình lập phương cạnh ${a} cm là ? cm²`, `Lateral area of cube (edge ${a} cm) = ? cm²`), ans, [a * a * 6, ans + 10, Math.max(4, ans - 10)], 'geom:surface', cfg, `Sxq lập phương = a × a × 4 = ${a} × ${a} × 4 = ${ans} cm²`);
        } else if (kind === 'cubeStp') {
          const a = rInt(2, 9), ans = a * a * 6;
          res = makeQ(t(`Diện tích toàn phần hình lập phương cạnh ${a} cm là ? cm²`, `Total surface area of cube (edge ${a} cm) = ? cm²`), ans, [a * a * 4, ans + 10, Math.max(6, ans - 10)], 'geom:surface', cfg, `Stp lập phương = a × a × 6 = ${a} × ${a} × 6 = ${ans} cm²`);
        } else if (kind === 'boxSxq') {
          const l = rInt(5, 12), w = rInt(3, 8), h = rInt(2, 6), ans = (l + w) * 2 * h;
          res = makeQ(t(`Diện tích xung quanh hình hộp CN dài ${l} cm, rộng ${w} cm, cao ${h} cm là ? cm²`, `Lateral area of ${l}×${w}×${h} cm box = ? cm²`), ans, [l * w * h, ans + 10, Math.max(10, ans - 10)], 'geom:surface', cfg, `Sxq = (dài + rộng) × 2 × cao = (${l} + ${w}) × 2 × ${h} = ${ans} cm²`);
        } else if (kind === 'dm3_cm3') {
          const v = Number((rInt(12, 85) / 10).toFixed(1)), ans = Math.round(v * 1000);
          res = makeQ(t(`Đổi: ${fmtNum(v)} dm³ = ? cm³`, `${fmtNum(v)} dm³ = ? cm³`), ans, [ans / 10, ans + 100, Math.max(100, ans - 100)], 'units:vol', cfg, `1 dm³ = 1.000 cm³ → ${fmtNum(v)} × 1.000 = ${ans} cm³`);
        } else {
          const v = Number((rInt(12, 85) / 10).toFixed(1)), ans = Math.round(v * 1000);
          res = makeQ(t(`Đổi: ${fmtNum(v)} m³ = ? dm³`, `${fmtNum(v)} m³ = ? dm³`), ans, [ans / 10, ans + 100, Math.max(100, ans - 100)], 'units:vol', cfg, `1 m³ = 1.000 dm³ → ${fmtNum(v)} × 1.000 = ${ans} dm³`);
        }
        break;
      }
      case 'g5_time_calc': {
        const kind = pickAny(['addHr', 'subMin', 'mulHr', 'arrive']);
        if (kind === 'addHr') {
          const h1 = rInt(1, 5), m1 = pickAny([20, 25, 35, 40, 45]), m2 = 60 - m1, h2 = rInt(1, 4), ans = h1 + h2 + 1;
          res = makeQ(t(`${h1} giờ ${m1} phút + ${h2} giờ ${m2} phút = ? giờ`, `${h1}h ${m1}m + ${h2}h ${m2}m = ? hours`), ans, [ans + 1, Math.max(1, ans - 1), h1 + h2], 'units:time', cfg, `${m1} phút + ${m2} phút = 60 phút = 1 giờ → ${h1} + ${h2} + 1 = ${ans} giờ`);
        } else if (kind === 'subMin') {
          const h1 = rInt(2, 4), m1 = pickAny([15, 20, 25]), h2 = 1, m2 = pickAny([40, 45, 50]);
          const ans = (h1 * 60 + m1) - (h2 * 60 + m2);
          res = makeQ(t(`${h1} giờ ${m1} phút − ${h2} giờ ${m2} phút = ? phút`, `${h1}h ${m1}m − ${h2}h ${m2}m = ? min`), ans, [ans + 10, Math.max(10, ans - 10), ans + 20], 'units:time', cfg, `Đổi sang phút: ${h1 * 60 + m1} − ${h2 * 60 + m2} = ${ans} phút`);
        } else if (kind === 'mulHr') {
          const pair = pickAny([[1, 15, 4, 5], [1, 30, 4, 6], [2, 15, 4, 9], [1, 20, 3, 4], [2, 20, 3, 7], [1, 30, 2, 3]]);
          const [h, m, k, ans] = pair;
          res = makeQ(t(`${h} giờ ${m} phút × ${k} = ? giờ`, `${h}h ${m}m × ${k} = ? hours`), ans, [ans + 1, Math.max(1, ans - 1), ans + 2], 'units:time', cfg, `${h}×${k} giờ = ${h * k} giờ; ${m}×${k} phút = ${m * k} phút = ${(m * k) / 60} giờ → tổng ${ans} giờ`);
        } else {
          const startH = rInt(6, 9), startM = pickAny([15, 20, 30, 45]), addH = rInt(1, 3), addM = 60 - startM, ans = startH + addH + 1;
          res = makeQ(t(`Xe xuất phát lúc ${startH} giờ ${startM} phút, đi hết ${addH} giờ ${addM} phút. Đến nơi lúc ? giờ`, `Leaves at ${startH}:${startM}, travels ${addH}h ${addM}m. Arrives at ? o'clock`), ans, [ans + 1, Math.max(7, ans - 1), ans + 2], 'units:time', cfg, `${startH} giờ ${startM} phút + ${addH} giờ ${addM} phút = ${ans} giờ đúng`);
        }
        break;
      }
      case 'g5_motion_adv': {
        const kind = pickAny(['meet', 'catch', 'riverDown', 'riverUp']);
        if (kind === 'meet') {
          const v1 = pickAny([35, 40, 45]), v2 = pickAny([45, 50, 55]), tHr = rInt(2, 4), s = (v1 + v2) * tHr;
          res = makeQ(t(`Hai xe cách nhau ${s} km đi ngược chiều với vận tốc ${v1} km/h và ${v2} km/h. Sau ? giờ gặp nhau`, `Two cars ${s} km apart head toward each other at ${v1} & ${v2} km/h. Meet in ? hours`), tHr, [tHr + 1, Math.max(1, tHr - 1), tHr + 2], 'motion:meet', cfg, `Tổng vận tốc: ${v1} + ${v2} = ${v1 + v2} km/h\nThời gian gặp nhau: ${s} ÷ ${v1 + v2} = ${tHr} giờ`);
        } else if (kind === 'catch') {
          const v1 = pickAny([30, 35, 40]), diff = pickAny([15, 20, 25]), v2 = v1 + diff, tHr = rInt(2, 4), s = diff * tHr;
          res = makeQ(t(`Xe sau (${v2} km/h) đuổi theo xe trước (${v1} km/h) cách ${s} km. Sau ? giờ đuổi kịp`, `Car (${v2} km/h) chases car (${v1} km/h) ${s} km ahead. Catches up in ? hours`), tHr, [tHr + 1, Math.max(1, tHr - 1), tHr + 2], 'motion:catch', cfg, `Hiệu vận tốc: ${v2} − ${v1} = ${diff} km/h\nThời gian đuổi kịp: ${s} ÷ ${diff} = ${tHr} giờ`);
        } else if (kind === 'riverDown') {
          const vBoat = rInt(16, 28), vWater = rInt(2, 5), ans = vBoat + vWater;
          res = makeQ(t(`Ca nô có vận tốc khi nước lặng là ${vBoat} km/h, dòng nước chảy ${vWater} km/h. Vận tốc xuôi dòng là ? km/h`, `Boat speed ${vBoat} km/h, current ${vWater} km/h. Downstream speed = ? km/h`), ans, [vBoat - vWater, ans + 10, Math.max(5, ans - 10)], 'motion:river', cfg, `Vận tốc xuôi dòng = V thực + V dòng nước = ${vBoat} + ${vWater} = ${ans} km/h`);
        } else {
          const vBoat = rInt(18, 30), vWater = rInt(2, 5), ans = vBoat - vWater;
          res = makeQ(t(`Ca nô có vận tốc khi nước lặng là ${vBoat} km/h, dòng nước chảy ${vWater} km/h. Vận tốc ngược dòng là ? km/h`, `Boat speed ${vBoat} km/h, current ${vWater} km/h. Upstream speed = ? km/h`), ans, [vBoat + vWater, ans + 10, Math.max(5, ans - 10)], 'motion:river', cfg, `Vận tốc ngược dòng = V thực − V dòng nước = ${vBoat} − ${vWater} = ${ans} km/h`);
        }
        break;
      }
      case 'g5_stat_pie': {
        const kind = pickAny(['pie', 'discount', 'prob']);
        if (kind === 'pie') {
          const total = pickAny([40, 60, 80, 120, 200]), pct = pickAny([15, 20, 25, 30, 35, 40]);
          const ans = (total * pct) / 100;
          res = makeQ(t(`Biểu đồ quạt tròn của ${total} học sinh cho biết ${pct}% thích Bóng đá. Có ? học sinh thích Bóng đá`, `Pie chart of ${total} students: ${pct}% like football. How many students?`), ans, [ans + 10, Math.max(2, ans - 10), ans + 20], 'stat:pie', cfg, `Số học sinh = ${total} × ${pct} ÷ 100 = ${ans} học sinh`);
        } else if (kind === 'discount') {
          const orig = pickAny([100, 200, 300, 400, 500]), disc = pickAny([10, 15, 20, 25]), ans = orig - (orig * disc) / 100;
          res = makeQ(t(`Món hàng giá ${orig} nghìn đồng được giảm giá ${disc}%. Giá sau khi giảm là ? nghìn đồng`, `Item costs ${orig}k, ${disc}% off. Sale price = ?k`), ans, [ans + 10, Math.max(10, ans - 10), (orig * disc) / 100], 'percent:discount', cfg, `Số tiền giảm: ${orig} × ${disc}% = ${(orig * disc) / 100} nghìn\nGiá bán mới: ${orig} − ${(orig * disc) / 100} = ${ans} nghìn đồng`);
        } else {
          const trials = pickAny([20, 25, 50]), hits = rInt(4, Math.min(trials - 2, 18)), pct = Math.round((hits / trials) * 100);
          res = makeQ(t(`Tung đồng xu ${trials} lần thấy ${hits} lần mặt ngửa. Tỉ số phần trăm xuất hiện mặt ngửa là ? %`, `Flipped coin ${trials} times, ${hits} heads. Percentage of heads = ? %`), pct, [pct + 10, Math.max(5, pct - 10), 100 - pct], 'stat:prob', cfg, `Tỉ số phần trăm = (${hits} ÷ ${trials}) × 100% = ${pct}%`);
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
    return tagTopic(res, topicId, g, cfg);
  }

  function getCandidateTopicIdsForGrade(g, domainFilter = 'all') {
    const list = NUMI_GRADE_TOPICS[g] || [];
    return list
      .filter(x => x.id !== 'all' && (domainFilter === 'all' || Number(g) < 6 || x.domain === domainFilter))
      .map(x => x.id);
  }

  function buildProgressiveTierSchedule(totalCount, difficultyMode = 'progressive') {
    const n = Math.max(1, Number(totalCount) || 1);
    if (difficultyMode === 'easy' || difficultyMode === 'medium' || difficultyMode === 'hard') {
      return Array.from({ length: n }, () => difficultyMode);
    }
    if (n === 1) return ['medium'];
    if (n === 2) return ['easy', 'hard'];
    const nEasy = Math.max(1, Math.round(n * 0.4));
    const nHard = Math.max(1, Math.round(n * 0.25));
    const nMed = Math.max(0, n - nEasy - nHard);
    return [
      ...Array.from({ length: nEasy }, () => 'easy'),
      ...Array.from({ length: nMed }, () => 'medium'),
      ...Array.from({ length: nHard }, () => 'hard')
    ];
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

  // Hook generate() to support single topic, multi-topic synthesis (config.topics), THCS Number/Geometry domain filter, and balanced streams
  const genBeforeTopics = typeof generate === 'function' ? generate : null;
  if (genBeforeTopics) {
    generate = function (c) {
      const cfg = c || (typeof window !== 'undefined' && window.config) || config;
      const g = cfg && cfg.grade && cfg.grade !== 'custom' ? Number(cfg.grade) : null;
      const topic = cfg && cfg.topic ? String(cfg.topic) : 'all';
      const topicsArr = Array.isArray(cfg?.topics) ? cfg.topics.filter(id => id && id !== 'all') : [];
      const domainFilter = cfg?.domainFilter || 'all';

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

      // 2b. Explicit THCS Domain Filter ('number' or 'geometry') on Grade 6-9
      if (g && g >= 6 && (domainFilter === 'number' || domainFilter === 'geometry')) {
        const domIds = getCandidateTopicIdsForGrade(g, domainFilter);
        if (domIds.length) {
          const pickedId = nextFromDeck(`dom:${g}:${domainFilter}`, domIds);
          const tq = generateTopicQuestion(pickedId, cfg);
          if (tq) return tq;
        }
      }

      // 3. "Tổng hợp tất cả dạng Lớp X" (normal style & full grade ops):
      //    Grades 1-5 get 80% rich balanced multi-format synthesis; Grades 6-9 get 55% specialized Number + Geometry exam mix.
      const gradeMeta = typeof NUMI_GRADES !== 'undefined' ? NUMI_GRADES[g] : null;
      const isFullGradeOps = !cfg.ops || !gradeMeta || cfg.ops.length >= gradeMeta.ops.length;
      const mixProb = g && g <= 5 ? 0.8 : 0.55;
      if (g && NUMI_GRADE_TOPICS[g] && isFullGradeOps && (!cfg.questionStyle || cfg.questionStyle === 'normal') && Math.random() < mixProb) {
        const specializedIds = getCandidateTopicIdsForGrade(g, 'all');
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

  // Wrap generateUniqueQuestions() so sessions are balanced across topics AND progress scientifically from Easy -> Medium -> Hard!
  const genUniqueBeforeTopics = typeof generateUniqueQuestions === 'function' ? generateUniqueQuestions : null;
  if (genUniqueBeforeTopics) {
    generateUniqueQuestions = function (count, c) {
      const cfg = c || (typeof window !== 'undefined' && window.config) || config;
      const g = cfg && cfg.grade && cfg.grade !== 'custom' ? Number(cfg.grade) : null;
      const topicsArr = Array.isArray(cfg?.topics) ? cfg.topics.filter(id => id && id !== 'all') : [];
      const singleTopic = cfg && cfg.topic && cfg.topic !== 'all' ? String(cfg.topic) : null;
      const domainFilter = cfg?.domainFilter || 'all';
      const diffMode = cfg?.difficultyMode || 'progressive';
      const total = Math.max(1, Number(count) || 10);

      let plan = null;
      if (topicsArr.length > 0) {
        plan = buildBalancedTopicPlan(topicsArr, total);
      } else if (singleTopic) {
        plan = Array.from({ length: total }, () => singleTopic);
      } else if (g && NUMI_GRADE_TOPICS[g] && (!cfg.questionStyle || cfg.questionStyle === 'normal')) {
        const gradeMeta = typeof NUMI_GRADES !== 'undefined' ? NUMI_GRADES[g] : null;
        const isFullGradeOps = !cfg.ops || !gradeMeta || cfg.ops.length >= gradeMeta.ops.length;
        if (isFullGradeOps || (g >= 6 && domainFilter !== 'all')) {
          const allIds = getCandidateTopicIdsForGrade(g, domainFilter);
          if (allIds.length) plan = buildBalancedTopicPlan(allIds, total);
        }
      }

      if (!plan || !plan.length) return genUniqueBeforeTopics(total, cfg);

      const tierSchedule = buildProgressiveTierSchedule(plan.length, diffMode);
      const out = [];
      const seen = new Set();
      for (let i = 0; i < plan.length; i++) {
        const topicId = plan[i];
        const slotTier = tierSchedule[i] || 'medium';
        let q = null;
        for (let tries = 0; tries < 25; tries++) {
          const cand = generateTopicQuestion(topicId, { ...cfg, topic: topicId, topics: [topicId], difficulty: slotTier });
          if (cand) {
            q = cand;
            if (!seen.has(cand.q)) break;
          }
        }
        if (!q) q = generate({ ...cfg, difficulty: slotTier });
        if (q) {
          seen.add(q.q);
          out.push(q);
        }
      }
      return out;
    };
    if (typeof window !== 'undefined') window.generateUniqueQuestions = generateUniqueQuestions;
    if (typeof global !== 'undefined') global.generateUniqueQuestions = generateUniqueQuestions;
  }

  let presetManualCount = null;
  let presetCountGrade = null;

  function formatTimingRange(rec) {
    if (!rec) return '30s';
    if (rec.minSeconds && rec.maxSeconds && rec.minSeconds !== rec.maxSeconds) {
      return `${rec.minSeconds}s–${rec.maxSeconds}s`;
    }
    return `${rec.seconds}s`;
  }

  function syncPresetCountToForm(countVal, rec) {
    const cleanCount = Math.max(1, Math.min(50, Math.round(Number(countVal) || rec.count || 10)));
    if (typeof config !== 'undefined') {
      config.count = cleanCount;
      config.seconds = rec.seconds;
      if (typeof window !== 'undefined') window.config = config;
      if (typeof global !== 'undefined') global.config = config;
    }
    const cntInput = $('#lessonCount');
    const secInput = $('#lessonSeconds');
    if (cntInput) cntInput.value = cleanCount;
    if (secInput) secInput.value = rec.seconds;
    $$('[data-count]').forEach(b => b.classList.toggle('chosen', Number(b.dataset.count) === cleanCount));
    $$('[data-seconds]').forEach(b => b.classList.toggle('chosen', Number(b.dataset.seconds) === rec.seconds));
    const stickySub = $('#stickySummaryText');
    if (stickySub) stickySub.textContent = `${cleanCount} ${t('câu', 'qs')} · ${formatTimingRange(rec)}`;
    return cleanCount;
  }

  function applySmartTimingToForm(gradeNum, selectedList) {
    const rec = getRecommendedTiming(gradeNum, selectedList);
    const chosenCount = (presetManualCount !== null && presetCountGrade === Number(gradeNum))
      ? presetManualCount
      : rec.count;
    const effectiveCount = syncPresetCountToForm(chosenCount, rec);
    return { ...rec, count: effectiveCount };
  }

  function syncCustomFieldsetsVisibility(isPreset) {
    const form = $('#config');
    if (form && form.classList) {
      form.classList.toggle('is-preset-mode', Boolean(isPreset));
    }
  }

  // Inject Grade Topic Stream pills, THCS Number vs Geometry Split, 3-Tier Difficulty Progression & Smart Primary/Secondary Timer Bar!
  function renderTopicPillsForGrade(gradeNum, applyTiming = false) {
    const host = $('#gradeTopicsWrap');
    const g = Number(gradeNum);
    const list = NUMI_GRADE_TOPICS[g];
    syncCustomFieldsetsVisibility(Boolean(list));
    if (!host) return;
    if (!list) {
      host.hidden = true;
      host.innerHTML = '';
      if (typeof config !== 'undefined') { config.topic = 'all'; config.topics = []; config.domainFilter = 'all'; }
      return;
    }
    if (presetCountGrade !== g) {
      presetManualCount = null;
      presetCountGrade = g;
    }
    const isSecondary = g >= 6;
    const activeDomain = isSecondary && ['all', 'number', 'geometry'].includes(config?.domainFilter)
      ? config.domainFilter
      : 'all';
    const activeDiffMode = ['progressive', 'easy', 'medium', 'hard'].includes(config?.difficultyMode)
      ? config.difficultyMode
      : 'progressive';
    if (typeof config !== 'undefined') {
      config.domainFilter = activeDomain;
      config.difficultyMode = activeDiffMode;
    }

    const allSpecialized = list.filter(x => x.id !== 'all');
    const validIds = new Set(allSpecialized.map(x => x.id));
    const numberTopics = allSpecialized.filter(x => x.domain !== 'geometry');
    const geomTopics = allSpecialized.filter(x => x.domain === 'geometry');
    const domainFilteredIds = isSecondary && activeDomain !== 'all'
      ? allSpecialized.filter(x => x.domain === activeDomain).map(x => x.id)
      : allSpecialized.map(x => x.id);

    let selectedList = Array.isArray(config?.topics) ? config.topics.filter(id => validIds.has(id)) : [];
    if (!selectedList.length && config?.topic && validIds.has(config.topic)) {
      selectedList = [config.topic];
    }

    const effectiveTimingIds = selectedList.length ? selectedList : (activeDomain !== 'all' ? domainFilteredIds : []);
    const curRec = applyTiming
      ? applySmartTimingToForm(g, effectiveTimingIds)
      : {
          ...getRecommendedTiming(g, effectiveTimingIds),
          count: Number(config?.count) || getRecommendedTiming(g, effectiveTimingIds).count
        };
    const activeCount = curRec.count;
    const isAllMode = selectedList.length === 0;
    const mentalIds = list.filter(x => x.kind === 'mental').map(x => x.id);
    const colIds = list.filter(x => x.col).map(x => x.id);
    const knowledgeIds = list.filter(x => x.kind === 'knowledge').map(x => x.id);
    const activeTopicCount = isAllMode ? domainFilteredIds.length : selectedList.length;
    const timeRangeText = formatTimingRange(curRec);
    const splitText = formatSplitHint(activeCount, activeTopicCount);

    const checkedModeEl = $('#config input[name="inputMode"]:checked');
    const currentInputMode = checkedModeEl ? checkedModeEl.value : (config?.inputMode || 'choices');
    const customSecOverride = Number(config?.customPresetSeconds) > 0 ? Number(config.customPresetSeconds) : null;
    const isUntimedActive = Boolean(config?.untimed) || (!customSecOverride && isSecondary && currentInputMode === 'numpad');

    const diffLabelMap = {
      progressive: t('Dễ → Khó', 'Easy → Hard'),
      easy: t('Nhận biết (Dễ)', 'Lv1 Easy'),
      medium: t('Thông hiểu (Vừa)', 'Lv2 Medium'),
      hard: t('Vận dụng (Khó)', 'Lv3 Hard')
    };

    const effectiveTimeDisplay = () => {
      if (Boolean(config?.untimed)) return t('Không giới hạn giờ', 'Untimed');
      if (customSecOverride) return `${customSecOverride}s/${t('câu', 'q')}`;
      const modeNowEl = $('#config input[name="inputMode"]:checked');
      const mVal = modeNowEl ? modeNowEl.value : (config?.inputMode || 'choices');
      if (isSecondary && mVal === 'numpad') return t('Không giới hạn giờ', 'Untimed');
      return `${timeRangeText}/${t('câu', 'q')}`;
    };

    const updateLessonSummary = (selArr, countNow, recNow) => {
      const sumEl = $('#lessonSummary');
      if (!sumEl) return;
      const tRange = formatTimingRange(recNow);
      const modeNowEl = $('#config input[name="inputMode"]:checked');
      const mVal = modeNowEl ? modeNowEl.value : (config?.inputMode || 'choices');
      const customSecNow = Number(config?.customPresetSeconds) > 0 ? Number(config.customPresetSeconds) : null;
      const untimedNow = Boolean(config?.untimed) || (!customSecNow && isSecondary && mVal === 'numpad');
      const timeStr = untimedNow
        ? t('Không giới hạn giờ', 'Untimed')
        : `${customSecNow ? customSecNow + 's' : tRange}/${t('câu', 'q')}`;
      const diffTxt = diffLabelMap[config?.difficultyMode || 'progressive'] || diffLabelMap.progressive;

      if (selArr.length === 0) {
        const domTitle = isSecondary && activeDomain === 'number'
          ? t(`Số học Lớp ${g} (${domainFilteredIds.length} dạng)`, `Grade ${g} Numbers & Algebra (${domainFilteredIds.length})`)
          : isSecondary && activeDomain === 'geometry'
            ? t(`Hình học Lớp ${g} (${domainFilteredIds.length} dạng)`, `Grade ${g} Geometry (${domainFilteredIds.length})`)
            : t(`Đề tổng hợp ${validIds.size} dạng Lớp ${g}`, `Grade ${g} Mixed (${validIds.size} formats)`);
        sumEl.textContent = `${domTitle} · ${diffTxt} · ${countNow} ${t('câu', 'qs')} · ${timeStr}`;
      } else {
        const names = selArr.slice(0, 2).map(id => {
          const it = list.find(x => x.id === id);
          return it ? (lang === 'en' ? it.en : it.vi) : id;
        });
        const extraTxt = selArr.length > 2 ? ` +${selArr.length - 2}` : '';
        sumEl.textContent = `${t('Chuyên đề:', 'Topics:')} ${names.join(' · ')}${extraTxt} · ${diffTxt} · ${countNow} ${t('câu', 'qs')} · ${timeStr}`;
      }
    };

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
      const rec = applySmartTimingToForm(g, selectedList.length ? selectedList : (activeDomain !== 'all' ? domainFilteredIds : []));
      renderTopicPillsForGrade(g, false);
      updateLessonSummary(selectedList, rec.count, rec);
    };

    const applyDomainTab = nextDom => {
      config.domainFilter = nextDom;
      config.topic = 'all';
      config.topics = [];
      if (typeof window !== 'undefined') window.config = config;
      if (typeof global !== 'undefined') global.config = config;
      const domIds = nextDom === 'all' ? [] : allSpecialized.filter(x => x.domain === nextDom).map(x => x.id);
      const rec = applySmartTimingToForm(g, domIds);
      renderTopicPillsForGrade(g, false);
      updateLessonSummary([], rec.count, rec);
    };
    if (typeof window !== 'undefined') window.applySecondaryDomainFilter = applyDomainTab;
    if (typeof global !== 'undefined') global.applySecondaryDomainFilter = applyDomainTab;

    const statusBadge = isAllMode
      ? (isSecondary && activeDomain === 'number'
          ? t(`Đang chọn Số học (${numberTopics.length} chuyên đề)`, `All Numbers & Algebra (${numberTopics.length} topics)`)
          : isSecondary && activeDomain === 'geometry'
            ? t(`Đang chọn Hình học (${geomTopics.length} chuyên đề)`, `All Geometry (${geomTopics.length} topics)`)
            : t(`Đang bật Đề tổng hợp (${validIds.size} dạng trộn đều)`, `Full Mixed Exam (${validIds.size} formats)`))
      : t(`Đang chọn ${selectedList.length}/${validIds.size} dạng (chạm thêm để ghép nhiều dạng)`, `${selectedList.length}/${validIds.size} selected (tap more to combine)`);

    const timingChipLabel = isUntimedActive
      ? t('Thời gian: Không giới hạn giờ', 'Timer: Untimed')
      : customSecOverride
        ? `${t('Thời gian tự đặt:', 'Custom timer:')} ${customSecOverride}s/${t('câu', 'q')}`
        : `${t('Thời gian mặc định:', 'Default timer:')} ${timeRangeText}/${t('câu', 'q')}`;

    const splitPillHtml = activeTopicCount > 1
      ? `<span class="preset-split-badge">${t(`Chia đều ${activeTopicCount} dạng`, `Even split (${activeTopicCount} topics)`)} (${splitText})</span>`
      : `<span class="preset-split-badge">${effectiveTimeDisplay()}</span>`;

    const sameSet = (a, b) => a.length > 0 && a.length === b.length && a.every(x => b.includes(x));
    const quickCounts = [5, 8, 10, 12, 15, 20];
    const quickSecPresets = [20, 30, 45, 60, 90];
    const isDefaultTimerMode = !Boolean(config?.untimed) && !customSecOverride;

    const renderPillBtn = tp => {
      const active = tp.id === 'all' ? (isAllMode && activeDomain === 'all') : selectedList.includes(tp.id);
      const shownSec = customSecOverride || tp.seconds;
      const secTag = !isUntimedActive && shownSec ? ` <small class="tp-sec-tag">${shownSec}s</small>` : '';
      const tip = `${tp.count} ${t('câu', 'qs')}${isUntimedActive ? ' · ' + t('Không giới hạn giờ', 'Untimed') : ' · ' + shownSec + 's/' + t('câu', 'q')}`;
      return `<button type="button" class="grade-topic-pill ${tp.domain === 'geometry' && isSecondary ? 'is-geom-pill' : ''} ${active ? 'active' : ''}" data-grade-topic="${esc(tp.id)}" title="${esc(tip)}">${esc(typeof lang !== 'undefined' && lang === 'en' ? tp.en : tp.vi)}${secTag}</button>`;
    };

    const secondaryGroupedTopicsHtml = () => {
      if (activeDomain === 'number') {
        return `<div class="grade-topics-list">${numberTopics.map(renderPillBtn).join('')}</div>`;
      }
      if (activeDomain === 'geometry') {
        return `<div class="grade-topics-list">${geomTopics.map(renderPillBtn).join('')}</div>`;
      }
      const allBtn = list.find(x => x.id === 'all');
      return `
        <div class="grade-topics-list" style="margin-bottom:8px">${allBtn ? renderPillBtn(allBtn) : ''}</div>
        <div class="sec-stream-group">
          <div class="sec-stream-lbl">${t(`Số học (${numberTopics.length} chuyên đề)`, `Numbers & Algebra (${numberTopics.length} topics)`)}</div>
          <div class="grade-topics-list">${numberTopics.map(renderPillBtn).join('')}</div>
        </div>
        <div class="sec-stream-group" style="margin-top:9px">
          <div class="sec-stream-lbl is-geom">${t(`Hình học (${geomTopics.length} chuyên đề)`, `Geometry (${geomTopics.length} topics)`)}</div>
          <div class="grade-topics-list">${geomTopics.map(renderPillBtn).join('')}</div>
        </div>
      `;
    };

    host.hidden = false;
    host.innerHTML = `
      <div class="grade-topics-head">
        <div class="grade-topics-title">
          <span>${t(`Ôn tập & Bổ sung bài tập Lớp ${g} (Chuẩn SGK GDPT 2018):`, `Grade ${g} School Review & Practice (GDPT 2018):`)}</span>
          <span class="grade-topics-status">${statusBadge} · <strong class="grade-timing-chip ${isUntimedActive ? 'is-untimed' : ''}">${timingChipLabel}</strong></span>
        </div>
        <div class="grade-topics-quick-row">
          <button type="button" class="grade-topics-quick-btn kh-open-btn" id="openGradeKnowledgeBtn">${t(`Lý thuyết & Công thức Lớp ${g}`, `Gr ${g} Study Notes`)}</button>
          ${!isSecondary && mentalIds.length ? `<button type="button" class="grade-topics-quick-btn ${sameSet(selectedList, mentalIds) ? 'is-on' : ''}" id="quickMentalTopicsBtn">${t('Tính nhẩm nhanh', 'Mental Math')}</button>` : ''}
          ${!isSecondary && colIds.length ? `<button type="button" class="grade-topics-quick-btn ${sameSet(selectedList, colIds) ? 'is-on' : ''}" id="quickColTopicsBtn">${t('Đặt tính', 'Column')}</button>` : ''}
          ${!isSecondary && knowledgeIds.length ? `<button type="button" class="grade-topics-quick-btn ${sameSet(selectedList, knowledgeIds) ? 'is-on' : ''}" id="quickKnowTopicsBtn">${t('Toán giải & Ôn tập', 'Word & Review')}</button>` : ''}
        </div>
      </div>

      ${isSecondary ? `
        <div class="sec-domain-bar" role="tablist" aria-label="${t('Phân môn Toán THCS', 'Secondary Math Branches')}">
          <button type="button" class="sec-dom-tab ${activeDomain === 'all' && isAllMode ? 'active' : ''}" data-sec-dom="all">${t(`Tất cả (${allSpecialized.length})`, `All (${allSpecialized.length})`)}</button>
          <button type="button" class="sec-dom-tab ${activeDomain === 'number' ? 'active' : ''}" data-sec-dom="number">${t(`Số học (${numberTopics.length})`, `Numbers & Algebra (${numberTopics.length})`)}</button>
          <button type="button" class="sec-dom-tab is-geom ${activeDomain === 'geometry' ? 'active' : ''}" data-sec-dom="geometry">${t(`Hình học (${geomTopics.length})`, `Geometry (${geomTopics.length})`)}</button>
        </div>
      ` : ''}

      ${isSecondary ? secondaryGroupedTopicsHtml() : `<div class="grade-topics-list">${list.map(renderPillBtn).join('')}</div>`}

      <div class="preset-diff-bar" id="presetDiffBar">
        <span class="preset-count-lbl">${t('Mức độ bài tập:', 'Difficulty:')}</span>
        <div class="preset-diff-chips">
          <button type="button" class="preset-diff-chip ${activeDiffMode === 'progressive' ? 'active' : ''}" data-diff-mode="progressive" title="${t('40% Nhận biết → 35% Thông hiểu → 25% Vận dụng thực tế', '40% Easy -> 35% Medium -> 25% Hard')}">${t('Lộ trình Dễ → Khó (Chuẩn đề kiểm tra)', 'Progressive (Easy → Hard)')}</button>
          <button type="button" class="preset-diff-chip ${activeDiffMode === 'easy' ? 'active' : ''}" data-diff-mode="easy">${t('Nhận biết (Dễ)', 'Lv1 Easy')}</button>
          <button type="button" class="preset-diff-chip ${activeDiffMode === 'medium' ? 'active' : ''}" data-diff-mode="medium">${t('Thông hiểu (Vừa)', 'Lv2 Medium')}</button>
          <button type="button" class="preset-diff-chip ${activeDiffMode === 'hard' ? 'active' : ''}" data-diff-mode="hard">${t('Vận dụng & Bài giải (Khó)', 'Lv3 Hard & Word')}</button>
        </div>
      </div>

      <div class="preset-count-bar" id="presetCountBar">
        <span class="preset-count-lbl">${t('Số câu luyện:', 'Questions:')}</span>
        <div class="preset-count-chips">
          ${quickCounts.map(n => `<button type="button" class="preset-cnt-chip ${activeCount === n ? 'active' : ''}" data-preset-count="${n}">${n}</button>`).join('')}
        </div>
        <input type="number" id="presetCountInput" class="preset-cnt-input" min="1" max="50" value="${activeCount}" aria-label="${t('Nhập số câu', 'Question count')}" inputmode="numeric">
        ${splitPillHtml}
      </div>

      <div class="preset-count-bar preset-timer-bar" id="presetTimerBar">
        <span class="preset-count-lbl">${t('Thời gian mỗi câu:', 'Time per question:')}</span>
        <div class="preset-count-chips">
          <button type="button" class="preset-cnt-chip ${isDefaultTimerMode ? 'active' : ''}" data-preset-timer="auto">${t('Mặc định từng dạng', 'Per-topic default')} (${timeRangeText})</button>
          ${quickSecPresets.map(s => `<button type="button" class="preset-cnt-chip ${!Boolean(config?.untimed) && customSecOverride === s ? 'active' : ''}" data-preset-timer="${s}">${s}s</button>`).join('')}
          <button type="button" class="preset-cnt-chip ${Boolean(config?.untimed) ? 'active' : ''}" data-preset-timer="untimed">${t('Không giới hạn', 'Untimed')}</button>
        </div>
      </div>
    `;

    $$('[data-grade-topic]').forEach(btn => {
      btn.onclick = () => {
        const chosen = btn.dataset.gradeTopic;
        if (chosen === 'all') {
          config.domainFilter = 'all';
          syncConfigTopics([]);
          return;
        }
        const next = selectedList.includes(chosen)
          ? selectedList.filter(id => id !== chosen)
          : [...selectedList, chosen];
        syncConfigTopics(next);
      };
    });

    $$('[data-sec-dom]').forEach(btn => {
      btn.onclick = () => applyDomainTab(btn.dataset.secDom || 'all');
    });

    $$('[data-diff-mode]').forEach(btn => {
      btn.onclick = () => {
        config.difficultyMode = btn.dataset.diffMode || 'progressive';
        if (typeof window !== 'undefined') window.config = config;
        if (typeof global !== 'undefined') global.config = config;
        renderTopicPillsForGrade(g, false);
        updateLessonSummary(selectedList, activeCount, curRec);
      };
    });

    $('#openGradeKnowledgeBtn')?.addEventListener('click', () => {
      if (typeof window !== 'undefined' && typeof window.openKnowledgeModal === 'function') {
        window.openKnowledgeModal(g, isSecondary ? activeDomain : 'all');
      }
    });

    $$('[data-preset-timer]').forEach(btn => {
      btn.onclick = () => {
        const mode = btn.dataset.presetTimer;
        if (mode === 'untimed') {
          config.untimed = true;
          config.customPresetSeconds = null;
        } else if (mode === 'auto') {
          config.untimed = false;
          config.customPresetSeconds = null;
        } else {
          const s = Number(mode) || 30;
          config.untimed = false;
          config.customPresetSeconds = s;
          config.seconds = s;
          if ($('#lessonSeconds')) $('#lessonSeconds').value = s;
        }
        if (typeof window !== 'undefined') window.config = config;
        if (typeof global !== 'undefined') global.config = config;
        renderTopicPillsForGrade(g, false);
        updateLessonSummary(selectedList, activeCount, curRec);
      };
    });

    const applyPickedCount = nextCount => {
      const clean = Math.max(1, Math.min(50, Math.round(Number(nextCount) || 10)));
      presetManualCount = clean;
      presetCountGrade = g;
      const recNow = getRecommendedTiming(g, effectiveTimingIds);
      syncPresetCountToForm(clean, recNow);
      renderTopicPillsForGrade(g, false);
      updateLessonSummary(selectedList, clean, recNow);
    };

    $$('[data-preset-count]').forEach(btn => {
      btn.onclick = () => applyPickedCount(btn.dataset.presetCount);
    });
    const cntBox = $('#presetCountInput');
    if (cntBox) {
      cntBox.onchange = () => applyPickedCount(cntBox.value);
    }

    const quickMental = $('#quickMentalTopicsBtn');
    if (quickMental && mentalIds.length) quickMental.onclick = () => syncConfigTopics(mentalIds);
    const quickCol = $('#quickColTopicsBtn');
    if (quickCol && colIds.length) quickCol.onclick = () => syncConfigTopics(colIds);
    const quickKnow = $('#quickKnowTopicsBtn');
    if (quickKnow && knowledgeIds.length) quickKnow.onclick = () => syncConfigTopics(knowledgeIds);

    updateLessonSummary(selectedList, activeCount, curRec);
  }

  const resetTopicsOnGrade = gk => {
    presetManualCount = null;
    presetCountGrade = gk === 'custom' ? null : Number(gk);
    if (typeof config !== 'undefined') {
      config.topic = 'all';
      config.topics = [];
      config.domainFilter = 'all';
      config.customPresetSeconds = null;
      config.untimed = false;
    }
    renderTopicPillsForGrade(gk === 'custom' ? null : gk, gk !== 'custom');
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
      $$('#config input[name="inputMode"]').forEach(r => {
        r.addEventListener('change', () => {
          config.inputMode = r.value;
          if (typeof window !== 'undefined') window.config = config;
          if (typeof global !== 'undefined') global.config = config;
          if (config.grade && config.grade !== 'custom') {
            renderTopicPillsForGrade(config.grade, false);
          }
        });
      });
      // Update Tự luận radio label dynamically with clear hint for Primary vs Secondary!
      const numpadSpan = $('#config input[name="inputMode"][value="numpad"] + span');
      if (numpadSpan) {
        numpadSpan.textContent = t('Tự luận (Gõ/Bấm số · THCS tự bỏ giới hạn giờ)', 'Free input (Numpad · Untimed for Gr 6–9)');
      }
      renderTopicPillsForGrade(config.grade, Boolean(config.grade && config.grade !== 'custom'));
    };
    if (typeof window !== 'undefined') window.setup = setup;
    if (typeof global !== 'undefined') global.setup = setup;
  }

  // Inject styles
  if (typeof document !== 'undefined' && document.head) {
    const style = document.createElement('style');
    style.textContent = `
      .grade-topics-wrap{margin-top:12px;padding-top:12px;border-top:1.5px dashed #dce8d6}
      .grade-topics-head{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px}
      .grade-topics-title{display:flex;flex-direction:column;gap:3px;font-size:12.5px;font-weight:800;color:#2f533c}
      .grade-topics-status{font-size:11.5px;font-weight:700;color:#4f7a60;line-height:1.45}
      .grade-timing-chip{display:inline-block;padding:1px 7px;border-radius:999px;background:#e6f4ea;color:#1b5a3c;font-weight:800}
      .grade-timing-chip.is-untimed{background:#e0f2fe;color:#0369a1}
      .grade-topics-quick-row{display:flex;flex-wrap:wrap;gap:5px}
      .grade-topics-quick-btn{min-height:28px!important;padding:4px 10px!important;border-radius:999px!important;border:1.5px solid #c2dcc6!important;background:#eef8f0!important;color:#1f583c!important;font-size:11.5px!important;font-weight:800!important;cursor:pointer}
      .grade-topics-quick-btn.kh-open-btn{background:#fff8eb!important;border-color:#f2d194!important;color:#9a4d0c!important}
      .grade-topics-quick-btn:hover{background:#dcf1e2!important;border-color:#74ad86!important}
      .grade-topics-quick-btn.is-on,.grade-topics-quick-btn.is-on:hover{background:#235c43!important;border-color:#194432!important;color:#fff!important}
      .sec-domain-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:6px;padding:5px;margin-bottom:10px;border-radius:12px;background:#edf5ee;border:1px solid #d5e6d7}
      .sec-dom-tab{min-height:34px!important;padding:5px 10px!important;border-radius:9px!important;border:1.5px solid transparent!important;background:transparent!important;color:#2c543c!important;font-size:12px!important;font-weight:800!important;cursor:pointer}
      .sec-dom-tab.active,.sec-dom-tab.active:hover{background:#ffffff!important;border-color:#9fc9ac!important;color:#154c32!important;box-shadow:0 2px 6px rgba(24,78,50,.10)}
      .sec-dom-tab.is-geom.active{border-color:#93c5fd!important;color:#1e40af!important}
      .sec-stream-lbl{font-size:12px;font-weight:900;color:#1e5236;margin-bottom:5px;display:flex;align-items:center;gap:5px}
      .sec-stream-lbl.is-geom{color:#1e40af}
      .grade-topics-list{display:flex;flex-wrap:wrap;gap:6px}
      .grade-topic-pill{display:inline-flex;align-items:center;gap:5px;min-height:34px;padding:6px 11px;border-radius:999px;border:1.5px solid #d4e3cc;background:#f7fbf5;color:#2e4e3a;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s ease}
      .grade-topic-pill.is-geom-pill{background:#f5f9ff;border-color:#cfe0f7;color:#1e3a8a}
      .grade-topic-pill .tp-sec-tag{font-size:10.5px;font-weight:800;padding:1px 5px;border-radius:999px;background:#e4f0e0;color:#3d6b4f}
      .grade-topic-pill.is-geom-pill .tp-sec-tag{background:#dbeafe;color:#1e40af}
      .grade-topic-pill:hover:not(.active){background:#eaf4e6;border-color:#8cb685}
      .grade-topic-pill.active,.grade-topic-pill.active:hover{background:#2d6a51!important;border-color:#1f4f3c!important;color:#fff!important;box-shadow:0 2px 8px rgba(45,106,81,.22)}
      .grade-topic-pill.is-geom-pill.active,.grade-topic-pill.is-geom-pill.active:hover{background:#1d4ed8!important;border-color:#1e3a8a!important;color:#fff!important;box-shadow:0 2px 8px rgba(29,78,216,.22)}
      .grade-topic-pill.active .tp-sec-tag{background:rgba(255,255,255,0.22)!important;color:#fff!important}
      .preset-diff-bar{margin-top:11px;padding-top:10px;border-top:1.5px dashed #dce8d6;display:flex;align-items:center;flex-wrap:wrap;gap:7px}
      .preset-diff-chips{display:flex;flex-wrap:wrap;gap:5px}
      .preset-diff-chip{min-height:30px!important;padding:4px 10px!important;border-radius:999px!important;border:1.5px solid #d1e2cc!important;background:#f8fcf6!important;color:#2b4f39!important;font-size:11.5px!important;font-weight:800!important;cursor:pointer}
      .preset-diff-chip.active,.preset-diff-chip.active:hover{background:#2d6a51!important;border-color:#1e4d3a!important;color:#fff!important}
      body.dark-mode .grade-topics-wrap,.body.dark-mode .preset-diff-bar{border-top-color:#2b4637}
      body.dark-mode .grade-topics-title{color:#c9e4d4}
      body.dark-mode .grade-topics-status{color:#8dc1a3}
      body.dark-mode .grade-timing-chip{background:#1b3828;color:#9ee3bc}
      body.dark-mode .grade-timing-chip.is-untimed{background:#153147;color:#93c5fd}
      body.dark-mode .grade-topics-quick-btn{background:#193225!important;border-color:#35614a!important;color:#9ee3bc!important}
      body.dark-mode .grade-topics-quick-btn.kh-open-btn{background:#302312!important;border-color:#694a20!important;color:#fcd34d!important}
      body.dark-mode .grade-topics-quick-btn.is-on{background:#2d6a51!important;color:#fff!important}
      body.dark-mode .sec-domain-bar{background:#15241c;border-color:#2b4637}
      body.dark-mode .sec-dom-tab{color:#a8cdb7!important}
      body.dark-mode .sec-dom-tab.active{background:#22392c!important;border-color:#437559!important;color:#fff!important}
      body.dark-mode .sec-stream-lbl{color:#9ee3bc}
      body.dark-mode .sec-stream-lbl.is-geom{color:#93c5fd}
      body.dark-mode .grade-topic-pill{background:#18271f;border-color:#2d4a3a;color:#cde4d6}
      body.dark-mode .grade-topic-pill.is-geom-pill{background:#152236;border-color:#29436b;color:#bfdbfe}
      body.dark-mode .grade-topic-pill .tp-sec-tag{background:#233b2e;color:#9cc9b0}
      body.dark-mode .grade-topic-pill.active{background:#2d6a51!important;border-color:#4ba880!important;color:#fff!important}
      body.dark-mode .preset-diff-chip{background:#18271f!important;border-color:#2d4a3a!important;color:#cde4d6!important}
      body.dark-mode .preset-diff-chip.active{background:#2d6a51!important;color:#fff!important}
      .preset-count-bar{margin-top:11px;padding-top:10px;border-top:1.5px dashed #dce8d6;display:flex;align-items:center;flex-wrap:wrap;gap:8px}
      .preset-count-lbl{font-size:12.5px;font-weight:800;color:#274c36;white-space:nowrap}
      .preset-count-chips{display:flex;flex-wrap:wrap;gap:5px}
      .preset-cnt-chip{min-height:30px!important;min-width:36px!important;padding:3px 10px!important;border-radius:999px!important;border:1.5px solid #cde0c7!important;background:#f7fbf5!important;color:#284d37!important;font-size:12.5px!important;font-weight:800!important;cursor:pointer;transition:all .14s ease}
      .preset-cnt-chip:hover:not(.active){background:#e9f4e5!important;border-color:#7fb084!important}
      .preset-cnt-chip.active,.preset-cnt-chip.active:hover{background:#2d6a51!important;border-color:#1e4d3a!important;color:#fff!important}
      .preset-cnt-input{width:62px!important;min-height:30px!important;padding:3px 8px!important;border-radius:9px!important;border:1.5px solid #c5dac0!important;background:#fff!important;color:#1e4531!important;font-size:13px!important;font-weight:800!important;text-align:center}
      .preset-split-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;background:#eaf6ee;border:1px solid #c5e2cd;color:#1b5639;font-size:11.5px;font-weight:800}
      body.dark-mode .preset-count-bar{border-top-color:#2b4637}
      body.dark-mode .preset-count-lbl{color:#c9e4d4}
      body.dark-mode .preset-cnt-chip{background:#18271f!important;border-color:#2d4a3a!important;color:#cde4d6!important}
      body.dark-mode .preset-cnt-chip.active{background:#2d6a51!important;border-color:#4ba880!important;color:#fff!important}
      body.dark-mode .preset-cnt-input{background:#16241c!important;border-color:#345643!important;color:#d6efe0!important}
      body.dark-mode .preset-split-badge{background:#1b3828;border-color:#2f5c43;color:#9ee3bc}
      /* Hide redundant custom builder fieldsets when a preset Grade (1-9) is selected; show all 6 steps only in "Tùy chỉnh" */
      form#config.is-preset-mode > fieldset:not(.answer-mode-fieldset){display:none!important}
      form#config.is-preset-mode{margin-top:12px!important;padding:16px 20px!important}
      form#config.is-preset-mode .answer-mode-fieldset{margin:0 0 12px!important;padding:0 0 12px!important;border-bottom:1px solid #e7f0e3}
      form#config.is-preset-mode .answer-mode-fieldset legend span{display:none!important}
      form#config.is-preset-mode ~ .setup-sticky-cta{display:none!important}
      body.dark-mode form#config.is-preset-mode .answer-mode-fieldset{border-bottom-color:#283f31}
    `;
    document.head.append(style);
  }

  const exp = {
    NUMI_GRADE_TOPICS,
    generateTopicQuestion,
    getRecommendedTiming,
    buildBalancedTopicPlan,
    buildProgressiveTierSchedule,
    getCandidateTopicIdsForGrade
  };
  if (typeof window !== 'undefined') Object.assign(window, exp);
  if (typeof global !== 'undefined') Object.assign(global, exp);
})();
