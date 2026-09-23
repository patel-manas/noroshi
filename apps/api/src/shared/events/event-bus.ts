import { EventEmitter } from "node:events";

export interface DomainEvents {
  "incident.created": {
    incidentId: string;
    orgId: string;
    title: string;
    severity: string;
    status: string;
    pageIds: string[];
    componentIds: string[];
    createdAt: Date;
  };
  "incident.updated": {
    incidentId: string;
    orgId: string;
    previousStatus: string;
    newStatus: string;
    message?: string;
    updatedAt: Date;
  };
  "incident.resolved": {
    incidentId: string;
    orgId: string;
    resolvedAt: Date;
  };
  "alert.received": {
    alertId: string;
    orgId: string;
    source: string;
    dedupeKey: string;
    message: string;
    createdAt: Date;
  };
  "component.status_changed": {
    componentId: string;
    orgId: string;
    pageId: string;
    previousStatus: string;
    newStatus: string;
    incidentId?: string;
  };
}

class TypedEventBus {
  private emitter = new EventEmitter();

  emit<K extends keyof DomainEvents>(event: K, payload: DomainEvents[K]): boolean {
    return this.emitter.emit(event, payload);
  }

  on<K extends keyof DomainEvents>(event: K, listener: (payload: DomainEvents[K]) => void | Promise<void>): this {
    this.emitter.on(event, listener);
    return this;
  }

  off<K extends keyof DomainEvents>(event: K, listener: (payload: DomainEvents[K]) => void | Promise<void>): this {
    this.emitter.off(event, listener);
    return this;
  }
}

export const eventBus = new TypedEventBus();
