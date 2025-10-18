import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  ViewChild
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

type TermUnit = 'years' | 'months';
type Method = 'flat' | 'effective';
type ThemeMode = 'light' | 'dark';
type CurrencyField = 'amount';

interface PaymentEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  principalRatio: number;
  interestRatio: number;
  isIntroDiscount: boolean;
}

interface LoanSummary {
  method: Method;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: PaymentEntry[];
}

interface CalculationState {
  principal: number;
  annualRate: number;
  baseAnnualRate: number;
  introDiscountRate: number;
  introDiscountDuration: number;
  provisionRate: number;
  netDisbursement: number;
  months: number;
  flat: LoanSummary;
  effective: LoanSummary;
}

interface FormModel {
  amount: number;
  rate: number;
  term: number;
  termUnit: TermUnit;
  includeIntroDiscount: boolean;
  introDiscountRate: number;
  introDiscountDuration: number;
  includeProvision: boolean;
  provisionRate: number;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly themeStorageKey = 'webtools-theme';
  private readonly currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });
  private readonly decimalFormatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  protected readonly form = this.fb.nonNullable.group({
    amount: this.fb.nonNullable.control<number>(150_000_000, {
      validators: [Validators.required, Validators.min(1)]
    }),
    rate: this.fb.nonNullable.control<number>(10, {
      validators: [Validators.required, Validators.min(0)]
    }),
    term: this.fb.nonNullable.control<number>(5, {
      validators: [Validators.required, Validators.min(0.5)]
    }),
    termUnit: this.fb.nonNullable.control<TermUnit>('years'),
    includeIntroDiscount: this.fb.nonNullable.control(false),
    introDiscountRate: this.fb.nonNullable.control<number>(0, {
      validators: [Validators.min(0)]
    }),
    introDiscountDuration: this.fb.nonNullable.control<number>(0, {
      validators: [Validators.min(0)]
    }),
    includeProvision: this.fb.nonNullable.control(false),
    provisionRate: this.fb.nonNullable.control<number>(0, {
      validators: [Validators.min(0)]
    })
  });

  protected readonly timelineMethod = signal<Method>('effective');
  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue()
  });
  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status
  });
  private readonly amountValue = toSignal(this.form.controls.amount.valueChanges, {
    initialValue: this.form.controls.amount.value ?? 0
  });
  private readonly includeIntroDiscountSignal = toSignal(
    this.form.controls.includeIntroDiscount.valueChanges,
    { initialValue: this.form.controls.includeIntroDiscount.value }
  );
  private readonly includeProvisionSignal = toSignal(
    this.form.controls.includeProvision.valueChanges,
    { initialValue: this.form.controls.includeProvision.value }
  );

  protected readonly theme = signal<ThemeMode>('dark');
  private readonly hasManualThemeSelection = signal(false);
  @ViewChild('amountField') private amountField?: ElementRef<HTMLInputElement>;
  private syncingCurrencyField: CurrencyField | null = null;
  protected readonly methodMeta: Record<Method, { label: string; chip: string }> = {
    flat: { label: 'Metode Flat', chip: 'Flat' },
    effective: { label: 'Metode Efektif (Anuitas)', chip: 'Efektif (Anuitas)' }
  };
  protected readonly currentYear = new Date().getFullYear();

  protected readonly themeButtonText = computed(() =>
    this.theme() === 'dark' ? 'Mode terang' : 'Mode gelap'
  );
  protected readonly themeButtonAriaLabel = computed(() =>
    this.theme() === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'
  );
  protected readonly themeIcon = computed(() => (this.theme() === 'dark' ? '☀️' : '🌙'));

  private readonly themeSync = effect(() => {
    const mode = this.theme();
    if (!this.isBrowser) {
      return;
    }
    const root = this.document.documentElement;
    root.dataset['theme'] = mode;
    root.style.colorScheme = mode;

    try {
      if (this.hasManualThemeSelection()) {
        localStorage.setItem(this.themeStorageKey, mode);
      } else {
        localStorage.removeItem(this.themeStorageKey);
      }
    } catch {}
  });

  private readonly amountDisplayEffect = effect(() => {
    if (!this.isBrowser) {
      return;
    }
    const value = this.amountValue();
    this.syncCurrencyInputDisplay('amount', value ?? 0);
  });

  private readonly introDiscountToggleEffect = effect(() => {
    const enabled = this.includeIntroDiscountSignal();
    const rateControl = this.form.controls.introDiscountRate;
    const durationControl = this.form.controls.introDiscountDuration;
    if (enabled) {
      if (rateControl.disabled) {
        rateControl.enable({ emitEvent: false });
      }
      if (durationControl.disabled) {
        durationControl.enable({ emitEvent: false });
      }
    } else {
      if (rateControl.enabled) {
        rateControl.disable({ emitEvent: false });
      }
      if (durationControl.enabled) {
        durationControl.disable({ emitEvent: false });
      }
      rateControl.setValue(0, { emitEvent: false });
      durationControl.setValue(0, { emitEvent: false });
    }
  });

  private readonly provisionToggleEffect = effect(() => {
    const enabled = this.includeProvisionSignal();
    const control = this.form.controls.provisionRate;
    if (enabled) {
      if (control.disabled) {
        control.enable({ emitEvent: false });
      }
    } else {
      if (control.enabled) {
        control.disable({ emitEvent: false });
      }
      control.setValue(0, { emitEvent: false });
    }
  });

  constructor() {
    if (!this.form.controls.includeIntroDiscount.value) {
      this.form.controls.introDiscountRate.disable({ emitEvent: false });
      this.form.controls.introDiscountDuration.disable({ emitEvent: false });
    }
    if (!this.form.controls.includeProvision.value) {
      this.form.controls.provisionRate.disable({ emitEvent: false });
    }

    if (!this.isBrowser) {
      return;
    }

    let storedPreference: ThemeMode | null = null;
    try {
      const persisted = localStorage.getItem(this.themeStorageKey);
      if (persisted === 'light' || persisted === 'dark') {
        storedPreference = persisted;
      }
    } catch {}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const initialMode: ThemeMode = storedPreference ?? (mediaQuery.matches ? 'dark' : 'light');

    this.theme.set(initialMode);
    this.hasManualThemeSelection.set(storedPreference !== null);

    const systemListener = (event: MediaQueryListEvent) => {
      if (this.hasManualThemeSelection()) {
        return;
      }
      this.theme.set(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', systemListener);
    this.destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', systemListener));
  }

  protected readonly calculation = computed<CalculationState | null>(() => {
    if (this.formStatus() !== 'VALID') {
      return null;
    }

    // ensure computed reacts to form value changes
    this.formValue();
    const raw = this.form.getRawValue() as FormModel;

    const baseAmount = raw.amount ?? 0;
    const baseRate = raw.rate ?? 0;
    const term = raw.term ?? 0;
    const termUnit: TermUnit = raw.termUnit ?? 'months';
    const includeIntro = raw.includeIntroDiscount ?? false;
    const includeProvision = raw.includeProvision ?? false;
    const introRate = includeIntro ? raw.introDiscountRate ?? 0 : 0;
    const introDuration = includeIntro ? raw.introDiscountDuration ?? 0 : 0;
    const provisionRate = includeProvision ? raw.provisionRate ?? 0 : 0;
    const provisionAmount = includeProvision ? baseAmount * provisionRate / 100 : 0;

    const principal = Math.max(baseAmount, 0);
    const annualRate = Math.max(baseRate, 0);
    const monthsFromForm = termUnit === 'years' ? term * 12 : term;
    const months = Math.round(monthsFromForm);

    if (!Number.isFinite(principal) || !Number.isFinite(annualRate) || !Number.isFinite(monthsFromForm)) {
      return null;
    }

    if (principal <= 0 || months <= 0) {
      return null;
    }

    const flat = this.computeFlat(principal, baseRate, introRate, introDuration, months);
    const effective = this.computeEffective(principal, baseRate, introRate, introDuration, months);

    return {
      principal,
      annualRate,
      baseAnnualRate: baseRate,
      introDiscountRate: introRate,
      introDiscountDuration: introDuration,
      provisionRate,
      netDisbursement: Math.max(baseAmount - provisionAmount, 0),
      months,
      flat,
      effective
    };
  });

  protected readonly viewedSchedule = computed<PaymentEntry[]>(() => {
    const calc = this.calculation();
    if (!calc) {
      return [];
    }
    return this.timelineMethod() === 'flat' ? calc.flat.schedule : calc.effective.schedule;
  });

  protected readonly interestDelta = computed(() => {
    const calc = this.calculation();
    if (!calc) {
      return null;
    }
    return calc.flat.totalInterest - calc.effective.totalInterest;
  });

  protected readonly selectedSummary = computed(() => {
    const calc = this.calculation();
    if (!calc) {
      return null;
    }
    const method = this.timelineMethod();
    const summary = method === 'flat' ? calc.flat : calc.effective;
    return { method, summary };
  });

  protected readonly adjustmentInfo = computed(() => {
    this.formValue();
    const raw = this.form.getRawValue() as FormModel;
    const base = raw.amount ?? 0;
    const provisionEnabled = raw.includeProvision ?? false;
    const provisionRate = raw.provisionRate ?? 0;
    const provisionAmount = provisionEnabled ? base * provisionRate / 100 : 0;
    return {
      includeIntroDiscount: raw.includeIntroDiscount ?? false,
      introDiscountRate: raw.introDiscountRate ?? 0,
      introDiscountDuration: raw.introDiscountDuration ?? 0,
      includeProvision: provisionEnabled,
      provisionRate,
      baseAmount: base,
      netDisbursement: Math.max(base - provisionAmount, 0)
    };
  });

  protected setTimelineMethod(method: Method): void {
    this.timelineMethod.set(method);
  }

  protected toggleTheme(): void {
    const next: ThemeMode = this.theme() === 'dark' ? 'light' : 'dark';
    this.hasManualThemeSelection.set(true);
    this.theme.set(next);
  }

  protected handleCurrencyInput(field: CurrencyField, event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const numeric = this.parseCurrencyInput(event.target.value);
    const control = this.getCurrencyControl(field);
    const current = control.value ?? 0;
    if (numeric !== current) {
      control.setValue(numeric);
    }
    this.syncingCurrencyField = field;
    event.target.value = numeric > 0 ? this.formatCurrency(numeric) : '';
    event.target.setSelectionRange(event.target.value.length, event.target.value.length);
    queueMicrotask(() => {
      this.syncingCurrencyField = null;
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.syncCurrencyInputDisplay('amount', this.form.controls.amount.value ?? 0, true);
  }

  async exportPdf(): Promise<void> {
    const calc = this.calculation();
    if (!calc || !this.isBrowser) {
      return;
    }

    const [{ default: jsPDF }, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    const autoTable = autoTableModule.default;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    doc.setFontSize(16);
    doc.text('Ringkasan Pinjaman', 40, 48);
    doc.setFontSize(11);

    autoTable(doc, {
      startY: 60,
      theme: 'grid',
      head: [['Parameter', 'Nilai']],
      body: this.buildSummaryRows(calc),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [20, 20, 22], textColor: 245 }
    });

    let currentY = (doc as any).lastAutoTable?.finalY ?? 80;

    const activeMethod = this.timelineMethod();
    const timelineLabel = activeMethod === 'flat' ? 'Flat' : 'Efektif';
    const schedule = this.viewedSchedule();

    doc.setFontSize(13);
    doc.text(`Timeline (${timelineLabel})`, 40, currentY + 24);
    doc.setFontSize(11);

    autoTable(doc, {
      startY: currentY + 32,
      theme: 'grid',
      head: [['Bulan', 'Cicilan', 'Pokok', 'Bunga', 'Sisa Pokok']],
      body: schedule.map((entry) => [
        entry.month,
        this.formatCurrency(entry.payment),
        this.formatCurrency(entry.principal),
        this.formatCurrency(entry.interest),
        this.formatCurrency(entry.balance)
      ]),
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [20, 20, 22], textColor: 245 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });

    doc.save(`kalkulator-pinjaman-${calc.months}bln.pdf`);
  }

  async exportExcel(): Promise<void> {
    const calc = this.calculation();
    if (!calc || !this.isBrowser) {
      return;
    }

    const summaryData = this.buildSummaryRows(calc, true);

    const activeMethod = this.timelineMethod();
    const timelineLabel = activeMethod === 'flat' ? 'Flat' : 'Efektif';
    const schedule = this.viewedSchedule();

    const timelineData = [
      [`Timeline (${timelineLabel})`],
      ['Bulan', 'Cicilan', 'Pokok', 'Bunga', 'Sisa Pokok'],
      ...schedule.map((entry) => [
        entry.month,
        this.formatCurrency(entry.payment),
        this.formatCurrency(entry.principal),
        this.formatCurrency(entry.interest),
        this.formatCurrency(entry.balance)
      ])
    ];

    const { utils, writeFileXLSX } = await import('xlsx');

    const workbook = utils.book_new();
    const summarySheet = utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 24 }, { wch: 28 }, { wch: 24 }, { wch: 24 }];

    const timelineSheet = utils.aoa_to_sheet(timelineData);
    timelineSheet['!cols'] = [
      { wch: 12 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 26 }
    ];

    utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
    utils.book_append_sheet(workbook, timelineSheet, 'Timeline');

    writeFileXLSX(workbook, `kalkulator-pinjaman-${calc.months}bln.xlsx`);
  }

  private formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  private formatDecimal(value: number): string {
    return this.decimalFormatter.format(value);
  }

  private computeFlat(
    principal: number,
    baseRate: number,
    introRate: number,
    introDuration: number,
    months: number
  ): LoanSummary {
    const principalInstallment = principal / months;
    let remainingPrincipal = principal;
    const schedule: PaymentEntry[] = [];
    let totalInterestPaid = 0;

    for (let month = 1; month <= months; month++) {
      const isIntroDiscount = month <= introDuration;
      const adjustedRate = Math.max(baseRate - (isIntroDiscount ? introRate : 0), 0);
      const monthlyRate = adjustedRate / 100 / 12;
      const interestPortion = this.round(principal * monthlyRate);

      let principalPortion = principalInstallment;
      if (month === months) {
        principalPortion = remainingPrincipal;
      }

      const payment = interestPortion + principalPortion;
      remainingPrincipal -= principalPortion;
      if (remainingPrincipal < 1e-6) {
        remainingPrincipal = 0;
      }

      totalInterestPaid += interestPortion;

      const roundedPayment = this.round(payment);
      const roundedPrincipal = this.round(principalPortion);
      const roundedBalance = this.round(Math.max(remainingPrincipal, 0));
      const principalRatio = roundedPayment === 0 ? 0 : roundedPrincipal / roundedPayment;
      const interestRatio = roundedPayment === 0 ? 0 : interestPortion / roundedPayment;

      schedule.push({
        month,
        payment: roundedPayment,
        principal: roundedPrincipal,
        interest: interestPortion,
        balance: roundedBalance,
        principalRatio,
        interestRatio,
        isIntroDiscount
      });
    }

    const totalPayment = schedule.reduce((sum, entry) => sum + entry.payment, 0);

    return {
      method: 'flat',
      monthlyPayment: schedule[0]?.payment ?? 0,
      totalInterest: this.round(totalInterestPaid),
      totalPayment: this.round(totalPayment),
      schedule
    };
  }

  private computeEffective(
    principal: number,
    baseRate: number,
    introRate: number,
    introDuration: number,
    months: number
  ): LoanSummary {
    let balance = principal;
    const schedule: PaymentEntry[] = [];
    let interestAccumulator = 0;

    for (let month = 1; month <= months; month++) {
      const isIntroDiscount = month <= introDuration;
      const adjustedRate = Math.max(baseRate - (isIntroDiscount ? introRate : 0), 0);
      const monthlyRate = adjustedRate / 100 / 12;
      const remainingMonths = months - month + 1;

      const scheduledPayment =
        monthlyRate === 0
          ? balance / remainingMonths
          : balance * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -remainingMonths)));

      const interestPortion = monthlyRate === 0 ? 0 : balance * monthlyRate;
      let principalPortion = scheduledPayment - interestPortion;

      if (month === months) {
        principalPortion = balance;
      }

      balance -= principalPortion;
      if (balance < 1e-6) {
        balance = 0;
      }

      interestAccumulator += interestPortion;

      const actualPayment = principalPortion + interestPortion;
      const roundedPayment = this.round(actualPayment);
      const roundedInterest = this.round(interestPortion);
      const roundedPrincipal = this.round(principalPortion);
      const roundedBalance = this.round(Math.max(balance, 0));
      const principalRatio = roundedPayment === 0 ? 0 : roundedPrincipal / roundedPayment;
      const interestRatio = roundedPayment === 0 ? 0 : roundedInterest / roundedPayment;

      schedule.push({
        month,
        payment: roundedPayment,
        principal: roundedPrincipal,
        interest: roundedInterest,
        balance: roundedBalance,
        principalRatio,
        interestRatio,
        isIntroDiscount
      });
    }

    const totalPayment = schedule.reduce((sum, entry) => sum + entry.payment, 0);

    return {
      method: 'effective',
      monthlyPayment: schedule[0]?.payment ?? 0,
      totalInterest: this.round(interestAccumulator),
      totalPayment: this.round(totalPayment),
      schedule
    };
  }

  private getCurrencyControl(field: CurrencyField) {
    switch (field) {
      case 'amount':
        return this.form.controls.amount;
    }
  }

  private getCurrencyFieldRef(field: CurrencyField): ElementRef<HTMLInputElement> | undefined {
    switch (field) {
      case 'amount':
        return this.amountField;
    }
  }

  private syncCurrencyInputDisplay(field: CurrencyField, amount: number | null, force = false): void {
    if (!this.isBrowser) {
      return;
    }
    if (!force && this.syncingCurrencyField === field) {
      return;
    }
    const ref = this.getCurrencyFieldRef(field);
    if (!ref) {
      return;
    }
    const input = ref.nativeElement;
    if (!force && document.activeElement === input) {
      return;
    }
    input.value = amount && amount > 0 ? this.formatCurrency(amount) : '';
  }

  private parseCurrencyInput(raw: string): number {
    const digits = raw.replace(/\D/g, '');
    return digits ? Number.parseInt(digits, 10) : 0;
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private buildSummaryRows(calc: CalculationState, includeHeader = false): any[] {
    const rows: any[] = [
      ['Pokok pinjaman', this.formatCurrency(calc.principal)],
      ['Dana dicairkan (setelah biaya)', this.formatCurrency(calc.netDisbursement)],
      ['Tenor', `${calc.months} bulan`],
      ['Suku bunga floating', `${this.formatDecimal(calc.baseAnnualRate)}% p.a.`]
    ];

    if (calc.provisionRate > 0) {
      rows.push(['Biaya provisi (awal)', `${this.formatDecimal(calc.provisionRate)}% dari pinjaman`]);
    }

    if (calc.introDiscountRate > 0 && calc.introDiscountDuration > 0) {
      const discountedRate = Math.max(calc.baseAnnualRate - calc.introDiscountRate, 0);
      rows.push([
        'Diskon bunga awal',
        `${this.formatDecimal(calc.introDiscountRate)}% p.a. · ${calc.introDiscountDuration} bulan`
      ]);
      rows.push(['Suku bunga selama diskon', `${this.formatDecimal(discountedRate)}% p.a.`]);
    }

    rows.push(['', '']);

    const method = this.timelineMethod();
    const summary = method === 'flat' ? calc.flat : calc.effective;
    rows.push(['Metode yang dipilih', method === 'flat' ? 'Flat' : 'Efektif (Anuitas)']);
    rows.push(['Cicilan bulanan', this.formatCurrency(summary.monthlyPayment)]);
    rows.push(['Total bunga', this.formatCurrency(summary.totalInterest)]);
    rows.push(['Total bayar', this.formatCurrency(summary.totalPayment)]);

    if (includeHeader) {
      return [['Parameter', 'Nilai'], ...rows];
    }

    return rows;
  }

  protected displayCurrency(value: number): string {
    return this.formatCurrency(value);
  }
}
