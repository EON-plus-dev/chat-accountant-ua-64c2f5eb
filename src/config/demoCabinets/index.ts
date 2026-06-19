/**
 * ДЕМО-ДАНІ ДЛЯ СПЕЦІАЛІЗОВАНИХ БІЗНЕС-КАБІНЕТІВ
 *
 * Центральний експорт модульної структури демо-даних для 4-х кабінетів ФОП:
 * 1. Консалтинг (3 група) - demo-consulting-3
 * 2. Автосервіс (2 група) - demo-autorepair-2
 * 3. IT (3 група) - demo-it-3
 * 4. Дилер/Торгівля (2 група) - demo-dealer-2
 */

// Re-export helpers
export * from "./helpers";

// Re-export types and constants
export * from "./types";

// Re-export all cabinet data
export * from "./consultingData";
export * from "./autorepairData";
export * from "./itData";
export * from "./dealerData";
export * from "./individualData";
export * from "./finMonitoringData";
export * from "./salonData";
export * from "./tennisData";
export * from "./tennisOrdersData";
export * from "./restaurantData";
export * from "./hotelData";
export * from "./hotelOrdersData";

// Re-export getter functions
export * from "./getters";
