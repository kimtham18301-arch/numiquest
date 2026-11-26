// Comprehensive MOET GDPT 2018 Mathematical Knowledge Encyclopedia & Formula Sheets (Grades 1–9)
// Full 3-Strand Coverage: (1) Số & Đại số · (2) Hình học & Đo lường (with SVG diagrams) · (3) Thống kê, Xác suất & Thực tế
// Includes Instant Search, 1-Tap Topic Practice Jump & Printable A4 Formula Sheet (v2.15.1)
(() => {
  'use strict';

  // Inline compact geometry reference SVGs displayed directly inside Geometry study cards
  const GRADE_GEOM_DIAGRAMS = {
    1: `<div class="kh-svg-strip">
      <svg viewBox="0 0 360 72" class="kh-ref-svg" role="img" aria-label="Hình phẳng cơ bản Lớp 1">
        <rect x="14" y="12" width="44" height="44" fill="#eefaf3" stroke="#1f6a47" stroke-width="2"/>
        <text x="36" y="68" font-size="10" font-weight="800" text-anchor="middle" fill="#1e4631">Hình vuông</text>
        <polygon points="105,12 78,56 132,56" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <text x="105" y="68" font-size="10" font-weight="800" text-anchor="middle" fill="#1e3a8a">Tam giác</text>
        <rect x="154" y="18" width="66" height="38" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
        <text x="187" y="68" font-size="10" font-weight="800" text-anchor="middle" fill="#92400e">Hình chữ nhật</text>
        <circle cx="264" cy="34" r="22" fill="#fce7f3" stroke="#be185d" stroke-width="2"/>
        <text x="264" y="68" font-size="10" font-weight="800" text-anchor="middle" fill="#9d174d">Hình tròn</text>
        <rect x="308" y="20" width="32" height="32" fill="#e0f2fe" stroke="#0369a1" stroke-width="1.8"/>
        <polygon points="308,20 318,10 350,10 340,20" fill="#bae6fd" stroke="#0369a1" stroke-width="1.6"/>
        <polygon points="340,20 350,10 350,42 340,52" fill="#7dd3fc" stroke="#0369a1" stroke-width="1.6"/>
        <text x="328" y="68" font-size="10" font-weight="800" text-anchor="middle" fill="#0c4a6e">Lập phương</text>
      </svg>
    </div>`,
    3: `<div class="kh-svg-strip">
      <svg viewBox="0 0 360 76" class="kh-ref-svg" role="img" aria-label="Trung điểm, HCN và Hình tròn Lớp 3">
        <line x1="16" y1="34" x2="112" y2="34" stroke="#1f6a47" stroke-width="2.4"/>
        <circle cx="16" cy="34" r="3.5" fill="#1f6a47"/><circle cx="64" cy="34" r="4" fill="#d97706"/><circle cx="112" cy="34" r="3.5" fill="#1f6a47"/>
        <text x="16" y="24" font-size="10" font-weight="800" text-anchor="middle" fill="#1f6a47">A</text>
        <text x="64" y="24" font-size="10" font-weight="800" text-anchor="middle" fill="#b45309">M (trung điểm)</text>
        <text x="112" y="24" font-size="10" font-weight="800" text-anchor="middle" fill="#1f6a47">B</text>
        <text x="64" y="54" font-size="9.5" font-weight="700" text-anchor="middle" fill="#374151">AM = MB = AB ÷ 2</text>
        <rect x="142" y="14" width="76" height="42" fill="#eefaf3" stroke="#1f6a47" stroke-width="2"/>
        <text x="180" y="38" font-size="10" font-weight="800" text-anchor="middle" fill="#1f6a47">S = a × b</text>
        <text x="180" y="69" font-size="9.5" font-weight="700" text-anchor="middle" fill="#374151">P = (a + b) × 2</text>
        <circle cx="292" cy="35" r="23" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="269" y1="35" x2="315" y2="35" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="3 2"/>
        <circle cx="292" cy="35" r="3" fill="#dc2626"/>
        <text x="292" y="31" font-size="9.5" font-weight="800" text-anchor="middle" fill="#dc2626">O (d = 2r)</text>
      </svg>
    </div>`,
    4: `<div class="kh-svg-strip">
      <svg viewBox="0 0 360 78" class="kh-ref-svg" role="img" aria-label="Hình bình hành, Hình thoi và các loại góc Lớp 4">
        <polygon points="28,54 48,16 128,16 108,54" fill="#eefaf3" stroke="#1f6a47" stroke-width="2"/>
        <line x1="48" y1="16" x2="48" y2="54" stroke="#d97706" stroke-width="1.6" stroke-dasharray="3 2"/>
        <text x="78" y="69" font-size="9.5" font-weight="800" text-anchor="middle" fill="#1f6a47">Bình hành: S = a × h</text>
        <polygon points="190,12 232,35 190,58 148,35" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="148" y1="35" x2="232" y2="35" stroke="#dc2626" stroke-width="1.4" stroke-dasharray="3 2"/>
        <line x1="190" y1="12" x2="190" y2="58" stroke="#16a34a" stroke-width="1.4" stroke-dasharray="3 2"/>
        <text x="190" y="70" font-size="9.5" font-weight="800" text-anchor="middle" fill="#1e3a8a">Thoi: S = (m × n) ÷ 2</text>
        <line x1="268" y1="54" x2="342" y2="54" stroke="#374151" stroke-width="2"/>
        <line x1="268" y1="54" x2="268" y2="16" stroke="#dc2626" stroke-width="2"/>
        <line x1="268" y1="54" x2="322" y2="20" stroke="#2563eb" stroke-width="1.8"/>
        <rect x="268" y="45" width="9" height="9" fill="none" stroke="#dc2626" stroke-width="1.5"/>
        <text x="306" y="70" font-size="9.5" font-weight="800" text-anchor="middle" fill="#374151">Nhọn &lt; 90° = Vuông &lt; Tù</text>
      </svg>
    </div>`,
    5: `<div class="kh-svg-strip">
      <svg viewBox="0 0 360 80" class="kh-ref-svg" role="img" aria-label="Tam giác, Hình thang, Hình tròn & Hình hộp Lớp 5">
        <polygon points="16,58 52,14 92,58" fill="#eefaf3" stroke="#1f6a47" stroke-width="2"/>
        <line x1="52" y1="14" x2="52" y2="58" stroke="#d97706" stroke-width="1.6" stroke-dasharray="3 2"/>
        <text x="54" y="72" font-size="9.5" font-weight="800" text-anchor="middle" fill="#1f6a47">S = a×h ÷ 2</text>
        <polygon points="126,18 174,18 192,58 108,58" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="126" y1="18" x2="126" y2="58" stroke="#d97706" stroke-width="1.6" stroke-dasharray="3 2"/>
        <text x="150" y="72" font-size="9.5" font-weight="800" text-anchor="middle" fill="#1e3a8a">S = (a+b)×h ÷ 2</text>
        <circle cx="238" cy="38" r="21" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
        <line x1="238" y1="38" x2="259" y2="38" stroke="#dc2626" stroke-width="1.8"/>
        <text x="238" y="72" font-size="9.5" font-weight="800" text-anchor="middle" fill="#92400e">S = r×r×3,14</text>
        <rect x="286" y="24" width="46" height="32" fill="#e0f2fe" stroke="#0369a1" stroke-width="1.8"/>
        <polygon points="286,24 298,13 344,13 332,24" fill="#bae6fd" stroke="#0369a1" stroke-width="1.6"/>
        <polygon points="332,24 344,13 344,45 332,56" fill="#7dd3fc" stroke="#0369a1" stroke-width="1.6"/>
        <text x="315" y="72" font-size="9.5" font-weight="800" text-anchor="middle" fill="#0c4a6e">V = a × b × c</text>
      </svg>
    </div>`,
    7: `<div class="kh-svg-strip">
      <svg viewBox="0 0 360 84" class="kh-ref-svg" role="img" aria-label="Song song, Tam giác & Trọng tâm G Lớp 7">
        <line x1="14" y1="24" x2="112" y2="24" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="14" y1="56" x2="112" y2="56" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="38" y1="10" x2="88" y2="70" stroke="#dc2626" stroke-width="1.8"/>
        <text x="63" y="79" font-size="9.5" font-weight="800" text-anchor="middle" fill="#1e3a8a">a // b: So le &amp; đồng vị =</text>
        <polygon points="142,62 182,12 226,62" fill="#eefaf3" stroke="#1f6a47" stroke-width="2"/>
        <line x1="182" y1="12" x2="184" y2="62" stroke="#d97706" stroke-width="1.6" stroke-dasharray="3 2"/>
        <circle cx="183" cy="45" r="3.2" fill="#dc2626"/>
        <text x="193" y="47" font-size="9.5" font-weight="800" fill="#dc2626">G</text>
        <text x="184" y="79" font-size="9.5" font-weight="800" text-anchor="middle" fill="#1f6a47">Trọng tâm AG = 2/3 AM</text>
        <polygon points="266,22 296,10 326,22 296,34" fill="#bae6fd" stroke="#0369a1" stroke-width="1.6"/>
        <line x1="266" y1="22" x2="266" y2="56" stroke="#0369a1" stroke-width="1.8"/>
        <line x1="296" y1="34" x2="296" y2="66" stroke="#0369a1" stroke-width="1.8"/>
        <line x1="326" y1="22" x2="326" y2="56" stroke="#0369a1" stroke-width="1.8"/>
        <polyline points="266,56 296,66 326,56" fill="none" stroke="#0369a1" stroke-width="1.8"/>
        <text x="296" y="79" font-size="9.5" font-weight="800" text-anchor="middle" fill="#0c4a6e">Lăng trụ: V = S_đáy · h</text>
      </svg>
    </div>`,
    8: `<div class="kh-svg-strip">
      <svg viewBox="0 0 360 88" class="kh-ref-svg" role="img" aria-label="Pythagore, Định lý Thalès và Hình chóp đều Lớp 8">
        <polygon points="18,64 18,16 92,64" fill="#eefaf3" stroke="#1f6a47" stroke-width="2.1"/>
        <rect x="18" y="55" width="9" height="9" fill="none" stroke="#d97706" stroke-width="1.6"/>
        <text x="11" y="42" font-size="9.5" font-weight="800" fill="#1f6a47">a</text>
        <text x="54" y="75" font-size="9.5" font-weight="800" fill="#1f6a47">b</text>
        <text x="60" y="36" font-size="9.5" font-weight="800" fill="#dc2626">c² = a²+b²</text>
        <polygon points="130,64 174,12 218,64" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="150" y1="38" x2="198" y2="38" stroke="#dc2626" stroke-width="2"/>
        <text x="174" y="10" font-size="9" font-weight="800" text-anchor="middle" fill="#1e3a8a">A</text>
        <text x="141" y="40" font-size="9" font-weight="800" fill="#dc2626">D</text>
        <text x="202" y="40" font-size="9" font-weight="800" fill="#dc2626">E</text>
        <text x="174" y="78" font-size="9.5" font-weight="800" text-anchor="middle" fill="#1e3a8a">DE // BC ⇒ AD/AB = DE/BC</text>
        <polygon points="298,10 258,58 310,66 340,50" fill="rgba(14,165,233,0.12)" stroke="#0369a1" stroke-width="1.8"/>
        <line x1="298" y1="10" x2="310" y2="66" stroke="#0369a1" stroke-width="1.6"/>
        <line x1="298" y1="10" x2="298" y2="55" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="3 2"/>
        <text x="303" y="40" font-size="9" font-weight="800" fill="#dc2626">h</text>
        <text x="300" y="79" font-size="9.5" font-weight="800" text-anchor="middle" fill="#0c4a6e">Chóp đều: V = 1/3·S·h</text>
      </svg>
    </div>`,
    9: `<div class="kh-svg-strip">
      <svg viewBox="0 0 360 88" class="kh-ref-svg" role="img" aria-label="Lượng giác, Đường tròn góc nội tiếp và Hình nón cầu Lớp 9">
        <polygon points="16,64 16,18 92,64" fill="#eefaf3" stroke="#1f6a47" stroke-width="2"/>
        <line x1="16" y1="64" x2="40" y2="33" stroke="#d97706" stroke-width="1.6" stroke-dasharray="3 2"/>
        <text x="54" y="78" font-size="9.5" font-weight="800" text-anchor="middle" fill="#1f6a47">sin = đối/huyền · h²=b'c'</text>
        <circle cx="176" cy="40" r="27" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <polygon points="154,55 176,13 198,55" fill="rgba(37,99,235,0.09)" stroke="#2563eb" stroke-width="1.6"/>
        <circle cx="176" cy="40" r="2.6" fill="#dc2626"/>
        <text x="176" y="78" font-size="9.5" font-weight="800" text-anchor="middle" fill="#1e3a8a">Góc nội tiếp = 1/2 sđ cung</text>
        <polygon points="274,14 250,58 298,58" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/>
        <ellipse cx="274" cy="58" rx="24" ry="6" fill="#fde68a" stroke="#b45309" stroke-width="1.6"/>
        <circle cx="332" cy="38" r="20" fill="#e0f2fe" stroke="#0369a1" stroke-width="1.8"/>
        <ellipse cx="332" cy="38" rx="20" ry="6" fill="none" stroke="#0369a1" stroke-width="1.3" stroke-dasharray="3 2"/>
        <text x="300" y="78" font-size="9.5" font-weight="800" text-anchor="middle" fill="#0c4a6e">Nón V=⅓πr²h · Cầu V=4/3πR³</text>
      </svg>
    </div>`
  };

  const NUMI_KNOWLEDGE_BANK = {
    // =========================================================================
    // LỚP 1 (GDPT 2018 — đủ 3 mạch)
    // =========================================================================
    1: {
      level: 'primary',
      summaryVi: 'Chuẩn GDPT 2018 Lớp 1: Số tự nhiên từ 0 đến 100 (chục – đơn vị), cộng trừ KHÔNG NHỚ trong phạm vi 10, 20, 100; nhận biết hình phẳng – khối cơ bản, đo độ dài cm, xem giờ đúng & lịch tuần.',
      sections: [
        {
          domain: 'number',
          titleVi: 'Số học & Phép tính Lớp 1',
          items: [
            { tag: 'Cặp tách – gộp PV 10', topicId: 'g1_within10', body: '• Thuộc lòng <b>các cặp bạn thân gộp tròn 10</b>: 1 + 9 = 10; 2 + 8 = 10; 3 + 7 = 10; 4 + 6 = 10; 5 + 5 = 10.<br>• Quan hệ cộng – trừ ngược nhau: Nếu 3 + 6 = 9 thì 9 − 3 = 6 và 9 − 6 = 3. Số nào cộng/trừ với <b>0</b> cũng bằng chính số đó.' },
            { tag: 'Cấu tạo số 2 chữ số (≤ 100)', topicId: 'g1_place_cmp', body: '• Số có 2 chữ số <span class="kh-formula">ab = a chục + b đơn vị = a0 + b</span> (VD: 58 = 5 chục + 8 đơn vị = 50 + 8).<br>• Các mốc số cần nhớ: Số bé nhất có 1 chữ số là <b>0</b>, lớn nhất có 1 chữ số là <b>9</b>; bé nhất có 2 chữ số là <b>10</b>, bé nhất có 2 chữ số giống nhau là <b>11</b>, lớn nhất có 2 chữ số là <b>99</b>.' },
            { tag: 'Số liền trước – sau & So sánh', topicId: 'g1_number_sense', body: '• <b>Số liền trước</b> của a là <b>a − 1</b>; <b>số liền sau</b> của a là <b>a + 1</b> (VD: liền trước 40 là 39, liền sau 40 là 41).<br>• <b>So sánh 2 số:</b> Số có nhiều chữ số hơn thì lớn hơn (100 > 99). Cùng 2 chữ số: so sánh <b>hàng chục trước</b>; nếu hàng chục bằng nhau mới so sánh <b>hàng đơn vị</b>.' },
            { tag: 'Cộng, trừ các số tròn chục', topicId: 'g1_round10', body: '• Các số tròn chục: 10, 20, 30, 40, 50, 60, 70, 80, 90 (tận cùng là chữ số 0).<br>• Nhẩm theo chục: 40 + 30 = 4 chục + 3 chục = 7 chục = <b>70</b>; 80 − 50 = 3 chục = <b>30</b>.' },
            { tag: 'Đặt tính PV 100 (không nhớ)', topicId: 'g1_col100', body: '• <b>Bước 1 (Đặt tính):</b> Viết hàng đơn vị thẳng cột hàng đơn vị, hàng chục thẳng cột hàng chục.<br>• <b>Bước 2 (Tính từ phải sang trái):</b> Cộng/trừ hàng đơn vị trước, viết kết quả thẳng cột; sau đó cộng/trừ hàng chục (VD: 43 + 25 = 68; 79 − 34 = 45).' },
            { tag: 'Điền số vào ô trống (?)', topicId: 'g1_missing', body: '• Dạng <b>a + ? = c</b> hoặc <b>? + b = c</b>: Đếm thêm từ số đã biết đến tổng, hoặc lấy tổng bớt đi số hạng kia (VD: 23 + ? = 28 ⇒ ? = 28 − 23 = 5).<br>• Dạng <b>a − ? = c</b>: Lấy số đầu trừ đi kết quả còn lại (VD: 19 − ? = 12 ⇒ ? = 7).' },
            { tag: 'Quy luật dãy số & Biểu thức 2 bước', topicId: 'g1_seq_split', body: '• Dãy đếm thêm 2 (chẵn/lẻ): 2, 4, 6, 8, 10... hoặc 1, 3, 5, 7, 9...; dãy đếm cách 5: 5, 10, 15, 20...<br>• <b>Biểu thức 2 phép tính (+, −):</b> Luôn tính lần lượt từ <b>trái sang phải</b> (VD: 18 − 5 + 4 = 13 + 4 = 17).<br>• Bất đẳng thức điền số: Để 4 + ? &lt; 9 lớn nhất ⇒ 4 + ? = 8 ⇒ ? = 4.' }
          ]
        },
        {
          domain: 'geometry',
          titleVi: 'Hình học & Đo lường Lớp 1',
          diagramGrade: 1,
          items: [
            { tag: 'Hình phẳng cơ bản', topicId: 'g1_geom_basic', body: '• <b>Hình tam giác:</b> Có 3 cạnh thẳng và 3 đỉnh.<br>• <b>Hình vuông:</b> Có 4 đỉnh và 4 cạnh thẳng <b>dài bằng nhau</b>.<br>• <b>Hình chữ nhật:</b> Có 4 đỉnh, 4 cạnh (2 cạnh dài bằng nhau, 2 cạnh ngắn bằng nhau).<br>• <b>Hình tròn:</b> Đường bao cong khép kín, không có góc nhọn/đỉnh.' },
            { tag: 'Khối lập phương & Hộp chữ nhật', topicId: 'g1_geom_basic', body: '• <b>Khối lập phương</b> (như con xúc xắc, rubik): Có <b>6 mặt</b> đều là hình vuông bằng nhau.<br>• <b>Khối hộp chữ nhật</b> (như hộp sữa, viên gạch): Có <b>6 mặt</b> đều là hình chữ nhật.' },
            { tag: 'Độ dài xăng-ti-mét (cm)', topicId: 'g1_two_step', body: '• Đo độ dài bằng thước thẳng có vạch chia <b>cm</b>: Đặt vạch số <b>0</b> trùng một đầu đoạn thẳng, đầu kia trùng vạch số mấy thì dài bấy nhiêu cm.<br>• Phép tính có đơn vị: Cộng/trừ các số rồi giữ nguyên đơn vị <b>cm</b> ở kết quả (15 cm + 23 cm = 38 cm).' },
            { tag: 'Xem giờ đúng & Lịch tuần lễ', topicId: 'g1_two_step', body: '• <b>Giờ đúng:</b> Kim dài (kim phút) chỉ đúng số <b>12</b>, kim ngắn (kim giờ) chỉ số nào thì là bấy nhiêu giờ (VD: kim ngắn chỉ 8, kim dài chỉ 12 ⇒ 8 giờ đúng).<br>• <b>Một tuần lễ có 7 ngày:</b> Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ Nhật.' }
          ]
        },
        {
          domain: 'stats',
          titleVi: 'Kiểm đếm & Toán có lời văn Lớp 1',
          items: [
            { tag: 'Từ khóa giải Toán lời văn', topicId: 'g1_word', body: '• Gặp chữ <b>"thêm", "mua thêm", "tặng thêm", "bay tới", "cả hai", "tất cả"</b> → thực hiện phép <b>Cộng (+)</b>.<br>• Gặp chữ <b>"bớt", "ăn hết", "cho đi", "bay đi", "còn lại"</b> → thực hiện phép <b>Trừ (−)</b>.' },
            { tag: 'Lời văn 2 bước & Tìm số ban đầu', topicId: 'g1_word_solve', body: '• <b>Bài toán ngược tìm lúc đầu:</b> "Cho đi 5 quả, còn lại 12 quả. Hỏi lúc đầu có mấy quả?" → Phải <b>gộp lại</b>: 12 + 5 = 17 (quả).<br>• <b>Kiểm đếm hình & đồ vật:</b> Đếm theo từng loại từ trái sang phải, đánh dấu nhẹ để không đếm sót hoặc đếm lặp.' }
          ]
        }
      ]
    },

    // =========================================================================
    // LỚP 2 (GDPT 2018 — đủ 3 mạch)
    // =========================================================================
    2: {
      level: 'primary',
      summaryVi: 'Chuẩn GDPT 2018 Lớp 2: Cộng trừ CÓ NHỚ trong phạm vi 20 và 100; các số đến 1.000; bảng nhân 2, 5 & bảng chia 2, 5; đường gấp khúc, chu vi tam giác/tứ giác, đại lượng kg – lít – km – giờ 24h & biểu đồ tranh.',
      sections: [
        {
          domain: 'number',
          titleVi: 'Số học & Phép tính Lớp 2',
          items: [
            { tag: 'Cộng, trừ qua 10 trong PV 20', topicId: 'g2_carry20', body: '• <b>Cộng qua 10 (gộp đủ chục):</b> 9 + 5 = 9 + 1 + 4 = 14; 8 + 7 = 8 + 2 + 5 = 15; 7 + 6 = 7 + 3 + 3 = 13.<br>• <b>Trừ qua 10 (trừ về 10):</b> 13 − 5 = 13 − 3 − 2 = 8; 15 − 8 = (10 − 8) + 5 = 7.' },
            { tag: 'Mẹo nhẩm tách – gộp tròn chục/trăm', topicId: 'g2_mental_fast', body: '• Khi cộng với 9, 19, 29...: cộng thêm 10, 20, 30 rồi bớt 1 (VD: 47 + 19 = 47 + 20 − 1 = 66).<br>• Khi trừ cho 9, 19, 29...: trừ đi 10, 20, 30 rồi cộng trả 1 (VD: 63 − 19 = 63 − 20 + 1 = 44).' },
            { tag: 'Đặt tính có nhớ PV 100', topicId: 'g2_col100', body: '• <b>Phép cộng có nhớ:</b> Đơn vị + đơn vị ≥ 10 thì viết chữ số hàng đơn vị, <b>nhớ 1 sang hàng chục</b> (VD: 38 + 27: 8+7=15 viết 5 nhớ 1; 3+2+1=6 ⇒ 65).<br>• <b>Phép trừ có nhớ:</b> Hàng đơn vị không trừ được thì mượn 1 chục (10 đơn vị) để trừ, rồi <b>trả 1 vào chữ số hàng chục của số trừ</b> (VD: 62 − 28 = 34).' },
            { tag: 'Số có 3 chữ số & PV 1.000', topicId: 'g2_num1000', body: '• Cấu tạo: <b>Trăm – Chục – Đơn vị</b> (VD: 407 = 4 trăm + 0 chục + 7 đơn vị = 400 + 7; đọc là "bốn trăm linh bảy").<br>• 10 chục = 1 trăm (100); 10 trăm = 1 nghìn (1.000). Cộng trừ trong PV 1.000 đặt thẳng 3 cột Trăm – Chục – Đơn vị.' },
            { tag: 'Tìm thành phần chưa biết (+, −)', topicId: 'g2_find_x', body: '• <b>Số hạng</b> = Tổng − Số hạng đã biết (? + 24 = 61 ⇒ ? = 61 − 24 = 37).<br>• <b>Số bị trừ</b> = Hiệu + Số trừ (? − 18 = 35 ⇒ ? = 35 + 18 = 53).<br>• <b>Số trừ</b> = Số bị trừ − Hiệu (72 − ? = 29 ⇒ ? = 72 − 29 = 43).' },
            { tag: 'Bảng nhân 2, 5 & Bảng chia 2, 5', topicId: 'g2_mul25', body: '• Tổng các số hạng bằng nhau chuyển thành phép nhân: 5 + 5 + 5 + 5 = 5 × 4 = 20 (<b>Thừa số × Thừa số = Tích</b>).<br>• <b>Số bị chia ÷ Số chia = Thương:</b> Tích của bảng nhân 2 tận cùng là 0,2,4,6,8; bảng nhân 5 luôn tận cùng là <b>0 hoặc 5</b>.' }
          ]
        },
        {
          domain: 'geometry',
          titleVi: 'Hình học & Đo lường Lớp 2',
          items: [
            { tag: 'Điểm, Đoạn thẳng, Đường gấp khúc', topicId: 'g2_geom_time', body: '• Ba điểm thẳng hàng cùng nằm trên một vạch thước thẳng.<br>• <b>Độ dài đường gấp khúc</b> bằng <b>tổng độ dài các đoạn thẳng</b> thành phần (phải đổi về cùng đơn vị đo trước khi cộng!).' },
            { tag: 'Chu vi Tam giác & Tứ giác', topicId: 'g2_peri_shape', body: '• <b>Chu vi hình tam giác:</b> P = a + b + c (tổng độ dài 3 cạnh).<br>• <b>Chu vi hình tứ giác:</b> P = a + b + c + d (tổng độ dài 4 cạnh).<br>• Nhận biết <b>Khối trụ</b> (lon sữa, khúc gỗ tròn) và <b>Khối cầu</b> (quả bóng, viên bi — lăn được mọi hướng).' },
            { tag: 'Độ dài: km, m, dm, cm, mm', topicId: 'g2_units', body: '• <b>1 km = 1.000 m</b> · <b>1 m = 10 dm = 100 cm = 1.000 mm</b>.<br>• <b>1 dm = 10 cm = 100 mm</b> · <b>1 cm = 10 mm</b>.<br>• <i>VD:</i> 3 m 5 dm = 35 dm; 4 dm = 40 cm.' },
            { tag: 'Khối lượng (kg), Dung tích (l) & Giờ 24h', topicId: 'g2_kg_lit', body: '• Khối lượng đo bằng <b>ki-lô-gam (kg)</b>; dung tích chất lỏng đo bằng <b>lít (l)</b>.<br>• <b>Thời gian:</b> 1 ngày = 24 giờ; 1 giờ = 60 phút. Kim phút chỉ số 3 là <b>15 phút</b>, chỉ số 6 là <b>30 phút (rưỡi)</b>.<br>• Đổi giờ chiều/tối sang hệ 24h: <b>cộng thêm 12</b> (VD: 3 giờ chiều = 15 giờ; 8 giờ tối = 20 giờ).' }
          ]
        },
        {
          domain: 'stats',
          titleVi: 'Thống kê, Xác suất & Toán lời văn Lớp 2',
          items: [
            { tag: 'Bảng số liệu & Biểu đồ tranh', topicId: 'g2_stat_table', body: '• Đếm số biểu tượng trên từng hàng/cột của biểu đồ tranh để tìm: giá trị lớn nhất, bé nhất, tổng tất cả, và <b>hiệu (nhiều hơn / ít hơn bao nhiêu)</b>.' },
            { tag: 'Khả năng xảy ra sự kiện', topicId: 'g2_stat_table', body: '• Phân biệt 3 từ khóa xác suất tiểu học: <b>"Chắc chắn"</b> (100% xảy ra), <b>"Có thể"</b> (lúc xảy ra lúc không), <b>"Không thể"</b> (không bao giờ xảy ra, VD: lấy bóng đỏ từ hộp chỉ toàn bóng xanh).' },
            { tag: 'Toán Nhiều hơn / Ít hơn (Bẫy câu ngược!)', topicId: 'g2_word', body: '• Thuật chuẩn: Hỏi đối tượng lớn hơn → Cộng (+); hỏi đối tượng nhỏ hơn → Trừ (−).<br>• <b>Bẫy hay gặp:</b> "Lan có 42 nhãn vở, Lan <b>nhiều hơn</b> Mai 15 cái. Hỏi Mai có mấy cái?" ⇒ Mai là người <b>ít hơn</b> nên phải tính <b>42 − 15 = 27</b>!' }
          ]
        }
      ]
    },

    // =========================================================================
    // LỚP 3 (GDPT 2018 — đủ 3 mạch)
    // =========================================================================
    3: {
      level: 'primary',
      summaryVi: 'Chuẩn GDPT 2018 Lớp 3: Bảng nhân chia 2–9, số đến 100.000, làm tròn số & số La Mã, chia có dư, biểu thức có ngoặc, bài toán rút về đơn vị, chu vi – diện tích hình vuông & HCN, trung điểm, khối 3D và thống kê.',
      sections: [
        {
          domain: 'number',
          titleVi: 'Số học & Biểu thức Lớp 3',
          items: [
            { tag: 'Bảng nhân – chia từ 2 đến 9 & Một phần mấy', topicId: 'g3_tables', body: '• Nắm vững toàn bộ bảng nhân chia 2 → 9. Từ a × b = c suy ra c ÷ a = b và c ÷ b = a.<br>• <b>Một phần mấy (1/2 đến 1/9):</b> Muốn tìm <b>1/n của số A</b>, ta lấy <b>A ÷ n</b> (VD: 1/4 của 36 m là 36 ÷ 4 = 9 m).' },
            { tag: 'Số đến 100.000, Số La Mã & Làm tròn', topicId: 'g3_num100k', body: '• Các hàng: Chục nghìn – Nghìn – Trăm – Chục – Đơn vị.<br>• <b>Số La Mã (I → XX):</b> I = 1, V = 5, X = 10; IV = 4, VI = 6, IX = 9, XI = 11, XIV = 14, XIX = 19, XX = 20.<br>• <b>Làm tròn số:</b> Nhìn chữ số ngay bên phải hàng cần làm tròn: từ <b>0, 1, 2, 3, 4</b> thì làm tròn xuống (giữ nguyên); từ <b>5, 6, 7, 8, 9</b> thì làm tròn lên (+1 đơn vị hàng đó).' },
            { tag: 'Đặt tính ± đến 100.000 & ×/÷ 1 chữ số', topicId: 'g3_col100k', body: '• Cộng, trừ, nhân thực hiện từ <b>phải sang trái</b> (cẩn thận cộng nhớ liên tiếp qua nhiều hàng).<br>• <b>Đặt tính chia cho số có 1 chữ số:</b> Thực hiện từ <b>trái sang phải</b> (Chia → Nhân → Trừ → Hạ chữ số tiếp theo). Lượt hạ nào bé hơn số chia phải viết <b>0</b> vào thương!' },
            { tag: 'Phép chia có dư & Toán thực tế', topicId: 'g3_rem', body: '• Công thức: <b>Số bị chia = Thương × Số chia + Số dư</b>, trong đó luôn có <b>0 &lt; Số dư &lt; Số chia</b> (số dư lớn nhất có thể bằng <i>Số chia − 1</i>).<br>• <b>Toán thuyền/xe/phòng:</b> "38 học sinh đi đò, mỗi đò chở tối đa 6 em" ⇒ 38 ÷ 6 = 6 dư 2 ⇒ Cần ít nhất <b>6 + 1 = 7 chuyến đò</b>!' },
            { tag: 'Thứ tự thực hiện phép tính & Tính nhanh', topicId: 'g3_expr', body: '• Chỉ có +, − hoặc chỉ có ×, ÷: Tính từ <b>trái sang phải</b>.<br>• Có cả +, −, ×, ÷: <b>Nhân, chia trước → Cộng, trừ sau</b>.<br>• Có dấu ngoặc <b>( )</b>: Luôn tính <b>trong ngoặc trước</b> (VD: (14 + 26) ÷ 5 = 40 ÷ 5 = 8).' },
            { tag: 'Tìm thành phần chưa biết (Tìm x)', topicId: 'g3_find_x', body: '• <b>Thừa số</b> = Tích ÷ Thừa số kia (x × 6 = 84 ⇒ x = 84 ÷ 6 = 14).<br>• <b>Số bị chia</b> = Thương × Số chia (x ÷ 7 = 15 ⇒ x = 15 × 7 = 105).<br>• <b>Số chia</b> = Số bị chia ÷ Thương (96 ÷ x = 8 ⇒ x = 96 ÷ 8 = 12).' },
            { tag: 'Gấp/Giảm số lần & Rút về đơn vị', topicId: 'g3_fold_word', body: '• <b>Gấp a lên k lần:</b> tính a × k · <b>Giảm a đi k lần:</b> tính a ÷ k · <b>Số lớn gấp mấy lần số bé:</b> lấy Lớn ÷ Bé.<br>• <b>Bài toán rút về đơn vị (2 bước):</b> Bước 1 tìm giá trị 1 phần (chia); Bước 2 tìm giá trị k phần (nhân).' }
          ]
        },
        {
          domain: 'geometry',
          titleVi: 'Hình học & Đo lường Lớp 3',
          diagramGrade: 3,
          items: [
            { tag: 'Trung điểm, Góc vuông & Hình tròn', topicId: 'g3_midpoint', body: '• <b>Trung điểm M của đoạn AB:</b> M nằm giữa A, B và <b>AM = MB = AB ÷ 2</b>.<br>• Dùng <b>ê-ke</b> kiểm tra góc vuông và góc không vuông.<br>• <b>Hình tròn tâm O:</b> Bán kính r = OA = OB; Đường kính d = AB đi qua tâm O và <b>d = 2 × r</b>.' },
            { tag: 'Chu vi & Diện tích Hình vuông, HCN', topicId: 'g3_geom', body: '• <b>Hình chữ nhật (dài a, rộng b):</b> Chu vi <b>P = (a + b) × 2</b>; Nửa chu vi <b>a + b = P ÷ 2</b>; Diện tích <b>S = a × b</b>.<br>• <b>Hình vuông (cạnh a):</b> Chu vi <b>P = a × 4</b> (suy ra a = P ÷ 4); Diện tích <b>S = a × a</b>.' },
            { tag: 'Đỉnh, Cạnh, Mặt của Khối hộp & Lập phương', topicId: 'g3_midpoint', body: '• Cả <b>Khối hộp chữ nhật</b> và <b>Khối lập phương</b> đều có: <b>8 đỉnh, 12 cạnh, 6 mặt</b>.<br>• Khối lập phương có 6 mặt đều là hình vuông bằng nhau; khối hộp CN có 3 kích thước: chiều dài, chiều rộng, chiều cao.' },
            { tag: 'Đơn vị g, ml, mm, Tiền VN & Lịch năm', topicId: 'g3_money_ml', body: '• <b>1 kg = 1.000 g</b> · <b>1 lít = 1.000 ml</b> · <b>1 m = 1.000 mm</b> · Nhiệt độ đo bằng độ C (<b>°C</b>).<br>• <b>Tháng 31 ngày:</b> 1, 3, 5, 7, 8, 10, 12 · <b>Tháng 30 ngày:</b> 4, 6, 9, 11 · Tháng 2 có 28 ngày (năm nhuận 29 ngày).' }
          ]
        },
        {
          domain: 'stats',
          titleVi: 'Bảng thống kê & Xác suất Lớp 3',
          items: [
            { tag: 'Đọc & Phân tích Bảng số liệu', topicId: 'g3_stat_prob', body: '• Đọc đúng giao của hàng và cột để tìm số liệu, tính tổng nhiều mục, tìm chênh lệch <b>Cao nhất − Thấp nhất</b> hoặc so sánh gấp mấy lần.' },
            { tag: 'Khả năng xảy ra của một sự kiện', topicId: 'g3_word_two_step', body: '• Xác định các kết quả có thể xảy ra của trò chơi (tung đồng xu, gieo xúc xắc 1–6 chấm, rút thăm) và đánh giá: <i>chắc chắn, có thể, không thể</i>.' }
          ]
        }
      ]
    },

    // =========================================================================
    // LỚP 4 (GDPT 2018 — đủ 3 mạch)
    // =========================================================================
    4: {
      level: 'primary',
      summaryVi: 'Chuẩn GDPT 2018 Lớp 4: Số tự nhiên lớp triệu – tỉ, tính bằng cách thuận tiện, dấu hiệu chia hết (2,3,5,9), trung bình cộng, Tổng–Hiệu, dãy số cách đều, 4 phép tính Phân số, góc (độ °), hình bình hành – hình thoi & biểu đồ cột.',
      sections: [
        {
          domain: 'number',
          titleVi: 'Số tự nhiên, Dãy số & Phân số Lớp 4',
          items: [
            { tag: 'Lớp triệu, Làm tròn & Biểu thức chứa chữ', topicId: 'g4_million_round', body: '• <b>Lớp đơn vị</b> (đơn vị, chục, trăm) · <b>Lớp nghìn</b> (nghìn, chục nghìn, trăm nghìn) · <b>Lớp triệu</b> (triệu, chục triệu, trăm triệu).<br>• Thay giá trị chữ vào biểu thức (m + n × p) rồi tính đúng thứ tự phép tính.' },
            { tag: 'Tính chất giao hoán, kết hợp & Phân phối', topicId: 'g4_conv', body: '• <b>Nhân một số với một tổng/hiệu:</b> <span class="kh-formula">a × b + a × c = a × (b + c)</span> và <span class="kh-formula">a × b − a × c = a × (b − c)</span>.<br>• <b>Cặp số vàng tạo tròn chục/trăm/nghìn:</b> 2 × 5 = 10 · <b>4 × 25 = 100</b> · <b>8 × 125 = 1.000</b>.<br>• <i>VD:</i> 37 × 64 + 37 × 36 = 37 × (64 + 36) = 37 × 100 = 3.700.' },
            { tag: 'Nhân, chia với số có 2 chữ số & 10, 100', topicId: 'g4_mul2', body: '• Nhân nhẩm với 10, 100, 1.000: viết thêm 1, 2, 3 chữ số 0 vào bên phải.<br>• Đặt tính nhân với số có 2 chữ số: <b>tích riêng thứ hai phải lùi sang trái 1 cột</b> (vì là hàng chục!).' },
            { tag: 'Dấu hiệu chia hết cho 2, 3, 5, 9', topicId: 'g4_div_rules', body: '• Chia hết cho <b>2</b>: tận cùng 0, 2, 4, 6, 8 · Chia hết cho <b>5</b>: tận cùng 0 hoặc 5 · Cả 2 và 5: tận cùng là <b>0</b>.<br>• Chia hết cho <b>9</b>: <b>tổng các chữ số</b> chia hết cho 9 · Chia hết cho <b>3</b>: tổng các chữ số chia hết cho 3.' },
            { tag: 'Số Trung bình cộng (TBC)', topicId: 'g4_avg', body: '• Công thức: <b>TBC = (Tổng các số) ÷ (Số các số hạng)</b>.<br>• Suy ngược rất hay dùng: <b>Tổng của n số = TBC × n</b> (VD: TBC của 3 số là 25 ⇒ Tổng 3 số = 25 × 3 = 75).' },
            { tag: 'Bài toán Tổng – Hiệu & Tổng/Hiệu ẩn', topicId: 'g4_sum_diff', body: '• <b>Số bé = (Tổng − Hiệu) ÷ 2</b> · <b>Số lớn = (Tổng + Hiệu) ÷ 2</b>.<br>• <i>Nhận diện ẩn:</i> Cho Chu vi HCN P ⇒ <b>Tổng (dài + rộng) = P ÷ 2</b>. Hiệu số tuổi của hai người <b>không đổi theo thời gian</b>. Hai số chẵn (hoặc lẻ) liên tiếp hơn kém nhau <b>2 đơn vị</b>!' },
            { tag: 'Dãy số cách đều (Công thức Gauss)', topicId: 'g4_seq_gauss', body: '• <b>Số số hạng</b> = (Số cuối − Số đầu) ÷ Khoảng cách + 1.<br>• <b>Tổng dãy số</b> = (Số đầu + Số cuối) × Số số hạng ÷ 2.<br>• <b>Số hạng thứ n</b> = Số đầu + (n − 1) × Khoảng cách.' },
            { tag: 'Rút gọn, Quy đồng & 4 phép tính Phân số', topicId: 'g4_frac', body: '• <b>Rút gọn & Bằng nhau:</b> Chia (hoặc nhân) cả tử và mẫu cho cùng số tự nhiên khác 0.<br>• <b>Cộng / Trừ:</b> Quy đồng cùng mẫu rồi cộng/trừ tử, giữ nguyên mẫu · <b>Nhân:</b> (a×c)/(b×d) · <b>Chia:</b> nhân phân số đảo ngược (a/b) × (d/c).<br>• <b>Tìm m/n của A:</b> tính <b>A ÷ n × m</b> (VD: 3/5 của 45 là 45 ÷ 5 × 3 = 27).' }
          ]
        },
        {
          domain: 'geometry',
          titleVi: 'Hình học & Đo lường Lớp 4',
          diagramGrade: 4,
          items: [
            { tag: 'Đo góc (độ °) & Vuông góc – Song song', topicId: 'g4_angle', body: '• <b>Góc vuông = 90°</b> · <b>Góc nhọn &lt; 90°</b> · <b>90° &lt; Góc tù &lt; 180°</b> · <b>Góc bẹt = 180°</b> (= 2 góc vuông).<br>• Trên đồng hồ: mỗi khoảng 1 giờ ứng với <b>30°</b> (3h = 90°, 6h = 180°, 2h = 60°).<br>• Hai đường thẳng vuông góc tạo 4 góc vuông; hai đường thẳng song song không bao giờ cắt nhau.' },
            { tag: 'Hình bình hành & Hình thoi', topicId: 'g4_geom', body: '• <b>Hình bình hành:</b> Các cặp cạnh đối song song và bằng nhau. Chu vi P = (a + b) × 2; Diện tích <b>S = a × h</b> (đáy × chiều cao cùng đơn vị).<br>• <b>Hình thoi:</b> 4 cạnh bằng nhau, 2 đường chéo vuông góc tại trung điểm mỗi đường. Chu vi P = a × 4; Diện tích <b>S = (m × n) ÷ 2</b> (tích hai đường chéo chia 2).' },
            { tag: 'Đổi diện tích, Khối lượng & Thế kỉ', topicId: 'g4_area_units', body: '• <b>Khối lượng:</b> 1 tấn = 10 tạ = 100 yến = 1.000 kg · 1 tạ = 10 yến = 100 kg · 1 yến = 10 kg.<br>• <b>Diện tích (hơn kém 100 lần):</b> 1 m² = 100 dm² = 10.000 cm² · 1 dm² = 100 cm² · 1 cm² = 100 mm².<br>• <b>Thời gian:</b> 1 phút = 60 giây · <b>1 thế kỉ = 100 năm</b> (Năm 1 → 100: thế kỉ I; Năm 2001 → 2100: thế kỉ XXI).' }
          ]
        },
        {
          domain: 'stats',
          titleVi: 'Biểu đồ cột & Xác suất Lớp 4',
          items: [
            { tag: 'Dãy số liệu & Biểu đồ cột', topicId: 'g4_stat_chart', body: '• Đọc chiều cao từng cột chiếu sang trục số để tìm giá trị, so sánh hơn kém và tính <b>trung bình cộng</b> trên biểu đồ cột.' },
            { tag: 'Kiểm đếm số lần lặp lại sự kiện', topicId: 'g4_word_adv', body: '• Thực hiện phép thử nhiều lần (tung xúc xắc, rút thẻ) và ghi lại số lần xuất hiện của từng khả năng.' }
          ]
        }
      ]
    },

    // =========================================================================
    // LỚP 5 (GDPT 2018 & Ôn thi vào Lớp 6 — đủ 3 mạch)
    // =========================================================================
    5: {
      level: 'primary',
      summaryVi: 'Chuẩn GDPT 2018 Lớp 5 & Ôn vào 6: Số thập phân, Tỉ số phần trăm, Hỗn số, Tổng–Tỉ & Hiệu–Tỉ, Tỉ lệ bản đồ, Toán Chuyển động (ngược/cùng chiều/dòng nước), Công việc chung, Hình tam giác – Thang – Tròn – Hộp – Lập phương – Trụ – Cầu & Biểu đồ quạt tròn.',
      sections: [
        {
          domain: 'number',
          titleVi: 'Số thập phân, Tỉ số % & Toán Điển hình Lớp 5',
          items: [
            { tag: 'Số thập phân, Hỗn số & Làm tròn', topicId: 'g5_dec_place', body: '• Hàng sau dấu phẩy: <b>Phần mười (1/10 = 0,1) → Phần trăm (0,01) → Phần nghìn (0,001)</b>. Viết thêm chữ số 0 vào bên phải phần thập phân thì giá trị không đổi (3,5 = 3,50).<br>• Đổi hỗn số: <span class="kh-formula">a và b/c = (a × c + b)/c = a + (b ÷ c)</span> (VD: 2 và 3/4 = 2,75).' },
            { tag: '4 phép tính Số thập phân & Nhẩm nhanh', topicId: 'g5_dec_col', body: '• <b>Cộng / Trừ:</b> Đặt các dấu phẩy <b>thẳng cột</b>.<br>• <b>Nhân 10; 100; 1.000</b> (hoặc <b>chia 0,1; 0,01; 0,001</b>): dịch dấu phẩy sang <b>PHẢI</b> 1, 2, 3 chữ số.<br>• <b>Chia 10; 100; 1.000</b> (hoặc <b>nhân 0,1; 0,01; 0,001</b>): dịch dấu phẩy sang <b>TRÁI</b> 1, 2, 3 chữ số.<br>• <b>Cặp vàng tính thuận tiện:</b> <b>0,5 × 2 = 1</b> · <b>0,25 × 4 = 1</b> · <b>0,125 × 8 = 1</b> · <b>2,5 × 4 = 10</b> · <b>1,25 × 8 = 10</b>.' },
            { tag: 'Tìm x & Biểu thức Số thập phân', topicId: 'g5_dec_findx', body: '• Chia cho số thập phân: Đếm phần thập phân của số chia có bao nhiêu chữ số thì dịch dấu phẩy của số bị chia sang phải bấy nhiêu chữ số rồi bỏ dấu phẩy ở số chia.<br>• Áp dụng tính chất phân phối: a × b + a × c = a × (b + c) (nếu đề thiếu thừa số, viết a = a × 1!).' },
            { tag: 'Ba bài toán Tỉ số phần trăm & Lãi – Lỗ', topicId: 'g5_pct', body: '• <b>Dạng 1 (Tìm tỉ số % của a và b):</b> (a ÷ b) × 100%.<br>• <b>Dạng 2 (Tìm p% của A):</b> A × p ÷ 100.<br>• <b>Dạng 3 (Tìm số A biết p% của A bằng B):</b> A = B ÷ p × 100.<br>• <b>Giá giảm d%:</b> Giá mới = Giá gốc × (100% − d%) · <b>Lãi r%:</b> Tiền thu = Vốn × (100% + r%).' },
            { tag: 'Tổng – Tỉ, Hiệu – Tỉ & Tỉ lệ bản đồ', topicId: 'g5_sum_ratio', body: '• <b>Tổng – Tỉ:</b> Tổng số phần = m + n ⇒ Giá trị 1 phần = Tổng ÷ (m + n).<br>• <b>Hiệu – Tỉ:</b> Hiệu số phần = |m − n| ⇒ Giá trị 1 phần = Hiệu ÷ |m − n|.<br>• <b>Tỉ lệ bản đồ 1 : k:</b> Độ dài thật = Độ dài bản đồ × k (cùng đơn vị đo!).' },
            { tag: 'Chuyển động đều (Cơ bản, 2 xe & Dòng nước)', topicId: 'g5_motion_adv', body: '• Công thức gốc: <b>s = v × t</b> · <b>v = s ÷ t</b> · <b>t = s ÷ v</b>.<br>• <b>Ngược chiều gặp nhau:</b> t = s ÷ (v₁ + v₂) · <b>Cùng chiều đuổi kịp:</b> t = s ÷ (v₂ − v₁).<br>• <b>Chuyển động trên sông:</b> V_xuôi = V_thực + V_nước · V_ngược = V_thực − V_nước · <b>V_nước = (V_xuôi − V_ngược) ÷ 2</b>.' },
            { tag: 'Công việc chung – Vòi nước & Câu điểm 10', topicId: 'g5_work_rate', body: '• Người 1 làm một mình hết t₁ giờ ⇒ 1 giờ làm được <b>1/t₁</b> công việc. Hai người cùng làm 1 giờ được: <b>1/t₁ + 1/t₂ = 1/t_chung</b> ⇒ t_chung = 1 ÷ (1/t₁ + 1/t₂).' }
          ]
        },
        {
          domain: 'geometry',
          titleVi: 'Hình phẳng, Hình khối & Thời gian Lớp 5',
          diagramGrade: 5,
          items: [
            { tag: 'Hình tam giác, Hình thang & Hình tròn', topicId: 'g5_geom', body: '• <b>Hình tam giác:</b> S = (a × h) ÷ 2 ⇒ Suy ngược: Đáy <b>a = (S × 2) ÷ h</b>; Cao <b>h = (S × 2) ÷ a</b>.<br>• <b>Hình thang:</b> S = (a + b) × h ÷ 2 ⇒ Tổng 2 đáy <b>a + b = (S × 2) ÷ h</b>.<br>• <b>Hình tròn (π ≈ 3,14):</b> Chu vi <b>C = d × 3,14 = 2 × r × 3,14</b>; Diện tích <b>S = r × r × 3,14</b>.' },
            { tag: 'Hình hộp chữ nhật & Hình lập phương', topicId: 'g5_box_surface', body: '• <b>Hình hộp CN (dài a, rộng b, cao c):</b> Sxq = (a + b) × 2 × c; Stp = Sxq + 2 × a × b; Thể tích <b>V = a × b × c</b> (bể không nắp chỉ cộng 1 đáy a×b!).<br>• <b>Hình lập phương (cạnh a):</b> Sxq = a × a × 4; Stp = a × a × 6; Thể tích <b>V = a × a × a</b>.<br>• Nhận biết thêm <b>Hình trụ</b> (2 đáy hình tròn bằng nhau) & <b>Hình cầu</b>.' },
            { tag: 'Đơn vị Diện tích (ha, km²) & Thể tích (m³, dm³)', topicId: 'g5_units', body: '• <b>Diện tích:</b> 1 km² = 100 ha = 1.000.000 m² · <b>1 ha (héc-ta) = 10.000 m²</b>.<br>• <b>Thể tích (hơn kém 1.000 lần):</b> <b>1 m³ = 1.000 dm³ = 1.000.000 cm³</b> · <b>1 dm³ = 1 lít = 1.000 cm³</b>.' },
            { tag: 'Số đo Thời gian (+, −, ×, ÷)', topicId: 'g5_time_calc', body: '• Cộng thời gian nếu phút ≥ 60 thì đổi 60 phút = 1 giờ cộng sang cột giờ.<br>• Trừ thời gian nếu số phút bị trừ bé hơn thì mượn 1 giờ = 60 phút rồi trừ (VD: 3 giờ 15 phút − 1 giờ 40 phút = 2 giờ 75 phút − 1 giờ 40 phút = 1 giờ 35 phút).<br>• Đổi thập phân: 0,25 giờ = 15 phút; 0,5 giờ = 30 phút; 0,75 giờ = 45 phút.' }
          ]
        },
        {
          domain: 'stats',
          titleVi: 'Biểu đồ quạt tròn & Xác suất Lớp 5',
          items: [
            { tag: 'Biểu đồ hình quạt tròn', topicId: 'g5_stat_pie', body: '• Tổng cả hình tròn luôn ứng với <b>100%</b>. Số lượng của nhóm p% trong tổng N là: <b>N × p ÷ 100</b>.' },
            { tag: 'Tỉ số mô tả số lần lặp lại (Xác suất)', topicId: 'g5_stat_pie', body: '• Thực hiện N lần phép thử, sự kiện xảy ra k lần ⇒ Tỉ số mô tả sự lặp lại là <b>k/N</b> (hoặc đổi ra tỉ số phần trăm: (k ÷ N) × 100%).' }
          ]
        }
      ]
    },

    // =========================================================================
    // LỚP 6 (GDPT 2018 — đủ 3 mạch: Số học · Hình học · Thống kê & Xác suất)
    // =========================================================================
    6: {
      level: 'secondary',
      summaryVi: 'Chuẩn GDPT 2018 Lớp 6: Tập hợp ℕ, lũy thừa, chia hết, số nguyên tố, ƯCLN – BCNN, Số nguyên ℤ, Phân số – Hỗn số – Dãy phân số quy luật & Số thập phân; Hình phẳng trực quan, Tính đối xứng, Hình hộp – Lập phương 3D, Điểm – Đoạn thẳng – Góc; Bảng thống kê, Biểu đồ cột kép & Xác suất thực nghiệm.',
      sections: [
        {
          domain: 'number',
          titleVi: 'Số học Lớp 6',
          items: [
            { tag: 'Tập hợp ℕ & Thứ tự thực hiện phép tính', topicId: 'g6_nat_ops', body: '• Ký hiệu: phần tử thuộc tập hợp (<b>∈</b>), không thuộc (<b>∉</b>). Tập ℕ = {0; 1; 2; ...}, ℕ* = {1; 2; 3; ...}.<br>• <b>Thứ tự tính:</b> Không ngoặc: <b>Lũy thừa → Nhân, chia → Cộng, trừ</b>. Có ngoặc: <b>( ) → [ ] → { }</b>.' },
            { tag: 'Lũy thừa với số mũ tự nhiên', topicId: 'g6_pow', body: '• Định nghĩa: aⁿ = a · a · ... · a (n thừa số, n ≠ 0); quy ước <b>a⁰ = 1</b> (a ≠ 0), a¹ = a.<br>• Nhân & Chia cùng cơ số: <b>a^m · a^n = a^(m+n)</b> · <b>a^m ÷ a^n = a^(m−n)</b> (a ≠ 0, m ≥ n).<br>• Các số chính phương & lập phương cần thuộc: 2³=8, 2⁴=16, 2⁵=32, 2⁶=64, 3³=27, 3⁴=81, 5³=125.' },
            { tag: 'Chia hết, Số nguyên tố & Phân tích TSNT', topicId: 'g6_div_prime', body: '• Tính chất chia hết của một tổng: Nếu a ⋮ m và b ⋮ m thì (a ± b) ⋮ m.<br>• <b>Số nguyên tố:</b> Số tự nhiên &gt; 1 chỉ có 2 ước là 1 và chính nó (<b>2</b> là số nguyên tố chẵn duy nhất: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29...). Số 0 và 1 không là SNT cũng không là hợp số.' },
            { tag: 'ƯCLN, BCNN & Bài toán thực tế', topicId: 'g6_div', body: '• <b>Tìm ƯCLN:</b> Chọn các thừa số nguyên tố <b>chung</b> với số mũ <b>nhỏ nhất</b>.<br>• <b>Tìm BCNN:</b> Chọn các TSNT <b>chung và riêng</b> với số mũ <b>lớn nhất</b>. Luôn có: <b>a · b = ƯCLN(a,b) · BCNN(a,b)</b>.<br>• <i>Nhận diện lời văn:</i> "Chia đều vào nhiều nhất bao nhiêu phần/tổ" ⇒ <b>ƯCLN</b> · "Ít nhất bao lâu lại cùng trực/xếp vừa đủ hàng" ⇒ <b>BCNN</b> (nếu xếp thiếu/thừa k thì cộng/trừ k trước khi tìm BCNN!).' },
            { tag: 'Số nguyên ℤ, Quy tắc dấu & Bỏ ngoặc', topicId: 'g6_int', body: '• Cộng 2 số nguyên âm: (−a) + (−b) = −(a + b). Cộng trái dấu: lấy phần tự nhiên lớn trừ bé rồi mang dấu của số có phần tự nhiên lớn hơn.<br>• <b>Quy tắc dấu nhân/chia:</b> <b>(+)·(+) = (+)</b> · <b>(−)·(−) = (+)</b> · <b>(+)·(−) = (−)</b>.<br>• <b>Quy tắc dấu ngoặc:</b> Dấu "−" trước ngoặc thì khi bỏ ngoặc phải <b>ĐỔI DẤU tất cả các số hạng</b> bên trong: −(a − b + c) = −a + b − c.' },
            { tag: 'Tìm x trong ℤ (Chuyển vế, Tích bằng 0)', topicId: 'g6_findx', body: '• <b>Quy tắc chuyển vế:</b> Chuyển một số hạng từ vế này sang vế kia phải <b>đổi dấu</b> số hạng đó: x + a = b ⇔ x = b − a.<br>• Dạng lũy thừa chẵn: x² = 9 ⇒ x = 3 hoặc x = −3 (có 2 giá trị đối nhau!).' },
            { tag: 'Phân số có tử/mẫu nguyên & 2 bài toán gốc', topicId: 'g6_frac', body: '• Hai phân số a/b = c/d ⇔ <b>a · d = b · c</b> (tích chéo bằng nhau).<br>• <b>Bài toán 1:</b> Tìm m/n của số a ⇒ tính <b>a · (m/n)</b>.<br>• <b>Bài toán 2:</b> Tìm một số x biết m/n của x bằng b ⇒ tính <b>x = b ÷ (m/n)</b>.' },
            { tag: 'Hỗn số & Dãy phân số có quy luật (Câu cuối đề HK)', topicId: 'g6_mixed_expr', body: '• Đổi hỗn số dương: a và b/c = (a·c + b)/c.<br>• <b>Tổng dãy khử liên tiếp (Telescoping):</b> <span class="kh-formula">1/[k(k + 1)] = 1/k − 1/(k + 1)</span> ⇒ S = 1/(1·2) + 1/(2·3) + ... + 1/[n(n + 1)] = <b>1 − 1/(n + 1) = n/(n + 1)</b>. Mở rộng khoảng cách d: d/[k(k + d)] = 1/k − 1/(k + d).' },
            { tag: 'Số thập phân âm, Làm tròn & Tỉ số %', topicId: 'g6_dec_pct', body: '• Tỉ số phần trăm của a và b là (a / b) · 100%.<br>• Bài toán mua sắm: Giá niêm yết giảm p%, tính thêm thuế VAT q% ⇒ Giá thanh toán = Giá gốc · (1 − p%) · (1 + q%).' }
          ]
        },
        {
          domain: 'geometry',
          titleVi: 'Hình học Lớp 6',
          items: [
            { tag: 'Đa giác đều & Tứ giác đặc biệt', topicId: 'g6_geom_flat', body: '• <b>Tam giác đều (cạnh a):</b> 3 cạnh bằng nhau, 3 góc đều bằng 60°, P = 3a.<br>• <b>Lục giác đều (cạnh a):</b> Ghép từ 6 tam giác đều bằng nhau, 6 cạnh bằng nhau, 3 đường chéo chính bằng nhau (= 2a), P = 6a.<br>• <b>Chu vi & Diện tích:</b> Hình bình hành S = a·h · Hình thoi P = 4a, S = (d₁·d₂)/2 · Hình thang cân S = (a + b)·h/2.' },
            { tag: 'Trục đối xứng & Tâm đối xứng', topicId: 'g6_geom_sym', body: '• <b>Số trục đối xứng:</b> Đoạn thẳng (1), Hình thang cân (1), HCN (2), Hình thoi (2), Tam giác đều (3), Hình vuông (4), Lục giác đều (6), Hình tròn (vô số). <i>(Hình bình hành thường KHÔNG có trục đối xứng!)</i><br>• <b>Có tâm đối xứng:</b> Đoạn thẳng (trung điểm), Hình bình hành, HCN, Hình thoi, Hình vuông, Lục giác đều, Hình tròn. <i>(Tam giác đều & Thang cân KHÔNG có tâm đối xứng!)</i>' },
            { tag: 'Hình hộp chữ nhật & Hình lập phương trực quan', topicId: 'g6_geom_3d', body: '• Đều có <b>8 đỉnh, 6 mặt, 12 cạnh</b> (4 đường chéo xuất phát từ các đỉnh đối diện).<br>• Hình hộp CN (dài a, rộng b, cao h): Sxq = 2(a + b)h; V = a·b·h · Hình lập phương cạnh a: Sxq = 4a², Stp = 6a², V = a³ (1 dm³ = 1 lít).' },
            { tag: 'Điểm, Đường thẳng, Tia, Đoạn thẳng & Trung điểm', topicId: 'g6_geom_seg', body: '• Qua 2 điểm phân biệt chỉ vẽ được <b>1 đường thẳng duy nhất</b>. Với n điểm không có 3 điểm thẳng hàng vẽ được <b>n(n − 1)/2</b> đường thẳng.<br>• Điểm M nằm giữa A và B ⇔ <b>AM + MB = AB</b>.<br>• M là <b>trung điểm</b> của AB ⇔ M nằm giữa A, B và <b>MA = MB = AB/2</b>.' },
            { tag: 'Góc, Số đo góc & Bài toán lát gạch', topicId: 'g6_geom_angle', body: '• Góc nhọn (0° &lt; α &lt; 90°) · Góc vuông (90°) · Góc tù (90° &lt; α &lt; 180°) · Góc bẹt (180°).<br>• Tia Oz nằm giữa hai tia Ox, Oy ⇒ <b>∠xOz + ∠zOy = ∠xOy</b>.<br>• <b>Bài toán lát nền:</b> Số viên gạch = Diện tích nền nhà ÷ Diện tích 1 viên gạch (nhớ đổi cùng đơn vị cm² hoặc m²!).' }
          ]
        },
        {
          domain: 'stats',
          titleVi: 'Thống kê & Xác suất Lớp 6',
          items: [
            { tag: 'Bảng thống kê, Biểu đồ tranh, Cột & Cột kép', topicId: 'g6_stat_chart', body: '• Phân biệt dữ liệu là số (số liệu) và dữ liệu không phải là số (tên gọi, xếp loại); kiểm tra tính hợp lý của dữ liệu.<br>• <b>Biểu đồ cột kép</b> dùng để so sánh trực quan 2 bộ dữ liệu cùng loại (VD: Học kỳ I và Học kỳ II).' },
            { tag: 'Phép thử & Xác suất thực nghiệm', topicId: 'g6_word_stat', body: '• Thực hiện n lần phép thử (tung đồng xu, gieo xúc xắc, lấy bóng), sự kiện E xảy ra k lần ⇒ <b>Xác suất thực nghiệm của E = k / n</b>.' }
          ]
        }
      ]
    },

    // =========================================================================
    // LỚP 7 (GDPT 2018 — đủ 3 mạch: Đại số · Hình học · Thống kê & Xác suất)
    // =========================================================================
    7: {
      level: 'secondary',
      summaryVi: 'Chuẩn GDPT 2018 Lớp 7: Số hữu tỉ ℚ, Số thập phân tuần hoàn, Làm tròn theo độ chính xác d, Số thực ℝ, Căn bậc hai & |x|, Tỉ lệ thức – Đại lượng tỉ lệ, Đa thức 1 biến P(x); Song song, Tam giác thường & vuông bằng nhau, BĐT tam giác, 4 đường đồng quy, Lăng trụ đứng & Xác suất biến cố.',
      sections: [
        {
          domain: 'number',
          titleVi: 'Số học & Đại số Lớp 7',
          items: [
            { tag: 'Số hữu tỉ ℚ & 5 công thức Lũy thừa', topicId: 'g7_rat', body: '• Số hữu tỉ viết dạng a/b (a, b ∈ ℤ, b ≠ 0).<br>• <b>5 công thức lũy thừa:</b> x^m · x^n = x^(m+n) · x^m ÷ x^n = x^(m−n) · <b>(x^m)^n = x^(m·n)</b> · (x·y)^n = x^n · y^n · (x/y)^n = x^n / y^n.' },
            { tag: 'Số thập phân tuần hoàn & Làm tròn độ chính xác d (Mới 2018)', topicId: 'g7_dec_periodic', body: '• Đổi nhanh: <b>0,(1) = 1/9</b> ⇒ 0,(a) = a/9 (VD: 0,(3) = 1/3; 0,(6) = 2/3); 0,(ab) = ab/99.<br>• <b>Quy tắc làm tròn với độ chính xác d (điểm mới SGK 2018):</b> Nếu d là nửa đơn vị của hàng nào thì làm tròn đến hàng ấy: <b>d = 50 → hàng trăm</b>; <b>d = 5 → hàng chục</b>; <b>d = 0,5 → hàng đơn vị</b>; <b>d = 0,05 → hàng phần mười</b>; <b>d = 0,005 → hàng phần trăm</b>.' },
            { tag: 'Số thực ℝ, Căn bậc hai số học & Cực trị |x|', topicId: 'g7_sqrt_abs', body: '• <b>Căn bậc hai số học</b> của a ≥ 0 là số không âm x sao cho x² = a (luôn có <b>√a ≥ 0</b>; VD: √25 = 5, không phải ±5!).<br>• <b>Trị tuyệt đối:</b> |x| ≥ 0 với mọi x. Phương trình |A| = k (k &gt; 0) ⇔ A = k hoặc A = −k.<br>• <b>Tìm GTNN – GTLN:</b> <b>A = |x − a| + m ≥ m</b> (GTNN = m khi x = a); <b>B = M − |x − a| ≤ M</b> (GTLN = M khi x = a).' },
            { tag: 'Tìm x hữu tỉ (Chuyển vế, Lũy thừa, |x|)', topicId: 'g7_findx', body: '• Lũy thừa mũ lẻ giữ nguyên dấu: (x − 1)³ = −8 = (−2)³ ⇔ x − 1 = −2 ⇔ x = −1.<br>• Lũy thừa mũ chẵn có <b>2 trường hợp</b>: (x − 1)² = 16 ⇔ x − 1 = 4 hoặc x − 1 = −4 ⇔ x = 5 hoặc x = −3.' },
            { tag: 'Tỉ lệ thức & Dãy tỉ số bằng nhau', topicId: 'g7_ratio', body: '• <b>Tỉ lệ thức:</b> a/b = c/d ⇔ <b>a · d = b · c</b> ⇒ a = (b·c)/d.<br>• <b>Tính chất dãy tỉ số bằng nhau:</b> <span class="kh-formula">x/a = y/b = z/c = (x + y + z)/(a + b + c) = (x − y + z)/(a − b + c)</span>.<br>• Khi đề cho "x, y, z tỉ lệ với 2; 3; 5" ta viết ngay: <b>x/2 = y/3 = z/5</b>.' },
            { tag: 'Đại lượng Tỉ lệ thuận & Tỉ lệ nghịch', topicId: 'g7_prop_word', body: '• <b>Tỉ lệ thuận (y = k·x):</b> <span class="kh-formula">y₁/x₁ = y₂/x₂ = k</span> (số mét vải & giá tiền, quãng đường & thời gian cùng vận tốc).<br>• <b>Tỉ lệ nghịch (x·y = a):</b> <span class="kh-formula">x₁·y₁ = x₂·y₂ = a</span> (<b>số công nhân/máy cày và thời gian hoàn thành công việc</b>).' },
            { tag: 'Đa thức một biến P(x), Phép nhân – chia & Nghiệm', topicId: 'g7_poly_muldiv', body: '• Thu gọn P(x): <b>Bậc của P(x)</b> là số mũ cao nhất của biến có hệ số ≠ 0 · <b>Hệ số tự do = P(0)</b> · <b>Tổng các hệ số = P(1)</b>.<br>• <b>Nghiệm & Chia hết:</b> x = a là nghiệm của P(x) ⇔ <b>P(a) = 0</b> ⇔ P(x) chia hết cho (x − a).' },
            { tag: 'Toán thực tế tiêu dùng Lớp 7 (Giảm giá, Lãi, Taxi)', topicId: 'g7_real_math', body: '• <b>Lãi suất tiết kiệm đơn:</b> Lãi = Vốn × r% × số năm · <b>Cước taxi bậc thang:</b> Tách quãng đường thành km mở cửa + các mức km tiếp theo.' }
          ]
        },
        {
          domain: 'geometry',
          titleVi: 'Hình học Lớp 7',
          diagramGrade: 7,
          items: [
            { tag: 'Góc đối đỉnh, Phân giác & Hai đường song song', topicId: 'g7_geom_para', body: '• <b>Hai góc kề bù:</b> Tổng = <b>180°</b> · <b>Hai góc đối đỉnh:</b> Bằng nhau · <b>Tia phân giác Oz:</b> ∠xOz = ∠zOy = ∠xOy / 2.<br>• <b>Tính chất & Dấu hiệu a // b:</b> Hai góc <b>so le trong</b> bằng nhau; hai góc <b>đồng vị</b> bằng nhau; hai góc <b>trong cùng phía bù nhau (= 180°)</b>. Nếu a ⊥ c và b ⊥ c thì <b>a // b</b>.' },
            { tag: 'Tam giác thường bằng nhau & Tam giác cân, đều', topicId: 'g7_geom_tri', body: '• Trong △ABC: <b>∠A + ∠B + ∠C = 180°</b>; góc ngoài tại C bằng ∠A + ∠B.<br>• <b>3 TH bằng nhau tam giác thường:</b> <b>c.c.c</b> · <b>c.g.c</b> (góc xen giữa 2 cạnh!) · <b>g.c.g</b>.<br>• <b>Tam giác cân (AB = AC):</b> ∠B = ∠C = (180° − ∠A)/2. Tam giác cân có 1 góc bằng <b>60°</b> là <b>tam giác đều</b>.' },
            { tag: '4 TH bằng nhau của Tam giác vuông & Vuông cân', topicId: 'g7_geom_right_tri', body: '• <b>4 TH bằng nhau tam giác vuông:</b> (1) Hai cạnh góc vuông · (2) Cạnh góc vuông – góc nhọn kề · (3) <b>Cạnh huyền – góc nhọn</b> · (4) <b>Cạnh huyền – cạnh góc vuông</b>.<br>• Tam giác vuông cân có 2 góc nhọn đều bằng <b>45°</b>.' },
            { tag: 'Quan hệ Góc – Cạnh, Đường xiên & BĐT Tam giác', topicId: 'g7_geom_ineq', body: '• Đối diện với <b>cạnh lớn hơn là góc lớn hơn</b>; đường vuông góc ngắn hơn mọi đường xiên.<br>• <b>Bất đẳng thức tam giác:</b> <span class="kh-formula">|a − b| &lt; c &lt; a + b</span> (<i>Bẫy hay thi:</i> Tam giác cân có 2 cạnh là 3 cm và 7 cm ⇒ cạnh bên bắt buộc là <b>7 cm</b> vì 3 + 3 &lt; 7!).' },
            { tag: 'Bốn đường đồng quy & Hình lăng trụ đứng', topicId: 'g7_geom_lines', body: '• <b>Trọng tâm G</b> (giao 3 trung tuyến): <span class="kh-formula">AG = (2/3)AM · GM = (1/3)AM</span> · Giao 3 phân giác cách đều 3 cạnh · Giao 3 trung trực cách đều 3 đỉnh · Giao 3 đường cao là <b>Trực tâm H</b>.<br>• <b>Hình lăng trụ đứng:</b> <b>Sxq = C_đáy · h</b>; Stp = Sxq + 2·S_đáy; <b>V = S_đáy · h</b>.' }
          ]
        },
        {
          domain: 'stats',
          titleVi: 'Thống kê & Xác suất Lớp 7',
          items: [
            { tag: 'Biểu đồ đoạn thẳng & Biểu đồ hình quạt tròn', topicId: 'g7_prob_stat', body: '• <b>Biểu đồ đoạn thẳng:</b> Biểu diễn xu hướng thay đổi theo thời gian · <b>Biểu đồ quạt tròn:</b> Cơ cấu tỉ lệ phần trăm (tổng 100%).' },
            { tag: 'Biến cố & Xác suất đồng khả năng', topicId: 'g7_prob_stat', body: '• <b>Biến cố chắc chắn:</b> P = 1 · <b>Biến cố không thể:</b> P = 0 · <b>Biến cố ngẫu nhiên:</b> 0 &lt; P &lt; 1.<br>• Có n kết quả đồng khả năng thì mỗi kết quả có xác suất bằng <b>1/n</b>.' }
          ]
        }
      ]
    },

    // =========================================================================
    // LỚP 8 (GDPT 2018 — đủ 3 mạch)
    // =========================================================================
    8: {
      level: 'secondary',
      summaryVi: 'Chuẩn GDPT 2018 Lớp 8: Đơn thức & Đa thức nhiều biến, Trọn bộ 7 Hằng đẳng thức, 4 phương pháp Phân tích nhân tử, Phân thức đại số, Phương trình bậc nhất & Lập PT, Hàm số y = ax + b (Oxy); Định lý Pythagore, 5 Tứ giác đặc biệt, Trung tuyến cạnh huyền, Định lý Thalès – Phân giác, Tam giác đồng dạng, Hình chóp đều & Xác suất lý thuyết.',
      sections: [
        {
          domain: 'number',
          titleVi: 'Số học & Đại số Lớp 8',
          items: [
            { tag: 'Đơn thức, Đa thức nhiều biến & Nhân chia đa thức', topicId: 'g8_poly_ops', body: '• <b>Bậc của đơn thức thu gọn</b> (hệ số ≠ 0) là <b>tổng số mũ của tất cả các biến</b> (VD: −5x²y³z có bậc 2 + 3 + 1 = 6).<br>• <b>Bậc của đa thức thu gọn</b> là bậc cao nhất trong các hạng tử (phải thu gọn các hạng tử đồng dạng trước!).' },
            { tag: 'Trọn bộ 7 Hằng đẳng thức đáng nhớ & Cực trị', topicId: 'g8_id', body: '1) <b>(A + B)² = A² + 2AB + B²</b> &nbsp;·&nbsp; 2) <b>(A − B)² = A² − 2AB + B²</b><br>3) <b>A² − B² = (A − B)(A + B)</b><br>4) <b>(A + B)³ = A³ + 3A²B + 3AB² + B³</b> &nbsp;·&nbsp; 5) <b>(A − B)³ = A³ − 3A²B + 3AB² − B³</b><br>6) <b>A³ + B³ = (A + B)(A² − AB + B²)</b> &nbsp;·&nbsp; 7) <b>A³ − B³ = (A − B)(A² + AB + B²)</b><br>• <b>Mẹo tìm GTNN / GTLN bậc hai:</b> x² + bx + c = <b>(x + b/2)² + (c − b²/4) ≥ c − b²/4</b> (GTNN tại x = −b/2).' },
            { tag: '4 Phương pháp Phân tích đa thức thành nhân tử', topicId: 'g8_factor', body: '1) <b>Đặt nhân tử chung</b> · 2) <b>Dùng hằng đẳng thức</b> · 3) <b>Nhóm hạng tử</b>.<br>4) <b>Tách hạng tử tam thức ax² + bx + c:</b> Tìm m, n sao cho <b>m + n = b</b> và <b>m · n = a · c</b> rồi nhóm (VD: x² − 5x + 6 = (x − 2)(x − 3)).' },
            { tag: 'Phân thức đại số (ĐKXĐ, Rút gọn, +, −, ×, ÷)', topicId: 'g8_poly', body: '• <b>ĐKXĐ</b> của A(x)/B(x) là <b>B(x) ≠ 0</b> (luôn đối chiếu ĐKXĐ trước khi kết luận!).<br>• Đổi dấu: <b>A/(−B) = (−A)/B = −(A/B)</b> · Quy đồng MTC rồi cộng/trừ tử thức · Chia phân thức: nhân nghịch đảo.' },
            { tag: 'Phương trình bậc nhất một ẩn & Lập phương trình', topicId: 'g8_word_eq', body: '• ax + b = 0: Khi a ≠ 0 có nghiệm duy nhất <b>x = −b/a</b> (a = 0, b ≠ 0 vô nghiệm; a = b = 0 vô số nghiệm).<br>• <b>Lập PT giải toán (chuyển từ cuối Lớp 8):</b> Chuyển động (s = v·t), Năng suất (A = N·t), Phần trăm / Tài chính.' },
            { tag: 'Mặt phẳng tọa độ Oxy & Hàm số bậc nhất y = ax + b', topicId: 'g8_func', body: '• Hàm số y = ax + b (a ≠ 0) có <b>hệ số góc a</b>, cắt Oy tại <b>(0; b)</b>, cắt Ox tại <b>(−b/a; 0)</b>.<br>• Hai đường thẳng y = ax + b và y = a\'x + b\': <b>Song song</b> khi a = a\' và b ≠ b\' · <b>Cắt nhau</b> khi a ≠ a\' · <b>Trùng nhau</b> khi a = a\', b = b\' · <b>Vuông góc</b> khi a · a\' = −1.' }
          ]
        },
        {
          domain: 'geometry',
          titleVi: 'Hình học Lớp 8',
          diagramGrade: 8,
          items: [
            { tag: 'Định lý Pythagore (Chuyển từ Lớp 7 lên Lớp 8 mới)', topicId: 'g8_geom_pytha', body: '• △ABC vuông tại A ⇔ <b>BC² = AB² + AC²</b> · Bộ số vàng: <b>(3,4,5); (6,8,10); (5,12,13); (8,15,17); (7,24,25)</b>.' },
            { tag: 'Trung tuyến cạnh huyền & Đường trung bình', topicId: 'g8_geom_mid_med', body: '• Trong tam giác vuông, <b>đường trung tuyến ứng với cạnh huyền bằng nửa cạnh huyền (AM = BC / 2)</b>.<br>• Đường trung bình tam giác MN = BC / 2 · Đường trung bình hình thang bằng nửa tổng hai đáy: <b>MN = (a + b) / 2</b>.' },
            { tag: 'Tứ giác & Dấu hiệu nhận biết 5 Tứ giác đặc biệt', topicId: 'g8_geom_quad', body: '• Tổng 4 góc tứ giác = <b>360°</b>.<br>• <b>Thang cân:</b> 2 góc kề đáy = nhau (hoặc 2 đường chéo = nhau) · <b>Bình hành:</b> cặp cạnh đối // và = (hoặc 2 đường chéo cắt tại trung điểm).<br>• <b>Chữ nhật:</b> 3 góc vuông / HBH có 1 góc vuông hoặc 2 đường chéo = nhau · <b>Hình thoi:</b> 4 cạnh = nhau / HBH có 2 đường chéo ⊥ · <b>Hình vuông:</b> vừa là HCN vừa là Hình thoi.' },
            { tag: 'Định lý Thalès thuận – đảo – hệ quả & Đường phân giác', topicId: 'g8_geom_thales', body: '• <b>DE // BC (Thalès & Hệ quả):</b> <span class="kh-formula">AD/DB = AE/EC &nbsp;;&nbsp; AD/AB = AE/AC = DE/BC</span>.<br>• <b>Đường phân giác trong AD:</b> <span class="kh-formula">DB / DC = AB / AC</span>.' },
            { tag: 'Tam giác đồng dạng (c.c.c, c.g.c, g.g) & Hình chóp đều', topicId: 'g8_geom_sim', body: '• Khi △A\'B\'C\' ∽ △ABC theo tỉ số k: Tỉ số chu vi & đường cao = <b>k</b>, nhưng <b>Tỉ số DIỆN TÍCH S\' / S = k²</b>!<br>• <b>Hình chóp tam giác đều & tứ giác đều:</b> <b>Sxq = p · d</b> (nửa chu vi đáy × trung đoạn); <b>V = (1/3) · S_đáy · h</b>.' }
          ]
        },
        {
          domain: 'stats',
          titleVi: 'Thống kê & Xác suất Lớp 8',
          items: [
            { tag: 'Phân loại dữ liệu & Lựa chọn Biểu đồ', topicId: 'g8_stat_chart', body: '• Dữ liệu định tính vs định lượng (rời rạc / liên tục) · So sánh → Cột/Cột kép; Xu hướng thời gian → Đoạn thẳng; Cơ cấu % → Quạt tròn.' },
            { tag: 'Xác suất lý thuyết & Xác suất thực nghiệm', topicId: 'g8_prob_stat', body: '• <b>Xác suất lý thuyết:</b> <span class="kh-formula">P(E) = n(E) / n(Ω)</span> · Khi số phép thử n đủ lớn, xác suất thực nghiệm k/n xấp xỉ P(E).' }
          ]
        }
      ]
    },

    // =========================================================================
    // LỚP 9 (GDPT 2018 & Tuyển sinh vào Lớp 10 mới — trọn bộ 10 chương & 19 chuyên mục)
    // =========================================================================
    9: {
      level: 'secondary',
      summaryVi: 'Chuẩn GDPT 2018 Lớp 9 & Thi vào 10 (Cập nhật Thông tư 32, CV 7991 & Thông tư 30/2024): Phương trình bậc nhất 2 ẩn & Hệ PT, PT tích & chứa ẩn ở mẫu, Bất đẳng thức & Bất phương trình, Căn thức & Bài toán phụ √x, Parabol y = ax², PT bậc hai & Tham số m Viète; Lượng giác, Đường tròn & Vị trí tương đối 2 đường tròn, Góc nội tiếp & Tứ giác nội tiếp, Đa giác đều & Phép quay (mới 100%), Cung tròn – Quạt tròn – Vành khuyên, Trụ – Nón – Cầu; Thống kê ghép nhóm [a; b) & Không gian mẫu Ω.',
      sections: [
        {
          domain: 'number',
          titleVi: 'Số học & Đại số Lớp 9 (Trọng tâm Thi vào 10)',
          items: [
            { tag: 'Phương trình bậc nhất hai ẩn ax + by = c', topicId: 'g9_linear2_eq', body: '• Dạng ax + by = c (a ≠ 0 hoặc b ≠ 0) luôn có vô số nghiệm; tập nghiệm biểu diễn bởi một đường thẳng trên mặt phẳng Oxy.<br>• Nếu b ≠ 0 thì nghiệm tổng quát: <b>y = (c − ax) / b</b> (x ∈ ℝ tùy ý). Để tìm nghiệm nguyên dương (x, y ∈ ℕ*), rút ẩn có hệ số nhỏ hơn và chặn khoảng.' },
            { tag: 'Hệ hai phương trình bậc nhất hai ẩn (x, y)', topicId: 'g9_sys_eq', body: '• Giải bằng <b>phương pháp thế</b> hoặc <b>cộng đại số</b>.<br>• <b>Nhẩm nhanh số nghiệm của hệ { a₁x + b₁y = c₁ ; a₂x + b₂y = c₂ } (a₂, b₂, c₂ ≠ 0):</b><br>  ◦ Nghiệm duy nhất ⇔ <b>a₁/a₂ ≠ b₁/b₂</b> · Vô nghiệm ⇔ <b>a₁/a₂ = b₁/b₂ ≠ c₁/c₂</b> · Vô số nghiệm ⇔ <b>a₁/a₂ = b₁/b₂ = c₁/c₂</b>.' },
            { tag: 'PT tích & PT chứa ẩn ở mẫu (Chuyển từ Lớp 8 lên Lớp 9)', topicId: 'g9_ineq_eq', body: '• <b>Phương trình tích:</b> A(x)·B(x) = 0 ⇔ A(x) = 0 hoặc B(x) = 0.<br>• <b>PT chứa ẩn ở mẫu:</b> Bước 1 đặt <b>ĐKXĐ (tất cả mẫu ≠ 0)</b> → Bước 2 quy đồng khử mẫu → Bước 3 giải PT → Bước 4 <b>đối chiếu ĐKXĐ</b> loại nghiệm ngoại lai!' },
            { tag: 'Bất đẳng thức, Bất phương trình & Lập BPT thực tế', topicId: 'g9_ineq_linear', body: '• Tính chất bắc cầu & cộng hai vế giữ nguyên chiều · Nhân/chia hai vế với <b>số dương giữ nguyên chiều</b>, nhưng nhân/chia với <b>SỐ ÂM PHẢI ĐỔI CHIỀU</b> (&lt; ↔ &gt;, ≤ ↔ ≥)!<br>• <b>Toán thực tế BPT (rất hay ra thi giữa kỳ & vào 10):</b> Bài toán ngân sách mua tối đa bao nhiêu sản phẩm, điểm tối thiểu để đạt mục tiêu, cước phí tối ưu.' },
            { tag: 'Căn bậc hai, Trục căn thức liên hợp & Căn bậc ba', topicId: 'g9_sqrt', body: '• ĐKXĐ của √A là <b>A ≥ 0</b>; hằng đẳng thức sống còn: <b>√(A²) = |A|</b> (VD: √((2 − √5)²) = √5 − 2).<br>• <b>Nhân liên hợp khử căn ở mẫu:</b> <span class="kh-formula">m/(√a ∓ √b) = m(√a ± √b)/(a − b)</span>.<br>• <b>Căn bậc ba:</b> ∛(A³) = A với <b>mọi A ∈ ℝ</b> (xác định với cả số âm: ∛(−64) = −4).' },
            { tag: 'Rút gọn biểu thức chứa √x & 3 Câu hỏi phụ (Câu 1 vào 10)', topicId: 'g9_rad_reduce', body: '• Lưu ý ĐKXĐ thường là <b>x ≥ 0, x ≠ a²</b>; phân tích x − a = (√x − √a)(√x + √a) và x√x ± 1 = (√x ± 1)(x ∓ √x + 1).<br>• <b>Câu phụ 1 (Tìm x ∈ ℤ để P = k/(√x + a) ∈ ℤ):</b> Cho (√x + a) thuộc tập ước nguyên của k rồi giải tìm x nguyên.<br>• <b>Câu phụ 2 (Tìm x thực để P ∈ ℤ):</b> Đánh giá chặn khoảng <b>m &lt; P &lt; n</b> rồi xét các giá trị nguyên của P trong khoảng đó.<br>• <b>Câu phụ 3 (Tìm GTNN/GTLN):</b> Dùng BĐT Cauchy (AM-GM) cho 2 số dương: <b>A + B ≥ 2√(AB)</b> (dấu "=" khi A = B).' },
            { tag: 'Parabol (P): y = ax² (a ≠ 0) & Tương giao với (d)', topicId: 'g9_func', body: '• Đỉnh O(0; 0), trục đối xứng Oy. Nếu a &gt; 0: bề lõm quay lên, đồng biến khi x &gt; 0, nghịch biến khi x &lt; 0, GTNN y = 0 tại x = 0.<br>• <b>Phương trình hoành độ giao điểm của (P) và (d): y = mx + n</b> là: <b>ax² − mx − n = 0</b> (Δ &gt; 0 cắt tại 2 điểm phân biệt; Δ = 0 tiếp xúc; Δ &lt; 0 không cắt).' },
            { tag: 'Phương trình bậc hai ax² + bx + c = 0 & Nhẩm nghiệm', topicId: 'g9_eq', body: '• <b>Δ = b² − 4ac</b> (hoặc Δ\' = b\'² − ac với b = 2b\'): Δ &gt; 0 có x₁,₂ = (−b ± √Δ)/(2a); Δ = 0 có nghiệm kép x = −b/(2a).<br>• <b>Nhẩm nghiệm nhanh:</b> Nếu <b>a + b + c = 0</b> ⇒ x₁ = 1, x₂ = c/a · Nếu <b>a − b + c = 0</b> ⇒ x₁ = −1, x₂ = −c/a.' },
            { tag: 'Định lý Viète, Biểu thức đối xứng & Biện luận tham số m', topicId: 'g9_vieta_param', body: '• Với Δ ≥ 0: <span class="kh-formula">S = x₁ + x₂ = −b/a &nbsp;;&nbsp; P = x₁ · x₂ = c/a</span>.<br>• <b>Biến đổi đối xứng bắt buộc thuộc:</b> <b>x₁² + x₂² = S² − 2P</b> · <b>(x₁ − x₂)² = S² − 4P</b> · <b>|x₁ − x₂| = √(S² − 4P)</b> · <b>x₁³ + x₂³ = S³ − 3SP</b> · 1/x₁ + 1/x₂ = S/P (P ≠ 0).<br>• <b>Dấu nghiệm:</b> 2 nghiệm trái dấu ⇔ <b>a·c &lt; 0</b> (không cần xét Δ!) · 2 nghiệm dương phân biệt ⇔ Δ &gt; 0, S &gt; 0, P &gt; 0 · 2 nghiệm âm phân biệt ⇔ Δ &gt; 0, S &lt; 0, P &gt; 0.' },
            { tag: 'Lập PT / Hệ PT, Tài chính Lãi kép & Tối ưu thực tiễn', topicId: 'g9_word_sys', body: '• <b>4 dạng lập PT/Hệ PT vào 10:</b> Chuyển động bộ/thủy (s = v·t), Công việc chung / Vòi nước (1/x + 1/y = 1/t), Tăng giảm kích thước hình học, Kinh tế – % – Giá điện nước bậc thang.<br>• <b>Lãi kép sau n kỳ:</b> <b>T = A · (1 + r)^n</b> · <b>Tối ưu doanh thu/diện tích:</b> lập hàm bậc hai đưa về −a(x − x₀)² + M ≤ M.' }
          ]
        },
        {
          domain: 'geometry',
          titleVi: 'Hình học Lớp 9 (Trọng tâm Thi vào 10)',
          diagramGrade: 9,
          items: [
            { tag: 'Tỉ số lượng giác góc nhọn & Hệ thức cạnh – góc', topicId: 'g9_geom_trig', body: '• <b>sin = Đối/Huyền · cos = Kề/Huyền · tan = Đối/Kề · cot = Kề/Đối</b> · Hai góc phụ nhau (α + β = 90°): sin α = cos β, tan α = cot β; sin²α + cos²α = 1.<br>• <b>Góc đặc biệt:</b> 30° (sin = 1/2, cos = √3/2, tan = √3/3) · 45° (sin = cos = √2/2, tan = 1) · 60° (sin = √3/2, cos = 1/2, tan = √3).<br>• <b>Hệ thức cạnh – góc (SGK 2018 trọng tâm):</b> Cạnh góc vuông = Cạnh huyền × sin(góc đối) = Cạnh huyền × cos(góc kề) = Cạnh góc vuông kia × tan(góc đối). <i>(Khi chứng minh AH² = BH·CH, AB² = BH·BC trong đề thi mới nên chứng minh qua tam giác đồng dạng △ABH ∽ △CBA!)</i>' },
            { tag: 'Đường tròn (O; R): Dây cung & Hai tiếp tuyến cắt nhau', topicId: 'g9_geom_chord', body: '• Đường kính vuông góc với dây thì đi qua <b>trung điểm</b> của dây ấy (lưu ý: đường kính đi qua trung điểm của dây <i>không đi qua tâm</i> thì vuông góc với dây ấy). Liên hệ Pythagore: <b>R² = d² + (AB / 2)²</b>.<br>• <b>Hai tiếp tuyến MA, MB cắt nhau tại M:</b> <b>MA = MB</b>; MO là phân giác ∠AMB; OM là phân giác ∠AOB và <b>OM là đường trung trực của AB (OM ⊥ AB tại H)</b>.' },
            { tag: 'Vị trí tương đối Đường thẳng – Đường tròn & Hai đường tròn', topicId: 'g9_geom_pos_cir', body: '• Đường thẳng & (O; R) (khoảng cách d): d &lt; R cắt nhau · <b>d = R tiếp xúc (tiếp tuyến)</b> · d &gt; R không giao nhau.<br>• <b>Hai đường tròn (O; R) và (O\'; r) (R ≥ r, nối tâm d = OO\'):</b><br>  ◦ <b>Cắt nhau:</b> R − r &lt; d &lt; R + r (2 điểm chung, 2 tiếp tuyến chung)<br>  ◦ <b>Tiếp xúc ngoài:</b> <b>d = R + r</b> (3 tiếp tuyến chung) &nbsp;·&nbsp; <b>Tiếp xúc trong:</b> <b>d = R − r &gt; 0</b> (1 tiếp tuyến chung)<br>  ◦ <b>Ngoài nhau:</b> d &gt; R + r (4 tiếp tuyến chung) &nbsp;·&nbsp; <b>Đựng nhau:</b> d &lt; R − r (0 điểm chung).' },
            { tag: 'Góc ở tâm, Góc nội tiếp & 4 Dấu hiệu Tứ giác nội tiếp', topicId: 'g9_geom_angle', body: '• <b>Góc ở tâm</b> = sđ cung bị chắn · <b>Góc nội tiếp</b> = <b>1/2 sđ cung bị chắn</b> (= 1/2 góc ở tâm cùng chắn cung). Góc nội tiếp chắn nửa đường tròn = <b>90°</b>.<br>• <b>4 phương pháp chứng minh Tứ giác ABCD nội tiếp (câu bắt buộc Bài Hình vào 10):</b><br>  1) Tổng hai góc đối bằng <b>180°</b> (∠A + ∠C = 180°, thường là hai góc vuông đối diện 90° + 90° = 180°).<br>  2) Hai đỉnh kề nhau cùng nhìn một cạnh dưới hai góc bằng nhau (∠BAC = ∠BDC).<br>  3) Góc ngoài tại một đỉnh bằng góc trong tại đỉnh đối diện.<br>  4) Bốn đỉnh cùng cách đều một điểm cố định I.' },
            { tag: 'Đường tròn Ngoại/Nội tiếp, Đa giác đều & Phép quay (Mới 2018!)', topicId: 'g9_geom_poly_rot', body: '• <b>Tam giác vuông:</b> Tâm đường tròn ngoại tiếp là <b>trung điểm cạnh huyền</b>, bán kính <b>R = cạnh huyền / 2</b>.<br>• <b>Tam giác đều cạnh a:</b> Tâm ngoại tiếp và nội tiếp trùng trọng tâm G; <b>R = a√3 / 3</b>, <b>r = a√3 / 6</b> (luôn có R = 2r). Hình vuông cạnh a có <b>R = a√2 / 2</b>, <b>r = a / 2</b>. Lục giác đều cạnh a nội tiếp (O; R) có <b>a = R</b>.<br>• <b>Đa giác đều n cạnh & Phép quay (chương mới SGK 2018):</b> Mỗi góc trong bằng <b>(n − 2)·180° / n</b>. Các phép quay tâm O biến đa giác đều n cạnh thành chính nó có góc quay là bội của <b>α_min = 360° / n</b> (tam giác đều: 120°, 240°; hình vuông: 90°, 180°, 270°; lục giác đều: 60°, 120°, 180°, 240°, 300°).' },
            { tag: 'Độ dài Cung tròn, Diện tích Quạt tròn & Vành khuyên', topicId: 'g9_geom_arc', body: '• Chu vi C = 2πR · Độ dài cung n°: <b>l = (π · R · n) / 180</b>.<br>• Diện tích hình tròn S = πR² · <b>Diện tích quạt tròn n°:</b> <b>S_quạt = (π · R² · n) / 360 = (l · R) / 2</b>.<br>• <b>Hình vành khuyên</b> (đồng tâm R &gt; r): <b>S = π(R² − r²)</b> · Hình viên phân: S_quạt − S_tam giác.' },
            { tag: 'Hình trụ, Hình nón & Hình cầu trong thực tiễn', topicId: 'g9_geom_solid', body: '• <b>Hình trụ (r, h):</b> Sxq = <b>2πrh</b> · Stp = 2πr(r + h) · <b>V = πr²h</b>.<br>• <b>Hình nón (r, h, đường sinh l = √(r² + h²)):</b> Sxq = <b>πrl</b> · Stp = πr(l + r) · <b>V = (1/3)πr²h</b>.<br>• <b>Hình cầu (R):</b> Diện tích mặt cầu <b>S = 4πR²</b> · Thể tích <b>V = (4/3)πR³</b>.' }
          ]
        },
        {
          domain: 'stats',
          titleVi: 'Thống kê ghép nhóm & Xác suất Lớp 9 (Mới 2018)',
          items: [
            { tag: 'Bảng tần số, Tần số tương đối & Mẫu ghép nhóm [a; b)', topicId: 'g9_stat_grouped', body: '• Cỡ mẫu <b>N = m₁ + m₂ + ... + m_k</b> · Tần số tương đối: <b>f_i = (m_i / N) · 100%</b> (biểu diễn bằng biểu đồ cột tần số tương đối hoặc quạt tròn; biểu đồ tần số ghép nhóm dạng cột sát nhau histogram).<br>• <b>Mẫu số liệu ghép nhóm [a; b)</b> (gồm các giá trị a ≤ x &lt; b): <b>Giá trị đại diện c_i = (a + b) / 2</b>; số trung bình xấp xỉ <b>x̄ = (m₁c₁ + ... + m_kc_k) / N</b>.' },
            { tag: 'Phép thử ngẫu nhiên, Không gian mẫu Ω & Xác suất vào 10', topicId: 'g9_prob_omega', body: '• <b>Không gian mẫu Ω:</b> Gieo 2 đồng xu n(Ω) = 4; gieo 2 xúc xắc n(Ω) = 6 × 6 = <b>36</b>; lấy lần lượt có hoàn lại n·n, không hoàn lại có thứ tự n(n − 1), chọn đồng thời 2 phần tử không thứ tự <b>n(n − 1)/2</b>.<br>• Xác suất đồng khả năng: <b>P(A) = n(A) / n(Ω)</b> · Biến cố đối Ā: <b>P(A) = 1 − P(Ā)</b>.' }
          ]
        }
      ]
    }
  };

  function buildMoetReformHtml() {
    return `
      <div class="kh-wrap kh-reform-wrap">
        <p class="kh-summary">Tổng hợp hệ thống văn bản chỉ đạo của Bộ GD&ĐT (Thông tư 32/2018, Thông tư 27/2020, Thông tư 22/2021, Công văn 7991/BGDĐT-GDTrH, Thông tư 30/2024), đối chiếu 3 bộ Sách giáo khoa hiện hành và lộ trình dịch chuyển kiến thức từ Lớp 1 đến Lớp 9 giúp học sinh ôn đúng trọng tâm, không học lan man phần đã giảm tải.</p>
        <div class="kh-sections-grid is-two-col">
          <div class="kh-sec-card kh-dom-number">
            <div class="kh-sec-head-row"><h4 class="kh-sec-title">1. Hệ thống Thông tư & Quy định Kiểm tra – Đánh giá mới</h4></div>
            <div class="kh-items">
              <div class="kh-item">
                <div class="kh-item-top"><span class="kh-tag">Thông tư 32/2018/TT-BGDĐT (CT GDPT 2018)</span></div>
                <div class="kh-body">• Chuyển từ truyền thụ kiến thức thuần túy sang phát triển <b>5 năng lực toán học</b> (tư duy – lập luận, mô hình hóa, giải quyết vấn đề, giao tiếp, sử dụng công cụ).<br>• Cấu trúc xuyên suốt <b>3 mạch bắt buộc</b> từ Tiểu học đến THPT: <b>Số & Đại số · Hình học & Đo lường · Một số yếu tố Thống kê & Xác suất</b> (nâng tỷ trọng Thống kê – Xác suất và Toán tài chính thực tiễn).</div>
              </div>
              <div class="kh-item">
                <div class="kh-item-top"><span class="kh-tag">Thông tư 27/2020 (Tiểu học) & Thông tư 22/2021 (THCS)</span></div>
                <div class="kh-body">• Đánh giá vì sự tiến bộ của học sinh; bài kiểm tra định kỳ xây dựng theo ma trận năng lực: <b>Nhận biết (40%) – Thông hiểu (30%) – Vận dụng (30%)</b>, gắn liền ngữ cảnh thực tế đời sống.</div>
              </div>
              <div class="kh-item">
                <div class="kh-item-top"><span class="kh-tag">Công văn 7991/BGDĐT-GDTrH (Đề kiểm tra định kỳ mới)</span></div>
                <div class="kh-body">• Chuẩn hóa cấu trúc đề kiểm tra mới kết hợp <b>Trắc nghiệm khách quan + Tự luận</b> với các dạng thức hiện đại: (1) Nhiều lựa chọn A–B–C–D, (2) Đúng/Sai theo mệnh đề, (3) <b>Trả lời ngắn điền kết quả số</b> (tương ứng trực tiếp chế độ Tự luận gõ đáp số trên NumiQuick), và (4) Tự luận trình bày lời giải.</div>
              </div>
              <div class="kh-item">
                <div class="kh-item-top"><span class="kh-tag">Thông tư 30/2024/TT-BGDĐT (Tuyển sinh vào Lớp 10 mới)</span></div>
                <div class="kh-body">• Đề thi vào Lớp 10 THPT từ năm 2025 bám sát 100% chương trình Toán 9 GDPT 2018 với <b>6 nhóm câu chuẩn</b>: (1) Rút gọn căn thức √x & câu phụ nguyên/cực trị; (2) Lập PT/Hệ PT thực tế; (3) Parabol & PT bậc hai – Viète; (4) <b>Thống kê ghép nhóm & Xác suất không gian mẫu Ω</b>; (5) Hình không gian thực tế Trụ – Nón – Cầu; (6) Hình học Đường tròn – Tứ giác nội tiếp.</div>
              </div>
            </div>
          </div>

          <div class="kh-sec-card kh-dom-geometry">
            <div class="kh-sec-head-row"><h4 class="kh-sec-title">2. Sách giáo khoa mới & Thay đổi Lộ trình học (2006 → 2018)</h4></div>
            <div class="kh-items">
              <div class="kh-item">
                <div class="kh-item-top"><span class="kh-tag">3 Bộ SGK: Kết nối tri thức · Chân trời sáng tạo · Cánh Diều</span></div>
                <div class="kh-body">• Cả 3 bộ sách đều tuân thủ <b>cùng một chuẩn yêu cầu cần đạt</b> của Bộ GD&ĐT (ra đề thi chung không phụ thuộc bộ sách). Sự khác nhau chủ yếu ở <b>trình tự sắp xếp chương giữa HK1 và HK2</b>, vì vậy ôn luyện theo từng chuyên đề độc lập trên NumiQuick tương thích trọn vẹn với cả 3 bộ SGK.</div>
              </div>
              <div class="kh-item">
                <div class="kh-item-top"><span class="kh-tag">Tiểu học (Lớp 1 → Lớp 5): Lộ trình & Giới hạn chuẩn</span></div>
                <div class="kh-body">• <b>Lớp 1:</b> Cộng trừ KHÔNG NHỚ PV 100 (chưa học nhân chia). <b>Lớp 2:</b> Cộng trừ CÓ NHỚ PV 100, PV 1.000, chỉ học bảng nhân chia 2 và 5, làm quen biểu đồ tranh & khả năng xảy ra.<br>• <b>Lớp 3:</b> Hoàn thiện bảng nhân chia 2–9, số đến 100.000, làm tròn số, số La Mã, diện tích vuông/HCN. <b>Lớp 4:</b> Lớp triệu, phân số (+,−,×,÷), góc (độ °), hình thoi/bình hành, biểu đồ cột. <b>Lớp 5:</b> Số thập phân, tỉ số %, chuyển động, hình hộp/lập phương/trụ/cầu, biểu đồ quạt tròn.</div>
              </div>
              <div class="kh-item">
                <div class="kh-item-top"><span class="kh-tag">THCS Lớp 6, 7, 8: Dịch chuyển chương mục quan trọng</span></div>
                <div class="kh-body">• <b>Lớp 6 mới:</b> Đưa sớm <i>Trục đối xứng – Tâm đối xứng, Chu vi/diện tích Thoi – Bình hành – Thang cân, Hình hộp – Lập phương, Biểu đồ cột kép & Xác suất thực nghiệm</i> ngay từ Lớp 6.<br>• <b>Lớp 7 mới:</b> Đưa <i>Hình lăng trụ đứng</i> từ Lớp 8 cũ xuống Lớp 7; bổ sung <i>Làm tròn theo độ chính xác d</i> & <i>Xác suất đồng khả năng</i>; <b>chuyển Định lý Pythagore lên Lớp 8</b>.<br>• <b>Lớp 8 mới:</b> Học <i>Định lý Pythagore</i>, <i>Hàm số bậc nhất y = ax + b</i> (chuyển từ Lớp 9 cũ xuống!) và <i>Hình chóp tam giác/tứ giác đều</i>; <b>chuyển PT tích, PT chứa ẩn ở mẫu & Bất phương trình lên Lớp 9</b>.</div>
              </div>
              <div class="kh-item">
                <div class="kh-item-top"><span class="kh-tag">Lớp 9 mới: Nội dung Mới 100% & Nội dung Đã giảm tải</span></div>
                <div class="kh-body">• <b>Tiếp nhận & Mở rộng mới:</b> <i>PT quy về bậc nhất, Bất phương trình bậc nhất 1 ẩn, Đa giác đều & Phép quay (α = 360°/n), Bảng tần số tương đối & Mẫu số liệu ghép nhóm [a; b), Không gian mẫu Ω & Xác suất</i>.<br>• <b>Đã giảm tải / Không thi:</b> Góc tạo bởi tia tiếp tuyến và dây cung (chỉ dùng góc nội tiếp & góc ở tâm), góc có đỉnh bên trong/bên ngoài đường tròn, cung chứa góc, hình nón cụt, trục căn thức quá phức tạp nhiều tầng.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function stripHtmlPlain(htmlStr) {
    return String(htmlStr || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function countKnowledgeItems(gradeNum) {
    const data = NUMI_KNOWLEDGE_BANK[Number(gradeNum) || 1];
    if (!data || !Array.isArray(data.sections)) return 0;
    return data.sections.reduce((sum, sec) => sum + (Array.isArray(sec.items) ? sec.items.length : 0), 0);
  }

  function buildKnowledgeCardHtml(gradeNum, activeDomain = 'all', compact = false, searchQuery = '') {
    if (activeDomain === 'reform') {
      return buildMoetReformHtml();
    }
    const g = Number(gradeNum) || 1;
    const data = NUMI_KNOWLEDGE_BANK[g] || NUMI_KNOWLEDGE_BANK[1];
    const qNorm = String(searchQuery || '').trim().toLowerCase();

    const filteredSections = data.sections
      .filter(sec => activeDomain === 'all' || sec.domain === activeDomain)
      .map(sec => {
        const items = qNorm
          ? sec.items.filter(it => `${it.tag} ${stripHtmlPlain(it.body)}`.toLowerCase().includes(qNorm))
          : sec.items;
        return { ...sec, items };
      })
      .filter(sec => sec.items.length > 0);

    if (!filteredSections.length) {
      return `<div class="kh-wrap">
        <div class="kh-empty-search">🔍 ${t('Không tìm thấy mục kiến thức phù hợp với từ khóa này trong Lớp ' + g + '. Hãy thử từ khóa khác nhé!', 'No matching formula found in Grade ' + g + '.')}</div>
      </div>`;
    }

    // Layout: when showing all 3 strands, put Number & Geometry side-by-side and Stats full-width below for balanced reading
    const mainTwo = filteredSections.filter(s => s.domain === 'number' || s.domain === 'geometry');
    const bottomFull = filteredSections.filter(s => s.domain !== 'number' && s.domain !== 'geometry');

    const renderSectionCard = (sec, fullWidth = false) => {
      const svgDiagram = !qNorm && sec.diagramGrade && GRADE_GEOM_DIAGRAMS[sec.diagramGrade]
        ? GRADE_GEOM_DIAGRAMS[sec.diagramGrade]
        : '';
      return `
        <div class="kh-sec-card kh-dom-${sec.domain} ${fullWidth ? 'kh-sec-wide' : ''}">
          <div class="kh-sec-head-row">
            <h4 class="kh-sec-title">${sec.titleVi}</h4>
            <span class="kh-sec-count">${sec.items.length} ${t('chủ đề', 'topics')}</span>
          </div>
          ${svgDiagram}
          <div class="kh-items ${fullWidth && sec.items.length > 1 ? 'kh-items-2col' : ''}">
            ${sec.items.map(it => `
              <div class="kh-item">
                <div class="kh-item-top">
                  <span class="kh-tag">${it.tag}</span>
                  ${!compact && it.topicId ? `<button type="button" class="kh-practice-chip no-print" data-kh-practice-topic="${esc(it.topicId)}" data-kh-practice-grade="${g}" title="${t('Làm bài tập dạng này ngay', 'Practice this topic now')}">${t('Luyện dạng này', 'Practice')} →</button>` : ''}
                </div>
                <div class="kh-body">${it.body}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    return `<div class="kh-wrap ${compact ? 'kh-compact' : ''}">
      ${!qNorm ? `<p class="kh-summary">${data.summaryVi}</p>` : ''}
      ${mainTwo.length ? `<div class="kh-sections-grid ${mainTwo.length > 1 ? 'is-two-col' : ''}">${mainTwo.map(s => renderSectionCard(s, false)).join('')}</div>` : ''}
      ${bottomFull.length ? `<div class="kh-sections-bottom">${bottomFull.map(s => renderSectionCard(s, true)).join('')}</div>` : ''}
    </div>`;
  }

  function jumpToTopicPractice(gradeNum, topicId, beforeNav) {
    const g = Number(gradeNum) || 1;
    if (typeof beforeNav === 'function') beforeNav();
    if (typeof nav === 'function') nav('setup');
    if (typeof applyGrade === 'function') applyGrade(g);
    if (topicId && topicId !== 'all') {
      const pill = typeof $ === 'function' ? $(`[data-grade-topic="${topicId}"]`) : null;
      if (pill && typeof pill.onclick === 'function') {
        // Ensure clean single-topic selection
        const allBtn = $(`[data-grade-topic="all"]`);
        if (allBtn && typeof allBtn.onclick === 'function') allBtn.onclick();
        const freshPill = $(`[data-grade-topic="${topicId}"]`);
        if (freshPill && typeof freshPill.onclick === 'function') freshPill.onclick();
      } else if (typeof config !== 'undefined') {
        config.grade = g;
        config.topic = topicId;
        config.topics = [topicId];
      }
      if (typeof toast === 'function') {
        toast(t(`Đã chọn chuyên đề Lớp ${g} — bấm "Bắt đầu học" để luyện ngay!`, `Selected Grade ${g} topic — tap Start to practice!`));
      }
    }
  }

  function bindPracticeTopicButtons(rootContainer, beforeNav) {
    const btns = rootContainer ? rootContainer.querySelectorAll('[data-kh-practice-topic]') : $$('[data-kh-practice-topic]');
    btns.forEach(btn => {
      btn.onclick = () => {
        const tpId = btn.dataset.khPracticeTopic;
        const gNum = Number(btn.dataset.khPracticeGrade) || 1;
        jumpToTopicPractice(gNum, tpId, beforeNav);
      };
    });
  }

  function printKnowledgeSheet(gradeNum) {
    if (typeof document === 'undefined') return;
    const g = Number(gradeNum) || 1;
    let sheet = document.getElementById('numiPrintSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'numiPrintSheet';
      sheet.className = 'numi-print-sheet';
      document.body.append(sheet);
    }
    const today = new Date().toLocaleDateString('vi-VN');
    sheet.innerHTML = `
      <div class="ws-a4-paper kh-print-paper">
        <div class="ws-header">
          <div>
            <div class="ws-brand">NUMIQUICK · SỔ TAY LÝ THUYẾT & CÔNG THỨC TOÁN GDPT 2018</div>
            <div class="ws-sub">Hệ thống đầy đủ 3 mạch: Số & Đại số · Hình học & Đo lường · Thống kê & Xác suất</div>
          </div>
          <div style="text-align:right;font-size:12px;font-weight:700">Khối: <b>Lớp ${g}</b> · Ngày in: ${today}</div>
        </div>
        <h2 class="ws-main-title">TỔNG HỢP KIẾN THỨC & CÔNG THỨC TRỌNG TÂM TOÁN LỚP ${g}</h2>
        ${buildKnowledgeCardHtml(g, 'all', true, '')}
      </div>
    `;
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }

  function openKnowledgeModal(initialGrade, initialDomain = 'all') {
    let curG = Number(initialGrade) || (typeof config !== 'undefined' && Number(config.grade)) || 6;
    if (!NUMI_KNOWLEDGE_BANK[curG]) curG = 6;
    let curDom = initialDomain || 'all';
    let curSearch = '';

    // Pause active primary quiz clock cleanly while reading formulas and resume on close
    const inQuiz = typeof view !== 'undefined' && view === 'quiz' && typeof session !== 'undefined' && session && !session.done && !session.answered;
    const untimedNow = typeof window !== 'undefined' && typeof window.isUntimedQuizSession === 'function' ? window.isUntimedQuizSession() : false;
    let pausedSecLeft = null;
    const pausedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (inQuiz && !untimedNow && typeof tick !== 'undefined') {
      const clkText = typeof $ === 'function' ? $('#clock')?.textContent : '';
      const parsed = parseFloat(clkText);
      if (Number.isFinite(parsed) && parsed > 0) {
        pausedSecLeft = parsed;
        clearInterval(tick);
      }
    }

    const resumeIfNeeded = () => {
      if (pausedSecLeft !== null && typeof view !== 'undefined' && view === 'quiz' && session && !session.done && !session.answered) {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        session.started = (session.started || pausedAt) + (now - pausedAt);
        const curQ = session.questions?.[session.index];
        const qSec = curQ?.topicSeconds || curQ?.config?.seconds || (typeof config !== 'undefined' ? config.seconds : 20);
        if (typeof startClock === 'function') {
          startClock(pausedSecLeft, () => {
            if (typeof timeoutAgain === 'function') timeoutAgain(qSec);
            else if (typeof answerQuiz === 'function') answerQuiz(null, curQ?.id);
          });
        }
      }
    };

    const renderInside = () => {
      const totalCards = countKnowledgeItems(curG);
      const bodyHtml = `
        <div class="kh-modal-shell">
          <div class="kh-modal-head">
            <div>
              <span class="eyebrow">NUMIQUICK · ${t('SỔ TAY KIẾN THỨC, CÔNG THỨC & LỘ TRÌNH GDPT 2018', 'COMPLETE GDPT 2018 MATH ENCYCLOPEDIA')}</span>
              <h2 style="margin:2px 0 0">${t(`Hệ thống Kiến thức & Công thức — Lớp ${curG}`, `Grade ${curG} Complete Study Guide`)} <small class="kh-total-badge">${totalCards} ${t('chuyên mục', 'core topics')}</small></h2>
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              <button type="button" class="ws-btn-sec no-print" id="khPrintBtn" title="${t('In sổ tay công thức A4', 'Print A4 Formula Sheet')}">${t('In sổ tay PDF', 'Print PDF')}</button>
              <button type="button" class="ws-btn-sec" id="khCloseBtn">✕</button>
            </div>
          </div>
          <div class="kh-grade-bar">
            <span class="kh-lvl-lbl">${t('Tiểu học:', 'Primary:')}</span>
            ${[1, 2, 3, 4, 5].map(g => `<button type="button" class="kh-g-pill ${curG === g ? 'active' : ''}" data-kh-grade="${g}">${t('Lớp', 'Gr')} ${g}</button>`).join('')}
            <span class="kh-lvl-lbl" style="margin-left:6px">${t('THCS:', 'Secondary:')}</span>
            ${[6, 7, 8, 9].map(g => `<button type="button" class="kh-g-pill ${curG === g ? 'active' : ''}" data-kh-grade="${g}">${t('Lớp', 'Gr')} ${g}</button>`).join('')}
          </div>
          <div class="kh-toolbar-row">
            <div class="kh-domain-tabs" role="tablist">
              <button type="button" class="kh-dom-btn ${curDom === 'all' ? 'active' : ''}" data-kh-dom="all">${t('Tất cả', 'All')}</button>
              <button type="button" class="kh-dom-btn ${curDom === 'number' ? 'active' : ''}" data-kh-dom="number">${t('Số học', 'Number & Algebra')}</button>
              <button type="button" class="kh-dom-btn ${curDom === 'geometry' ? 'active' : ''}" data-kh-dom="geometry">${t('Hình học', 'Geometry')}</button>
              <button type="button" class="kh-dom-btn ${curDom === 'stats' ? 'active' : ''}" data-kh-dom="stats">${t('Thống kê & Xác suất', 'Stats & Prob')}</button>
              <button type="button" class="kh-dom-btn ${curDom === 'reform' ? 'active' : ''}" data-kh-dom="reform">${t('Thông tư & Lộ trình mới', 'MOET Reform & Roadmap')}</button>
            </div>
            <input type="search" id="khSearchInput" class="kh-search-input" placeholder="${t('Tìm nhanh công thức, định lý...', 'Search formulas, theorems...')}" value="${esc(curSearch)}">
          </div>
          <div id="khContentBody">
            ${buildKnowledgeCardHtml(curG, curDom, inQuiz, curSearch)}
          </div>
          <div class="actions" style="margin-top:14px;justify-content:flex-end">
            ${!inQuiz ? `<button type="button" class="primary" id="khPracticeThisBtn">${t(`Vào luyện bài tập Lớp ${curG}`, `Practice Grade ${curG}`)} →</button>` : ''}
            <button type="button" id="khDoneBtn" class="${inQuiz ? 'primary' : ''}">${inQuiz ? t('Quay lại làm bài tiếp', 'Back to Quiz') : t('Đóng', 'Close')}</button>
          </div>
        </div>
      `;
      modal(bodyHtml, resumeIfNeeded);
      const modalEl = $('#modal');
      if (modalEl && modalEl.classList) modalEl.classList.add('kh-wide-modal');
      const closeDef = $('#closeModal');
      if (closeDef) closeDef.hidden = true;

      const cleanClose = () => {
        if (modalEl && modalEl.classList) modalEl.classList.remove('kh-wide-modal');
        if (closeDef) closeDef.hidden = false;
        $('#modal')?.close();
      };

      const refreshCardsOnly = () => {
        const bodyHost = $('#khContentBody');
        if (bodyHost) {
          bodyHost.innerHTML = buildKnowledgeCardHtml(curG, curDom, inQuiz, curSearch);
          bindPracticeTopicButtons(bodyHost, () => { pausedSecLeft = null; cleanClose(); });
        }
      };

      $('#khCloseBtn')?.addEventListener('click', cleanClose);
      $('#khDoneBtn')?.addEventListener('click', cleanClose);
      $('#khPrintBtn')?.addEventListener('click', () => printKnowledgeSheet(curG));
      $('#khPracticeThisBtn')?.addEventListener('click', () => {
        const targetGrade = curG;
        const targetDom = (curG >= 6 && (curDom === 'number' || curDom === 'geometry')) ? curDom : 'all';
        pausedSecLeft = null;
        cleanClose();
        if (typeof nav === 'function') nav('setup');
        if (typeof applyGrade === 'function') applyGrade(targetGrade);
        if (targetDom !== 'all' && typeof window.applySecondaryDomainFilter === 'function') {
          window.applySecondaryDomainFilter(targetDom);
        }
      });

      $('#khSearchInput')?.addEventListener('input', e => {
        curSearch = e.target.value || '';
        refreshCardsOnly();
      });

      $$('[data-kh-grade]').forEach(btn => {
        btn.onclick = () => {
          curG = Number(btn.dataset.khGrade) || 1;
          renderInside();
        };
      });
      $$('[data-kh-dom]').forEach(btn => {
        btn.onclick = () => {
          curDom = btn.dataset.khDom || 'all';
          $$('[data-kh-dom]').forEach(x => x.classList.toggle('active', x.dataset.khDom === curDom));
          refreshCardsOnly();
        };
      });
      bindPracticeTopicButtons($('#khContentBody'), () => { pausedSecLeft = null; cleanClose(); });
    };

    renderInside();
  }

  // =========================================================================
  // 2. DYNAMIC GEOMETRY & VISUAL MATH SVG BUILDER (Grades 1–9)
  // =========================================================================
  function buildGeometryVisualSvg(q) {
    if (!q) return '';
    const kind = q.visualKind || '';
    const d = q.visualData || {};
    const txt = String(q.q || '');

    if (kind === 'thales' || /Thalès|DE\s*\/\/\s*BC|đường trung bình/i.test(txt)) {
      return `<div class="visual-math-box"><small>📐 ${t('Minh họa Định lý Thalès (DE // BC):', 'Thales Theorem (DE // BC):')}</small>
        <svg viewBox="0 0 250 116" class="visual-math-svg" role="img" aria-label="Thales triangle diagram">
          <polygon points="46,98 125,16 204,98" fill="rgba(59,130,246,0.08)" stroke="#1d4ed8" stroke-width="2.2" stroke-linejoin="round"/>
          <line x1="82" y1="60" x2="168" y2="60" stroke="#dc2626" stroke-width="2.2"/>
          <text x="125" y="12" font-size="11.5" font-weight="800" text-anchor="middle" fill="#1e3a8a">A</text>
          <text x="34" y="102" font-size="11.5" font-weight="800" fill="#1e3a8a">B</text>
          <text x="210" y="102" font-size="11.5" font-weight="800" fill="#1e3a8a">C</text>
          <text x="68" y="63" font-size="11" font-weight="800" fill="#dc2626">D</text>
          <text x="174" y="63" font-size="11" font-weight="800" fill="#dc2626">E</text>
        </svg></div>`;
    }

    if (kind === 'pyramid' || /hình chóp/i.test(txt)) {
      return `<div class="visual-math-box"><small>📐 ${t('Minh họa Hình chóp đều (cao h, trung đoạn d):', 'Regular Pyramid diagram:')}</small>
        <svg viewBox="0 0 250 118" class="visual-math-svg" role="img" aria-label="Regular pyramid diagram">
          <polygon points="125,14 58,86 144,102 194,74" fill="rgba(14,165,233,0.10)" stroke="#0369a1" stroke-width="2" stroke-linejoin="round"/>
          <line x1="125" y1="14" x2="144" y2="102" stroke="#0369a1" stroke-width="1.8"/>
          <line x1="58" y1="86" x2="194" y2="74" stroke="#0369a1" stroke-width="1.2" stroke-dasharray="4 3"/>
          <line x1="125" y1="14" x2="126" y2="80" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4 2"/>
          <line x1="125" y1="14" x2="169" y2="88" stroke="#d97706" stroke-width="1.8"/>
          <text x="125" y="11" font-size="11" font-weight="800" text-anchor="middle" fill="#0c4a6e">S</text>
          <text x="116" y="56" font-size="11" font-weight="800" fill="#dc2626">h</text>
          <text x="156" y="54" font-size="11" font-weight="800" fill="#b45309">d</text>
        </svg></div>`;
    }

    if (kind === 'right_tri' || /vuông tại A|cạnh huyền|thang dài|giác kế|Pythagore|sin\s|cos\s|tan\s/i.test(txt)) {
      const lblA = d.a ? `${d.a}` : 'c';
      const lblB = d.b ? `${d.b}` : 'b';
      const lblC = d.c ? `${d.c}` : 'BC';
      return `<div class="visual-math-box"><small>📐 ${t('Hình minh họa trực quan:', 'Geometry diagram:')}</small>
        <svg viewBox="0 0 260 118" class="visual-math-svg" role="img" aria-label="Right triangle diagram">
          <polygon points="56,96 56,22 196,96" fill="rgba(45,106,81,0.10)" stroke="#2b6a50" stroke-width="2.4" stroke-linejoin="round"/>
          <polyline points="56,84 68,84 68,96" fill="none" stroke="#d97706" stroke-width="2"/>
          <text x="42" y="102" font-size="12" font-weight="800" fill="#1e4631">A</text>
          <text x="43" y="22" font-size="12" font-weight="800" fill="#1e4631">B</text>
          <text x="203" y="102" font-size="12" font-weight="800" fill="#1e4631">C</text>
          <text x="36" y="62" font-size="11.5" font-weight="800" text-anchor="end" fill="#2563eb">${esc(String(lblA))}</text>
          <text x="126" y="111" font-size="11.5" font-weight="800" text-anchor="middle" fill="#2563eb">${esc(String(lblB))}</text>
          <text x="135" y="52" font-size="11.5" font-weight="800" fill="#c2410c">${esc(String(lblC))}</text>
        </svg></div>`;
    }

    if (kind === 'circle' || /đường tròn|dây cung|tiếp tuyến|cung tròn|quạt tròn|vành khuyên|góc nội tiếp|tứ giác nội tiếp/i.test(txt)) {
      const rTxt = d.R ? `R = ${d.R}` : 'R';
      return `<div class="visual-math-box"><small>📐 ${t('Minh họa Đường tròn (O; R):', 'Circle (O; R) diagram:')}</small>
        <svg viewBox="0 0 240 116" class="visual-math-svg" role="img" aria-label="Circle geometry diagram">
          <circle cx="120" cy="58" r="44" fill="rgba(59,130,246,0.08)" stroke="#2563eb" stroke-width="2.3"/>
          <circle cx="120" cy="58" r="3" fill="#dc2626"/>
          <line x1="120" y1="58" x2="158" y2="36" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 2"/>
          <line x1="85" y1="84" x2="155" y2="84" stroke="#1f583c" stroke-width="2.2"/>
          <line x1="120" y1="58" x2="120" y2="84" stroke="#d97706" stroke-width="1.8"/>
          <text x="112" y="54" font-size="11.5" font-weight="800" fill="#dc2626">O</text>
          <text x="145" y="42" font-size="10.5" font-weight="800" fill="#dc2626">${esc(rTxt)}</text>
          <text x="74" y="90" font-size="11" font-weight="800" fill="#1f583c">A</text>
          <text x="160" y="90" font-size="11" font-weight="800" fill="#1f583c">B</text>
        </svg></div>`;
    }

    if (kind === 'trapezoid' || /hình thang/i.test(txt)) {
      return `<div class="visual-math-box"><small>📐 ${t('Minh họa Hình thang:', 'Trapezoid diagram:')}</small>
        <svg viewBox="0 0 250 108" class="visual-math-svg" role="img" aria-label="Trapezoid diagram">
          <polygon points="78,22 172,22 206,88 44,88" fill="rgba(16,185,129,0.10)" stroke="#1f6a47" stroke-width="2.2"/>
          <line x1="78" y1="22" x2="78" y2="88" stroke="#d97706" stroke-width="1.8" stroke-dasharray="4 3"/>
          <text x="125" y="16" font-size="11" font-weight="800" text-anchor="middle" fill="#1f583c">${d.b ? d.b : 'b'}</text>
          <text x="125" y="102" font-size="11" font-weight="800" text-anchor="middle" fill="#1f583c">${d.a ? d.a : 'a'}</text>
          <text x="84" y="58" font-size="11" font-weight="800" fill="#b45309">h${d.h ? '=' + d.h : ''}</text>
        </svg></div>`;
    }

    if (kind === 'rhombus' || /hình thoi/i.test(txt)) {
      return `<div class="visual-math-box"><small>📐 ${t('Minh họa Hình thoi (2 đường chéo vuông góc):', 'Rhombus diagram:')}</small>
        <svg viewBox="0 0 240 112" class="visual-math-svg" role="img" aria-label="Rhombus diagram">
          <polygon points="120,14 196,56 120,98 44,56" fill="rgba(245,158,11,0.10)" stroke="#b45309" stroke-width="2.2"/>
          <line x1="44" y1="56" x2="196" y2="56" stroke="#2563eb" stroke-width="1.7" stroke-dasharray="4 2"/>
          <line x1="120" y1="14" x2="120" y2="98" stroke="#16a34a" stroke-width="1.7" stroke-dasharray="4 2"/>
          <text x="160" y="51" font-size="10.5" font-weight="800" fill="#2563eb">${d.d1 ? 'd₁=' + d.d1 : 'd₁'}</text>
          <text x="125" y="36" font-size="10.5" font-weight="800" fill="#16a34a">${d.d2 ? 'd₂=' + d.d2 : 'd₂'}</text>
        </svg></div>`;
    }

    if (kind === 'segment' || /trung điểm của đoạn thẳng/i.test(txt)) {
      return `<div class="visual-math-box"><small>📐 ${t('Sơ đồ đoạn thẳng:', 'Segment diagram:')}</small>
        <svg viewBox="0 0 260 64" class="visual-math-svg" role="img" aria-label="Line segment midpoint diagram">
          <line x1="34" y1="34" x2="226" y2="34" stroke="#2b6a50" stroke-width="2.6"/>
          <circle cx="34" cy="34" r="4.5" fill="#1e4631"/>
          <circle cx="130" cy="34" r="4.5" fill="#d97706"/>
          <circle cx="226" cy="34" r="4.5" fill="#1e4631"/>
          <line x1="80" y1="28" x2="84" y2="40" stroke="#d97706" stroke-width="2"/>
          <line x1="176" y1="28" x2="180" y2="40" stroke="#d97706" stroke-width="2"/>
          <text x="34" y="22" font-size="11.5" font-weight="800" text-anchor="middle" fill="#1e4631">A</text>
          <text x="130" y="22" font-size="11.5" font-weight="800" text-anchor="middle" fill="#b45309">M</text>
          <text x="226" y="22" font-size="11.5" font-weight="800" text-anchor="middle" fill="#1e4631">B</text>
          ${d.total ? `<text x="130" y="55" font-size="11" font-weight="800" text-anchor="middle" fill="#355240">AB = ${esc(String(d.total))} cm</text>` : ''}
        </svg></div>`;
    }

    if (kind === 'rect') {
      return `<div class="visual-math-box"><small>📐 ${t('Sơ đồ Hình chữ nhật:', 'Rectangle diagram:')}</small>
        <svg viewBox="0 0 240 98" class="visual-math-svg" role="img" aria-label="Rectangle diagram">
          <rect x="52" y="18" width="136" height="62" rx="3" fill="rgba(45,106,81,0.09)" stroke="#2b6a50" stroke-width="2.2"/>
          <text x="120" y="13" font-size="11" font-weight="800" text-anchor="middle" fill="#1e4631">${d.l ? 'Dài = ' + d.l : 'a'}</text>
          <text x="195" y="53" font-size="11" font-weight="800" fill="#2563eb">${d.w ? 'Rộng = ' + d.w : 'b'}</text>
        </svg></div>`;
    }

    return '';
  }

  // Extend buildVisualMathSvg so wrong-answer explanations AND geometry hints automatically include Geometry SVGs!
  const prevVisualSvg = typeof window !== 'undefined' && typeof window.buildVisualMathSvg === 'function'
    ? window.buildVisualMathSvg
    : (typeof buildVisualMathSvg === 'function' ? buildVisualMathSvg : null);

  if (prevVisualSvg) {
    const enhancedVisualSvg = function (q) {
      const base = prevVisualSvg(q);
      if (base) return base;
      return buildGeometryVisualSvg(q);
    };
    if (typeof window !== 'undefined') window.buildVisualMathSvg = enhancedVisualSvg;
    if (typeof global !== 'undefined') global.buildVisualMathSvg = enhancedVisualSvg;
  }

  // Enhance Guide screen ("Hướng dẫn") with a full 3-Strand, Searchable, Printable "📚 Kiến thức Lớp 1–9" tab!
  const prevRenderGuide = typeof renderGuide === 'function' ? renderGuide : null;
  if (prevRenderGuide) {
    let guideDom = 'all';
    let guideSearch = '';
    const enhancedGuide = function (activeTab = 'student', selectedGrade = null) {
      if (activeTab !== 'curriculum') {
        prevRenderGuide(activeTab);
        const tabsHost = $('.guide-role-tabs');
        if (tabsHost && !$('#guideTabCurriculum')) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.id = 'guideTabCurriculum';
          btn.className = 'guide-role-tab';
          btn.textContent = t('Kiến thức & Lộ trình Lớp 1–9', 'Gr 1–9 Knowledge & Roadmap');
          btn.onclick = () => enhancedGuide('curriculum');
          tabsHost.append(btn);
        }
        return;
      }
      stop();
      view = 'guide';
      document.body.dataset.view = 'guide';
      const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
      const curG = Number(selectedGrade || (typeof config !== 'undefined' && config.grade !== 'custom' ? config.grade : u?.grade) || 9);
      const totalCards = countKnowledgeItems(curG);

      $('#app').innerHTML = `<section class="guide-view kh-guide-wide">
        <div class="guide-hero card">
          <span class="eyebrow">NUMIQUICK · ${t('BÁCH KHOA LÝ THUYẾT, CÔNG THỨC & LỘ TRÌNH GDPT 2018', 'GDPT 2018 MATH ENCYCLOPEDIA')}</span>
          <h1>${t('Hệ thống Kiến thức Toán Lớp 1–9 & Lộ trình Bộ GD&ĐT', 'Grades 1–9 Complete Math Knowledge & MOET Roadmap')}</h1>
          <p class="muted">${t('Đầy đủ công thức, định lý, dấu hiệu nhận biết, hình minh họa, cấu trúc đề kiểm tra mới (CV 7991), quy chế thi vào 10 (Thông tư 30/2024) và đối chiếu thay đổi lộ trình SGK Lớp 1–9.', 'Complete formulas, theorems, diagrams, exam formats and textbook roadmap across Grades 1–9.')}</p>
          <div class="guide-role-tabs">
            <button type="button" class="guide-role-tab" id="guideTabStudent">${t('Dành cho Học sinh', 'For Students')}</button>
            <button type="button" class="guide-role-tab" id="guideTabParent">${t('Dành cho Phụ huynh & Thầy cô', 'For Parents & Teachers')}</button>
            <button type="button" class="guide-role-tab active" id="guideTabCurriculum">${t('Kiến thức & Lộ trình Lớp 1–9', 'Gr 1–9 Knowledge & Roadmap')}</button>
          </div>
        </div>
        <div class="card" style="margin-top:12px">
          <div class="kh-guide-top-bar">
            <div class="kh-grade-bar" style="margin-bottom:0">
              <span class="kh-lvl-lbl">${t('Tiểu học:', 'Primary:')}</span>
              ${[1, 2, 3, 4, 5].map(g => `<button type="button" class="kh-g-pill ${curG === g ? 'active' : ''}" data-guide-kg="${g}">${t('Lớp', 'Gr')} ${g}</button>`).join('')}
              <span class="kh-lvl-lbl" style="margin-left:6px">${t('THCS:', 'Secondary:')}</span>
              ${[6, 7, 8, 9].map(g => `<button type="button" class="kh-g-pill ${curG === g ? 'active' : ''}" data-guide-kg="${g}">${t('Lớp', 'Gr')} ${g}</button>`).join('')}
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <span class="kh-total-badge">${totalCards} ${t('chuyên mục', 'topics')}</span>
              <button type="button" class="ws-btn-sec no-print" id="guidePrintKhBtn">${t(`In Sổ tay Lớp ${curG} (PDF)`, `Print Gr ${curG} PDF`)}</button>
            </div>
          </div>
          <div class="kh-toolbar-row" style="margin-top:10px">
            <div class="kh-domain-tabs" role="tablist">
              <button type="button" class="kh-dom-btn ${guideDom === 'all' ? 'active' : ''}" data-guide-dom="all">${t('Tất cả', 'All')}</button>
              <button type="button" class="kh-dom-btn ${guideDom === 'number' ? 'active' : ''}" data-guide-dom="number">${t('Số học', 'Number & Algebra')}</button>
              <button type="button" class="kh-dom-btn ${guideDom === 'geometry' ? 'active' : ''}" data-guide-dom="geometry">${t('Hình học', 'Geometry')}</button>
              <button type="button" class="kh-dom-btn ${guideDom === 'stats' ? 'active' : ''}" data-guide-dom="stats">${t('Thống kê & Xác suất', 'Stats & Prob')}</button>
              <button type="button" class="kh-dom-btn ${guideDom === 'reform' ? 'active' : ''}" data-guide-dom="reform">${t('Thông tư & Lộ trình mới', 'MOET Reform & Roadmap')}</button>
            </div>
            <input type="search" id="guideKhSearch" class="kh-search-input" placeholder="${t('Tìm nhanh công thức, định lý, dạng toán...', 'Search formulas, theorems...')}" value="${esc(guideSearch)}">
          </div>
          <div id="guideKhCardsHost">
            ${buildKnowledgeCardHtml(curG, guideDom, false, guideSearch)}
          </div>
          <div style="margin-top:14px;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap">
            <button type="button" class="primary" id="guidePracticeGradeBtn">${t(`Vào luyện bài tập Lớp ${curG} ngay`, `Practice Grade ${curG} now`)} →</button>
          </div>
        </div>
      </section>`;

      const refreshGuideCards = () => {
        const host = $('#guideKhCardsHost');
        if (host) {
          host.innerHTML = buildKnowledgeCardHtml(curG, guideDom, false, guideSearch);
          bindPracticeTopicButtons(host, null);
        }
      };

      $('#guideTabStudent').onclick = () => enhancedGuide('student');
      $('#guideTabParent').onclick = () => enhancedGuide('parent');
      $('#guideTabCurriculum').onclick = () => enhancedGuide('curriculum', curG);
      $('#guidePrintKhBtn')?.addEventListener('click', () => printKnowledgeSheet(curG));
      $('#guideKhSearch')?.addEventListener('input', e => {
        guideSearch = e.target.value || '';
        refreshGuideCards();
      });
      $$('[data-guide-dom]').forEach(b => {
        b.onclick = () => {
          guideDom = b.dataset.guideDom || 'all';
          $$('[data-guide-dom]').forEach(x => x.classList.toggle('active', x.dataset.guideDom === guideDom));
          refreshGuideCards();
        };
      });
      $$('[data-guide-kg]').forEach(b => {
        b.onclick = () => enhancedGuide('curriculum', Number(b.dataset.guideKg));
      });
      $('#guidePracticeGradeBtn')?.addEventListener('click', () => {
        nav('setup');
        if (typeof applyGrade === 'function') applyGrade(curG);
      });
      bindPracticeTopicButtons($('#guideKhCardsHost'), null);
      translate();
    };
    renderGuide = enhancedGuide;
    if (typeof window !== 'undefined') window.renderGuide = enhancedGuide;
    if (typeof global !== 'undefined') global.renderGuide = enhancedGuide;
  }

  if (typeof document !== 'undefined' && document.head) {
    const style = document.createElement('style');
    style.textContent = `
      dialog#modal.kh-wide-modal{width:min(96vw,1060px)!important;max-width:1060px!important;max-height:92vh!important;padding:18px 22px!important;overflow-y:auto!important}
      .kh-guide-wide{max-width:1080px;margin:0 auto}
      .kh-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding-bottom:10px;border-bottom:1.5px solid #e1eee0;margin-bottom:10px;flex-wrap:wrap}
      .kh-guide-top-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding-bottom:10px;border-bottom:1.5px dashed #dfece0}
      .kh-total-badge{display:inline-block;padding:2px 9px;border-radius:999px;background:#e6f4ea;color:#1b5a3c;font-size:11.5px;font-weight:800;vertical-align:middle}
      .kh-grade-bar{display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin-bottom:10px}
      .kh-lvl-lbl{font-size:12px;font-weight:800;color:#4a6b57;margin-right:2px}
      .kh-g-pill{min-height:30px!important;padding:4px 10px!important;border-radius:999px!important;border:1.5px solid #cde0c8!important;background:#f7fbf5!important;color:#264b35!important;font-size:12px!important;font-weight:800!important;cursor:pointer}
      .kh-g-pill.active,.kh-g-pill.active:hover{background:#2d6a51!important;border-color:#1f4e3a!important;color:#fff!important}
      .kh-toolbar-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
      .kh-domain-tabs{display:flex;flex-wrap:wrap;gap:5px;padding:4px;background:#eef6ef;border-radius:12px;flex:1 1 auto}
      .kh-dom-btn{flex:1 1 auto;min-height:33px!important;padding:5px 10px!important;border-radius:9px!important;border:1.5px solid transparent!important;background:transparent!important;color:#2f573f!important;font-size:12px!important;font-weight:800!important;cursor:pointer;white-space:nowrap}
      .kh-dom-btn.active{background:#fff!important;border-color:#b8d7be!important;color:#164d33!important;box-shadow:0 2px 5px rgba(24,78,50,.08)}
      .kh-search-input{min-width:220px;flex:0 1 270px;min-height:36px!important;padding:6px 12px!important;border-radius:10px!important;border:1.5px solid #c9dec5!important;background:#fff!important;color:#1f3d2b!important;font-size:12.5px!important;font-weight:700}
      .kh-summary{margin:0 0 12px;padding:9px 13px;border-radius:10px;background:#f2f9f4;border-left:4px solid #2d6a51;font-size:13px;font-weight:700;color:#234c35;line-height:1.48}
      .kh-sections-grid{display:grid;gap:12px;grid-template-columns:1fr;align-items:start}
      @media (min-width: 780px){.kh-sections-grid.is-two-col{grid-template-columns:minmax(0,1.08fr) minmax(0,0.92fr)}}
      .kh-sections-bottom{margin-top:12px;display:grid;gap:12px}
      .kh-sec-card{border:1.5px solid #d7e6d4;border-radius:14px;padding:13px 14px;background:#fffefb;min-width:0}
      .kh-sec-card.kh-dom-geometry{border-color:#ceddf2;background:#fbfdff}
      .kh-sec-card.kh-dom-stats{border-color:#ead9bd;background:#fffdf8}
      .kh-sec-head-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}
      .kh-sec-title{margin:0;font-size:14.5px;font-weight:900;color:#1d4d34}
      .kh-sec-card.kh-dom-geometry .kh-sec-title{color:#1e40af}
      .kh-sec-card.kh-dom-stats .kh-sec-title{color:#9a5210}
      .kh-sec-count{font-size:11px;font-weight:800;padding:2px 8px;border-radius:999px;background:#eaf4ec;color:#295c40;white-space:nowrap}
      .kh-sec-card.kh-dom-geometry .kh-sec-count{background:#e6efff;color:#1e40af}
      .kh-sec-card.kh-dom-stats .kh-sec-count{background:#fef1dc;color:#9a5210}
      .kh-svg-strip{margin:0 0 10px;padding:6px 8px;border-radius:10px;background:#ffffff;border:1px dashed #cbdcf4;text-align:center}
      .kh-ref-svg{width:100%;max-width:440px;height:auto;display:inline-block}
      .kh-items{display:grid;gap:9px}
      @media (min-width: 780px){.kh-items.kh-items-2col{grid-template-columns:1fr 1fr}}
      .kh-item{padding:8px 10px;border-radius:10px;background:#f7fbf6;border:1px solid #e2efe0;break-inside:avoid}
      .kh-sec-card.kh-dom-geometry .kh-item{background:#f5f9ff;border-color:#dce8fa}
      .kh-sec-card.kh-dom-stats .kh-item{background:#fffaf0;border-color:#f2e2c4}
      .kh-item-top{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px;flex-wrap:wrap}
      .kh-tag{display:inline-block;padding:2px 8px;border-radius:6px;background:#dff0e4;color:#164e32;font-size:11.5px;font-weight:800}
      .kh-sec-card.kh-dom-geometry .kh-tag{background:#dbeafe;color:#1e40af}
      .kh-sec-card.kh-dom-stats .kh-tag{background:#fde9c6;color:#92400e}
      .kh-practice-chip{min-height:22px!important;padding:2px 8px!important;border-radius:999px!important;border:1px solid #b8d9c3!important;background:#ffffff!important;color:#1c5b3b!important;font-size:11px!important;font-weight:800!important;cursor:pointer;transition:all .14s ease}
      .kh-practice-chip:hover{background:#2d6a51!important;border-color:#2d6a51!important;color:#fff!important}
      .kh-body{font-size:12.5px;line-height:1.52;color:#24382c}
      .kh-formula{display:inline-block;padding:1px 6px;border-radius:5px;background:rgba(45,106,81,.10);font-weight:800;color:#15472d}
      .kh-empty-search{padding:20px;text-align:center;border-radius:12px;background:#f7faf7;border:1.5px dashed #cde0cc;color:#466953;font-weight:700;font-size:13px}
      body.dark-mode .kh-modal-head,body.dark-mode .kh-guide-top-bar{border-bottom-color:#2a4536}
      body.dark-mode .kh-total-badge{background:#1d3a2a;color:#9ee3bc}
      body.dark-mode .kh-g-pill{background:#18271f!important;border-color:#2d4a3a!important;color:#cde4d6!important}
      body.dark-mode .kh-g-pill.active{background:#2d6a51!important;color:#fff!important}
      body.dark-mode .kh-domain-tabs{background:#16261d}
      body.dark-mode .kh-dom-btn{color:#a9ceb8!important}
      body.dark-mode .kh-dom-btn.active{background:#21382b!important;border-color:#3a644c!important;color:#fff!important}
      body.dark-mode .kh-search-input{background:#14231a!important;border-color:#2f523e!important;color:#e0f2e7!important}
      body.dark-mode .kh-summary{background:#182b20;color:#cde7d7}
      body.dark-mode .kh-sec-card{background:#15231b;border-color:#2b4637}
      body.dark-mode .kh-sec-title{color:#a8e5c3!important}
      body.dark-mode .kh-sec-count{background:#1f382a!important;color:#a8e5c3!important}
      body.dark-mode .kh-svg-strip{background:#f8fbff;border-color:#3b5b7d}
      body.dark-mode .kh-item{background:#1a2b22!important;border-color:#2c4738!important}
      body.dark-mode .kh-tag{background:#234231!important;color:#a9e5c3!important}
      body.dark-mode .kh-practice-chip{background:#1f3729!important;border-color:#3b694f!important;color:#b2ebd0!important}
      body.dark-mode .kh-body{color:#d8ece0}
      body.dark-mode .kh-formula{background:rgba(168,229,195,.15);color:#b6f0cf}
    `;
    document.head.append(style);
  }

  const exp = { NUMI_KNOWLEDGE_BANK, openKnowledgeModal, buildKnowledgeCardHtml, buildMoetReformHtml, buildGeometryVisualSvg, printKnowledgeSheet };
  if (typeof window !== 'undefined') Object.assign(window, exp);
  if (typeof global !== 'undefined') Object.assign(global, exp);
})();
