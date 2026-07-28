# Supabase 上线配置

本项目使用 Supabase 免费层提供 PostgreSQL、邮箱密码登录和行级数据隔离。

1. 在 Vercel Marketplace 为 `daily` 项目安装 Supabase 集成。
2. 在 Supabase SQL Editor 执行：
   `supabase/migrations/202607280001_auth_and_user_data.sql`
3. 将 Vercel 自动生成的变量映射为：
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. 重新部署。第一位注册用户自动成为管理员。

只允许在前端使用 Supabase Project URL 和 Publishable Key。不要把
`service_role`、数据库密码或个人访问令牌放入 `EXPO_PUBLIC_*` 变量。
