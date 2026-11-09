# NumiQuest v0.7 — Nông trại Numi

Web tính nhẩm có một bạn thỏ đồng hành. Chạy tĩnh trên GitHub Pages, không cần cài thư viện hoặc trả phí máy chủ cho phần chơi trên thiết bị.

## Cách chơi

- Chạm nền nông trại: Numi tự đi đến. Chạm vườn cà rốt, luống rau hoặc kho cỏ: Numi đi tới rồi mở nhiệm vụ thu hoạch.
- Mỗi câu đúng trong tự luyện hoặc Chinh phục nhận 1 đồ ăn đã chọn + 1 sao. Đấu máy nhận cà rốt và sao theo câu đúng, không nhận mảnh.
- Chọn đáp án xong chuyển câu ngay, cả đúng và sai. Không còn nút câu tiếp hoặc đợi 3 giây.
- Câu sai lưu vào vườn hoa: ghép phép tính với đáp án bằng kéo thả hoặc chạm. Mỗi câu ôn đúng nhận thêm 1 bó cỏ, không nhận sao hoặc mảnh. Không thêm câu mới vào lượt ôn.
- Cho ăn: tiêu thụ 1 đồ ăn, tăng 1 phần lớn lên và 2 điểm tình bạn. Có 5 cà rốt chào mừng khi bắt đầu nông trại lần đầu.
- Numi lớn qua các mốc 20, 60 và 140 phần ăn; điểm tình bạn tiếp tục tích lũy. Thú không mất sức, đói hoặc mất đồ ăn khi nghỉ chơi.
- 20 điểm tình bạn mở khăn; 80 điểm mở mũ. Có thể tháo hoặc đổi phụ kiện trong Trang trí.
- Sao mua bồn hoa (12), hàng rào (25), góc picnic (45). Đồ đã mua không bị tính phí lần nữa; chọn một món để đặt vào nông trại.
- Đổi tên thỏ và tên trên bằng khen bằng nút bút chì bên cạnh tên Numi.

## Chinh phục để nhận mảnh

- Vào Chinh phục từ thẻ bên cạnh nông trại hoặc nút Kiếm mảnh mới trong bản đồ.
- Mỗi level có cấu hình riêng: 10 câu ở hai level đầu mỗi chặng, 15 câu ở level cuối. Thời gian giảm dần trong chặng, không thêm giờ. Hết giờ là câu sai và chuyển câu ngay.
- Cần đúng ít nhất 80% lần đầu (8/10 hoặc 12/15), sau đó ôn hết câu sai mới qua level. Ôn đúng không sửa tỷ lệ lần đầu.
- Không đủ 80%: ôn rồi thử lại level đó; vẫn giữ đồ ăn đã kiếm được.
- Qua đủ 3 level nhận 1 mảnh Việt Nam và một bằng khen có tên, chặng level, độ chính xác tốt nhất trung bình và địa danh. Có nút lưu ảnh PNG.
- Các chặng lần lượt gồm cộng/trừ 1 chữ số, cộng/trừ 2 chữ số, nhân/chia, trộn phép tính, số âm, thập phân, phân số, chia có dư. Sau đó trộn nhiều loại và tăng chữ số đến tối đa 6.
- Tự luyện, đấu máy, hoàn thành một trang hoa không còn tự tặng mảnh.
- Mảnh và dữ liệu từ bản cũ giữ nguyên. Lộ trình Chinh phục bắt đầu riêng từ level 1.

## Toán và giao diện

Tự luyện vẫn cho chọn nhiều phép tính, loại số, số chữ số 1–6, số câu 1–100 và thời gian 5–120 giây. Tự luyện hết giờ vẫn có thể thêm giờ hoặc bỏ qua; Chinh phục không thêm giờ.

Phân số hiển thị tử số trên, mẫu số dưới và gạch ngang ở đề, đáp án, chậu/hoa và hướng dẫn ôn. Dữ liệu bên trong vẫn là phân số rút gọn, không đổi sang số gần đúng để so đáp án. Các điểm số kiểu 8/10 vẫn hiển thị bình thường.

Hình nông trại, thỏ và đồ ăn là SVG ngay trong mã. Font Nunito kèm đầy đủ dấu tiếng Việt được nhúng trong CSS, không cần thư mục ảnh hoặc Google Fonts. Có giao diện tiếng Việt và tiếng Anh, bố cục cho màn hình nhỏ, nút bấm và hỗ trợ giảm chuyển động.

## Khám phá Việt Nam

Giữ bộ 34 địa phương, ảnh có nguồn/giấy phép, mảnh ghép bấm mở địa danh và vị trí, phóng to/thu nhỏ bản đồ. Hoàng Sa và Trường Sa có ký hiệu riêng. Các nước khác tạm khóa. Bản đồ là bản đồ khái quát, không phải ranh giới từng tỉnh. Xem GEOGRAPHY-CREDITS.md.

## Lưu kết quả và tài khoản

Dữ liệu nông trại, kho đồ, tình bạn, đồ trang trí, level, mảnh, lịch sử và câu sai dùng chung tiến độ lưu trên trình duyệt. Xuất sao lưu trong Nhật ký trước khi đổi thiết bị hoặc xóa dữ liệu.

Đăng nhập chỉ hoạt động khi bạn cấu hình Supabase của mình. Bộ ZIP không chứa thông tin kết nối thật. Xem DANG_NHAP.md và cloud-setup.sql. Khi đã kết nối, dữ liệu nông trại và Chinh phục được đồng bộ trong cùng bản tiến độ. Không có đấu người thật trong bản này.

## Tải lên GitHub

Giải nén, mở thư mục NumiQuest, tải toàn bộ file bên trong lên kho mã hiện tại rồi Commit changes. Hai file mới bắt buộc là challenge.js và farm.js. File index.html phải nằm ngay thư mục gốc.

Nếu đã kết nối tài khoản thật, giữ cloud-config.js đã điền của bạn; không ghi đè bằng cấu hình trống. Không xóa dữ liệu trình duyệt. Chờ Actions hoàn thành rồi mở lại link cũ, Ctrl+F5 trên máy tính hoặc tải lại trang trên điện thoại.

## Kiểm tra của bản này

Đã kiểm tra logic bằng jsdom: tải đầy đủ app, di chuyển đến vị trí, mở nhiệm vụ, phân số, chuyển câu ngay, chặn click câu cũ, đồ ăn/cho ăn, mốc lớn lên, tình bạn, mua đồ không tính tiền lặp, khóa phụ kiện, điều kiện level và ôn sai, 3 level/1 mảnh, bằng khen, lưu dữ liệu và song ngữ. Kiểm tra thêm 10.000 phép tính, bản đồ 34 địa phương và luồng tài khoản bằng API giả lập.

Chưa kiểm tra trực tiếp trên thiết bị điện thoại hoặc tài khoản Supabase thật. Sau khi tải lên, nên thử một lượt trên điện thoại của bạn. Các tính năng ngoài phạm vi này như đi theo đường tránh vật cản hoặc bản đồ nhiều nông trại chưa được thêm.
