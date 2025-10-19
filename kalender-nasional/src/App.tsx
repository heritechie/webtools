import { useEffect, useMemo, useRef, useState } from 'react';
import { AVAILABLE_YEARS, HOLIDAYS, type Holiday } from './data/holidays';
import {
	buildMonthCalendar,
	buildMonthSummaries,
	getMonthLabel,
	listWeekdays,
	type MonthCalendar,
	type MonthSummary,
} from './lib/calendar';

const weekdayLabels = listWeekdays();

type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'webtools-theme';

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'dark';
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const resolveInitialYear = () => {
	const todayYear = new Date().getFullYear();
	if (AVAILABLE_YEARS.includes(todayYear)) return todayYear;
	return AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
};

const resolveInitialMonth = (year: number, summaries: MonthSummary[]) => {
	const today = new Date();
	if (today.getFullYear() === year) return today.getMonth();
	return summaries.find((summary) => summary.holidays.length > 0)?.month ?? 0;
};

const getMonthHolidays = (year: number, month: number): Holiday[] => {
	const holidays = HOLIDAYS[year] ?? [];
	return holidays.filter((holiday) => new Date(holiday.date).getMonth() === month);
};

const noop: MonthCalendar = {
	month: 0,
	label: '',
	holidays: [],
	weeks: [],
};

export default function App() {
  const [activeYear, setActiveYear] = useState(resolveInitialYear);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  const monthSummaries = useMemo(
    () => buildMonthSummaries(HOLIDAYS[activeYear] ?? []),
    [activeYear],
  );

	const [selectedMonth, setSelectedMonth] = useState(() =>
		resolveInitialMonth(activeYear, monthSummaries),
	);

  const sliderTrackRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setSelectedMonth((previous) => {
			const stillValid = monthSummaries.some((summary) => summary.month === previous);
			if (stillValid) return previous;
			return resolveInitialMonth(activeYear, monthSummaries);
		});
	}, [activeYear, monthSummaries]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const track = sliderTrackRef.current;
    if (!track) {
      return;
    }
    const activeElement = track.querySelector<HTMLElement>(`[data-month="${selectedMonth}"]`);
    if (!activeElement) {
      return;
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    activeElement.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedMonth, monthSummaries]);

  const calendar = useMemo(() => {
    if (!Number.isInteger(selectedMonth)) {
      return noop;
    }
    const holidays = getMonthHolidays(activeYear, selectedMonth);
    return buildMonthCalendar(activeYear, selectedMonth, holidays);
  }, [activeYear, selectedMonth]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveYear(Number.parseInt(event.target.value, 10));
  };

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const themeButtonText = theme === 'dark' ? 'Mode terang' : 'Mode gelap';
  const themeButtonAriaLabel = theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap';
  const themeIcon = theme === 'dark' ? '☀️' : '🌙';

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="site-logo-link" href="/webtools" aria-label="MasHer Webtools">
          <img className="site-logo" src="/logo_full.png" alt="MasHer Webtools" />
        </a>
        <span className="app-badge">Webtools • Kalender Nasional</span>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={themeButtonAriaLabel}
        >
          <span className="theme-toggle__icon" aria-hidden="true">
            {themeIcon}
          </span>
          <span className="theme-toggle__text">{themeButtonText}</span>
        </button>
      </header>

      <main className="app-main">
        <div className="app-container">
          <section className="flex flex-col gap-6">
            <section className="flex flex-col gap-4">
              <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted">Ringkasan Bulanan</p>
                  <h2 className="text-xl font-semibold text-main">{activeYear}</h2>
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-glass bg-surface-highlight px-4 py-2 text-sm text-main">
                  Tahun
                  <select
                    className="rounded-lg border border-glass bg-surface-card px-3 py-1 text-base font-medium text-main focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    value={activeYear}
                    onChange={handleYearChange}
                  >
                    {AVAILABLE_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </header>

              <div className="summary-slider">
                <div className="summary-slider__track" ref={sliderTrackRef}>
                  {monthSummaries.map((summary) => {
                    const upcoming = summary.holidays[0];
                    const isActive = summary.month === selectedMonth;
                    return (
                      <button
                        key={`${activeYear}-${summary.month}`}
                        type="button"
                        onClick={() => setSelectedMonth(summary.month)}
                        data-month={summary.month}
                        className={`summary-card ${
                          isActive
                            ? 'summary-card--active'
                            : 'summary-card--inactive'
                        }`}
                      >
                        <div className="summary-card__header">
                          <p className="summary-card__label">{summary.label}</p>
                          <span className="summary-card__badge">
                            {summary.holidays.length} libur
                          </span>
                        </div>
                        {upcoming ? (
                          <div className="summary-card__body">
                            <p className="summary-card__title">{upcoming.name}</p>
                            <p className="summary-card__date">
                              {new Date(upcoming.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                              })}
                            </p>
                          </div>
                        ) : (
                          <p className="summary-card__empty">Tidak ada libur nasional.</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-faint">
                <i>
                  *Data libur resmi 2025 masih menunggu Keputusan Presiden. Data akan diperbarui setelah
                  dokumen resmi diterbitkan.
                </i>
              </p>
            </section>

            <div className="flex flex-col gap-4 rounded-2xl border border-glass bg-surface-card p-6 shadow-inner shadow-black/20">
              <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted">
                    {getMonthLabel(calendar.month)} {activeYear}
                  </p>
                  <h2 className="text-2xl font-semibold text-main">Kalender Bulanan</h2>
                </div>
                <div className="rounded-full bg-accent-green/10 px-3 py-1 text-xs font-medium text-accent-green">
                  {calendar.holidays.length} hari libur
                </div>
              </header>

              <div className="overflow-hidden rounded-xl border border-glass">
                <table className="w-full border-collapse">
                  <thead className="bg-surface-highlight text-xs uppercase tracking-wider text-soft">
                    <tr>
                      {weekdayLabels.map((label) => (
                        <th key={label} className="px-3 py-2 text-center font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-surface-card text-sm text-main">
                    {calendar.weeks.map((week, weekIndex) => (
                      <tr key={`week-${weekIndex}`} className="border-b border-glass">
                        {week.map((cell) => (
                          <td
                            key={cell.date}
                            className={`h-16 px-3 py-2 align-top ${
                              cell.isCurrentMonth ? 'bg-surface-card' : 'bg-surface-alt text-faint'
                            }`}
                          >
                            <div
                              className={`flex h-full flex-col gap-1 ${
                                cell.holiday
                                  ? 'rounded-lg border border-accent-blue/40 bg-accent-blue/5 p-2'
                                  : ''
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${
                                  cell.isToday ? 'text-accent-amber' : ''
                                }`}
                              >
                                {cell.day}
                              </span>
                              {cell.holiday ? (
                                <span className="text-xs leading-snug text-accent-blue">
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

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                  Daftar Libur Bulan Ini
                </h3>
                {calendar.holidays.length === 0 ? (
                  <p className="rounded-lg border border-glass bg-surface-highlight px-4 py-3 text-sm text-muted">
                    Tidak ada hari libur nasional pada bulan ini.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {calendar.holidays.map((holiday) => (
                      <li
                        key={holiday.date}
                        className="flex items-start justify-between rounded-lg border border-glass bg-surface-highlight px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-main">{holiday.name}</p>
                          <p className="text-xs text-muted">
                            {holiday.description ?? 'Libur nasional'}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-accent-blue">
                          {new Date(holiday.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-glass bg-surface-highlight px-4 py-3 text-xs text-muted">
            Data libur diambil dari Keputusan Bersama Menteri untuk tahun berjalan. Perbarui berkas
            <code className="mx-1 text-main">src/data/holidays.ts</code> ketika jadwal resmi baru dirilis.
          </section>
        </div>
      </main>

      <footer className="site-footer">© {new Date().getFullYear()} Masher. All rights reserved.</footer>
    </div>
  );
}
