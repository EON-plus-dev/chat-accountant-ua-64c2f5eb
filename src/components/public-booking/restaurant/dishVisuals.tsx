/**
 * Візуальні та інформаційні допоміжники для віджета ресторану.
 *  - DISH_IMAGES — реальні фото для ~12 hero-страв.
 *  - CATEGORY_VISUAL — градієнт + емодзі-плейсхолдер для категорії.
 *  - enrichDish() — деривує інгредієнти / алергени / дієтичні теги / калорії /
 *    гостроту / модифікатори з категорії та назви страви, щоб 150 SKU виглядали
 *    осмислено без ручного редагування кожної позиції.
 */

import type { MenuItem, DietaryTag, MenuItemModifier } from "@/config/demoCabinets/restaurantData";

import imgBorsch from "@/assets/restaurant/dish-borsch.jpg";
import imgRibeye from "@/assets/restaurant/dish-ribeye.jpg";
import imgSalmon from "@/assets/restaurant/dish-salmon.jpg";
import imgTomYum from "@/assets/restaurant/dish-tomyum.jpg";
import imgTiramisu from "@/assets/restaurant/dish-tiramisu.jpg";
import imgMargherita from "@/assets/restaurant/dish-margherita.jpg";
import imgCarbonara from "@/assets/restaurant/dish-carbonara.jpg";
import imgTempura from "@/assets/restaurant/dish-tempura.jpg";
import imgTruffle from "@/assets/restaurant/dish-truffle.jpg";
import imgFondant from "@/assets/restaurant/dish-fondant.jpg";
import imgDuck from "@/assets/restaurant/dish-duck.jpg";
import imgTartar from "@/assets/restaurant/dish-tartar.jpg";
import imgCaesar from "@/assets/restaurant/dish-caesar.jpg";
import imgBrusketta from "@/assets/restaurant/dish-brusketta.jpg";

import zoneHall from "@/assets/restaurant/zone-hall.jpg";
import zoneTerrace from "@/assets/restaurant/zone-terrace.jpg";
import zoneVip from "@/assets/restaurant/zone-vip.jpg";

// ─────────────────────────────────────────────────────────
// Зони

export const ZONE_IMAGES = {
  hall: zoneHall,
  terrace: zoneTerrace,
  vip: zoneVip,
} as const;

// ─────────────────────────────────────────────────────────
// Фото страв (id → asset)

export const DISH_IMAGES: Record<string, string> = {
  "rm-sp-01": imgBorsch,
  "rm-sp-03": imgTomYum,
  "rm-st-01": imgBrusketta,
  "rm-st-05": imgTempura,
  "rm-st-03": imgTartar,
  "rm-sa-01": imgCaesar,
  "rm-mn-04": imgSalmon,
  "rm-mn-03": imgDuck,
  "rm-gr-01": imgRibeye,
  "rm-pa-01": imgCarbonara,
  "rm-pa-08": imgTruffle,
  "rm-pz-01": imgMargherita,
  "rm-ds-01": imgTiramisu,
  "rm-ds-03": imgFondant,
};

// ─────────────────────────────────────────────────────────
// Категорія → візуальний токен (градієнт + емодзі-плейсхолдер)

type CatKey = MenuItem["category"];

export const CATEGORY_VISUAL: Record<CatKey, { emoji: string; gradient: string; label: string }> = {
  starters:  { emoji: "🥗", gradient: "linear-gradient(135deg, hsl(35 70% 60%), hsl(25 70% 45%))",  label: "Закуски" },
  soups:     { emoji: "🍲", gradient: "linear-gradient(135deg, hsl(15 75% 55%), hsl(5 65% 40%))",   label: "Супи" },
  salads:    { emoji: "🥬", gradient: "linear-gradient(135deg, hsl(95 55% 55%), hsl(110 50% 38%))", label: "Салати" },
  mains:     { emoji: "🍽", gradient: "linear-gradient(135deg, hsl(25 60% 45%), hsl(15 55% 30%))",  label: "Гарячі страви" },
  grill:     { emoji: "🥩", gradient: "linear-gradient(135deg, hsl(8 70% 45%), hsl(0 65% 28%))",    label: "Гриль" },
  pasta:     { emoji: "🍝", gradient: "linear-gradient(135deg, hsl(40 75% 60%), hsl(28 65% 45%))",  label: "Паста" },
  pizza:     { emoji: "🍕", gradient: "linear-gradient(135deg, hsl(18 80% 55%), hsl(5 70% 40%))",   label: "Піца" },
  sides:     { emoji: "🥔", gradient: "linear-gradient(135deg, hsl(45 60% 60%), hsl(35 55% 45%))",  label: "Гарніри" },
  desserts:  { emoji: "🍰", gradient: "linear-gradient(135deg, hsl(330 60% 70%), hsl(310 50% 50%))",label: "Десерти" },
  kids:      { emoji: "🧒", gradient: "linear-gradient(135deg, hsl(195 70% 65%), hsl(210 60% 50%))",label: "Дитяче" },
  drinks:    { emoji: "🥤", gradient: "linear-gradient(135deg, hsl(200 70% 60%), hsl(220 60% 45%))",label: "Напої" },
  cocktails: { emoji: "🍸", gradient: "linear-gradient(135deg, hsl(280 60% 60%), hsl(260 55% 40%))",label: "Коктейлі" },
  wine:      { emoji: "🍷", gradient: "linear-gradient(135deg, hsl(345 55% 45%), hsl(355 60% 28%))",label: "Вино" },
  beer:      { emoji: "🍺", gradient: "linear-gradient(135deg, hsl(40 80% 55%), hsl(30 70% 40%))",  label: "Пиво" },
};

// ─────────────────────────────────────────────────────────
// Дієтичні теги UI

export const DIETARY_META: Record<DietaryTag, { label: string; emoji: string; color: string }> = {
  vegan:        { label: "Веганське",   emoji: "🌱", color: "hsl(140 50% 40%)" },
  vegetarian:   { label: "Вегетаріанське", emoji: "🥬", color: "hsl(100 45% 40%)" },
  gluten_free:  { label: "Без глютену", emoji: "🌾", color: "hsl(35 75% 45%)" },
  lactose_free: { label: "Без лактози", emoji: "🥛", color: "hsl(210 50% 45%)" },
  halal:        { label: "Халяль",      emoji: "☪",  color: "hsl(150 50% 40%)" },
  low_carb:     { label: "Низьковуглеводне", emoji: "⚡", color: "hsl(280 45% 50%)" },
  high_protein: { label: "Багато білка", emoji: "💪", color: "hsl(20 60% 45%)" },
};

// ─────────────────────────────────────────────────────────
// Алергени UI

export const ALLERGEN_META: Record<string, { emoji: string; label: string }> = {
  глютен:       { emoji: "🌾", label: "Глютен" },
  лактоза:      { emoji: "🥛", label: "Лактоза" },
  яйце:         { emoji: "🥚", label: "Яйце" },
  риба:         { emoji: "🐟", label: "Риба" },
  морепродукти: { emoji: "🦐", label: "Морепродукти" },
  горіхи:       { emoji: "🥜", label: "Горіхи" },
  соя:          { emoji: "🫘", label: "Соя" },
  селера:       { emoji: "🌿", label: "Селера" },
  гірчиця:      { emoji: "🌶", label: "Гірчиця" },
  алкоголь:     { emoji: "🍷", label: "Алкоголь" },
};

// ─────────────────────────────────────────────────────────
// Деривація на основі категорії

const CAT_BASE_ALLERGENS: Record<CatKey, string[]> = {
  starters:  ["глютен", "лактоза"],
  soups:     ["селера"],
  salads:    ["лактоза"],
  mains:     [],
  grill:     [],
  pasta:     ["глютен", "лактоза", "яйце"],
  pizza:     ["глютен", "лактоза"],
  sides:     [],
  desserts:  ["глютен", "лактоза", "яйце"],
  kids:      ["глютен", "лактоза"],
  drinks:    [],
  cocktails: ["алкоголь"],
  wine:      ["алкоголь"],
  beer:      ["глютен", "алкоголь"],
};

const CAT_BASE_INGREDIENTS: Record<CatKey, string[]> = {
  starters:  ["сезонні овочі", "оливкова олія", "морська сіль"],
  soups:     ["овочевий бульйон", "пасеровані овочі", "зелень"],
  salads:    ["мікс-салат", "оливкова олія", "лимонний фреш"],
  mains:     ["мариноване м'ясо", "вершкове масло", "пряні трави"],
  grill:     ["м'ясо преміум", "розмарин", "морська сіль", "перець"],
  pasta:     ["паста дурум", "пармезан", "оливкова олія", "часник"],
  pizza:     ["неаполітанське тісто 24 год", "томатний соус Сан-Марцано", "оливкова олія"],
  sides:     ["сезонні овочі", "оливкова олія"],
  desserts:  ["вершкове масло", "цукор", "ваніль"],
  kids:      ["дитячі порції", "м'які спеції"],
  drinks:    ["охолоджена вода", "лід"],
  cocktails: ["лід", "лимонний фреш"],
  wine:      [],
  beer:      [],
};

function deriveAllergens(item: MenuItem): string[] {
  const set = new Set<string>(item.allergens ?? CAT_BASE_ALLERGENS[item.category] ?? []);
  const n = item.name.toLowerCase();
  if (/лосос|тунц|дорадо|сібас|стерлядь|оселед/.test(n)) set.add("риба");
  if (/креветк|мідії|морепродукт|восьминог/.test(n)) set.add("морепродукти");
  if (/арахіс|горіх|пекан|мигдал|фундук/.test(n)) set.add("горіхи");
  if (/соєв|соя|тофу/.test(n)) set.add("соя");
  if (/гірчиц/.test(n)) set.add("гірчиця");
  if (/сир|сметан|вершк|молоч|моцарел|пармез/.test(n)) set.add("лактоза");
  if (/тісто|хліб|паста|спагет|лазан|піца|пельмен|варен|млинц/.test(n)) set.add("глютен");
  if (/яйц|майонез|тірамісу|карбонара|омлет/.test(n)) set.add("яйце");
  return Array.from(set);
}

function deriveDietary(item: MenuItem): DietaryTag[] {
  const tags = new Set<DietaryTag>();
  const n = item.name.toLowerCase();
  const noMeatHints = /(веган|кіноа|овоч|грибн|шпинат|капрезе|маргарит|4 сири|гарбуз|вареники з вишн|варен.+картопл)/i;
  const hasMeat = /(курк|телятин|свинин|качк|кролик|індич|стейк|шашлик|кебаб|беф|карбонар|болонь|пеперон|шинк|бекон|сал[ао]|оселед|тунц|лосос|сібас|дорадо|креветк|стерлядь|шпрот|пресс|шин.|м.яса)/i.test(n);
  const hasFish = /(лосос|тунц|сібас|дорадо|креветк|стерлядь|оселед|риба|шпрот)/i.test(n);
  if (noMeatHints.test(n) && !hasMeat && !hasFish) {
    tags.add("vegetarian");
    if (/веган/.test(n)) tags.add("vegan");
  }
  if (/(стейк|філе|грудк|качк|тартар|лосос|тунц|кебаб|шашлик)/i.test(n)) tags.add("high_protein");
  if (/(салат|боул|кіноа|карпачо|севіче|тартар)/i.test(n)) tags.add("low_carb");
  if (/(халяль)/i.test(n)) tags.add("halal");
  // На основі категорії
  if (item.category === "wine" || item.category === "beer" || item.category === "cocktails") {
    // нічого
  }
  return Array.from(tags);
}

function deriveSpicy(item: MenuItem): 0 | 1 | 2 | 3 {
  const n = item.name.toLowerCase();
  if (/том-ям|том ям|чилі|карі|халапень/.test(n)) return 2;
  if (/(перц|пряний|гострий|кебаб|тайськ|кавказьк)/.test(n)) return 1;
  return 0;
}

function deriveCalories(item: MenuItem): number {
  const base = item.weight ?? 220;
  // Орієнтовно за категорією
  const perGram: Record<CatKey, number> = {
    starters: 1.8, soups: 0.6, salads: 1.1, mains: 1.9, grill: 2.4,
    pasta: 1.9, pizza: 2.4, sides: 1.3, desserts: 3.0, kids: 1.6,
    drinks: 0.3, cocktails: 1.8, wine: 0.7, beer: 0.4,
  };
  return Math.round((base * (perGram[item.category] ?? 1.5)) / 10) * 10;
}

function deriveModifiers(item: MenuItem): MenuItemModifier[] | undefined {
  const n = item.name.toLowerCase();
  const mods: MenuItemModifier[] = [];

  if (item.category === "grill" && /стейк/.test(n)) {
    mods.push({
      id: "doneness",
      label: "Прожарка",
      required: true,
      options: [
        { id: "rare", label: "Rare · з кров'ю" },
        { id: "mr", label: "Medium Rare · з рожевим соком" },
        { id: "m", label: "Medium · середня" },
        { id: "mw", label: "Medium Well · майже прожарений" },
        { id: "wd", label: "Well Done · повна прожарка" },
      ],
    });
    mods.push({
      id: "sauce-steak",
      label: "Соус (опційно)",
      options: [
        { id: "demi", label: "Демі-гляс", priceDelta: 60 },
        { id: "pepper", label: "Перцевий", priceDelta: 60 },
        { id: "blue", label: "Блю-чіз", priceDelta: 80 },
        { id: "chimi", label: "Чимічурі", priceDelta: 60 },
      ],
    });
  }
  if (item.category === "pizza") {
    mods.push({
      id: "size",
      label: "Розмір",
      required: true,
      options: [
        { id: "m", label: "Середня · 32 см" },
        { id: "l", label: "Велика · 40 см", priceDelta: 120 },
      ],
    });
    mods.push({
      id: "extras",
      label: "Додатково (опційно)",
      multi: true,
      options: [
        { id: "extra-cheese", label: "Додатковий сир", priceDelta: 60 },
        { id: "extra-meat", label: "Подвійне м'ясо", priceDelta: 90 },
        { id: "gluten-free", label: "Без-глютенове тісто", priceDelta: 80 },
      ],
    });
  }
  if (item.category === "pasta") {
    mods.push({
      id: "pasta-base",
      label: "Тип пасти",
      required: true,
      options: [
        { id: "spag", label: "Спагетті" },
        { id: "fett", label: "Феттучіні" },
        { id: "penne", label: "Пенне" },
        { id: "gf", label: "Безглютенова", priceDelta: 60 },
      ],
    });
  }
  if (item.category === "drinks" && /кава|еспресо|капучіно|латте|американо|флет/i.test(n)) {
    mods.push({
      id: "milk",
      label: "Молоко",
      options: [
        { id: "regular", label: "Звичайне" },
        { id: "lactose-free", label: "Без лактози", priceDelta: 15 },
        { id: "oat", label: "Вівсяне", priceDelta: 20 },
        { id: "almond", label: "Мигдалеве", priceDelta: 25 },
      ],
    });
    mods.push({
      id: "size-coffee",
      label: "Розмір",
      options: [
        { id: "s", label: "Маленька" },
        { id: "m", label: "Середня", priceDelta: 15 },
        { id: "l", label: "Велика", priceDelta: 30 },
      ],
    });
  }

  return mods.length > 0 ? mods : undefined;
}

function deriveIngredients(item: MenuItem): string[] {
  if (item.ingredients?.length) return item.ingredients;
  // Витягуємо з опису, якщо там перерахування через кому
  if (item.description && /,/.test(item.description)) {
    const parts = item.description.split(/[,·;]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) return parts.slice(0, 8);
  }
  return CAT_BASE_INGREDIENTS[item.category] ?? [];
}

// ─────────────────────────────────────────────────────────
// Хіти / вибір шефа

const CHEF_PICK_IDS = new Set([
  "rm-sp-01", "rm-sp-03", "rm-mn-04", "rm-mn-03", "rm-gr-01",
  "rm-pa-08", "rm-pz-01", "rm-ds-01", "rm-ds-03", "rm-st-03",
]);
const POPULAR_IDS = new Set([
  "rm-st-01", "rm-st-05", "rm-sa-01", "rm-pa-01", "rm-pz-02",
  "rm-mn-02", "rm-gr-05", "rm-ds-05", "rm-sd-01",
]);

export interface EnrichedMenuItem extends MenuItem {
  imageUrl?: string;
  ingredients: string[];
  allergens: string[];
  dietary: DietaryTag[];
  spicy: 0 | 1 | 2 | 3;
  calories: number;
  chefPick: boolean;
  popular: boolean;
  modifiers?: MenuItemModifier[];
}

export function enrichDish(item: MenuItem): EnrichedMenuItem {
  return {
    ...item,
    imageUrl: DISH_IMAGES[item.id],
    ingredients: deriveIngredients(item),
    allergens: deriveAllergens(item),
    dietary: deriveDietary(item),
    spicy: item.spicy ?? deriveSpicy(item),
    calories: item.calories ?? deriveCalories(item),
    chefPick: item.chefPick ?? CHEF_PICK_IDS.has(item.id) ?? false,
    popular: item.popular ?? POPULAR_IDS.has(item.id) ?? false,
    modifiers: item.modifiers ?? deriveModifiers(item),
  };
}

export function enrichMenu(items: MenuItem[]): EnrichedMenuItem[] {
  return items.map(enrichDish);
}

// ─────────────────────────────────────────────────────────
// Inline-плейсхолдер для страв без фото

export function DishVisual({
  item,
  className,
}: {
  item: EnrichedMenuItem;
  className?: string;
}) {
  if (item.imageUrl) {
    return (
      <img
        src={item.imageUrl}
        alt={item.name}
        loading="lazy"
        width={400}
        height={400}
        className={className}
      />
    );
  }
  const vis = CATEGORY_VISUAL[item.category];
  return (
    <div
      className={className}
      style={{
        background: vis.gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.95)",
        fontSize: "2.2em",
        textShadow: "0 2px 6px rgba(0,0,0,0.25)",
      }}
      aria-label={item.name}
    >
      <span>{vis.emoji}</span>
    </div>
  );
}
