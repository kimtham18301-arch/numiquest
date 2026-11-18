# Kế hoạch Phát triển NumiQuick (Roadmap)

Tài liệu lưu lại định hướng nâng cấp dài hạn cho **NumiQuick** sau khi đã hoàn thành giai đoạn nền tảng (bảo mật & sửa lỗi, lộ trình thích ứng, thi đấu 60 giây, nhiệm vụ hằng ngày, icon PWA và kiến trúc Lớp học Supabase RLS).

---

## Nhóm 1: Nâng cấp Nội dung & Phương pháp học *(Đang triển khai)*
- [x] **Bài toán điền khuyết (`?`):** Sinh câu hỏi tìm số còn thiếu (`? + 7 = 15`, `24 ÷ ? = 6`, `9 × ? = 63`) kèm lời giải tính ngược.
- [x] **Toán đố ngắn (Word Problems):** Sinh câu chuyện ngắn 1–2 câu gần gũi (kẹo, bút chì, viên bi, quyển vở) song ngữ VI/EN cho phép `+`, `−`, `×`, `÷`.
- [x] **Minh họa trực quan khi trả lời sai (Visual Math):**
  - Vẽ **trục số SVG** minh họa bước nhảy cho phép cộng/trừ số tự nhiên nhỏ và số nguyên âm.
  - Vẽ **thanh phân số SVG (Fraction Bar)** giúp hình dung trực quan hai phân số trong phép tính.
- [x] **Ôn tập ngắt quãng (Spaced Repetition) tại Vườn hoa:** Gắn lịch nhắc lại và ưu tiên đưa các câu sai đến hạn ôn lên trước.

---

## Nhóm 2: Tăng Động lực & Trải nghiệm cho Học sinh *(Đã triển khai)*
- [x] **Cửa hàng phụ kiện cho bạn đồng hành:** Dùng XP hoặc trân châu tích lũy để mở khóa mũ, kính, nơ, huy hiệu trang trí cho Thỏ, Gấu trúc, Cáo, Sư tử.
- [x] **Thách đấu bạn cùng lớp (Async Challenge):** Tạo mã thử thách chứa bộ 10 câu hỏi cố định (dùng chung seed) để hai học sinh làm cùng một đề và so sánh kết quả.
- [x] **Hỗ trợ giọng đọc đề (Web Speech API):** Thêm nút đọc phép tính và lời động viên bằng giọng nói tiếng Việt/Anh cho học sinh lớp 1–2.

---

## Nhóm 3: Công cụ cho Giáo viên & Phụ huynh
- [ ] **Phân tích "Lỗi sai phổ biến nhất của lớp":** Tổng hợp từ `numi_submissions` và `mistakes` để giáo viên biết dạng bài nào cả lớp đang hay sai nhất.
- [ ] **Xuất báo cáo tuần theo Lớp học:** Tải bảng tổng hợp điểm và tiến độ từng bài tập tuần của cả lớp ra CSV/Excel hoặc bản in gửi phụ huynh.
- [ ] **Phiếu bài tập giấy có mã QR:** Gắn mã QR trên phiếu in PDF (`renderWorksheet`) dẫn thẳng tới đáp án hoặc chế độ luyện lại dạng bài tương ứng.

---

## Nhóm 4: Tối ưu Kỹ thuật & Vận hành
- [ ] **Kết nối Supabase thật (`cloud-config.js`):** Chạy `cloud-setup.sql` trên Supabase và cấu hình `url` + `publishableKey` (cùng Google OAuth nếu cần) để đồng bộ đa thiết bị.
- [ ] **Tối ưu `geo-data.js` (1,7 MB):** Tách ảnh base64 sang file ảnh/JSON tải theo nhu cầu để giảm thời gian parse JS.
- [ ] **GitHub Actions CI:** Tự động chạy `node --check` và `node --test tests/core.test.js` trên mỗi Pull Request trước khi merge vào `main`.
