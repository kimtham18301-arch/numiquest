# NumiQuest v0.6.1 — Mảnh ghép Việt Nam + kết nối tài khoản

## Đã làm

- Mỗi mảnh mở một địa phương Việt Nam. Bấm mảnh để xem ảnh, tên địa danh và vị trí trên bản đồ.
- Có 34 tỉnh/thành hiện hành theo danh mục từ 1/7/2025. Phần ảnh phản ánh địa điểm nằm trong tỉnh/thành sau sắp xếp; ví dụ Hội An ở Đà Nẵng và Gành Đá Đĩa ở Đắk Lắk.
- Tất cả 34 địa phương có ảnh thật nhúng trong geo-data.js, không cần tải thư mục ảnh riêng. Nguồn, tác giả và giấy phép được ghi ở từng ảnh và GEOGRAPHY-CREDITS.md.
- Các thẻ có hình mảnh ghép với ngàm nối. Đây là thẻ sưu tập bấm mở, chưa phải trò kéo đa giác tỉnh để ghép khít toàn bộ bản đồ.
- Bản đồ khái quát hình dáng Việt Nam, điểm địa danh, nút phóng to/thu nhỏ/toàn cảnh. Chưa có đường ranh đa giác của 34 tỉnh/thành.
- Thể hiện Hoàng Sa và Trường Sa ở vị trí tương ứng bằng ký hiệu đảo được phóng đại để dễ nhìn. Không có đường chín đoạn.
- Các nước khác tạm khóa, hiện Sắp mở. Mảnh cũ của các nước đó vẫn giữ trong dữ liệu, không bị xóa. Tất cả mảnh mới đi vào Việt Nam.
- Số mảnh Việt Nam cũ được giữ nguyên: 5 mảnh hiện có sẽ mở 5 địa phương đầu tiên. Tối đa 34 địa phương được mở trong bộ này; điểm/mảnh vượt số đó vẫn lưu nhưng chưa có địa phương mới để mở thêm.
- Giao diện đăng nhập email/mật khẩu, đăng ký, khôi phục mật khẩu, nút Google (khi bật provider), đăng xuất.
- Kết nối Supabase Auth + bảng lưu riêng từng user; chọn bản máy hoặc cloud, tự lưu có debounce, chặn ghi đè khi có revision mới.

## Chưa kích hoạt đăng nhập thật

cloud-config.js hiện để trống, không có dự án/key của chủ web. Đăng nhập và lưu nhiều thiết bị chỉ hoạt động sau khi thiết lập dịch vụ theo DANG_NHAP.md. Khi chưa kết nối, app nói rõ trạng thái và vẫn lưu cục bộ; không giả đăng nhập hoặc giả đồng bộ.

Gói Free của Supabase có hạn mức và quy định tạm dừng khi ít hoạt động; email mặc định không dành cho đăng ký công khai số lượng lớn. DANG_NHAP.md giải thích cách thử và bật provider Google / SMTP trước khi mở công khai.

## Tải lên GitHub / Netlify

1. Xuất bản sao lưu từ web hiện tại nếu cần dự phòng.
2. Giải nén, mở thư mục NumiQuest bên trong.
3. GitHub → Add file → Upload files → kéo tất cả file bên trong vào ngoài cùng repository.
4. Cần có index.html, style.css, app.js, ui.js, discovery.js, geo-data.js, cloud.js và cloud-config.js cùng cấp. Không kéo nguyên thư mục NumiQuest bao ngoài, không tải ZIP vào repository.
5. Commit changes. Giữ Pages như cũ. Chờ Actions xanh, Ctrl+F5.
6. Với Netlify, dùng cả thư mục chứa index.html cho một lần deploy; không chỉ tải file bản vá.

geo-data.js chứa ảnh nhúng và được tải khi mở Hộ chiếu/Khám phá, nên lần mở đầu có thể cần đợi theo tốc độ mạng. Nếu file này thiếu, app có thông báo tải lại, không hiển thị ảnh hỏng.

## Tính năng luyện giữ nguyên

Chọn nhiều loại số, phép tính, chữ số 1–6, số câu và giây/câu. Đúng hoặc sai đều chuyển câu ngay, không đợi. Câu mới không giữ màu lựa chọn trước. Chỉ câu sai vào game hoa–chậu, số chậu tự theo câu sai, tối đa 6 cặp mỗi bảng. Đấu máy vẫn dùng nhãn rõ ràng. Phòng thi đấu người thật và bảng hạng online vẫn khóa.

Tiến độ tiếp tục dùng key numiquest-v1. Đổi trình duyệt, thiết bị hoặc tên miền chưa tự mang theo dữ liệu nếu chưa bật cloud: dùng sao lưu JSON hoặc đăng nhập sau khi đã kết nối. Không xóa dữ liệu trình duyệt để cập nhật giao diện.

## Kiểm tra

- Cú pháp các file JavaScript và liên kết file trong HTML.
- 34 ảnh nhúng, đủ nguồn/giấy phép/tác giả; đã xem contact sheet ảnh.
- Kiểm tra DOM giả lập: 1 mảnh = 1 địa phương, thẻ mở/khóa, đổi ảnh theo mảnh, pin bản đồ, zoom, Hoàng Sa/Trường Sa, 9 nước khác khóa, mảnh cũ vẫn giữ.
- Đăng nhập/lưu cloud kiểm tra bằng mock API: trạng thái chưa kết nối trung thực, không lưu mật khẩu, lưu theo user_id + revision, xung đột không ghi đè, logout giữ cache tài khoản và phục hồi guest.
- Kiểm tra SQL bật RLS và policy sở hữu dòng; chưa chạy với Supabase thật của bạn.
- Hồi quy toán/cấu hình và luồng ôn sai qua các kiểm tra tự động trước đó. Chưa kiểm thử trực quan/cảm ứng trên điện thoại thật; chưa xác minh auth/OAuth đầu-cuối trên dịch vụ thật.

## Nguồn địa lí

- 34 tỉnh/thành: https://baochinhphu.vn/bang-danh-muc-va-ma-so-cua-34-tinh-thanh-moi-3321-don-vi-hanh-chinh-cap-xa-moi-102250704153652947.htm
- Hình dáng bản đồ: Natural Earth, public domain, https://www.naturalearthdata.com/about/terms-of-use/
- Tên/ảnh địa danh: Wikipedia/Wikimedia Commons; từng nguồn và giấy phép xem GEOGRAPHY-CREDITS.md.

Cập nhật v0.6.1: bỏ chờ 3 giây ở phần tự luyện. Chọn đúng/sai đều chuyển câu ngay; câu cuối mở tổng kết. Câu sai vẫn lưu vào vườn hoa. Giữ đồng hồ thời gian trả lời từng câu và quy tắc hết giờ hiện tại.
