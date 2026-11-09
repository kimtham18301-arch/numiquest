# NumiQuest v0.4 — Khu vui chơi tính nhẩm

Web luyện tính nhẩm tiếng Việt / tiếng Anh, chạy trên GitHub Pages, không cần backend, API key hoặc dịch vụ trả phí.

## Cập nhật lên GitHub

1. Trong web đang dùng, vào Tiến bộ → Xuất sao lưu để có bản dự phòng.
2. Giải nén NumiQuest-Playground-v0.4.zip, mở thư mục NumiQuest bên trong.
3. GitHub repository → Add file → Upload files.
4. Kéo các file index.html, style.css, app.js, ui.js, README.md, HUONG_DAN.txt và toàn bộ thư mục assets vào.
5. Không tải nguyên ZIP và không kéo thư mục NumiQuest bao ngoài. index.html phải nằm ngay ngoài cùng của repository.
6. Commit changes vào main. Không cần bật lại Pages.
7. Chờ Actions xanh, mở link cũ và Ctrl+F5. Không xóa dữ liệu trình duyệt để cập nhật.

Giữ nguyên key localStorage `numiquest-v1`; tiến độ 0.1/0.2 được tiếp tục trên cùng trình duyệt và địa chỉ web. Lưu ý: dữ liệu mở ở file://, một tên miền khác hoặc trình duyệt khác không tự đồng bộ; dùng xuất/nhập JSON.

## UX/UI 0.3

- Font Nunito 400–800, có đủ ký tự tiếng Việt, đóng gói tại chỗ; không cần Google Fonts lúc người dùng chơi.
- Giấy phép font SIL Open Font License nằm trong assets/OFL-Nunito.txt.
- Bảng màu xanh lá, kem, nâu đào; bỏ các màu tím/hồng/xanh dương rải rác ở các nút đáp án.
- Icon SVG nét tròn đồng bộ; quốc kỳ giữ nguyên vì là dữ liệu địa lí, nhân vật thú giữ vai trò minh họa.
- Giao diện học có thứ bậc chữ, cỡ số lớn, khoảng cách rõ; nút chính nổi bật, cài đặt nâng cao thu gọn.
- Thiết kế responsive cho điện thoại và máy tính; thanh điều hướng dưới màn hình điện thoại.
- Hỗ trợ bàn phím A/B/C/D và Enter cho bài trắc nghiệm; giảm chuyển động theo cài đặt thiết bị.

## Luật game đã thay đổi theo yêu cầu mới

Game chỉ dùng để ôn những câu trả lời sai hoặc bỏ qua, không phải màn chơi thưởng sau mỗi lượt.

- Làm đúng hết: hiện thành tích, nhận 1 mảnh khám phá, chọn luyện lượt mới hoặc mở hộ chiếu. Không vào game.
- Có câu sai: vào Vườn hoa đáp án. Cột trái là chậu có phép tính, cột phải là hoa có đáp án.
- Kéo hoa sang chậu, hoặc kéo chậu sang hoa. Có thể chạm một bên rồi chạm bên còn lại; Enter/Space cũng chọn được thẻ.
- Ghép đúng: hoa nở trong chậu, lưu câu đã ôn ngay lập tức; câu đó được xóa khỏi danh sách cần ôn.
- Không tạo câu mới để lấp đủ màn. Nếu chỉ sai một câu, game chỉ có một cặp.
- Mỗi bảng tối đa 6 cặp để dễ đọc. Nếu còn ít hơn cấu hình, chỉ hiển thị số câu còn lại.
- Viền xanh chỉ phép tính đang tính giờ. Dùng số giây đã cấu hình cho câu đó; đổi câu giữ lại thời gian còn lại, không tự tặng lại thời gian.
- Ghép sai hoặc hết giờ mất 1 mạng. Hết 3 mạng hiện cách tính, hồi 3 mạng và tiếp tục. Câu sai không mất đi.
- Kéo thả hụt ra ngoài không mất mạng.
- Hoàn thành một bảng nhận 1 mảnh; đủ 4 mảnh tạo một bộ sưu tập trong hộ chiếu.
- Rời game giữa chừng giữ các cặp đã ghép đúng; lần sau chỉ ôn những câu còn sai.
- Hoạt động chạy nhảy của bản trước đã bỏ khỏi phần ôn sai.

## Các tính năng hiện có

- Tạo bài ABCD: cộng, trừ, nhân, chia hết/chia dư, số tự nhiên, số nguyên có âm, thập phân 1 chữ số và phân số.
- Chọn nhanh mức dễ/vừa/khó, số câu và thời gian, hoặc chỉnh tối đa chữ số từng toán hạng (1–4).
- Hết giờ tự luyện: thêm giờ hoặc bỏ qua. Lưu số câu được thêm giờ trong lịch sử.
- 3 đối thủ máy có nhãn; điểm 70% chính xác + 30% tốc độ, tối đa 1.000/trận.
- Xuất ảnh thành tích PNG, kỷ lục cá nhân; chưa có chia sẻ trực tiếp vào mạng xã hội.
- 10 nước minh họa: Việt Nam, Nhật Bản, Pháp, Ai Cập, Úc, Hoa Kỳ, Brazil, Ý, Ấn Độ, Vương quốc Anh.
- Kiến thức quốc gia, thủ đô, châu lục, địa danh, điều thú vị, giọng đọc từ thiết bị và hoạt động tìm châu lục.
- XP, huy hiệu theo bộ sưu tập, thống kê, lịch sử 200 lượt, bài ôn/kiểm tra lại kỹ năng yếu.
- Sao lưu/khôi phục JSON, không cần tài khoản.
- Thi đấu online khóa; không phòng, không ghép người thật, không bảng hạng online.

## Giới hạn còn lại

Chưa có toàn bộ quốc gia, ảnh ghép địa danh thật, bản đồ lãnh thổ đúng tọa độ, bộ địa danh mới theo từng level, hay hệ thống khóa/mở level theo chương trình học. Các bộ sưu tập hiện vẫn dùng lại cùng minh họa địa danh.

Thời lượng 3/5 phút của đấu máy là tổng cửa sổ tối đa của các câu hỏi, không phải đồng hồ trận tuyệt đối. Trận có thể kết thúc sớm khi các bên trả lời nhanh.

Giọng đọc tùy thiết bị; không có service worker nên chưa bảo đảm mở lại khi mất mạng. Sau khi trang đã tải, phần bài toán và ôn sai không cần gửi dữ liệu ra mạng.

## Kiểm tra 0.3

- Cú pháp app.js và ui.js.
- 6.000 câu tạo ngẫu nhiên: lựa chọn không trùng, có đáp án đúng; toán số tự nhiên và chia hết; công thức điểm; lưu sai không trùng; sao lưu hợp lệ.
- Kiểm thử DOM qua jsdom: trang chủ, icon, preset, luồng đúng hết không vào game, chỉ đưa câu sai vào game, một câu sai chỉ tạo một cặp.
- Kéo thả hai chiều bằng sự kiện giả lập, chạm hai chiều, hoa nở, lưu tiến độ, ghép sai, hết mạng và hướng dẫn.
- Trang thống kê, hộ chiếu và chuyển ngôn ngữ.
- Tất cả đường dẫn file, font có đủ chữ tiếng Việt, giấy phép font và SVG hợp lệ.
- Chưa có kiểm thử trực quan và cảm ứng trên thiết bị thật trong môi trường này. Cần chơi thử trên điện thoại sau khi tải lên GitHub.


## Gói đầy đủ v0.4

Gói này đã gộp bản sửa font v0.3.1, tự chuyển câu v0.3.2 và giao diện thân thiện với trẻ. Không phải cài từng bản vá.

- Trang chủ là khu vui chơi: nhà học Leo, đường đua Finn, thế giới khám phá; các nơi đều là nút có thể chạm/bấm và dùng bàn phím.
- Hình minh họa lớn, nhân vật đồng hành có lời chào ngắn; chọn nhân vật được lưu lại.
- Không đưa bảng thống kê lên màn hình chính. Thành tích, lịch sử và sao lưu ở mục riêng.
- Trang chủ có lối vào vườn hoa chỉ khi còn câu sai.
- Nunito đầy đủ tiếng Việt đã nhúng trực tiếp trong style.css, không phụ thuộc đường dẫn font riêng. Giấy phép vẫn kèm assets/OFL-Nunito.txt.
- Chọn đáp án ở phần tự luyện: hiện đúng/sai 3 giây rồi tự chuyển câu; câu cuối tự tổng kết. Không có nút Câu tiếp.
- Rời trang hủy lần chuyển câu đang chờ; không ghi nhận hai lần một đáp án.
- Giữ game ghép hoa–chậu chỉ ôn câu sai; không thêm câu mới lấp bảng.
- Bump các đường dẫn CSS/JS sang v0.4 để tải lại bản cập nhật.

Kiểm tra hồi quy v0.4 qua DOM giả lập: trang chủ mới và các nút, chọn nhân vật, tự chuyển câu sau 3 giây và tổng kết, chỉ câu sai vào vườn hoa, hoa nở/lưu tiến độ, mất mạng/hướng dẫn, hộ chiếu, thống kê, ngôn ngữ. Kiểm tra 6.000 câu toán và các font/SVG/file liên kết. Chưa xác minh trực quan hay cảm ứng trên điện thoại thật; cần chơi thử sau khi đưa lên Pages.

Các giới hạn phạm vi về địa lí, hệ thống level và online nêu trên vẫn áp dụng. Gói này không tuyên bố hoàn thiện toàn bộ sản phẩm theo ý tưởng ban đầu.
