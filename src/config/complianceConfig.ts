// ============================================
// COMPLIANCE CONFIGURATION
// Ukrainian (ПКУ, НП(С)БО) + European (eIDAS, GDPR) Standards
// ============================================

// ============================================
// RETENTION CATEGORIES
// ============================================

export type RetentionCategory = 
  | "tax"           // Податкові документи - 1095 днів (3 роки за ПКУ)
  | "hr"            // Кадрові документи - 27375 днів (75 років)
  | "legal"         // Юридичні документи - 3650 днів (10 років)
  | "operational"   // Операційні документи - 365 днів (1 рік)
  | "accounting";   // Бухгалтерські документи - 1095 днів (3 роки)

export interface RetentionConfig {
  category: RetentionCategory;
  labelUk: string;
  labelEn: string;
  days: number;
  legalBasis: string;
  description: string;
}

export const retentionCategories: Record<RetentionCategory, RetentionConfig> = {
  tax: {
    category: "tax",
    labelUk: "Податковий",
    labelEn: "Tax",
    days: 1095, // 3 роки
    legalBasis: "ПКУ ст. 44.3",
    description: "Первинні документи, регістри бухобліку, фінансова звітність",
  },
  hr: {
    category: "hr",
    labelUk: "Кадровий",
    labelEn: "HR",
    days: 27375, // 75 років
    legalBasis: "Наказ Мін'юсту № 578/5",
    description: "Особові справи, трудові договори, накази по кадрах",
  },
  legal: {
    category: "legal",
    labelUk: "Юридичний",
    labelEn: "Legal",
    days: 3650, // 10 років
    legalBasis: "ЦКУ ст. 257",
    description: "Договори, акти, протоколи, судові документи",
  },
  operational: {
    category: "operational",
    labelUk: "Операційний",
    labelEn: "Operational",
    days: 365, // 1 рік
    legalBasis: "Внутрішній регламент",
    description: "Внутрішня кореспонденція, службові записки",
  },
  accounting: {
    category: "accounting",
    labelUk: "Бухгалтерський",
    labelEn: "Accounting",
    days: 1095, // 3 роки
    legalBasis: "НП(С)БО, ПКУ",
    description: "Первинні документи, рахунки, видаткові накладні",
  },
};

// ============================================
// TSA (Time Stamping Authority) PROVIDERS
// ============================================

export interface TSAProvider {
  id: string;
  name: string;
  fullName: string;
  website: string;
  isQualified: boolean; // eIDAS Qualified TSA
}

export const tsaProviders: TSAProvider[] = [
  {
    id: "acsk-dps",
    name: "АЦСК ДПС",
    fullName: "АЦСК ДПС України (АЦСК ДФС)",
    website: "https://acskidd.gov.ua",
    isQualified: true,
  },
  {
    id: "idd",
    name: "ІДД",
    fullName: "ІДД ДПС України",
    website: "https://acskidd.gov.ua",
    isQualified: true,
  },
  {
    id: "ukrposhta",
    name: "Укрпошта",
    fullName: "АЦСК АТ «Укрпошта»",
    website: "https://www.ukrposhta.ua/ua/acsk",
    isQualified: true,
  },
  {
    id: "privat24",
    name: "Приват24",
    fullName: "АЦСК ПАТ «ПриватБанк»",
    website: "https://privatbank.ua",
    isQualified: true,
  },
];

// ============================================
// HASH-CHAIN SIMULATION
// ============================================

// Demo SHA-256 like hash generator (not cryptographically secure - for demo only)
export const generateDemoHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
  // Generate 64-char SHA-256-like hash
  const fullHash = (hashHex + hashHex + hashHex + hashHex + hashHex + hashHex + hashHex + hashHex).slice(0, 64);
  return fullHash;
};

// Verify chain integrity (demo)
export const verifyChainIntegrity = (hashes: { current: string; previous: string | null }[]): {
  isValid: boolean;
  brokenAt?: number;
} => {
  for (let i = 1; i < hashes.length; i++) {
    // In real implementation, verify previous hash matches
    if (hashes[i].previous && hashes[i].previous !== hashes[i - 1].current) {
      return { isValid: false, brokenAt: i };
    }
  }
  return { isValid: true };
};

// ============================================
// RETENTION CALCULATIONS
// ============================================

export const getRetentionDays = (category: RetentionCategory): number => {
  return retentionCategories[category].days;
};

export const getArchiveEligibleDate = (createdAt: string, category: RetentionCategory): Date => {
  const created = new Date(createdAt);
  const retentionDays = getRetentionDays(category);
  return new Date(created.getTime() + retentionDays * 24 * 60 * 60 * 1000);
};

export const getDaysRemaining = (archiveEligibleDate: Date): number => {
  const now = new Date();
  const diffMs = archiveEligibleDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

export const getRetentionProgress = (createdAt: string, category: RetentionCategory): number => {
  const created = new Date(createdAt);
  const now = new Date();
  const totalDays = getRetentionDays(category);
  const elapsedDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
};

// ============================================
// IP MASKING (GDPR Compliance)
// ============================================

export const maskIpAddress = (ip: string): string => {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return ip.replace(/:\w+$/, ':xxxx'); // IPv6
};

// ============================================
// CERTIFICATE INFO TYPES
// ============================================

export interface CertificateInfo {
  serialNumber: string;
  issuer: string;
  issuerShort: string;
  validFrom: string;
  validTo: string;
  subjectName: string;
  subjectEDRPOU?: string;
}

// Demo certificate generator
export const generateDemoCertificate = (signerName: string): CertificateInfo => {
  const now = new Date();
  const validFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const validTo = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  
  return {
    serialNumber: `04${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    issuer: "АЦСК ДПС України",
    issuerShort: "АЦСК ДПС",
    validFrom: validFrom.toISOString(),
    validTo: validTo.toISOString(),
    subjectName: signerName,
    subjectEDRPOU: `${Math.floor(10000000 + Math.random() * 90000000)}`,
  };
};

// ============================================
// COMPLIANCE STATUS TYPES
// ============================================

export type IntegrityStatus = "verified" | "warning" | "broken";
export type SignatureStatus = "valid" | "expired" | "revoked" | "none";

export interface ComplianceStatus {
  integrity: IntegrityStatus;
  integrityMessage: string;
  signatures: {
    count: number;
    status: SignatureStatus;
    signers: string[];
  };
  retention: {
    category: RetentionCategory;
    daysRemaining: number;
    archiveDate: Date;
    progress: number;
  };
  legalHold: boolean;
  lastVerified: string;
}

// ============================================
// AUDIT CATEGORIES FOR FILTERING
// ============================================

export type AuditCategory = "edits" | "signatures" | "views" | "status" | "all";

export const auditCategoryLabels: Record<AuditCategory, string> = {
  all: "Всі",
  edits: "Редагування",
  signatures: "Підписи",
  views: "Перегляди",
  status: "Статуси",
};

export const auditCategoryIcons: Record<AuditCategory, string> = {
  all: "list",
  edits: "pencil",
  signatures: "file-signature",
  views: "eye",
  status: "refresh-cw",
};

// Map audit actions to categories
export const actionToCategory: Record<string, AuditCategory> = {
  created: "status",
  edited: "edits",
  "status-changed": "status",
  signed: "signatures",
  "kep-verified": "signatures",
  sent: "status",
  received: "status",
  paid: "status",
  archived: "status",
  cancelled: "status",
  viewed: "views",
  downloaded: "views",
  printed: "views",
  shared: "views",
  "version-created": "edits",
  "version-restored": "edits",
  "field-changed": "edits",
  "permission-changed": "status",
};

// ============================================
// COMPLIANCE EXPORT TYPES
// ============================================

export interface ComplianceExportOptions {
  includeIpAddresses: boolean;
  includeHashChain: boolean;
  includeCertificateDetails: boolean;
  format: "pdf" | "json" | "csv";
}

export const defaultExportOptions: ComplianceExportOptions = {
  includeIpAddresses: false, // GDPR default
  includeHashChain: true,
  includeCertificateDetails: true,
  format: "pdf",
};

// ============================================
// DEMO COMPLIANCE STATUS GENERATOR
// ============================================

export const generateDemoComplianceStatus = (
  documentId: string, 
  createdAt: string = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  category: RetentionCategory = "tax"
): ComplianceStatus => {
  const archiveDate = getArchiveEligibleDate(createdAt, category);
  const daysRemaining = getDaysRemaining(archiveDate);
  const progress = getRetentionProgress(createdAt, category);

  return {
    integrity: "verified",
    integrityMessage: "Hash-ланцюжок цілісний. Усі записи підтверджено.",
    signatures: {
      count: 2,
      status: "valid",
      signers: ["Петро Мельник (Директор)", "Олена Шевченко (Бухгалтер)"],
    },
    retention: {
      category,
      daysRemaining,
      archiveDate,
      progress,
    },
    legalHold: false,
    lastVerified: new Date().toISOString(),
  };
};
