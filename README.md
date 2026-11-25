# NumiQuick — bản cập nhật 2.15.0

Web học toán, luyện tính nhẩm, giải bài tập từ cơ bản đến vận dụng và soạn phiếu đề in PDF cho học sinh Tiểu học & THCS (Lớp 1–9 theo chuẩn Chương trình GDPT 2018 & Công văn 7991/BGDĐT-GDTrH), chạy tĩnh trên GitHub Pages.

## Tính năng chính

- **Trọn bộ 126 chuyên đề Toán Lớp 1–9 & Tách phân môn THCS (Mới v2.15.0):**
  - **Tiểu học (Lớp 1–5 — 73 chuyên đề):** Củng cố toàn diện Toán Số, Tính nhẩm nhanh, Đặt tính, Dãy số quy luật và Toán giải có lời văn nhiều bước (tổng–hiệu ẩn, rút về đơn vị, chia dư thực tế, vòi nước, lãi–lỗ, chuyển động).
  - **THCS (Lớp 6–9 — 53 chuyên đề):** Chia rõ 2 phân môn **🔢 Số học & Đại số** (34 chuyên đề: tập hợp, ƯCLN–BCNN, số nguyên, tỉ lệ thức, đa thức, hằng đẳng thức, phân thức, lập PT/hệ PT, bất phương trình, parabol & Viète, toán thực tế thi vào 10) và **📐 Hình học & Đo lường** (19 chuyên đề: đối xứng, song song, tam giác, đồng quy, lăng trụ, Pythagore, tứ giác, Thalès, đồng dạng, chóp đều, lượng giác, đường tròn, trụ–nón–cầu).
- **Lộ trình nhận thức khoa học Dễ → Khó & Cẩm nang Kiến thức Lớp 1–9 (Mới v2.15.0):** Sắp xếp câu hỏi theo 3 mức độ nhận thức (*🌱 Nhận biết → 📘 Thông hiểu → 🏆 Vận dụng & Toán thực tế*), kèm **Bài giảng tóm tắt & Công thức trọng tâm**, minh họa Hình học SVG và mục **Xem lại đề & Bài giải chi tiết từng câu** sau mỗi lượt làm.
- **Quy tắc thời gian thông minh theo cấp học (Mới v2.15.0):** Tiểu học (Lớp 1–5) luôn giữ đồng hồ đếm ngược để rèn phản xạ suy nghĩ nhanh; THCS (Lớp 6–9) khi làm **Tự luận** tự động bỏ giới hạn thời gian (`🧠 Không giới hạn giờ`) để học sinh tập trung tư duy, lập phương trình và suy luận hình học.
- **Soạn đề sẵn & In 2 bản PDF khổ A4 riêng biệt:** Mở trực tiếp từ **Không gian Giáo viên** (`🖨️ Soạn & In đề PDF`) hoặc trang **Luyện tập** (`🖨️ Soạn đề sẵn & In phiếu PDF (A4)`). Xuất tách riêng **Bảng 1: Đề phát học sinh (Không đáp án — kèm khung ô ly trống tự đặt tính)** và **Bảng 2: Bản Có đáp án & Lời giải nhanh (Chấm bài)**, hỗ trợ đổi mã đề (`01, 02...`) và đổi riêng từng câu (`↻`).
- **Bảng kẻ "📐 Đặt tính rồi tính" ô ly tương tác:** Kẻ bảng dọc – ngang đầy đủ với tiêu đề tên hàng (`Trăm | Chục | Đ.vị` hoặc `Chục | Đ.vị | , | P.10 | P.100`), tô sáng cả cột đang tính, hàng ghi **Nhớ**, nhập chữ số từ phải sang trái bằng bàn phím hoặc chạm số trên màn hình, tự động mở sẵn bên phải trên máy tính với các phép đặt tính Tiểu học.
- **Tự luận nhập song song & Giao diện làm bài 1 màn hình cố định:** Chuyển nhanh `Trắc nghiệm ↔ Tự luận` ngay trong khi làm bài; chế độ Tự luận cho phép vừa gõ bàn phím vừa bấm số trên màn hình mượt mà. Màn hình làm bài khóa gọn trong 1 khung hình (không giật, không cuộn lên xuống), bảng Đặt tính / Nháp mở song song bên phải trên máy tính.
- **Gõ bàn phím nhanh & Bảng nháp vẽ tay (Mới v2.3.0):** Phím tắt `1–4` / `A–D` chọn nhanh đáp án, gõ số trực tiếp ở chế độ bàn phím số, `Enter` qua câu tiếp, `R` đọc đề, và **Bảng nháp vẽ tay (Canvas cảm ứng/chuột)** với 3 màu bút, tẩy, hoàn tác và xóa sạch (bấm `S` hoặc nút `✏️ Nháp`).
- **Lớp học riêng cho từng Thầy/Cô tự điều phối (Mới v2.3.0):** Admin tạo tài khoản Giáo viên & Lớp học (kèm tài khoản mẫu `colan` / `1234` phụ trách `Lớp 4A` — mã `4ANUMI`). Mỗi thầy/cô có Không gian Giáo viên riêng để thêm/nhận học sinh, gửi mã/link mời `#join=...`, giao bài chọn lọc cho lớp, phụ đạo 1 chạm và in/lưu PDF báo cáo tiến độ lớp.
- **Lộ trình thích ứng & Thi đấu 60 giây:** Tự động điều chỉnh độ khó theo chuỗi trả lời đúng/sai, kèm chế độ Thi đấu tốc độ 60s và 3 Nhiệm vụ hằng ngày.
- **Vườn hoa ôn câu sai & Minh họa trực quan:** Tự động lưu câu sai để ghép chậu – hoa theo lịch nhắc lại (Spaced Repetition), kèm trục số / thanh phân số SVG và nút đọc đề bằng giọng nói.
- **Mục tiêu Trà sữa Trân châu & Bạn đồng hành:** Mỗi câu đúng nhận 1 viên trân châu để làm ly Size S (30), M (50), L (70) và nhận thưởng XP; dùng XP mở khóa phụ kiện (Kính, Nơ, Mũ, Vương miện) cho bạn đồng hành.
- **Trung tâm Quản trị (Admin):** Tài khoản quản trị (`admin`) theo dõi biểu đồ 7 ngày, quản lý Thầy/Cô & Lớp học, giao bài tập qua link 1 chạm (`#hw=...`) và sao lưu JSON toàn hệ thống.

## Chạy thử

Mở `index.html` trong trình duyệt để chạy trên máy tính. Mặc định dữ liệu lưu cục bộ trên trình duyệt (hỗ trợ xuất/nhập bản sao lưu JSON toàn hệ thống). Muốn dùng đa thiết bị thì bật đồng bộ đám mây (mục dưới).

## Đồng bộ đám mây (Supabase, tùy chọn)

Khi `cloud-config.js` có `url` + `publishableKey`, app đồng bộ nền lên Supabase mà **giao diện vẫn chạy trên localStorage** (tắt mạng vẫn dùng được):

- **Tài khoản:** đăng ký/đăng nhập bằng tên + PIN. App đổi thành email ảo `ten@numiquick.app` và gọi Edge Function `numi-signup` (Supabase từ chối tạo email ảo bằng đường thường). Tài khoản cũ trên máy tự được nâng lên cloud ở lần đăng nhập đầu. Tài khoản mẫu (`colan`, `minhkhoi`, `baoan`, `haidang`) luôn chỉ ở trên máy.
- **Tiến độ học:** bảng `numi_progress`, mỗi người chỉ đọc/ghi dữ liệu của mình.
- **Lớp học (`cloud-classes.js`):** giáo viên tạo lớp, học sinh vào bằng mã trên máy khác; giáo viên thấy danh sách, XP/chuỗi ngày/lịch sử rút gọn (bảng `numi_student_stats`, **không** đọc được toàn bộ tiến độ), giao bài và xem kết quả nộp.

Cài đặt một lần:
1. Tạo project Supabase, chạy toàn bộ `cloud-setup.sql` trong SQL Editor (chạy lại an toàn).
2. Authentication → Sign In / Providers → Email: tắt **Confirm email**.
3. Edge Functions → tạo hàm `numi-signup` (mã ở `supabase/functions/numi-signup/index.ts`), để mặc định, deploy.
4. Điền `url` và `publishableKey` (`sb_publishable_...`) vào `cloud-config.js`. **Không** đưa `secret`/`service_role` vào repo.

Lưu ý: PIN/mật khẩu mới tối thiểu 6 ký tự (tài khoản cũ có PIN ngắn hơn vẫn đăng nhập được nhưng phải đổi PIN ngay sau khi vào); hàm `numi-signup` giới hạn 40 lượt/IP/giờ, bộ đếm lưu trong bảng `numi_signup_hits` (chỉ lưu mã băm của IP, tự xóa sau 1 giờ). Trước khi dùng thật, chạy `cloud-reset-test-data.sql` để xóa dữ liệu thử nghiệm.

Mã Edge Function `numi-signup` nằm ở [`supabase/functions/numi-signup/index.ts`](supabase/functions/numi-signup/index.ts): mở file, chép toàn bộ vào Supabase → Edge Functions → `numi-signup` → Deploy. Hàm cần phần **v2.6** của `cloud-setup.sql` (bảng `numi_signup_hits`).

## Kiểm thử tự động

Chạy kiểm tra cú pháp và bộ unit test bằng Node.js (v20+):
```bash
for f in *.js tests/*.js tests/helpers/*.js; do node --check "$f"; done
node --test tests/*.test.js
```
