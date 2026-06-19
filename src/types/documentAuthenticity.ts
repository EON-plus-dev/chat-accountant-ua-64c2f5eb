// ============================================
// DOCUMENT AUTHENTICITY & VERIFICATION TYPES
// eIDAS-compatible digital signature verification
// ============================================

// ============================================
// SIGNATURE TYPES (eIDAS Classification)
// ============================================

export type SignatureLevel =
  | "SES"    // Simple Electronic Signature
  | "AES"    // Advanced Electronic Signature
  | "QES";   // Qualified Electronic Signature (КЕП in Ukraine)

export type SignatureStatus =
  | "valid"       // Підпис дійсний
  | "invalid"     // Підпис недійсний
  | "expired"     // Сертифікат прострочений
  | "revoked"     // Сертифікат відкликано
  | "unknown"     // Неможливо перевірити
  | "pending";    // Очікує підпису

// ============================================
// CERTIFICATE CHAIN
// ============================================

export interface CertificateInfo {
  serialNumber: string;
  issuer: string;
  issuerShort: string;
  subject: string;
  subjectEDRPOU?: string;
  subjectDRFO?: string;
  validFrom: string;
  validTo: string;
  isQualified: boolean;
  algorithm: string;
  keyUsage: string[];
}

export interface CertificateChain {
  root: CertificateInfo;
  intermediate?: CertificateInfo;
  endEntity: CertificateInfo;
  isComplete: boolean;
  verificationPath: string[];
}

// ============================================
// SIGNATURE VERIFICATION
// ============================================

export interface SignatureVerification {
  id: string;
  signerName: string;
  signerPosition?: string;
  signerOrganization?: string;
  signerCode?: string;           // ЄДРПОУ/РНОКПП
  
  signatureLevel: SignatureLevel;
  status: SignatureStatus;
  
  signedAt: string;
  verifiedAt: string;
  
  certificate?: CertificateInfo;
  certificateChain?: CertificateChain;
  
  // Time-stamp
  timestampAuthority?: string;
  timestampAt?: string;
  
  // Verification details
  hashAlgorithm: string;
  signatureValue: string;        // Truncated for display
  
  // Warnings/Errors
  warnings?: string[];
  errors?: string[];
}

// ============================================
// INTEGRITY VERIFICATION
// ============================================

export type IntegrityStatus = "verified" | "warning" | "broken" | "pending";

export interface IntegrityCheck {
  status: IntegrityStatus;
  message: string;
  
  // Hash chain info
  currentHash: string;
  previousHash?: string;
  chainLength: number;
  
  // Verification
  verifiedAt: string;
  verifiedBy: string;
  
  // Details
  algorithm: "SHA-256" | "SHA-384" | "SHA-512";
  entriesCount: number;
  lastEntryAt: string;
}

// ============================================
// SOURCE VERIFICATION
// ============================================

export type SourceType =
  | "upload"          // Завантажено користувачем
  | "edo"             // Отримано через ЕДО
  | "email"           // Отримано на email
  | "api"             // Отримано через API
  | "generated"       // Згенеровано в системі
  | "scanned";        // Сканована копія

export interface SourceVerification {
  sourceType: SourceType;
  sourceLabel: string;
  
  // Metadata
  receivedAt: string;
  receivedFrom?: string;
  receivedVia?: string;
  
  // Verification
  isVerified: boolean;
  verificationMethod?: string;
  verifiedAt?: string;
  
  // Original file
  originalFilename?: string;
  originalMimeType?: string;
  originalSize?: number;
  
  // For EDO
  edoProvider?: string;
  edoDocumentId?: string;
  edoEnvelopeId?: string;
}

// ============================================
// UNIFIED AUTHENTICITY VERIFICATION
// ============================================

export interface AuthenticityVerification {
  documentId: string;
  verifiedAt: string;
  
  // Overall status
  overallStatus: "authentic" | "suspicious" | "unverified";
  confidenceScore: number;      // 0-100
  
  // Components
  signatures: SignatureVerification[];
  integrity: IntegrityCheck;
  source: SourceVerification;
  
  // Legal hold
  isUnderLegalHold: boolean;
  legalHoldReason?: string;
  legalHoldSince?: string;
  
  // Archival status
  isArchived: boolean;
  archivedAt?: string;
  archiveReference?: string;
}

// ============================================
// VERIFICATION RESULT FOR UI
// ============================================

export interface VerificationBadgeProps {
  status: "valid" | "warning" | "error" | "pending";
  label: string;
  tooltip: string;
}

export const getSignatureStatusBadge = (status: SignatureStatus): VerificationBadgeProps => {
  switch (status) {
    case "valid":
      return { status: "valid", label: "КЕП дійсний", tooltip: "Підпис верифіковано" };
    case "expired":
      return { status: "warning", label: "Сертифікат прострочено", tooltip: "Сертифікат КЕП прострочений" };
    case "revoked":
      return { status: "error", label: "Сертифікат відкликано", tooltip: "Сертифікат КЕП відкликано видавцем" };
    case "invalid":
      return { status: "error", label: "Підпис недійсний", tooltip: "Верифікацію не пройдено" };
    case "pending":
      return { status: "pending", label: "Очікує підпису", tooltip: "Документ ще не підписано" };
    default:
      return { status: "pending", label: "Невідомо", tooltip: "Неможливо перевірити підпис" };
  }
};

export const getIntegrityStatusBadge = (status: IntegrityStatus): VerificationBadgeProps => {
  switch (status) {
    case "verified":
      return { status: "valid", label: "Цілісність OK", tooltip: "Hash-ланцюжок підтверджено" };
    case "warning":
      return { status: "warning", label: "Увага", tooltip: "Виявлено потенційні проблеми" };
    case "broken":
      return { status: "error", label: "Порушено", tooltip: "Hash-ланцюжок пошкоджено" };
    default:
      return { status: "pending", label: "Очікує", tooltip: "Перевірка не завершена" };
  }
};

// ============================================
// DEMO DATA GENERATORS
// ============================================

export const generateDemoSignature = (
  signerName: string,
  signerPosition: string,
  isValid: boolean = true,
  statusOverride?: SignatureStatus
): SignatureVerification => {
  const isPending = statusOverride === "pending";
  const effectiveStatus: SignatureStatus = statusOverride || (isValid ? "valid" : "expired");
  const signedAt = isPending
    ? new Date().toISOString()
    : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
  
  return {
    id: `sig-${Math.random().toString(36).slice(2, 10)}`,
    signerName,
    signerPosition,
    signerOrganization: "ФОП Мельник П.І.",
    signerCode: "3056789012",
    
    signatureLevel: "QES",
    status: effectiveStatus,
    
    signedAt,
    verifiedAt: new Date().toISOString(),
    
    certificate: isPending ? undefined : {
      serialNumber: `04${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
      issuer: "АЦСК ДПС України",
      issuerShort: "АЦСК ДПС",
      subject: signerName,
      subjectEDRPOU: "3056789012",
      validFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      validTo: new Date(Date.now() + (isValid ? 365 : -30) * 24 * 60 * 60 * 1000).toISOString(),
      isQualified: true,
      algorithm: "ДСТУ 4145-2002",
      keyUsage: ["digitalSignature", "nonRepudiation"],
    },
    
    timestampAuthority: isPending ? undefined : "АЦСК ДПС",
    timestampAt: isPending ? undefined : signedAt,
    
    hashAlgorithm: "ГОСТ 34.311-95",
    signatureValue: isPending ? "" : "3082...truncated",
    
    warnings: isPending ? ["Очікує підпису"] : isValid ? [] : ["Сертифікат прострочений"],
    errors: [],
  };
};

export const generateDemoIntegrity = (isValid: boolean = true): IntegrityCheck => ({
  status: isValid ? "verified" : "warning",
  message: isValid 
    ? "Hash-ланцюжок цілісний. Усі записи підтверджено."
    : "Виявлено розбіжність у hash-ланцюжку",
  
  currentHash: Math.random().toString(16).slice(2).padEnd(64, "0"),
  previousHash: Math.random().toString(16).slice(2).padEnd(64, "0"),
  chainLength: Math.floor(Math.random() * 20) + 5,
  
  verifiedAt: new Date().toISOString(),
  verifiedBy: "system",
  
  algorithm: "SHA-256",
  entriesCount: Math.floor(Math.random() * 50) + 10,
  lastEntryAt: new Date().toISOString(),
});

export const generateDemoSource = (type: SourceType = "upload"): SourceVerification => ({
  sourceType: type,
  sourceLabel: type === "upload" 
    ? "Завантажено користувачем"
    : type === "edo"
    ? "Отримано через ЕДО"
    : type === "generated"
    ? "Згенеровано в системі"
    : "Інше джерело",
  
  receivedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  receivedFrom: type === "edo" ? "Контрагент" : undefined,
  receivedVia: type === "edo" ? "M.E.Doc" : undefined,
  
  isVerified: true,
  verificationMethod: "hash-comparison",
  verifiedAt: new Date().toISOString(),
  
  originalFilename: "document.pdf",
  originalMimeType: "application/pdf",
  originalSize: Math.floor(Math.random() * 500000) + 50000,
  
  edoProvider: type === "edo" ? "M.E.Doc" : undefined,
  edoDocumentId: type === "edo" ? `EDO-${Math.random().toString(36).slice(2, 10).toUpperCase()}` : undefined,
});
