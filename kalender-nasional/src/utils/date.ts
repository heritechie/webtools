// Pastikan semua parsing tanggal ISO "YYYY-MM-DD" jadi tanggal lokal (tanpa offset UTC)
export function parseISODateLocal(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
