# 🚀 Vercel Deployment Fix - UniMerch

## ❌ **Error yang Terjadi:**
```
Failed to compile.
./src/app/api/orders/check-payment/route.ts:29:32
Type error: Property 'order' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
```

## 🔧 **Penyebab Masalah:**
1. **Prisma Client tidak ter-generate** saat build di Vercel
2. **Missing postinstall script** untuk generate Prisma types
3. **Environment variables** tidak ter-setup dengan benar

## ✅ **Solusi yang Diterapkan:**

### 1. **Menambahkan Postinstall Script**
**File**: `package.json`
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack", 
    "start": "next start",
    "lint": "eslint",
    "postinstall": "prisma generate"  // ✅ Added
  }
}
```

### 2. **Membuat Vercel Configuration**
**File**: `vercel.json`
```json
{
  "buildCommand": "prisma generate && npm run build",
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret", 
    "XENDIT_SECRET_KEY": "@xendit_secret_key",
    "NEXT_PUBLIC_BASE_URL": "@next_public_base_url"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 3. **Memperbaiki Import Consistency**
Memastikan semua API routes menggunakan import yang konsisten dari `@/lib/prisma`.

## 🔑 **Environment Variables Required di Vercel:**

### **Database**
- `DATABASE_URL` = PostgreSQL connection string dari Supabase

### **Authentication** 
- `JWT_SECRET` = Random secret key untuk JWT signing

### **Payment Gateway**
- `XENDIT_SECRET_KEY` = Secret key dari Xendit (test/live)

### **App Configuration**
- `NEXT_PUBLIC_BASE_URL` = URL production aplikasi (https://your-app.vercel.app)

## 📋 **Deployment Steps:**

### 1. **Setup Environment Variables di Vercel Dashboard:**
```bash
# Database
DATABASE_URL = "postgresql://postgres:password@host:port/database"

# Auth
JWT_SECRET = "your-random-secret-key"

# Payment
XENDIT_SECRET_KEY = "xnd_development_xxx" # test mode
# XENDIT_SECRET_KEY = "xnd_production_xxx" # production mode

# App URL
NEXT_PUBLIC_BASE_URL = "https://your-app.vercel.app"
```

### 2. **Commit & Push Files:**
```bash
git add .
git commit -m "fix: Vercel deployment with Prisma client generation"
git push origin main
```

### 3. **Deploy to Vercel:**
- Connect GitHub repository
- Vercel akan otomatis detect Next.js
- Build process akan run: `prisma generate && npm run build`

## ⚠️ **Troubleshooting:**

### **Jika Build Masih Gagal:**
1. **Check Prisma Version**: Pastikan `@prisma/client` dan `prisma` version sama
2. **Database Connection**: Pastikan `DATABASE_URL` bisa diakses dari Vercel
3. **Build Logs**: Check Vercel build logs untuk error detail

### **Performance Optimization:**
- **API Timeout**: Set ke 30 detik untuk query database yang complex
- **Edge Runtime**: Tidak compatible dengan Prisma, gunakan Node.js runtime

## 🎯 **Expected Result:**
✅ Build successful di Vercel
✅ Prisma types ter-generate dengan benar
✅ All API endpoints working
✅ Database connection established
✅ Payment integration functional

## 📊 **Build Output Expected:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (29/29)
✓ Finalizing page optimization
```

Sekarang deployment di Vercel seharusnya berhasil! 🚀