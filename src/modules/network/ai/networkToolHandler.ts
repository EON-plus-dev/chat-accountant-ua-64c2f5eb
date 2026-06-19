/**
 * Network tool handler — frontend-side executor для L3 (Cabinet Network Protocol)
 * tool_calls, що повертає `cabinet-chat` edge.
 *
 * MVP: працює поверх mock-даних `useMyPlaces` / `useSubscribedSuppliers`.
 * У реалі замінити на supabase-запити до `catalog_publications` /
 * `catalog_subscriptions` з RLS поточного користувача.
 *
 * Кожен handler повертає компактний JSON, який ChatOrchestrator вкладає
 * назад у наступний LLM-prompt як `tool` message (function-result).
 */
import {
  MOCK_CATALOG_PUBLICATIONS,
  MOCK_CATALOG_SUBSCRIPTIONS,
  DEMO_INDIVIDUAL_USER_ID,
} from "../data/mockNetworkData";

export type NetworkToolName =
  | "list_my_places"
  | "get_place_catalog"
  | "book_at_place"
  | "reorder_last"
  | "list_subscribed_suppliers"
  | "get_supplier_catalog"
  | "create_purchase_order";

export const NETWORK_TOOL_NAMES: ReadonlySet<NetworkToolName> = new Set([
  "list_my_places",
  "get_place_catalog",
  "book_at_place",
  "reorder_last",
  "list_subscribed_suppliers",
  "get_supplier_catalog",
  "create_purchase_order",
]);

export interface NetworkToolContext {
  /** Поточний кабінет, від імені якого виконується чат. */
  cabinetId: string;
  /** Для individual-кабінетів — userId фізособи. */
  userId?: string;
}

export interface NetworkToolResult {
  ok: boolean;
  data?: unknown;
  message?: string;
}

export function executeNetworkTool(
  name: string,
  args: Record<string, unknown>,
  ctx: NetworkToolContext,
): NetworkToolResult | null {
  if (!NETWORK_TOOL_NAMES.has(name as NetworkToolName)) return null;

  switch (name as NetworkToolName) {
    case "list_my_places":
      return listMyPlaces(args, ctx);
    case "get_place_catalog":
      return getPlaceCatalog(args);
    case "book_at_place":
      return bookAtPlace(args);
    case "reorder_last":
      return reorderLast(args);
    case "list_subscribed_suppliers":
      return listSubscribedSuppliers(args, ctx);
    case "get_supplier_catalog":
      return getSupplierCatalog(args);
    case "create_purchase_order":
      return createPurchaseOrder(args);
    default:
      return null;
  }
}

// ── handlers ────────────────────────────────────────────────────

function listMyPlaces(args: Record<string, unknown>, ctx: NetworkToolContext) {
  const userId = ctx.userId ?? DEMO_INDIVIDUAL_USER_ID;
  const category = (args.categoryKey as string | undefined)?.toLowerCase();
  const subs = MOCK_CATALOG_SUBSCRIPTIONS.filter(
    (s) => s.subscriberUserId === userId && s.status === "active",
  );
  const items = subs
    .map((sub) => {
      const pub = MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === sub.publicationId);
      if (!pub) return null;
      if (category && pub.categoryKey !== category) return null;
      return {
        placeId: sub.id,
        name: pub.displayName,
        category: pub.categoryKey,
        slug: pub.slug,
        upcoming: sub.stats?.upcomingBookingAt
          ? { at: sub.stats.upcomingBookingAt, label: sub.stats.upcomingBookingLabel }
          : null,
        lastVisitAt: sub.stats?.lastVisitAt ?? null,
        totalOrders: sub.stats?.totalOrders ?? 0,
      };
    })
    .filter(Boolean);
  return { ok: true, data: { count: items.length, items } };
}

function getPlaceCatalog(args: Record<string, unknown>) {
  const placeId = String(args.placeId ?? "");
  const sub = MOCK_CATALOG_SUBSCRIPTIONS.find(
    (s) => s.id === placeId || s.publicationId === placeId,
  );
  const pub = sub
    ? MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === sub.publicationId)
    : MOCK_CATALOG_PUBLICATIONS.find((p) => p.slug === placeId);
  if (!pub) return { ok: false, message: "Заклад не знайдено серед підписок" };
  // Мок-каталог: 3-5 типових позицій залежно від категорії
  const catalog = mockCatalogFor(pub.categoryKey);
  return {
    ok: true,
    data: {
      place: { name: pub.displayName, slug: pub.slug, category: pub.categoryKey },
      items: catalog,
    },
  };
}

function bookAtPlace(args: Record<string, unknown>) {
  return {
    ok: true,
    data: {
      draftId: `draft-${Date.now()}`,
      status: "pending_confirmation",
      placeId: args.placeId,
      serviceCode: args.serviceCode ?? null,
      when: args.when ?? null,
      message:
        "Чернетку бронювання створено. Користувач має підтвердити час та послугу.",
    },
  };
}

function reorderLast(args: Record<string, unknown>) {
  const sub = MOCK_CATALOG_SUBSCRIPTIONS.find((s) => s.id === args.placeId);
  if (!sub) return { ok: false, message: "Підписку не знайдено" };
  return {
    ok: true,
    data: {
      draftId: `reorder-${Date.now()}`,
      basedOn: sub.stats?.upcomingBookingLabel ?? "попередній візит",
    },
  };
}

function listSubscribedSuppliers(_args: Record<string, unknown>, ctx: NetworkToolContext) {
  const subs = MOCK_CATALOG_SUBSCRIPTIONS.filter(
    (s) => s.subscriberCabinetId === ctx.cabinetId && s.status === "active",
  );
  const items = subs
    .map((sub) => {
      const pub = MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === sub.publicationId);
      if (!pub || pub.kind !== "b2b_supplier") return null;
      return {
        supplierId: sub.id,
        name: pub.displayName,
        category: pub.categoryKey,
        pricesTier: sub.scope.pricesTier,
        totalOrders: sub.stats?.totalOrders ?? 0,
      };
    })
    .filter(Boolean);
  return { ok: true, data: { count: items.length, items } };
}

function getSupplierCatalog(args: Record<string, unknown>) {
  const sub = MOCK_CATALOG_SUBSCRIPTIONS.find((s) => s.id === args.supplierId);
  const pub = sub
    ? MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === sub.publicationId)
    : undefined;
  if (!pub) return { ok: false, message: "Постачальника не знайдено серед підписок" };
  return {
    ok: true,
    data: {
      supplier: { name: pub.displayName, slug: pub.slug },
      pricesTier: sub?.scope.pricesTier ?? "default",
      items: mockSupplierCatalog(pub.slug, String(args.search ?? "")),
    },
  };
}

function createPurchaseOrder(args: Record<string, unknown>) {
  const lines = Array.isArray(args.lines) ? args.lines : [];
  return {
    ok: true,
    data: {
      draftId: `po-${Date.now()}`,
      status: "draft",
      supplierId: args.supplierId,
      lineCount: lines.length,
      message:
        "Чернетку закупівельного замовлення створено в розділі Закупки. Потрібне підтвердження.",
    },
  };
}

// ── tiny mock catalogs ──────────────────────────────────────────

function mockCatalogFor(category: string) {
  switch (category) {
    case "salon":
      return [
        { code: "haircut-w", name: "Жіноча стрижка", priceUah: 600 },
        { code: "color", name: "Фарбування", priceUah: 2400 },
        { code: "manicure", name: "Манікюр + покриття", priceUah: 800 },
      ];
    case "tennis_club":
      return [
        { code: "court-1h", name: "Корт 1 година (вечір)", priceUah: 700 },
        { code: "coach-1h", name: "Заняття з тренером", priceUah: 1200 },
        { code: "balls-can", name: "Банка мʼячів (3 шт)", priceUah: 320 },
      ];
    case "hotel":
      return [
        { code: "std-1n", name: "Standard, 1 ніч", priceUah: 1800 },
        { code: "fam-1n", name: "Family, 1 ніч", priceUah: 2800 },
        { code: "breakfast", name: "Сніданок", priceUah: 350 },
      ];
    default:
      return [];
  }
}

function mockSupplierCatalog(slug: string, search: string) {
  const all = {
    "beauty-pro-distribution": [
      { sku: "L-PRF-450", name: "L'Oréal Professionnel шампунь 450мл", priceUah: 520 },
      { sku: "OLA-CRM-100", name: "Olaplex №3 100мл", priceUah: 1280 },
      { sku: "WLL-OXI-1L", name: "Wella окислювач 6%, 1л", priceUah: 280 },
    ],
    "court-gear-ua": [
      { sku: "BALL-WIL-3", name: "Wilson US Open 3 мʼячі", priceUah: 240 },
      { sku: "STR-LXN-12", name: "Luxilon ALU Power 1.25 (12м)", priceUah: 420 },
      { sku: "GRP-OVR-50", name: "Овергрип Tourna 50шт", priceUah: 1800 },
    ],
    "horeca-supply": [
      { sku: "TWL-W-50", name: "Махровий рушник білий, 50×100", priceUah: 180 },
      { sku: "AMN-SHM-30", name: "Амініті шампунь 30мл (200шт)", priceUah: 1100 },
      { sku: "BED-WHT-K", name: "Простирадло біле king-size", priceUah: 620 },
    ],
  } as Record<string, { sku: string; name: string; priceUah: number }[]>;
  const items = all[slug] ?? [];
  if (!search) return items;
  const q = search.toLowerCase();
  return items.filter(
    (i) => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q),
  );
}
