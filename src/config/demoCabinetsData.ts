/**
 * ДЕМО-ДАНІ ДЛЯ СПЕЦІАЛІЗОВАНИХ БІЗНЕС-КАБІНЕТІВ
 *
 * Цей файл є barrel-експортом модульної структури.
 * Фактичні дані знаходяться в src/config/demoCabinets/
 *
 * Структура:
 * - demoCabinets/helpers.ts - Спільні хелпер-функції
 * - demoCabinets/types.ts - Типи та константи (DEMO_CABINET_IDS, isDemoCabinet)
 * - demoCabinets/consultingData.ts - Дані консалтингового кабінету
 * - demoCabinets/autorepairData.ts - Дані автосервісу
 * - demoCabinets/itData.ts - Дані IT кабінету
 * - demoCabinets/dealerData.ts - Дані дилерського кабінету
 * - demoCabinets/getters.ts - Функції отримання даних за ID кабінету
 * - demoCabinets/index.ts - Центральний експорт
 */

// Re-export все для збереження зворотної сумісності
export * from "./demoCabinets";
