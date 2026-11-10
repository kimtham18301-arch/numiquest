# NumiQuick v0.9.2 — bản chạy thử

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
- Có thể tạm nghỉ một lượt luyện trong 1, 3 hoặc 5 giờ rồi quay lại câu đang làm; cũng có thể bỏ riêng lượt đang dở. Khi rời phần ôn câu sai, bé chọn làm tiếp hoặc xóa các câu sai còn lại; lịch sử và phần thưởng vẫn được giữ.
- Kết quả, tiến độ, câu sai và huy hiệu lưu trên trình duyệt hiện tại. Có xuất/nhập bản sao lưu. Mục Thành tích có biểu đồ đường tỷ lệ đúng theo 7 ngày gần nhất.

## Chạy thử trên máy tính

1. Giải nén ZIP.
2. Mở thư mục `NumiQuick`.
3. Mở `index.html` bằng trình duyệt hiện đại.

## Đưa lên GitHub Pages để thử trên điện thoại

1. Tải toàn bộ file trong thư mục `NumiQuick` lên thư mục gốc kho GitHub hiện tại. Giữ đúng tên file và không chỉ tải riêng `index.html`.
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

## Cây 100 lá: đếm thiết bị ghé thăm

Bản này có cây nổi ở góc màn hình. Mỗi trình duyệt/thiết bị được cấp một mã ngẫu nhiên và tối đa 100 mã được tính thành lá. Cây chưa hiện con số khi chưa kết nối, tránh hiển thị lượt đếm giả. Mã được lưu trên thiết bị; sheet chỉ lưu mã băm, thời điểm ghé thăm và số lần mở trang, không thu tên, số điện thoại hay mật khẩu. Một thiết bị không nhất thiết tương ứng với một người.

Để bộ đếm dùng chung giữa các máy và ghi Google Sheet (miễn phí trong giới hạn dịch vụ Google):

1. Tạo một Google Sheet mới. Sao chép phần ID trong địa chỉ nằm giữa `/d/` và `/edit`.
2. Mở **Tiện ích mở rộng → Apps Script**. Dán nội dung `visitor-counter.gs` vào trình soạn thảo.
3. Thay `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` bằng ID sheet, rồi lưu.
4. Chọn **Triển khai → Lần triển khai mới → Ứng dụng web**. Chạy ứng dụng với tư cách tài khoản của bạn; quyền truy cập chọn **Bất kỳ ai** để khách GitHub Pages gửi mã thiết bị ẩn danh. Google có thể yêu cầu bạn xác nhận quyền lần đầu.
5. Triển khai, sao chép URL kết thúc bằng `/exec`.
6. Mở `visitor-tree-config.js`, dán URL vào `endpoint`, ví dụ `endpoint: 'https://script.google.com/macros/s/.../exec'`.
7. Tải toàn bộ thư mục `NumiQuick` lên GitHub Pages và commit. Mở trang bằng một lần tải mới; cây sẽ cập nhật số thiết bị sau khi Google Sheet nhận lượt đầu.

Chỉ bật quyền truy cập công khai cho sheet Apps Script nếu bạn chấp nhận bộ đếm công khai. Script chỉ cho xem tổng số (không trả danh sách thiết bị), giới hạn tối đa 100 thiết bị, và mã thiết bị được băm trước khi ghi. Không dùng sheet này để lưu tài khoản hoặc thông tin định danh.
