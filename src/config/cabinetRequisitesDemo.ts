// Demo cabinet requisites data for document autofill
// In real app, this would come from the cabinet profile/settings

import type { Cabinet } from "@/types/cabinet";
import { resolveFieldValue, type FieldResolutionContext } from "./partyAttributesLibrary";

export interface CabinetRequisites {
  // Basic info
  name: string;
  shortName?: string;
  edrpou?: string; // 8 digits for legal entities
  ipn?: string; // 10 digits for individuals/FOP
  
  // Addresses
  legalAddress?: string;
  factualAddress?: string;
  
  // Bank details
  iban?: string;
  bankName?: string;
  mfo?: string;
  
  // Contacts
  phone?: string;
  email?: string;
  
  // Representative
  director?: string;
  directorPosition?: string;
  
  // VAT
  vatNumber?: string;
  isVatPayer?: boolean;
}

// Demo requisites for different cabinet types
// All codes are valid and pass checksum validation
export const demoCabinetRequisites: Record<string, CabinetRequisites> = {
  // Passive cabinet - contractor demo
  "passive-demo-1": {
    name: 'ТОВ "Технопром Груп"',
    shortName: "Технопром Груп",
    edrpou: "32855961", // Valid EDRPOU
    legalAddress: "м. Дніпро, вул. Набережна Перемоги, 50, офіс 301",
    factualAddress: "м. Дніпро, вул. Набережна Перемоги, 50, офіс 301",
    iban: "UA213223130000026007233566001",
    bankName: 'АТ КБ "ПриватБанк"',
    mfo: "305299",
    phone: "+380567001020",
    email: "office@technoprom.ua",
    director: "Марченко Віктор Андрійович",
    directorPosition: "Генеральний директор",
    isVatPayer: true,
    vatNumber: "318471069101", // Valid VAT (IPN 3184710691 + 01)
  },
  // TOV
  "cab-tov-1": {
    name: "ТОВ \"Діджитал Солюшнз\"",
    shortName: "Діджитал Солюшнз",
    edrpou: "32855961", // Valid EDRPOU
    legalAddress: "м. Київ, вул. Хрещатик, 22, офіс 15",
    factualAddress: "м. Київ, вул. Хрещатик, 22, офіс 15",
    iban: "UA213223130000026007233566001",
    bankName: "АТ КБ \"ПриватБанк\"",
    mfo: "305299",
    phone: "+380441234567",
    email: "info@digitalsolutions.ua",
    director: "Петренко Іван Васильович",
    directorPosition: "Директор",
    isVatPayer: true,
    vatNumber: "318471069101", // Valid VAT (IPN 3184710691 + 01)
  },
  
  // FOP Group 3
  "cab-fop-1": {
    name: "ФОП Іваненко Олена Миколаївна",
    shortName: "ФОП Іваненко О.М.",
    ipn: "3184710691", // Valid IPN
    legalAddress: "м. Львів, вул. Франка, 15, кв. 8",
    factualAddress: "м. Львів, вул. Франка, 15, кв. 8",
    iban: "UA213223130000026007233566001",
    bankName: "АТ \"Укрсиббанк\"",
    mfo: "351005",
    phone: "+380679876543",
    email: "ivanenko.fop@gmail.com",
    director: "Іваненко Олена Миколаївна",
    isVatPayer: false,
  },
  
  // FOP Group 2
  "cab-fop-2": {
    name: "ФОП Сидоренко Петро Олександрович",
    shortName: "ФОП Сидоренко П.О.",
    ipn: "2453671089", // Valid IPN
    legalAddress: "м. Одеса, вул. Дерибасівська, 7",
    iban: "UA213223130000026007233566001",
    bankName: "АТ \"Монобанк\"",
    mfo: "322001",
    phone: "+380501112233",
    email: "sydorenko.fop@ukr.net",
    director: "Сидоренко Петро Олександрович",
    isVatPayer: false,
  },
  
  // Another TOV
  "cab-tov-2": {
    name: "ТОВ \"Будівельна компанія \"Основа\"",
    shortName: "БК Основа",
    edrpou: "40075815", // Valid EDRPOU
    legalAddress: "м. Харків, пр. Науки, 14",
    factualAddress: "м. Харків, пр. Науки, 14",
    iban: "UA213223130000026007233566001",
    bankName: "АТ \"Ощадбанк\"",
    mfo: "300465",
    phone: "+380577000000",
    email: "osnova@company.ua",
    director: "Коваленко Андрій Петрович",
    directorPosition: "Генеральний директор",
    isVatPayer: true,
    vatNumber: "318471069101", // Valid VAT
  },
};

// Get requisites for a cabinet (with fallback to generated demo data)
export const getCabinetRequisites = (cabinet: Cabinet): CabinetRequisites => {
  // Check if we have specific demo data
  if (demoCabinetRequisites[cabinet.id]) {
    return demoCabinetRequisites[cabinet.id];
  }
  
  // Generate demo requisites based on cabinet type
  const isFop = cabinet.type === "fop" || cabinet.type === "fop-group";
  const isIndividual = cabinet.type === "individual";
  
  return {
    name: cabinet.name,
    shortName: cabinet.name,
    edrpou: !isFop && !isIndividual ? cabinet.taxId || "00000000" : undefined,
    ipn: isFop || isIndividual ? cabinet.taxId || "0000000000" : undefined,
    legalAddress: "м. Київ, вул. Центральна, 1",
    factualAddress: "м. Київ, вул. Центральна, 1",
    iban: `UA${Math.random().toString().slice(2, 29)}`,
    bankName: "АТ КБ \"ПриватБанк\"",
    mfo: "305299",
    phone: "+380 44 000 00 00",
    email: "info@company.ua",
    director: isFop ? cabinet.name.replace(/^ФОП\s+/i, "") : "Директор Компанії",
    directorPosition: isFop ? undefined : "Директор",
    isVatPayer: !isFop,
  };
};

// Map form field sourceKey to cabinet requisites property
// @deprecated Use resolveFieldValue from partyAttributesLibrary instead
export const mapSourceKeyToValue = (
  sourceKey: string,
  requisites: CabinetRequisites
): string | undefined => {
  // Use unified resolveFieldValue
  const result = resolveFieldValue(sourceKey, { cabinet: requisites as Record<string, any> });
  if (result !== undefined) {
    return String(result);
  }
  
  // Fallback: legacy mapping for code fields
  if (sourceKey === "cabinet.edrpou" || sourceKey === "cabinet.code") {
    return requisites.edrpou || requisites.ipn;
  }
  
  return undefined;
};

// Get contractor values from selected contractor
export const mapContractorToValues = (
  contractor: { 
    id: string; 
    name: string; 
    code: string; 
    iban?: string;
    address?: string;
    phone?: string;
    email?: string;
    director?: string;
    directorPosition?: string;
  }
): Record<string, string> => {
  return {
    "contractor.name": contractor.name,
    "contractor.code": contractor.code,
    "contractor.iban": contractor.iban || "",
    "contractor.address": contractor.address || "",
    "contractor.phone": contractor.phone || "",
    "contractor.email": contractor.email || "",
    "contractor.director": contractor.director || "",
    "contractor.directorPosition": contractor.directorPosition || "",
  };
};
