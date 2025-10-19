# Kalender Nasional

Aplikasi kalender libur nasional Indonesia yang menampilkan ringkasan libur tiap bulan beserta tampilan kalender per bulan. Tool ini menjadi bagian dari suite Webtools Masher dan berjalan sepenuhnya di browser tanpa backend.

## Fitur

- **Ringkasan Bulanan** – daftar 12 bulan dengan jumlah libur nasional per bulan dan highlight libur terdekat.
- **Kalender Detail** – tampilan kalender grid per bulan lengkap dengan highlight tanggal merah dan deskripsi singkat.
- **Pemilihan Tahun** – ganti dataset tahun melalui dropdown; data bersifat statis dan dapat diperbarui manual.
- **Skema Warna Gelap** – UI disesuaikan dengan gaya visual Webtools lain, responsif di berbagai ukuran layar.

## Teknologi

- [Vite](https://vite.dev/) + React 19 (TypeScript)
- Tailwind CSS 3 sebagai sistem styling utama
- Static holiday dataset di `src/data/holidays.ts`

## Prasyarat

- Node.js v18 atau lebih baru
- pnpm (disarankan mengikuti `packageManager` di repositori)

## Instalasi & Pengembangan

```bash
pnpm install
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:5173/` dengan hot module replacement aktif.

## Build Produksi

```bash
pnpm build
```

Output akan ditulis ke folder `dist/` dan siap dipublikasikan ke Cloudflare Pages. Gunakan `pnpm preview` untuk meninjau hasil build secara lokal.

## Struktur Direktori

- `src/App.tsx` – tampilan utama, termasuk layout ringkasan dan kalender.
- `src/data/holidays.ts` – daftar libur nasional per tahun (perbarui saat ada Keputusan Bersama terbaru).
- `src/lib/calendar.ts` – utilitas penyusunan kalender dan struktur pekan.
- `index.html`, `src/main.tsx` – entry point Vite + React standar.

## Pembaruan Data

1. Tambahkan atau ubah entri di `src/data/holidays.ts`.
2. Pastikan format tanggal menggunakan ISO `YYYY-MM-DD`.
3. Setelah data diperbarui, jalankan ulang build/dev server bila diperlukan.

## Lisensi

Dirilis di bawah lisensi MIT (lihat berkas `LICENSE` pada repositori induk bila tersedia). Gunakan dan modifikasi sesuai kebutuhan internal.
