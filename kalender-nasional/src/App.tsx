import { useEffect, useMemo, useState } from 'react';
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

	const monthSummaries = useMemo(
		() => buildMonthSummaries(HOLIDAYS[activeYear] ?? []),
		[activeYear],
	);

	const [selectedMonth, setSelectedMonth] = useState(() =>
		resolveInitialMonth(activeYear, monthSummaries),
	);

	useEffect(() => {
		setSelectedMonth((previous) => {
			const stillValid = monthSummaries.some((summary) => summary.month === previous);
			if (stillValid) return previous;
			return resolveInitialMonth(activeYear, monthSummaries);
		});
	}, [activeYear, monthSummaries]);

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

	return (
		<main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 text-main sm:px-6 lg:px-8">
			<header className="flex flex-col gap-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-blue">
							Webtools Masher
						</p>
			<h1 className="mt-2 font-display text-3xl font-semibold text-main md:text-4xl">
							Kalender Libur Nasional Indonesia
						</h1>
					</div>
					<label className="flex w-fit items-center gap-3 rounded-xl border border-glass bg-surface-highlight px-4 py-2 text-sm text-main">
						Pilih Tahun
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
				</div>
				<p className="max-w-2xl text-base text-soft">
					Temukan ringkasan cepat hari libur nasional dan cuti bersama yang dirilis pemerintah.
					Setiap bulan dirangkum dalam kartu, lengkap dengan kalender detail beserta deskripsi
					libur saat Anda membukanya.
				</p>
			</header>

			<section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-main">Ringkasan Bulanan</h2>
						<span className="text-sm text-muted">
							{HOLIDAYS[activeYear]?.length ?? 0} hari libur
						</span>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						{monthSummaries.map((summary) => {
							const upcoming = summary.holidays[0];
							const isActive = summary.month === selectedMonth;
							return (
								<button
									key={`${activeYear}-${summary.month}`}
									type="button"
									onClick={() => setSelectedMonth(summary.month)}
									className={`group flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all ${
										isActive
											? 'border-accent-blue bg-surface-highlight shadow-lg shadow-accent-blue/20'
											: 'border-glass bg-surface-card hover:border-accent-blue/60 hover:shadow-md hover:shadow-accent-blue/10'
									}`}
								>
									<div className="flex items-center justify-between">
										<p className="text-sm uppercase tracking-[0.3em] text-muted">
											{summary.label}
										</p>
										<span className="rounded-full bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue">
											{summary.holidays.length} libur
										</span>
									</div>
									{upcoming ? (
										<div className="space-y-1">
											<p className="text-base font-semibold text-main">{upcoming.name}</p>
											<p className="text-xs text-muted">
												{new Date(upcoming.date).toLocaleDateString('id-ID', {
													day: 'numeric',
													month: 'long',
												})}
											</p>
										</div>
									) : (
									<p className="text-sm text-muted">Tidak ada libur nasional.</p>
									)}
								</button>
							);
						})}
					</div>
					<p className="text-xs text-faint">
						<i>
							*Data libur resmi 2025 masih menunggu Keputusan Presiden. Data akan diperbarui setelah
							dokumen resmi diterbitkan.
						</i>
					</p>
				</div>

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
													cell.isCurrentMonth
														? 'bg-surface-card'
														: 'bg-surface-alt text-faint'
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

			<footer className="rounded-2xl border border-glass bg-surface-highlight px-4 py-3 text-xs text-muted">
				Data libur diambil dari Keputusan Bersama Menteri untuk tahun berjalan. Silakan perbarui berkas
				di <code>src/data/holidays.ts</code> ketika jadwal resmi baru dirilis.
			</footer>
		</main>
	);
}
