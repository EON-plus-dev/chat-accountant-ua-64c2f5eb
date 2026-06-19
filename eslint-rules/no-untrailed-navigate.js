/**
 * Кастомне ESLint-правило: попереджає про `navigate(...)` без `buildUrlWithTrail`
 * у файлах cabinets/analytics — щоб дотримати системне правило cross-entity navigation
 * (mem://navigation/cross-entity-navigation-rule-uk).
 *
 * Дозволено:
 *  - navigate(buildUrlWithTrail(...))
 *  - navigate(-1) / navigate(N)  — back/forward
 *  - navigate({ search: ... })   — in-place URL update
 *  - URL починається з whitelisted prefix (auth/checkout/onboarding) — це не cross-entity nav
 *
 * Також попереджає про прямий `window.history.back()` / `history.back()` у тих самих директоріях.
 */

const SCOPED_PATH_RE = /\/(components|pages)\/(cabinets|analytics)\//;
const WHITELIST_PREFIXES = [
  "/checkout",
  "/pricing",
  "/login",
  "/signup",
  "/auth",
  "/onboarding",
  "/add-cabinet",
  "/admin",
  "/user-settings",
];

function isWhitelistedLiteral(node) {
  if (node.type === "Literal" && typeof node.value === "string") {
    return WHITELIST_PREFIXES.some((p) => node.value === p || node.value.startsWith(p + "?") || node.value.startsWith(p + "/"));
  }
  if (node.type === "TemplateLiteral" && node.quasis.length > 0) {
    const head = node.quasis[0].value.cooked || "";
    return WHITELIST_PREFIXES.some((p) => head === p || head.startsWith(p + "?") || head.startsWith(p + "/"));
  }
  return false;
}

function isBuildUrlWithTrailCall(node) {
  return (
    node &&
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === "buildUrlWithTrail"
  );
}

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Cross-entity navigate() у cabinets/analytics має бути обгорнутий у buildUrlWithTrail (для повернення користувача в попередній контекст).",
    },
    schema: [],
    messages: {
      missingTrail:
        "navigate(...) у cabinets/analytics має бути обгорнутий у buildUrlWithTrail({ label, url }) — інакше користувач втратить контекст. Або використовуйте drill-stack push() для перегляду пов'язаних сутностей.",
      noHistoryBack:
        "Не використовуйте window.history.back() / history.back() — викликайте useBackTrail().goBack() для надійного повернення.",
    },
  },
  create(context) {
    const filename = context.getFilename();
    if (!SCOPED_PATH_RE.test(filename)) return {};

    return {
      CallExpression(node) {
        // window.history.back() / history.back()
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "back"
        ) {
          const obj = node.callee.object;
          // history.back()
          if (obj.type === "Identifier" && obj.name === "history") {
            context.report({ node, messageId: "noHistoryBack" });
            return;
          }
          // window.history.back()
          if (
            obj.type === "MemberExpression" &&
            obj.property.type === "Identifier" &&
            obj.property.name === "history"
          ) {
            context.report({ node, messageId: "noHistoryBack" });
            return;
          }
        }

        // navigate(arg) — лише якщо callee = identifier "navigate"
        if (node.callee.type !== "Identifier" || node.callee.name !== "navigate") return;
        if (node.arguments.length === 0) return;

        const arg = node.arguments[0];

        // Дозволені кейси
        if (arg.type === "UnaryExpression" || arg.type === "Literal" && typeof arg.value === "number") return;
        if (arg.type === "ObjectExpression") return; // navigate({ search: ... })
        if (isBuildUrlWithTrailCall(arg)) return;
        if (isWhitelistedLiteral(arg)) return;

        context.report({ node, messageId: "missingTrail" });
      },
    };
  },
};
