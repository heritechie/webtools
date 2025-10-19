export type HolidayType = "national" | "collective";

export interface Holiday {
  date: string; // ISO 8601 (YYYY-MM-DD)
  name: string;
  description?: string;
  type?: HolidayType;
}

export const HOLIDAYS: Record<number, Holiday[]> = {
  2024: [
    { date: "2024-01-01", name: "Tahun Baru 2024 Masehi", type: "national" },
    {
      date: "2024-02-08",
      name: "Isra Mi'raj Nabi Muhammad SAW",
      type: "national",
    },
    {
      date: "2024-02-10",
      name: "Tahun Baru Imlek 2575 Kongzili",
      type: "national",
    },
    { date: "2024-03-11", name: "Hari Suci Nyepi 1946 Saka", type: "national" },
    { date: "2024-03-29", name: "Wafat Isa Almasih", type: "national" },
    {
      date: "2024-04-10",
      name: "Hari Raya Idulfitri 1445 Hijriah",
      type: "national",
    },
    {
      date: "2024-04-11",
      name: "Hari Raya Idulfitri 1445 Hijriah (Hari ke-2)",
      type: "national",
    },
    { date: "2024-05-01", name: "Hari Buruh Internasional", type: "national" },
    { date: "2024-05-09", name: "Kenaikan Isa Almasih", type: "national" },
    { date: "2024-05-23", name: "Hari Raya Waisak 2568 BE", type: "national" },
    { date: "2024-06-01", name: "Hari Lahir Pancasila", type: "national" },
    {
      date: "2024-06-17",
      name: "Hari Raya Iduladha 1445 Hijriah",
      type: "national",
    },
    {
      date: "2024-07-07",
      name: "Tahun Baru Islam 1446 Hijriah",
      type: "national",
    },
    {
      date: "2024-08-17",
      name: "Hari Kemerdekaan Republik Indonesia",
      type: "national",
    },
    { date: "2024-09-16", name: "Maulid Nabi Muhammad SAW", type: "national" },
    { date: "2024-12-25", name: "Hari Raya Natal", type: "national" },
  ],

  2025: [
    // Libur Nasional (17 hari)
    { date: "2025-01-01", name: "Tahun Baru 2025 Masehi", type: "national" },
    {
      date: "2025-01-27",
      name: "Isra Mikraj Nabi Muhammad S.A.W.",
      type: "national",
    },
    {
      date: "2025-01-29",
      name: "Tahun Baru Imlek 2576 Kongzili",
      type: "national",
    },
    {
      date: "2025-03-29",
      name: "Hari Suci Nyepi (Tahun Baru Saka 1947)",
      type: "national",
    },
    { date: "2025-03-31", name: "Idul Fitri 1446 Hijriah", type: "national" },
    {
      date: "2025-04-01",
      name: "Idul Fitri 1446 Hijriah (Hari ke-2)",
      type: "national",
    },
    { date: "2025-04-18", name: "Wafat Yesus Kristus", type: "national" },
    {
      date: "2025-04-20",
      name: "Kebangkitan Yesus Kristus (Paskah)",
      type: "national",
    },
    { date: "2025-05-01", name: "Hari Buruh Internasional", type: "national" },
    { date: "2025-05-12", name: "Hari Raya Waisak 2569 BE", type: "national" },
    { date: "2025-05-29", name: "Kenaikan Yesus Kristus", type: "national" },
    { date: "2025-06-01", name: "Hari Lahir Pancasila", type: "national" },
    { date: "2025-06-06", name: "Idul Adha 1446 Hijriah", type: "national" },
    {
      date: "2025-06-27",
      name: "1 Muharam Tahun Baru Islam 1447 Hijriah",
      type: "national",
    },
    { date: "2025-08-17", name: "Proklamasi Kemerdekaan", type: "national" },
    {
      date: "2025-09-05",
      name: "Maulid Nabi Muhammad S.A.W.",
      type: "national",
    },
    { date: "2025-12-25", name: "Kelahiran Yesus Kristus", type: "national" },

    // Cuti Bersama (10 hari)
    {
      date: "2025-01-28",
      name: "Tahun Baru Imlek 2576 Kongzili",
      type: "collective",
    },
    {
      date: "2025-03-28",
      name: "Hari Suci Nyepi (Tahun Baru Saka 1947)",
      type: "collective",
    },
    { date: "2025-04-02", name: "Idul Fitri 1446 Hijriah", type: "collective" },
    { date: "2025-04-03", name: "Idul Fitri 1446 Hijriah", type: "collective" },
    { date: "2025-04-04", name: "Idul Fitri 1446 Hijriah", type: "collective" },
    { date: "2025-04-07", name: "Idul Fitri 1446 Hijriah", type: "collective" },
    {
      date: "2025-05-13",
      name: "Hari Raya Waisak 2569 BE",
      type: "collective",
    },
    { date: "2025-05-30", name: "Kenaikan Yesus Kristus", type: "collective" },
    { date: "2025-06-09", name: "Idul Adha 1446 Hijriah", type: "collective" },
    { date: "2025-08-18", name: "Proklamasi Kemerdekaan", type: "collective" }, // tambahan hasil perubahan SKB
    { date: "2025-12-26", name: "Kelahiran Yesus Kristus", type: "collective" },
  ],
};

export const AVAILABLE_YEARS = Object.keys(HOLIDAYS)
  .map(Number)
  .sort((a, b) => a - b);
