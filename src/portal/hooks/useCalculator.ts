import { useState, useCallback } from "react";
import { RATES_2025 } from "@/portal/data/rates2025";

export function calcEsv(group: string, income: number) {
  const min = Math.round(RATES_2025.minWage * RATES_2025.esv);
  if (group === "employee") return Math.round(income * RATES_2025.esv);
  return min;
}

export function calcSingleTax(group: string, income: number) {
  if (group === "1") return Math.round(RATES_2025.esnGroup1);
  if (group === "2") return Math.round(RATES_2025.esnGroup2);
  if (group === "3-no-vat") return Math.round(income * RATES_2025.esnGroup3NoVat);
  if (group === "3-vat") return Math.round(income * RATES_2025.esnGroup3Vat);
  return 0;
}

export function calcSalary(gross: number) {
  const pdfo = Math.round(gross * RATES_2025.pdfo);
  const vz = Math.round(gross * RATES_2025.warLevy);
  const net = gross - pdfo - vz;
  const esvEmployer = Math.round(gross * RATES_2025.esv);
  return { net, pdfo, vz, esvEmployer };
}

const fmt = (n: number) => n.toLocaleString("uk-UA") + " ₴";

export const useCalculator = (type: "esv" | "tax" | "salary") => {
  const [group, setGroup] = useState(type === "salary" ? "employee" : type === "tax" ? "2" : "1");
  const [income, setIncome] = useState(type === "salary" ? 20000 : type === "tax" ? 25000 : 100000);

  const handleIncomeChange = useCallback((val: string) => {
    const n = parseInt(val.replace(/\D/g, ""), 10);
    if (!isNaN(n)) setIncome(n);
    else if (val === "") setIncome(0);
  }, []);

  if (type === "esv") {
    const result = calcEsv(group, income);
    return {
      group, setGroup, income, handleIncomeChange, fmt,
      results: [
        { label: "ЄСВ", value: fmt(result) + "/міс" },
        { label: "Ставка", value: group === "employee" ? "22% від доходу" : "22% від мінімалки" },
      ],
    };
  }

  if (type === "tax") {
    const tax = calcSingleTax(group, income);
    const esv = calcEsv(group, income);
    const total = tax + esv;
    return {
      group, setGroup, income, handleIncomeChange, fmt,
      showIncome: group === "3-no-vat" || group === "3-vat",
      results: [
        { label: "ЄП", value: fmt(tax) + "/міс" },
        { label: "ЄСВ", value: fmt(esv) },
        { label: "Разом", value: fmt(total) + "/міс" },
      ],
    };
  }

  // salary
  const { net, pdfo, vz, esvEmployer } = calcSalary(income);
  return {
    group, setGroup, income, handleIncomeChange, fmt,
    results: [
      { label: "На руки", value: fmt(net) },
      { label: "ПДФО", value: fmt(pdfo) },
      { label: "ВЗ", value: fmt(vz) },
      { label: "ЄСВ роботодавця", value: fmt(esvEmployer) },
    ],
  };
};
