// Comprehensive Grade 1-9 Problem-Solving Expansion, THCS Number vs Geometry Split & 3-Tier Cognitive Levels (v2.15.0)
// Aligned with MOET GDPT 2018 (Thông tư 27/2020 Tiểu học & Thông tư 22/2021 + Công văn 7991/BGDĐT-GDTrH THCS)
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
  function fracStr(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd2(n, d) || 1;
    const nn = n / g, dd = d / g;
    return dd === 1 ? String(nn) : `${nn}/${dd}`;
  }
  function fmtDec(n) {
    if (typeof fmt === 'function') return fmt(n);
    const v = Math.round(n * 10000) / 10000;
    const isVi = typeof lang === 'undefined' || lang === 'vi';
    return isVi ? String(v).replace('.', ',') : String(v);
  }
  function resolveTier(cfg) {
    const d = cfg && cfg.difficulty;
    if (d === 'easy' || d === 'medium' || d === 'hard') return d;
    const m = cfg && cfg.difficultyMode;
    if (m === 'easy' || m === 'medium' || m === 'hard') return m;
    const r = Math.random();
    return r < 0.4 ? 'easy' : r < 0.75 ? 'medium' : 'hard';
  }
  function difficultyBadgeLabel(tier) {
    const isEn = typeof lang !== 'undefined' && lang === 'en';
    if (tier === 'easy') return isEn ? '🌱 Lv1 · Foundation' : '🌱 Mức 1 · Nhận biết';
    if (tier === 'medium') return isEn ? '📘 Lv2 · Comprehension' : '📘 Mức 2 · Thông hiểu';
    return isEn ? '🏆 Lv3 · Application' : '🏆 Mức 3 · Vận dụng';
  }

  function makeExtQ(q, answer, near, skill, cfg, explanation, extra = {}) {
    const ansStr = String(answer);
    const allowNeg = Boolean(extra.allowNeg || ansStr.startsWith('-'));
    let options;
    if (extra.exactOptions) {
      options = extra.exactOptions;
    } else if (typeof antiTrickOptions === 'function') {
      options = antiTrickOptions(ansStr, near || [], { allowNegative: allowNeg });
    } else {
      const s = new Set([ansStr]);
      (near || []).forEach(v => { if (v !== null && v !== undefined) s.add(String(v)); });
      let k = 1;
      while (s.size < 4 && k < 50) { s.add(String((parseFloat(ansStr) || 0) + k)); k++; }
      options = Array.from(s).slice(0, 4);
    }
    const tier = extra.difficulty || resolveTier(cfg);
    return {
      id: typeof uid === 'function' ? uid() : 'ext_' + Math.random().toString(36).slice(2),
      q,
      answer: ansStr,
      options,
      skill,
      config: { ...(cfg || {}), difficulty: tier },
      explanation,
      columnReady: Boolean(extra.columnReady),
      difficulty: tier,
      difficultyLabel: difficultyBadgeLabel(tier),
      domain: extra.domain || 'number',
      visualKind: extra.visualKind || null,
      visualData: extra.visualData || null
    };
  }

  // =========================================================================
  // 1. EXTRA PRIMARY TOPICS (Grades 1–5: Deep Number Sense & Word Solutions)
  // =========================================================================
  const EXTRA_PRIMARY_TOPICS = {
    1: [
      { id: 'g1_number_sense', vi: 'Tư duy lập số & Chục–Đơn vị nâng cao', en: 'Number Sense & Place Value+', kind: 'knowledge', domain: 'number', count: 10, seconds: 25 },
      { id: 'g1_word_solve', vi: 'Bài giải lời văn tổng hợp (Dễ → Khó)', en: 'Step-by-Step Word Problems', kind: 'knowledge', domain: 'number', count: 8, seconds: 40 }
    ],
    2: [
      { id: 'g2_mental_fast', vi: 'Mẹo tách–gộp nhẩm nhanh PV 100 & 1.000', en: 'Fast Make-10 & Round-100 Math', kind: 'mental', domain: 'number', count: 10, seconds: 22 },
      { id: 'g2_word_two', vi: 'Bài giải tư duy & Lời văn mở rộng Lớp 2', en: '2-Step & Reasoning Word Problems', kind: 'knowledge', domain: 'number', count: 8, seconds: 45 }
    ],
    3: [
      { id: 'g3_fast_calc', vi: 'Tính thuận tiện & Quy luật dãy số Lớp 3', en: 'Smart Grouping & Number Patterns', kind: 'mental', domain: 'number', count: 10, seconds: 28 },
      { id: 'g3_word_two_step', vi: 'Bài giải 2 bước tính & Toán thực tế chia dư', en: '2-Step & Practical Remainder Problems', kind: 'knowledge', domain: 'number', count: 8, seconds: 50 }
    ],
    4: [
      { id: 'g4_seq_gauss', vi: 'Dãy số cách đều (Số số hạng & Tổng dãy)', en: 'Arithmetic Sequences & Gauss Sums', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g4_word_adv', vi: 'Bài giải Tổng–Hiệu ẩn, Phân số & Tuổi tác', en: 'Multi-Step Sum-Diff & Fraction Problems', kind: 'knowledge', domain: 'number', count: 8, seconds: 50 }
    ],
    5: [
      { id: 'g5_work_rate', vi: 'Toán Công việc chung, Vòi nước & Năng suất', en: 'Shared Work, Pipes & Rate Problems', kind: 'knowledge', domain: 'number', count: 8, seconds: 50 },
      { id: 'g5_word_10pt', vi: 'Toán thực tế Lãi–Lỗ & Câu điểm 10 cuối cấp', en: 'Profit/Interest & Grade-6 Prep Problems', kind: 'knowledge', domain: 'number', count: 8, seconds: 55 }
    ]
  };

  // =========================================================================
  // 2. FULL SECONDARY TOPICS (Grades 6–9: Split into SỐ HỌC & HÌNH HỌC)
  // =========================================================================
  const SECONDARY_GRADE_TOPICS = {
    6: [
      { id: 'all', vi: 'Tổng hợp tất cả chuyên đề Lớp 6', en: 'All Grade 6 Mixed', kind: 'all', domain: 'all', count: 12, seconds: 35 },
      // --- PHẦN SỐ HỌC (Number & Arithmetic) ---
      { id: 'g6_nat_ops', vi: 'Tập hợp ℕ & Thứ tự thực hiện phép tính', en: 'Natural Sets & Order of Ops', kind: 'knowledge', domain: 'number', count: 10, seconds: 30 },
      { id: 'g6_pow', vi: 'Lũy thừa với số mũ tự nhiên (aⁿ)', en: 'Natural Powers (aⁿ)', kind: 'mental', domain: 'number', count: 12, seconds: 25 },
      { id: 'g6_div_prime', vi: 'Chia hết (2,3,5,9) & Số nguyên tố – Hợp số', en: 'Divisibility & Prime Numbers', kind: 'knowledge', domain: 'number', count: 10, seconds: 30 },
      { id: 'g6_div', vi: 'ƯCLN, BCNN & Bài toán chia phần đều', en: 'GCD, LCM & Grouping Problems', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g6_int', vi: 'Số nguyên ℤ (+, −, ×, ÷ & Quy tắc ngoặc)', en: 'Signed Integers ℤ & Brackets', kind: 'mental', domain: 'number', count: 12, seconds: 25 },
      { id: 'g6_findx', vi: 'Tìm x trong ℤ (Chuyển vế, Lũy thừa)', en: 'Solve for Integer x', kind: 'knowledge', domain: 'number', count: 10, seconds: 35 },
      { id: 'g6_frac', vi: 'Phân số & Hai bài toán phân số cơ bản', en: 'Fractions & Core Word Problems', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g6_dec_pct', vi: 'Số thập phân, Làm tròn & Tỉ số phần trăm', en: 'Decimals, Rounding & Percentages', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g6_word_stat', vi: 'Toán thực tế Lớp 6, Thống kê & Xác suất', en: 'Real-Life Math, Stats & Probability', kind: 'knowledge', domain: 'number', count: 10, seconds: 45 },
      // --- PHẦN HÌNH HỌC (Geometry & Measurement) ---
      { id: 'g6_geom_flat', vi: 'Chu vi & Diện tích (Thoi, Bình hành, Thang cân)', en: 'Perimeter & Area of Special Shapes', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 40 },
      { id: 'g6_geom_sym', vi: 'Trục đối xứng & Tâm đối xứng hình phẳng', en: 'Line & Rotational Symmetry', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 25 },
      { id: 'g6_geom_seg', vi: 'Điểm, Đoạn thẳng & Trung điểm đoạn thẳng', en: 'Segments & Midpoints', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 35 },
      { id: 'g6_geom_angle', vi: 'Số đo góc, Tia nằm giữa & Lát gạch thực tế', en: 'Angles & Tiling Word Problems', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 40 }
    ],
    7: [
      { id: 'all', vi: 'Tổng hợp tất cả chuyên đề Lớp 7', en: 'All Grade 7 Mixed', kind: 'all', domain: 'all', count: 12, seconds: 35 },
      // --- PHẦN SỐ HỌC & ĐẠI SỐ ---
      { id: 'g7_rat', vi: 'Số hữu tỉ ℚ, Lũy thừa & Tính hợp lý', en: 'Rationals ℚ & Powers', kind: 'mental', domain: 'number', count: 12, seconds: 25 },
      { id: 'g7_sqrt_abs', vi: 'Số thực ℝ, Căn bậc hai & Trị tuyệt đối |x|', en: 'Square Roots, |x| & Min/Max', kind: 'mental', domain: 'number', count: 12, seconds: 25 },
      { id: 'g7_findx', vi: 'Tìm x hữu tỉ (Chuyển vế, Lũy thừa, |x|)', en: 'Rational & Absolute Equations', kind: 'knowledge', domain: 'number', count: 10, seconds: 35 },
      { id: 'g7_ratio', vi: 'Tỉ lệ thức & Dãy tỉ số bằng nhau', en: 'Proportions & Equal Ratios', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g7_prop_word', vi: 'Bài giải Đại lượng tỉ lệ thuận & Tỉ lệ nghịch', en: 'Direct & Inverse Proportion Problems', kind: 'knowledge', domain: 'number', count: 10, seconds: 45 },
      { id: 'g7_alg', vi: 'Biểu thức đại số & Đa thức một biến P(x)', en: 'Single-Variable Polynomials P(x)', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g7_prob_stat', vi: 'Biểu đồ quạt tròn & Xác suất biến cố', en: 'Pie Charts & Event Probability', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g7_real_math', vi: 'Toán thực tế Lớp 7 (Giảm giá, VAT, Taxi)', en: 'Real-World Consumer Math', kind: 'knowledge', domain: 'number', count: 10, seconds: 45 },
      // --- PHẦN HÌNH HỌC ---
      { id: 'g7_geom_para', vi: 'Góc đối đỉnh, Phân giác & Hai đường song song', en: 'Bisectors & Parallel Lines', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 35 },
      { id: 'g7_geom_tri', vi: 'Tổng 3 góc tam giác, Tam giác cân & Bằng nhau', en: 'Triangle Angles & Congruence', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 40 },
      { id: 'g7_geom_ineq', vi: 'Quan hệ góc–cạnh & Bất đẳng thức tam giác', en: 'Triangle Inequality & Sides', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 35 },
      { id: 'g7_geom_lines', vi: 'Đường đồng quy (Trọng tâm G, Phân giác, Trực tâm)', en: 'Centroid, Incenter & Orthocenter', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 40 },
      { id: 'g7_geom_prism', vi: 'Hình hộp & Hình lăng trụ đứng (Sxq, Thể tích)', en: 'Prisms & Boxes (Area & Volume)', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 45 }
    ],
    8: [
      { id: 'all', vi: 'Tổng hợp tất cả chuyên đề Lớp 8', en: 'All Grade 8 Mixed', kind: 'all', domain: 'all', count: 12, seconds: 40 },
      // --- PHẦN SỐ HỌC & ĐẠI SỐ ---
      { id: 'g8_mono_poly', vi: 'Đơn thức & Đa thức nhiều biến (Bậc, Thu gọn)', en: 'Multivariable Monomials & Polynomials', kind: 'knowledge', domain: 'number', count: 10, seconds: 35 },
      { id: 'g8_id', vi: '7 Hằng đẳng thức, Tính nhanh & GTNN/GTLN', en: '7 Identities & Quadratic Min/Max', kind: 'mental', domain: 'number', count: 12, seconds: 30 },
      { id: 'g8_factor', vi: 'Phân tích đa thức thành nhân tử & Nghiệm', en: 'Factoring Polynomials & Roots', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g8_poly', vi: 'Phân thức đại số (ĐKXĐ, Rút gọn, Giá trị)', en: 'Algebraic Fractions & Simplifying', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g8_eq', vi: 'Giải phương trình bậc nhất một ẩn', en: 'Linear Equations in One Variable', kind: 'knowledge', domain: 'number', count: 10, seconds: 35 },
      { id: 'g8_word_eq', vi: 'Giải bài toán bằng cách lập phương trình', en: 'Word Problems via Linear Equations', kind: 'knowledge', domain: 'number', count: 8, seconds: 50 },
      { id: 'g8_func', vi: 'Hàm số y = ax + b, Tọa độ Oxy & Hệ số góc', en: 'Linear Functions, Oxy & Slope', kind: 'knowledge', domain: 'number', count: 10, seconds: 35 },
      { id: 'g8_rat', vi: 'Ôn tập Số hữu tỉ & Lũy thừa tính nhanh', en: 'Rationals & Powers Review', kind: 'mental', domain: 'number', count: 12, seconds: 25 },
      { id: 'g8_prob_stat', vi: 'Thống kê dữ liệu & Xác suất lý thuyết Lớp 8', en: 'Data Statistics & Theoretical Prob', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      // --- PHẦN HÌNH HỌC ---
      { id: 'g8_geom_pytha', vi: 'Định lý Pythagore & Toán đo đạc thực tế', en: 'Pythagorean Theorem & Real Math', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 40 },
      { id: 'g8_geom_quad', vi: 'Tứ giác, Thang cân, Bình hành, HCN, Thoi', en: 'Quadrilaterals & Special Properties', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 40 },
      { id: 'g8_geom_thales', vi: 'Định lý Thalès, Đường trung bình & Phân giác', en: 'Thales, Midsegment & Angle Bisector', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 45 },
      { id: 'g8_geom_sim', vi: 'Tam giác đồng dạng & Đo chiều cao bóng nắng', en: 'Similar Triangles & Shadow Problems', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 45 },
      { id: 'g8_geom_pyramid', vi: 'Hình chóp tam giác đều & Tứ giác đều (Sxq, V)', en: 'Regular Pyramids (Area & Volume)', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 45 }
    ],
    9: [
      { id: 'all', vi: 'Tổng hợp tất cả chuyên đề Lớp 9 (Thi vào 10)', en: 'All Grade 9 Mixed (Gr-10 Prep)', kind: 'all', domain: 'all', count: 12, seconds: 40 },
      // --- PHẦN SỐ HỌC & ĐẠI SỐ ---
      { id: 'g9_sqrt', vi: 'Căn bậc hai, Trục căn thức & Rút gọn căn', en: 'Radicals, Rationalizing & Simplifying', kind: 'mental', domain: 'number', count: 12, seconds: 30 },
      { id: 'g9_cbrt', vi: 'Căn bậc ba (∛) & Hằng đẳng thức √(A²) = |A|', en: 'Cube Roots (∛) & √(A²) = |A|', kind: 'mental', domain: 'number', count: 12, seconds: 25 },
      { id: 'g9_sys_eq', vi: 'Hệ hai phương trình bậc nhất hai ẩn (x, y)', en: 'Systems of Two Linear Equations', kind: 'knowledge', domain: 'number', count: 10, seconds: 45 },
      { id: 'g9_ineq_eq', vi: 'PT tích, PT chứa ẩn ở mẫu & Bất phương trình', en: 'Product/Rational Eq & Inequalities', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g9_eq', vi: 'PT vô tỷ, PT bậc hai, Δ & Hệ thức Viète', en: 'Quadratics, Discriminant & Vieta', kind: 'knowledge', domain: 'number', count: 10, seconds: 45 },
      { id: 'g9_func', vi: 'Hàm số y = ax + b & Parabol (P): y = ax²', en: 'Linear Functions & Parabola y = ax²', kind: 'knowledge', domain: 'number', count: 10, seconds: 40 },
      { id: 'g9_word_sys', vi: 'Giải bài toán bằng cách lập PT / Hệ PT', en: 'Word Problems via Systems & Equations', kind: 'knowledge', domain: 'number', count: 8, seconds: 55 },
      { id: 'g9_real_10', vi: 'Toán thực tế thi vào 10 & Tần số tương đối', en: 'Grade-10 Real Math, Optimization & Stats', kind: 'knowledge', domain: 'number', count: 8, seconds: 55 },
      // --- PHẦN HÌNH HỌC ---
      { id: 'g9_geom_trig', vi: 'Hệ thức lượng & Tỉ số lượng giác (sin, cos, tan)', en: 'Right Triangle Trig & Elevation Angles', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 45 },
      { id: 'g9_geom_chord', vi: 'Đường tròn: Dây cung, Khoảng cách & Tiếp tuyến', en: 'Chords, Center Distance & Tangents', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 45 },
      { id: 'g9_geom_angle', vi: 'Góc ở tâm, Góc nội tiếp & Tứ giác nội tiếp', en: 'Inscribed Angles & Cyclic Quads', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 40 },
      { id: 'g9_geom_arc', vi: 'Độ dài cung tròn & Diện tích quạt tròn, vành khuyên', en: 'Arc Length, Sectors & Annulus Area', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 45 },
      { id: 'g9_geom_solid', vi: 'Hình trụ, Hình nón & Hình cầu (Sxq, V thực tế)', en: 'Cylinders, Cones & Spheres (3D)', kind: 'knowledge', domain: 'geometry', count: 10, seconds: 45 }
    ]
  };

  // =========================================================================
  // 3. QUESTION GENERATORS (3-Tier: 'easy' | 'medium' | 'hard')
  // =========================================================================
  function generateExtendedTopicQuestion(topicId, cfg = {}) {
    const tier = resolveTier(cfg);
    const ex = (extra = {}) => ({ difficulty: tier, ...extra });

    switch (topicId) {
      // ==================== GRADE 1 EXTRA ====================
      case 'g1_number_sense': {
        // Strict Grade 1 rule: NO '(', ')', '×', '÷', NO carry/borrow, answers 0..100
        if (tier === 'easy') {
          const bank = [
            { q: t('Số lớn nhất có một chữ số là số nào?', 'What is the largest 1-digit number?'), a: 9, near: [8, 10, 1], exp: 'Các số có một chữ số từ 0 đến 9 → số lớn nhất là 9.' },
            { q: t('Số bé nhất có hai chữ số là số nào?', 'What is the smallest 2-digit number?'), a: 10, near: [11, 9, 20], exp: 'Các số có hai chữ số từ 10 đến 99 → số bé nhất là 10.' },
            { q: t('Số lớn nhất có hai chữ số là số nào?', 'What is the largest 2-digit number?'), a: 99, near: [89, 98, 90], exp: 'Các số có hai chữ số từ 10 đến 99 → số lớn nhất là 99.' },
            { q: t('Số bé nhất có hai chữ số giống nhau là số nào?', 'Smallest 2-digit number with identical digits?'), a: 11, near: [10, 22, 12], exp: 'Hai chữ số giống nhau bé nhất khác 0 là 1 và 1 → số 11.' }
          ];
          const it = pickAny(bank);
          return makeExtQ(it.q, it.a, it.near, 'natural:place', cfg, it.exp, ex());
        }
        if (tier === 'medium') {
          const tens = rInt(2, 6), diff = rInt(1, 9 - tens), ones = tens + diff, ans = tens * 10 + ones;
          return makeExtQ(
            t(`Tìm số có hai chữ số biết chữ số hàng chục là ${tens}, chữ số hàng đơn vị hơn chữ số hàng chục ${diff} đơn vị`, `Find the 2-digit number with tens digit ${tens} and ones digit ${diff} greater`),
            ans, [ones * 10 + tens, ans + 10, ans - 10], 'natural:place', cfg,
            `Bước 1: Chữ số hàng đơn vị là: ${tens} + ${diff} = ${ones}\nBước 2: Ghép ${tens} chục và ${ones} đơn vị được số ${ans}.`, ex()
          );
        }
        const tens = rInt(2, 7), ones = rInt(1, 9 - tens), sumD = tens + ones, ans = tens * 10 + ones;
        return makeExtQ(
          t(`Tìm số có hai chữ số biết chữ số hàng chục là ${tens} và tổng hai chữ số bằng ${sumD}`, `2-digit number with tens digit ${tens} and digit sum ${sumD} is ?`),
          ans, [ones * 10 + tens, ans + 10, Math.max(10, ans - 10)], 'natural:place', cfg,
          `Bước 1: Tìm chữ số hàng đơn vị: ${sumD} − ${tens} = ${ones}\nBước 2: Số cần tìm gồm ${tens} chục và ${ones} đơn vị → Đáp số: ${ans}.`, ex()
        );
      }
      case 'g1_word_solve': {
        // Strict Grade 1 rule: NO '(', ')', '×', '÷', NO carry/borrow
        if (tier === 'easy') {
          const a10 = rInt(1, 5), a1 = rInt(1, 6), b10 = rInt(1, 8 - a10), b1 = rInt(1, 9 - a1);
          const a = a10 * 10 + a1, b = b10 * 10 + b1, ans = a + b;
          return makeExtQ(
            t(`Thư viện góc lớp có ${a} quyển truyện, cô giáo đặt thêm ${b} quyển nữa. Hỏi góc lớp có tất cả bao nhiêu quyển truyện?`, `Class shelf had ${a} books and got ${b} more. Total books = ?`),
            ans, [ans + 10, Math.max(10, ans - 10), Math.abs(a - b)], 'word:+', cfg,
            `Bài giải:\nSố quyển truyện có tất cả là:\n${a} + ${b} = ${ans} quyển truyện\nĐáp số: ${ans}.`, ex()
          );
        }
        if (tier === 'medium') {
          const a = rInt(2, 5) * 10 + rInt(4, 8), sub = rInt(1, 3), add = rInt(1, 4);
          const mid = a - sub, ans = mid + add;
          return makeExtQ(
            t(`Trên xe buýt có ${a} hành khách, đến trạm có ${sub} người xuống xe và ${add} người lên xe. Hỏi trên xe lúc này có bao nhiêu hành khách?`, `A bus had ${a} people; ${sub} got off and ${add} got on. People now = ?`),
            ans, [ans + 10, Math.max(10, ans - 10), a + sub + add], 'word:2step', cfg,
            `Bài giải:\nBước 1: Sau khi xuống xe còn lại: ${a} − ${sub} = ${mid} người\nBước 2: Sau khi thêm người lên xe có: ${mid} + ${add} = ${ans} người\nĐáp số: ${ans}.`, ex()
          );
        }
        const left10 = rInt(1, 5), left1 = rInt(1, 5), gave = rInt(2, 9 - left1);
        const left = left10 * 10 + left1, ans = left + gave;
        return makeExtQ(
          t(`Sau khi biếu bà ${gave} quả cam thì trong rổ còn lại ${left} quả cam. Hỏi lúc đầu trong rổ có tất cả bao nhiêu quả cam?`, `After giving ${gave} oranges, ${left} oranges remain. How many at first?`),
          ans, [left - gave, ans + 10, Math.max(10, ans - 10)], 'word:reverse', cfg,
          `Bài giải:\nMuốn tìm số cam lúc đầu, ta gộp số đã biếu và số còn lại:\n${left} + ${gave} = ${ans} quả cam\nĐáp số: ${ans}.`, ex()
        );
      }

      // ==================== GRADE 2 EXTRA ====================
      case 'g2_mental_fast': {
        if (tier === 'easy') {
          const pair = pickAny([[2, 8], [3, 7], [4, 6], [5, 5]]);
          const a = rInt(1, 5) * 10 + pair[0], b = rInt(1, 3) * 10 + pair[1], ans = a + b;
          return makeExtQ(`${a} + ${b}`, ans, [ans + 10, ans - 10, ans + 20], 'natural:convenient', cfg,
            `Gộp hàng đơn vị tròn chục: ${pair[0]} + ${pair[1]} = 10 → ${a} + ${b} = ${ans}.`, ex());
        }
        if (tier === 'medium') {
          const a = rInt(2, 6) * 10 + pickAny([8, 9]), b = rInt(15, 28), need = 10 - (a % 10), ans = a + b;
          return makeExtQ(`${a} + ${b}`, ans, [ans - 10, ans + 10, ans + 2], 'natural:convenient', cfg,
            `Mẹo bù tròn chục:\n• Tách ${b} = ${need} + ${b - need}\n• Gộp ${a} + ${need} = ${a + need}, rồi cộng ${b - need} = ${ans}.`, ex());
        }
        const pair = pickAny([[15, 85], [25, 75], [35, 65], [40, 60], [30, 70]]);
        const mid = rInt(112, 380), ans = 100 + mid;
        return makeExtQ(`${pair[0]} + ${mid} + ${pair[1]}`, ans, [ans + 10, ans - 10, ans + 100], 'natural:convenient', cfg,
          `Nhóm hai số cộng tròn 100 trước:\n(${pair[0]} + ${pair[1]}) + ${mid} = 100 + ${mid} = ${ans}.`, ex());
      }
      case 'g2_word_two': {
        if (tier === 'easy') {
          const an = rInt(35, 72), diff = rInt(14, 26), binh = an - diff;
          return makeExtQ(
            t(`An gấp được ${an} ngôi sao, An gấp được NHIỀU HƠN Bình ${diff} ngôi sao. Hỏi Bình gấp được bao nhiêu ngôi sao?`, `An folded ${an} stars, which is ${diff} MORE than Binh. How many did Binh fold?`),
            binh, [an + diff, binh + 10, Math.max(5, binh - 10)], 'word:reverse', cfg,
            `Phân tích kỹ đề: An nhiều hơn Bình ${diff} ngôi sao tức là Bình ÍT HƠN An ${diff} ngôi sao.\nSố ngôi sao của Bình: ${an} − ${diff} = ${binh} (ngôi sao).`, ex()
          );
        }
        if (tier === 'medium') {
          const front = rInt(6, 15), back = rInt(5, 14), ans = front + back + 1;
          return makeExtQ(
            t(`Các bạn xếp thành 1 hàng dọc. Phía trước Minh có ${front} bạn, phía sau Minh có ${back} bạn. Hỏi hàng đó có tất cả bao nhiêu bạn?`, `In a line, ${front} kids stand before Minh and ${back} behind Minh. Total kids = ?`),
            ans, [front + back, ans + 1, ans + 10], 'word:logic', cfg,
            `Bài giải:\nTổng số bạn = số bạn phía trước + bản thân Minh (1) + số bạn phía sau:\n${front} + 1 + ${back} = ${ans} (bạn).`, ex()
          );
        }
        const b = rInt(18, 36), give = rInt(4, 9), equalVal = b + give, a = equalVal + give;
        return makeExtQ(
          t(`Ngăn trên có ${a} quyển sách, ngăn dưới có ${b} quyển. Nếu chuyển ${give} quyển từ ngăn trên xuống ngăn dưới thì mỗi ngăn có bao nhiêu quyển sách?`, `Top shelf has ${a} books, bottom has ${b}. Move ${give} from top to bottom; each shelf now has ?`),
          equalVal, [a + give, b, equalVal + 10], 'word:2step', cfg,
          `Bài giải:\nSau khi nhận thêm ${give} quyển, ngăn dưới có: ${b} + ${give} = ${equalVal} (quyển)\n(Kiểm tra ngăn trên: ${a} − ${give} = ${equalVal} quyển → hai ngăn bằng nhau).`, ex()
        );
      }

      // ==================== GRADE 3 EXTRA ====================
      case 'g3_fast_calc': {
        if (tier === 'easy') {
          const k = rInt(3, 9), pair = pickAny([[2, 5], [4, 25]]), ans = pair[0] * pair[1] * k;
          return makeExtQ(`${pair[0]} × ${k} × ${pair[1]}`, ans, [ans + 10, Math.max(10, ans - 10), pair[0] * k + pair[1]], 'natural:convenient', cfg,
            `Nhóm (${pair[0]} × ${pair[1]}) × ${k} = ${pair[0] * pair[1]} × ${k} = ${ans}.`, ex());
        }
        if (tier === 'medium') {
          const f = rInt(12, 48), pair = pickAny([[3, 7], [4, 6], [2, 8]]), ans = f * 10;
          return makeExtQ(`${f} × ${pair[0]} + ${f} × ${pair[1]}`, ans, [ans + 10, ans - 10, f * pair[0] + pair[1]], 'natural:convenient', cfg,
            `Nhóm thừa số chung ${f}:\n${f} × (${pair[0]} + ${pair[1]}) = ${f} × 10 = ${ans}.`, ex());
        }
        const step = rInt(3, 6), gaps = rInt(8, 18), len = step * gaps, trees = gaps + 1;
        return makeExtQ(
          t(`Đoạn đường dài ${len} m, người ta trồng cây cách đều ${step} m một cây ở một bên đường (có trồng ở cả hai đầu đường). Hỏi trồng được tất cả bao nhiêu cây?`, `A ${len} m road has trees every ${step} m on one side (including both ends). Total trees = ?`),
          trees, [gaps, gaps - 1, trees + 10], 'word:trees', cfg,
          `Bài giải:\nBước 1: Số khoảng cách ${step} m là: ${len} ÷ ${step} = ${gaps} (khoảng)\nBước 2: Trồng cả hai đầu đường nên số cây = số khoảng + 1 = ${gaps} + 1 = ${trees} (cây).`, ex()
        );
      }
      case 'g3_word_two_step': {
        if (tier === 'easy') {
          const a = rInt(14, 32), k = rInt(2, 4), b = a * k, ans = a + b;
          return makeExtQ(
            t(`Thùng thứ nhất đựng ${a} lít mật ong, thùng thứ hai đựng gấp ${k} lần thùng thứ nhất. Hỏi cả hai thùng đựng bao nhiêu lít mật ong?`, `Can 1 holds ${a} L, Can 2 holds ${k} times Can 1. Total liters in both = ?`),
            ans, [b, ans + 10, Math.max(10, ans - 10)], 'word:2step', cfg,
            `Bài giải:\nBước 1: Thùng thứ hai đựng: ${a} × ${k} = ${b} (lít)\nBước 2: Cả hai thùng đựng: ${a} + ${b} = ${ans} (lít).`, ex()
          );
        }
        if (tier === 'medium') {
          const perBag = rInt(5, 9), bags = rInt(6, 12), left = rInt(12, 35), total = perBag * bags + left;
          return makeExtQ(
            t(`Cửa hàng có ${total} kg gạo, đã bán đi ${left} kg, số gạo còn lại chia đều vào ${bags} túi. Hỏi mỗi túi có bao nhiêu ki-lô-gam gạo?`, `Store had ${total} kg rice, sold ${left} kg, packed the rest equally into ${bags} bags. Kg per bag = ?`),
            perBag, [perBag + 1, Math.max(1, perBag - 1), perBag + 2], 'word:2step', cfg,
            `Bài giải:\nBước 1: Số gạo còn lại là: ${total} − ${left} = ${total - left} (kg)\nBước 2: Mỗi túi đựng: ${total - left} ÷ ${bags} = ${perBag} (kg).`, ex()
          );
        }
        const cap = pickAny([4, 6, 7, 8]), fullBoats = rInt(5, 11), rem = rInt(1, cap - 1), students = cap * fullBoats + rem, ans = fullBoats + 1;
        return makeExtQ(
          t(`Đoàn tham quan gồm ${students} học sinh cần qua sông. Mỗi thuyền chở tối đa ${cap} học sinh (không kể người lái). Hỏi cần ít nhất bao nhiêu chiếc thuyền để chở hết đoàn?`, `${students} students cross a river; each boat holds up to ${cap} students. Minimum boats needed = ?`),
          ans, [fullBoats, ans + 1, fullBoats - 1], 'word:remainder', cfg,
          `Bài giải:\nTa có phép chia: ${students} ÷ ${cap} = ${fullBoats} (thuyền) dư ${rem} (học sinh).\nVì còn dư ${rem} học sinh cũng cần thêm 1 chiếc thuyền nữa nên số thuyền ít nhất là:\n${fullBoats} + 1 = ${ans} (chiếc thuyền).`, ex()
        );
      }

      // ==================== GRADE 4 EXTRA ====================
      case 'g4_seq_gauss': {
        if (tier === 'easy') {
          const step = pickAny([2, 3, 4, 5]), cnt = rInt(8, 25), first = rInt(1, 10), last = first + (cnt - 1) * step;
          return makeExtQ(
            t(`Dãy số cách đều: ${first}, ${first + step}, ${first + 2 * step}, ..., ${last} có tất cả bao nhiêu số hạng?`, `How many terms are in the sequence ${first}, ${first + step}, ..., ${last}?`),
            cnt, [cnt - 1, cnt + 1, cnt + 10], 'number:seq', cfg,
            `Công thức tính số số hạng dãy cách đều:\n(Số cuối − Số đầu) ÷ Khoảng cách + 1 = (${last} − ${first}) ÷ ${step} + 1 = ${cnt} (số hạng).`, ex()
          );
        }
        if (tier === 'medium') {
          const step = pickAny([2, 3, 5]), cnt = pickAny([6, 8, 10, 12]), first = rInt(2, 10), last = first + (cnt - 1) * step;
          const sum = ((first + last) * cnt) / 2;
          return makeExtQ(
            t(`Tính tổng dãy số cách đều gồm ${cnt} số hạng: ${first} + ${first + step} + ${first + 2 * step} + ... + ${last}`, `Sum the ${cnt}-term arithmetic sequence: ${first} + ${first + step} + ... + ${last}`),
            sum, [sum + 10, Math.max(10, sum - 10), (first + last) * cnt], 'number:seq', cfg,
            `Công thức Gauss tính tổng dãy cách đều:\nTổng = (Số đầu + Số cuối) × Số số hạng ÷ 2\n= (${first} + ${last}) × ${cnt} ÷ 2 = ${sum}.`, ex()
          );
        }
        const first = rInt(3, 12), step = pickAny([3, 4, 5]), n = rInt(15, 30), ans = first + (n - 1) * step;
        return makeExtQ(
          t(`Cho dãy số quy luật: ${first}, ${first + step}, ${first + 2 * step}, ${first + 3 * step}, ... Tìm số hạng thứ ${n} của dãy số?`, `In sequence ${first}, ${first + step}, ${first + 2 * step}, ..., what is the ${n}th term?`),
          ans, [first + n * step, ans - 10, ans + 10], 'number:seq', cfg,
          `Số hạng thứ n = Số đầu + (n − 1) × Khoảng cách\n= ${first} + (${n} − 1) × ${step} = ${first} + ${(n - 1) * step} = ${ans}.`, ex()
        );
      }
      case 'g4_word_adv': {
        if (tier === 'easy') {
          const w = rInt(8, 18), diff = rInt(4, 12), l = w + diff, halfP = l + w, area = l * w;
          return makeExtQ(
            t(`Mảnh vườn hình chữ nhật có nửa chu vi là ${halfP} m, chiều dài hơn chiều rộng ${diff} m. Tính diện tích mảnh vườn (m²)?`, `A rectangle has semi-perimeter ${halfP} m and length exceeds width by ${diff} m. Area (m²) = ?`),
            area, [halfP * 2, area + 10, Math.max(10, area - 10)], 'word:sumdiff', cfg,
            `Bài giải:\n• Chiều rộng: (${halfP} − ${diff}) ÷ 2 = ${w} (m)\n• Chiều dài: ${w} + ${diff} = ${l} (m)\n• Diện tích mảnh vườn: ${l} × ${w} = ${area} (m²).`, ex({ visualKind: 'rect', visualData: { l, w } })
          );
        }
        if (tier === 'medium') {
          const w = rInt(6, 14), diff = pickAny([4, 6, 8, 10]), l = w + diff, p = (l + w) * 2, area = l * w;
          return makeExtQ(
            t(`Sân trường hình chữ nhật có chu vi ${p} m, chiều rộng kém chiều dài ${diff} m. Diện tích sân trường là bao nhiêu m²?`, `Rectangle perimeter is ${p} m, width is ${diff} m less than length. Area (m²) = ?`),
            area, [area + 20, Math.max(10, area - 20), l + w], 'word:sumdiff', cfg,
            `Bài giải (Tổng – Hiệu ẩn):\n• Bước 1: Nửa chu vi (tổng dài và rộng): ${p} ÷ 2 = ${l + w} (m)\n• Bước 2: Chiều rộng: (${l + w} − ${diff}) ÷ 2 = ${w} (m); Chiều dài: ${w} + ${diff} = ${l} (m)\n• Bước 3: Diện tích: ${l} × ${w} = ${area} (m²).`, ex({ visualKind: 'rect', visualData: { l, w } })
          );
        }
        // Fraction remainder multi-step word problem
        const unit = rInt(4, 12), total = 15 * unit; // 1/3 + 2/5 = 11/15 -> remaining 4/15 = 4 * unit
        const remMeters = 4 * unit;
        return makeExtQ(
          t(`Một tấm vải buổi sáng bán 1/3 tấm, buổi chiều bán 2/5 tấm vải ban đầu thì còn lại ${remMeters} m. Hỏi lúc đầu tấm vải dài bao nhiêu mét?`, `A cloth sold 1/3 in the morning and 2/5 in the afternoon, leaving ${remMeters} m. Initial length (m) = ?`),
          total, [total + 10, Math.max(15, total - 10), 11 * unit], 'word:fraction', cfg,
          `Bài giải:\n• Bước 1: Phân số chỉ phần vải đã bán: 1/3 + 2/5 = 11/15 (tấm vải)\n• Bước 2: Phân số chỉ ${remMeters} m vải còn lại: 1 − 11/15 = 4/15 (tấm vải)\n• Bước 3: Độ dài tấm vải ban đầu: ${remMeters} ÷ 4 × 15 = ${total} (m).`, ex()
        );
      }

      // ==================== GRADE 5 EXTRA ====================
      case 'g5_work_rate': {
        if (tier === 'easy') {
          const days1 = pickAny([3, 4, 5]), perDay = rInt(12, 25), prod1 = days1 * perDay, days2 = days1 + rInt(2, 4), ans = days2 * perDay;
          return makeExtQ(
            t(`Một tổ thợ làm trong ${days1} ngày được ${prod1} sản phẩm. Với mức làm như thế, trong ${days2} ngày tổ đó làm được bao nhiêu sản phẩm?`, `A team makes ${prod1} items in ${days1} days. At the same rate, items in ${days2} days = ?`),
            ans, [ans + 10, Math.max(10, ans - 10), prod1 + days2], 'word:rate', cfg,
            `Bài giải:\n• Số sản phẩm làm trong 1 ngày: ${prod1} ÷ ${days1} = ${perDay} (sản phẩm)\n• Trong ${days2} ngày làm được: ${perDay} × ${days2} = ${ans} (sản phẩm).`, ex()
          );
        }
        if (tier === 'medium') {
          const pairs = [[3, 6, 2], [4, 12, 3], [6, 12, 4], [10, 15, 6], [12, 24, 8], [5, 20, 4]];
          const [t1, t2, both] = pickAny(pairs);
          return makeExtQ(
            t(`Vòi thứ nhất chảy riêng ${t1} giờ đầy bể, vòi thứ hai chảy riêng ${t2} giờ đầy bể. Nếu mở cả hai vòi cùng chảy vào bể cạn thì sau mấy giờ đầy bể?`, `Pipe 1 fills a tank in ${t1}h, Pipe 2 in ${t2}h. Together they fill it in ? hours`),
            both, [both + 1, Math.max(1, both - 1), (t1 + t2) / 2], 'word:work', cfg,
            `Bài giải (Toán công việc chung):\n• Trong 1 giờ, vòi 1 chảy được 1/${t1} bể; vòi 2 chảy được 1/${t2} bể.\n• Trong 1 giờ cả hai vòi chảy được: 1/${t1} + 1/${t2} = 1/${both} (bể)\n• Thời gian đầy bể: 1 ÷ (1/${both}) = ${both} (giờ).`, ex()
          );
        }
        const combos = [[12, 10, 8, 15], [15, 8, 6, 20], [8, 9, 6, 12], [10, 12, 8, 15], [16, 9, 8, 18]];
        const [w1, d1, d2, w2] = pickAny(combos);
        const added = w2 - w1;
        return makeExtQ(
          t(`Một đội gồm ${w1} công nhân dự định sửa xong đoạn đường trong ${d1} ngày. Muốn hoàn thành sớm để chỉ làm trong ${d2} ngày thì cần bổ sung THÊM bao nhiêu công nhân (năng suất như nhau)?`, `${w1} workers finish a road in ${d1} days. To finish in ${d2} days instead, how many MORE workers are needed?`),
          added, [w2, added + 2, Math.max(1, added - 1)], 'word:inverse', cfg,
          `Bài giải (Tỉ lệ nghịch):\n• Tổng số công lao động cần thiết: ${w1} × ${d1} = ${w1 * d1} (ngày công)\n• Số công nhân cần để làm xong trong ${d2} ngày: ${w1 * d1} ÷ ${d2} = ${w2} (người)\n• Số công nhân cần bổ sung thêm: ${w2} − ${w1} = ${added} (người).`, ex()
        );
      }
      case 'g5_word_10pt': {
        if (tier === 'easy') {
          const capMil = pickAny([20, 40, 50, 80, 100]), rate = pickAny([5, 6, 7, 8]);
          const interest = fmtDec((capMil * rate) / 100);
          return makeExtQ(
            t(`Mẹ gửi tiết kiệm ${capMil} triệu đồng với lãi suất ${rate}% một năm. Sau 1 năm mẹ nhận được bao nhiêu triệu đồng tiền lãi?`, `Deposit ${capMil} million VND at ${rate}%/year. Interest after 1 year (million VND) = ?`),
            interest, [(capMil * rate) / 10, Number(interest.replace(',', '.')) + 1, capMil + (capMil * rate) / 100], 'percent:interest', cfg,
            `Tiền lãi sau 1 năm = Tiền gửi × Lãi suất:\n${capMil} × ${rate} ÷ 100 = ${interest} (triệu đồng).`, ex()
          );
        }
        if (tier === 'medium') {
          const cost = pickAny([150, 200, 250, 300, 400]), pctProfit = pickAny([15, 20, 25]);
          const sellPrice = cost + (cost * pctProfit) / 100;
          return makeExtQ(
            t(`Một chiếc cặp sách bán với giá ${sellPrice} nghìn đồng thì cửa hàng lãi ${pctProfit}% so với giá vốn. Hỏi giá vốn của chiếc cặp là bao nhiêu nghìn đồng?`, `A bag sold for ${sellPrice}k VND yields ${pctProfit}% profit on cost. Cost price (k VND) = ?`),
            cost, [sellPrice - pctProfit, Math.round(sellPrice * (1 - pctProfit / 100)), cost + 20], 'percent:cost', cfg,
            `Bài giải:\n• Giá bán ứng với: 100% + ${pctProfit}% = ${100 + pctProfit}% (giá vốn)\n• Giá vốn chiếc cặp là: ${sellPrice} ÷ ${100 + pctProfit} × 100 = ${cost} (nghìn đồng).`, ex()
          );
        }
        const kind = pickAny(['telescoping', 'train', 'areaPct']);
        if (kind === 'telescoping') {
          const n = pickAny([9, 14, 19, 24, 49]);
          const ans = fracStr(n, n + 1);
          return makeExtQ(
            t(`Tính nhanh tổng dãy phân số quy luật: S = 1/(1×2) + 1/(2×3) + 1/(3×4) + ... + 1/(${n}×${n + 1})`, `Evaluate telescoping sum: S = 1/(1×2) + 1/(2×3) + ... + 1/(${n}×${n + 1})`),
            ans, [fracStr(n - 1, n + 1), fracStr(1, n + 1), fracStr(n + 1, n + 2)], 'fraction:series', cfg,
            `Áp dụng quy tắc khử liên tiếp 1/(k×(k+1)) = 1/k − 1/(k+1):\nS = (1 − 1/2) + (1/2 − 1/3) + ... + (1/${n} − 1/${n + 1})\nS = 1 − 1/${n + 1} = ${ans}.`, ex()
          );
        }
        if (kind === 'train') {
          const v = pickAny([12, 15, 20]), tSec = rInt(15, 35), totalLen = v * tSec, trainLen = pickAny([80, 100, 120]);
          const bridgeLen = totalLen - trainLen;
          if (bridgeLen > 20) {
            return makeExtQ(
              t(`Đoàn tàu dài ${trainLen} m chạy với vận tốc ${v} m/giây vượt qua hoàn toàn một cây cầu dài ${bridgeLen} m hết bao nhiêu giây?`, `A ${trainLen} m train at ${v} m/s completely crosses a ${bridgeLen} m bridge in ? seconds`),
              tSec, [Math.round(bridgeLen / v), tSec + 10, Math.max(5, tSec - 5)], 'motion:train', cfg,
              `Bài giải:\n• Quãng đường tàu đi để vượt qua hoàn toàn cây cầu bằng tổng chiều dài cầu và chiều dài tàu:\n  ${bridgeLen} + ${trainLen} = ${totalLen} (m)\n• Thời gian vượt cầu: ${totalLen} ÷ ${v} = ${tSec} (giây).`, ex()
            );
          }
        }
        const inc = pickAny([10, 20, 30]), ansPct = Math.round(((100 + inc) * (100 + inc)) / 100 - 100);
        return makeExtQ(
          t(`Nếu cạnh của một hình vuông tăng thêm ${inc}% thì diện tích của hình vuông đó tăng thêm bao nhiêu phần trăm (%)?`, `If the side of a square increases by ${inc}%, by what % does its area increase?`),
          ansPct, [inc * 2, inc * inc, ansPct + 10], 'percent:area', cfg,
          `Bài giải:\n• Cạnh mới bằng ${100 + inc}% = ${fmtDec((100 + inc) / 100)} cạnh ban đầu.\n• Diện tích mới bằng: ${fmtDec((100 + inc) / 100)} × ${fmtDec((100 + inc) / 100)} = ${100 + ansPct}% diện tích ban đầu.\n• Vậy diện tích tăng thêm: ${100 + ansPct}% − 100% = ${ansPct}%.`, ex()
        );
      }

      // ==================== GRADE 6: SỐ HỌC ====================
      case 'g6_nat_ops': {
        if (tier === 'easy') {
          const a = rInt(10, 35), b = a + rInt(15, 60), cnt = b - a + 1;
          return makeExtQ(
            t(`Tập hợp A = {${a}; ${a + 1}; ${a + 2}; ...; ${b}} có bao nhiêu phần tử?`, `How many elements are in set A = {${a}; ${a + 1}; ...; ${b}}?`),
            cnt, [b - a, cnt + 1, cnt + 10], 'natural:set', cfg,
            `Số phần tử của tập hợp số tự nhiên liên tiếp từ ${a} đến ${b}:\n${b} − ${a} + 1 = ${cnt} (phần tử).`, ex()
          );
        }
        if (tier === 'medium') {
          const p = rInt(2, 4), inner = p * p + rInt(3, 8), mul = rInt(2, 4), outer = rInt(50, 95), ans = outer - mul * inner;
          if (ans > 0) {
            return makeExtQ(
              t(`Tính giá trị biểu thức: ${outer} − ${mul} · (${p}^2 + ${inner - p * p})`, `Evaluate: ${outer} − ${mul} · (${p}^2 + ${inner - p * p})`),
              ans, [ans + 10, Math.max(1, ans - 10), (outer - mul) * inner], 'natural:expression', cfg,
              `Thứ tự thực hiện phép tính (Lũy thừa → Ngoặc → Nhân chia → Cộng trừ):\n• ${p}² + ${inner - p * p} = ${p * p} + ${inner - p * p} = ${inner}\n• ${outer} − ${mul} · ${inner} = ${outer} − ${mul * inner} = ${ans}.`, ex()
            );
          }
        }
        const f = rInt(15, 48), a = rInt(25, 65), b = 100 - a, sub = rInt(10, 90), ans = f * 100 - sub;
        return makeExtQ(
          t(`Tính hợp lý: ${f} · ${a} + ${f} · ${b} − ${sub}`, `Compute smartly: ${f} · ${a} + ${f} · ${b} − ${sub}`),
          ans, [ans + 10, ans - 10, f * 100 + sub], 'natural:convenient', cfg,
          `Áp dụng tính chất phân phối:\n${f} · (${a} + ${b}) − ${sub} = ${f} · 100 − ${sub} = ${f * 100} − ${sub} = ${ans}.`, ex()
        );
      }
      case 'g6_pow': {
        if (tier === 'easy') {
          const a = rInt(2, 5), e1 = rInt(2, 3), b = rInt(2, 5), e2 = 2, ans = a ** e1 + b ** e2;
          return makeExtQ(`${a}^${e1} + ${b}^${e2}`, ans, [a * e1 + b * e2, ans + 10, Math.max(2, ans - 10)], 'power:^', cfg,
            `${a}^${e1} = ${a ** e1}; ${b}^${e2} = ${b ** e2} → ${a ** e1} + ${b ** e2} = ${ans}.`, ex());
        }
        if (tier === 'medium') {
          const base = pickAny([2, 3, 5]), e1 = rInt(4, 7), e2 = rInt(2, e1 - 2), diff = e1 - e2, ans = base ** diff;
          return makeExtQ(
            t(`Tính: ${base}^${e1} ÷ ${base}^${e2}`, `Evaluate: ${base}^${e1} ÷ ${base}^${e2}`),
            ans, [base * diff, ans + base, Math.max(1, ans - base)], 'power:^', cfg,
            `Chia hai lũy thừa cùng cơ số: ${base}^${e1} ÷ ${base}^${e2} = ${base}^(${e1} − ${e2}) = ${base}^${diff} = ${ans}.`, ex()
          );
        }
        const base = pickAny([2, 3]), n = rInt(2, 4), rhs = base ** n + base ** (n + 1);
        return makeExtQ(
          t(`Tìm số tự nhiên n biết: ${base}^n + ${base}^(n+1) = ${rhs}`, `Find natural n: ${base}^n + ${base}^(n+1) = ${rhs}`),
          n, [n + 1, Math.max(1, n - 1), n + 2], 'power:^', cfg,
          `Đặt ${base}^n làm thừa số chung:\n${base}^n · (1 + ${base}) = ${rhs} ⇒ ${base}^n · ${1 + base} = ${rhs} ⇒ ${base}^n = ${base ** n} ⇒ n = ${n}.`, ex()
        );
      }
      case 'g6_div_prime': {
        if (tier === 'easy') {
          const primesUnder20 = [2, 3, 5, 7, 11, 13, 17, 19];
          const lim = pickAny([10, 15, 20]);
          const cnt = primesUnder20.filter(p => p < lim).length;
          return makeExtQ(
            t(`Có bao nhiêu số nguyên tố nhỏ hơn ${lim}?`, `How many prime numbers are less than ${lim}?`),
            cnt, [cnt + 1, Math.max(1, cnt - 1), cnt + 2], 'number:prime', cfg,
            `Các số nguyên tố nhỏ hơn ${lim} là: ${primesUnder20.filter(p => p < lim).join('; ')} → có ${cnt} số (lưu ý 0 và 1 không phải số nguyên tố).`, ex()
          );
        }
        if (tier === 'medium') {
          const d1 = rInt(1, 7), d2 = rInt(1, 8);
          const sumKnown = d1 + d2; // y = 0 for divisible by 2 and 5
          const rem = sumKnown % 9;
          const xDigit = rem === 0 ? 9 : 9 - rem;
          return makeExtQ(
            t(`Tìm chữ số x (1–9) để số tự nhiên 4 chữ số ${d1}x${d2}0 chia hết cho cả 2, 5 và 9`, `Find digit x (1–9) so ${d1}x${d2}0 is divisible by 2, 5, and 9`),
            xDigit, [xDigit === 9 ? 6 : xDigit + 1, Math.max(1, xDigit - 1), (xDigit + 3) % 9 || 3], 'number:div', cfg,
            `• Chữ số tận cùng là 0 nên đã chia hết cho 2 và 5.\n• Để chia hết cho 9 thì (${d1} + x + ${d2} + 0) = ${sumKnown} + x phải chia hết cho 9 → x = ${xDigit}.`, ex()
          );
        }
        // Number of divisors from prime factorization
        const p1 = 2, e1 = rInt(2, 4), p2 = pickAny([3, 5]), e2 = rInt(1, 2);
        const N = (p1 ** e1) * (p2 ** e2), numDivs = (e1 + 1) * (e2 + 1);
        return makeExtQ(
          t(`Phân tích ${N} ra thừa số nguyên tố rồi cho biết số ${N} có tất cả bao nhiêu ước tự nhiên?`, `How many positive divisors does ${N} have?`),
          numDivs, [e1 + e2, numDivs + 2, Math.max(2, numDivs - 2)], 'number:prime', cfg,
          `Ta phân tích: ${N} = ${p1}^${e1} · ${p2}${e2 > 1 ? '^' + e2 : ''}.\nSố ước tự nhiên là: (${e1} + 1) · (${e2} + 1) = ${numDivs} (ước).`, ex()
        );
      }
      case 'g6_div': {
        if (tier === 'easy') {
          const p = pickAny([[12, 18], [16, 24], [18, 30], [20, 35], [24, 36]]);
          if (Math.random() < 0.5) {
            const ans = gcd2(p[0], p[1]);
            return makeExtQ(`ƯCLN(${p[0]}, ${p[1]})`, ans, [ans * 2, Math.max(1, Math.floor(ans / 2)), ans + 2], 'number:gcd', cfg,
              `Ước chung lớn nhất của ${p[0]} và ${p[1]} là ${ans}.`, ex());
          }
          const ans = lcm2(p[0], p[1]);
          return makeExtQ(`BCNN(${p[0]}, ${p[1]})`, ans, [ans * 2, ans + 10, Math.max(6, ans - 10)], 'number:lcm', cfg,
            `Bội chung nhỏ nhất của ${p[0]} và ${p[1]} là ${ans}.`, ex());
        }
        if (tier === 'medium') {
          const g = pickAny([6, 8, 9, 12]), m1 = pickAny([3, 4]), m2 = pickAny([5, 7]);
          const docs = g * m1, nurses = g * m2;
          return makeExtQ(
            t(`Đội y tế có ${docs} bác sĩ và ${nurses} điều dưỡng. Có thể chia nhiều nhất thành mấy tổ sao cho số bác sĩ và điều dưỡng được chia đều vào các tổ?`, `A team of ${docs} doctors and ${nurses} nurses splits equally into the maximum number of groups. Groups = ?`),
            g, [g * 2, Math.max(2, Math.floor(g / 2)), m1 + m2], 'word:gcd', cfg,
            `Bài giải:\nSố tổ nhiều nhất chính là ƯCLN(${docs}, ${nurses}).\nTa có: ${docs} = ${g} · ${m1}, ${nurses} = ${g} · ${m2} (với ƯCLN(${m1}, ${m2}) = 1) → Chia được nhiều nhất ${g} tổ.`, ex()
          );
        }
        const pairs = [[8, 10, 12, 120], [6, 8, 9, 72], [10, 12, 15, 60]];
        const [a, b, c, lcmVal] = pickAny(pairs);
        const k = lcmVal === 60 ? rInt(3, 5) : lcmVal === 72 ? rInt(2, 4) : rInt(1, 2);
        const rem = rInt(1, 4), total = lcmVal * k + rem, lo = lcmVal * k - 20, hi = lcmVal * k + 30;
        return makeExtQ(
          t(`Số học sinh khối 6 trong khoảng từ ${lo} đến ${hi} em. Khi xếp hàng ${a}, hàng ${b} hoặc hàng ${c} đều thừa ${rem} em. Tính số học sinh khối 6?`, `Students between ${lo} and ${hi}: lining up by ${a}, ${b}, or ${c} always leaves ${rem} extra. Total students = ?`),
          total, [lcmVal * k, lcmVal * k - rem, total + 10], 'word:lcm', cfg,
          `Bài giải:\n• Gọi x là số học sinh (${lo} ≤ x ≤ ${hi}). Vì x chia ${a}, ${b}, ${c} đều dư ${rem} nên (x − ${rem}) ∈ BC(${a}, ${b}, ${c}).\n• BCNN(${a}, ${b}, ${c}) = ${lcmVal} ⇒ x − ${rem} = ${lcmVal * k} ⇒ x = ${total} (học sinh).`, ex()
        );
      }
      case 'g6_int': {
        if (tier === 'easy') {
          const a = -rInt(5, 25), b = rInt(8, 30), isMul = Math.random() < 0.4;
          if (isMul) {
            const m1 = -rInt(3, 9), m2 = pickAny([-6, -4, 4, 5, 7]), ans = m1 * m2;
            return makeExtQ(`(${m1}) × (${m2})`, ans, [-ans, ans + 10, ans - 10], 'negative:*', cfg,
              `Nhân hai số nguyên ${m2 < 0 ? 'cùng dấu ra dương' : 'khác dấu ra âm'}: (${m1}) × (${m2}) = ${ans}.`, ex({ allowNeg: true }));
          }
          const ans = a + b;
          return makeExtQ(`(${a}) + ${b}`, ans, [-ans, a - b, ans + 10], 'negative:+', cfg,
            `Cộng hai số nguyên khác dấu: (${a}) + ${b} = ${ans}.`, ex({ allowNeg: true }));
        }
        if (tier === 'medium') {
          const a = rInt(25, 85), b = rInt(12, 48), c = rInt(5, 30), ans = -b - c;
          return makeExtQ(
            t(`Bỏ dấu ngoặc rồi tính nhanh: (${a} − ${b}) − (${a} + ${c})`, `Simplify brackets: (${a} − ${b}) − (${a} + ${c})`),
            ans, [-ans, b - c, -b + c], 'negative:convenient', cfg,
            `Quy tắc dấu ngoặc:\n(${a} − ${b}) − (${a} + ${c}) = ${a} − ${b} − ${a} − ${c} = (${a} − ${a}) − (${b} + ${c}) = ${ans}.`, ex({ allowNeg: true })
          );
        }
        // Sum of all integers x with -a <= x <= b
        const a = rInt(5, 14), b = a + pickAny([1, 2]), ans = b === a + 1 ? b : (a + 1) + (a + 2);
        return makeExtQ(
          t(`Tính tổng tất cả các số nguyên x thỏa mãn: −${a} ≤ x ≤ ${b}`, `Find the sum of all integers x such that −${a} ≤ x ≤ ${b}`),
          ans, [0, -ans, ans + a], 'negative:sum', cfg,
          `Nhóm từng cặp số nguyên đối nhau từ −${a} đến ${a} có tổng bằng 0:\n[(−${a} + ${a}) + ... + (−1 + 1) + 0] + ${b === a + 1 ? b : `${a + 1} + ${b}`} = ${ans}.`, ex({ allowNeg: true })
        );
      }
      case 'g6_findx': {
        if (tier === 'easy') {
          const a = rInt(2, 6), x = rInt(-8, 9) || -3, b = rInt(4, 18), rhs = a * x + b;
          return makeExtQ(t(`Tìm số nguyên x: ${a}x + ${b} = ${rhs}`, `Solve for x: ${a}x + ${b} = ${rhs}`), x, [-x, x + 1, x - 1], 'equation:x', cfg,
            `${a}x = ${rhs} − ${b} = ${rhs - b} ⇒ x = (${rhs - b}) ÷ ${a} = ${x}.`, ex({ allowNeg: true }));
        }
        if (tier === 'medium') {
          const a = rInt(15, 40), x = rInt(-12, 12) || -5, b = rInt(4, 15), rhs = a - (x + b);
          return makeExtQ(t(`Tìm x ∈ ℤ: ${a} − (x + ${b}) = ${rhs}`, `Find x ∈ ℤ: ${a} − (x + ${b}) = ${rhs}`), x, [-x, x + 2, x - 2], 'equation:x', cfg,
            `Bước 1: x + ${b} = ${a} − ${rhs} = ${a - rhs}\nBước 2: x = ${a - rhs} − ${b} = ${x}.`, ex({ allowNeg: true }));
        }
        const k = rInt(3, 7), shift = rInt(1, 5), x = k + shift, c = rInt(4, 15), rhs = k * k + c;
        return makeExtQ(
          t(`Tìm số tự nhiên x biết: (x − ${shift})^2 + ${c} = ${rhs} (với x > ${shift})`, `Find natural x > ${shift}: (x − ${shift})^2 + ${c} = ${rhs}`),
          x, [k, shift - k, x + 2], 'equation:x', cfg,
          `• (x − ${shift})² = ${rhs} − ${c} = ${k * k} = ${k}²\n• Vì x > ${shift} nên x − ${shift} = ${k} ⇒ x = ${k} + ${shift} = ${x}.`, ex()
        );
      }
      case 'g6_frac': {
        if (tier === 'easy') {
          if (typeof plainGenerate === 'function') {
            const q = plainGenerate({ ...cfg, grade: 6, type: 'fraction', types: ['fraction'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' });
            if (q) return { ...q, difficulty: 'easy', difficultyLabel: difficultyBadgeLabel('easy'), domain: 'number' };
          }
        }
        if (tier === 'medium') {
          const d = pickAny([5, 7, 8, 9]), n = rInt(2, d - 1), unit = rInt(6, 18), total = d * unit, part = n * unit;
          if (Math.random() < 0.5) {
            return makeExtQ(t(`Lớp 6A có ${total} học sinh, trong đó ${n}/${d} là học sinh giỏi. Có bao nhiêu học sinh giỏi?`, `${n}/${d} of ${total} students are honors. Honors count = ?`),
              part, [total - part, part + d, Math.max(2, part - d)], 'fraction:word', cfg,
              `Bài toán 1 về phân số (Tìm giá trị phân số của ${total}):\n${total} · (${n}/${d}) = ${part} (học sinh).`, ex());
          }
          return makeExtQ(
            t(`Biết ${n}/${d} quãng đường AB dài ${part} km. Tính độ dài cả quãng đường AB (km)?`, `${n}/${d} of road AB is ${part} km. Full length of AB (km) = ?`),
            total, [Math.round((part * n) / d), total + 10, Math.max(10, total - 10)], 'fraction:word', cfg,
            `Bài toán 2 về phân số (Tìm một số biết ${n}/${d} của nó bằng ${part}):\nAB = ${part} ÷ (${n}/${d}) = ${part} · ${d} ÷ ${n} = ${total} (km).`, ex()
          );
        }
        // 3-day reading word problem (classic Grade 6 exam!)
        const unit = rInt(8, 20), totalPages = 12 * unit; // Day 1: 1/3 = 4/12, Day 2: 5/12 -> Day 3: 3/12 = 1/4 = 3*unit
        const day3 = 3 * unit;
        return makeExtQ(
          t(`An đọc 1 cuốn sách trong 3 ngày. Ngày 1 đọc 1/3 số trang, ngày 2 đọc 5/12 số trang, ngày 3 đọc nốt ${day3} trang cuối. Cuốn sách dày bao nhiêu trang?`, `An reads 1/3 on day 1, 5/12 on day 2, and the remaining ${day3} pages on day 3. Total pages = ?`),
          totalPages, [totalPages + 12, Math.max(24, totalPages - 12), 9 * unit], 'fraction:word', cfg,
          `Bài giải:\n• Phân số chỉ số trang ngày 3 đọc: 1 − (1/3 + 5/12) = 1 − 9/12 = 3/12 = 1/4 (cuốn sách)\n• Tổng số trang cuốn sách: ${day3} ÷ (1/4) = ${day3} × 4 = ${totalPages} (trang).`, ex()
        );
      }
      case 'g6_dec_pct': {
        if (tier === 'easy') {
          const whole = rInt(12, 65), d1 = rInt(1, 8), d2 = pickAny([2, 3, 4, 6, 7, 8]);
          const orig = Number((whole + d1 / 10 + d2 / 100).toFixed(2));
          const ans = Number((whole + (d2 >= 5 ? d1 + 1 : d1) / 10).toFixed(1));
          return makeExtQ(
            t(`Làm tròn số thập phân −${fmtDec(orig)} đến hàng phần mười ta được số nào?`, `Round −${fmtDec(orig)} to the nearest tenth`),
            `-${fmtDec(ans)}`, [fmtDec(ans), `-${fmtDec(Number((ans + 0.1).toFixed(1)))}`, `-${fmtDec(Number((ans - 0.1).toFixed(1)))}`], 'decimal:round', cfg,
            `Chữ số hàng phần trăm là ${d2} ${d2 >= 5 ? '≥ 5 nên làm tròn tăng độ lớn phần mười' : '< 5 nên giữ nguyên phần mười'} → −${fmtDec(ans)}.`, ex({ allowNeg: true })
          );
        }
        if (tier === 'medium') {
          const orig = pickAny([200, 300, 400, 500, 600]), disc = pickAny([15, 20, 25, 30]);
          const pay = orig - (orig * disc) / 100;
          return makeExtQ(
            t(`Nhân dịp khai trương, đôi giày niêm yết ${orig} nghìn đồng được giảm giá ${disc}%. Khách phải trả bao nhiêu nghìn đồng?`, `Shoes listed at ${orig}k VND get ${disc}% off. Price paid (k VND) = ?`),
            pay, [(orig * disc) / 100, pay + 20, Math.max(50, pay - 20)], 'percent:discount', cfg,
            `Giá sau giảm ứng với ${100 - disc}% giá niêm yết:\n${orig} · ${100 - disc}% = ${pay} (nghìn đồng).`, ex()
          );
        }
        const deposit = pickAny([50, 80, 100, 120, 200]), rate = pickAny([6, 6.5, 7, 7.5]);
        const totalBack = fmtDec(deposit + (deposit * rate) / 100);
        return makeExtQ(
          t(`Bác Hùng gửi tiết kiệm ${deposit} triệu đồng kỳ hạn 1 năm với lãi suất ${fmtDec(rate)}%/năm. Hết 1 năm bác rút cả gốc lẫn lãi được bao nhiêu triệu đồng?`, `Deposit ${deposit}M VND at ${fmtDec(rate)}%/year. Principal + interest after 1 year (M VND) = ?`),
          totalBack, [fmtDec((deposit * rate) / 100), fmtDec(deposit + rate), fmtDec(deposit + (deposit * rate) / 10)], 'percent:interest', cfg,
          `• Tiền lãi sau 1 năm: ${deposit} · ${fmtDec(rate)}% = ${fmtDec((deposit * rate) / 100)} (triệu đồng)\n• Tổng cả gốc lẫn lãi: ${deposit} + ${fmtDec((deposit * rate) / 100)} = ${totalBack} (triệu đồng).`, ex()
        );
      }
      case 'g6_word_stat': {
        if (tier === 'easy') {
          const trials = pickAny([20, 30, 40, 50]), sixes = rInt(4, 12);
          const ans = fracStr(sixes, trials);
          return makeExtQ(
            t(`Gieo con xúc xắc ${trials} lần thấy mặt 6 chấm xuất hiện ${sixes} lần. Xác suất thực nghiệm của sự kiện "xuất hiện mặt 6 chấm" (phân số tối giản) là?`, `Rolled a die ${trials} times and got ${sixes} sixes. Empirical probability (lowest fraction) = ?`),
            ans, [fracStr(trials - sixes, trials), fracStr(1, 6), fracStr(sixes + 1, trials)], 'stat:prob', cfg,
            `Xác suất thực nghiệm = Số lần xuất hiện / Tổng số lần gieo = ${sixes}/${trials} = ${ans}.`, ex()
          );
        }
        if (tier === 'medium') {
          const s1 = rInt(15, 25), s2 = rInt(18, 28), s3 = rInt(20, 32), s4 = 4 * rInt(20, 26) - (s1 + s2 + s3);
          if (s4 > 8) {
            const avgVal = (s1 + s2 + s3 + s4) / 4;
            return makeExtQ(
              t(`Bảng thống kê số sách quyên góp của 4 tổ: Tổ 1 (${s1}), Tổ 2 (${s2}), Tổ 3 (${s3}), Tổ 4 (${s4}). Trung bình mỗi tổ quyên góp bao nhiêu quyển?`, `Books donated by 4 teams: ${s1}, ${s2}, ${s3}, ${s4}. Average per team = ?`),
              avgVal, [avgVal + 2, Math.max(5, avgVal - 2), s1 + s2 + s3 + s4], 'stat:avg', cfg,
              `Trung bình mỗi tổ = (${s1} + ${s2} + ${s3} + ${s4}) ÷ 4 = ${s1 + s2 + s3 + s4} ÷ 4 = ${avgVal} (quyển).`, ex()
            );
          }
        }
        // Electricity tiered billing (classic GDPT 2018 real-world problem!)
        const kwh = rInt(60, 95), p1 = 2, p2 = 3; // 50 kWh first at 2k, extra at 3k
        const bill = 50 * p1 + (kwh - 50) * p2;
        return makeExtQ(
          t(`Giá điện sinh hoạt tính theo bậc: 50 kWh đầu giá ${p1} nghìn đồng/kWh; từ kWh thứ 51 trở đi giá ${p2} nghìn đồng/kWh. Tháng này nhà An dùng ${kwh} kWh thì hết bao nhiêu nghìn đồng?`, `First 50 kWh cost ${p1}k/kWh, above 50 cost ${p2}k/kWh. Bill for ${kwh} kWh (in k VND) = ?`),
          bill, [kwh * p1, kwh * p2, bill + 20], 'word:real', cfg,
          `Bài giải (Toán thực tế giá điện bậc thang):\n• Tiền 50 kWh bậc 1: 50 × ${p1} = ${50 * p1} (nghìn đồng)\n• Số điện bậc 2: ${kwh} − 50 = ${kwh - 50} (kWh) → Tiền bậc 2: ${kwh - 50} × ${p2} = ${(kwh - 50) * p2} (nghìn đồng)\n• Tổng tiền điện: ${50 * p1} + ${(kwh - 50) * p2} = ${bill} (nghìn đồng).`, ex()
        );
      }

      // ==================== GRADE 6: HÌNH HỌC ====================
      case 'g6_geom_flat': {
        if (tier === 'easy') {
          if (Math.random() < 0.5) {
            const d1 = rInt(4, 12) * 2, d2 = rInt(5, 15), area = (d1 * d2) / 2;
            return makeExtQ(
              t(`Hình thoi có độ dài hai đường chéo là ${d1} cm và ${d2} cm. Diện tích hình thoi là bao nhiêu cm²?`, `Rhombus with diagonals ${d1} cm and ${d2} cm has area ? cm²`),
              area, [d1 * d2, area + 10, Math.max(6, area - 10)], 'geom:area', cfg,
              `Diện tích hình thoi S = (d₁ · d₂) ÷ 2 = (${d1} · ${d2}) ÷ 2 = ${area} (cm²).`, ex({ domain: 'geometry', visualKind: 'rhombus', visualData: { d1, d2 } })
            );
          }
          const a = rInt(5, 18), pHex = 6 * a;
          return makeExtQ(
            t(`Hình lục giác đều có độ dài một cạnh là ${a} cm. Chu vi hình lục giác đều đó là bao nhiêu cm?`, `Regular hexagon with side ${a} cm has perimeter ? cm`),
            pHex, [4 * a, 5 * a, 8 * a], 'geom:perimeter', cfg,
            `Hình lục giác đều có 6 cạnh bằng nhau → Chu vi C = 6 · ${a} = ${pHex} (cm).`, ex({ domain: 'geometry' })
          );
        }
        if (tier === 'medium') {
          const a = rInt(8, 18), b = rInt(4, a - 2), h = rInt(3, 8) * 2, area = ((a + b) * h) / 2;
          return makeExtQ(
            t(`Mảnh đất hình thang cân có hai đáy ${a} m và ${b} m, chiều cao ${h} m. Diện tích mảnh đất là bao nhiêu m²?`, `Isosceles trapezoid with bases ${a} m, ${b} m and height ${h} m has area ? m²`),
            area, [(a + b) * h, area + 10, Math.max(10, area - 10)], 'geom:area', cfg,
            `Diện tích hình thang: S = (a + b) · h ÷ 2 = (${a} + ${b}) · ${h} ÷ 2 = ${area} (m²).`, ex({ domain: 'geometry', visualKind: 'trapezoid', visualData: { a, b, h } })
          );
        }
        // Garden with surrounding path (classic Grade 6 Geometry exam!)
        const l = rInt(10, 18), w = rInt(6, 12), pathW = 1;
        const innerL = l - 2 * pathW, innerW = w - 2 * pathW, pathArea = l * w - innerL * innerW;
        return makeExtQ(
          t(`Khu vườn hình chữ nhật dài ${l} m, rộng ${w} m. Người ta làm lối đi xung quanh bên trong vườn rộng ${pathW} m, phần còn lại trồng hoa. Diện tích lối đi là bao nhiêu m²?`, `A ${l}×${w} m garden has an inner border path of width ${pathW} m all around. Area of the path (m²) = ?`),
          pathArea, [(l + w) * 2, innerL * innerW, pathArea + 4], 'geom:area', cfg,
          `Bài giải:\n• Diện tích cả khu vườn: ${l} · ${w} = ${l * w} (m²)\n• Phần trồng hoa bên trong có chiều dài ${l} − 2·${pathW} = ${innerL} m, rộng ${w} − 2·${pathW} = ${innerW} m → S hoa = ${innerL * innerW} (m²)\n• Diện tích lối đi: ${l * w} − ${innerL * innerW} = ${pathArea} (m²).`, ex({ domain: 'geometry', visualKind: 'rect', visualData: { l, w } })
        );
      }
      case 'g6_geom_sym': {
        const bank = tier === 'easy'
          ? [
              { q: t('Hình tam giác đều có bao nhiêu trục đối xứng?', 'How many lines of symmetry does an equilateral triangle have?'), a: 3, near: [1, 2, 6], exp: 'Tam giác đều có 3 trục đối xứng đi qua mỗi đỉnh và trung điểm cạnh đối diện.' },
              { q: t('Hình vuông có bao nhiêu trục đối xứng?', 'How many lines of symmetry does a square have?'), a: 4, near: [2, 6, 8], exp: 'Hình vuông có 4 trục đối xứng (2 đường chéo và 2 đường nối trung điểm hai cạnh đối).' },
              { q: t('Hình chữ nhật (không phải hình vuông) có bao nhiêu trục đối xứng?', 'How many lines of symmetry does a non-square rectangle have?'), a: 2, near: [1, 4, 0], exp: 'Hình chữ nhật tổng quát chỉ có 2 trục đối xứng (2 đường chéo KHÔNG phải trục đối xứng).' }
            ]
          : tier === 'medium'
            ? [
                { q: t('Hình thang cân (không phải hình chữ nhật) có bao nhiêu trục đối xứng?', 'How many lines of symmetry does an isosceles trapezoid have?'), a: 1, near: [0, 2, 4], exp: 'Hình thang cân có duy nhất 1 trục đối xứng là đường thẳng đi qua trung điểm hai đáy.' },
                { q: t('Hình lục giác đều có bao nhiêu trục đối xứng?', 'How many lines of symmetry does a regular hexagon have?'), a: 6, near: [3, 4, 12], exp: 'Hình lục giác đều có 6 trục đối xứng (3 đường qua các đỉnh đối diện, 3 đường qua trung điểm các cạnh đối).' },
                { q: t('Hình thoi (không phải hình vuông) có bao nhiêu trục đối xứng?', 'How many lines of symmetry does a non-square rhombus have?'), a: 2, near: [1, 4, 0], exp: 'Hình thoi có 2 trục đối xứng chính là hai đường chéo của nó.' }
              ]
            : [
                { q: t('Trong 5 hình: Tam giác đều, Hình bình hành, Hình chữ nhật, Hình thoi, Lục giác đều — có bao nhiêu hình CÓ tâm đối xứng?', 'Among equilateral triangle, parallelogram, rectangle, rhombus, regular hexagon — how many have rotational center symmetry?'), a: 4, near: [2, 3, 5], exp: 'Có 4 hình có tâm đối xứng là: Hình bình hành, Hình chữ nhật, Hình thoi, Lục giác đều (chỉ Tam giác đều KHÔNG có tâm đối xứng).' },
                { q: t('Đa giác đều có 8 cạnh (bát giác đều) có bao nhiêu trục đối xứng?', 'How many lines of symmetry does a regular octagon have?'), a: 8, near: [4, 6, 16], exp: 'Đa giác đều n cạnh luôn có đúng n trục đối xứng → bát giác đều có 8 trục đối xứng.' }
              ];
        const it = pickAny(bank);
        return makeExtQ(it.q, it.a, it.near, 'geom:symmetry', cfg, it.exp, ex({ domain: 'geometry' }));
      }
      case 'g6_geom_seg': {
        if (tier === 'easy') {
          const half = rInt(4, 18), ab = half * 2;
          return makeExtQ(
            t(`Điểm I là trung điểm của đoạn thẳng AB dài ${ab} cm. Tính độ dài đoạn IB (cm)?`, `I is the midpoint of segment AB (${ab} cm). Length IB (cm) = ?`),
            half, [ab, half + 2, Math.max(1, half - 2)], 'geom:midpoint', cfg,
            `Vì I là trung điểm của AB nên IA = IB = AB ÷ 2 = ${ab} ÷ 2 = ${half} (cm).`, ex({ domain: 'geometry', visualKind: 'segment', visualData: { total: ab, mid: true } })
          );
        }
        if (tier === 'medium') {
          const oa = rInt(3, 9), ob = oa + rInt(4, 10), ab = ob - oa;
          return makeExtQ(
            t(`Trên tia Ox lấy hai điểm A và B sao cho OA = ${oa} cm, OB = ${ob} cm. Tính độ dài đoạn thẳng AB (cm)?`, `On ray Ox, OA = ${oa} cm and OB = ${ob} cm. Length AB (cm) = ?`),
            ab, [oa + ob, ab + 2, Math.max(1, ab - 2)], 'geom:segment', cfg,
            `Trên tia Ox, vì OA < OB (${oa} < ${ob}) nên điểm A nằm giữa O và B:\nOA + AB = OB ⇒ AB = ${ob} − ${oa} = ${ab} (cm).`, ex({ domain: 'geometry', visualKind: 'segment', visualData: { a: oa, b: ab } })
          );
        }
        const half = rInt(5, 16), ab = half * 2;
        return makeExtQ(
          t(`Cho đoạn thẳng AB = ${ab} cm, điểm C nằm giữa A và B. Gọi M, N lần lượt là trung điểm của AC và CB. Tính độ dài đoạn thẳng MN (cm)?`, `Segment AB = ${ab} cm, C is between A and B. M and N are midpoints of AC and CB. Length MN (cm) = ?`),
          half, [ab, Math.round(ab / 4), half + 4], 'geom:midpoint', cfg,
          `Bài giải tự luận kinh điển Lớp 6:\n• M là trung điểm AC ⇒ MC = AC/2; N là trung điểm CB ⇒ CN = CB/2.\n• Vì C nằm giữa M và N nên: MN = MC + CN = (AC + CB)/2 = AB/2 = ${ab}/2 = ${half} (cm).`, ex({ domain: 'geometry', visualKind: 'segment', visualData: { total: ab, mid: true } })
        );
      }
      case 'g6_geom_angle': {
        if (tier === 'easy') {
          const ang = pickAny([35, 60, 90, 120, 150, 180]);
          const askAngle = rInt(25, 75), total = askAngle + rInt(30, 80);
          return makeExtQ(
            t(`Tia Oz nằm giữa hai tia Ox và Oy. Biết góc xOz = ${askAngle}° và góc zOy = ${total - askAngle}°. Số đo góc xOy bằng bao nhiêu độ?`, `Ray Oz lies between Ox and Oy, ∠xOz = ${askAngle}°, ∠zOy = ${total - askAngle}°. ∠xOy = ?°`),
            total, [Math.abs(total - 2 * askAngle), 180 - total, total + 10], 'geom:angle', cfg,
            `Vì tia Oz nằm giữa hai tia Ox và Oy nên:\n∠xOy = ∠xOz + ∠zOy = ${askAngle}° + ${total - askAngle}° = ${total}°.`, ex({ domain: 'geometry' })
          );
        }
        if (tier === 'medium') {
          const xoy = rInt(100, 160), xoz = rInt(35, xoy - 30), zoy = xoy - xoz;
          return makeExtQ(
            t(`Cho góc xOy = ${xoy}°. Vẽ tia Oz nằm giữa Ox, Oy sao cho góc xOz = ${xoz}°. Tính số đo góc zOy (độ)?`, `Given ∠xOy = ${xoy}° and interior ray Oz with ∠xOz = ${xoz}°. Find ∠zOy (°)`),
            zoy, [xoy + xoz, 180 - xoz, zoy + 10], 'geom:angle', cfg,
            `Vì Oz nằm giữa Ox và Oy nên: ∠zOy = ∠xOy − ∠xOz = ${xoy}° − ${xoz}° = ${zoy}°.`, ex({ domain: 'geometry' })
          );
        }
        // Tiling floor practical problem
        const tileCm = pickAny([40, 50]), cols = rInt(8, 15), rows = rInt(6, 12);
        const lM = fmtDec((cols * tileCm) / 100), wM = fmtDec((rows * tileCm) / 100), numTiles = cols * rows;
        return makeExtQ(
          t(`Căn phòng hình chữ nhật dài ${lM} m, rộng ${wM} m được lát kín bằng các viên gạch hình vuông cạnh ${tileCm} cm (mạch vữa không đáng kể). Cần bao nhiêu viên gạch?`, `A ${lM} m × ${wM} m room is tiled with ${tileCm} cm square tiles. How many tiles are needed?`),
          numTiles, [numTiles + 10, Math.max(10, numTiles - 10), Math.round(numTiles / 2)], 'geom:tiling', cfg,
          `Bài giải thực tế:\n• Đổi kích thước sang cm: Dài = ${cols * tileCm} cm, Rộng = ${rows * tileCm} cm.\n• Diện tích nền phòng: ${cols * tileCm} · ${rows * tileCm} (cm²); Diện tích 1 viên gạch: ${tileCm} · ${tileCm} (cm²).\n• Số viên gạch cần dùng: (${cols * tileCm} ÷ ${tileCm}) · (${rows * tileCm} ÷ ${tileCm}) = ${cols} · ${rows} = ${numTiles} (viên).`, ex({ domain: 'geometry', visualKind: 'rect', visualData: { l: cols, w: rows } })
        );
      }

      // ==================== GRADE 7: SỐ HỌC & ĐẠI SỐ ====================
      case 'g7_rat': {
        if (tier === 'easy') {
          if (typeof plainGenerate === 'function') {
            const q = plainGenerate({ ...cfg, grade: 7, type: 'fraction', types: ['fraction'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' });
            if (q) return { ...q, difficulty: 'easy', difficultyLabel: difficultyBadgeLabel('easy'), domain: 'number' };
          }
        }
        if (tier === 'medium') {
          const [n, d] = pickAny([[-1, 2], [-2, 3], [3, 4], [-3, 2], [2, 5]]);
          const e = Math.abs(n) <= 2 && d <= 3 ? 3 : 2;
          const ans = fracStr(n ** e, d ** e);
          return makeExtQ(`(${n}/${d})^${e}`, ans, [fracStr(-(n ** e), d ** e), fracStr(n * e, d * e), fracStr(n ** e, d)], 'power:rational', cfg,
            `Lũy thừa của số hữu tỉ: (${n}/${d})^${e} = (${n})^${e} / ${d}^${e} = ${ans}.`, ex({ allowNeg: true }));
        }
        const d1 = pickAny([7, 9, 11]), a = rInt(2, d1 - 2), b = d1 - a, midN = rInt(1, 4), midD = 5;
        const ans = fracStr(d1 * midD - midN * d1, d1 * midD); // (a/d1 + b/d1) - midN/midD = 1 - midN/midD
        return makeExtQ(
          t(`Tính hợp lý: ${a}/${d1} − ${midN}/${midD} + ${b}/${d1}`, `Compute smartly: ${a}/${d1} − ${midN}/${midD} + ${b}/${d1}`),
          ans, [fracStr(midN, midD), fracStr(midD + midN, midD), fracStr(1, midD)], 'fraction:convenient', cfg,
          `Nhóm hai phân số cùng mẫu:\n(${a}/${d1} + ${b}/${d1}) − ${midN}/${midD} = 1 − ${midN}/${midD} = ${ans}.`, ex()
        );
      }
      case 'g7_sqrt_abs': {
        if (tier === 'easy') {
          const r1 = rInt(3, 13), r2 = rInt(2, 11), ans = r1 + r2;
          return makeExtQ(`√${r1 * r1} + |−${r2}|`, ans, [r1 - r2, ans + 2, Math.max(1, ans - 2)], 'sqrt:√', cfg,
            `√${r1 * r1} = ${r1} và |−${r2}| = ${r2} ⇒ ${r1} + ${r2} = ${ans}.`, ex());
        }
        if (tier === 'medium') {
          const r1 = rInt(5, 15), r2 = rInt(3, 12), k = rInt(2, 3), ans = k * r1 - r2;
          return makeExtQ(`${k}√${r1 * r1} − √(${r2 * r2})`, ans, [ans + 2, ans - 2, r1 - r2], 'sqrt:√', cfg,
            `${k} · ${r1} − ${r2} = ${k * r1} − ${r2} = ${ans}.`, ex({ allowNeg: true }));
        }
        // Min / Max with absolute value (classic Grade 7 challenge!)
        const a = rInt(2, 9), c = rInt(-8, 15) || 5;
        if (Math.random() < 0.55) {
          return makeExtQ(
            t(`Tìm giá trị nhỏ nhất (GTNN) của biểu thức A = |x − ${a}| + ${c >= 0 ? c : `(${c})`}`, `Find the minimum value of A = |x − ${a}| + ${c >= 0 ? c : `(${c})`}`),
            c, [a, c + a, -c], 'negative:abs', cfg,
            `Vì |x − ${a}| ≥ 0 với mọi x ∈ ℝ nên:\nA = |x − ${a}| + (${c}) ≥ ${c}.\nDấu "=" xảy ra khi x = ${a}. Vậy GTNN của A là ${c}.`, ex({ allowNeg: true })
          );
        }
        return makeExtQ(
          t(`Tìm giá trị lớn nhất (GTLN) của biểu thức B = ${c} − |x + ${a}|`, `Find the maximum value of B = ${c} − |x + ${a}|`),
          c, [-a, c - a, c + a], 'negative:abs', cfg,
          `Vì |x + ${a}| ≥ 0 với mọi x ∈ ℝ nên −|x + ${a}| ≤ 0 ⇒ B ≤ ${c}.\nDấu "=" xảy ra khi x = −${a}. Vậy GTLN của B là ${c}.`, ex({ allowNeg: true })
        );
      }
      case 'g7_findx': {
        if (tier === 'easy') {
          const d = pickAny([4, 5, 6, 8]), xN = rInt(1, 7), bN = rInt(1, 5), sumN = xN + bN;
          const ans = fracStr(xN, d);
          return makeExtQ(
            t(`Tìm x biết: x + ${fracStr(bN, d)} = ${fracStr(sumN, d)}`, `Solve for x: x + ${fracStr(bN, d)} = ${fracStr(sumN, d)}`),
            ans, [fracStr(sumN + bN, d), fracStr(xN + 1, d), fracStr(Math.max(1, xN - 1), d)], 'equation:x', cfg,
            `Chuyển vế đổi dấu: x = ${fracStr(sumN, d)} − ${fracStr(bN, d)} = ${ans}.`, ex()
          );
        }
        if (tier === 'medium') {
          const a = rInt(2, 8), dist = rInt(3, 10), xPos = a + dist;
          return makeExtQ(
            t(`Tìm số hữu tỉ x > ${a} thỏa mãn: |x − ${a}| = ${dist}`, `Find x > ${a} such that |x − ${a}| = ${dist}`),
            xPos, [a - dist, dist - a, xPos + 2], 'equation:abs', cfg,
            `|x − ${a}| = ${dist} ⇒ x − ${a} = ${dist} hoặc x − ${a} = −${dist}.\nVì x > ${a} nên nhận x = ${a} + ${dist} = ${xPos}.`, ex({ allowNeg: true })
          );
        }
        const root = pickAny([-4, -3, -2, 2, 3, 4]), shift = rInt(1, 5), xVal = root + shift, cube = root ** 3;
        return makeExtQ(
          t(`Tìm x biết: (x − ${shift})^3 = ${cube}`, `Solve: (x − ${shift})^3 = ${cube}`),
          xVal, [-xVal, shift - root, xVal + 2], 'equation:pow', cfg,
          `Ta có ${cube} = (${root})³ ⇒ (x − ${shift})³ = (${root})³ ⇒ x − ${shift} = ${root} ⇒ x = ${xVal}.`, ex({ allowNeg: true })
        );
      }
      case 'g7_ratio': {
        if (tier === 'easy') {
          const b = rInt(2, 9), c = rInt(2, 9), k = rInt(2, 6), xVal = c * k, d = b * k;
          return makeExtQ(t(`Tìm x trong tỉ lệ thức: x/${b} = ${xVal}/${d}`, `Solve proportion: x/${b} = ${xVal}/${d}`), c, [c + 1, Math.max(1, c - 1), c + 2], 'ratio:x', cfg,
            `Từ x/${b} = ${xVal}/${d} ⇒ x = (${b} · ${xVal}) ÷ ${d} = ${c}.`, ex());
        }
        if (tier === 'medium') {
          const a = rInt(2, 5), b = rInt(a + 1, 8), k = rInt(3, 9), sum = (a + b) * k, xVal = a * k;
          return makeExtQ(
            t(`Tìm x biết: x/${a} = y/${b} và x + y = ${sum}`, `Find x given x/${a} = y/${b} and x + y = ${sum}`),
            xVal, [b * k, k, xVal + a], 'ratio:series', cfg,
            `Áp dụng tính chất dãy tỉ số bằng nhau:\nx/${a} = y/${b} = (x + y)/(${a} + ${b}) = ${sum}/${a + b} = ${k} ⇒ x = ${a} · ${k} = ${xVal}.`, ex()
          );
        }
        const a = rInt(2, 5), b = rInt(2, 5), k = rInt(-5, 7) || 4;
        const coefDiff = 2 * a - b;
        const safeB = coefDiff === 0 ? b + 1 : b;
        const rhs = (2 * a - safeB) * k, yVal = safeB * k;
        return makeExtQ(
          t(`Tìm y biết: x/${a} = y/${safeB} và 2x − y = ${rhs}`, `Find y given x/${a} = y/${safeB} and 2x − y = ${rhs}`),
          yVal, [a * k, -yVal, yVal + safeB], 'ratio:series', cfg,
          `Áp dụng tính chất dãy tỉ số bằng nhau:\nx/${a} = y/${safeB} = 2x/${2 * a} = (2x − y)/(${2 * a} − ${safeB}) = ${rhs}/${2 * a - safeB} = ${k}\n⇒ y = ${safeB} · (${k}) = ${yVal}.`, ex({ allowNeg: true })
        );
      }
      case 'g7_prop_word': {
        if (tier === 'easy') {
          const m = rInt(3, 6), one = rInt(15, 35), w1 = m * one, m2 = m + rInt(2, 5), ans = m2 * one;
          return makeExtQ(
            t(`Biết ${m} m dây đồng nặng ${w1} g. Hỏi ${m2} m dây đồng như thế nặng bao nhiêu gam?`, `${m} m of copper wire weighs ${w1} g. Weight of ${m2} m (g) = ?`),
            ans, [ans + 20, Math.max(20, ans - 20), w1 + m2], 'word:direct', cfg,
            `Khối lượng và chiều dài dây tỉ lệ thuận:\n1 m nặng ${w1} ÷ ${m} = ${one} g ⇒ ${m2} m nặng ${one} · ${m2} = ${ans} (g).`, ex()
          );
        }
        if (tier === 'medium') {
          const a = 3, b = 4, c = 5, k = rInt(4, 12), total = (a + b + c) * k, maxCls = c * k;
          return makeExtQ(
            t(`Ba lớp 7A, 7B, 7C trồng được tất cả ${total} cây xanh, số cây tỉ lệ với ${a}; ${b}; ${c}. Hỏi lớp 7C trồng được bao nhiêu cây?`, `Classes 7A, 7B, 7C plant ${total} trees in ratio ${a}:${b}:${c}. Trees planted by 7C = ?`),
            maxCls, [a * k, b * k, maxCls + 10], 'word:direct', cfg,
            `Gọi số cây 3 lớp là x, y, z:\nx/${a} = y/${b} = z/${c} = (x + y + z)/(${a}+${b}+${c}) = ${total}/12 = ${k}\n⇒ Lớp 7C trồng: z = ${c} · ${k} = ${maxCls} (cây).`, ex()
          );
        }
        const combos = [[4, 9, 6, 6], [6, 10, 12, 5], [8, 6, 12, 4], [5, 12, 10, 6], [9, 8, 12, 6]];
        const [m1, h1, m2, h2] = pickAny(combos);
        return makeExtQ(
          t(`Với cùng năng suất, ${m1} máy cày cày xong một cánh đồng hết ${h1} giờ. Hỏi ${m2} máy cày như thế cày xong cánh đồng đó hết bao nhiêu giờ?`, `${m1} tractors plow a field in ${h1} hours. How many hours for ${m2} tractors?`),
          h2, [Math.round((h1 * m2) / m1), h2 + 2, Math.max(1, h2 - 1)], 'word:inverse', cfg,
          `Số máy cày và thời gian hoàn thành là hai đại lượng tỉ lệ nghịch:\n${m1} · ${h1} = ${m2} · t ⇒ t = (${m1} · ${h1}) ÷ ${m2} = ${h2} (giờ).`, ex()
        );
      }
      case 'g7_alg': {
        if (tier === 'easy') {
          const deg = rInt(3, 6), lead = pickAny([-5, -3, 2, 4, 7]);
          const askDeg = Math.random() < 0.55;
          const poly = `${lead}x^${deg} + 3x^2 − 7`;
          if (askDeg) {
            return makeExtQ(t(`Tìm bậc của đa thức một biến P(x) = ${poly}`, `Find the degree of polynomial P(x) = ${poly}`), deg, [lead, deg + 2, 2], 'algebra:eval', cfg,
              `Bậc của đa thức một biến thu gọn là số mũ cao nhất của biến x → bậc là ${deg}.`, ex());
          }
          const k = rInt(2, 5), c = rInt(-8, 9) || 3, xv = rInt(-3, 5) || 2, ans = k * xv + c;
          const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
          return makeExtQ(t(`Tính P(${xv}) biết P(x) = ${k}x ${cStr}`, `Evaluate P(${xv}) for P(x) = ${k}x ${cStr}`), ans, [ans + k, ans - k, -ans], 'algebra:eval', cfg,
            `P(${xv}) = ${k} · (${xv}) ${cStr} = ${ans}.`, ex({ allowNeg: true }));
        }
        if (tier === 'medium') {
          const a = pickAny([2, 3, 4, 5]), root = rInt(-6, 8) || -3, b = -a * root;
          const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
          return makeExtQ(
            t(`Tìm nghiệm của đa thức P(x) = ${a}x ${bStr}`, `Find the root of P(x) = ${a}x ${bStr}`),
            root, [-root, root + 1, root - 1], 'algebra:poly', cfg,
            `Cho P(x) = 0 ⇔ ${a}x ${bStr} = 0 ⇔ ${a}x = ${-b} ⇔ x = ${root}.`, ex({ allowNeg: true })
          );
        }
        // Find parameter m so x = k is a root of P(x) = x^2 + mx + c
        const x0 = pickAny([2, 3, -2, -3]), mVal = rInt(-5, 6) || 2, c = -(x0 * x0 + mVal * x0);
        const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
        return makeExtQ(
          t(`Tìm hệ số m để đa thức P(x) = x^2 + mx ${cStr} nhận x = ${x0} làm một nghiệm`, `Find m so that P(x) = x^2 + mx ${cStr} has root x = ${x0}`),
          mVal, [-mVal, mVal + 1, mVal - 1], 'algebra:poly', cfg,
          `Vì x = ${x0} là nghiệm của P(x) nên P(${x0}) = 0:\n(${x0})² + m·(${x0}) ${cStr} = 0 ⇒ ${x0 * x0 + c} + (${x0})m = 0 ⇒ m = ${mVal}.`, ex({ allowNeg: true })
        );
      }
      case 'g7_prob_stat': {
        if (tier === 'easy') {
          const n = pickAny([10, 12, 15, 20]), k = pickAny([2, 3, 5]);
          const fav = Math.floor(n / k), ans = fracStr(fav, n);
          return makeExtQ(
            t(`Rút ngẫu nhiên 1 thẻ từ hộp gồm ${n} thẻ đánh số từ 1 đến ${n}. Tính xác suất biến cố "Số trên thẻ chia hết cho ${k}"?`, `Draw 1 card from 1..${n}. Probability that the number is divisible by ${k}?`),
            ans, [fracStr(n - fav, n), fracStr(fav + 1, n), fracStr(1, k + 1)], 'stat:prob', cfg,
            `Có ${fav} kết quả thuận lợi (các bội của ${k} từ 1 đến ${n}) trong ${n} kết quả đồng khả năng → P = ${fav}/${n} = ${ans}.`, ex()
          );
        }
        if (tier === 'medium') {
          const total = pickAny([200, 300, 400, 500]), p1 = 35, p2 = 40, p3 = 25;
          const ans = (total * p3) / 100;
          return makeExtQ(
            t(`Biểu đồ hình quạt tròn thống kê ${total} học sinh khối 7 đăng ký 3 CLB: Bơi (${p1}%), Cầu lông (${p2}%), còn lại là Cờ vua. Có bao nhiêu học sinh đăng ký Cờ vua?`, `Of ${total} students: Swimming ${p1}%, Badminton ${p2}%, rest Chess. Chess count = ?`),
            ans, [(total * p1) / 100, (total * p2) / 100, ans + 20], 'stat:pie', cfg,
            `• Tỉ lệ đăng ký Cờ vua: 100% − (${p1}% + ${p2}%) = ${p3}%\n• Số học sinh CLB Cờ vua: ${total} · ${p3}% = ${ans} (học sinh).`, ex()
          );
        }
        const n = 20, squares = 4; // 1, 4, 9, 16
        return makeExtQ(
          t(`Chọn ngẫu nhiên một số tự nhiên từ 1 đến 20. Tính xác suất của biến cố "Số được chọn là số chính phương" (phân số tối giản)?`, `Pick a random integer from 1 to 20. Probability it is a perfect square?`),
          '1/5', ['3/20', '1/4', '2/5'], 'stat:prob', cfg,
          `Các số chính phương từ 1 đến 20 là: 1; 4; 9; 16 (có 4 số).\nXác suất cần tìm: P = 4/20 = 1/5.`, ex()
        );
      }
      case 'g7_real_math': {
        if (tier === 'easy') {
          const n = rInt(12, 85) * 100 + pickAny([18, 24, 37, 62, 75, 84]);
          const ans = Math.round(n / 100) * 100;
          return makeExtQ(
            t(`Làm tròn số ${n} với độ chính xác d = 50 (tức làm tròn đến hàng trăm) ta được?`, `Round ${n} with precision d = 50 (nearest hundred)`),
            ans, [ans + 100, ans - 100, Math.round(n / 10) * 10], 'number:round', cfg,
            `Độ chính xác d = 50 ứng với làm tròn đến hàng trăm → kết quả là ${ans}.`, ex()
          );
        }
        if (tier === 'medium') {
          const firstKm = 15, nextPrice = 12, km = rInt(5, 15), fare = firstKm + (km - 1) * nextPrice;
          return makeExtQ(
            t(`Giá cước taxi tính như sau: 1 km đầu tiên là ${firstKm} nghìn đồng, mỗi km tiếp theo giá ${nextPrice} nghìn đồng. Đi quãng đường ${km} km hết bao nhiêu nghìn đồng?`, `Taxi charges ${firstKm}k for the 1st km and ${nextPrice}k per extra km. Cost for ${km} km (k VND) = ?`),
            fare, [km * nextPrice, firstKm + km * nextPrice, fare + 10], 'word:real', cfg,
            `Bài giải:\nSố tiền đi ${km} km là: ${firstKm} + (${km} − 1) · ${nextPrice} = ${firstKm} + ${(km - 1) * nextPrice} = ${fare} (nghìn đồng).`, ex()
          );
        }
        // Successive discount + VAT or VIP member discount
        const price = pickAny([500, 800, 1000]), d1 = 20, d2 = 10;
        const after1 = price * (1 - d1 / 100), finalPay = after1 * (1 - d2 / 100);
        return makeExtQ(
          t(`Áo khoác giá niêm yết ${price} nghìn đồng đang khuyến mãi giảm ${d1}%. Khách có thẻ thành viên được giảm thêm ${d2}% trên giá đã giảm. Số tiền thực trả là bao nhiêu nghìn đồng?`, `Jacket listed at ${price}k gets ${d1}% off, plus an extra ${d2}% off the discounted price. Final price (k VND) = ?`),
          finalPay, [price * (1 - (d1 + d2) / 100), after1, finalPay + 20], 'word:real', cfg,
          `Lưu ý không cộng gộp phần trăm trực tiếp:\n• Giá sau lần giảm ${d1}%: ${price} · 80% = ${after1} (nghìn đồng)\n• Giá sau khi giảm thêm ${d2}% thẻ thành viên: ${after1} · 90% = ${finalPay} (nghìn đồng).`, ex()
        );
      }

      // ==================== GRADE 7: HÌNH HỌC ====================
      case 'g7_geom_para': {
        if (tier === 'easy') {
          const a = rInt(35, 145), supp = 180 - a;
          if (Math.random() < 0.5) {
            return makeExtQ(t(`Hai góc kề bù có một góc bằng ${a}°. Góc còn lại có số đo bằng bao nhiêu độ?`, `Two supplementary adjacent angles: one is ${a}°. The other = ?°`),
              supp, [a, Math.abs(90 - a), supp + 10], 'geom:angle', cfg,
              `Hai góc kề bù có tổng bằng 180° ⇒ Góc còn lại = 180° − ${a}° = ${supp}°.`, ex({ domain: 'geometry' }));
          }
          const evenA = rInt(20, 75) * 2;
          return makeExtQ(t(`Tia Ot là tia phân giác của góc xOy = ${evenA}°. Tính số đo góc xOt (độ)?`, `Ot bisects ∠xOy = ${evenA}°. Find ∠xOt (°)`),
            evenA / 2, [evenA, 180 - evenA, evenA / 2 + 10], 'geom:angle', cfg,
            `Tia phân giác chia góc thành hai góc bằng nhau: ∠xOt = ${evenA}° ÷ 2 = ${evenA / 2}°.`, ex({ domain: 'geometry' }));
        }
        if (tier === 'medium') {
          const a1 = rInt(48, 132), bSameSide = 180 - a1;
          return makeExtQ(
            t(`Đường thẳng c cắt hai đường thẳng song song a // b tạo một góc A₁ = ${a1}°. Góc B₂ ở vị trí trong cùng phía với A₁ có số đo bằng bao nhiêu độ?`, `Transversal c cuts a // b with ∠A₁ = ${a1}°. Co-interior angle ∠B₂ = ?°`),
            bSameSide, [a1, Math.abs(90 - a1), bSameSide + 10], 'geom:parallel', cfg,
            `Vì a // b nên hai góc trong cùng phía bù nhau:\n∠A₁ + ∠B₂ = 180° ⇒ ∠B₂ = 180° − ${a1}° = ${bSameSide}°.`, ex({ domain: 'geometry' })
          );
        }
        // Classic Z-kink parallel lines problem (a // b, angle M = a + b)
        const angA = rInt(28, 55), angB = rInt(32, 58), angM = angA + angB;
        return makeExtQ(
          t(`Cho hai đường thẳng song song Ax // By. Điểm M nằm trong khoảng giữa hai đường thẳng sao cho góc MAx = ${angA}° và góc MBy = ${angB}° (hai tia cùng hướng). Tính số đo góc AMB (độ)?`, `Given Ax // By (same direction) with interior point M, ∠MAx = ${angA}°, ∠MBy = ${angB}°. Find ∠AMB (°)`),
          angM, [180 - angM, Math.abs(angA - angB), angM + 20], 'geom:parallel', cfg,
          `Kẻ tia Mz // Ax // By đi qua M:\n• ∠AMz = ∠MAx = ${angA}° (so le trong)\n• ∠zMB = ∠MBy = ${angB}° (so le trong)\n⇒ ∠AMB = ${angA}° + ${angB}° = ${angM}°.`, ex({ domain: 'geometry' })
        );
      }
      case 'g7_geom_tri': {
        if (tier === 'easy') {
          const A = rInt(40, 85), B = rInt(35, 75), C = 180 - A - B;
          return makeExtQ(
            t(`Tam giác ABC có góc A = ${A}°, góc B = ${B}°. Số đo góc C bằng bao nhiêu độ?`, `In △ABC, ∠A = ${A}°, ∠B = ${B}°. Find ∠C (°)`),
            C, [90 - A < 10 ? C + 10 : 90, C + 10, Math.max(10, C - 10)], 'geom:triangle', cfg,
            `Tổng ba góc trong một tam giác bằng 180°:\n∠C = 180° − (${A}° + ${B}°) = ${C}°.`, ex({ domain: 'geometry', visualKind: 'triangle', visualData: { A, B, C } })
          );
        }
        if (tier === 'medium') {
          const topA = rInt(15, 65) * 2, baseB = (180 - topA) / 2;
          return makeExtQ(
            t(`Tam giác ABC cân tại A có góc ở đỉnh A = ${topA}°. Số đo góc ở đáy B bằng bao nhiêu độ?`, `Isosceles △ABC (AB = AC) has vertex angle ∠A = ${topA}°. Base angle ∠B = ?°`),
            baseB, [180 - topA, topA, baseB + 10], 'geom:triangle', cfg,
            `Tam giác ABC cân tại A nên ∠B = ∠C = (180° − ∠A) ÷ 2 = (180° − ${topA}°) ÷ 2 = ${baseB}°.`, ex({ domain: 'geometry', visualKind: 'triangle', visualData: { A: topA, B: baseB, C: baseB } })
          );
        }
        // Exterior angle + ratio of angles
        const k = rInt(12, 22), ratioA = 2, ratioB = 3, extC = (ratioA + ratioB) * k, angB = ratioB * k;
        return makeExtQ(
          t(`Tam giác ABC có góc ngoài tại đỉnh C bằng ${extC}° và hai góc trong A, B tỉ lệ với ${ratioA} : ${ratioB}. Tính số đo góc B (độ)?`, `Exterior angle at C of △ABC is ${extC}°, and ∠A : ∠B = ${ratioA} : ${ratioB}. Find ∠B (°)`),
          angB, [ratioA * k, 180 - extC, angB + 10], 'geom:triangle', cfg,
          `• Định lý góc ngoài tam giác: ∠A + ∠B = góc ngoài đỉnh C = ${extC}°.\n• Áp dụng tỉ lệ: ∠B = ${extC}° ÷ (${ratioA} + ${ratioB}) · ${ratioB} = ${angB}°.`, ex({ domain: 'geometry' })
        );
      }
      case 'g7_geom_ineq': {
        if (tier === 'easy') {
          const a = rInt(4, 9), b = rInt(a + 2, 14), maxInt = a + b - 1;
          return makeExtQ(
            t(`Tam giác có hai cạnh dài ${a} cm và ${b} cm. Độ dài cạnh thứ ba là số nguyên lớn nhất có thể bằng bao nhiêu cm?`, `A triangle has sides ${a} cm and ${b} cm. Largest integer length for the 3rd side (cm) = ?`),
            maxInt, [a + b, b - a + 1, maxInt - 2], 'geom:ineq', cfg,
            `Theo bất đẳng thức tam giác, cạnh thứ ba c < ${a} + ${b} = ${a + b} (cm).\nVì c là số nguyên lớn nhất nên c = ${maxInt} cm.`, ex({ domain: 'geometry' })
          );
        }
        if (tier === 'medium') {
          // Famous exam trap: Isosceles triangle with sides 3 and 7 -> third side MUST be 7!
          const small = rInt(2, 5), big = small * 2 + rInt(1, 4), perim = big * 2 + small;
          return makeExtQ(
            t(`Một tam giác cân có độ dài hai cạnh là ${small} cm và ${big} cm. Tính chu vi của tam giác cân đó (cm)?`, `An isosceles triangle has two side lengths ${small} cm and ${big} cm. Find its perimeter (cm)`),
            perim, [small * 2 + big, small + big, perim + 2], 'geom:ineq', cfg,
            `Bẫy bất đẳng thức tam giác:\n• Nếu cạnh bên là ${small} cm thì ${small} + ${small} = ${small * 2} ≤ ${big} (không thỏa mãn bất đẳng thức tam giác → loại!).\n• Vậy cạnh bên bắt buộc là ${big} cm, cạnh đáy là ${small} cm ⇒ Chu vi = ${big} + ${big} + ${small} = ${perim} (cm).`, ex({ domain: 'geometry' })
          );
        }
        const a = rInt(3, 6), b = rInt(7, 12), cntInt = 2 * a - 1; // b - a < c < b + a -> (b+a-1) - (b-a+1) + 1 = 2a - 1
        return makeExtQ(
          t(`Có bao nhiêu giá trị nguyên của x (cm) để bộ ba độ dài ${a} cm, ${b} cm, x cm lập thành ba cạnh của một tam giác?`, `How many integer values of x allow sides ${a} cm, ${b} cm, x cm to form a triangle?`),
          cntInt, [cntInt + 2, 2 * a + 1, b - a], 'geom:ineq', cfg,
          `Theo bất đẳng thức tam giác: ${b} − ${a} < x < ${b} + ${a} ⇔ ${b - a} < x < ${b + a}.\nCác giá trị nguyên của x từ ${b - a + 1} đến ${b + a - 1} gồm: ${cntInt} giá trị.`, ex({ domain: 'geometry' })
        );
      }
      case 'g7_geom_lines': {
        if (tier === 'easy') {
          const gm = rInt(3, 12), am = gm * 3, ag = gm * 2;
          return makeExtQ(
            t(`Tam giác ABC có đường trung tuyến AM = ${am} cm và trọng tâm G. Tính độ dài đoạn AG (cm)?`, `In △ABC, median AM = ${am} cm and G is the centroid. Find AG (cm)`),
            ag, [gm, Math.round(am / 2), ag + 2], 'geom:centroid', cfg,
            `Tính chất trọng tâm tam giác: AG = (2/3) · AM = (2/3) · ${am} = ${ag} (cm).`, ex({ domain: 'geometry' })
          );
        }
        if (tier === 'medium') {
          const gm = rInt(4, 15), ag = gm * 2;
          return makeExtQ(
            t(`Cho G là trọng tâm tam giác ABC với đường trung tuyến AM. Biết AG = ${ag} cm, tính độ dài đoạn GM (cm)?`, `Centroid G on median AM has AG = ${ag} cm. Find GM (cm)`),
            gm, [ag * 2, ag + gm, gm + 2], 'geom:centroid', cfg,
            `Vì G là trọng tâm nên AG = 2 · GM ⇒ GM = ${ag} ÷ 2 = ${gm} (cm).`, ex({ domain: 'geometry' })
          );
        }
        // Incenter angle BIC = 90 + A/2
        const angA = rInt(20, 50) * 2, bic = 90 + angA / 2;
        return makeExtQ(
          t(`Tam giác ABC có góc A = ${angA}°. Hai tia phân giác trong của góc B và góc C cắt nhau tại I. Tính số đo góc BIC (độ)?`, `In △ABC, ∠A = ${angA}°. Internal angle bisectors of B and C meet at I. Find ∠BIC (°)`),
          bic, [180 - angA, 90 - angA / 2, bic + 10], 'geom:incenter', cfg,
          `• Trong △ABC: ∠B + ∠C = 180° − ${angA}° = ${180 - angA}°.\n• Vì BI, CI là phân giác nên ∠IBC + ∠ICB = (∠B + ∠C)/2 = ${(180 - angA) / 2}°.\n• Trong △BIC: ∠BIC = 180° − ${(180 - angA) / 2}° = ${bic}° (Công thức nhanh: 90° + ∠A/2).`, ex({ domain: 'geometry' })
        );
      }
      case 'g7_geom_prism': {
        if (tier === 'easy') {
          const a = rInt(3, 8), b = rInt(4, 9), c = rInt(5, 10), h = rInt(6, 12), sxq = (a + b + c) * h;
          return makeExtQ(
            t(`Hình lăng trụ đứng tam giác có ba cạnh đáy là ${a} cm, ${b} cm, ${c} cm và chiều cao ${h} cm. Tính diện tích xung quanh (cm²)?`, `Triangular prism with base sides ${a}, ${b}, ${c} cm and height ${h} cm. Lateral area Sxq (cm²) = ?`),
            sxq, [(a + b + c) * 2, sxq + 10, Math.max(10, sxq - 10)], 'geom:prism', cfg,
            `Diện tích xung quanh hình lăng trụ đứng: Sxq = C_đáy · h = (${a} + ${b} + ${c}) · ${h} = ${sxq} (cm²).`, ex({ domain: 'geometry' })
          );
        }
        if (tier === 'medium') {
          const b1 = rInt(4, 10) * 2, b2 = rInt(5, 11), h = rInt(6, 14), sBase = (b1 * b2) / 2, vol = sBase * h;
          return makeExtQ(
            t(`Lều cắm trại dạng hình lăng trụ đứng tam giác có đáy là tam giác (đáy ${b1} dm, cao ${b2} dm) và chiều dài lều ${h} dm. Thể tích lều là bao nhiêu dm³?`, `Tent shaped as a triangular prism: base triangle (${b1} dm × ${b2} dm), length ${h} dm. Volume (dm³) = ?`),
            vol, [vol * 2, vol + 20, sBase + h], 'geom:prism', cfg,
            `• Diện tích mặt đáy tam giác: S_đáy = (${b1} · ${b2}) ÷ 2 = ${sBase} (dm²)\n• Thể tích hình lăng trụ đứng: V = S_đáy · h = ${sBase} · ${h} = ${vol} (dm³).`, ex({ domain: 'geometry' })
          );
        }
        // Aquarium water level rise / liters
        const l = rInt(5, 10), w = rInt(4, 8), hWater = rInt(3, 6), liters = l * w * hWater;
        return makeExtQ(
          t(`Bể cá hình hộp chữ nhật dài ${l} dm, rộng ${w} dm đang cạn. Đổ vào bể ${liters} lít nước thì mực nước trong bể cao bao nhiêu dm (biết 1 lít = 1 dm³)?`, `A ${l} dm × ${w} dm tank gets ${liters} L of water. Water height (dm) = ?`),
          hWater, [hWater + 2, l * w, Math.max(1, hWater - 1)], 'geom:prism', cfg,
          `Đổi ${liters} lít = ${liters} dm³.\nDiện tích đáy bể: S = ${l} · ${w} = ${l * w} (dm²).\nChiều cao mực nước: h = V ÷ S = ${liters} ÷ ${l * w} = ${hWater} (dm).`, ex({ domain: 'geometry' })
        );
      }

      // ==================== GRADE 8: SỐ HỌC & ĐẠI SỐ ====================
      case 'g8_mono_poly': {
        if (tier === 'easy') {
          const eX = rInt(2, 5), eY = rInt(1, 4), eZ = rInt(1, 3), deg = eX + eY + eZ;
          return makeExtQ(
            t(`Tìm bậc của đơn thức thu gọn M = −6x^${eX}y^${eY}z^${eZ}`, `Find the degree of monomial M = −6x^${eX}y^${eY}z^${eZ}`),
            deg, [Math.max(eX, eY, eZ), deg + 1, 6], 'algebra:poly', cfg,
            `Bậc của đơn thức thu gọn (hệ số khác 0) bằng tổng số mũ của tất cả các biến:\n${eX} + ${eY} + ${eZ} = ${deg}.`, ex()
          );
        }
        if (tier === 'medium') {
          const k1 = rInt(3, 8), k2 = rInt(2, 6), xV = pickAny([-2, 2, 3]), yV = pickAny([-1, 2]), coef = k1 - k2;
          const ans = coef * (xV * xV) * yV;
          return makeExtQ(
            t(`Thu gọn rồi tính giá trị của P = ${k1}x^2y − ${k2}x^2y tại x = ${xV}, y = ${yV}`, `Simplify and evaluate P = ${k1}x^2y − ${k2}x^2y at x = ${xV}, y = ${yV}`),
            ans, [-ans, ans + 4, (k1 + k2) * xV * xV * yV], 'algebra:poly', cfg,
            `• Thu gọn đơn thức đồng dạng: P = (${k1} − ${k2})x²y = ${coef}x²y.\n• Thay x = ${xV}, y = ${yV}: P = ${coef} · (${xV})² · (${yV}) = ${ans}.`, ex({ allowNeg: true })
          );
        }
        const a = rInt(2, 5), b = rInt(2, 6), xV = rInt(2, 5), yV = rInt(1, 4), ans = a * xV - b * yV;
        return makeExtQ(
          t(`Thực hiện phép chia đa thức (${a * 3}x^2y − ${b * 3}xy^2) ÷ (3xy) rồi tính giá trị tại x = ${xV}, y = ${yV}`, `Divide (${a * 3}x^2y − ${b * 3}xy^2) ÷ (3xy) and evaluate at x = ${xV}, y = ${yV}`),
          ans, [ans + 3, -ans, a * xV + b * yV], 'algebra:poly', cfg,
          `Chia từng hạng tử cho 3xy:\n(${a * 3}x²y − ${b * 3}xy²) ÷ (3xy) = ${a}x − ${b}y.\nThay x = ${xV}, y = ${yV}: ${a}·${xV} − ${b}·${yV} = ${ans}.`, ex({ allowNeg: true })
        );
      }
      case 'g8_id': {
        if (tier === 'easy') {
          const b = rInt(15, 45), diff = pickAny([10, 20]), a = b + diff, ans = a * a - b * b;
          return makeExtQ(`${a}^2 − ${b}^2`, ans, [(a - b) * (a - b), ans + 20, ans - 20], 'identity:diffSq', cfg,
            `Hằng đẳng thức hiệu hai bình phương:\n${a}² − ${b}² = (${a} − ${b})(${a} + ${b}) = ${a - b} · ${a + b} = ${ans}.`, ex());
        }
        if (tier === 'medium') {
          const sumBase = pickAny([30, 40, 50, 60, 80]), x = rInt(11, sumBase - 11), y = sumBase - x, val = sumBase * sumBase;
          return makeExtQ(
            t(`Tính nhanh bằng hằng đẳng thức: ${x}^2 + ${2 * x}·${y} + ${y}^2`, `Compute fast using identities: ${x}^2 + ${2 * x}·${y} + ${y}^2`),
            val, [x * x + y * y, val + 100, val - 100], 'identity:sq', cfg,
            `Áp dụng hằng đẳng thức (a + b)² = a² + 2ab + b²:\n${x}² + 2·${x}·${y} + ${y}² = (${x} + ${y})² = ${sumBase}² = ${val}.`, ex()
          );
        }
        // Quadratic Min/Max by completing the square (classic Grade 8 1-point final question!)
        const h = rInt(2, 7), minVal = rInt(-6, 12) || 3, c = h * h + minVal;
        const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
        return makeExtQ(
          t(`Tìm giá trị nhỏ nhất (GTNN) của biểu thức P = x^2 − ${2 * h}x ${cStr}`, `Find the minimum value of P = x^2 − ${2 * h}x ${cStr}`),
          minVal, [c, h, minVal + h], 'identity:sq', cfg,
          `Tách bình phương một hiệu:\nP = (x² − ${2 * h}x + ${h * h}) + (${minVal}) = (x − ${h})² + (${minVal}) ≥ ${minVal}.\nDấu "=" xảy ra khi x = ${h}. Vậy GTNN của P bằng ${minVal}.`, ex({ allowNeg: true })
        );
      }
      case 'g8_factor': {
        if (tier === 'easy') {
          const a = rInt(2, 9), sumRoots = a; // x^2 - ax = x(x - a) = 0 -> roots 0 and a -> sum = a
          return makeExtQ(
            t(`Phân tích thành nhân tử để tìm nghiệm dương của phương trình: x^2 − ${a}x = 0`, `Factor to find the positive root of x^2 − ${a}x = 0`),
            a, [-a, a * a, a + 1], 'algebra:factor', cfg,
            `Đặt nhân tử chung x:\nx(x − ${a}) = 0 ⇔ x = 0 hoặc x = ${a} → nghiệm dương là x = ${a}.`, ex()
          );
        }
        if (tier === 'medium') {
          const xV = rInt(15, 45), yV = 100 - xV, k = rInt(3, 9), ans = 100 * (xV - k);
          const a = rInt(2, 8), b = rInt(-7, -1), sum = a + b;
          return makeExtQ(
            t(`Tính tổng tất cả các nghiệm của phương trình: x^2 − ${a * a} = 0`, `Find the sum of all roots of x^2 − ${a * a} = 0`),
            0, [a, 2 * a, -2 * a], 'algebra:factor', cfg,
            `Phân tích: x² − ${a * a} = (x − ${a})(x + ${a}) = 0 ⇔ x = ${a} hoặc x = −${a}.\nTổng các nghiệm: ${a} + (−${a}) = 0.`, ex({ allowNeg: true })
          );
        }
        const xV = rInt(22, 68), yV = xV - 10, zV = rInt(15, 35), diff = 10, ans = diff * (xV - zV);
        return makeExtQ(
          t(`Tính giá trị biểu thức A = x(x − y) − z(x − y) tại x = ${xV}, y = ${yV}, z = ${zV}`, `Evaluate A = x(x − y) − z(x − y) at x = ${xV}, y = ${yV}, z = ${zV}`),
          ans, [-ans, ans + 20, (xV + zV) * diff], 'algebra:factor', cfg,
          `Phân tích đa thức thành nhân tử trước khi thay số:\nA = (x − y)(x − z) = (${xV} − ${yV}) · (${xV} − ${zV}) = ${diff} · ${xV - zV} = ${ans}.`, ex({ allowNeg: true })
        );
      }
      case 'g8_poly': {
        if (tier === 'easy') {
          const excl = rInt(-7, 9) || 4, b = -excl, bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
          return makeExtQ(
            t(`Phân thức (3x + 5) / (x ${bStr}) xác định khi x khác giá trị nào?`, `Fraction (3x + 5) / (x ${bStr}) is defined when x ≠ ?`),
            excl, [-excl, 0, excl + 1], 'algebra:poly', cfg,
            `Điều kiện xác định: mẫu thức khác 0 ⇔ x ${bStr} ≠ 0 ⇔ x ≠ ${excl}.`, ex({ allowNeg: true })
          );
        }
        if (tier === 'medium') {
          const a = rInt(2, 7), xV = rInt(10, 35), ans = xV - a;
          return makeExtQ(
            t(`Rút gọn phân thức P = (x^2 − ${a * a}) / (x + ${a}) rồi tính giá trị tại x = ${xV}`, `Simplify P = (x^2 − ${a * a}) / (x + ${a}) and evaluate at x = ${xV}`),
            ans, [xV + a, ans + 2, xV * a], 'algebra:poly', cfg,
            `Với x ≠ −${a}: P = (x − ${a})(x + ${a}) / (x + ${a}) = x − ${a}.\nTại x = ${xV}: P = ${xV} − ${a} = ${ans}.`, ex()
          );
        }
        // Find integer values of x so rational expression takes integer value!
        const d = pickAny([3, 5, 7]); // (2x + d + 1)/(x + ...) -> cleaner: count integer x so k / (x - a) is integer
        const p = pickAny([3, 5, 7]); // prime p has 4 integer divisors: ±1, ±p!
        const a = rInt(1, 6);
        return makeExtQ(
          t(`Có bao nhiêu giá trị nguyên của x để biểu thức A = ${p} / (x − ${a}) nhận giá trị nguyên?`, `For how many integers x does A = ${p} / (x − ${a}) take an integer value?`),
          4, [2, 3, 6], 'algebra:poly', cfg,
          `Để A ∈ ℤ (với x ∈ ℤ, x ≠ ${a}) thì (x − ${a}) phải là ước nguyên của số nguyên tố ${p}.\nƯ(${p}) = {−${p}; −1; 1; ${p}} → tương ứng có 4 giá trị nguyên của x.`, ex()
        );
      }
      case 'g8_eq': {
        if (tier === 'easy') {
          const a = rInt(2, 7), c = rInt(1, a - 1), xVal = rInt(-6, 8) || 3, b = rInt(2, 15), d = (a - c) * xVal + b;
          return makeExtQ(t(`Giải phương trình: ${a}x + ${b} = ${c}x + ${d}`, `Solve: ${a}x + ${b} = ${c}x + ${d}`), xVal, [xVal + 1, xVal - 1, -xVal], 'equation:x', cfg,
            `Chuyển vế: (${a} − ${c})x = ${d} − ${b} ⇒ ${a - c}x = ${d - b} ⇒ x = ${xVal}.`, ex({ allowNeg: true }));
        }
        if (tier === 'medium') {
          const xVal = rInt(-5, 9) || 4, a = rInt(2, 5), b = rInt(1, 6), rhs = a * (xVal - b) + 2 * xVal;
          return makeExtQ(
            t(`Giải phương trình: ${a}(x − ${b}) + 2x = ${rhs}`, `Solve: ${a}(x − ${b}) + 2x = ${rhs}`),
            xVal, [-xVal, xVal + 1, xVal - 1], 'equation:x', cfg,
            `Khai triển: ${a}x − ${a * b} + 2x = ${rhs} ⇒ ${a + 2}x = ${rhs + a * b} ⇒ x = ${xVal}.`, ex({ allowNeg: true })
          );
        }
        // Equation with constant denominators: (x + a)/2 + (x - b)/3 = k
        const k6 = rInt(1, 5), xVal = 6 * k6, a = 2, b = 3; // (x+2)/2 + (x-3)/3 = (3x+6 + 2x-6)/6 = 5x/6 -> wait, let xVal be multiple of 6!
        const rhs = (5 * xVal) / 6;
        return makeExtQ(
          t(`Giải phương trình: (x + 2)/2 + (x − 3)/3 = ${rhs}`, `Solve: (x + 2)/2 + (x − 3)/3 = ${rhs}`),
          xVal, [xVal + 6, Math.max(2, xVal - 6), rhs], 'equation:x', cfg,
          `Quy đồng mẫu số chung là 6:\n3(x + 2) + 2(x − 3) = 6 · ${rhs}\n⇔ 3x + 6 + 2x − 6 = ${6 * rhs} ⇔ 5x = ${5 * xVal} ⇔ x = ${xVal}.`, ex()
        );
      }
      case 'g8_word_eq': {
        if (tier === 'easy') {
          const small = rInt(14, 38), diff = rInt(8, 22), sum = 2 * small + diff;
          return makeExtQ(
            t(`Hai ngăn sách có ${sum} quyển, ngăn thứ nhất ít hơn ngăn thứ hai ${diff} quyển. Lập phương trình tính số sách ngăn thứ nhất?`, `Two shelves hold ${sum} books; shelf 1 has ${diff} fewer than shelf 2. Books on shelf 1 = ?`),
            small, [small + diff, small + 10, Math.max(5, small - 10)], 'word:eq', cfg,
            `Gọi số sách ngăn 1 là x (quyển) ⇒ ngăn 2 có x + ${diff}.\nPhương trình: x + (x + ${diff}) = ${sum} ⇔ 2x = ${sum - diff} ⇔ x = ${small} (quyển).`, ex()
          );
        }
        if (tier === 'medium') {
          // Motion problem: Go at v1, return at v2, time difference = dt -> find distance AB
          const combos = [[40, 50, 1, 200], [30, 40, 1, 120], [40, 60, 1, 120], [30, 45, 1, 90], [45, 60, 1, 180]];
          const [v1, v2, dt, dist] = pickAny(combos);
          return makeExtQ(
            t(`Một ô tô đi từ A đến B với vận tốc ${v1} km/h rồi quay về A với vận tốc ${v2} km/h. Thời gian về ít hơn thời gian đi là ${dt} giờ. Tính quãng đường AB (km)?`, `A car goes A→B at ${v1} km/h and returns at ${v2} km/h, taking ${dt}h less on return. Distance AB (km) = ?`),
            dist, [dist + 20, Math.max(30, dist - 20), (v1 + v2) * dt], 'word:eq', cfg,
            `Bài giải bằng cách lập phương trình:\n• Gọi quãng đường AB là x (km, x > 0).\n• Thời gian đi là x/${v1} (giờ), thời gian về là x/${v2} (giờ).\n• Ta có PT: x/${v1} − x/${v2} = ${dt} ⇔ x · (1/${v1} − 1/${v2}) = ${dt} ⇒ x = ${dist} (km).`, ex()
          );
        }
        // Production target problem (ahead of schedule)
        const combos = [[30, 40, 3, 360], [40, 50, 2, 400], [25, 30, 2, 300], [50, 60, 2, 600]];
        const [planPerDay, realPerDay, earlyDays, totalItems] = pickAny(combos);
        return makeExtQ(
          t(`Một xưởng may theo kế hoạch mỗi ngày may ${planPerDay} áo. Nhờ cải tiến kỹ thuật, thực tế mỗi ngày may được ${realPerDay} áo nên hoàn thành sớm hơn kế hoạch ${earlyDays} ngày (đúng số lượng giao). Tính số áo theo kế hoạch?`, `Planned ${planPerDay} shirts/day, actually made ${realPerDay} shirts/day and finished ${earlyDays} days early. Planned total shirts = ?`),
          totalItems, [totalItems + 40, totalItems - 40, realPerDay * earlyDays], 'word:eq', cfg,
          `Bài giải:\n• Gọi số áo theo kế hoạch là x (x ∈ ℕ*).\n• Thời gian dự định: x/${planPerDay} (ngày); thời gian thực tế: x/${realPerDay} (ngày).\n• Phương trình: x/${planPerDay} − x/${realPerDay} = ${earlyDays} ⇒ x = ${totalItems} (chiếc áo).`, ex()
        );
      }
      case 'g8_func': {
        if (tier === 'easy') {
          const a = pickAny([-4, -2, 2, 3, 5]), b = rInt(-7, 8) || 3;
          const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
          return makeExtQ(
            t(`Tìm hệ số góc của đường thẳng y = ${a}x ${bStr}`, `Find the slope of the line y = ${a}x ${bStr}`),
            a, [b, -a, a + b], 'func:linear', cfg,
            `Đường thẳng y = ax + b (a ≠ 0) có hệ số góc là a = ${a}.`, ex({ allowNeg: true })
          );
        }
        if (tier === 'medium') {
          const targetA = pickAny([2, 3, -2, 4]), shift = rInt(1, 5), mVal = targetA + shift;
          return makeExtQ(
            t(`Tìm m để đường thẳng (d₁): y = (m − ${shift})x + 3 song song với đường thẳng (d₂): y = ${targetA}x − 5`, `Find m so line y = (m − ${shift})x + 3 is parallel to y = ${targetA}x − 5`),
            mVal, [targetA - shift, -mVal, targetA], 'func:linear', cfg,
            `Hai đường thẳng song song khi a₁ = a₂ và b₁ ≠ b₂ (3 ≠ −5 luôn đúng):\nm − ${shift} = ${targetA} ⇒ m = ${mVal}.`, ex({ allowNeg: true })
          );
        }
        // Find x-intercept or area of triangle with Ox, Oy
        const xInt = pickAny([3, 4, 6]), yInt = pickAny([4, 6, 8]); // line: y = (-yInt/xInt)x + yInt
        if (yInt % xInt === 0) {
          const k = yInt / xInt, area = (xInt * yInt) / 2;
          return makeExtQ(
            t(`Đường thẳng (d): y = −${k}x + ${yInt} cắt hai trục tọa độ Ox, Oy tại A và B. Tính diện tích tam giác vuông OAB (đơn vị diện tích)?`, `Line y = −${k}x + ${yInt} cuts axes Ox, Oy at A and B. Area of △OAB = ?`),
            area, [xInt * yInt, xInt + yInt, area + 2], 'func:linear', cfg,
            `• Cho y = 0 ⇒ x = ${xInt} ⇒ OA = ${xInt}; cho x = 0 ⇒ y = ${yInt} ⇒ OB = ${yInt}.\n• Diện tích tam giác vuông OAB: S = (OA · OB) ÷ 2 = (${xInt} · ${yInt}) ÷ 2 = ${area}.`, ex()
          );
        }
        const a = 2, x0 = rInt(2, 5), y0 = rInt(5, 15), bVal = y0 - a * x0;
        return makeExtQ(
          t(`Đường thẳng y = ${a}x + b đi qua điểm A(${x0}; ${y0}). Tìm tung độ gốc b?`, `Line y = ${a}x + b passes through A(${x0}; ${y0}). Find b`),
          bVal, [y0 + a * x0, -bVal, bVal + 2], 'func:linear', cfg,
          `Thay x = ${x0}, y = ${y0} vào y = ${a}x + b:\n${y0} = ${a} · ${x0} + b ⇒ b = ${y0} − ${a * x0} = ${bVal}.`, ex({ allowNeg: true })
        );
      }
      case 'g8_rat': {
        if (typeof plainGenerate === 'function') {
          const q = plainGenerate({ ...cfg, grade: 8, type: pickAny(['fraction', 'negative']), types: ['fraction', 'negative'], ops: ['+', '-', '*', '/'], questionStyle: 'normal' });
          if (q) return { ...q, difficulty: tier, difficultyLabel: difficultyBadgeLabel(tier), domain: 'number' };
        }
        return makeExtQ('(-3/4) + 5/4', '1/2', ['-1/2', '3/2', '5/2'], 'fraction:+', cfg, '(-3 + 5)/4 = 2/4 = 1/2', ex());
      }
      case 'g8_prob_stat': {
        if (tier === 'easy') {
          const r = rInt(3, 7), b = rInt(4, 8), g = rInt(3, 6), tot = r + b + g;
          const ans = fracStr(r, tot);
          return makeExtQ(
            t(`Hộp có ${r} bi đỏ, ${b} bi xanh và ${g} bi vàng cùng kích thước. Lấy ngẫu nhiên 1 viên bi, tính xác suất lấy được bi đỏ?`, `Box has ${r} red, ${b} blue, ${g} yellow marbles. Probability of drawing red = ?`),
            ans, [fracStr(b, tot), fracStr(tot - r, tot), fracStr(r + 1, tot)], 'stat:prob', cfg,
            `Tổng số bi trong hộp: ${r} + ${b} + ${g} = ${tot}.\nXác suất lấy được bi đỏ: P = ${r}/${tot} = ${ans}.`, ex()
          );
        }
        if (tier === 'medium') {
          // Two-digit number divisible by 10 or 9
          const k = pickAny([9, 10, 15]);
          const cnt = k === 10 ? 9 : k === 9 ? 10 : 6; // two-digit numbers 10..99 (90 numbers total)
          const ans = fracStr(cnt, 90);
          return makeExtQ(
            t(`Chọn ngẫu nhiên 1 số tự nhiên có hai chữ số (từ 10 đến 99). Tính xác suất số được chọn chia hết cho ${k}?`, `Pick a random 2-digit number (10..99). Probability it is divisible by ${k}?`),
            ans, [fracStr(cnt + 1, 90), fracStr(1, k + 2), fracStr(cnt - 1, 90)], 'stat:prob', cfg,
            `• Có 90 số tự nhiên có hai chữ số (từ 10 đến 99).\n• Trong đó có ${cnt} số chia hết cho ${k} ⇒ Xác suất P = ${cnt}/90 = ${ans}.`, ex()
          );
        }
        const batch = pickAny([2000, 3000, 5000]), sample = 200, defectSample = rInt(2, 6);
        const goodExpected = batch - (batch * defectSample) / sample;
        return makeExtQ(
          t(`Kiểm tra ngẫu nhiên ${sample} sản phẩm trong lô hàng ${batch} chiếc thấy có ${defectSample} sản phẩm lỗi. Dự đoán trong cả lô hàng có khoảng bao nhiêu sản phẩm ĐẠT CHUẨN?`, `Out of ${sample} sampled items from a batch of ${batch}, ${defectSample} are defective. Estimated NON-defective items in the batch = ?`),
          goodExpected, [(batch * defectSample) / sample, goodExpected - 50, batch - defectSample], 'stat:prob', cfg,
          `• Xác suất thực nghiệm sản phẩm đạt chuẩn: (${sample} − ${defectSample}) / ${sample} = ${sample - defectSample}/${sample}.\n• Số sản phẩm đạt chuẩn ước lượng trong lô ${batch} chiếc: ${batch} · (${sample - defectSample}/${sample}) = ${goodExpected} (chiếc).`, ex()
        );
      }

      // ==================== GRADE 8: HÌNH HỌC ====================
      case 'g8_geom_pytha': {
        const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20]];
        const [a, b, c] = pickAny(triples);
        if (tier === 'easy') {
          return makeExtQ(
            t(`Tam giác ABC vuông tại A có hai cạnh góc vuông AB = ${a} cm, AC = ${b} cm. Tính độ dài cạnh huyền BC (cm)?`, `Right △ABC at A has legs AB = ${a} cm, AC = ${b} cm. Hypotenuse BC (cm) = ?`),
            c, [a + b, c + 2, Math.max(2, c - 2)], 'geom:pythagore', cfg,
            `Áp dụng Định lý Pythagore cho △ABC vuông tại A:\nBC² = AB² + AC² = ${a}² + ${b}² = ${a * a + b * b} ⇒ BC = ${c} (cm).`, ex({ domain: 'geometry', visualKind: 'right_tri', visualData: { a, b, c } })
          );
        }
        if (tier === 'medium') {
          return makeExtQ(
            t(`Một chiếc thang dài ${c} m đặt tựa vào tường thẳng đứng, chân thang cách chân tường ${a} m. Hỏi đầu thang chạm tường ở độ cao bao nhiêu mét?`, `A ${c} m ladder leans against a vertical wall with its foot ${a} m from the wall. Height reached (m) = ?`),
            b, [c - a, c + a, b + 2], 'geom:pythagore', cfg,
            `Thang, tường và mặt đất tạo thành tam giác vuông (cạnh huyền ${c} m):\nh² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b} ⇒ h = ${b} (m).`, ex({ domain: 'geometry', visualKind: 'right_tri', visualData: { a, b, c } })
          );
        }
        // Perimeter/Area of rhombus given diagonals (half-diagonals form right triangle!)
        const half1 = a, half2 = b, side = c, d1 = 2 * half1, d2 = 2 * half2, perim = 4 * side;
        return makeExtQ(
          t(`Hình thoi ABCD có hai đường chéo AC = ${d1} cm và BD = ${d2} cm. Tính chu vi của hình thoi ABCD (cm)?`, `Rhombus ABCD has diagonals AC = ${d1} cm and BD = ${d2} cm. Perimeter (cm) = ?`),
          perim, [2 * (d1 + d2), side, perim + 10], 'geom:pythagore', cfg,
          `• Gọi O là giao điểm hai đường chéo hình thoi ⇒ AC ⊥ BD tại trung điểm O: OA = ${half1} cm, OB = ${half2} cm.\n• Áp dụng Pythagore trong △OAB vuông tại O: AB = √(${half1}² + ${half2}²) = ${side} (cm).\n• Chu vi hình thoi: 4 · ${side} = ${perim} (cm).`, ex({ domain: 'geometry', visualKind: 'rhombus', visualData: { d1, d2 } })
        );
      }
      case 'g8_geom_quad': {
        if (tier === 'easy') {
          const A = rInt(65, 115), B = rInt(70, 120), C = rInt(60, 110), D = 360 - (A + B + C);
          return makeExtQ(
            t(`Tứ giác ABCD có góc A = ${A}°, góc B = ${B}°, góc C = ${C}°. Số đo góc D bằng bao nhiêu độ?`, `Quadrilateral ABCD has ∠A=${A}°, ∠B=${B}°, ∠C=${C}°. Find ∠D (°)`),
            D, [180 - C > 0 ? 180 - C : D + 20, D + 10, Math.max(15, D - 10)], 'geom:quad', cfg,
            `Tổng 4 góc của một tứ giác bằng 360°:\n∠D = 360° − (${A}° + ${B}° + ${C}°) = ${D}°.`, ex({ domain: 'geometry' })
          );
        }
        if (tier === 'medium') {
          const diff = pickAny([20, 30, 40, 50]), bigA = (180 + diff) / 2;
          return makeExtQ(
            t(`Hình bình hành ABCD có góc A − góc B = ${diff}°. Tính số đo góc A (độ)?`, `Parallelogram ABCD has ∠A − ∠B = ${diff}°. Find ∠A (°)`),
            bigA, [180 - bigA, 90 + diff, bigA + 10], 'geom:quad', cfg,
            `Trong hình bình hành ABCD, hai góc kề một cạnh bù nhau: ∠A + ∠B = 180°.\nKết hợp ∠A − ∠B = ${diff}° ⇒ ∠A = (180° + ${diff}°) ÷ 2 = ${bigA}°.`, ex({ domain: 'geometry' })
          );
        }
        // Isosceles trapezoid height & area via Pythagoras
        const bSmall = rInt(6, 12), leg = 5, proj = 3, h = 4, bBig = bSmall + 2 * proj;
        const area = ((bSmall + bBig) * h) / 2;
        return makeExtQ(
          t(`Hình thang cân ABCD (AB // CD) có đáy nhỏ AB = ${bSmall} cm, đáy lớn CD = ${bBig} cm và cạnh bên BC = ${leg} cm. Tính diện tích hình thang cân (cm²)?`, `Isosceles trapezoid ABCD has bases ${bSmall} cm, ${bBig} cm and leg ${leg} cm. Area (cm²) = ?`),
          area, [((bSmall + bBig) * leg) / 2, area + 10, Math.max(10, area - 10)], 'geom:quad', cfg,
          `• Hạ đường cao BH ⊥ CD ⇒ HC = (CD − AB) ÷ 2 = (${bBig} − ${bSmall}) ÷ 2 = ${proj} (cm).\n• Tam giác BHC vuông tại H: BH = √(${leg}² − ${proj}²) = ${h} (cm).\n• Diện tích hình thang: S = (${bSmall} + ${bBig}) · ${h} ÷ 2 = ${area} (cm²).`, ex({ domain: 'geometry', visualKind: 'trapezoid', visualData: { a: bBig, b: bSmall, h } })
        );
      }
      case 'g8_geom_thales': {
        if (tier === 'easy') {
          const mn = rInt(5, 18), bc = mn * 2;
          return makeExtQ(
            t(`Tam giác ABC có M, N lần lượt là trung điểm của AB và AC. Biết MN = ${mn} cm, tính độ dài cạnh BC (cm)?`, `M, N are midpoints of AB, AC in △ABC. Given MN = ${mn} cm, find BC (cm)`),
            bc, [mn, mn + 4, bc + 4], 'geom:thales', cfg,
            `MN là đường trung bình của △ABC nên MN = BC/2 ⇒ BC = 2 · ${mn} = ${bc} (cm).`, ex({ domain: 'geometry' })
          );
        }
        if (tier === 'medium') {
          const ad = rInt(3, 8), db = rInt(2, 6), k = rInt(2, 4), ae = ad * k, ec = db * k;
          return makeExtQ(
            t(`Trong tam giác ABC, đường thẳng DE // BC (D ∈ AB, E ∈ AC). Biết AD = ${ad} cm, DB = ${db} cm, AE = ${ae} cm. Tính độ dài EC (cm)?`, `In △ABC, DE // BC with AD=${ad}, DB=${db}, AE=${ae} cm. Find EC (cm)`),
            ec, [ae + db, ec + 2, Math.max(1, ec - 2)], 'geom:thales', cfg,
            `Áp dụng Định lý Thalès (DE // BC):\nAD / DB = AE / EC ⇒ ${ad}/${db} = ${ae}/EC ⇒ EC = (${db} · ${ae}) ÷ ${ad} = ${ec} (cm).`, ex({ domain: 'geometry' })
          );
        }
        // Angle bisector theorem: DB/DC = AB/AC, DB + DC = BC
        const rA = rInt(2, 5), rB = rInt(rA + 1, 7), scale = rInt(2, 4), ab = rA * 3, ac = rB * 3;
        const bc = (rA + rB) * scale, db = rA * scale;
        return makeExtQ(
          t(`Tam giác ABC có AB = ${ab} cm, AC = ${ac} cm, BC = ${bc} cm. Tia phân giác góc A cắt BC tại D. Tính độ dài đoạn thẳng DB (cm)?`, `In △ABC, AB=${ab}, AC=${ac}, BC=${bc} cm. Angle bisector AD meets BC at D. Find DB (cm)`),
          db, [rB * scale, Math.round(bc / 2), db + 2], 'geom:thales', cfg,
          `• Tính chất đường phân giác: DB / DC = AB / AC = ${ab}/${ac} = ${rA}/${rB}.\n• Mà DB + DC = BC = ${bc} ⇒ DB = ${bc} ÷ (${rA} + ${rB}) · ${rA} = ${db} (cm).`, ex({ domain: 'geometry' })
        );
      }
      case 'g8_geom_sim': {
        if (tier === 'easy') {
          const k = pickAny([2, 3, 4, 5]), sSmall = rInt(6, 20), sBig = sSmall * k * k;
          return makeExtQ(
            t(`Tam giác A'B'C' đồng dạng với tam giác ABC theo tỉ số đồng dạng k = ${k}. Biết diện tích △ABC bằng ${sSmall} cm², tính diện tích △A'B'C' (cm²)?`, `△A'B'C' ~ △ABC with scale factor k = ${k}. If Area(△ABC) = ${sSmall} cm², Area(△A'B'C') = ? cm²`),
            sBig, [sSmall * k, sBig + 10, Math.round(sSmall / k) || 2], 'geom:similar', cfg,
            `Tỉ số diện tích của hai tam giác đồng dạng bằng BÌNH PHƯƠNG tỉ số đồng dạng:\nS(A'B'C') / S(ABC) = k² = ${k}² = ${k * k} ⇒ S(A'B'C') = ${sSmall} · ${k * k} = ${sBig} (cm²).`, ex({ domain: 'geometry' })
          );
        }
        if (tier === 'medium') {
          // Sun shadow real-world problem!
          const poleH = 2, poleShadow = pickAny([1, 2, 4]), ratio = rInt(4, 10);
          const treeShadow = poleShadow * ratio, treeH = poleH * ratio;
          return makeExtQ(
            t(`Cùng một thời điểm, cọc tiêu cao ${poleH} m có bóng trên mặt đất dài ${poleShadow} m, còn một tòa nhà có bóng dài ${treeShadow} m. Tính chiều cao tòa nhà (m)?`, `At the same moment, a ${poleH} m pole casts a ${poleShadow} m shadow and a building casts a ${treeShadow} m shadow. Building height (m) = ?`),
            treeH, [treeShadow + poleH, treeH + 4, Math.max(4, treeH - 4)], 'geom:similar', cfg,
            `Các tia nắng mặt trời song song tạo ra hai tam giác vuông đồng dạng:\nH_nhà / H_cọc = Bóng_nhà / Bóng_cọc ⇒ H_nhà = (${poleH} · ${treeShadow}) ÷ ${poleShadow} = ${treeH} (m).`, ex({ domain: 'geometry' })
          );
        }
        const p1 = rInt(12, 24), kNum = 3, kDen = 2; // p1 even -> p2 = p1 * 3 / 2
        const evenP1 = p1 % 2 === 0 ? p1 : p1 + 1, p2 = (evenP1 * kNum) / kDen, sumP = evenP1 + p2;
        return makeExtQ(
          t(`Hai tam giác đồng dạng có tỉ số diện tích bằng 4/9 và tổng chu vi hai tam giác là ${sumP} cm. Tính chu vi của tam giác lớn hơn (cm)?`, `Two similar triangles have area ratio 4/9 and combined perimeter ${sumP} cm. Perimeter of the larger triangle (cm) = ?`),
          p2, [evenP1, Math.round((sumP * 9) / 13), p2 + 4], 'geom:similar', cfg,
          `• Tỉ số diện tích bằng 4/9 = (2/3)² ⇒ tỉ số đồng dạng (cũng là tỉ số chu vi) bằng 2/3.\n• Tổng chu vi bằng ${sumP} cm ⇒ Chu vi tam giác lớn = ${sumP} ÷ (2 + 3) · 3 = ${p2} (cm).`, ex({ domain: 'geometry' })
        );
      }
      case 'g8_geom_pyramid': {
        if (tier === 'easy') {
          const a = rInt(4, 10), d = rInt(5, 12), sxq = 2 * a * d; // p * d = (4a/2) * d = 2ad
          return makeExtQ(
            t(`Hình chóp tứ giác đều S.ABCD có cạnh đáy a = ${a} cm và trung đoạn d = ${d} cm. Tính diện tích xung quanh của hình chóp (cm²)?`, `Regular square pyramid has base edge ${a} cm and slant height ${d} cm. Lateral area Sxq (cm²) = ?`),
            sxq, [4 * a * d, a * d, sxq + 10], 'geom:pyramid', cfg,
            `Diện tích xung quanh hình chóp tứ giác đều:\nSxq = p · d = (4 · ${a} ÷ 2) · ${d} = ${2 * a} · ${d} = ${sxq} (cm²).`, ex({ domain: 'geometry' })
          );
        }
        if (tier === 'medium') {
          const a = pickAny([3, 6, 9, 12]), h = rInt(4, 15), vol = (a * a * h) / 3;
          return makeExtQ(
            t(`Hình chóp tứ giác đều có cạnh đáy ${a} cm và chiều cao ${h} cm. Tính thể tích hình chóp (cm³)?`, `Regular square pyramid with base edge ${a} cm and height ${h} cm. Volume (cm³) = ?`),
            vol, [a * a * h, (a * a * h) / 2, vol + 10], 'geom:pyramid', cfg,
            `Thể tích hình chóp: V = (1/3) · S_đáy · h = (1/3) · ${a}² · ${h} = ${vol} (cm³).`, ex({ domain: 'geometry' })
          );
        }
        // Pyramid given base edge & height -> find slant height via Pythagoras, then total surface area!
        const halfA = pickAny([3, 6]), h = halfA === 3 ? 4 : 8, slant = halfA === 3 ? 5 : 10, a = 2 * halfA;
        const stp = 2 * a * slant + a * a;
        return makeExtQ(
          t(`Mô hình chóp tứ giác đều có cạnh đáy ${a} cm và chiều cao SO = ${h} cm. Tính diện tích toàn phần của hình chóp (cm²)?`, `Regular square pyramid has base edge ${a} cm and height ${h} cm. Total surface area Stp (cm²) = ?`),
          stp, [2 * a * slant, 2 * a * h + a * a, stp + 20], 'geom:pyramid', cfg,
          `• Khoảng cách từ tâm O đến trung điểm M cạnh đáy là OM = ${a}/2 = ${halfA} cm.\n• Áp dụng Pythagore tìm trung đoạn SM: SM = √(SO² + OM²) = √(${h}² + ${halfA}²) = ${slant} (cm).\n• Diện tích toàn phần: Stp = Sxq + S_đáy = 2 · ${a} · ${slant} + ${a}² = ${stp} (cm²).`, ex({ domain: 'geometry' })
        );
      }

      // ==================== GRADE 9: SỐ HỌC & ĐẠI SỐ ====================
      case 'g9_sqrt': {
        if (tier === 'easy') {
          const r1 = rInt(3, 14), r2 = rInt(2, 12), k = rInt(2, 4), ans = k * r1 - r2;
          return makeExtQ(`${k}√${r1 * r1} − √${r2 * r2}`, ans, [ans + 2, ans - 2, r1 - r2], 'sqrt:√', cfg,
            `${k} · ${r1} − ${r2} = ${k * r1} − ${r2} = ${ans}.`, ex({ allowNeg: true }));
        }
        if (tier === 'medium') {
          const m = pickAny([2, 3, 5]), k1 = rInt(2, 5), k2 = rInt(1, 4), coef = k1 + k2 - 1;
          return makeExtQ(
            t(`Rút gọn √${k1 * k1 * m} + √${k2 * k2 * m} − √${m} = a√${m}. Tìm hệ số a?`, `Simplify √${k1 * k1 * m} + √${k2 * k2 * m} − √${m} = a√${m}. Find a`),
            coef, [coef + 1, k1 + k2, coef + 2], 'sqrt:simplify', cfg,
            `Đưa thừa số ra ngoài dấu căn:\n${k1}√${m} + ${k2}√${m} − 1√${m} = (${k1} + ${k2} − 1)√${m} = ${coef}√${m} ⇒ a = ${coef}.`, ex()
          );
        }
        // Rationalizing denominators (classic Grade 9 Part 1 exam!)
        const a = rInt(3, 7), b = a * a - 1; // 1 / (a - sqrt(a^2 - 1)) + 1 / (a + sqrt(a^2 - 1)) = 2a!
        const ans = 2 * a;
        return makeExtQ(
          t(`Trục căn thức ở mẫu để tính: P = 1/(${a} − √${b}) + 1/(${a} + √${b})`, `Evaluate via conjugates: P = 1/(${a} − √${b}) + 1/(${a} + √${b})`),
          ans, [a, 2 * b, ans + 2], 'sqrt:rationalize', cfg,
          `Nhân liên hợp (vì ${a}² − (√${b})² = ${a * a} − ${b} = 1):\nP = (${a} + √${b}) + (${a} − √${b}) = ${ans}.`, ex()
        );
      }
      case 'g9_cbrt': {
        if (tier === 'easy') {
          const r = pickAny([-5, -4, -3, -2, 2, 3, 4, 5]), cube = r ** 3;
          return makeExtQ(`∛(${cube})`, r, [-r, r + 1, r - 1], 'cbrt:∛', cfg,
            `Vì (${r})³ = ${cube} nên ∛(${cube}) = ${r}.`, ex({ allowNeg: true }));
        }
        if (tier === 'medium') {
          const r1 = rInt(2, 5), r2 = rInt(2, 4), ans = r1 - r2;
          return makeExtQ(`∛(${r1 ** 3}) + ∛(${-(r2 ** 3)})`, ans, [r1 + r2, -ans, ans + 2], 'cbrt:∛', cfg,
            `∛(${r1 ** 3}) + ∛(${-(r2 ** 3)}) = ${r1} + (−${r2}) = ${ans}.`, ex({ allowNeg: true }));
        }
        // sqrt((a - sqrt(b))^2) + sqrt(b) when sqrt(b) > a!
        const a = rInt(2, 4), b = a * a + rInt(2, 6), c = a + rInt(1, 4); // sqrt(b) > a so |a - sqrt(b)| = sqrt(b) - a; plus |c + sqrt(b)| -> wait: √((a - √b)²) + √((c - √b)²) where a < √b < c!
        // Ensure a < sqrt(b) < c: pick a = 2, b = 7 (2 < √7 ≈ 2.64 < 3), c = 3..6!
        const cases = [[2, 5, 3], [2, 7, 4], [3, 11, 4], [3, 13, 5], [4, 19, 5]];
        const [low, rad, high] = pickAny(cases);
        const ans = high - low; // (√rad - low) + (high - √rad) = high - low!
        return makeExtQ(
          t(`Rút gọn biểu thức: A = √((${low} − √${rad})^2) + √((${high} − √${rad})^2)`, `Simplify: A = √((${low} − √${rad})^2) + √((${high} − √${rad})^2)`),
          ans, [low + high, -ans, ans + 2], 'sqrt:abs', cfg,
          `Áp dụng √(X²) = |X|, vì ${low} = √${low * low} < √${rad} < √${high * high} = ${high}:\n• |${low} − √${rad}| = √${rad} − ${low}\n• |${high} − √${rad}| = ${high} − √${rad}\n⇒ A = (√${rad} − ${low}) + (${high} − √${rad}) = ${ans}.`, ex()
        );
      }
      case 'g9_sys_eq': {
        if (tier === 'easy') {
          const x = rInt(-3, 7) || 2, y = rInt(1, 6), s = x + y, d = x - y;
          return makeExtQ(
            t(`Giải hệ phương trình { x + y = ${s} ; x − y = ${d} }. Tìm giá trị của x?`, `Solve system { x + y = ${s} ; x − y = ${d} }. Find x`),
            x, [y, -x, x + 2], 'equation:system', cfg,
            `Cộng từng vế hai phương trình: 2x = ${s} + (${d}) = ${2 * x} ⇒ x = ${x}.`, ex({ allowNeg: true })
          );
        }
        if (tier === 'medium') {
          const x = rInt(-4, 6) || 3, y = rInt(-3, 5) || -2;
          const c1 = 2 * x + 3 * y, c2 = x - y, sumXY = x + y;
          return makeExtQ(
            t(`Biết (x₀; y₀) là nghiệm của hệ { 2x + 3y = ${c1} ; x − y = ${c2} }. Tính tổng x₀ + y₀?`, `Let (x₀; y₀) solve { 2x + 3y = ${c1} ; x − y = ${c2} }. Find x₀ + y₀`),
            sumXY, [x, y, x - y], 'equation:system', cfg,
            `• Nhân PT (2) với 3: 3x − 3y = ${3 * c2}.\n• Cộng với PT (1): 5x = ${c1 + 3 * c2} ⇒ x₀ = ${x}; suy ra y₀ = ${x} − (${c2}) = ${y}.\n• Vậy x₀ + y₀ = ${sumXY}.`, ex({ allowNeg: true })
          );
        }
        // System with parameter m given a condition
        const mVal = rInt(2, 7), y0 = rInt(1, 4), kRatio = pickAny([2, 3]), x0 = kRatio * y0, sumS = x0 + y0;
        const rhs = mVal * x0 - y0;
        return makeExtQ(
          t(`Tìm tham số m để hệ phương trình { x + y = ${sumS} ; mx − y = ${rhs} } có nghiệm thỏa mãn x = ${kRatio}y`, `Find m so system { x + y = ${sumS} ; mx − y = ${rhs} } has a solution satisfying x = ${kRatio}y`),
          mVal, [-mVal, mVal + 1, mVal - 1], 'equation:system', cfg,
          `• Từ x + y = ${sumS} và x = ${kRatio}y ⇒ ${kRatio + 1}y = ${sumS} ⇒ y = ${y0}, x = ${x0}.\n• Thay x = ${x0}, y = ${y0} vào mx − y = ${rhs}: ${x0}m − ${y0} = ${rhs} ⇒ ${x0}m = ${rhs + y0} ⇒ m = ${mVal}.`, ex()
        );
      }
      case 'g9_ineq_eq': {
        if (tier === 'easy') {
          const a = rInt(2, 5), xBound = rInt(2, 8), b = rInt(1, 10), rhs = a * xBound + b;
          return makeExtQ(
            t(`Tìm nghiệm nguyên lớn nhất của bất phương trình: ${a}x + ${b} < ${rhs}`, `Find the largest integer x satisfying ${a}x + ${b} < ${rhs}`),
            xBound - 1, [xBound, xBound + 1, xBound - 2], 'equation:ineq', cfg,
            `${a}x < ${rhs} − ${b} = ${a * xBound} ⇔ x < ${xBound}.\nNghiệm nguyên lớn nhất nhỏ hơn ${xBound} là x = ${xBound - 1}.`, ex({ allowNeg: true })
          );
        }
        if (tier === 'medium') {
          // Negative coefficient trap: -ax + b <= c => x >= ...
          const a = rInt(2, 5), minInt = rInt(-4, 6) || 2, c = rInt(1, 9), b = a * minInt + c;
          return makeExtQ(
            t(`Tìm nghiệm nguyên nhỏ nhất của bất phương trình: −${a}x + ${b} ≤ ${c}`, `Find the smallest integer x satisfying −${a}x + ${b} ≤ ${c}`),
            minInt, [minInt - 1, -minInt, minInt + 1], 'equation:ineq', cfg,
            `Chuyển vế và CHIA CHO SỐ ÂM −${a} (nhớ đổi chiều bất đẳng thức!):\n−${a}x ≤ ${c} − ${b} = ${-a * minInt} ⇔ x ≥ ${minInt} → nghiệm nguyên nhỏ nhất là ${minInt}.`, ex({ allowNeg: true })
          );
        }
        // Rational equation with extraneous root check! (x^2 - a^2)/(x - a) + ... or product eq with domain
        const badRoot = rInt(2, 6), goodRoot = -badRoot - rInt(1, 4);
        // Solve: (x - badRoot)(x - goodRoot) / (x - badRoot) ... cleaner: x/(x - badRoot) = ...
        // Let's use: (x + a)/(x - 2) + 2/(2 - x) = k -> at x = 2 excluded!
        const k = rInt(2, 5), xAns = rInt(4, 9), numConst = k * (xAns - 2) - xAns + 2;
        const cStr = numConst >= 0 ? `+ ${numConst}` : `− ${Math.abs(numConst)}`;
        return makeExtQ(
          t(`Giải phương trình chứa ẩn ở mẫu: (x ${cStr})/(x − 2) − 2/(x − 2) = ${k}`, `Solve rational equation: (x ${cStr})/(x − 2) − 2/(x − 2) = ${k}`),
          xAns, [2, xAns + 2, xAns - 1], 'equation:x', cfg,
          `• ĐKXĐ: x ≠ 2.\n• Quy đồng khử mẫu: x + (${numConst}) − 2 = ${k}(x − 2) ⇔ x + (${numConst - 2}) = ${k}x − ${2 * k}\n⇔ ${k - 1}x = ${numConst - 2 + 2 * k} ⇔ x = ${xAns} (thỏa mãn ĐKXĐ).`, ex()
        );
      }
      case 'g9_eq': {
        if (tier === 'easy') {
          const x1 = rInt(-5, 6) || 2, x2 = rInt(-4, 7) || 3;
          const sum = x1 + x2, prod = x1 * x2;
          const sTerm = -sum === 0 ? '' : (-sum > 0 ? `+ ${-sum}x` : `− ${Math.abs(-sum)}x`);
          const pTerm = prod >= 0 ? `+ ${prod}` : `− ${Math.abs(prod)}`;
          const eqStr = `x^2 ${sTerm} ${pTerm} = 0`.replace(/\s+/g, ' ');
          const askSum = Math.random() < 0.5;
          const ans = askSum ? sum : prod;
          return makeExtQ(
            askSum ? t(`Phương trình ${eqStr} có tổng hai nghiệm x₁ + x₂ = ?`, `Sum of roots of ${eqStr} is ?`) : t(`Phương trình ${eqStr} có tích hai nghiệm x₁·x₂ = ?`, `Product of roots of ${eqStr} is ?`),
            ans, [-ans, ans + 1, ans - 1], 'equation:x', cfg,
            `Theo định lý Viète (Δ ≥ 0): x₁ + x₂ = −b/a = ${sum}; x₁·x₂ = c/a = ${prod}.`, ex({ allowNeg: true })
          );
        }
        if (tier === 'medium') {
          const aCoef = rInt(2, 5), ans = rInt(2, 9), root = rInt(2, 5), b = aCoef * ans - root * root;
          const bStr = b >= 0 ? `− ${b}` : `+ ${Math.abs(b)}`;
          return makeExtQ(
            t(`Giải phương trình vô tỷ: √(${aCoef}x ${bStr}) = ${root}`, `Solve radical equation: √(${aCoef}x ${bStr}) = ${root}`),
            ans, [ans + 1, Math.max(1, ans - 1), root * 2], 'equation:x', cfg,
            `ĐKXĐ và bình phương hai vế:\n${aCoef}x ${bStr} = ${root}² = ${root * root} ⇔ ${aCoef}x = ${root * root + b} ⇔ x = ${ans}.`, ex()
          );
        }
        // Symmetric Vieta expression x1^2 + x2^2 = S^2 - 2P (classic Grade 10 entrance exam!)
        let x1 = rInt(-4, 6) || 2, x2 = rInt(-3, 5) || -1;
        if (x1 === x2) x2++;
        const S = x1 + x2, P = x1 * x2, sumSq = S * S - 2 * P;
        const sTerm = -S === 0 ? '' : (-S > 0 ? `+ ${-S}x` : `− ${Math.abs(-S)}x`);
        const pTerm = P >= 0 ? `+ ${P}` : `− ${Math.abs(P)}`;
        const eqStr = `x^2 ${sTerm} ${pTerm} = 0`.replace(/\s+/g, ' ');
        return makeExtQ(
          t(`Gọi x₁, x₂ là hai nghiệm của phương trình ${eqStr}. Không giải PT, tính giá trị biểu thức A = x₁^2 + x₂^2?`, `Let x₁, x₂ be roots of ${eqStr}. Find A = x₁^2 + x₂^2 via Vieta`),
          sumSq, [S * S, S * S + 2 * P, sumSq + 2], 'equation:vieta', cfg,
          `• Theo hệ thức Viète: S = x₁ + x₂ = ${S}; P = x₁·x₂ = ${P}.\n• Biến đổi đối xứng: A = x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = (${S})² − 2·(${P}) = ${sumSq}.`, ex()
        );
      }
      case 'g9_func': {
        if (tier === 'easy') {
          const a = pickAny([-3, -2, 2, 3]), xv = pickAny([-3, -2, 2, 3]), yv = a * xv * xv;
          return makeExtQ(
            t(`Cho parabol (P): y = ${a}x^2. Tính tung độ y của điểm thuộc (P) có hoành độ x = ${xv}`, `For parabola y = ${a}x^2, find y when x = ${xv}`),
            yv, [-yv, a * xv * 2, yv + a], 'func:quad', cfg,
            `Thay x = ${xv} vào y = ${a}x²: y = ${a} · (${xv})² = ${a} · ${xv * xv} = ${yv}.`, ex({ allowNeg: true })
          );
        }
        if (tier === 'medium') {
          const a = pickAny([-2, -1, 1, 2, 3]), x0 = pickAny([2, -2, 3]), y0 = a * x0 * x0;
          return makeExtQ(
            t(`Tìm hệ số a biết đồ thị hàm số y = ax^2 đi qua điểm M(${x0}; ${y0})`, `Find a if parabola y = ax^2 passes through M(${x0}; ${y0})`),
            a, [-a, y0 / x0, a + 1], 'func:quad', cfg,
            `Vì M(${x0}; ${y0}) ∈ (P) nên: ${y0} = a · (${x0})² = ${x0 * x0}a ⇒ a = ${a}.`, ex({ allowNeg: true })
          );
        }
        // Intersection of Parabol (P): y = x^2 and line (d): y = mx + n -> sum of ordinates y1 + y2!
        const x1 = rInt(-3, -1), x2 = rInt(2, 5), m = x1 + x2, n = -x1 * x2;
        const y1 = x1 * x1, y2 = x2 * x2, sumY = y1 + y2;
        const mStr = m === 0 ? '' : (m === 1 ? 'x' : m === -1 ? '−x' : `${m}x`);
        const nStr = n >= 0 ? (mStr ? ` + ${n}` : `${n}`) : ` − ${Math.abs(n)}`;
        return makeExtQ(
          t(`Parabol (P): y = x^2 và đường thẳng (d): y = ${mStr}${nStr} cắt nhau tại hai điểm A(x₁; y₁) và B(x₂; y₂). Tính y₁ + y₂?`, `Parabola y = x^2 and line y = ${mStr}${nStr} meet at A(x₁; y₁) and B(x₂; y₂). Find y₁ + y₂`),
          sumY, [m, -n, sumY + 2], 'func:quad', cfg,
          `• Phương trình hoành độ giao điểm: x² − (${m})x − (${n}) = 0.\n• Theo Viète: x₁ + x₂ = ${m}, x₁x₂ = ${-n}.\n• Vì A, B ∈ (P) nên y₁ + y₂ = x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = (${m})² − 2·(${-n}) = ${sumY}.`, ex()
        );
      }
      case 'g9_word_sys': {
        if (tier === 'easy') {
          const totalAni = pickAny([24, 30, 36, 40]), chickens = rInt(8, totalAni - 8), dogs = totalAni - chickens, legs = 2 * chickens + 4 * dogs;
          return makeExtQ(
            t(`Bài toán cổ: Vừa gà vừa chó có tất cả ${totalAni} con, đếm đủ ${legs} chân. Lập hệ phương trình tìm số con chó?`, `Chickens and dogs total ${totalAni} animals with ${legs} legs. Number of dogs = ?`),
            dogs, [chickens, dogs + 2, Math.max(2, dogs - 2)], 'word:system', cfg,
            `Gọi x là số gà, y là số chó (x, y ∈ ℕ*):\nHệ PT: { x + y = ${totalAni} ; 2x + 4y = ${legs} } ⇔ { x = ${chickens} ; y = ${dogs} } → Có ${dogs} con chó.`, ex()
          );
        }
        if (tier === 'medium') {
          // Boat upstream / downstream system
          const vBoat = rInt(18, 28), vCur = rInt(2, 5), tDown = 2, tUp = 3;
          const sDown = (vBoat + vCur) * tDown, sUp = (vBoat - vCur) * tUp, totalS = sDown + sUp;
          return makeExtQ(
            t(`Ca nô xuôi dòng ${tDown} giờ và ngược dòng ${tUp} giờ đi được ${totalS} km. Biết vận tốc dòng nước là ${vCur} km/h, tính vận tốc riêng của ca nô khi nước yên lặng (km/h)?`, `Boat goes ${tDown}h downstream and ${tUp}h upstream covering ${totalS} km; current is ${vCur} km/h. Still-water speed (km/h) = ?`),
            vBoat, [vBoat + vCur, vBoat - vCur, vBoat + 2], 'word:system', cfg,
            `Gọi vận tốc riêng của ca nô là x (km/h, x > ${vCur}):\n• Vận tốc xuôi dòng: x + ${vCur}; ngược dòng: x − ${vCur}.\n• PT: ${tDown}(x + ${vCur}) + ${tUp}(x − ${vCur}) = ${totalS} ⇔ ${tDown + tUp}x = ${totalS - tDown * vCur + tUp * vCur} ⇔ x = ${vBoat} (km/h).`, ex()
          );
        }
        // Two teams exceeding quota by % (signature Grade 10 entrance problem!)
        const t1 = pickAny([200, 300, 400]), t2 = pickAny([300, 400, 500]), planSum = t1 + t2;
        const p1 = 15, p2 = 20, extraSum = (t1 * p1 + t2 * p2) / 100, realSum = planSum + extraSum;
        return makeExtQ(
          t(`Hai tổ sản xuất theo kế hoạch phải làm ${planSum} sản phẩm. Thực tế tổ I vượt mức ${p1}%, tổ II vượt mức ${p2}% nên cả hai tổ làm được ${realSum} sản phẩm. Theo kế hoạch tổ I phải làm bao nhiêu sản phẩm?`, `Two teams planned ${planSum} items. Team I exceeded by ${p1}%, Team II by ${p2}%, producing ${realSum} total. Planned items for Team I = ?`),
          t1, [t2, Math.round(t1 * 1.15), t1 + 50], 'word:system', cfg,
          `Bài giải lập hệ phương trình (câu tự luận thi vào 10):\n• Gọi kế hoạch của tổ I, II là x, y (sản phẩm).\n• Hệ PT: { x + y = ${planSum} ; 0,15x + 0,20y = ${realSum - planSum} }\n• Giải hệ được: x = ${t1}, y = ${t2} → Tổ I theo kế hoạch làm ${t1} sản phẩm.`, ex()
        );
      }
      case 'g9_real_10': {
        if (tier === 'easy') {
          const totalN = pickAny([40, 50, 80, 100]), freq = rInt(6, Math.floor(totalN * 0.45));
          const relFreq = fmtDec((freq / totalN) * 100);
          return makeExtQ(
            t(`Khảo sát điểm thi của ${totalN} học sinh thấy có ${freq} em đạt điểm 9. Tần số tương đối của điểm 9 là bao nhiêu phần trăm (%)?`, `In ${totalN} scores, ${freq} students got a 9. Relative frequency (%) = ?`),
            relFreq, [fmtDec(freq), fmtDec(100 - (freq / totalN) * 100), fmtDec((freq / totalN) * 100 + 5)], 'stat:freq', cfg,
            `Công thức tần số tương đối: f = (n / N) · 100% = (${freq} / ${totalN}) · 100% = ${relFreq}%.`, ex()
          );
        }
        if (tier === 'medium') {
          // Compound interest over 2 years
          const cap = 100, rate = 10, after2 = 121;
          const pCap = pickAny([100, 200, 500]), r = pickAny([10, 5]);
          const finalAmt = fmtDec(pCap * ((1 + r / 100) ** 2));
          return makeExtQ(
            t(`Bác Lan gửi ${pCap} triệu đồng tiết kiệm lãi kép kỳ hạn 1 năm với lãi suất ${r}%/năm (lãi năm trước gộp vào gốc năm sau). Sau 2 năm bác nhận được cả gốc và lãi bao nhiêu triệu đồng?`, `Compound interest: ${pCap}M VND at ${r}%/year compounded annually for 2 years. Total amount (M VND) = ?`),
            finalAmt, [fmtDec(pCap * (1 + (2 * r) / 100)), fmtDec(pCap * (r / 100) * 2), fmtDec(Number(finalAmt.replace(',', '.')) + 2)], 'word:real', cfg,
            `Công thức lãi kép sau n năm T = A · (1 + r)^n:\nT = ${pCap} · (1 + ${fmtDec(r / 100)})² = ${finalAmt} (triệu đồng).`, ex()
          );
        }
        // Quadratic revenue optimization (classic modern Grade-10 entrance problem!)
        // Base price p0 = 200k, sells q0 = 40 tickets. Every 10k increase loses 1 ticket -> R(x) = (200 + 10x)(40 - x) = -10(x - 10)^2 + 9000 -> optimal price = 300k!
        const scenarios = [
          { p0: 200, q0: 40, stepP: 10, xOpt: 10, optPrice: 300 },
          { p0: 100, q0: 30, stepP: 10, xOpt: 10, optPrice: 200 },
          { p0: 300, q0: 50, stepP: 10, xOpt: 10, optPrice: 400 }
        ];
        const sc = pickAny(scenarios);
        return makeExtQ(
          t(`Một rạp kịch bán vé giá ${sc.p0} nghìn đồng thì có ${sc.q0} khách mua. Cứ tăng giá vé thêm ${sc.stepP} nghìn đồng thì giảm mất 1 khách. Hỏi nên đặt giá vé bao nhiêu nghìn đồng để doanh thu lớn nhất?`, `At ${sc.p0}k/ticket, ${sc.q0} tickets sell; each +${sc.stepP}k increase loses 1 buyer. Optimal ticket price (k VND) for max revenue = ?`),
          sc.optPrice, [sc.p0 + 50, sc.optPrice + 50, sc.optPrice - 20], 'word:opt', cfg,
          `Bài toán tối ưu thực tế thi vào 10:\n• Gọi x là số lần tăng ${sc.stepP} nghìn → Giá vé: ${sc.p0} + 10x; Số khách: ${sc.q0} − x.\n• Doanh thu R = (${sc.p0} + 10x)(${sc.q0} − x) = −10(x − ${sc.xOpt})² + ${(sc.p0 + 10 * sc.xOpt) * (sc.q0 - sc.xOpt)}.\n• R đạt GTLN khi x = ${sc.xOpt} ⇒ Giá vé tối ưu là ${sc.p0} + 10·${sc.xOpt} = ${sc.optPrice} (nghìn đồng).`, ex()
        );
      }

      // ==================== GRADE 9: HÌNH HỌC ====================
      case 'g9_geom_trig': {
        if (tier === 'easy') {
          const bank = [
            { q: t('Trong tam giác vuông, tỉ số sin 30° có giá trị bằng bao nhiêu?', 'What is the exact value of sin 30°?'), a: '1/2', near: ['3/2', '5/2', '7/2'], exp: 'Góc đặc biệt: sin 30° = cos 60° = 1/2 = 0,5.' },
            { q: t('Tính giá trị biểu thức: sin^2(37°) + cos^2(37°)', 'Evaluate: sin^2(37°) + cos^2(37°)'), a: 1, near: [0, 2, 3], exp: 'Hệ thức cơ bản với mọi góc nhọn α: sin²α + cos²α = 1.' },
            { q: t('Giá trị của tan 45° bằng bao nhiêu?', 'What is the value of tan 45°?'), a: 1, near: [0, 2, 3], exp: 'Tam giác vuông cân có hai cạnh góc vuông bằng nhau nên tan 45° = cot 45° = 1.' }
          ];
          const it = pickAny(bank);
          return makeExtQ(it.q, it.a, it.near, 'geom:trig', cfg, it.exp, ex({ domain: 'geometry' }));
        }
        if (tier === 'medium') {
          // Altitude in right triangle: AH^2 = BH * CH or AB = BC * sin C
          const pairs = [[4, 9, 6], [9, 16, 12], [2, 8, 4], [3, 12, 6]];
          const [bh, ch, ah] = pickAny(pairs);
          return makeExtQ(
            t(`Tam giác ABC vuông tại A, đường cao AH chia cạnh huyền thành BH = ${bh} cm, CH = ${ch} cm. Tính độ dài đường cao AH (cm)?`, `Right △ABC at A has altitude AH with BH = ${bh} cm, CH = ${ch} cm. Find AH (cm)`),
            ah, [bh + ch, Math.round((bh + ch) / 2), ah + 2], 'geom:trig', cfg,
            `Hệ thức lượng trong tam giác vuông (hoặc △ABH ~ △CAH):\nAH² = BH · CH = ${bh} · ${ch} = ${bh * ch} ⇒ AH = ${ah} (cm).`, ex({ domain: 'geometry', visualKind: 'right_tri', visualData: { a: bh, b: ch, c: ah } })
          );
        }
        // Practical angle of elevation (45 degrees or sin 30 degrees)
        const shadow = rInt(12, 35), eyeH = fmtDec(1.5), totalH = fmtDec(shadow + 1.5);
        return makeExtQ(
          t(`Một học sinh đặt giác kế cao 1,5 m cách chân tháp truyền hình ${shadow} m, ngắm thấy đỉnh tháp dưới góc nâng 45° so với phương ngang. Tính chiều cao của tháp (m)?`, `A theodolite 1.5 m high placed ${shadow} m from a tower measures a 45° elevation angle to the top. Tower height (m) = ?`),
          totalH, [fmtDec(shadow), fmtDec(shadow - 1.5), fmtDec(shadow + 2.5)], 'geom:trig', cfg,
          `• Phần tháp cao hơn giác kế là: ${shadow} · tan 45° = ${shadow} · 1 = ${shadow} (m).\n• Chiều cao toàn bộ tháp (cộng chiều cao giác kế): ${shadow} + 1,5 = ${totalH} (m).`, ex({ domain: 'geometry', visualKind: 'right_tri', visualData: { a: shadow, b: shadow, c: '' } })
        );
      }
      case 'g9_geom_chord': {
        const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]];
        const [d, halfChord, R] = pickAny(triples);
        if (tier === 'easy') {
          const chord = 2 * halfChord;
          return makeExtQ(
            t(`Trong đường tròn (O; ${R} cm), dây cung AB = ${chord} cm. Tính khoảng cách từ tâm O đến dây AB (cm)?`, `In circle (O; ${R} cm), chord AB = ${chord} cm. Distance from O to chord AB (cm) = ?`),
            d, [halfChord, R - d, d + 2], 'geom:circle', cfg,
            `Kẻ OH ⊥ AB tại H ⇒ H là trung điểm AB nên AH = ${chord}/2 = ${halfChord} (cm).\nÁp dụng Pythagore trong △OHA vuông: OH = √(${R}² − ${halfChord}²) = ${d} (cm).`, ex({ domain: 'geometry', visualKind: 'circle', visualData: { R, chord } })
          );
        }
        if (tier === 'medium') {
          // Two tangents from M: R = d, MA = halfChord, MO = R -> let's use radius = d, tangent = halfChord * 2? No: R^2 + MA^2 = MO^2!
          return makeExtQ(
            t(`Từ điểm M nằm ngoài đường tròn (O; ${d} cm) sao cho OM = ${R} cm, kẻ tiếp tuyến MA tới đường tròn (A là tiếp điểm). Tính độ dài đoạn tiếp tuyến MA (cm)?`, `From M with OM = ${R} cm, tangent MA is drawn to circle (O; ${d} cm). Length MA (cm) = ?`),
            halfChord, [R - d, R + d, halfChord + 2], 'geom:circle', cfg,
            `Vì MA là tiếp tuyến tại A nên OA ⊥ MA (△OAM vuông tại A):\nMA = √(OM² − OA²) = √(${R}² − ${d}²) = ${halfChord} (cm).`, ex({ domain: 'geometry', visualKind: 'circle', visualData: { R: d } })
          );
        }
        // Classic tangent perimeter invariant: Perimeter of △MPQ formed by 3rd tangent = 2 * MA!
        const ma = rInt(8, 22), perim = 2 * ma;
        return makeExtQ(
          t(`Từ điểm M ngoài (O), kẻ hai tiếp tuyến MA, MB (MA = ${ma} cm). Trên cung nhỏ AB lấy điểm C và kẻ tiếp tuyến thứ ba cắt MA, MB lần lượt tại P và Q. Tính chu vi tam giác MPQ (cm)?`, `Tangents MA = MB = ${ma} cm from M to (O). A third tangent at C on minor arc AB cuts MA, MB at P, Q. Perimeter of △MPQ (cm) = ?`),
          perim, [ma, 3 * ma, perim + 4], 'geom:circle', cfg,
          `Tính chất hai tiếp tuyến cắt nhau: PC = PA và QC = QB.\nChu vi △MPQ = MP + PQ + QM = (MP + PA) + (QB + QM) = MA + MB = 2 · ${ma} = ${perim} (cm).`, ex({ domain: 'geometry', visualKind: 'circle', visualData: { R: ma } })
        );
      }
      case 'g9_geom_angle': {
        if (tier === 'easy') {
          const inAngle = rInt(22, 72), central = inAngle * 2;
          return makeExtQ(
            t(`Trong một đường tròn, góc nội tiếp chắn cung AB có số đo bằng ${inAngle}°. Góc ở tâm chắn cùng cung AB đó bằng bao nhiêu độ?`, `An inscribed angle intercepting arc AB is ${inAngle}°. Central angle on arc AB = ?°`),
            central, [inAngle, Math.round(inAngle / 2), 180 - inAngle], 'geom:circle', cfg,
            `Trong một đường tròn, số đo góc ở tâm gấp đôi số đo góc nội tiếp cùng chắn một cung:\n∠AOB = 2 · ${inAngle}° = ${central}°.`, ex({ domain: 'geometry', visualKind: 'circle', visualData: { R: '' } })
          );
        }
        if (tier === 'medium') {
          const angA = rInt(62, 128), angC = 180 - angA;
          return makeExtQ(
            t(`Tứ giác ABCD nội tiếp đường tròn (O) có góc A = ${angA}°. Tính số đo góc đối diện C (độ)?`, `Cyclic quadrilateral ABCD has ∠A = ${angA}°. Opposite angle ∠C = ?°`),
            angC, [angA, Math.abs(90 - angA) || 30, angC + 10], 'geom:circle', cfg,
            `Tổng hai góc đối diện của tứ giác nội tiếp luôn bằng 180°:\n∠C = 180° − ${angA}° = ${angC}°.`, ex({ domain: 'geometry', visualKind: 'circle', visualData: { R: '' } })
          );
        }
        // Circumradius of right triangle = hypotenuse / 2
        const [a, b, c] = pickAny([[6, 8, 10], [5, 12, 13], [8, 15, 17], [12, 16, 20]]);
        const R = fmtDec(c / 2);
        return makeExtQ(
          t(`Tam giác ABC vuông tại A có AB = ${a} cm, AC = ${b} cm. Tính bán kính R của đường tròn ngoại tiếp tam giác ABC (cm)?`, `Right △ABC at A has legs ${a} cm and ${b} cm. Circumradius R (cm) = ?`),
          R, [fmtDec(c), fmtDec((a + b - c) / 2), fmtDec(c / 2 + 2)], 'geom:circle', cfg,
          `• Cạnh huyền BC = √(${a}² + ${b}²) = ${c} (cm).\n• Tâm đường tròn ngoại tiếp tam giác vuông là trung điểm cạnh huyền ⇒ R = BC / 2 = ${c} / 2 = ${R} (cm).`, ex({ domain: 'geometry', visualKind: 'right_tri', visualData: { a, b, c } })
        );
      }
      case 'g9_geom_arc': {
        if (tier === 'easy') {
          const r = pickAny([5, 10]), deg = pickAny([90, 180]), arc = fmtDec((3.14 * r * deg) / 180);
          return makeExtQ(
            t(`Tính độ dài cung ${deg}° của đường tròn bán kính R = ${r} cm (lấy π ≈ 3,14)?`, `Find length of a ${deg}° arc in a circle of radius ${r} cm (π ≈ 3.14)`),
            arc, [fmtDec(2 * 3.14 * r), fmtDec((3.14 * r * r * deg) / 360), fmtDec(Number(arc.replace(',', '.')) + 2)], 'geom:circle', cfg,
            `Công thức độ dài cung tròn: l = (π · R · n) / 180 = (3,14 · ${r} · ${deg}) / 180 = ${arc} (cm).`, ex({ domain: 'geometry', visualKind: 'circle', visualData: { R: r } })
          );
        }
        if (tier === 'medium') {
          const r = pickAny([6, 10]), deg = pickAny([60, 90, 120]);
          // If r=6, deg=60 -> pi * 36 * 60 / 360 = 6 * 3.14 = 18,84; r=6, deg=120 -> 12 * 3.14 = 37,68; r=10, deg=90 -> 25 * 3.14 = 78,5
          const sSector = fmtDec((3.14 * r * r * deg) / 360);
          return makeExtQ(
            t(`Tính diện tích hình quạt tròn bán kính R = ${r} cm ứng với cung ${deg}° (lấy π ≈ 3,14, đơn vị cm²)?`, `Area of circular sector with R = ${r} cm and angle ${deg}° (π ≈ 3.14, cm²) = ?`),
            sSector, [fmtDec(3.14 * r * r), fmtDec((2 * 3.14 * r * deg) / 360), fmtDec(Number(sSector.replace(',', '.')) + 10)], 'geom:circle', cfg,
            `Diện tích hình quạt tròn: S_q = (π · R² · n) / 360 = (3,14 · ${r}² · ${deg}) / 360 = ${sSector} (cm²).`, ex({ domain: 'geometry', visualKind: 'circle', visualData: { R: r } })
          );
        }
        // Annulus (hình vành khuyên) S = pi * (R^2 - r^2) with R^2 - r^2 = 100 or 25 or 50!
        const [bigR, smallR] = pickAny([[10, 6], [5, 3], [13, 12], [10, 8]]); // 64, 16, 25, 36
        const diffSq = bigR * bigR - smallR * smallR, areaAnn = fmtDec(3.14 * diffSq);
        return makeExtQ(
          t(`Tính diện tích hình vành khuyên giới hạn bởi hai đường tròn đồng tâm có bán kính R = ${bigR} cm và r = ${smallR} cm (lấy π ≈ 3,14, đơn vị cm²)?`, `Area of annulus between concentric circles R = ${bigR} cm and r = ${smallR} cm (π ≈ 3.14) = ?`),
          areaAnn, [fmtDec(3.14 * (bigR - smallR) ** 2), fmtDec(3.14 * bigR * bigR), fmtDec(Number(areaAnn.replace(',', '.')) + 10)], 'geom:circle', cfg,
          `Công thức diện tích hình vành khuyên:\nS = π · (R² − r²) ≈ 3,14 · (${bigR}² − ${smallR}²) = 3,14 · ${diffSq} = ${areaAnn} (cm²).`, ex({ domain: 'geometry', visualKind: 'circle', visualData: { R: bigR } })
        );
      }
      case 'g9_geom_solid': {
        if (tier === 'easy') {
          const [r, h, l] = pickAny([[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
          return makeExtQ(
            t(`Hình nón có bán kính đáy r = ${r} cm và chiều cao h = ${h} cm. Tính độ dài đường sinh l của hình nón (cm)?`, `A cone has base radius r = ${r} cm and height h = ${h} cm. Slant height l (cm) = ?`),
            l, [r + h, l + 2, Math.max(2, l - 2)], 'geom:solid', cfg,
            `Đường sinh, bán kính đáy và chiều cao tạo thành tam giác vuông:\nl = √(r² + h²) = √(${r}² + ${h}²) = ${l} (cm).`, ex({ domain: 'geometry' })
          );
        }
        if (tier === 'medium') {
          const r = 5, h = pickAny([8, 10, 12]), vol = fmtDec(3.14 * r * r * h);
          return makeExtQ(
            t(`Một hộp sữa hình trụ có bán kính đáy r = ${r} cm và chiều cao h = ${h} cm. Tính thể tích hộp sữa (lấy π ≈ 3,14, đơn vị cm³)?`, `A cylindrical milk can has r = ${r} cm and h = ${h} cm. Volume (π ≈ 3.14, cm³) = ?`),
            vol, [fmtDec(2 * 3.14 * r * h), fmtDec((3.14 * r * r * h) / 3), fmtDec(Number(vol.replace(',', '.')) + 50)], 'geom:solid', cfg,
            `Thể tích hình trụ: V = π · r² · h ≈ 3,14 · ${r}² · ${h} = ${vol} (cm³).`, ex({ domain: 'geometry' })
          );
        }
        // Surface area of sphere or ratio of cylinder vs cone volume
        const rSphere = pickAny([3, 5, 8, 10]), sSphere = fmtDec(4 * 3.14 * rSphere * rSphere);
        return makeExtQ(
          t(`Một quả bóng đá hình cầu có bán kính R = ${rSphere} cm. Tính diện tích mặt cầu của quả bóng (lấy π ≈ 3,14, đơn vị cm²)?`, `A spherical ball has radius R = ${rSphere} cm. Surface area (π ≈ 3.14, cm²) = ?`),
          sSphere, [fmtDec(3.14 * rSphere * rSphere), fmtDec(2 * 3.14 * rSphere * rSphere), fmtDec(Number(sSphere.replace(',', '.')) + 100)], 'geom:solid', cfg,
          `Công thức diện tích mặt cầu: S = 4πR² ≈ 4 · 3,14 · ${rSphere}² = ${sSphere} (cm²).`, ex({ domain: 'geometry' })
        );
      }
      default:
        return null;
    }
  }

  const exp = {
    EXTRA_PRIMARY_TOPICS,
    SECONDARY_GRADE_TOPICS,
    generateExtendedTopicQuestion,
    resolveTier,
    difficultyBadgeLabel
  };
  if (typeof window !== 'undefined') window.NUMI_CURRICULUM_EXT = exp;
  if (typeof global !== 'undefined') global.NUMI_CURRICULUM_EXT = exp;
})();
