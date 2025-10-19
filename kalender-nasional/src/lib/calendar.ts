import type { Holiday } from "../data/holidays";
import { parseISODateLocal } from "../utils/date";

export type CalendarCell = {
  date: string; // "YYYY-MM-DD"
  day: number; // 1..31
  isCurrentMonth: boolean;
  isToday: boolean;
  holiday?: Holiday;
};

export type MonthCalendar = {
  month: number; // 0..11
  label: string; // e.g. "Oktober"
  holidays: Holiday[];
  weeks: CalendarCell[][];
};

// Awal minggu: 0=Minggu, 1=Senin (Indonesia umumnya Senin)
const START_ON: 0 | 1 = 1;

const MONTH_LABELS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function getMonthLabel(m: number) {
  return MONTH_LABELS[m] ?? "";
}

export function listWeekdays(): string[] {
  // label singkat konsisten dengan START_ON
  const sunFirst = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]; // Minggu duluan
  const monFirst = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]; // Senin duluan
  return START_ON === 1 ? monFirst : sunFirst;
}

function toISO(y: number, m: number, d: number) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function columnIndex(jsDay: number) {
  // jsDay: 0=Sun..6=Sat; geser agar Senin bisa jadi kolom 0
  return (jsDay - START_ON + 7) % 7;
}

function isTodayLocal(y: number, m: number, d: number) {
  const now = new Date();
  return now.getFullYear() === y && now.getMonth() === m && now.getDate() === d;
}

function mapHolidaysByISO(holidays: Holiday[]) {
  const map = new Map<string, Holiday>();
  for (const h of holidays) map.set(h.date, h);
  return map;
}

export function buildMonthCalendar(
  year: number,
  month: number,
  holidays: Holiday[] = []
): MonthCalendar {
  const holidayMap = mapHolidaysByISO(holidays);

  const firstOfMonth = new Date(year, month, 1);
  const firstCol = columnIndex(firstOfMonth.getDay());

  // tanggal pertama grid (bisa mundur ke bulan sebelumnya)
  const gridStart = new Date(year, month, 1 - firstCol);

  const weeks: CalendarCell[][] = [];
  const cursor = new Date(gridStart);

  for (let w = 0; w < 6; w++) {
    const row: CalendarCell[] = [];
    for (let c = 0; c < 7; c++) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const d = cursor.getDate();

      const iso = toISO(y, m, d);
      const inCurrent = m === month;

      row.push({
        date: iso,
        day: d,
        isCurrentMonth: inCurrent,
        isToday: isTodayLocal(y, m, d),
        holiday: holidayMap.get(iso),
      });

      cursor.setDate(d + 1);
    }
    weeks.push(row);
  }

  // hanya libur di bulan aktif untuk panel
  const holidaysThisMonth = holidays.filter(
    (h) => parseISODateLocal(h.date).getMonth() === month
  );

  return {
    month,
    label: getMonthLabel(month),
    holidays: holidaysThisMonth,
    weeks,
  };
}
