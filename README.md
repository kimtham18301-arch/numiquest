# NumiQuick — bản cập nhật 2.3.0

Web luyện tính nhẩm vui cho học sinh tiểu học & THCS (Lớp 1–9 theo chuẩn GDPT 2018), chạy tĩnh trên GitHub Pages.

## Tính năng chính

- **Tự học theo Lớp 1–9 & Tùy chỉnh:** Hỗ trợ số tự nhiên, số nguyên âm, số thập phân, phân số, chia có dư, tính thuận tiện, biểu thức nhiều phép tính, điền số còn thiếu (`?`) và toán đố ngắn.
- **Gõ bàn phím nhanh & Bảng nháp vẽ tay (Mới v2.3.0):** Phím tắt `1–4` / `A–D` chọn nhanh đáp án, gõ số trực tiếp ở chế độ bàn phím số, `Enter` qua câu tiếp, `R` đọc đề, và **Bảng nháp vẽ tay (Canvas cảm ứng/chuột)** với 3 màu bút, tẩy, hoàn tác và xóa sạch (bấm `S` hoặc nút `✏️ Nháp`).
- **Lớp học riêng cho từng Thầy/Cô tự điều phối (Mới v2.3.0):** Admin tạo tài khoản Giáo viên & Lớp học (kèm tài khoản mẫu `colan` / `1234` phụ trách `Lớp 4A` — mã `4ANUMI`). Mỗi thầy/cô có Không gian Giáo viên riêng để thêm/nhận học sinh, gửi mã/link mời `#join=...`, giao bài chọn lọc cho lớp, phụ đạo 1 chạm và in/lưu PDF báo cáo tiến độ lớp.
- **Lộ trình thích ứng & Thi đấu 60 giây:** Tự động điều chỉnh độ khó theo chuỗi trả lời đúng/sai, kèm chế độ Thi đấu tốc độ 60s và 3 Nhiệm vụ hằng ngày.
- **Vườn hoa ôn câu sai & Minh họa trực quan:** Tự động lưu câu sai để ghép chậu – hoa theo lịch nhắc lại (Spaced Repetition), kèm trục số / thanh phân số SVG và nút đọc đề bằng giọng nói.
- **Mục tiêu Trà sữa Trân châu & Bạn đồng hành:** Mỗi câu đúng nhận 1 viên trân châu để làm ly Size S (30), M (50), L (70) và nhận thưởng XP; dùng XP mở khóa phụ kiện (Kính, Nơ, Mũ, Vương miện) cho bạn đồng hành.
- **Trung tâm Quản trị (Admin):** Tài khoản quản trị (`admin`) theo dõi biểu đồ 7 ngày, quản lý Thầy/Cô & Lớp học, giao bài tập qua link 1 chạm (`#hw=...`) và sao lưu JSON toàn hệ thống.

## Chạy thử

Mở `index.html` trong trình duyệt để chạy trên máy tính. Dữ liệu được lưu cục bộ trên trình duyệt (hỗ trợ xuất/nhập bản sao lưu JSON toàn hệ thống).

## Kiểm thử tự động

Chạy kiểm tra cú pháp và bộ unit test bằng Node.js (v20+):
```bash
for f in *.js tests/*.js; do node --check "$f"; done
node --test tests/core.test.js
```
