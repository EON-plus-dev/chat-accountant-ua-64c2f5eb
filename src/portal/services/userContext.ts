export interface UserContext {
  fopGroup: string | null;
  city: string | null;
  bank: string | null;
  audience: string;
}

export function getUserContext(): UserContext | null {
  try {
    return {
      fopGroup: localStorage.getItem("fint_fop_group") || null,
      city: localStorage.getItem("fint_city") || null,
      bank: localStorage.getItem("fint_bank") || null,
      audience: localStorage.getItem("fint_audience") || "all",
    };
  } catch {
    return null;
  }
}
