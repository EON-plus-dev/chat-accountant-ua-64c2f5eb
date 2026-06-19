/**
 * stepExecutor — виконавець кроків процесу.
 * Поки demo-stub: реальні side-effects (create task, send notification, request kep)
 * додаються інкрементально в наступних фазах міграції.
 */

import type { ProcessStep, ProcessInstance, ProcessStepExecution } from "../types";

export async function executeStep(
  step: ProcessStep,
  instance: ProcessInstance,
): Promise<ProcessStepExecution> {
  const exec: ProcessStepExecution = {
    stepId: step.id,
    startedAt: new Date().toISOString(),
    status: "running",
  };

  try {
    switch (step.kind) {
      case "create_task":
        // TODO: bridge to useUniversalTasksStore.addTask({...step.config, context: instance.context})
        exec.output = { todo: "create_task — phase 2" };
        break;
      case "send_notification":
        // TODO: bridge to useUserNotifications
        exec.output = { todo: "send_notification — phase 2" };
        break;
      case "request_signature":
        // TODO: bridge to kep-sign edge via documents/bridges/kepBridge
        exec.output = { todo: "request_signature — phase 2" };
        break;
      case "request_approval":
        // TODO: bridge to documents/store/useApprovalsStore.createApprovalRequest
        exec.output = { todo: "request_approval — phase 2" };
        break;
      case "send_email":
      case "wait":
      case "ai_action":
      case "webhook":
        exec.output = { todo: `${step.kind} — phase 2` };
        break;
    }
    exec.status = "success";
  } catch (e) {
    exec.status = "failed";
    exec.error = String(e);
  }
  exec.finishedAt = new Date().toISOString();
  return exec;
}
