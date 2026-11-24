# Kế hoạch Phát triển NumiQuick (Roadmap)

Tài liệu lưu lại định hướng tinh gọn và phát triển cho **NumiQuick**: tập trung 100% vào trải nghiệm **tự học tính nhẩm vui vẻ (Trà sữa Trân châu + Bạn đồng hành)** kết hợp **giao bài trực tiếp cho từng học sinh cụ thể**.

---

## Nhóm 1: Nội dung & Phương pháp Tự học *(Đã hoàn thành)*
- [x] **Chương trình Lớp 1–9 (GDPT 2018) & Tùy chỉnh:** Số tự nhiên, số âm, phân số, thập phân, chia có dư, tính thuận tiện, biểu thức.
- [x] **Bài toán điền khuyết (`?`) & Toán đố ngắn:** Song ngữ VI/EN kèm lời giải từng bước.
- [x] **Minh họa trực quan (Visual Math SVG):** Trục số cho phép cộng/trừ số nhỏ & số âm; thanh phân số giúp hình dung phân số.
- [x] **Vườn hoa sửa sai & Spaced Repetition:** Ưu tiên đưa câu sai đến hạn ôn lên trước; chạm chậu – hoa để ghép.
- [x] **Độ khó thích ứng & Giọng đọc đề (Web Speech API):** Tự điều chỉnh độ khó theo chuỗi làm bài và hỗ trợ đọc đề bài bằng giọng nói.

---

## Nhóm 2: Động lực & Trải nghiệm Trà sữa – Bạn đồng hành *(Đã hoàn thành)*
- [x] **Mục tiêu Trà sữa Trân châu (Size S/M/L):** Mỗi câu đúng cộng 1 viên trân châu; hoàn thành ly nhận thêm +20 XP & huy hiệu.
- [x] **Bạn đồng hành & Cửa hàng phụ kiện:** Tùy chọn Thỏ, Gấu trúc, Cáo, Sư tử; dùng XP mở khóa kính, nơ, mũ, vương miện.
- [x] **Thi đấu 60 giây & Nhiệm vụ hằng ngày:** Tăng phản xạ nhanh và giữ chuỗi ngày học tập.

---

## Nhóm 3: Trung tâm Quản trị & Giao bài Trực tiếp theo Học sinh *(Đã hoàn thành)*
- [x] **Giao bài chọn lọc theo học sinh (`targetedAssignments`):** Chọn 1 hoặc nhiều học sinh cụ thể nhận bài tập riêng; chỉ học sinh được chọn mới thấy bài trên Trang chủ.
- [x] **Phụ đạo 1 chạm & Link chia sẻ (`#hw=...`):** Tự động phát hiện kỹ năng hay sai nhất của từng bé để giao bài phụ đạo và copy link gửi Zalo/Messenger.
- [x] **Theo dõi 7 ngày & Sao lưu toàn hệ thống:** Biểu đồ hoạt động, phân tầng kết quả, chỉnh sửa hồ sơ học sinh và xuất/nhập JSON.

---

## Nhóm 4: Tối ưu Kỹ thuật & Vận hành
- [x] **Tinh gọn kiến trúc:** Gỡ bỏ hoàn toàn các module chồng chéo (Bản đồ 1,7 MB, Nông trại cũ, Level thử thách cũ, Phòng học & Thi cử phức tạp), giảm còn 14 script cốt lõi và cập nhật Service Worker `numiquick-v2.2.0`.
- [x] **GitHub Actions CI:** Tự động chạy `node --check` và `node --test tests/core.test.js` trên mỗi Push / Pull Request.
- [x] **Kết nối Supabase thật (v2.5):** Đăng ký/đăng nhập bằng tên + PIN (Edge Function `numi-signup`), đồng bộ tiến độ, lớp học, mã lớp, danh sách học sinh, giao bài và nộp kết quả đa thiết bị (`cloud-classes.js`, `cloud-setup.sql`).
- [x] **Giới hạn tần suất `numi-signup`** (40 lượt/IP/giờ, trong bộ nhớ) và chặn tên đăng nhập `admin`.
- [ ] **Nâng PIN tối thiểu lên 6 ký tự** (đang 4; cần đổi cả quick-join mặc định `1234`).
- [x] **Test tự động cho `cloud-classes.js`** (`tests/cloud-classes.test.js`, giả lập Supabase trong bộ nhớ, nhiều thiết bị).
