# Vercel 部署指南

## 🚨 重要提醒

SQLite 數據庫在 Vercel 上**無法持久化**。每次部署都會重置數據庫。為了解決這個問題，您需要：

## 解決方案 1: 使用 Vercel Postgres (推薦)

1. **在 Vercel Dashboard 中添加 Postgres 數據庫**：
   - 進入您的項目設置
   - 點擊 "Storage" 標籤
   - 添加 "Postgres" 數據庫
   - Vercel 會自動設置 `DATABASE_URL` 環境變數

2. **更新 Prisma Schema**：
   ```prisma
   datasource db {
     provider = "postgresql"  // 改為 postgresql
     url      = env("DATABASE_URL")
   }
   ```

3. **運行遷移**：
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

## 解決方案 2: 使用其他雲數據庫

### Railway PostgreSQL
1. 在 [Railway](https://railway.app) 創建 PostgreSQL 數據庫
2. 獲取連接字符串
3. 在 Vercel 環境變數中設置 `DATABASE_URL`

### PlanetScale MySQL
1. 在 [PlanetScale](https://planetscale.com) 創建 MySQL 數據庫
2. 獲取連接字符串
3. 更新 schema provider 為 `mysql`

### Supabase PostgreSQL
1. 在 [Supabase](https://supabase.com) 創建項目
2. 獲取數據庫 URL
3. 在 Vercel 中設置環境變數

## 當前狀態

目前的應用使用 SQLite，這在 Vercel 上會導致：
- ❌ 數據無法持久化
- ❌ 每次部署後數據丟失
- ❌ 註冊功能可能失敗

## 環境變數設置

在 Vercel Dashboard 中設置以下環境變數：

```bash
# 數據庫
DATABASE_URL="your-cloud-database-url"

# NextAuth
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-super-secret-production-key"

# 應用配置
APP_NAME="Employee Retention Platform"
APP_URL="https://your-app-name.vercel.app"
```

## 測試部署

1. 訪問 `https://your-app.vercel.app/api/debug` 檢查數據庫連接
2. 嘗試註冊新用戶
3. 檢查 Vercel 函數日誌查看錯誤信息

## 臨時解決方案

如果您需要快速測試，可以：
1. 使用 [Neon](https://neon.tech) 免費 PostgreSQL 數據庫
2. 在 30 秒內設置完成
3. 立即可用於生產環境