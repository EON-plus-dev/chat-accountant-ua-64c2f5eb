import { z } from "zod";

// ЄДРПОУ validation (8 digits for legal entities)
const validateEdrpou = (code: string): boolean => {
  if (!/^\d{8}$/.test(code)) return false;
  return true;
};

// IPN validation with checksum (10 digits for individuals/FOPs)
const validateIpn = (code: string): boolean => {
  if (!/^\d{10}$/.test(code)) return false;
  
  const weights = [-1, 5, 7, 9, 4, 6, 10, 5, 7];
  const digits = code.split("").map(Number);
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }
  
  const checkDigit = (sum % 11) % 10;
  return checkDigit === digits[9];
};

// IBAN validation for Ukraine (UA + 27 digits)
const validateIban = (iban: string): boolean => {
  if (!iban) return true; // Optional field
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  return /^UA\d{27}$/.test(cleaned);
};

// Phone validation (+380XXXXXXXXX)
const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return /^\+380\d{9}$/.test(cleaned);
};

export const contractorFormSchema = z.object({
  // Basic info
  name: z
    .string()
    .min(2, "Назва має бути від 2 символів")
    .max(200, "Назва не може перевищувати 200 символів"),
  
  code: z.string().refine(
    (val) => {
      if (val.length === 8) return validateEdrpou(val);
      if (val.length === 10) return validateIpn(val);
      return false;
    },
    { message: "Невірний код ЄДРПОУ (8 цифр) або ІПН (10 цифр)" }
  ),
  
  type: z.enum(["legal", "fop", "individual"], {
    required_error: "Оберіть тип контрагента",
  }),
  
  relationshipType: z.enum(["buyer", "supplier", "both"]).optional(),
  
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
  
  // Bank details
  iban: z
    .string()
    .optional()
    .refine((val) => !val || validateIban(val), {
      message: "Формат IBAN: UA + 27 цифр",
    }),
  
  bankName: z.string().max(100, "Максимум 100 символів").optional(),
  
  // Contact details
  email: z
    .string()
    .email("Невірний формат email")
    .max(255, "Максимум 255 символів")
    .optional()
    .or(z.literal("")),
  
  phone: z
    .string()
    .optional()
    .refine((val) => !val || validatePhone(val), {
      message: "Формат: +380XXXXXXXXX",
    }),
  
  address: z.string().max(300, "Максимум 300 символів").optional(),
  
  // Director and tax
  director: z.string().max(150, "Максимум 150 символів").optional(),
  
  directorPosition: z.string().max(100, "Максимум 100 символів").optional(),
  
  taxStatus: z.string().optional(),
  
  isEdrsVerified: z.boolean().default(false),
  
  // Cooperation terms
  paymentTermsDays: z
    .number()
    .min(1, "Мінімум 1 день")
    .max(365, "Максимум 365 днів")
    .optional()
    .nullable(),
  
  creditLimit: z
    .number()
    .min(0, "Ліміт не може бути від'ємним")
    .optional()
    .nullable(),
  
  // Additional info
  tags: z.array(z.string()).optional(),
  
  notes: z.string().max(500, "Максимум 500 символів").optional(),
});

export type ContractorFormData = z.infer<typeof contractorFormSchema>;

// Tax status options
export const taxStatusOptions = [
  { value: "vat", label: "Платник ПДВ" },
  { value: "ep1", label: "Платник ЄП 1 група" },
  { value: "ep2", label: "Платник ЄП 2 група" },
  { value: "ep3", label: "Платник ЄП 3 група" },
  { value: "ep3-vat", label: "Платник ЄП 3 група + ПДВ" },
  { value: "general", label: "Загальна система" },
  { value: "non-resident", label: "Нерезидент" },
];

// Contractor type options
export const contractorTypeOptions = [
  { value: "legal", label: "Юридична особа" },
  { value: "fop", label: "ФОП" },
  { value: "individual", label: "Фізична особа" },
];

// Contractor relationship type options (business relationship, not RBAC role)
export const relationshipTypeOptions = [
  { value: "buyer", label: "Покупець", description: "Купує у вас товари/послуги" },
  { value: "supplier", label: "Постачальник", description: "Продає вам товари/послуги" },
  { value: "both", label: "Обидва напрямки", description: "І купує, і продає" },
];

// Legacy alias for backward compatibility
export const contractorRoleOptions = relationshipTypeOptions;

// Contractor status options
export const contractorStatusOptions = [
  { value: "active", label: "Активний" },
  { value: "inactive", label: "Неактивний" },
  { value: "blocked", label: "Заблокований" },
];
