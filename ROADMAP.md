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

## Nhóm 3: Công cụ cho Giáo viên & Phụ huynh *(Đã triển khai)*
- [x] **Phân tích "Lỗi sai phổ biến nhất của lớp":** Tổng hợp từ `mistakes` của học sinh để giáo viên biết dạng bài nào cả lớp đang hay sai nhất (`analyzeCommonMistakes`).
- [x] **Xuất báo cáo tuần theo Lớp học:** Tải bảng tổng hợp điểm và tiến độ từng bài tập tuần của cả lớp ra file CSV (`buildClassroomWeeklyCsv`).
- [x] **Phiếu bài tập giấy có mã QR:** Gắn mã QR trên phiếu in PDF (`renderWorksheet`) dẫn thẳng tới phần luyện tập trực tuyến.

---

## Nhóm 4: Tối ưu Kỹ thuật & Vận hành
- [ ] **Kết nối Supabase thật (`cloud-config.js`):** Người dùng chạy `cloud-setup.sql` trên project Supabase cá nhân và điền `url` + `publishableKey` để đồng bộ đa thiết bị.
- [x] **Tối ưu `geo-data.js` (1,7 MB):** Đã loại khỏi precache Service Worker (`sw.js`) và chỉ lazy-load khi người dùng mở Bản đồ.
- [x] **GitHub Actions CI:** Đã thêm `.github/workflows/ci.yml` tự động chạy `node --check` và `node --test tests/core.test.js` trên mỗi Push / Pull Request.

---

## Nhóm 5: Tính năng Lớp học thông minh kiểu Azota *(Đã triển khai)*
- [x] **Giao bài bằng Link 1 chạm (`#hw=...`):** Giáo viên copy link gửi Zalo/Messenger; học sinh mở link để tự động vào lớp và làm bài ngay (`buildHomeworkShareLink`, `parseHomeworkShareHash`).
- [x] **Nhập nhanh danh sách học sinh:** Dán danh sách tên từ Excel/Word để tự tạo tài khoản và xếp lớp hàng loạt (`bulkImportStudentsToClassroom`).
- [x] **Ma trận đề 3 mức độ:** Sinh bộ câu hỏi phân hóa 40% Nhận biết · 40% Thông hiểu · 20% Vận dụng (`generateMatrixQuestions`).
- [x] **Chế độ Kiểm tra (`examMode`):** Đảo thứ tự câu/đáp án riêng cho từng học sinh, giới hạn nộp 1 lần và đếm số lần rời màn hình (`shuffleForStudent`).
- [x] **Biểu đồ Phổ điểm lớp & Thống kê câu sai trong đề:** Hiển thị phổ điểm 4 mức và các câu học sinh làm sai nhiều nhất (`computeScoreDistribution`).
- [x] **Sticker Lời phê của Giáo viên:** Tự động gắn sticker theo điểm và cho phép giáo viên tặng sticker kèm XP thưởng (`giveStickerToSubmission`).
