# NumiQuest — bản chơi thử v0.2 · Zoo UI

Web tĩnh, không cần cài thư viện, API key, tài khoản máy chủ hay thanh toán.

## Đưa lên GitHub Pages

1. Giải nén NumiQuest-Zoo-v0.2.zip.
2. Mở repository numiquest trên GitHub → Add file → Upload files.
3. Kéo **các file bên trong thư mục**, không kéo cả ZIP: index.html, style.css, app.js, README.md, HUONG_DAN.txt và thư mục assets. index.html phải ở cùng cấp với README.md.
4. Commit changes → Commit trực tiếp vào main.
5. Settings → Pages → Source: Deploy from a branch → Branch: main → /(root) → Save.
6. Chờ GitHub thông báo địa chỉ trang web. Dùng địa chỉ đó để mở trên điện thoại.

Không tải thông tin bí mật hay mật khẩu vào repository. Bản này không dùng API key.

## Đã có

- Giao diện responsive tiếng Việt / tiếng Anh.
- Tự chọn nhiều phép toán, loại số, giới hạn chữ số, số câu, thời gian và độ dài màn game.
- Số tự nhiên, số nguyên âm, số thập phân một chữ số, phân số rút gọn và chia có dư.
- ABCD với bốn lựa chọn khác nhau. Hết giờ có thể thêm giờ hoặc bỏ qua; đánh dấu lượt thêm giờ trong lịch sử.
- Lưu câu sai, ưu tiên ôn trước lượt mới; chơi game trái/phải/nhảy chạm khối đáp án hoặc dùng nút đáp án thay thế.
- Ba mạng, nhảy hụt không mất mạng, sai/hết giờ mất mạng, hết mạng xem gợi ý rồi tiếp tục.
- Đấu 3 máy có nhãn, 1/3/5 phút, chấm 700 điểm chính xác + 300 tốc độ, tối đa 1000; không bảng hạng trực tuyến.
- Xuất bảng thành tích PNG, kỷ lục cá nhân.
- 10 đất nước minh họa; 4 mảnh/bộ, kiến thức, giọng đọc của thiết bị và hoạt động kéo thẻ/chọn châu lục.
- Cấp nhà thám hiểm theo XP, huy hiệu theo số bộ đã hoàn thành.
- Lịch sử 200 lượt gần nhất, độ chính xác, thời gian, biểu đồ, đề xuất kỹ năng yếu, ví dụ có hướng dẫn và bài kiểm tra lại.
- Sao lưu/khôi phục bằng JSON, lưu trên localStorage, không gửi dữ liệu người chơi lên máy chủ.
- Mục trực tuyến khóa.

## Chưa có — không nhầm với phiên bản hoàn chỉnh

- Chưa có tất cả quốc gia. Hiện có Việt Nam, Nhật Bản, Pháp, Ai Cập, Úc, Hoa Kỳ, Brazil, Ý, Ấn Độ và Vương quốc Anh.
- Địa danh hiện là biểu tượng minh họa, chưa phải ảnh ghép 4 mảnh thật. Các bộ tiếp theo vẫn dùng cùng địa danh.
- Hoạt động vị trí hiện ở mức **châu lục**, chưa có bản đồ địa lí theo tọa độ hay kéo đường biên lãnh thổ.
- Chưa có hệ thống level toán theo chương trình học, khóa/mở level theo bài kiểm tra, đường nhảy khó dần hoặc bộ ảnh mới ở level mới. XP/huy hiệu đã hoạt động; đây không phải toàn bộ hệ thống level dự kiến.
- Chưa có phòng, tài khoản, đồng bộ, người thật, bảng hạng tuần, chat, quảng cáo hay dịch vụ trả phí.
- Giọng đọc phụ thuộc máy có giọng vi-VN/en-US hay không.
- Chưa có nút chia sẻ trực tiếp đến mạng xã hội; có tải ảnh PNG để chia sẻ thủ công.
- Không có service worker: web không đảm bảo mở lại khi không có mạng. Sau khi đã tải trang, phần toán/game không cần gọi máy chủ.

## Chấm đấu máy

Một trận 3 phút có 12 câu, 5 phút có 20 câu. Mỗi câu có cửa sổ tối đa 15 giây và chuyển sau tối đa 2 giây xem kết quả. Trận có thể kết thúc sớm nếu tất cả trả lời nhanh; 3/5 phút là tổng thời gian câu hỏi tối đa, chưa phải đồng hồ trận tuyệt đối.

Điểm mỗi câu đúng = [700 + 300 × max(0, 1 − thời_gian_trả_lời/15)] / tổng_số_câu.
Sai/hết giờ = 0. Điểm cuối làm tròn và chặn ở 1000.

Máy được mô phỏng, có xác suất đúng và thời gian trả lời theo độ khó, không giả làm người thật.

## Lưu ý dữ liệu

Dữ liệu lưu trên trình duyệt và địa chỉ web đang dùng. Xóa dữ liệu trình duyệt, đổi trình duyệt hoặc đổi địa chỉ có thể làm mất quyền truy cập tiến độ cũ. Hãy xuất sao lưu JSON. Nhập sao lưu thay thế dữ liệu, không gộp.

## Kiểm tra đã chạy

- node --check app.js.
- 6.000 câu tạo ngẫu nhiên: bốn lựa chọn khác nhau, đáp án đúng có mặt; kiểm phép toán số tự nhiên và chia hết.
- Kiểm công thức điểm, chống lưu trùng câu sai, kiểm định sao lưu vòng kín.
- Chưa kiểm thử trực quan và cảm ứng trên trình duyệt thật trong môi trường xây dựng này. Cần chơi thử trên điện thoại trước khi mở rộng cho học sinh.

Không cần npm, không cần backend. Có thể mở index.html để xem nhanh; nên dùng GitHub Pages để có địa chỉ ổn định và lưu dữ liệu nhất quán.


## Cập nhật 0.2 — giao diện sở thú

- Cảnh sở thú SVG tự vẽ trong assets/zoo.svg, không gọi máy chủ ảnh hoặc font ngoài.
- 4 nhân vật SVG: Leo, Mimi, Bamboo và Finn; lưu lựa chọn đồng hành.
- Trang chủ mới: khối khám phá, chỉ số gọn, 3 khu chơi và hành trình đang thu thập.
- Điện thoại: thanh điều hướng dưới màn hình, nút lớn, bố cục một cột và cài đặt nâng cao thu gọn.
- Chọn nhanh 3 mức bài, 5/10/20 câu và 10/15/30 giây. Vẫn có tùy chỉnh chi tiết.
- ABCD có màu phân biệt; hỗ trợ bàn phím A/B/C/D và Enter chuyển câu sau khi đã trả lời.
- Game có bạn thú đồng hành, phong cảnh vườn, hướng dẫn lần đầu và nút trả lời thay thế thu gọn.
- Câu sai được xáo trộn lại vị trí đáp án khi thử lại; Fisher–Yates dùng cho trộn đáp án.
- Gợi ý tính cụ thể cho nhiều phép toán số tự nhiên; bổ sung quy tắc phân số.
- Âm thanh tổng hợp tại thiết bị có thể tắt; không tải âm thanh ngoài.
- Tôn trọng lựa chọn giảm chuyển động của thiết bị.
- Giữ key dữ liệu numiquest-v1, không xóa tiến độ 0.1.
- Thêm phiên bản vào URL CSS/JS để giảm lỗi bộ nhớ đệm.

Các giới hạn phạm vi địa lí, bản đồ, level và online ở trên vẫn áp dụng. Bản này tập trung thiết kế UX/UI, không tuyên bố hoàn thành mọi tính năng của bản ý tưởng.

## Cập nhật bản cũ trên GitHub

1. Xuất sao lưu trong mục Tiến bộ trước khi cập nhật.
2. Giải nén ZIP. Tải các file trong thư mục NumiQuest và cả thư mục assets lên đúng root repository.
3. GitHub sẽ thay các file cùng tên. Commit vào main, chờ Actions chạy xanh.
4. Mở địa chỉ cũ, Ctrl+F5 để tải lại. Điện thoại: tải lại trang; nếu vẫn giao diện cũ, đóng rồi mở lại tab. Không xóa dữ liệu trang.
5. Nếu không thấy cảnh sở thú, kiểm tra đường dẫn assets/zoo.svg đã có trong repository.

Kiểm tra 0.2: cú pháp JavaScript, 6.000 câu, điểm, sao lưu, file liên kết và tính hợp lệ XML SVG đều qua. Chưa có kiểm tra trực quan/cảm ứng trên trình duyệt thật: trình duyệt kiểm thử không truy cập được server xem trước. Cần người dùng chơi thử trên thiết bị trước khi dùng rộng rãi.
