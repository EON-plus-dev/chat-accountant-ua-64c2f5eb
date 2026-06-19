/**
 * PartyRoleSelector - asks user which party role they represent in the document
 * Analyzes document text to find role pairs (Виконавець/Замовник, Продавець/Покупець, etc.)
 */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserCheck, ArrowRight } from "lucide-react";
import { PARTY_CONFIGS } from "@/config/partyAttributesLibrary";

interface PartyRoleSelectorProps {
  documentText: string;
  onSelect: (role: "cabinet" | "contractor") => void;
}

// Role pairs that appear in documents
const ROLE_PAIRS: Array<{ cabinet: string; contractor: string }> = [
  { cabinet: "Виконавець", contractor: "Замовник" },
  { cabinet: "Постачальник", contractor: "Покупець" },
  { cabinet: "Продавець", contractor: "Покупець" },
  { cabinet: "Орендодавець", contractor: "Орендар" },
  { cabinet: "Підрядник", contractor: "Замовник" },
];

interface DetectedRoles {
  cabinetLabel: string;
  contractorLabel: string;
}

const detectRolesFromText = (text: string): DetectedRoles => {
  const lowerText = text.toLowerCase();

  for (const pair of ROLE_PAIRS) {
    if (
      lowerText.includes(pair.cabinet.toLowerCase()) &&
      lowerText.includes(pair.contractor.toLowerCase())
    ) {
      return { cabinetLabel: pair.cabinet, contractorLabel: pair.contractor };
    }
  }

  // Fallback: check cabinet synonyms vs contractor synonyms
  const cabinetConfig = PARTY_CONFIGS.find((p) => p.id === "cabinet");
  const contractorConfig = PARTY_CONFIGS.find((p) => p.id === "contractor");

  let cabinetLabel = "Сторона 1";
  let contractorLabel = "Сторона 2";

  if (cabinetConfig) {
    for (const syn of cabinetConfig.synonyms) {
      if (lowerText.includes(syn.toLowerCase())) {
        cabinetLabel = syn.charAt(0).toUpperCase() + syn.slice(1);
        break;
      }
    }
  }
  if (contractorConfig) {
    for (const syn of contractorConfig.synonyms) {
      if (lowerText.includes(syn.toLowerCase())) {
        contractorLabel = syn.charAt(0).toUpperCase() + syn.slice(1);
        break;
      }
    }
  }

  return { cabinetLabel, contractorLabel };
};

export const PartyRoleSelector = ({
  documentText,
  onSelect,
}: PartyRoleSelectorProps) => {
  const roles = useMemo(() => detectRolesFromText(documentText), [documentText]);
  const [selected, setSelected] = useState<"cabinet" | "contractor">("cabinet");

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCheck className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Ваша роль у цьому документі</h3>
          <p className="text-sm text-muted-foreground">
            Оберіть, якою стороною ви виступаєте. Дані кабінету заповнять обрану роль.
          </p>
        </div>

        <RadioGroup
          value={selected}
          onValueChange={(v) => setSelected(v as "cabinet" | "contractor")}
          className="space-y-3"
        >
          <Label
            htmlFor="role-cabinet"
            className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
          >
            <RadioGroupItem value="cabinet" id="role-cabinet" />
            <div className="flex-1">
              <div className="font-medium">{roles.cabinetLabel}</div>
              <div className="text-xs text-muted-foreground">
                Ваші дані з кабінету
              </div>
            </div>
          </Label>

          <Label
            htmlFor="role-contractor"
            className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
          >
            <RadioGroupItem value="contractor" id="role-contractor" />
            <div className="flex-1">
              <div className="font-medium">{roles.contractorLabel}</div>
              <div className="text-xs text-muted-foreground">
                Ваші дані з кабінету
              </div>
            </div>
          </Label>
        </RadioGroup>

        <p className="text-xs text-muted-foreground text-center">
          Дані контрагента заповнять іншу сторону документа
        </p>

        <Button
          className="w-full"
          onClick={() => onSelect(selected)}
        >
          Продовжити
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
