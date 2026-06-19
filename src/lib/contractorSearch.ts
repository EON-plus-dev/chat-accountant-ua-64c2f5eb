import type { Cabinet } from "@/types/cabinet";
import type { Contractor } from "@/config/settingsConfig";
import { getContractorsForCabinet } from "@/config/settingsConfig";

// Search status types
export type SearchStatus =
  | "idle"
  | "searching"
  | "found_cabinet_synced"     // In cabinet, synced
  | "found_cabinet_not_synced" // In cabinet, not synced
  | "found_cabinet_pending"    // In cabinet, awaiting registration
  | "found_system"             // In system (other cabinets)
  | "found_registry"           // Only in EDR
  | "not_found";               // Not found anywhere

export interface RegistryData {
  name: string;
  code: string;
  type: "legal" | "fop" | "individual";
  address?: string;
  director?: string;
  email?: string;
  phone?: string;
  taxStatus?: string;
  isVerified: boolean;
  isSuspended: boolean;
}

export interface UnifiedSearchResult {
  status: SearchStatus;
  cabinetMatch?: {
    contractor: Contractor;
    syncStatus: "synced" | "not_synced" | "pending";
  };
  systemMatch?: {
    code: string;
    name: string;
    type: "legal" | "fop" | "individual";
    isRegistered: true;
  };
  registryMatch?: RegistryData;
  searchedCode?: string;
  searchedName?: string;
}

// TEST CODES for different states:
// 43215678 - in cabinet (synced)
// 43215679 - in cabinet (not synced)
// 43215680 - in cabinet (pending)
// 11111111 - in system (other cabinet)
// 12345678 - in EDR (verified)
// 87654321 - in EDR (suspended)
// 99999999 - not found anywhere

// Mock: Check if contractor exists in "system" (other cabinets)
const checkSystemRegistry = async (code: string): Promise<{ found: boolean; name?: string; type?: "legal" | "fop" | "individual" }> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // Mock: These codes exist in "system" but not in user's cabinet
  const systemContractors: Record<string, { name: string; type: "legal" | "fop" | "individual" }> = {
    "11111111": { name: 'ТОВ "Системний партнер"', type: "legal" },
    "22222222": { name: 'ПП "Глобал Трейд"', type: "legal" },
    "3333333333": { name: "ФОП Іванченко С.П.", type: "fop" },
  };
  
  if (systemContractors[code]) {
    return { found: true, ...systemContractors[code] };
  }
  return { found: false };
};

// Mock: Search external registry (EDR)
const searchExternalRegistry = async (code: string): Promise<{ found: boolean; data?: RegistryData }> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Test code: 12345678 - verified company in EDR
  if (code === "12345678") {
    return {
      found: true,
      data: {
        name: 'ТОВ "Технопром Груп"',
        code: "12345678",
        type: "legal",
        address: "м. Київ, вул. Хрещатик, 22",
        director: "Петренко Олександр Васильович",
        email: "info@technoprom.ua",
        phone: "+380441234567",
        taxStatus: "Платник ПДВ",
        isVerified: true,
        isSuspended: false,
      },
    };
  }
  
  // Test code: 87654321 - suspended company in EDR
  if (code === "87654321") {
    return {
      found: true,
      data: {
        name: 'ТОВ "Закрита компанія"',
        code: "87654321",
        type: "legal",
        address: "м. Одеса, вул. Дерибасівська, 1",
        director: "Іваненко І.І.",
        email: "old@closed.ua",
        taxStatus: "Анульовано",
        isVerified: false,
        isSuspended: true,
      },
    };
  }
  
  // 10-digit codes are FOPs
  if (code.length === 10 && /^\d+$/.test(code)) {
    return {
      found: true,
      data: {
        name: "ФОП Шевченко Марія Іванівна",
        code,
        type: "fop",
        address: "м. Львів, вул. Личаківська, 45",
        email: "fop.shevchenko@gmail.com",
        taxStatus: "Єдиний податок, 3 група",
        isVerified: true,
        isSuspended: false,
      },
    };
  }
  
  return { found: false };
};

// Mock cabinet contractors for testing
const getMockCabinetContractors = (): Contractor[] => [
  {
    id: "test-synced",
    name: 'ТОВ "Синхронізований партнер"',
    code: "43215678",
    type: "legal",
    email: "partner@synced.ua",
    isSynced: true,
    isEdrsVerified: true,
    status: "active",
  },
  {
    id: "test-not-synced",
    name: 'ПП "Несинхронізована компанія"',
    code: "43215679",
    type: "legal",
    email: "info@notsync.ua",
    isSynced: false,
    status: "active",
  },
  {
    id: "test-pending",
    name: 'ФОП Очікуваний О.О.',
    code: "43215680",
    type: "fop",
    email: "pending@fop.ua",
    isPending: true,
    status: "active",
  },
];

/**
 * Unified contractor search with 5-level cascade:
 * 1. User's cabinet (synced/not_synced/pending)
 * 2. System (other cabinets)
 * 3. External registry (EDR)
 * 4. Not found
 * 
 * Supports search by code (8-10 digits) or name (min 3 chars)
 */
export const searchContractorUnified = async (
  query: string,
  cabinet: Cabinet
): Promise<UnifiedSearchResult> => {
  const cleanQuery = query.trim();
  const cleanCode = cleanQuery.replace(/\D/g, "");
  
  // Determine search type
  const isCodeSearch = cleanCode.length >= 8 && cleanCode.length <= 10 && cleanCode === cleanQuery;
  const isNameSearch = cleanQuery.length >= 3 && !isCodeSearch;
  
  if (!isCodeSearch && !isNameSearch) {
    return { status: "idle" };
  }
  
  // Step 1: Check in user's cabinet
  const cabinetContractors = getContractorsForCabinet(cabinet);
  // Add mock test contractors for demo
  const allCabinetContractors = [...cabinetContractors, ...getMockCabinetContractors()];
  
  let cabinetMatch: Contractor | undefined;
  
  if (isCodeSearch) {
    cabinetMatch = allCabinetContractors.find((c) => c.code === cleanCode);
  } else if (isNameSearch) {
    const lowerQuery = cleanQuery.toLowerCase();
    cabinetMatch = allCabinetContractors.find((c) => 
      c.name.toLowerCase().includes(lowerQuery)
    );
  }
  
  if (cabinetMatch) {
    let syncStatus: "synced" | "not_synced" | "pending" = "not_synced";
    let status: SearchStatus = "found_cabinet_not_synced";
    
    if (cabinetMatch.isSynced) {
      syncStatus = "synced";
      status = "found_cabinet_synced";
    } else if (cabinetMatch.isPending) {
      syncStatus = "pending";
      status = "found_cabinet_pending";
    }
    
    return {
      status,
      cabinetMatch: { contractor: cabinetMatch, syncStatus },
      searchedCode: isCodeSearch ? cleanCode : undefined,
      searchedName: isNameSearch ? cleanQuery : undefined,
    };
  }
  
  // For name search without code match, stop here
  if (isNameSearch && !isCodeSearch) {
    return {
      status: "not_found",
      searchedName: cleanQuery,
    };
  }
  
  // Step 2: Check in system (other cabinets) - only for code search
  const systemResult = await checkSystemRegistry(cleanCode);
  if (systemResult.found && systemResult.name && systemResult.type) {
    return {
      status: "found_system",
      systemMatch: {
        code: cleanCode,
        name: systemResult.name,
        type: systemResult.type,
        isRegistered: true,
      },
      searchedCode: cleanCode,
    };
  }
  
  // Step 3: Check external registry (EDR)
  const registryResult = await searchExternalRegistry(cleanCode);
  if (registryResult.found && registryResult.data) {
    return {
      status: "found_registry",
      registryMatch: registryResult.data,
      searchedCode: cleanCode,
    };
  }
  
  // Step 4: Not found anywhere
  return {
    status: "not_found",
    searchedCode: cleanCode,
  };
};

/**
 * Validate contractor code format (8-10 digits)
 */
export const isValidContractorCode = (code: string): boolean => {
  const cleanCode = code.replace(/\D/g, "");
  return cleanCode.length >= 8 && cleanCode.length <= 10;
};

/**
 * Check if query is valid for search (code or name)
 */
export const isValidSearchQuery = (query: string): boolean => {
  const cleanQuery = query.trim();
  const cleanCode = cleanQuery.replace(/\D/g, "");
  
  // Valid code (8-10 digits)
  if (cleanCode.length >= 8 && cleanCode.length <= 10 && cleanCode === cleanQuery) {
    return true;
  }
  
  // Valid name search (min 3 chars)
  if (cleanQuery.length >= 3) {
    return true;
  }
  
  return false;
};

/**
 * Get code type label
 */
export const getCodeTypeLabel = (code: string): string => {
  const cleanCode = code.replace(/\D/g, "");
  if (cleanCode.length === 8) return "ЄДРПОУ";
  if (cleanCode.length === 10) return "ІПН";
  return "Код";
};
