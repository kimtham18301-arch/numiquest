# NumiQuick — bản cập nhật 1.0.1

Web luyện tính nhẩm vui cho học sinh tiểu học và THCS, chạy tĩnh trên GitHub Pages.

## Tính năng chính

- Chọn nhiều phép tính, loại số, chữ số, thời lượng và số câu luyện.
- Luyện số tự nhiên, số âm, số thập phân, phân số, chia có dư và biểu thức nhiều phép tính. Chế độ số tự nhiên không tạo kết quả âm; phép chia tránh chia cho 1.
- Câu sai hiện đáp án xanh, câu chọn sai đỏ; bài khó có lời giải ngắn rồi tự chuyển câu. Có thể xóa danh sách câu sai cũ để làm bài mới.
- Ôn câu sai bằng cách chạm một chậu rồi chạm hoa đáp án. Trên điện thoại, khung hoa có cuộn riêng để thanh điều hướng không che nội dung.
- Mỗi câu đúng nhận một viên trân châu. Size S cần 30 câu đúng, M cần 50, L cần 70.
- Trang Thành tích có biểu đồ đường độ chính xác theo từng ngày trong 7 ngày gần nhất.
- Có thể đổi màu giao diện, sửa tên và chọn một trong bốn avatar con vật cho bạn đồng hành. Tên và ảnh được đồng bộ trên mọi màn hình, gồm trang chủ, chọn bài, mục tiêu và các màn chơi; hồ sơ lưu trên thiết bị đang mở web.
- Khi chia sẻ link, trang có tiêu đề và ảnh xem trước NumiQuick.

## Chạy thử

Mở `index.html` trong trình duyệt để chạy trên máy tính. Một số tính năng đồng bộ/tài khoản cần cấu hình dịch vụ riêng.

## Cập nhật GitHub Pages

1. Giải nén ZIP.
2. Tải toàn bộ file và thư mục bên trong `NumiQuick` lên thư mục gốc repository, giữ nguyên cấu trúc thư mục `assets`. Bao gồm `og-image.png`.
3. Commit changes, chờ GitHub Pages triển khai xong rồi mở lại đường dẫn.

Ảnh xem trước link nằm ở `og-image.png` và được khai báo trong thẻ Open Graph của `index.html`. Một số ứng dụng chat lưu ảnh cũ trong bộ nhớ đệm; sau khi cập nhật có thể cần một thời gian để ảnh mới hiện khi chia sẻ.

## Lưu dữ liệu

Tiến độ và hồ sơ bạn đồng hành lưu trong trình duyệt hiện tại. Để chuyển thiết bị, dùng mục sao lưu trong Thành tích. Đăng nhập đồng bộ và cây thống kê người dùng cần cấu hình backend/Apps Script trước khi thu thập dữ liệu thật.
