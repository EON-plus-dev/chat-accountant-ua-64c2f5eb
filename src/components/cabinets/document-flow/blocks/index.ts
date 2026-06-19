export { DocumentPreviewBlock } from "./DocumentPreviewBlock";
export { DocumentAIBlock } from "./DocumentAIBlock";
export { DocumentHistoryBlock } from "./DocumentHistoryBlock";
export { DocumentActionsBlock } from "./DocumentActionsBlock";

// Overview blocks (Step 3) - restructured
// DocumentPassportBlock removed — stepper merged into OverviewPassportBlock
export { DocumentAICommandCenter } from "./DocumentAICommandCenter";
export { LegalSignaturesBlock } from "./LegalSignaturesBlock";

// @deprecated Use DocumentAICommandCenter instead
export { OverviewTasksBlock } from "./OverviewTasksBlock";
// @deprecated Use DocumentAICommandCenter instead
export { OverviewRisksBlock } from "./OverviewRisksBlock";

// Legacy blocks (kept for compatibility)
export { OverviewAISummaryBlock } from "./OverviewAISummaryBlock";
export { OverviewPassportBlock } from "./OverviewPassportBlock";
export { OverviewPartiesAccessBlock } from "./OverviewPartiesAccessBlock";
export { OverviewStatusCardsBlock } from "./OverviewStatusCardsBlock";
export { OverviewQuickActionsBlock } from "./OverviewQuickActionsBlock";

// Integration blocks (Step 5) - NEW 6-block structure
export { IntegrationDocumentOriginBlock } from "./IntegrationDocumentOriginBlock";
export { IntegrationExternalSystemsBlock } from "./IntegrationExternalSystemsBlock";
export { IntegrationDocumentLinksBlock } from "./IntegrationDocumentLinksBlock";
export { IntegrationInternalLinksBlock } from "./IntegrationInternalLinksBlock";
export { IntegrationAutomationBlock } from "./IntegrationAutomationBlock";
export { IntegrationTechnicalBlock } from "./IntegrationTechnicalBlock";

// Legacy integration blocks (kept for compatibility)
export { IntegrationSourceBlock } from "./IntegrationSourceBlock";
export { IntegrationRelationsBlock } from "./IntegrationRelationsBlock";
export { IntegrationPackagesBlock } from "./IntegrationPackagesBlock";

// History blocks (Step 6)
export { HistoryTimelineBlock } from "./HistoryTimelineBlock";
export { HistoryVersionsBlock } from "./HistoryVersionsBlock";
export { HistorySignaturesBlock } from "./HistorySignaturesBlock";
export { HistoryRetentionBlock } from "./HistoryRetentionBlock";

// Template Overview blocks
export { TemplateQuickActionsBlock } from "./TemplateQuickActionsBlock";
export { TemplatePassportBlock } from "./TemplatePassportBlock";
export { FieldCoverageWidget } from "./FieldCoverageWidget";
