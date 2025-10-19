import type { Holiday } from '../data/holidays';

const WEEK_DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] as const;

export type WeekdayLabel = (typeof WEEK_DAYS)[number];

export interface CalendarCell {
	date: string;
	day: number;
	isCurrentMonth: boolean;
	isToday: boolean;
	holiday?: Holiday;
}

export interface MonthSummary {
	month: number; // 0-based
	label: string;
	holidays: Holiday[];
}

export interface MonthCalendar {
	month: number;
	label: string;
	weeks: CalendarCell[][];
	holidays: Holiday[];
}

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long' });

export const getMonthLabel = (monthIndex: number) =>
	monthFormatter.format(new Date(2000, monthIndex, 1));

export const listWeekdays = (): WeekdayLabel[] => [...WEEK_DAYS];

export function groupHolidaysByMonth(holidays: Holiday[]): Map<number, Holiday[]> {
	const map = new Map<number, Holiday[]>();
	for (const holiday of holidays) {
		const month = new Date(holiday.date).getMonth();
		const current = map.get(month) ?? [];
		current.push(holiday);
		map.set(month, current);
	}
	return map;
}

export function buildMonthSummaries(holidays: Holiday[]): MonthSummary[] {
	const grouped = groupHolidaysByMonth(holidays);
	return Array.from({ length: 12 }, (_, month) => ({
		month,
		label: getMonthLabel(month),
		holidays: grouped.get(month)?.sort((a, b) => a.date.localeCompare(b.date)) ?? [],
	}));
}

const toMondayIndex = (day: number) => (day + 6) % 7;

export function buildMonthCalendar(year: number, month: number, holidays: Holiday[]): MonthCalendar {
	const monthLabel = getMonthLabel(month);
	const firstDay = new Date(year, month, 1);
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const offset = toMondayIndex(firstDay.getDay());
	const todayISO = new Date().toISOString().slice(0, 10);

	const cells: CalendarCell[] = [];

	// Leading empty cells
	for (let i = 0; i < offset; i += 1) {
		const date = new Date(year, month, i - offset + 1);
		cells.push({
			date: date.toISOString().slice(0, 10),
			day: date.getDate(),
			isCurrentMonth: false,
			isToday: false,
		});
	}

	for (let day = 1; day <= daysInMonth; day += 1) {
		const date = new Date(year, month, day);
		const iso = date.toISOString().slice(0, 10);
		const holiday = holidays.find((item) => item.date === iso);
		cells.push({
			date: iso,
			day,
			isCurrentMonth: true,
			isToday: iso === todayISO,
			holiday,
		});
	}

	// Trailing cells to complete the last week
	while (cells.length % 7 !== 0) {
		const last = cells[cells.length - 1];
		const date = new Date(last.date);
		date.setDate(date.getDate() + 1);
		cells.push({
			date: date.toISOString().slice(0, 10),
			day: date.getDate(),
			isCurrentMonth: false,
			isToday: false,
		});
	}

	const weeks: CalendarCell[][] = [];
	for (let i = 0; i < cells.length; i += 7) {
		weeks.push(cells.slice(i, i + 7));
	}

	return {
		month,
		label: monthLabel,
		weeks,
		holidays,
	};
}
