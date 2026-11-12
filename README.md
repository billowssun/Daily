# 日序 Daily

日序个人生活管理应用，整合任务、日历、笔记、财务和回顾，并通过账号系统同步个人数据。

## 功能与技术

- 今日概览、计划、日历、笔记、财务与回顾。
- 邮箱账号登录、个人数据同步与管理入口。
- Expo、React Native、TypeScript 与 Supabase。

## 本地启动

```bash
npm ci
npm run web
```

复制 `.env.example` 为本地环境文件，并填写自己的项目地址和可公开发布的 Key：

| 环境变量 | 用途 |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | 项目地址 |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 前端 Publishable Key |

实际使用前需要配置数据库表、认证和行级权限，详见 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)。迁移文件位于 `supabase/migrations/`。

## 验证与构建

```bash
npm run typecheck
npm run build:web
```

`build:web` 会先执行数据库准备脚本，再导出 Web 页面到 `dist/`，需要按配置说明提供环境变量。数据库迁移属于有副作用的操作，执行前确认目标项目和备份。

## 部署与数据保护

`vercel.json` 已配置安装、构建命令及输出目录。首次上线时应由所有者先注册：当前设计中首位注册用户会成为管理员。

前端只使用 Publishable Key；数据库密码、Service Role Key 和个人访问令牌不能放入 `EXPO_PUBLIC_*` 或提交到仓库。账号与权限配置以现有迁移和部署说明为准。
