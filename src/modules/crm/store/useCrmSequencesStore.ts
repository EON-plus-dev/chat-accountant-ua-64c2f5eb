/**
 * useCrmSequencesStore — реєстр enrollment'ів (deal × sequence) з
 * localStorage-персистенцією per cabinetId.
 *
 * Cabinet-agnostic: бере у власність лише enrollment-state; самі шаблони
 * приходять із `sequenceTemplates.ts`. Створення задач за крок — через bridge
 * (викликається з UI).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CrmSequenceEnrollment, CrmEnrollmentStatus } from "../types";

interface Options {
  cabinetId: string;
  persist?: boolean;
}

interface PersistedShape {
  v: 1;
  enrollments: CrmSequenceEnrollment[];
}

const KEY_PREFIX = "crm-sequences-v1-";

function loadFromStorage(key: string): PersistedShape | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedShape;
    return parsed?.v === 1 && Array.isArray(parsed.enrollments) ? parsed : null;
  } catch {
    return null;
  }
}

export function useCrmSequencesStore({ cabinetId, persist = true }: Options) {
  const storageKey = `${KEY_PREFIX}${cabinetId}`;

  const [enrollments, setEnrollments] = useState<CrmSequenceEnrollment[]>(() => {
    if (!persist) return [];
    return loadFromStorage(storageKey)?.enrollments ?? [];
  });

  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ v: 1, enrollments } satisfies PersistedShape));
    } catch { /* ignore */ }
  }, [enrollments, storageKey, persist]);

  const byDeal = useMemo(() => {
    const map = new Map<string, CrmSequenceEnrollment[]>();
    for (const e of enrollments) {
      const arr = map.get(e.dealId) ?? [];
      arr.push(e);
      map.set(e.dealId, arr);
    }
    return map;
  }, [enrollments]);

  const getEnrollments = useCallback(
    (dealId: string) => byDeal.get(dealId) ?? [],
    [byDeal],
  );

  const enroll = useCallback((dealId: string, sequenceId: string): CrmSequenceEnrollment => {
    const enrollment: CrmSequenceEnrollment = {
      id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dealId,
      sequenceId,
      enrolledAt: new Date().toISOString(),
      status: "active",
      currentStepIdx: 0,
      completedSteps: {},
    };
    setEnrollments((prev) => [enrollment, ...prev]);
    return enrollment;
  }, []);

  const markStepCompleted = useCallback((enrollmentId: string, stepId: string, totalSteps: number) => {
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id !== enrollmentId) return e;
        const completedSteps = { ...e.completedSteps, [stepId]: new Date().toISOString() };
        const completedCount = Object.keys(completedSteps).length;
        const isDone = completedCount >= totalSteps;
        return {
          ...e,
          completedSteps,
          currentStepIdx: Math.min(e.currentStepIdx + 1, totalSteps),
          status: isDone ? ("completed" as CrmEnrollmentStatus) : e.status,
        };
      }),
    );
  }, []);

  const setStatus = useCallback((enrollmentId: string, status: CrmEnrollmentStatus) => {
    setEnrollments((prev) => prev.map((e) => (e.id === enrollmentId ? { ...e, status } : e)));
  }, []);

  const cancel = useCallback((enrollmentId: string) => setStatus(enrollmentId, "cancelled"), [setStatus]);
  const pause  = useCallback((enrollmentId: string) => setStatus(enrollmentId, "paused"), [setStatus]);
  const resume = useCallback((enrollmentId: string) => setStatus(enrollmentId, "active"), [setStatus]);

  return { enrollments, getEnrollments, enroll, markStepCompleted, cancel, pause, resume };
}
