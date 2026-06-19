import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScanLine, CheckCircle2, XCircle } from "lucide-react";

// VIN decoder — ISO 3779/3780
// Note: офлайн декодер базових полів. Повну інформацію (модель, комплектація) надає NHTSA vPIC API.

const WMI_REGIONS: Array<{ prefix: string; region: string; country?: string }> = [
  { prefix: "1", region: "Північна Америка", country: "США" },
  { prefix: "2", region: "Північна Америка", country: "Канада" },
  { prefix: "3", region: "Північна Америка", country: "Мексика" },
  { prefix: "4", region: "Північна Америка", country: "США" },
  { prefix: "5", region: "Північна Америка", country: "США" },
  { prefix: "9", region: "Південна Америка", country: "Бразилія" },
  { prefix: "J", region: "Азія", country: "Японія" },
  { prefix: "K", region: "Азія", country: "Південна Корея" },
  { prefix: "L", region: "Азія", country: "Китай" },
  { prefix: "M", region: "Азія", country: "Індія / Індонезія" },
  { prefix: "S", region: "Європа", country: "Велика Британія" },
  { prefix: "T", region: "Європа", country: "Чехія / Угорщина" },
  { prefix: "V", region: "Європа", country: "Франція / Іспанія" },
  { prefix: "W", region: "Європа", country: "Німеччина" },
  { prefix: "X", region: "Європа", country: "Росія / СНД" },
  { prefix: "Y", region: "Європа", country: "Швеція / Фінляндія" },
  { prefix: "Z", region: "Європа", country: "Італія" },
];

// Manufacturer ID (перші 3 символи — WMI)
const WMI_MAKERS: Record<string, string> = {
  WAU: "Audi",
  WBA: "BMW",
  WBS: "BMW M",
  WDB: "Mercedes-Benz",
  WDD: "Mercedes-Benz",
  WMW: "MINI",
  WP0: "Porsche",
  WVW: "Volkswagen",
  WV1: "Volkswagen Commercial",
  JHM: "Honda Japan",
  JTD: "Toyota",
  JN1: "Nissan",
  JM1: "Mazda",
  KMH: "Hyundai",
  KNA: "Kia",
  SAL: "Land Rover",
  SAJ: "Jaguar",
  VF1: "Renault",
  VF3: "Peugeot",
  VF7: "Citroën",
  VSS: "Seat",
  ZFA: "Fiat",
  ZAR: "Alfa Romeo",
  "1G1": "Chevrolet",
  "1FT": "Ford Truck",
  "1FA": "Ford",
  "5YJ": "Tesla",
  "WF0": "Ford Europe",
};

// Model year (10-th char) — спрощена таблиця 2010–2030
const YEAR_CODES: Record<string, number> = {
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017,
  J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025,
  T: 2026, V: 2027, W: 2028, X: 2029, Y: 2030,
};

// VIN check digit (поз. 9, тільки для NA) — ISO 3779 weighted sum
const TRANSLITERATION: Record<string, number> = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

const calcCheckDigit = (vin: string): string | null => {
  if (vin.length !== 17) return null;
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const ch = vin[i].toUpperCase();
    if (!(ch in TRANSLITERATION)) return null;
    sum += TRANSLITERATION[ch] * WEIGHTS[i];
  }
  const rem = sum % 11;
  return rem === 10 ? "X" : String(rem);
};

interface DecodedVin {
  valid: boolean;
  errors: string[];
  region?: string;
  country?: string;
  maker?: string;
  modelYear?: number;
  serial?: string;
  checkDigit?: string;
  checkDigitValid?: boolean;
}

const decodeVin = (raw: string): DecodedVin => {
  const vin = raw.trim().toUpperCase().replace(/[IOQ]/g, ""); // I/O/Q заборонені
  const errors: string[] = [];

  if (vin.length !== 17) {
    errors.push(`VIN має містити рівно 17 символів (зараз ${vin.length}). Літери I, O, Q заборонені.`);
    return { valid: false, errors };
  }
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    errors.push("VIN містить недопустимі символи.");
    return { valid: false, errors };
  }

  const wmi = vin.slice(0, 3);
  const yearChar = vin[9];
  const region = WMI_REGIONS.find((r) => vin.startsWith(r.prefix));
  const maker = WMI_MAKERS[wmi];
  const modelYear = YEAR_CODES[yearChar];

  const expected = calcCheckDigit(vin);
  const checkDigitValid = expected ? vin[8] === expected : false;

  if (!region) errors.push("Невідомий регіон виробництва (перший символ).");
  if (!maker) errors.push("Виробник не у вбудованій базі (повний декод через офіційну базу).");
  if (!modelYear) errors.push("Не вдалося визначити модельний рік.");
  if (!checkDigitValid && region?.region === "Північна Америка") {
    errors.push(`Контрольна цифра не збігається (очікувалось ${expected}, у VIN ${vin[8]}). Можлива помилка введення.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    region: region?.region,
    country: region?.country,
    maker,
    modelYear,
    serial: vin.slice(11),
    checkDigit: vin[8],
    checkDigitValid,
  };
};

export const VinDecoderCalc = () => {
  const [vin, setVin] = useState("WBA8E5C50KE883456");
  const result = useMemo(() => decodeVin(vin), [vin]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">VIN-код (17 символів)</Label>
            <Input
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              placeholder="WBA8E5C50KE883456"
              className="font-mono uppercase tracking-wider"
              maxLength={17}
            />
            <p className="text-[11px] text-muted-foreground">
              VIN зазвичай вибитий на лонжероні моторного відсіку, під лобовим склом, у техпаспорті.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-2 border-t-primary">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <ScanLine className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Декодований VIN</span>
            {result.valid ? (
              <Badge variant="default" className="ml-auto"><CheckCircle2 className="h-3 w-3 mr-1" />Валідний</Badge>
            ) : (
              <Badge variant="destructive" className="ml-auto"><XCircle className="h-3 w-3 mr-1" />Помилки</Badge>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Field label="Виробник" value={result.maker ?? "—"} />
            <Field label="Регіон" value={result.region ?? "—"} />
            <Field label="Країна" value={result.country ?? "—"} />
            <Field label="Модельний рік" value={result.modelYear ? String(result.modelYear) : "—"} />
            <Field label="Серійний номер" value={result.serial ?? "—"} />
            <Field label="Контр. цифра" value={`${result.checkDigit ?? "—"} ${result.checkDigitValid === false ? "(не співпадає)" : ""}`} />
          </div>

          {result.errors.length > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded p-2.5 space-y-1">
              {result.errors.map((e, i) => (
                <p key={i} className="text-[11px] text-destructive">⚠ {e}</p>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Для повної інформації (модель, комплектація, двигун) використовуйте офіційні бази:{" "}
            <a href="https://vpic.nhtsa.dot.gov/decoder/" target="_blank" rel="noopener noreferrer" className="text-primary underline">NHTSA vPIC</a>,{" "}
            <a href="https://hsc.gov.ua/" target="_blank" rel="noopener noreferrer" className="text-primary underline">ГСЦ МВС</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between bg-muted/40 rounded px-2.5 py-1.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-mono text-xs font-semibold text-foreground">{value}</span>
  </div>
);
