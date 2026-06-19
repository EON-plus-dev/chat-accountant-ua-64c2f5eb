// Type-only module: tab identifiers used across CMS workspace.
// 6-tab architecture: Огляд / Карта / Редактор / Аналітика / Календар / Налашт.
export type CmsWorkspaceTab =
  | "dashboard"
  | "sitemap"
  | "preview"
  | "analytics"
  | "calendar"
  | "settings";

// Preview tab sub-modes. "Редагувати" поглинула колишній "ideas" режим.
export type PreviewMode = "page" | "edit" | "seo" | "analytics";
