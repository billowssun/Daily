# Supabase 上线配置

本项目使用 Supabase 免费层提供 PostgreSQL、邮箱密码登录和行级数据隔离。

1. 在 Vercel Marketplace 为 `daily` 项目安装 Supabase 集成。
2. 在 Supabase SQL Editor 执行：
   `supabase/migrations/202607280001_auth_and_user_data.sql`
3. 重新部署。构建脚本会把 Vercel 自动注入的 `SUPABASE_URL` 与
   `SUPABASE_PUBLISHABLE_KEY` 映射为 Expo 可公开读取的变量。
4. 第一位注册用户自动成为管理员。

只允许在前端使用 Supabase Project URL 和 Publishable Key。不要把
`service_role`、数据库密码或个人访问令牌放入 `EXPO_PUBLIC_*` 变量。
