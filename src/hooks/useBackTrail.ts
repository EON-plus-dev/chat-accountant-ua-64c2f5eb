/**
 * useBackTrail — хук для типу 3 крос-сутністної навігації (повна сторінка).
 *
 * Коли користувач явно «Відкриває повну сторінку» з drill-view (або з картки
 * в листі/email), цільова сторінка має показати тонку смужку зверху
 * «← Повернутись до: <label>», що повертає його туди, звідки прийшов.
 *
 * Кодуємо trail у query-параметр `?from=<base64(label|url)>` —
 * це робить його shareable + переживає refresh.
 *
 * Див. mem://navigation/cross-entity-navigation-rule-uk.
 */

import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const QUERY_KEY = "from";

interface BackTrail {
  label: string;
  url: string;
}

/** Безпечне base64 для UTF-8 (label може містити кирилицю). */
function encodeTrail(trail: BackTrail): string {
  const json = JSON.stringify(trail);
  // btoa не працює з UTF-8 напряму — кодуємо через encodeURIComponent.
  return btoa(unescape(encodeURIComponent(json)));
}

function decodeTrail(raw: string): BackTrail | null {
  try {
    const json = decodeURIComponent(escape(atob(raw)));
    const obj = JSON.parse(json);
    if (typeof obj?.label === "string" && typeof obj?.url === "string") {
      return obj as BackTrail;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Будує URL для переходу на повну сторінку зі збереженням back-trail.
 * Використовується усередині drill-view-кнопок «Відкрити повну сторінку».
 */
export function buildUrlWithTrail(targetUrl: string, trail: BackTrail): string {
  const sep = targetUrl.includes("?") ? "&" : "?";
  return `${targetUrl}${sep}${QUERY_KEY}=${encodeURIComponent(encodeTrail(trail))}`;
}

export interface UseBackTrailResult {
  /** Декодований trail з URL або null */
  trail: BackTrail | null;
  /** Повертає користувача за trail.url. Fallback — navigate(-1). */
  goBack: () => void;
}

export function useBackTrail(): UseBackTrailResult {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const raw = searchParams.get(QUERY_KEY);
  const trail = useMemo(() => (raw ? decodeTrail(raw) : null), [raw]);

  const goBack = useCallback(() => {
    if (trail?.url) {
      navigate(trail.url);
    } else {
      navigate(-1);
    }
  }, [trail, navigate]);

  return { trail, goBack };
}
