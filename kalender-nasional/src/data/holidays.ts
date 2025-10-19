export type HolidayType = 'national' | 'collective';

export interface Holiday {
	date: string; // ISO 8601 (YYYY-MM-DD)
	name: string;
	description?: string;
	type?: HolidayType;
}

export const HOLIDAYS: Record<number, Holiday[]> = {
	2024: [
		{ date: '2024-01-01', name: 'Tahun Baru 2024 Masehi', type: 'national' },
		{
			date: '2024-02-08',
			name: "Isra Mi'raj Nabi Muhammad SAW",
			type: 'national',
		},
		{
			date: '2024-02-10',
			name: 'Tahun Baru Imlek 2575 Kongzili',
			type: 'national',
		},
		{ date: '2024-03-11', name: 'Hari Suci Nyepi 1946 Saka', type: 'national' },
		{ date: '2024-03-29', name: 'Wafat Isa Almasih', type: 'national' },
		{ date: '2024-04-10', name: 'Hari Raya Idulfitri 1445 Hijriah', type: 'national' },
		{ date: '2024-04-11', name: 'Hari Raya Idulfitri 1445 Hijriah (Hari ke-2)', type: 'national' },
		{ date: '2024-05-01', name: 'Hari Buruh Internasional', type: 'national' },
		{ date: '2024-05-09', name: 'Kenaikan Isa Almasih', type: 'national' },
		{ date: '2024-05-23', name: 'Hari Raya Waisak 2568 BE', type: 'national' },
		{ date: '2024-06-01', name: 'Hari Lahir Pancasila', type: 'national' },
		{ date: '2024-06-17', name: 'Hari Raya Iduladha 1445 Hijriah', type: 'national' },
		{ date: '2024-07-07', name: 'Tahun Baru Islam 1446 Hijriah', type: 'national' },
		{ date: '2024-08-17', name: 'Hari Kemerdekaan Republik Indonesia', type: 'national' },
		{ date: '2024-09-16', name: "Maulid Nabi Muhammad SAW", type: 'national' },
		{ date: '2024-12-25', name: 'Hari Raya Natal', type: 'national' },
	],
	// TODO: Lengkapi data ketika jadwal resmi 2025 dirilis.
	2025: [
		{ date: '2025-01-01', name: 'Tahun Baru 2025 Masehi', type: 'national' },
	],
};

export const AVAILABLE_YEARS = Object.keys(HOLIDAYS)
	.map(Number)
	.sort((a, b) => a - b);
