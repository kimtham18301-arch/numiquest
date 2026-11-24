# NumiQuick — bản cập nhật 2.5.3

Web luyện tính nhẩm vui cho học sinh tiểu học & THCS (Lớp 1–9 theo chuẩn GDPT 2018), chạy tĩnh trên GitHub Pages.

## Tính năng chính

- **Tự học theo Lớp 1–9 & Tùy chỉnh:** Hỗ trợ số tự nhiên, số nguyên âm, số thập phân, phân số, chia có dư, tính thuận tiện, biểu thức nhiều phép tính, điền số còn thiếu (`?`) và toán đố ngắn.
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
3. Edge Functions → tạo hàm `numi-signup` (mã nằm trong mục dưới), để mặc định, deploy.
4. Điền `url` và `publishableKey` (`sb_publishable_...`) vào `cloud-config.js`. **Không** đưa `secret`/`service_role` vào repo.

Lưu ý: PIN/mật khẩu mới tối thiểu 6 ký tự (tài khoản cũ có PIN ngắn hơn vẫn đăng nhập được cho đến khi đổi); hàm `numi-signup` giới hạn tạm 40 lượt/IP/giờ (trong bộ nhớ). Dữ liệu ở bản thử nghiệm nên xóa trước khi dùng thật.

<details><summary>Mã Edge Function <code>numi-signup</code></summary>

```ts
import { withSupabase } from "jsr:@supabase/server@^1";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const hits = new Map<string, number[]>();
const RESERVED = new Set(["admin", "root", "support"]);
function limited(req: Request): boolean {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 40;
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, _ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (limited(req)) return json({ error: "rate_limited" }, 429);
    try {
      const { username, password, name, avatar, grade, role } = await req.json();
      const u = String(username || "").trim().toLowerCase();
      if (!/^[a-z0-9_.-]{2,40}$/.test(u) || RESERVED.has(u)) return json({ error: "bad_username" }, 400);
      if (typeof password !== "string" || password.length < 6 || password.length > 72) return json({ error: "bad_password" }, 400);
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data, error } = await admin.auth.admin.createUser({
        email: u + "@numiquick.app",
        password,
        email_confirm: true,
        user_metadata: {
          username: u,
          name: String(name || u).slice(0, 30),
          avatar: String(avatar || "bunny").slice(0, 20),
          grade: Math.min(9, Math.max(1, Number(grade) || 1)),
          role: role === "teacher" ? "teacher" : "student",
        },
      });
      if (error) return json({ error: error.message }, (error as any).status === 422 ? 409 : 400);
      return json({ ok: true, id: data.user.id });
    } catch (_e) {
      return json({ error: "server" }, 500);
    }
  }),
};
```
</details>

## Kiểm thử tự động

Chạy kiểm tra cú pháp và bộ unit test bằng Node.js (v20+):
```bash
for f in *.js tests/*.js; do node --check "$f"; done
node --test tests/*.test.js
```
