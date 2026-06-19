import { Link } from "react-router-dom";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const HINTS: Record<string, string> = {
  esv: "FINTODO розраховує це автоматично щомісяця і нагадує про сплату.",
  tax: "FINTODO нарахує ЄП автоматично і сформує платіжку.",
  salary: "FINTODO рахує зарплату, ЄСВ і ПДФО за вас.",
};

export const CalculatorProductHint = ({ type }: { type: string }) => (
  <p className="text-xs text-muted-foreground pt-2">
    {HINTS[type] || HINTS.esv}{" "}
    <Link to={CTA_CHECKOUT_URL} className="text-primary hover:underline font-medium">
      Спробувати →
    </Link>
  </p>
);
