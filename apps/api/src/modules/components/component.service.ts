import { ComponentRepository } from "./component.repository.js";
import {
  CreateComponentGroupInput,
  CreateComponentInput,
  ComponentStatus,
} from "./component.types.js";
import { can, UserContext } from "../../shared/auth/rbac.js";
import { eventBus } from "../../shared/events/event-bus.js";

export class ComponentService {
  constructor(private repo: ComponentRepository) {}

  async createGroup(
    userContext: UserContext,
    orgId: string,
    pageId: string,
    input: CreateComponentGroupInput
  ) {
    if (!can(userContext, "component:manage", { orgId, pageId })) {
      throw new Error("Forbidden: insufficient permissions to manage components");
    }

    return this.repo.createGroup({
      orgId,
      pageId,
      name: input.name,
      description: input.description,
      orderIndex: input.orderIndex,
    });
  }

  async getGroups(userContext: UserContext, orgId: string, pageId: string) {
    if (!can(userContext, "component:view", { orgId, pageId })) {
      throw new Error("Forbidden: insufficient permissions to view components");
    }
    return this.repo.getGroups(orgId, pageId);
  }

  async createComponent(
    userContext: UserContext,
    orgId: string,
    pageId: string,
    input: CreateComponentInput
  ) {
    if (!can(userContext, "component:manage", { orgId, pageId })) {
      throw new Error("Forbidden: insufficient permissions to manage components");
    }

    return this.repo.createComponent({
      orgId,
      pageId,
      groupId: input.groupId,
      name: input.name,
      description: input.description,
      status: input.status,
      orderIndex: input.orderIndex,
    });
  }

  async getComponents(userContext: UserContext, orgId: string, pageId: string) {
    if (!can(userContext, "component:view", { orgId, pageId })) {
      throw new Error("Forbidden: insufficient permissions to view components");
    }
    return this.repo.getComponents(orgId, pageId);
  }

  async updateStatus(
    userContext: UserContext,
    orgId: string,
    componentId: string,
    status: ComponentStatus
  ) {
    const existing = await this.repo.findComponentById(orgId, componentId);
    if (!existing) {
      throw new Error("Component not found");
    }

    if (!can(userContext, "component:manage", { orgId, pageId: existing.pageId })) {
      throw new Error("Forbidden: insufficient permissions to update component");
    }

    const previousStatus = existing.status;
    const updated = await this.repo.updateComponentStatus(orgId, componentId, status);

    eventBus.emit("component.status_changed", {
      componentId,
      orgId,
      pageId: existing.pageId,
      previousStatus,
      newStatus: status,
    });

    return updated;
  }
}
