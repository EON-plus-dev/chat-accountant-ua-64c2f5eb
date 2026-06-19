/**
 * Утиліта для отримання курсу валют з офіційного API НБУ
 * API: https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange
 */

interface NBURateResponse {
  r030: number;          // Цифровий код валюти
  txt: string;           // Назва валюти
  rate: number;          // Курс
  cc: string;            // Код валюти (USD, EUR)
  exchangedate: string;  // Дата курсу
}

export interface ExchangeRateResult {
  rate: number;
  date: string;
  currency: string;
  currencyName: string;
}

/**
 * Отримує курс валюти з API НБУ за вказаною датою
 * @param currency - код валюти (USD, EUR)
 * @param date - дата у форматі YYYY-MM-DD
 * @returns Promise<ExchangeRateResult | null>
 */
/**
 * Отримує всі курси валют з API НБУ за вказаною датою (один запит)
 * @param date - дата у форматі YYYY-MM-DD
 * @returns Promise<Map<string, ExchangeRateResult>>
 */
export async function fetchNBUAllRates(
  date: string
): Promise<Map<string, ExchangeRateResult>> {
  const formattedDate = date.replace(/-/g, "");
  const url = `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${formattedDate}&json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data: NBURateResponse[] = await response.json();
  const map = new Map<string, ExchangeRateResult>();

  for (const item of data) {
    map.set(item.cc, {
      rate: item.rate,
      date: item.exchangedate,
      currency: item.cc,
      currencyName: item.txt,
    });
  }

  return map;
}

/**
 * Отримує курс валюти з API НБУ за вказаною датою
 * @param currency - код валюти (USD, EUR)
 * @param date - дата у форматі YYYY-MM-DD
 * @returns Promise<ExchangeRateResult | null>
 */
export async function fetchNBUExchangeRate(
  currency: string,
  date: string
): Promise<ExchangeRateResult | null> {
  try {
    if (currency === "UAH") {
      return {
        rate: 1,
        date,
        currency: "UAH",
        currencyName: "Українська гривня",
      };
    }

    const formattedDate = date.replace(/-/g, "");
    const url = `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=${currency}&date=${formattedDate}&json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: NBURateResponse[] = await response.json();
    if (!data || data.length === 0) {
      return null;
    }

    const rateData = data[0];
    return {
      rate: rateData.rate,
      date: rateData.exchangedate,
      currency: rateData.cc,
      currencyName: rateData.txt,
    };
  } catch (error) {
    console.error("Failed to fetch NBU exchange rate:", error);
    throw error;
  }
}
