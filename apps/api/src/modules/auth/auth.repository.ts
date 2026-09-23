import { db, schema, eq, and } from "../../shared/db/client.js";

export class AuthRepository {
  async findUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    return user || null;
  }

  async findUserById(id: string) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return user || null;
  }

  async createUser(data: { email: string; name: string; passwordHash?: string }) {
    const [user] = await db.insert(schema.users).values(data).returning();
    return user;
  }

  async createOrganization(data: { name: string; slug: string }) {
    const [org] = await db.insert(schema.organizations).values(data).returning();
    return org;
  }

  async findOrgBySlug(slug: string) {
    const [org] = await db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, slug))
      .limit(1);
    return org || null;
  }

  async findOrgById(id: string) {
    const [org] = await db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.id, id))
      .limit(1);
    return org || null;
  }

  async addOrgMember(data: { orgId: string; userId: string; role: "org_admin" | "member" }) {
    const [member] = await db.insert(schema.orgMembers).values(data).returning();
    return member;
  }

  async getUserOrganizations(userId: string) {
    const orgs = await db
      .select({
        id: schema.organizations.id,
        name: schema.organizations.name,
        slug: schema.organizations.slug,
        createdAt: schema.organizations.createdAt,
        updatedAt: schema.organizations.updatedAt,
      })
      .from(schema.organizations)
      .innerJoin(schema.orgMembers, eq(schema.organizations.id, schema.orgMembers.orgId))
      .where(eq(schema.orgMembers.userId, userId));
    return orgs;
  }

  async getUserMemberships(userId: string) {
    const orgMemberships = await db
      .select({
        orgId: schema.orgMembers.orgId,
        role: schema.orgMembers.role,
      })
      .from(schema.orgMembers)
      .where(eq(schema.orgMembers.userId, userId));

    const pageMemberships = await db
      .select({
        pageId: schema.pageMembers.pageId,
        orgId: schema.pages.orgId,
        role: schema.pageMembers.role,
      })
      .from(schema.pageMembers)
      .innerJoin(schema.pages, eq(schema.pageMembers.pageId, schema.pages.id))
      .where(eq(schema.pageMembers.userId, userId));

    return {
      userId,
      orgMemberships: orgMemberships as { orgId: string; role: "org_admin" | "member" }[],
      pageMemberships: pageMemberships as { pageId: string; orgId: string; role: "page_admin" | "page_editor" }[],
    };
  }

  async createPage(data: {
    orgId: string;
    name: string;
    slug: string;
    description?: string;
    visibility: "public" | "private";
  }) {
    const [page] = await db.insert(schema.pages).values(data).returning();
    return page;
  }

  async getPagesByOrg(orgId: string) {
    return db
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.orgId, orgId));
  }

  async findPageById(orgId: string, pageId: string) {
    const [page] = await db
      .select()
      .from(schema.pages)
      .where(and(eq(schema.pages.orgId, orgId), eq(schema.pages.id, pageId)))
      .limit(1);
    return page || null;
  }
}
