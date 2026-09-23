export type OrgRole = "org_admin" | "member";
export type PageRole = "page_admin" | "page_editor";

export interface UserContext {
  userId: string;
  orgMemberships: {
    orgId: string;
    role: OrgRole;
  }[];
  pageMemberships: {
    pageId: string;
    orgId: string;
    role: PageRole;
  }[];
}

export type Action =
  | "org:manage"
  | "org:view"
  | "page:create"
  | "page:manage"
  | "page:view"
  | "component:manage"
  | "component:view"
  | "incident:create"
  | "incident:update"
  | "incident:view"
  | "alert:view";

export interface ResourceTarget {
  orgId: string;
  pageId?: string;
}

/**
 * Centralized RBAC authorization function:
 * can(user, action, resource)
 * 
 * Architectural rule:
 * org_admin implicitly inherits page_admin access to EVERY page in the organization.
 */
export function can(
  user: UserContext,
  action: Action,
  resource: ResourceTarget
): boolean {
  const orgMembership = user.orgMemberships.find((m) => m.orgId === resource.orgId);
  if (!orgMembership) {
    return false;
  }

  // org_admin has god-mode privileges across the entire organization and all of its pages
  if (orgMembership.role === "org_admin") {
    return true;
  }

  // Organization-level permissions for standard members
  if (action === "org:view" || action === "page:create") {
    return true;
  }

  if (action === "org:manage") {
    return false; // only org_admin
  }

  // Page-scoped actions
  if (resource.pageId) {
    const pageMembership = user.pageMemberships.find(
      (m) => m.pageId === resource.pageId && m.orgId === resource.orgId
    );

    if (!pageMembership) {
      // General members can view public info or create incidents if permitted
      if (action === "page:view" || action === "component:view" || action === "incident:view") {
        return true;
      }
      return false;
    }

    if (pageMembership.role === "page_admin") {
      return true;
    }

    if (pageMembership.role === "page_editor") {
      switch (action) {
        case "page:view":
        case "component:view":
        case "component:manage":
        case "incident:view":
        case "incident:create":
        case "incident:update":
          return true;
        case "page:manage":
          return false; // page_editor cannot delete or change core page settings
        default:
          return false;
      }
    }
  }

  // If no specific page is targeted, members can view incidents, components, and alerts within their org
  if (
    action === "incident:view" ||
    action === "component:view" ||
    action === "alert:view" ||
    action === "incident:create" ||
    action === "incident:update"
  ) {
    return true;
  }

  return false;
}
