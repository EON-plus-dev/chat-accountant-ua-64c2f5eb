/**
 * useApprovalsStore — pending approval requests for documents.
 * Logical owner: Workflow Engine (Epic 3). Lives here as a thin store
 * so Document Hub can ship before Workflow consolidation completes.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApprovalRequest, ApprovalStatus } from "../types";

const KEY = (cabinetId: string) => `document-approvals-${cabinetId}`;
const EVENT = "document-approvals-updated";

interface State {
  items: ApprovalRequest[];
}

function readState(cabinetId: string): State {
  try {
    const raw = localStorage.getItem(KEY(cabinetId));
    if (!raw) return { items: [] };
    const p = JSON.parse(raw);
    return { items: Array.isArray(p.items) ? p.items : [] };
  } catch {
    return { items: [] };
  }
}

function writeState(cabinetId: string, state: State) {
  try {
    localStorage.setItem(KEY(cabinetId), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { cabinetId } }));
  } catch {/* ignore */}
}

export function createApprovalRequest(cabinetId: string, req: ApprovalRequest) {
  const s = readState(cabinetId);
  s.items = [req, ...s.items];
  writeState(cabinetId, s);
}

export function decideApprovalStep(
  cabinetId: string,
  requestId: string,
  stepId: string,
  decision: "approved" | "rejected",
  comment?: string,
) {
  const s = readState(cabinetId);
  const req = s.items.find((r) => r.id === requestId);
  if (!req) return;
  const step = req.steps.find((st) => st.id === stepId);
  if (!step) return;
  step.status = decision;
  step.decidedAt = new Date().toISOString();
  step.comment = comment;

  // Compute aggregate status
  if (req.routeKind === "all_sequential") {
    if (req.steps.some((st) => st.status === "rejected")) req.status = "rejected";
    else if (req.steps.every((st) => st.status === "approved")) req.status = "approved";
    else req.status = "in_review";
  } else {
    if (req.steps.some((st) => st.status === "approved")) req.status = "approved";
    else if (req.steps.every((st) => st.status === "rejected")) req.status = "rejected";
    else req.status = "in_review";
  }
  writeState(cabinetId, s);
}

export function useApprovals(cabinetId: string, status?: ApprovalStatus) {
  const [state, setState] = useState<State>(() => readState(cabinetId));

  useEffect(() => {
    setState(readState(cabinetId));
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d || d.cabinetId === cabinetId) setState(readState(cabinetId));
    };
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, [cabinetId]);

  const list = useMemo(() => {
    return status ? state.items.filter((r) => r.status === status) : state.items;
  }, [state, status]);

  const byDocumentId = useCallback(
    (documentId: string) => state.items.filter((r) => r.documentId === documentId),
    [state],
  );

  return { list, byDocumentId };
}
