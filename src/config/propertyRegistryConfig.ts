export type PropertyType = "apartment" | "house" | "land" | "vehicle" | "commercial" | "other";
export type AcquisitionMethod = "purchase" | "inheritance" | "gift" | "privatization" | "other";
export type PropertyStatus = "owned" | "rented" | "sold" | "donated" | "construction" | "other";
export type PropertyDataSource = "manual" | "document" | "registry";

// Relation to donor/testator — determines tax rate (ст. 174 ПКУ)
export type DonorRelation = "first_line" | "second_line" | "non_relative" | "non_resident";
export type OwnershipType = "sole" | "shared_partial" | "shared_joint";
export type TenantType = "individual" | "legal_entity";


export interface PropertyDocument {
  id: string;
  name: string;
  fileType: string;
  uploadedAt: string;
  aiClassification?: string;
  recognizedFields?: Record<string, string>;
}

export type EncumbranceType = "mortgage" | "arrest" | "prohibition" | "lease" | "other";
export type InsuranceType = "property" | "liability" | "title";

export interface PropertyEncumbrance {
  id: string;
  type: EncumbranceType;
  description: string;
  registeredAt: string;
  registeredBy: string;
  active: boolean;
  registryNumber?: string;
}

export interface PropertyInsurance {
  id: string;
  type: InsuranceType;
  company: string;
  policyNumber: string;
  validFrom: string;
  validTo: string;
  coverageAmount: number;
  active: boolean;
}

export const ENCUMBRANCE_TYPE_LABELS: Record<EncumbranceType, string> = {
  mortgage: "Іпотека",
  arrest: "Арешт",
  prohibition: "Заборона відчуження",
  lease: "Оренда",
  other: "Інше",
};

export const INSURANCE_TYPE_LABELS: Record<InsuranceType, string> = {
  property: "Майнове",
  liability: "Відповідальності",
  title: "Титульне",
};

export interface PropertyObject {
  id: string;
  type: PropertyType;
  description: string;
  address?: string;
  ownershipShare: number;
  ownershipType?: OwnershipType;
  coOwnerName?: string;
  acquisitionDate: string;
  acquisitionMethod: AcquisitionMethod;
  estimatedValue?: number;
  totalArea?: number;
  engineVolume?: number;
  manufactureYear?: number;
  // Rental fields (ст. 170.1 ПКУ)
  monthlyRent?: number;
  tenantType?: TenantType;
  rentalContractDate?: string;
  // Gift/inheritance relation (ст. 174 ПКУ)
  donorRelation?: DonorRelation;
  inheritanceRelation?: DonorRelation;
  // Foreign property (ст. 170.11 ПКУ)
  country?: string;
  foreignTaxPaid?: number;
  documents: PropertyDocument[];
  documentRefs?: string[];
  status: PropertyStatus;
  soldDate?: string;
  dataSource: PropertyDataSource;
  registryVerified?: boolean;
  registryLastSync?: string;
  registryNumber?: string;
  encumbrances?: PropertyEncumbrance[];
  insurances?: PropertyInsurance[];
}

export const DATA_SOURCE_LABELS: Record<PropertyDataSource, string> = {
  manual: "Ручний ввід",
  document: "З документа",
  registry: "Держреєстр",
};


export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Квартира",
  house: "Будинок",
  land: "Земельна ділянка",
  vehicle: "Транспортний засіб",
  commercial: "Комерційна нерухомість",
  other: "Інше",
};

export const ACQUISITION_METHOD_LABELS: Record<AcquisitionMethod, string> = {
  purchase: "Купівля",
  inheritance: "Спадщина",
  gift: "Дарування",
  privatization: "Приватизація",
  other: "Інше",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  owned: "У власності",
  rented: "В оренді",
  sold: "Продано",
  donated: "Подаровано",
  construction: "Незавершене будівництво",
  other: "Інше",
};

export const DONOR_RELATION_LABELS: Record<DonorRelation, string> = {
  first_line: "Родич 1-ї черги (0% ПДФО)",
  second_line: "Родич 2-ї черги (0% ПДФО)",
  non_relative: "Неродич (18% ПДФО + 5% ВЗ)",
  non_resident: "Нерезидент (18% ПДФО + 5% ВЗ)",
};

export const OWNERSHIP_TYPE_LABELS: Record<OwnershipType, string> = {
  sole: "Одноосібна",
  shared_partial: "Спільна часткова",
  shared_joint: "Спільна сумісна (подружжя)",
};

export interface PropertyRequiredDocument {
  id: string;
  label: string;
  description?: string;
  matchClassifications?: string[];
  priority: "critical" | "high" | "medium";
  isOptional?: boolean;
}

export const REQUIRED_DOCUMENTS_BY_TYPE: Record<PropertyType, PropertyRequiredDocument[]> = {
  apartment: [
    { id: "apt-ownership", label: "Правовстановлюючий документ", description: "Договір купівлі-продажу, дарування, свідоцтво про спадщину", matchClassifications: ["Договір купівлі-продажу", "Договір дарування", "Свідоцтво про право на спадщину"], priority: "critical" },
    { id: "apt-registry-extract", label: "Витяг з реєстру речових прав", description: "Витяг з Державного реєстру речових прав на нерухоме майно", matchClassifications: ["Витяг з Державного реєстру речових прав"], priority: "critical" },
    { id: "apt-tech-passport", label: "Технічний паспорт на квартиру", description: "Технічний паспорт з БТІ", priority: "high" },
    { id: "apt-valuation", label: "Експертна оцінка вартості", description: "Звіт про оцінку майна для декларування", priority: "medium", isOptional: true },
  ],
  house: [
    { id: "house-ownership", label: "Правовстановлюючий документ", description: "Договір купівлі-продажу, дарування, свідоцтво про спадщину", matchClassifications: ["Договір купівлі-продажу", "Договір дарування", "Свідоцтво про право на спадщину"], priority: "critical" },
    { id: "house-registry-extract", label: "Витяг з реєстру речових прав", matchClassifications: ["Витяг з Державного реєстру речових прав"], priority: "critical" },
    { id: "house-land-docs", label: "Документи на земельну ділянку", description: "Державний акт або витяг на земельну ділянку під будинком", priority: "high" },
    { id: "house-tech-passport", label: "Технічний паспорт на будинок", description: "Технічний паспорт з БТІ", priority: "high" },
    { id: "house-valuation", label: "Експертна оцінка вартості", priority: "medium", isOptional: true },
  ],
  land: [
    { id: "land-ownership", label: "Правовстановлюючий документ", description: "Державний акт, договір купівлі-продажу, свідоцтво про спадщину", matchClassifications: ["Договір купівлі-продажу", "Свідоцтво про право на спадщину", "Свідоцтво про право власності"], priority: "critical" },
    { id: "land-registry-extract", label: "Витяг з реєстру речових прав", matchClassifications: ["Витяг з Державного реєстру речових прав"], priority: "critical" },
    { id: "land-cadastral", label: "Витяг з Державного земельного кадастру", description: "З кадастровим номером ділянки", priority: "high" },
    { id: "land-valuation", label: "Нормативна грошова оцінка", description: "Витяг про нормативну грошову оцінку земельної ділянки", priority: "high" },
  ],
  vehicle: [
    { id: "veh-tech-passport", label: "Свідоцтво про реєстрацію ТЗ", description: "Технічний паспорт транспортного засобу", matchClassifications: ["Технічний паспорт транспортного засобу"], priority: "critical" },
    { id: "veh-purchase", label: "Договір купівлі-продажу", description: "Або інший правовстановлюючий документ", matchClassifications: ["Договір купівлі-продажу"], priority: "critical" },
    { id: "veh-valuation", label: "Експертна оцінка вартості", description: "Для декларування", priority: "medium", isOptional: true },
  ],
  commercial: [
    { id: "comm-ownership", label: "Правовстановлюючий документ", description: "Договір купівлі-продажу, оренди або інший", matchClassifications: ["Договір купівлі-продажу", "Свідоцтво про право власності"], priority: "critical" },
    { id: "comm-registry-extract", label: "Витяг з реєстру речових прав", matchClassifications: ["Витяг з Державного реєстру речових прав"], priority: "critical" },
    { id: "comm-tech-passport", label: "Технічний паспорт", description: "Технічний паспорт нежитлового приміщення", priority: "high" },
    { id: "comm-valuation", label: "Експертна оцінка вартості", priority: "medium", isOptional: true },
  ],
  other: [
    { id: "other-ownership", label: "Правовстановлюючий документ", description: "Будь-який документ, що підтверджує право власності", matchClassifications: ["Договір купівлі-продажу", "Свідоцтво про право власності", "Рішення суду"], priority: "critical" },
    { id: "other-valuation", label: "Документ оцінки вартості", priority: "medium", isOptional: true },
  ],
};

export const RECOGNIZABLE_DOCUMENT_TYPES = [
  "Витяг з Державного реєстру речових прав",
  "Договір купівлі-продажу",
  "Свідоцтво про право на спадщину",
  "Свідоцтво про право власності",
  "Технічний паспорт транспортного засобу",
  "Договір дарування",
  "Рішення суду",
];

// Shared utilities — used by PropertyObjectsContent, PropertyDetailSheet, AddPropertySheet
import { Home, Car, LandPlot, Building2, HelpCircle, Store } from "lucide-react";

export const PROPERTY_TYPE_ICONS: Record<PropertyType, React.ElementType> = {
  apartment: Home,
  house: Building2,
  land: LandPlot,
  vehicle: Car,
  commercial: Store,
  other: HelpCircle,
};

export const shareLabel = (share: number): string => {
  if (share === 1) return "1/1";
  if (share === 0.5) return "1/2";
  if (share === 0.333 || share === 1 / 3) return "1/3";
  if (share === 0.25) return "1/4";
  return `${Math.round(share * 100)}%`;
};

export interface MockRecognitionPreset {
  docType: string;
  type: PropertyType;
  description: string;
  address: string;
  share: string;
  date: string;
  method: AcquisitionMethod;
  value: string;
}

export const MOCK_RECOGNITION_PRESETS: MockRecognitionPreset[] = [
  {
    docType: "Договір купівлі-продажу",
    type: "apartment",
    description: "2-кімнатна квартира",
    address: "м. Київ, вул. Шевченка, 10, кв. 5",
    share: "1",
    date: "2023-01-15",
    method: "purchase",
    value: "3200000",
  },
  {
    docType: "Свідоцтво про право на спадщину",
    type: "land",
    description: "Земельна ділянка 0.12 га",
    address: "Київська обл., с. Гатне, вул. Садова, 7",
    share: "0.5",
    date: "2021-08-22",
    method: "inheritance",
    value: "480000",
  },
  {
    docType: "Технічний паспорт транспортного засобу",
    type: "vehicle",
    description: "Hyundai Tucson, 2021 р.в.",
    address: "",
    share: "1",
    date: "2021-04-10",
    method: "purchase",
    value: "920000",
  },
];

export const DEMO_PROPERTY_OBJECTS: PropertyObject[] = [
  {
    id: "prop-1",
    type: "apartment",
    description: "3-кімнатна квартира",
    address: "м. Київ, вул. Лесі Українки, 28, кв. 15",
    ownershipShare: 0.5,
    acquisitionDate: "2022-03-10",
    acquisitionMethod: "inheritance",
    estimatedValue: 2800000,
    totalArea: 78,
    status: "owned",
    dataSource: "document",
    documents: [
      {
        id: "doc-1",
        name: "Свідоцтво про право на спадщину",
        fileType: "pdf",
        uploadedAt: "2024-11-15T10:00:00.000Z",
        aiClassification: "Свідоцтво про право на спадщину",
        recognizedFields: {
          "Тип майна": "Квартира",
          "Частка": "1/2",
          "Дата": "10.03.2022",
        },
      },
      {
        id: "doc-2",
        name: "Витяг з реєстру речових прав",
        fileType: "pdf",
        uploadedAt: "2024-11-15T10:05:00.000Z",
        aiClassification: "Витяг з Державного реєстру речових прав",
      },
    ],
    insurances: [
      {
        id: "ins-2",
        type: "title",
        company: "Універсальна",
        policyNumber: "ТС-2024-112233",
        validFrom: "2024-03-10",
        validTo: "2026-03-10",
        coverageAmount: 2800000,
        active: true,
      },
    ],
  },
  {
    id: "prop-2",
    type: "house",
    description: "Приватний будинок",
    address: "Київська обл., с. Вишневе, вул. Центральна, 25",
    ownershipShare: 1,
    acquisitionDate: "2019-05-20",
    acquisitionMethod: "purchase",
    estimatedValue: 4500000,
    totalArea: 180,
    status: "owned",
    dataSource: "registry",
    registryVerified: true,
    registryLastSync: "2025-01-15",
    registryNumber: "12345678",
    documents: [
      {
        id: "doc-3",
        name: "Договір купівлі-продажу",
        fileType: "pdf",
        uploadedAt: "2024-11-15T10:10:00.000Z",
        aiClassification: "Договір купівлі-продажу",
      },
    ],
    encumbrances: [
      {
        id: "enc-1",
        type: "mortgage",
        description: "Іпотечний договір № 456/2019 від 20.05.2019",
        registeredAt: "2019-05-20",
        registeredBy: "ПриватБанк",
        active: true,
        registryNumber: "OB-789456",
      },
      {
        id: "enc-2",
        type: "prohibition",
        description: "Заборона відчуження на період іпотеки",
        registeredAt: "2019-05-20",
        registeredBy: "Нотаріус Іваненко О.В.",
        active: true,
      },
    ],
    insurances: [
      {
        id: "ins-1",
        type: "property",
        company: "ІНГО Україна",
        policyNumber: "МН-2025-004521",
        validFrom: "2025-08-15",
        validTo: "2026-08-15",
        coverageAmount: 4500000,
        active: true,
      },
    ],
  },
  {
    id: "prop-3",
    type: "vehicle",
    description: "Toyota RAV4, 2020 р.в.",
    ownershipShare: 1,
    acquisitionDate: "2020-06-15",
    acquisitionMethod: "purchase",
    estimatedValue: 850000,
    engineVolume: 2500,
    status: "sold",
    soldDate: "2024-09-12",
    dataSource: "manual",
    documents: [
      {
        id: "doc-4",
        name: "Технічний паспорт ТЗ",
        fileType: "pdf",
        uploadedAt: "2024-11-15T10:15:00.000Z",
        aiClassification: "Технічний паспорт транспортного засобу",
      },
    ],
  },
  {
    id: "prop-4",
    type: "land",
    description: "Земельна ділянка 0.15 га",
    address: "Київська обл., с. Гатне, вул. Садова, 7",
    ownershipShare: 1,
    acquisitionDate: "2021-08-22",
    acquisitionMethod: "inheritance",
    estimatedValue: 480000,
    status: "owned",
    dataSource: "manual",
    documents: [
      {
        id: "doc-5",
        name: "Свідоцтво про право на спадщину",
        fileType: "pdf",
        uploadedAt: "2024-11-15T10:20:00.000Z",
        aiClassification: "Свідоцтво про право на спадщину",
      },
    ],
  },
  {
    id: "prop-5",
    type: "apartment",
    description: "1-кімнатна квартира (інвестиція)",
    address: "м. Київ, пр. Перемоги, 67, кв. 203",
    ownershipShare: 1,
    acquisitionDate: "2024-01-15",
    acquisitionMethod: "purchase",
    estimatedValue: 1400000,
    totalArea: 42,
    status: "sold",
    soldDate: "2026-02-20",
    dataSource: "document",
    documents: [
      {
        id: "doc-6",
        name: "Договір купівлі-продажу",
        fileType: "pdf",
        uploadedAt: "2024-02-01T09:00:00.000Z",
        aiClassification: "Договір купівлі-продажу",
      },
      {
        id: "doc-7",
        name: "Договір продажу",
        fileType: "pdf",
        uploadedAt: "2026-02-20T14:30:00.000Z",
        aiClassification: "Договір купівлі-продажу",
      },
    ],
  },
  // 3.7: Другий продаж нерухомості за рік (гараж)
  {
    id: "prop-6",
    type: "other" as const,
    description: "Гараж (бокс №47)",
    address: "м. Київ, Бортничі, масив Садовий, бокс №47",
    ownershipShare: 1,
    acquisitionDate: "2019-08-20",
    acquisitionMethod: "purchase",
    estimatedValue: 150000,
    totalArea: 24,
    status: "sold",
    soldDate: "2024-12-10",
    dataSource: "document",
    documents: [
      {
        id: "doc-8",
        name: "Договір купівлі (2019)",
        fileType: "pdf",
        uploadedAt: "2019-08-20T10:00:00.000Z",
        aiClassification: "Договір купівлі-продажу",
      },
      {
        id: "doc-9",
        name: "Договір продажу гаражу",
        fileType: "pdf",
        uploadedAt: "2024-12-10T14:00:00.000Z",
        aiClassification: "Договір купівлі-продажу",
      },
    ],
  },
  // Оренда квартири (ст. 170.1 ПКУ)
  {
    id: "prop-7",
    type: "apartment",
    description: "1-кімнатна квартира (здається в оренду)",
    address: "м. Київ, вул. Саксаганського, 44, кв. 12",
    ownershipShare: 1,
    ownershipType: "sole",
    acquisitionDate: "2018-09-01",
    acquisitionMethod: "purchase",
    estimatedValue: 1600000,
    totalArea: 38,
    status: "rented",
    monthlyRent: 15000,
    tenantType: "individual",
    rentalContractDate: "2025-01-01",
    dataSource: "manual",
    documents: [
      {
        id: "doc-10",
        name: "Договір купівлі-продажу",
        fileType: "pdf",
        uploadedAt: "2018-09-01T10:00:00.000Z",
        aiClassification: "Договір купівлі-продажу",
      },
    ],
  },
  // Подарований від неродича (ст. 174.6 ПКУ — 18% ПДФО + 5% ВЗ)
  {
    id: "prop-8",
    type: "apartment",
    description: "Студія (подарунок від друга)",
    address: "м. Одеса, вул. Дерибасівська, 5, кв. 3",
    ownershipShare: 1,
    acquisitionDate: "2025-06-15",
    acquisitionMethod: "gift",
    donorRelation: "non_relative",
    estimatedValue: 950000,
    totalArea: 28,
    status: "owned",
    dataSource: "document",
    documents: [
      {
        id: "doc-11",
        name: "Договір дарування",
        fileType: "pdf",
        uploadedAt: "2025-06-15T10:00:00.000Z",
        aiClassification: "Договір дарування",
      },
    ],
  },
  // Комерційна нерухомість (ст. 266.5.1 — без пільгової площі)
  {
    id: "prop-9",
    type: "commercial",
    description: "Офісне приміщення",
    address: "м. Київ, вул. Хрещатик, 22, оф. 301",
    ownershipShare: 1,
    ownershipType: "shared_joint",
    coOwnerName: "Петренко Ольга Ігорівна (дружина)",
    acquisitionDate: "2020-11-10",
    acquisitionMethod: "purchase",
    estimatedValue: 3200000,
    totalArea: 65,
    status: "owned",
    dataSource: "registry",
    registryVerified: true,
    registryLastSync: "2025-02-01",
    registryNumber: "98765432",
    documents: [
      {
        id: "doc-12",
        name: "Договір купівлі-продажу",
        fileType: "pdf",
        uploadedAt: "2020-11-10T10:00:00.000Z",
        aiClassification: "Договір купівлі-продажу",
      },
    ],
  },
  // Незавершене будівництво (декларується, не оподатковується)
  {
    id: "prop-10",
    type: "house",
    description: "Будинок (незавершене будівництво, 70%)",
    address: "Київська обл., с. Козин, вул. Лісова, 18",
    ownershipShare: 1,
    acquisitionDate: "2023-04-01",
    acquisitionMethod: "purchase",
    estimatedValue: 2100000,
    totalArea: 160,
    status: "construction",
    dataSource: "manual",
    documents: [],
  },
  // Зарубіжна нерухомість (ст. 170.11 ПКУ)
  {
    id: "prop-11",
    type: "apartment",
    description: "Апартаменти в Варшаві",
    address: "Warszawa, ul. Marszałkowska, 15/8",
    ownershipShare: 1,
    acquisitionDate: "2021-07-20",
    acquisitionMethod: "purchase",
    estimatedValue: 4200000,
    totalArea: 55,
    country: "Польща",
    foreignTaxPaid: 32000,
    status: "rented",
    monthlyRent: 25000,
    tenantType: "individual",
    rentalContractDate: "2024-09-01",
    dataSource: "manual",
    documents: [
      {
        id: "doc-13",
        name: "Akt notarialny (договір купівлі)",
        fileType: "pdf",
        uploadedAt: "2021-07-20T10:00:00.000Z",
      },
    ],
  },
];