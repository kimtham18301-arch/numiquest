-- NumiQuick: xóa dữ liệu THỬ NGHIỆM trên Supabase trước khi cho học sinh dùng thật.
-- KHÔNG HOÀN TÁC ĐƯỢC. Nên xuất sao lưu (Admin Center → Sao lưu) trước khi chạy.
--
-- Cách dùng trong Supabase → SQL Editor:
--   1) Chạy riêng PHẦN 1 để xem sẽ xóa bao nhiêu dòng.
--   2) Nếu đúng ý, chạy PHẦN 2.
-- Bảng và hàm (cloud-setup.sql) được giữ nguyên, chỉ xóa dữ liệu.

-- ===================== PHẦN 1: XEM TRƯỚC (không xóa gì) =====================
select 'tài khoản tên+PIN (@numiquick.app)' as muc, count(*) as so_dong from auth.users where email like '%@numiquick.app'
union all select 'numi_progress',      count(*) from public.numi_progress
union all select 'numi_profiles',      count(*) from public.numi_profiles
union all select 'numi_classrooms',    count(*) from public.numi_classrooms
union all select 'numi_enrollments',   count(*) from public.numi_enrollments
union all select 'numi_assignments',   count(*) from public.numi_assignments
union all select 'numi_submissions',   count(*) from public.numi_submissions
union all select 'numi_student_stats', count(*) from public.numi_student_stats
union all select 'numi_signup_hits',   count(*) from public.numi_signup_hits;

-- ===================== PHẦN 2: XÓA =====================
-- Bỏ dấu "--" ở 4 dòng dưới rồi chạy. Mọi bảng numi_* tham chiếu auth.users với ON DELETE CASCADE,
-- nên xóa tài khoản là xóa luôn tiến độ, lớp, giao bài, bài nộp của tài khoản đó.
-- Tài khoản đăng nhập bằng email thật/Google KHÔNG bị xóa, chỉ mất dữ liệu NumiQuick của họ (truncate).
--
-- begin;
-- delete from auth.users where email like '%@numiquick.app';
-- truncate public.numi_submissions, public.numi_assignments, public.numi_enrollments, public.numi_classrooms, public.numi_student_stats, public.numi_profiles, public.numi_progress, public.numi_signup_hits;
-- commit;
