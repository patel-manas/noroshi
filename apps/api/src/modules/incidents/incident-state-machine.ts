export type IncidentStatus = "triggered" | "investigating" | "resolved";

export const IncidentStateTransitions: Record<IncidentStatus, IncidentStatus[]> = {
  triggered: ["investigating", "resolved"],
  investigating: ["resolved"],
  resolved: [], // Terminal state in Phase 1
};

export class InvalidStateTransitionError extends Error {
  constructor(public from: IncidentStatus, public to: IncidentStatus) {
    super(`Invalid incident transition from '${from}' to '${to}'`);
    this.name = "InvalidStateTransitionError";
  }
}

export function validateStateTransition(current: IncidentStatus, target: IncidentStatus): void {
  if (current === target) {
    return; // No-op transition
  }

  const allowed = IncidentStateTransitions[current];
  if (!allowed || !allowed.includes(target)) {
    throw new InvalidStateTransitionError(current, target);
  }
}
