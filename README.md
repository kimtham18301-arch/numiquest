# NumiQuest — bản chơi thử v0.1

Web tĩnh, không cần cài thư viện, API key, tài khoản máy chủ hay thanh toán.

## Đưa lên GitHub Pages

1. Giải nén NumiQuest-v0.1.zip.
2. Mở repository numiquest trên GitHub → Add file → Upload files.
3. Kéo **các file bên trong thư mục**, không kéo cả ZIP: index.html, style.css, app.js, README.md, HUONG_DAN.txt. index.html phải ở cùng cấp với README.md.
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
