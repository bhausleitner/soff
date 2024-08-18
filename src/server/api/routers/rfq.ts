import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const rfqRouter = createTRPCRouter({
  getRfq: publicProcedure
    .input(
      z.object({
        rfqId: z.number()
      })
    )
    .query(async ({ ctx, input }) => {
      const rfqDetails = await ctx.db.requestForQuote.findUnique({
        where: { id: input.rfqId },
        include: {
          lineItems: true,
          suppliers: {
            select: {
              id: true,
              name: true,
              email: true,
              contactPerson: true,
              status: true
            }
          },
          chats: {
            select: {
              id: true,
              chatParticipants: {
                where: {
                  supplierId: { not: null }
                },
                select: {
                  supplierId: true
                }
              },
              quotes: {
                where: {
                  isActive: true
                },
                select: {
                  id: true
                }
              }
            }
          }
        }
      });

      if (!rfqDetails) {
        throw new Error("RFQ not found");
      }

      // Create a map of supplier IDs to chat IDs and quote IDs
      const supplierInfoMap = new Map(
        rfqDetails.chats.map((chat) => [
          chat.chatParticipants[0]?.supplierId,
          {
            chatId: chat.id,
            quoteId: chat.quotes[0]?.id ?? null
          }
        ])
      );

      // Add chat IDs and quote IDs to supplier objects
      const suppliersWithChatAndQuoteIds = rfqDetails.suppliers.map(
        (supplier) => {
          const info = supplierInfoMap.get(supplier.id) ?? {
            chatId: null,
            quoteId: null
          };
          return {
            ...supplier,
            chatId: info.chatId,
            quoteId: info.quoteId
          };
        }
      );

      return {
        rfqLineItems: rfqDetails.lineItems,
        suppliers: suppliersWithChatAndQuoteIds,
        status: rfqDetails.status
      };
    }),
  getAllRequestsForQuotes: publicProcedure
    .input(z.object({ clerkUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { clerkUserId: input.clerkUserId }
      });
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.organizationId) {
        throw new Error("User does not belong to an organization");
      }

      const rfqs = await ctx.db.requestForQuote.findMany({
        where: { organizationId: user.organizationId }
      });
      return rfqs;
    }),
  createRequestForQuote: publicProcedure
    .input(
      z.object({
        messageBody: z.string(),
        supplierIds: z.array(z.number()),
        rfqLineItems: z.array(
          z.object({
            description: z.string(),
            quantity: z.number(),
            fileNames: z.array(z.string())
          })
        )
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { clerkUserId: ctx.auth.userId! },
        select: { organizationId: true, id: true }
      });

      if (!user?.organizationId) {
        throw new Error("User or organization not found");
      }

      // create request for quote object
      const newRfqObject = await ctx.db.requestForQuote.create({
        data: {
          organization: {
            connect: { id: user.organizationId }
          },
          suppliers: {
            connect: input.supplierIds.map((id) => ({ id }))
          }
        },
        include: {
          suppliers: true,
          organization: true
        }
      });

      // create rfq line items
      await Promise.all(
        input.rfqLineItems.map(async (item) => {
          return ctx.db.rfqLineItem.create({
            data: {
              requestForQuoteId: newRfqObject.id,
              ...item
            }
          });
        })
      );

      // iterate through supplierIds and create chat objects and chat participants
      const chatToSupplierMap: Record<number, number> = {};
      const userChatParticipantToSupplierMap: Record<number, number> = {};
      await Promise.all(
        input.supplierIds.map(async (supplierId) => {
          // create chat object
          const chatObject = await ctx.db.chat.create({
            data: {
              requestForQuoteId: newRfqObject.id
            }
          });

          chatToSupplierMap[supplierId] = chatObject.id;

          // create supplier chat participant
          await ctx.db.chatParticipant.create({
            data: {
              chatId: chatObject.id,
              supplierId: supplierId
            }
          });

          // create user chat participant
          const userChatParticipant = await ctx.db.chatParticipant.create({
            data: {
              chatId: chatObject.id,
              userId: user.id
            }
          });

          userChatParticipantToSupplierMap[supplierId] = userChatParticipant.id;
        })
      );

      return {
        chatToSupplierMap,
        userChatParticipantToSupplierMap,
        rfqId: newRfqObject.id
      };
    })
});
