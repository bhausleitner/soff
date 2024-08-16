import { z } from "zod";
import { QuoteStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { orderArraySchema } from "~/server/api/routers/supplier";
import openai from "~/server/openai/config";
import { getFileFromS3 } from "~/server/s3/utils";
import { convertPdfToImage } from "~/server/openai/utils";
import * as odooUtils from "~/server/odoo/utils";
import {
  type QuoteComparison,
  reconcileAndCompareQuotes
} from "~/utils/quote-helper";

export const lineItemSchema = z.object({
  id: z.number(),
  partId: z.number().nullable(),
  description: z.string().nullable(),
  quantity: z.number().nullable(),
  price: z.number().nullable(),
  leadTime: z.string().nullable(),
  quoteId: z.number()
});

export const quoteSchema = z.object({
  id: z.number(),
  supplierId: z.number(),
  paymentTerms: z.string().nullable(),
  price: z.number(),
  status: z.nativeEnum(QuoteStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  erpPurchaseOrderId: z.number().optional().nullable(),
  chatId: z.number().optional().nullable(),
  version: z.number()
});

export const quoteArraySchema = z.array(quoteSchema);
export const lineItemArraySchema = z.array(lineItemSchema);

const quoteIdSchema = z.object({
  quoteId: z.number()
});

interface ParsedQuoteData {
  totalPrice: number;
  lineItems: {
    partId: number | null;
    quantity: number;
    price: number;
    description: string;
  }[];
}

export type Quote = z.infer<typeof quoteSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;

export const quoteRouter = createTRPCRouter({
  getAllQuotes: publicProcedure
    .input(z.object({ clerkUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const quoteData = await ctx.db.quote.findMany({
        where: {
          supplier: {
            organization: {
              users: {
                some: {
                  clerkUserId: input.clerkUserId
                }
              }
            }
          }
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              organizationId: true
            }
          }
        }
      });

      quoteArraySchema.parse(quoteData);

      return quoteData;
    }),

  getQuoteById: publicProcedure
    .input(z.object({ quoteId: z.number() }))
    .query(async ({ ctx, input }) => {
      const quote = await ctx.db.quote.findUnique({
        where: { id: input.quoteId },
        include: {
          supplier: {
            select: {
              name: true,
              contactPerson: true,
              email: true,
              organization: {
                select: {
                  erpUrl: true
                }
              }
            }
          }
        }
      });

      if (!quote) {
        throw new Error("Quote not found");
      }

      // Fetch the history of quotes for the same supplier
      const quoteHistory = await ctx.db.quote.findMany({
        where: {
          chatId: quote.chatId
        },
        select: {
          id: true,
          version: true,
          isActive: true
        },
        orderBy: {
          version: "asc" // Order by version to maintain the history order
        },
        distinct: ["version"]
      });

      return {
        ...quote,
        supplierName: quote.supplier.name,
        supplierContactPerson: quote.supplier.contactPerson,
        supplierEmail: quote.supplier.email,
        erpUrl: quote.supplier.organization?.erpUrl,
        quoteHistory: quoteHistory.map((q) => ({
          id: q.id,
          version: q.version,
          isActive: q.isActive
        }))
      };
    }),
  getQuoteHeadersByIds: publicProcedure
    .input(z.array(z.number()))
    .query(async ({ ctx, input }) => {
      const quotes = await ctx.db.quote.findMany({
        where: { id: { in: input } },
        select: {
          id: true,
          fileKey: true,
          price: true,
          supplier: {
            select: {
              name: true
            }
          }
        }
      });

      return quotes;
    }),
  getQuoteComparison: publicProcedure
    .input(z.array(z.number()))
    .query(async ({ ctx, input }) => {
      const quotes = await ctx.db.quote.findMany({
        where: { id: { in: input } },
        select: {
          id: true,
          lineItems: {
            select: {
              description: true,
              price: true,
              quantity: true
            }
          }
        }
      });

      // if quotecomparison does not exist
      const existingQuoteComparison = await ctx.db.quoteComparison.findFirst({
        where: { quoteIds: { equals: input } }
      });

      if (existingQuoteComparison) {
        return JSON.parse(
          existingQuoteComparison.data as string
        ) as QuoteComparison[];
      }

      const newQuoteComparison: QuoteComparison[] =
        await reconcileAndCompareQuotes(quotes);

      await ctx.db.quoteComparison.create({
        data: {
          quoteIds: input,
          data: JSON.stringify(newQuoteComparison)
        }
      });

      return newQuoteComparison;
    }),
  getLineItemsByQuoteId: publicProcedure
    .input(quoteIdSchema)
    .query(async ({ ctx, input }) => {
      const lineItemData = await ctx.db.lineItem.findMany({
        where: { quoteId: input.quoteId }
      });

      lineItemArraySchema.parse(lineItemData);

      return lineItemData;
    }),
  getOrdersByQuoteId: publicProcedure
    .input(quoteIdSchema)
    .query(async ({ ctx, input }) => {
      const orderData = await ctx.db.order.findMany({
        where: { quoteId: input.quoteId }
      });

      orderArraySchema.parse(orderData);

      return orderData;
    }),
  createQuoteFromPdf: publicProcedure
    .input(
      z.object({
        fileKey: z.string(),
        chatId: z.number(),
        supplierId: z.number()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const pdfData = await getFileFromS3(input.fileKey);

        if (!pdfData.Body) {
          throw new Error("No PDF data found");
        }

        const pngPages: Buffer = await convertPdfToImage(
          pdfData.Body as ArrayBuffer
        );

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: 'Given the following quote data, parse it into the specified JSON format: {"totalPrice": 1000, "lineItems": [{"partId": 1, "quantity": 10, "price": 100, "description": "Part 1 Description"}, {"partId": 2, "quantity": 5, "price": 200, "description": "Part 2 Description"}]}'
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${pngPages.toString("base64")}`
                  }
                }
              ]
            }
          ]
        });

        console.log("Here parsing");
        console.log("Here parsing");
        console.log("Here parsing");
        console.log("Here parsing");

        const responseString = response.choices[0]?.message.content;
        const jsonRegex = /```json\n([\s\S]*?)\n```/;
        const match = responseString?.match(jsonRegex);

        if (!match?.[1]) {
          throw new Error("No JSON data found");
        }

        const parsedData = JSON.parse(match[1]) as ParsedQuoteData;

        console.log("parsed data");
        console.log(parsedData);
        console.log(parsedData);

        const existingQuote = await ctx.db.quote.findFirst({
          where: { chatId: input.chatId, isActive: true },
          select: { version: true, id: true, erpPurchaseOrderId: true }
        });

        if (existingQuote) {
          await ctx.db.quote.update({
            where: {
              id: existingQuote.id
            },
            data: { isActive: false }
          });

          const newQuote = await ctx.db.quote.create({
            data: {
              chatId: input.chatId,
              supplierId: input.supplierId,
              version: existingQuote.version + 1,
              price: parsedData.totalPrice,
              status: QuoteStatus.RECEIVED,
              erpPurchaseOrderId: existingQuote.erpPurchaseOrderId,
              fileKey: input.fileKey
            }
          });

          await Promise.all(
            parsedData.lineItems.map((lineItem) =>
              ctx.db.lineItem.create({
                data: {
                  quoteId: newQuote.id,
                  description: lineItem.description,
                  quantity: lineItem.quantity,
                  price: lineItem.price
                }
              })
            )
          );

          return newQuote.id.toString();
        } else {
          const newQuote = await ctx.db.quote.create({
            data: {
              chatId: input.chatId,
              supplierId: input.supplierId,
              price: parsedData.totalPrice,
              status: QuoteStatus.RECEIVED,
              fileKey: input.fileKey
            }
          });

          await Promise.all(
            parsedData.lineItems.map((lineItem) =>
              ctx.db.lineItem.create({
                data: {
                  quoteId: newQuote.id,
                  description: lineItem.description,
                  quantity: lineItem.quantity,
                  price: lineItem.price
                }
              })
            )
          );

          return newQuote.id.toString();
        }
      } catch (error) {
        console.error("Error in createQuoteFromPdf:", error);
        throw new Error(`Error in createQuoteFromPdf: ${String(error)}`);
      }
    }),

  createPurchaseOrder: publicProcedure
    .input(
      z.object({
        quoteId: z.number()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // get the quote object from the db
        const quote = await ctx.db.quote.findUnique({
          where: { id: input.quoteId },
          include: {
            lineItems: {
              include: {
                part: true
              }
            },
            supplier: {
              select: {
                organization: {
                  select: {
                    erpUrl: true
                  }
                }
              }
            }
          }
        });

        // authenticate with odoo
        const odooUrl = quote?.supplier.organization?.erpUrl;

        if (!odooUrl) {
          throw new Error("No ERP URL found");
        }

        const odooUid = await odooUtils.authenticate(odooUrl);

        if (typeof odooUid !== "number") {
          throw new Error("No ERP user id found");
        }

        // create purchase order object from quote
        const purchaseOrderObject = odooUtils.quoteToPurchaseOrder(quote);

        // create odoo purchase order object
        const purchaseOrderId = await odooUtils.createPurchaseOrder(
          odooUrl,
          odooUid,
          purchaseOrderObject
        );

        // update the quote object with the odoo purchase order id
        await ctx.db.quote.update({
          where: { id: input.quoteId },
          data: {
            erpPurchaseOrderId: purchaseOrderId
          }
        });

        // return odoo purchase order id
        return purchaseOrderId;
      } catch (error) {
        console.error("Error in createQuoteFromPdf:", error);
        throw new Error(`Error in createQuoteFromPdf: ${String(error)}`);
      }
    })
});
