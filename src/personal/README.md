# Personal namespace

`src/personal/` — top-level паралель до `src/core/` (Vertical Packs для бізнесу)
та `src/modules/` (horizontal shared modules).

## Принцип

Personal Core ≠ редукція Business Core. Це окрема ментальна модель:

| Виміри | Business | Personal |
|---|---|---|
| Фокус | гроші | час |
| Одиниця | компанія | дім |
| Колектив | команда | родина |
| Облік | обовʼязок | контроль |

## Структура

```
src/personal/
├── composition.ts        # PersonalPack — контракт sidebar/sections (аналог VerticalPack)
├── index.ts              # public API
├── finance/              # обгортка над Income Book + cash flows для individual
├── shopping/             # покупки/чеки/гарантії
├── loyalty/              # карти лояльності
├── savings/              # цілі накопичення (поверх useFinancialGoals)
├── property/             # житло/авто/майно
├── taxes/                # ПДФО, декларація, tax-discount wizard
├── documents/            # підключення Document Hub (kind: personal)
├── lifeGoals/            # довгострокові цілі
└── assistant/            # personal AI consierge (поверх Shared AI Layer)
```

## Інтеграція

- `userType: "individual"` → loader підбирає `PersonalPack`
- `userType: "business" | "fop"` → `VerticalPack` з `@/core/`
- `MeOverview`, `PersonalHub` рендерять sections з `getPersonalPack().sections`
- Жодне існуюче бізнесове правило не торкається — `src/core/` залишається власником вертикалей

## Migration plan (фази)

1. **Фаза 0 (поточна)** — створено `composition.ts`, namespace доступний.
2. **Фаза 1** — `MeOverview.tsx` рендерить sidebar з PersonalPack замість хардкоду.
3. **Фаза 2** — `finance/`, `shopping/`, `taxes/`, `documents/` — re-export існуючих hooks/components.
4. **Фаза 3** — нові підрозділи (`loyalty/`, `lifeGoals/`, `assistant/`) — окремі епіки.
