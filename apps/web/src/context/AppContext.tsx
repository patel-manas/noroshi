import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  Org,
  Page,
  ComponentGroup,
  ComponentItem,
  Incident,
  AlertItem,
  TabType,
  IncidentFilter,
  ComponentStatus,
  IncidentSeverity,
} from "../types/index.js";

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  organizationName: string;
  organizationSlug: string;
}

interface AppContextValue {
  // Auth State
  currentUser: User | null;
  isAuthenticated: boolean;
  authModal: "login" | "register" | null;
  setAuthModal: (mode: "login" | "register" | null) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Tenant State
  userId: string;
  org: Org | null;
  pages: Page[];
  selectedPage: Page | null;
  loading: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectPage: (page: Page) => void;

  // Domain State
  incidents: Incident[];
  incidentFilter: IncidentFilter;
  setIncidentFilter: (filter: IncidentFilter) => void;
  groups: ComponentGroup[];
  components: ComponentItem[];
  alerts: AlertItem[];

  // Modal Controls
  showNewIncidentModal: boolean;
  setShowNewIncidentModal: (show: boolean) => void;
  showNewPageModal: boolean;
  setShowNewPageModal: (show: boolean) => void;
  showNewGroupModal: boolean;
  setShowNewGroupModal: (show: boolean) => void;
  showNewCompModal: boolean;
  setShowNewCompModal: (show: boolean) => void;
  showAddUpdateModal: Incident | null;
  setShowAddUpdateModal: (inc: Incident | null) => void;

  // Actions
  createPage: (data: { name: string; slug: string; description?: string; visibility: "public" | "private" }) => Promise<void>;
  createIncident: (data: {
    title: string;
    description?: string;
    severity: IncidentSeverity;
    affectedComponentId?: string;
    impactStatus?: string;
  }) => Promise<void>;
  transitionIncidentStatus: (incidentId: string, targetStatus: "investigating" | "resolved") => Promise<void>;
  addIncidentUpdate: (incidentId: string, message: string, status: string) => Promise<void>;
  createGroup: (name: string, description?: string) => Promise<void>;
  createComponent: (name: string, description?: string, groupId?: string) => Promise<void>;
  updateComponentStatus: (componentId: string, status: ComponentStatus) => Promise<void>;
  sendWebhookAlert: (source: string, dedupeKey: string, message: string) => Promise<any>;
  refreshAlerts: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

  // Tenant State
  const [activeTab, setActiveTab] = useState<TabType>("incidents");
  const [userId, setUserId] = useState<string>("");
  const [org, setOrg] = useState<Org | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Domain State
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentFilter, setIncidentFilter] = useState<IncidentFilter>("all");
  const [groups, setGroups] = useState<ComponentGroup[]>([]);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Modals
  const [showNewIncidentModal, setShowNewIncidentModal] = useState<boolean>(false);
  const [showNewPageModal, setShowNewPageModal] = useState<boolean>(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState<boolean>(false);
  const [showNewCompModal, setShowNewCompModal] = useState<boolean>(false);
  const [showAddUpdateModal, setShowAddUpdateModal] = useState<Incident | null>(null);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    setLoading(true);
    try {
      const savedUserStr = localStorage.getItem("noroshi_user");
      const savedOrgStr = localStorage.getItem("noroshi_org");
      if (savedUserStr && savedOrgStr) {
        const u = JSON.parse(savedUserStr);
        const o = JSON.parse(savedOrgStr);
        setCurrentUser(u);
        setUserId(u.id);
        setOrg(o);
        setIsAuthenticated(true);
        await initializeOrgWorkspace(o.id, u.id);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Bootstrap error:", err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function initializeOrgWorkspace(orgId: string, uid: string) {
    try {
      const pagesRes = await fetch(`/api/v1/orgs/${orgId}/pages`, {
        headers: { "x-user-id": uid },
      });
      let pagesData = await pagesRes.json();

      if (!Array.isArray(pagesData) || pagesData.length === 0) {
        const createPageRes = await fetch(`/api/v1/orgs/${orgId}/pages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": uid,
          },
          body: JSON.stringify({
            name: "Production Systems Status",
            slug: "production-status",
            description: "Real-time service health and status updates",
            visibility: "public",
          }),
        });
        if (createPageRes.ok) {
          const newPage = await createPageRes.json();
          pagesData = [newPage];
        } else {
          pagesData = [];
        }
      }

      setPages(pagesData);
      if (pagesData.length > 0) {
        setSelectedPage(pagesData[0]);
        await loadPageData(orgId, pagesData[0].id, uid);
      }
    } catch (err) {
      console.error("Failed to initialize org workspace:", err);
    }
  }

  async function login(email: string, password?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      const user = data.user;
      const organization = data.org || (data.organizations && data.organizations[0]);
      if (!organization) {
        return { success: false, error: "No organization linked to this user" };
      }

      localStorage.setItem("noroshi_user", JSON.stringify(user));
      localStorage.setItem("noroshi_org", JSON.stringify(organization));

      setCurrentUser(user);
      setUserId(user.id);
      setOrg(organization);
      setIsAuthenticated(true);
      setAuthModal(null);

      await initializeOrgWorkspace(organization.id, user.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  }

  async function register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: Array.isArray(resData.error)
            ? resData.error.map((e: any) => e.message).join(", ")
            : resData.error || "Registration failed",
        };
      }

      const user = resData.user;
      const organization = resData.org;

      localStorage.setItem("noroshi_user", JSON.stringify(user));
      localStorage.setItem("noroshi_org", JSON.stringify(organization));

      setCurrentUser(user);
      setUserId(user.id);
      setOrg(organization);
      setIsAuthenticated(true);
      setAuthModal(null);

      await initializeOrgWorkspace(organization.id, user.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  }

  function logout() {
    localStorage.removeItem("noroshi_user");
    localStorage.removeItem("noroshi_org");
    setCurrentUser(null);
    setUserId("");
    setOrg(null);
    setPages([]);
    setSelectedPage(null);
    setIncidents([]);
    setGroups([]);
    setComponents([]);
    setAlerts([]);
    setIsAuthenticated(false);
  }

  async function loadPageData(orgId: string, pageId: string, uid: string) {
    try {
      const gRes = await fetch(`/api/v1/orgs/${orgId}/pages/${pageId}/groups`, {
        headers: { "x-user-id": uid },
      });
      const gData = await gRes.json();
      setGroups(Array.isArray(gData) ? gData : []);

      const cRes = await fetch(`/api/v1/orgs/${orgId}/pages/${pageId}/components`, {
        headers: { "x-user-id": uid },
      });
      const cData = await cRes.json();
      setComponents(Array.isArray(cData) ? cData : []);

      if (Array.isArray(cData) && cData.length === 0) {
        const groupRes = await fetch(`/api/v1/orgs/${orgId}/pages/${pageId}/groups`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": uid },
          body: JSON.stringify({ name: "Core Infrastructure", description: "APIs & Databases" }),
        });
        const createdGroup = await groupRes.json();

        await fetch(`/api/v1/orgs/${orgId}/pages/${pageId}/components`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": uid },
          body: JSON.stringify({
            name: "API Gateway",
            description: "High-throughput ingress proxy",
            groupId: createdGroup.id,
            status: "operational",
          }),
        });
        await fetch(`/api/v1/orgs/${orgId}/pages/${pageId}/components`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": uid },
          body: JSON.stringify({
            name: "Payment Processing",
            description: "Stripe & Banking webhooks",
            groupId: createdGroup.id,
            status: "operational",
          }),
        });

        const gReload = await fetch(`/api/v1/orgs/${orgId}/pages/${pageId}/groups`, { headers: { "x-user-id": uid } });
        setGroups(await gReload.json());
        const cReload = await fetch(`/api/v1/orgs/${orgId}/pages/${pageId}/components`, { headers: { "x-user-id": uid } });
        setComponents(await cReload.json());
      }

      loadIncidents(orgId, uid);
      loadAlerts(orgId, uid);
    } catch (err) {
      console.error("Error loading page data:", err);
    }
  }

  async function loadIncidents(orgId: string, uid: string) {
    try {
      const res = await fetch(`/api/v1/orgs/${orgId}/incidents`, {
        headers: { "x-user-id": uid },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const detailed = await Promise.all(
          data.map(async (inc: any) => {
            const dRes = await fetch(`/api/v1/orgs/${orgId}/incidents/${inc.id}`, {
              headers: { "x-user-id": uid },
            });
            return dRes.ok ? await dRes.json() : inc;
          })
        );
        setIncidents(detailed);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadAlerts(orgId: string, uid: string) {
    try {
      const res = await fetch(`/api/v1/orgs/${orgId}/alerts`, {
        headers: { "x-user-id": uid },
      });
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  function selectPage(page: Page) {
    if (!org) return;
    setSelectedPage(page);
    loadPageData(org.id, page.id, userId);
  }

  async function createPage(data: { name: string; slug: string; description?: string; visibility: "public" | "private" }) {
    if (!org) return;
    const res = await fetch(`/api/v1/orgs/${org.id}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const newPage = await res.json();
      setPages((prev) => [...prev, newPage]);
      setSelectedPage(newPage);
      setShowNewPageModal(false);
      loadPageData(org.id, newPage.id, userId);
    } else {
      const err = await res.json();
      throw new Error(err.message || err.error || "Failed to create page");
    }
  }

  async function createIncident(data: {
    title: string;
    description?: string;
    severity: IncidentSeverity;
    affectedComponentId?: string;
    impactStatus?: string;
  }) {
    if (!org || !selectedPage) return;

    const affectedComponents = data.affectedComponentId
      ? [{ componentId: data.affectedComponentId, impactStatus: data.impactStatus || "major_outage" }]
      : [];

    const res = await fetch(`/api/v1/orgs/${org.id}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        severity: data.severity,
        pageIds: [selectedPage.id],
        affectedComponents,
      }),
    });

    if (res.ok) {
      setShowNewIncidentModal(false);
      loadIncidents(org.id, userId);
      loadPageData(org.id, selectedPage.id, userId);
    } else {
      const err = await res.json();
      throw new Error(err.message || "Failed to create incident");
    }
  }

  async function transitionIncidentStatus(incidentId: string, targetStatus: "investigating" | "resolved") {
    if (!org || !selectedPage) return;
    const res = await fetch(`/api/v1/orgs/${org.id}/incidents/${incidentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({
        status: targetStatus,
        message: targetStatus === "resolved" ? "Issue resolved and mitigated." : "Investigating root cause.",
      }),
    });

    if (res.ok) {
      loadIncidents(org.id, userId);
      loadPageData(org.id, selectedPage.id, userId);
    } else {
      const err = await res.json();
      throw new Error(err.message || "Invalid state transition");
    }
  }

  async function addIncidentUpdate(incidentId: string, message: string, status: string) {
    if (!org) return;
    const res = await fetch(`/api/v1/orgs/${org.id}/incidents/${incidentId}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ message, status }),
    });

    if (res.ok) {
      setShowAddUpdateModal(null);
      loadIncidents(org.id, userId);
      if (selectedPage) loadPageData(org.id, selectedPage.id, userId);
    } else {
      const err = await res.json();
      throw new Error(err.message || "Failed to add update");
    }
  }

  async function createGroup(name: string, description?: string) {
    if (!org || !selectedPage) return;
    const res = await fetch(`/api/v1/orgs/${org.id}/pages/${selectedPage.id}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ name, description }),
    });

    if (res.ok) {
      setShowNewGroupModal(false);
      loadPageData(org.id, selectedPage.id, userId);
    } else {
      const err = await res.json();
      throw new Error(err.message || "Failed to create group");
    }
  }

  async function createComponent(name: string, description?: string, groupId?: string) {
    if (!org || !selectedPage) return;
    const res = await fetch(`/api/v1/orgs/${org.id}/pages/${selectedPage.id}/components`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({
        name,
        description,
        groupId: groupId || undefined,
        status: "operational",
      }),
    });

    if (res.ok) {
      setShowNewCompModal(false);
      loadPageData(org.id, selectedPage.id, userId);
    } else {
      const err = await res.json();
      throw new Error(err.message || "Failed to create component");
    }
  }

  async function updateComponentStatus(componentId: string, status: ComponentStatus) {
    if (!org || !selectedPage) return;
    const res = await fetch(`/api/v1/orgs/${org.id}/components/${componentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      loadPageData(org.id, selectedPage.id, userId);
    }
  }

  async function sendWebhookAlert(source: string, dedupeKey: string, message: string) {
    if (!org) return null;
    const res = await fetch(`/api/v1/orgs/${org.id}/webhooks/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, dedupeKey, message }),
    });
    const data = await res.json();
    loadAlerts(org.id, userId);
    return { status: res.status, data, timestamp: new Date().toLocaleTimeString() };
  }

  async function refreshAlerts() {
    if (org) loadAlerts(org.id, userId);
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authModal,
        setAuthModal,
        login,
        register,
        logout,
        userId,
        org,
        pages,
        selectedPage,
        loading,
        activeTab,
        setActiveTab,
        selectPage,
        incidents,
        incidentFilter,
        setIncidentFilter,
        groups,
        components,
        alerts,
        showNewIncidentModal,
        setShowNewIncidentModal,
        showNewPageModal,
        setShowNewPageModal,
        showNewGroupModal,
        setShowNewGroupModal,
        showNewCompModal,
        setShowNewCompModal,
        showAddUpdateModal,
        setShowAddUpdateModal,
        createPage,
        createIncident,
        transitionIncidentStatus,
        addIncidentUpdate,
        createGroup,
        createComponent,
        updateComponentStatus,
        sendWebhookAlert,
        refreshAlerts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
