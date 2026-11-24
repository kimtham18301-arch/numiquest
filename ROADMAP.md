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
- [x] **PIN/mật khẩu tối thiểu 6 ký tự** khi tạo hoặc đổi (hằng `NUMI_MIN_PIN` trong `cloud.js`; quick-join mặc định `123456`). Tài khoản cũ và tài khoản mẫu có PIN 4 số vẫn đăng nhập được.
- [x] **Test tự động cho `cloud-classes.js`** (`tests/cloud-classes.test.js`, giả lập Supabase trong bộ nhớ, nhiều thiết bị).

---

## Nhóm 5: An toàn trước khi dùng thật *(v2.6.0)*
- [x] **Giới hạn tần suất bền vững:** bộ đếm `numi-signup` chuyển từ bộ nhớ sang bảng `numi_signup_hits` (hàm `numi_signup_allowed`, chỉ `service_role` gọi được, chỉ lưu mã băm IP, tự xóa sau 1 giờ). Mã Edge Function tách ra `supabase/functions/numi-signup/index.ts`.
- [x] **Bắt đổi PIN cũ:** đăng nhập bằng PIN ngắn hơn 6 ký tự sẽ phải đổi PIN ngay (cờ `weakPin`, tải lại trang không bỏ qua được; có nút Đăng xuất).
- [x] **Đổi PIN đồng bộ lên mạng:** em tự đổi PIN thì mật khẩu Supabase cũng đổi theo (đổi trên mạng trước, lỗi thì giữ PIN cũ).
- [x] **Không lưu/hiện mật khẩu dạng chữ thường:** bỏ ô "Mật khẩu hiện tại" (Hiện/Chép) ở Hồ sơ và cột mật khẩu trong dữ liệu Admin.
- [x] **Script dọn dữ liệu thử nghiệm:** `cloud-reset-test-data.sql` (xem trước số dòng, rồi mới xóa).
- [ ] **Còn lại:** Thầy/Cô hoặc Admin đặt lại PIN cho học sinh mới chỉ đổi trên máy đó, chưa đổi mật khẩu trên Supabase (cần thêm Edge Function có quyền admin).

---

## Nhóm 6: Kiểm thử & Dễ bảo trì *(v2.7.0)*
- [x] **Test cho `cloud.js`** (`tests/cloud.test.js`, Supabase giả lập trong bộ nhớ, nhiều thiết bị): lưu theo revision, phát hiện xung đột không ghi đè, mất mạng vẫn giữ tiến độ, đổi PIN đồng bộ lên mạng (lỗi thì giữ PIN cũ), đăng xuất. Đã kiểm tra bằng cách cố ý làm hỏng code (mutation) để chắc test bắt được lỗi.
- [x] **Bộ nạp test dùng chung** (`tests/helpers/app-context.js`): đọc danh sách script từ `index.html`, nên tách/đổi tên file không phải sửa test.
- [x] **Tách `teacher-classes.js` (1.900 dòng)** thành `teacher-classes.js` (dữ liệu), `teacher-auth-gate.js` (màn đăng nhập), `teacher-workspace.js` (trang giáo viên), `teacher-integration.js` (Admin quản lý giáo viên, gắn lớp vào trang học sinh, điều hướng). Dùng chung qua `window.NumiClasses`; CSS nhúng chuyển vào `style.css`.
- [x] **Tách `admin-dashboard.js`** thành `admin-assignments.js` (giao bài, link #hw, thống kê, sao lưu; `window.NumiAdminData`) và `admin-dashboard.js` (giao diện).
- [x] **Sửa lỗi có sẵn:** nút Sao lưu/Khôi phục trong Admin Center trước đây bỏ sót danh sách lớp học.
- [ ] **Chưa làm:** `app.js` (1.264 dòng, viết nén, 62 hàm toàn cục) – nên định dạng lại trước rồi mới tách.
- [ ] **Chưa làm:** kiểm tra đầu-cuối với Supabase thật trên hai máy (cần dự án Supabase thử nghiệm riêng).

---

## Nhóm 7: Chất lượng nội dung bài tập *(v2.8.0)*
- [x] **Đề đúng chương trình GDPT 2018 từng lớp:** lớp 2 chia trong bảng 2, 5; lớp 4 cộng/trừ phân số chỉ khi mẫu này chia hết mẫu kia; bỏ phép chia `x ÷ x = 1`; lớp 5–9 giữ số vừa sức tính nhẩm; phân số luôn tối giản; cân lại tỉ lệ dạng bài (lớp 3, 6, 7).
- [x] **Dạng bài mới:** lũy thừa số hữu tỉ (lớp 7), phương trình bậc nhất (lớp 8), đưa thừa số ra ngoài dấu căn và nhẩm nghiệm Vi-ét (lớp 9).
- [x] **Đáp án nhiễu chống mẹo đoán:** cùng chữ số hàng đơn vị, cùng số chữ số thập phân, cùng mẫu số với đáp án; vị trí đáp án ngẫu nhiên (trước đây lớp 1–5 đáp án là số nhỏ thứ hai 86–99% số câu).
- [x] **Test** khóa các tiêu chí trên cho cả 9 lớp (đã thử cố ý làm hỏng code để chắc test bắt lỗi).
- [ ] **Chưa làm:** soát kỹ nội dung kiểu đề "điền số", "toán đố", "biểu thức" theo từng lớp.
