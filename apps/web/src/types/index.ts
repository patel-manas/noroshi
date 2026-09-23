export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
}

export interface Page {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  visibility: "public" | "private";
}

export interface ComponentGroup {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
}

export type ComponentStatus =
  | "operational"
  | "degraded_performance"
  | "partial_outage"
  | "major_outage"
  | "under_maintenance";

export interface ComponentItem {
  id: string;
  groupId?: string;
  name: string;
  description?: string;
  status: ComponentStatus;
  orderIndex: number;
}

export interface IncidentUpdate {
  id: string;
  message: string;
  status: string;
  createdAt: string;
}

export type IncidentSeverity = "sev1" | "sev2" | "sev3";
export type IncidentStatus = "triggered" | "investigating" | "resolved";

export interface Incident {
  id: string;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  resolvedAt?: string;
  updates?: IncidentUpdate[];
  pageIds?: string[];
  affectedComponents?: { componentId: string; impactStatus: string }[];
}

export interface AlertItem {
  id: string;
  source: string;
  dedupeKey: string;
  message: string;
  status: string;
  createdAt: string;
}

export type TabType = "incidents" | "components" | "alerts" | "preview";
export type IncidentFilter = "all" | "triggered" | "investigating" | "resolved";
