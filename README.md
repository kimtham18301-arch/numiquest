# NumiQuest v0.8.7 — bản chạy thử

Ứng dụng web luyện tính nhẩm cho học sinh tiểu học và THCS. Giao diện tiếng Việt/Anh, ưu tiên màn hình điện thoại. Chơi cùng bạn thỏ Numi, tích trân châu và mở huy hiệu.

## Có trong bản này

- Nút “Luyện ngay” mở thẳng màn câu hỏi, không phụ thuộc phần nông trại đã bỏ. Trang chủ gọn, không còn nông trại hoặc cơ chế cho thỏ ăn. Numi là bạn học minh họa; mỗi câu đúng góp một viên trân châu.
- Chọn một trong bốn tông màu: kẹo ngọt, đại dương, nắng vui hoặc tím mộng mơ.
- Trò ôn câu sai dùng hoa màu tươi; câu làm lại được đổi số liệu nhưng giữ cùng dạng toán. Có thể kéo để ghép hoặc chạm lần lượt vào phép tính và hoa đáp án.
- Số tự nhiên chỉ ra số không âm; số âm chỉ xuất hiện khi được chọn riêng.
- Tự chọn phép tính, loại số, chữ số, số câu và thời gian mỗi câu.
- Luyện số tự nhiên, số âm, số thập phân, phân số và phép chia có dư.
- Chế độ tính thuận tiện để nhóm phép tính thành số tròn.
- Biểu thức 2–6 số hạng, có thể lồng ngoặc tròn, vuông và nhọn. Biểu thức phân số hỗ trợ cộng nhiều phân số.
- Khi chọn đáp án: đáp án đúng hiện xanh, câu chọn sai hiện đỏ. Chuyển câu tự động sau một nhịp ngắn; bài sai khó hiện lời giải trong 3 giây.
- Câu sai được ôn bằng trò ghép hoa với chậu. Đúng một lần là hoàn thành câu ôn.
- Mỗi câu đúng trong tự luyện nhận một viên trân châu. Size S cần 30 viên, M cần 50 viên, L cần 70 viên. Hoàn thành ly nhận huy hiệu.
- Cứ 3 level thử thách đạt yêu cầu sẽ nhận huy hiệu. Câu sai cần ôn trước khi mở tiếp level.
- Có thể tạm nghỉ một lượt luyện trong 1, 3 hoặc 5 giờ rồi quay lại câu đang làm; cũng có thể bỏ riêng lượt đang dở.
- Kết quả, tiến độ, câu sai và huy hiệu lưu trên trình duyệt hiện tại. Có xuất/nhập bản sao lưu.

## Chạy thử trên máy tính

1. Giải nén ZIP.
2. Mở thư mục `NumiQuest`.
3. Mở `index.html` bằng trình duyệt hiện đại.

## Đưa lên GitHub Pages để thử trên điện thoại

1. Tải toàn bộ file trong thư mục `NumiQuest` lên thư mục gốc kho GitHub hiện tại. Giữ đúng tên file và không chỉ tải riêng `index.html`.
2. Bấm **Commit changes**.
3. Chờ tab **Actions** báo triển khai thành công.
4. Mở link GitHub Pages trên điện thoại. Nếu chưa thấy bản mới, tải lại trang hoặc mở cửa sổ ẩn danh.

`index.html` phải ở ngay thư mục gốc của nguồn GitHub Pages.

## Tài khoản và thống kê người dùng

Nút đăng nhập giờ mở đúng màn hình tài khoản, không tự quay về trang chủ. Bản thử vẫn lưu cục bộ; đăng nhập/đăng ký thật chưa hoạt động vì chưa cấu hình backend. Luồng tài khoản đã chốt: số điện thoại làm tên đăng nhập, mật khẩu riêng, email để khôi phục. Cần triển khai backend và cấu hình xác thực trước khi thu thập thông tin hoặc đồng bộ tiến độ. Không lưu mật khẩu vào Google Sheet.

Bản này chưa gửi danh sách người dùng hay số thiết bị về một sheet. GitHub Pages chỉ lưu dữ liệu trong trình duyệt; muốn đếm tổng người dùng trên nhiều máy cần bật backend trước. Nếu bật thống kê, nên lưu mã thiết bị ẩn danh và mốc truy cập, không đưa mật khẩu vào sheet. Mỗi mã thiết bị không đồng nghĩa chắc chắn với một người.

## Ghi chú bản chạy thử

- Không có bản đồ, địa danh, bộ sưu tập quốc gia hoặc màn hình nông trại trong luồng học.
- Lộ trình chinh phục hiện là bản thử; số câu, thời gian và ngưỡng qua level được cấu hình sẵn.
- Chế độ biểu thức nâng cao đang hỗ trợ số tự nhiên và cộng nhiều phân số. Bài tính thuận tiện dùng số tự nhiên.
- Chưa bật đấu trực tuyến hoặc bảng xếp hạng người thật.
