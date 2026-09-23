import { AuthRepository } from "./auth.repository.js";
import { RegisterUserInput, LoginUserInput, CreateOrgInput, CreatePageInput } from "./auth.types.js";
import { can, UserContext } from "../../shared/auth/rbac.js";

export class AuthService {
  constructor(private repo: AuthRepository) {}

  async registerUser(input: RegisterUserInput) {
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    const user = await this.repo.createUser({
      email: input.email,
      name: input.name,
      passwordHash: input.password ? `hashed_${input.password}` : undefined,
    });

    let org = null;
    if (input.organizationName && input.organizationSlug) {
      org = await this.repo.createOrganization({
        name: input.organizationName,
        slug: input.organizationSlug,
      });

      await this.repo.addOrgMember({
        orgId: org.id,
        userId: user.id,
        role: "org_admin",
      });
    }

    return { user, org };
  }

  async loginUser(input: LoginUserInput) {
    const user = await this.repo.findUserByEmail(input.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.passwordHash && input.password) {
      if (user.passwordHash !== `hashed_${input.password}`) {
        throw new Error("Invalid email or password");
      }
    }

    const organizations = await this.repo.getUserOrganizations(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      organizations,
      org: organizations[0] || null,
    };
  }

  async getUserContext(userId: string): Promise<UserContext> {
    return this.repo.getUserMemberships(userId);
  }

  async createOrganization(userContext: UserContext, input: CreateOrgInput) {
    const existing = await this.repo.findOrgBySlug(input.slug);
    if (existing) {
      throw new Error("Organization with this slug already exists");
    }

    const org = await this.repo.createOrganization(input);

    await this.repo.addOrgMember({
      orgId: org.id,
      userId: userContext.userId,
      role: "org_admin",
    });

    return org;
  }

  async createPage(userContext: UserContext, orgId: string, input: CreatePageInput) {
    if (!can(userContext, "page:create", { orgId })) {
      throw new Error("Forbidden: insufficient permissions to create page");
    }

    return this.repo.createPage({
      orgId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      visibility: input.visibility,
    });
  }

  async getPages(userContext: UserContext, orgId: string) {
    if (!can(userContext, "page:view", { orgId })) {
      throw new Error("Forbidden: insufficient permissions to view pages");
    }
    return this.repo.getPagesByOrg(orgId);
  }
}
