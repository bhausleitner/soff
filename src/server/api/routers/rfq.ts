import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const requestForQuoteLineItemSchema = z.object({
  id: z.number(),
  description: z.string(),
  quantity: z.number(),
  fileNames: z.array(z.string()),
  subject: z.string(),
  createdAt: z.date(),
  suppliers: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      contactPerson: z.string()
    })
  )
});

export type RequestForQuoteLineItem = z.infer<
  typeof requestForQuoteLineItemSchema
>;

export const rfqRouter = createTRPCRouter({
  deleteRfqLineItem: publicProcedure
    .input(z.object({ rfqLineItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.rfqLineItem.delete({ where: { id: input.rfqLineItemId } });
    }),
  getRfqLineitems: publicProcedure
    .input(
      z.object({
        rfqId: z.number()
      })
    )
    .query(async ({ ctx, input }) => {
      const rfqLineItems = await ctx.db.rfqLineItem.findMany({
        where: { requestForQuoteId: input.rfqId },
        select: {
          id: true,
          description: true
        }
      });
      return rfqLineItems;
    }),
  addNewRfqLineItem: publicProcedure
    .input(
      z.object({
        rfqId: z.number(),
        description: z.string(),
        quantity: z.number(),
        fileNames: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newRfqLineItem = await ctx.db.rfqLineItem.create({
        data: {
          description: input.description,
          quantity: input.quantity,
          fileNames: input.fileNames,
          requestForQuoteId: input.rfqId
        }
      });
      return newRfqLineItem;
    }),
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
                  id: true,
                  status: true
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
            quoteId: chat.quotes[0]?.id ?? null,
            quoteStatus: chat.quotes[0]?.status ?? "WAITING"
          }
        ])
      );

      // Add chat IDs and quote IDs to supplier objects
      const suppliersWithChatAndQuoteIds = rfqDetails.suppliers.map(
        (supplier) => {
          const info = supplierInfoMap.get(supplier.id) ?? {
            chatId: null,
            quoteId: null,
            quoteStatus: "WAITING"
          };
          return {
            ...supplier,
            chatId: info.chatId,
            quoteId: info.quoteId,
            quoteStatus: info.quoteStatus
          };
        }
      );

      return {
        rfqLineItems: rfqDetails.lineItems,
        suppliers: suppliersWithChatAndQuoteIds,
        status: rfqDetails.status,
        subject: rfqDetails.subject,
        createdAt: rfqDetails.createdAt
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
        where: { organizationId: user.organizationId },
        include: {
          suppliers: {
            select: {
              id: true,
              email: true,
              name: true,
              contactPerson: true
            }
          }
        }
      });

      return rfqs;
    }),
  createRequestForQuote: publicProcedure
    .input(
      z.object({
        supplierIds: z.array(z.number()),
        rfqLineItems: z.array(
          z.object({
            description: z.string(),
            quantity: z.number(),
            fileNames: z.array(z.string())
          })
        ),
        subject: z.string()
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
          subject: input.subject,
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
              requestForQuoteId: newRfqObject.id,
              subject: input.subject
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
