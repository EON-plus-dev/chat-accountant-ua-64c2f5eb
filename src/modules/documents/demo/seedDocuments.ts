import type { DocumentEntity } from "../types";

/**
 * Seed demo documents per cabinet. Minimal — UI works empty too;
 * these just illustrate the structure for review.
 */
export function seedDocumentsForCabinet(cabinetId: string): DocumentEntity[] {
  const now = new Date();
  const iso = (daysAgo: number) =>
    new Date(now.getTime() - daysAgo * 86_400_000).toISOString();

  // Common base — every cabinet gets a couple of items
  const base: DocumentEntity[] = [
    {
      id: `${cabinetId}-doc-contract-1`,
      cabinetId,
      kind: "contract",
      title: "Договір про надання послуг №2026/04-001",
      status: "signed",
      createdAt: iso(12),
      updatedAt: iso(3),
      ownerId: "owner",
      tags: ["клієнт", "послуги"],
      links: [],
      canonicalVersionId: "v1",
      versions: [
        {
          id: "v1",
          versionNumber: 1,
          uploadedAt: iso(12),
          uploadedBy: "owner",
          fileName: "contract-2026-04-001.pdf",
          fileSizeBytes: 184_320,
          mimeType: "application/pdf",
          signatures: [
            {
              id: "sig-1",
              provider: "kep",
              signerName: "Підписант (ДЕМО)",
              signedAt: iso(3),
              isDemo: true,
            },
          ],
        },
      ],
    },
    {
      id: `${cabinetId}-doc-act-1`,
      cabinetId,
      kind: "act",
      title: "Акт виконаних робіт за квітень 2026",
      status: "review",
      createdAt: iso(2),
      updatedAt: iso(1),
      ownerId: "owner",
      tags: ["акт", "квітень"],
      links: [],
      versions: [
        {
          id: "v1",
          versionNumber: 1,
          uploadedAt: iso(2),
          uploadedBy: "owner",
          fileName: "act-2026-04.pdf",
          fileSizeBytes: 92_160,
          mimeType: "application/pdf",
          signatures: [],
        },
      ],
    },
  ];

  return base;
}
