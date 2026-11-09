# Bật đăng nhập và lưu kết quả trực tuyến

Mã kết nối đã có trong bản v0.6 nhưng **chưa được kích hoạt** vì chưa có dự án Supabase của chủ web. Khi cloud-config.js để trống, app nói rõ đang chờ kết nối và vẫn lưu trên thiết bị. Không có tài khoản giả hoặc thông báo lưu thành công giả.

## 1. Tạo dịch vụ lưu

1. Mở https://supabase.com/dashboard và tự đăng ký/đăng nhập, có thể dùng GitHub.
2. Tạo organization với gói **Free**, sau đó tạo project `numi`.
3. Chọn vùng gần người dùng, ví dụ Singapore nếu được cung cấp.
4. Tự đặt và giữ mật khẩu database; không gửi mật khẩu đó cho người khác và không đưa vào mã nguồn.
5. Chờ project sẵn sàng.

Gói Free hiện có hạn mức tài nguyên và có thể tạm dừng project ít hoạt động sau 7 ngày. Web tĩnh vẫn mở; phần đồng bộ có thể phải khôi phục project từ dashboard. Kiểm tra hạn mức hiện hành tại https://supabase.com/pricing . Không cần nâng cấp trả phí để bắt đầu thử nghiệm trong hạn mức.

## 2. Tạo bảng và quyền sở hữu dữ liệu

1. Trong project Supabase, mở **SQL Editor → New query**.
2. Mở file `cloud-setup.sql` trong gói này, sao chép toàn bộ nội dung.
3. Dán vào SQL Editor và bấm **Run**.
4. Kiểm tra bảng `numi_progress` có RLS (Row Level Security) bật và bốn policy riêng cho select/insert/update/delete, đều dùng `auth.uid() = user_id`.

Làm bước này trước khi kết nối web. Mỗi tài khoản chỉ truy cập bản lưu của mình. Đây là bảng riêng cho kết quả; không phải bảng xếp hạng hoặc thi đấu online.

## 3. Điền cấu hình công khai cho trình duyệt

Tại phần API / API Keys của project:

- Lấy **Project URL**, dạng `https://xxxxxxxx.supabase.co`.
- Lấy **Publishable key**, dạng `sb_publishable_...`; legacy `anon` key cũng được hỗ trợ.
- Không dùng `sb_secret_...`, `service_role`, database password hoặc client secret trong file này.

Mở `cloud-config.js` và điền:

```js
window.NUMI_CLOUD_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  googleEnabled: false,
  publishableKey: 'sb_publishable_YOUR_PUBLIC_KEY'
};
```

Upload file đó lên cùng cấp index.html và commit. Publishable key là cấu hình công khai; bảo vệ dữ liệu dựa vào đăng nhập và RLS, không dựa vào việc giấu key này.

## 4. Khai báo địa chỉ web

Trong **Authentication → URL Configuration**:

- Site URL: địa chỉ đầy đủ của web hiện tại, ví dụ `https://kimtham18301-arch.github.io/numiquest/`.
- Redirect URLs: thêm đúng địa chỉ đó.
- Nếu chuyển sang Netlify, thêm địa chỉ Netlify thực tế và cập nhật Site URL tương ứng. Đừng dùng một tên miền ví dụ chưa tạo.

## 5A. Thử đăng nhập email/mật khẩu

- Bật Email provider trong Authentication. Giữ xác nhận email nếu dùng luồng đăng ký xác minh.
- Email mặc định của Supabase chỉ phục vụ thử nghiệm với thành viên team, hiện giới hạn 2 email/giờ. Để gửi xác nhận/đặt lại mật khẩu cho người dùng ngoài team, cần cấu hình SMTP riêng hoặc dùng Google bên dưới.
- Đầu tiên thử bằng email chủ project, mở email xác nhận rồi quay lại đăng nhập.
- Mật khẩu chỉ gửi đến Supabase Auth; app không ghi mật khẩu vào progress, localStorage hoặc file sao lưu.
- Nút Quên mật khẩu gửi email khôi phục; liên kết mở màn đặt mật khẩu mới trên web.

## 5B. Bật Google để người dùng không cần email xác nhận riêng của app

1. Tạo project trong Google Cloud / Google Auth Platform theo hướng dẫn chính thức.
2. Cấu hình Audience và màn hình consent. Khi còn chế độ thử nghiệm, thêm email người thử trong Test users.
3. Tạo OAuth Client ID, loại **Web application**.
4. Authorized JavaScript origins: origin của web, ví dụ `https://kimtham18301-arch.github.io` (không kèm /numiquest/).
5. Authorized redirect URIs: callback do trang Google provider của Supabase đưa ra, thường là `https://YOUR_PROJECT.supabase.co/auth/v1/callback`.
6. Trong Supabase **Authentication → Providers → Google**, bật provider, điền Client ID và Client Secret vào dashboard Supabase. Client Secret không được đưa vào mã nguồn app.
7. Trong cloud-config.js, đổi `googleEnabled: true`.
8. Mở web → Đăng nhập → Tiếp tục với Google.

Tài liệu: https://supabase.com/docs/guides/auth/social-login/auth-google . Chỉ dùng các scope đăng nhập cơ bản do hướng dẫn yêu cầu; app không cần quyền đọc Gmail/Drive.

## 6. Kiểm tra bản lưu thật trên hai thiết bị

1. Đăng nhập thiết bị A. Chọn mang tiến độ trên máy vào tài khoản hoặc dùng bản đã có trực tuyến.
2. Làm một lượt học, nhận mảnh, đợi hiển thị trạng thái đã lưu (nút tài khoản có tooltip) hoặc mở Tài khoản → Lưu ngay.
3. Kiểm tra bảng numi_progress có đúng user_id, payload và revision tăng.
4. Đăng nhập cùng tài khoản trên thiết bị B → chọn **Bản đã lưu trực tuyến**.
5. Đối chiếu lịch sử, XP, câu cần ôn và số mảnh Việt Nam.
6. Thử tài khoản thứ hai: không được đọc hoặc cập nhật dòng của tài khoản thứ nhất.
7. Nếu cùng lúc hai máy thay đổi: app dừng đẩy khi revision cũ, yêu cầu chọn bản; không tự âm thầm ghi đè bản mới.

Khi đăng xuất, app giữ bản cache riêng cho tài khoản trên máy và quay về dữ liệu khách trước đó. Trước khi đổi tên miền hoặc xóa dữ liệu trình duyệt, hãy xuất sao lưu nếu có tiến độ chưa đồng bộ.

## Giới hạn kiểm tra của gói này

Đã kiểm thử API giả lập cho đăng nhập, chọn bản lưu, lưu theo user_id và revision, xung đột và đăng xuất. Chưa có dự án Supabase thật / OAuth Google thật của bạn để xác minh đầu-cuối. Phải hoàn tất cấu hình và kiểm tra hai thiết bị ở trên trước khi thông báo cho học sinh rằng đăng nhập đã hoạt động.

## Tài liệu chính thức

- Auth password: https://supabase.com/docs/guides/auth/passwords
- SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Row-level security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Free plan: https://supabase.com/pricing
