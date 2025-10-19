import { useEffect, useMemo, useState } from "react";
import { AVAILABLE_YEARS, HOLIDAYS, type Holiday } from "./data/holidays";
import {
  buildMonthCalendar,
  getMonthLabel,
  listWeekdays,
  type MonthCalendar,
} from "./lib/calendar";
import { parseISODateLocal } from "./utils/date"; // pastikan path ini sesuai

const weekdayLabels = listWeekdays();

const monthOptions = Array.from({ length: 12 }, (_, month) => ({
  month,
  label: getMonthLabel(month),
}));

// initial state: buka tahun & bulan saat ini (fallback ke tahun terakhir yang tersedia)
const initial = (() => {
  const now = new Date();
  const thisYear = now.getFullYear();
  const year = AVAILABLE_YEARS.includes(thisYear)
    ? thisYear
    : AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
  const month = year === thisYear ? now.getMonth() : 0; // kalau beda tahun, fallback ke Januari
  return { year, month };
})();

const getMonthHolidays = (year: number, month: number): Holiday[] => {
  const holidays = HOLIDAYS[year] ?? [];
  return holidays.filter((h) => parseISODateLocal(h.date).getMonth() === month);
};

const noop: MonthCalendar = { month: 0, label: "", holidays: [], weeks: [] };

export default function App() {
  const [activeYear, setActiveYear] = useState<number>(initial.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(initial.month);

  // lock dark (ubah kalau mau ikuti OS)
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = "dark";
    root.style.colorScheme = "dark";
  }, []);

  const calendar = useMemo(() => {
    if (!Number.isInteger(selectedMonth)) return noop;
    const holidays = getMonthHolidays(activeYear, selectedMonth);
    return buildMonthCalendar(activeYear, selectedMonth, holidays);
  }, [activeYear, selectedMonth]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setActiveYear(Number.parseInt(e.target.value, 10));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedMonth(Number.parseInt(e.target.value, 10));

  const goToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    if (AVAILABLE_YEARS.includes(y)) {
      setActiveYear(y);
      setSelectedMonth(m);
    } else {
      // Tahun saat ini tidak tersedia → pakai tahun terakhir yang tersedia
      setActiveYear(AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]);
      setSelectedMonth(0); // boleh diganti ke `m` jika ingin tetap bulan sekarang
    }
  };

  const goPrevMonth = () => {
    setSelectedMonth((m) => {
      if (m === 0) {
        setActiveYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setSelectedMonth((m) => {
      if (m === 11) {
        setActiveYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const isWeekend = (isoDate: string) => {
    const d = parseISODateLocal(isoDate);
    const wd = d.getDay(); // 0 Minggu, 6 Sabtu
    return wd === 0 || wd === 6;
  };

  // label ARIA untuk tombol panah
  const prevDate = new Date(activeYear, selectedMonth - 1, 1);
  const nextDate = new Date(activeYear, selectedMonth + 1, 1);
  const prevLabel = `Bulan sebelumnya: ${getMonthLabel(
    prevDate.getMonth()
  )} ${prevDate.getFullYear()}`;
  const nextLabel = `Bulan berikutnya: ${getMonthLabel(
    nextDate.getMonth()
  )} ${nextDate.getFullYear()}`;

  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          className="site-logo-link"
          href="/webtools"
          aria-label="MasHer Webtools"
        >
          <img
            className="site-logo"
            src="/logo_full.png"
            alt="MasHer Webtools"
          />
        </a>
        <div>
          <p className="site-title">Kalender Nasional</p>
          <p className="site-subtitle">
            {getMonthLabel(calendar.month)} {activeYear}
          </p>
        </div>

        <div className="site-header-spacer" />
        <header className="calendar-header">
          <div className="calendar-controls">
            <div className="calendar-nav">
              <button
                type="button"
                className="btn-nav"
                onClick={goPrevMonth}
                aria-label={prevLabel}
              >
                ←
              </button>
              <button type="button" className="btn-nav" onClick={goToday}>
                Hari ini
              </button>
              <button
                type="button"
                className="btn-nav"
                onClick={goNextMonth}
                aria-label={nextLabel}
              >
                →
              </button>
            </div>

            <label className="calendar-select">
              <span>Tahun</span>
              <select value={activeYear} onChange={handleYearChange}>
                {AVAILABLE_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="calendar-select">
              <span>Bulan</span>
              <select value={selectedMonth} onChange={handleMonthChange}>
                {monthOptions.map((option) => (
                  <option key={option.month} value={option.month}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

          </div>
        </header>
      </header>

      <main className="app-main">
        <div className="app-container">
          <section className="flex flex-col gap-6">
            <div className="calendar-shell">
              <div className="calendar-layout">
                <div className="calendar-table-wrapper">
                  <table className="calendar-table">
                    <thead>
                      <tr>
                        {weekdayLabels.map((label) => (
                          <th key={label} scope="col">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {calendar.weeks.map((week, weekIndex) => (
                        <tr key={`week-${weekIndex}`}>
                          {week.map((cell) => (
                            <td
                              key={cell.date}
                              aria-current={cell.isToday ? "date" : undefined}
                              className={[
                                "calendar-cell",
                                cell.isCurrentMonth
                                  ? "calendar-cell--current"
                                  : "calendar-cell--muted",
                                cell.holiday ? "calendar-cell--holiday" : "",
                                cell.isToday ? "calendar-cell--today" : "",
                                isWeekend(cell.date)
                                  ? "calendar-cell--weekend"
                                  : "",
                              ]
                                .join(" ")
                                .trim()}
                            >
                              <div className="calendar-cell__inner">
                                <span className="calendar-cell__day">
                                  {cell.day}
                                </span>
                                {cell.holiday ? (
                                  <span className="calendar-cell__holiday">
                                    {cell.holiday.name}
                                  </span>
                                ) : null}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <aside className="holiday-panel" aria-live="polite">
                  <h2>Hari Libur Bulan Ini</h2>
                  {calendar.holidays.length === 0 ? (
                    <p className="holiday-panel__empty">
                      Tidak ada hari libur nasional.
                    </p>
                  ) : (
                    <ul className="holiday-panel__list">
                      {calendar.holidays.map((holiday) => {
                        const d = parseISODateLocal(holiday.date);
                        const day = d.getDate();
                        const mon = d.toLocaleString("id-ID", {
                          month: "short",
                        });

                        return (
                          <li key={holiday.date}>
                            <div className="holiday-item">
                              <div className="holiday-item__date">
                                <span className="holiday-item__day">{day}</span>
                                <span className="holiday-item__mon">{mon}</span>
                              </div>

                              <div className="holiday-item__content">
                                <div className="holiday-item__header">
                                  <span className="holiday-item__datefull">
                                    {d.toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                    })}
                                  </span>

                                  <span
                                    className={`holiday-panel__badge holiday-panel__badge--${
                                      holiday.type ?? "national"
                                    }`}
                                  >
                                    {holiday.type === "collective"
                                      ? "Cuti bersama"
                                      : "Libur nasional"}
                                  </span>
                                </div>

                                <p className="holiday-item__title">
                                  {holiday.name}
                                </p>

                                {holiday.description ? (
                                  <p className="holiday-item__desc">
                                    {holiday.description}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </aside>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        © {new Date().getFullYear()} Masher. All rights reserved.
      </footer>
    </div>
  );
}
