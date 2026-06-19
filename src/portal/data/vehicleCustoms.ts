// Vehicle customs clearance (розмитнення авто) — rates for passenger cars
// Legal basis: Митний кодекс, ЗУ № 466-IX, Постанова КМУ № 1146
// Snapshot April 2026

export interface VehicleCustomsRate {
  id: string;
  engineType: "petrol" | "diesel" | "electric" | "hybrid";
  ageYears: string;       // "новий", "до 5", "5+"
  engineVolumeCc: string; // "до 1000", "1001-1500", тощо
  dutyPercent: number;    // мито від митної вартості
  exciseEurPerCc: number; // акциз €/см³ (з коефіцієнтом віку)
  excisePerKw?: number;   // для електро — €/кВт·год
  ageCoefficient: number;
  vatPercent: number;     // ПДВ %
  notes?: string;
}

export const VEHICLE_CUSTOMS_AS_OF = "2026-04-01";

export const VEHICLE_CUSTOMS_RATES: VehicleCustomsRate[] = [
  // ───────── БЕНЗИН — НОВІ
  { id: "vc-p-new-1500", engineType: "petrol", ageYears: "новий (до 1 року)", engineVolumeCc: "до 1500", dutyPercent: 10, exciseEurPerCc: 0.102, ageCoefficient: 1, vatPercent: 20 },
  { id: "vc-p-new-2200", engineType: "petrol", ageYears: "новий (до 1 року)", engineVolumeCc: "1501–2200", dutyPercent: 10, exciseEurPerCc: 0.063, ageCoefficient: 1, vatPercent: 20 },
  { id: "vc-p-new-3000", engineType: "petrol", ageYears: "новий (до 1 року)", engineVolumeCc: "2201–3000", dutyPercent: 10, exciseEurPerCc: 0.267, ageCoefficient: 1, vatPercent: 20 },
  { id: "vc-p-new-3000plus", engineType: "petrol", ageYears: "новий (до 1 року)", engineVolumeCc: "понад 3000", dutyPercent: 10, exciseEurPerCc: 2.139, ageCoefficient: 1, vatPercent: 20 },
  // ───────── БЕНЗИН — 1–5 років
  { id: "vc-p-mid-1500", engineType: "petrol", ageYears: "1–5 років", engineVolumeCc: "до 1500", dutyPercent: 10, exciseEurPerCc: 0.102, ageCoefficient: 2.083, vatPercent: 20, notes: "Коефіцієнт зростає з кожним роком" },
  { id: "vc-p-mid-2200", engineType: "petrol", ageYears: "1–5 років", engineVolumeCc: "1501–2200", dutyPercent: 10, exciseEurPerCc: 0.063, ageCoefficient: 2.083, vatPercent: 20 },
  // ───────── БЕНЗИН — 5+ років
  { id: "vc-p-old-1500", engineType: "petrol", ageYears: "5+ років", engineVolumeCc: "до 1500", dutyPercent: 10, exciseEurPerCc: 0.102, ageCoefficient: 11.111, vatPercent: 20 },
  { id: "vc-p-old-2200", engineType: "petrol", ageYears: "5+ років", engineVolumeCc: "1501–2200", dutyPercent: 10, exciseEurPerCc: 0.063, ageCoefficient: 11.111, vatPercent: 20 },
  // ───────── ДИЗЕЛЬ
  { id: "vc-d-new-1500", engineType: "diesel", ageYears: "новий (до 1 року)", engineVolumeCc: "до 1500", dutyPercent: 10, exciseEurPerCc: 0.103, ageCoefficient: 1, vatPercent: 20 },
  { id: "vc-d-new-2500", engineType: "diesel", ageYears: "новий (до 1 року)", engineVolumeCc: "1501–2500", dutyPercent: 10, exciseEurPerCc: 0.327, ageCoefficient: 1, vatPercent: 20 },
  { id: "vc-d-mid-2500", engineType: "diesel", ageYears: "1–5 років", engineVolumeCc: "1501–2500", dutyPercent: 10, exciseEurPerCc: 0.327, ageCoefficient: 2.083, vatPercent: 20 },
  { id: "vc-d-old-2500", engineType: "diesel", ageYears: "5+ років", engineVolumeCc: "1501–2500", dutyPercent: 10, exciseEurPerCc: 0.327, ageCoefficient: 11.111, vatPercent: 20 },
  // ───────── ЕЛЕКТРО
  { id: "vc-ev", engineType: "electric", ageYears: "будь-який", engineVolumeCc: "—", dutyPercent: 0, exciseEurPerCc: 0, excisePerKw: 1, ageCoefficient: 1, vatPercent: 0, notes: "Звільнено від ПДВ і мита до 31.12.2028. Акциз 1 €/кВт·год потужності батареї." },
  // ───────── ГІБРИД
  { id: "vc-hyb", engineType: "hybrid", ageYears: "новий", engineVolumeCc: "до 2200", dutyPercent: 10, exciseEurPerCc: 0.063, ageCoefficient: 1, vatPercent: 20, notes: "Звичайний гібрид (HEV) — як звичайний бензин. Plug-in (PHEV) — ставки бензинових." },
];

export const VEHICLE_ENGINE_LABEL = {
  petrol: "Бензин",
  diesel: "Дизель",
  electric: "Електро",
  hybrid: "Гібрид",
};

// Vehicle registration fees (ТСЦ МВС, ПФУ збір, пенсійний)
export const VEHICLE_REG_FEES = {
  msvFee: 290,            // ₴ — послуга ТСЦ
  newPlatesFee: 940,      // ₴ — стандартні номерні знаки
  pensionFund3pct: 0.03,  // 3% від вартості (до 165 750 ₴ — 1 МЗП на 2026 базою)
  pensionFund4pct: 0.04,
  pensionFund5pct: 0.05,
  pensionThresholds: {
    tier1: 478500,   // менше — 3%
    tier2: 840600,   // 3% до 478500 / 4% від 478500 до 840600 / 5% понад
  },
};
