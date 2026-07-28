# Supabase 上线配置

本项目使用 Supabase 免费层提供 PostgreSQL、邮箱密码登录和行级数据隔离。

1. 在 Vercel Marketplace 为 `daily` 项目安装 Supabase 集成。
2. 推送一次预览部署。构建会通过 `POSTGRES_URL_NON_POOLING` 自动创建
   用户表、状态表、RLS 和管理员保护规则，再创建两个临时账号验证权限并清理。
3. 构建脚本会把 Vercel 自动注入的 `SUPABASE_URL` 与
   `SUPABASE_PUBLISHABLE_KEY` 映射为 Expo 可公开读取的变量。
4. 第一位注册用户自动成为管理员。

只允许在前端使用 Supabase Project URL 和 Publishable Key。不要把
`service_role`、数据库密码或个人访问令牌放入 `EXPO_PUBLIC_*` 变量。
