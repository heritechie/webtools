# Kalkulator Pinjaman

Kalkulator cicilan berbasis web yang dipakai di webtools Masher untuk membandingkan metode flat dan efektif (anuitas). Aplikasi ini menampilkan ringkasan biaya pinjaman, timeline amortisasi interaktif, serta menyediakan ekspor PDF atau Excel untuk dibagikan ke rekan kerja maupun nasabah.

## Fitur Utama

- Perbandingan dua skenario sekaligus (flat vs efektif) dengan ringkasan biaya yang mudah dibaca.
- Dukungan opsi diskon suku bunga awal, biaya provisi, serta pilihan durasi pinjaman dalam bulan atau tahun.
- Timeline pembayaran interaktif lengkap dengan proporsi pokok/bunga dan highlight diskon intro rate.
- Ekspor laporan ke PDF menggunakan `jspdf`/`jspdf-autotable` atau Excel (`xlsx`).
- Tampilan responsif dengan toggle tema gelap/terang yang tersimpan di localStorage.
- Seluruh perhitungan berjalan di browser (tidak ada backend maupun pelacakan data).

## Teknologi

- **Framework**: Angular 20 dengan Signals dan Reactive Forms.
- **UI**: Tailwind CSS + utilitas custom.
- **Build Tooling**: Angular CLI (@angular/build) & pnpm.
- **Ekspor Dokumen**: `jspdf`, `jspdf-autotable`, `xlsx`.
- **Deployment Target**: Cloudflare Pages (melalui proxy dari situs utama MasHer).

## Prasyarat

- Node.js v18 atau lebih baru.
- pnpm (direkomendasikan, sudah dideklarasikan pada `packageManager`).

## Menjalankan Secara Lokal

```bash
pnpm install
pnpm start
```

Aplikasi akan tersedia di `http://localhost:4200/` dan otomatis melakukan reload saat berkas sumber diubah.

## Skrip Penting

```bash
pnpm start   # Menjalankan dev server Angular
pnpm build   # Build produksi ke folder dist/
pnpm watch   # Build development dengan watch mode
pnpm test    # Menjalankan unit test Karma + Jasmine
```

## Struktur Direktori

- `src/app/` – Komponen utama, logika perhitungan, dan utilitas ekspor dokumen.
- `src/assets/` – Aset statis.
- `public/` – Berkas statis yang ikut dibundel apa adanya.
- `dist/` – Output build produksi.

## Build & Deploy

```bash
pnpm build
```

Folder `dist/` hasil build dicadangkan untuk di-push ke Cloudflare Pages. Situs utama (`masher.my.id`) melakukan proxy ke build ini melalui Cloudflare Pages Function.

## Catatan Tambahan

- Perhitungan bekerja penuh di client; validasi input dilakukan melalui Angular Reactive Forms.
- Jika menambahkan dependensi baru, jalankan `pnpm install` agar lockfile tetap sinkron dengan deklarasi `packageManager`.
