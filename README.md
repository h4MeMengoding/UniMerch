# UniMerch - Platform E-commerce Merchandise Modern

Platform e-commerce modern dan responsif yang dibangun dengan Next.js 15, TypeScript, dan Tailwind CSS. UniMerch khusus dirancang untuk penjualan merchandise universitas dengan komponen UI yang indah, animasi yang halus, dan aksesibilitas yang sangat baik.

## 🚀 Fitur Utama

- **Desain Modern**: Interface yang bersih dan minimalis dengan styling profesional
- **Layout Responsif**: Desain mobile-first yang bekerja di semua perangkat
- **Animasi Halus**: Transisi dan micro-interactions yang diperkuat Framer Motion
- **Aksesibilitas**: Sesuai WCAG dengan manajemen fokus dan label ARIA yang tepat
- **Performa**: Dioptimalkan dengan Next.js 15 dan TypeScript
- **Komponen Modular**: Komponen UI yang dapat digunakan kembali untuk kemudahan maintenance

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **Animasi**: Framer Motion
- **Ikon**: Lucide React
- **Font**: Inter (Google Fonts)

## 📦 Struktur Proyek

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Halaman beranda
├── components/
│   ├── layout/            # Komponen layout
│   │   ├── Navbar.tsx     # Navigation bar
│   │   └── Footer.tsx     # Footer situs
│   └── ui/                # Komponen UI
│       ├── ProductCard.tsx     # Komponen kartu produk
│       ├── FilterSidebar.tsx   # Sidebar filter
│       ├── HeroSection.tsx     # Bagian hero
│       └── LoadingSpinner.tsx  # Komponen loading
```

## 🎨 Sistem Desain

### Warna
- **Primary**: Warna aksen biru (#3b82f6)
- **Neutral**: Skala abu-abu (putih, abu-abu, hitam)
- **Background**: Putih dengan tone abu-abu halus

### Tipografi
- **Font Family**: Inter (fallback sistem)
- **Ukuran**: Skala tipografi responsif
- **Ketebalan**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Komponen
- **Navbar**: Navigasi responsif dengan menu mobile
- **Footer**: Footer komprehensif dengan link dan newsletter
- **Product Cards**: Kartu tampilan produk interaktif
- **Filter Sidebar**: Opsi filtering canggih
- **Hero Section**: Bagian landing yang menarik perhatian

## 🚀 Memulai

### Prasyarat
- Node.js 18+ 
- npm, yarn, atau pnpm

### Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd unimerch
```

2. Install dependencies:
```bash
npm install
# atau
yarn install
# atau
pnpm install
```

3. Jalankan development server:
```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
```

4. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📱 Breakpoint Responsif

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

## ♿ Fitur Aksesibilitas

- **Navigasi Keyboard**: Dukungan keyboard penuh
- **Screen Reader**: Label ARIA yang tepat dan HTML semantik
- **Manajemen Fokus**: Indikator fokus yang terlihat
- **Kontras Warna**: Warna yang sesuai WCAG AA
- **Alt Text**: Alternatif gambar yang deskriptif

## 🎬 Animasi

- **Transisi Halaman**: Efek fade dan slide yang halus
- **Hover States**: Animasi tombol dan kartu interaktif
- **Loading States**: Loading spinner yang menarik
- **Animasi Scroll**: Elemen beranimasi saat scroll

## 🔧 Kustomisasi

### Warna
Edit `tailwind.config.ts` untuk mengkustomisasi palet warna:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // Warna kustom Anda
      }
    }
  }
}
```

### Font
Perbarui import font di `src/app/layout.tsx`.

### Komponen
Semua komponen bersifat modular dan dapat dikustomisasi atau diperluas dengan mudah.

## 📄 Script

- `npm run dev` - Mulai development server
- `npm run build` - Build untuk produksi
- `npm run start` - Mulai production server
- `npm run lint` - Jalankan ESLint

## 🤝 Berkontribusi

1. Fork repository
2. Buat feature branch: `git checkout -b nama-fitur`
3. Commit perubahan: `git commit -m 'Tambah fitur'`
4. Push ke branch: `git push origin nama-fitur`
5. Buka pull request

## 📝 Lisensi

Proyek ini dilisensikan di bawah MIT License.

## 🙏 Ucapan Terima Kasih

- Tim Next.js untuk framework yang luar biasa
- Tailwind CSS untuk utility-first styling
- Framer Motion untuk animasi yang halus
- Lucide untuk ikon yang indah
