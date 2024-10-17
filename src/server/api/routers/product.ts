import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import * as odooUtils from "~/server/odoo/utils";

export const productRouter = createTRPCRouter({
  getAllErpProducts: publicProcedure
    .input(
      z.object({
        clerkUserId: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          clerkUserId: input.clerkUserId
        },
        select: {
          organizationId: true,
          organization: {
            select: {
              erpProducts: true
            }
          }
        }
      });

      return user?.organization?.erpProducts ?? [];
    }),
  syncErpProducts: publicProcedure.mutation(async ({ ctx }) => {
    const queryData = await ctx.db.user.findFirst({
      where: { clerkUserId: ctx.auth.userId! },
      select: {
        organization: {
          select: {
            id: true,
            name: true,
            erpUrl: true,
            erp: true
          }
        }
      }
    });

    if (queryData?.organization?.erp !== "ODOO") {
      throw new Error("Syncing only available for ODOO");
    }

    if (!queryData.organization.erpUrl || !queryData.organization.id) {
      throw new Error("Organization not found");
    }

    const orgName = queryData.organization.name.toLowerCase();
    const orgId = queryData.organization.id;
    const erpUrl = queryData.organization.erpUrl;

    const odooUid = await odooUtils.authenticate(erpUrl, orgName);

    if (!odooUid) {
      throw new Error("Odoo authentication failed");
    }

    void odooUtils.syncProducts(erpUrl, odooUid, orgName, orgId);
  })
});
