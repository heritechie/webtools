# Webtools

Koleksi utilitas web ringan yang dibuat untuk mendukung eksperimen, debugging, dan pekerjaan sehari-hari di ekosistem MasHer. Setiap tool dibangun sebagai aplikasi kecil yang berjalan sepenuhnya di browser tanpa backend, sehingga aman dipakai bahkan di jaringan terbatas.

## Proyek Saat Ini

- [`kalkulator-pinjaman/`](./kalkulator-pinjaman/)  
  Simulator cicilan dengan perbandingan metode flat vs efektif (anuitas), dukungan skenario diskon bunga, biaya provisi, serta ekspor PDF/Excel.

## Cara Kerja

- Setiap utilitas hidup di subfolder terpisah dan umumnya menggunakan framework yang paling sesuai dengan kebutuhan (misalnya Angular untuk kalkulator).
- Tool dibangun mandiri lalu dipublikasikan ke Cloudflare Pages.
- Situs utama [`masher.my.id`](https://masher.my.id/) melakukan proxy ke setiap tool melalui Cloudflare Pages Functions agar URL publik tetap konsisten di bawah `/webtools/...`.

## Konvensi

- Gunakan `pnpm` sebagai package manager (lihat masing-masing tool untuk detail skrip).
- Pastikan setiap proyek menyiapkan README tersendiri yang menjelaskan fitur, teknologi, dan langkah build/deploy.
- Hindari menyimpan secret atau data sensitif; seluruh alat dirancang untuk berjalan 100% client-side.

## Menambahkan Tool Baru

1. Buat folder baru di dalam `webtools/` dan inisialisasi proyek sesuai kebutuhan (contoh: `pnpm create astro`, `ng new`, dsb).
2. Tambahkan README di folder proyek berisi deskripsi, setup, dan skrip penting.
3. Pastikan build output bisa dipublikasikan ke Cloudflare Pages.
4. Update situs utama MasHer (Astro) untuk menambahkan kartu tool baru beserta proxy route ke build tersebut.

## Lisensi

Kecuali disebutkan lain di repositori masing-masing tool, seluruh kode dirilis untuk keperluan pribadi/eksperimen MasHer. Hubungi pemilik repo apabila ingin menggunakan ulang kode untuk kebutuhan lain.
