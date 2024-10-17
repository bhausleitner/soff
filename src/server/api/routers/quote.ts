import { z } from "zod";
import { Currency, QuoteStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { orderArraySchema } from "~/server/api/routers/supplier";
import openai from "~/server/openai/config";
import { getFileFromS3 } from "~/server/s3/utils";
import { convertPdfToImage } from "~/server/openai/utils";
import * as odooUtils from "~/server/odoo/utils";
import {
  type QuoteComparison,
  type QuotesInput,
  compareQuotes
} from "~/utils/quote-helper";

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
  fileKey: z.string().optional().nullable(),
  version: z.number(),
  supplier: z.object({
    name: z.string(),
    email: z.string(),
    organization: z
      .object({
        erpUrl: z.string().optional().nullable(),
        erpQuoteUrl: z.string().optional().nullable()
      })
      .nullable()
  })
});

export const quoteArraySchema = z.array(quoteSchema);

export const pricingTierSchema = z.object({
  id: z.number(),
  minQuantity: z.number(),
  maxQuantity: z.number().nullable(),
  price: z.number(),
  lineItemId: z.number()
});

export const lineItemSchema = z.object({
  id: z.number(),
  partId: z.number().nullable(),
  partIdString: z.string().nullable(),
  quantity: z.number().nullable(),
  price: z.number().nullable(),
  quoteId: z.number(),
  description: z.string().nullable(),
  leadTime: z.string().nullable(),
  pricingTiers: z.array(pricingTierSchema)
});

export const lineItemArraySchema = z.array(lineItemSchema);

export type PricingTier = z.infer<typeof pricingTierSchema>;
export type QuoteLineItem = z.infer<typeof lineItemSchema>;
export type QuoteLineItemTableData = z.infer<typeof lineItemArraySchema>;

const quoteIdSchema = z.object({
  quoteId: z.number()
});

export const parsedQuoteSchema = z.object({
  lineItems: z.array(
    z.object({
      partId: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      description: z.string(),
      rfqLineItemId: z.number().optional(),
      pricingTiers: z
        .array(
          z.object({
            minQuantity: z.number(),
            maxQuantity: z.number().optional().nullable(),
            price: z.number()
          })
        )
        .default([])
    })
  ),
  currency: z.nativeEnum(Currency)
});

export type ParsedQuoteData = z.infer<typeof parsedQuoteSchema>;

export type Quote = z.infer<typeof quoteSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;

export const quoteRouter = createTRPCRouter({
  createRawQuote: publicProcedure
    .input(
      z.object({
        supplierId: z.number(),
        fileKey: z.string(),
        parsedData: parsedQuoteSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newQuote = await ctx.db.quote.create({
        data: {
          supplierId: input.supplierId,
          price: input.parsedData?.lineItems.reduce(
            (acc: number, item: { unitPrice: number }) => acc + item.unitPrice,
            0
          ),
          status: QuoteStatus.RECEIVED,
          fileKey: input.fileKey
        }
      });

      await Promise.all(
        input.parsedData.lineItems.map((lineItem) =>
          ctx.db.lineItem.create({
            data: {
              quoteId: newQuote.id,
              partIdString: lineItem.partId,
              description: lineItem.description,
              quantity: lineItem.quantity,
              price: lineItem.unitPrice,
              rfqLineItemId: lineItem.rfqLineItemId,
              pricingTiers: {
                create: lineItem.pricingTiers.map((tier) => ({
                  minQuantity: tier.minQuantity,
                  maxQuantity: tier.maxQuantity,
                  price: tier?.price
                }))
              }
            }
          })
        )
      );

      return { quoteId: newQuote.id.toString() };
    }),
  createQuote: publicProcedure
    .input(
      z.object({
        supplierId: z.number(),
        chatId: z.number().optional(),
        fileKey: z.string(),
        parsedData: parsedQuoteSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
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
              price: input.parsedData?.lineItems.reduce(
                (acc: number, item: { unitPrice: number }) =>
                  acc + item.unitPrice,
                0
              ),
              status: QuoteStatus.RECEIVED,
              erpPurchaseOrderId: existingQuote.erpPurchaseOrderId,
              fileKey: input.fileKey,
              currency: input.parsedData.currency
            }
          });

          await Promise.all(
            input.parsedData.lineItems.map((lineItem) =>
              ctx.db.lineItem.create({
                data: {
                  quoteId: newQuote.id,
                  description: lineItem.description,
                  quantity: lineItem.quantity,
                  price: lineItem.unitPrice,
                  rfqLineItemId: lineItem.rfqLineItemId,
                  pricingTiers: {
                    create: lineItem.pricingTiers.map((tier) => ({
                      minQuantity: tier.minQuantity,
                      maxQuantity: tier.maxQuantity,
                      price: tier.price
                    }))
                  }
                }
              })
            )
          );

          return { quoteId: newQuote.id.toString() };
        } else {
          const newQuote = await ctx.db.quote.create({
            data: {
              chatId: input.chatId,
              supplierId: input.supplierId,
              price: input.parsedData?.lineItems.reduce(
                (acc: number, item: { unitPrice: number }) =>
                  acc + item.unitPrice,
                0
              ),
              status: QuoteStatus.RECEIVED,
              fileKey: input.fileKey
            }
          });

          await Promise.all(
            input.parsedData.lineItems.map((lineItem) =>
              ctx.db.lineItem.create({
                data: {
                  quoteId: newQuote.id,
                  description: lineItem.description,
                  quantity: lineItem.quantity,
                  price: lineItem.unitPrice,
                  rfqLineItemId: lineItem.rfqLineItemId,
                  pricingTiers: {
                    create: lineItem.pricingTiers.map((tier) => ({
                      minQuantity: tier.minQuantity,
                      maxQuantity: tier.maxQuantity,
                      price: tier.price
                    }))
                  }
                }
              })
            )
          );

          return { quoteId: newQuote.id.toString() };
        }
      } catch (error) {
        console.error("Error in createQuote:", error);
        throw new Error(`Error in createQuote: ${String(error)}`);
      }
    }),
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
              name: true,
              email: true,
              organization: {
                select: {
                  erpUrl: true,
                  erpQuoteUrl: true
                }
              }
            }
          }
        }
      });

      return quoteData;
    }),

  getQuoteById: publicProcedure
    .input(z.object({ quoteId: z.number() }))
    .query(async ({ ctx, input }) => {
      const quote = await ctx.db.quote.findUnique({
        where: { id: input.quoteId },
        include: {
          chat: {
            select: {
              subject: true
            }
          },
          supplier: {
            select: {
              name: true,
              contactPerson: true,
              email: true,
              organization: {
                select: {
                  erpUrl: true,
                  erpQuoteUrl: true
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
        subject: quote?.chat?.subject,
        supplierName: quote?.supplier?.name,
        supplierContactPerson: quote?.supplier?.contactPerson,
        supplierEmail: quote?.supplier?.email,
        erpUrl: quote?.supplier?.organization?.erpUrl,
        erpQuoteUrl: quote?.supplier?.organization?.erpQuoteUrl,
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
              name: true,
              organization: {
                select: {
                  erpUrl: true
                }
              }
            }
          }
        }
      });

      return quotes;
    }),
  getQuoteComparison: publicProcedure
    .input(z.array(z.number()))
    .query(async ({ ctx, input }) => {
      // if quotecomparison does not exist
      const existingQuoteComparison = await ctx.db.quoteComparison.findFirst({
        where: { quoteIds: { equals: input } }
      });

      if (existingQuoteComparison) {
        return JSON.parse(
          existingQuoteComparison.data as string
        ) as QuoteComparison[];
      }

      // if no quotecomparison exists, create a new one
      const quotes = await ctx.db.quote.findMany({
        where: { id: { in: input } },
        select: {
          id: true,
          lineItems: {
            select: {
              description: true,
              price: true,
              quantity: true,
              rfqLineItem: {
                select: {
                  id: true,
                  description: true
                }
              }
            }
          }
        }
      });

      const processedQuotes = quotes.map((quote) => ({
        ...quote,
        lineItems: quote.lineItems.map((item) => ({
          ...item,
          rfqLineItemDescription: item?.rfqLineItem?.description,
          rfqLineItem: undefined
        }))
      })) as QuotesInput[];

      const newQuoteComparison: QuoteComparison[] =
        compareQuotes(processedQuotes);

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
    .query(async ({ ctx, input }): Promise<QuoteLineItem[]> => {
      const lineItemData = await ctx.db.lineItem.findMany({
        where: { quoteId: input.quoteId },
        include: {
          pricingTiers: true
        }
      });

      return lineItemArraySchema.parse(lineItemData);
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
  parseQuoteDatafromPdf: publicProcedure
    .input(
      z.object({
        fileKey: z.string()
      })
    )
    .query(async ({ input }) => {
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
                  text: 'Given the following quote data, parse the table into the specified JSON format with the full lineitem description. Include pricing tiers if available, also get the currency which is either USD or EUR: {"lineItems":[{"partId":"A123","quantity":10,"unitPrice":100,"description":"Part 1 Description","pricingTiers":[{"minQuantity":1,"maxQuantity":50,"price":100},{"minQuantity":51,"maxQuantity":null,"price":90}]},{"partId":"B123","quantity":5,"unitPrice":200,"description":"Part 2 Description"}],"currency":"USD"}'
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

        const responseString = response.choices[0]?.message.content;
        const jsonRegex = /```json\n([\s\S]*?)\n```/;
        const match = responseString?.match(jsonRegex);

        if (!match?.[1]) {
          throw new Error("No JSON data found");
        }

        const parsedData = JSON.parse(match[1]) as ParsedQuoteData;

        // check if currency is USD or EUR, if not default to USD
        if (!Object.values(Currency).includes(parsedData.currency)) {
          parsedData.currency = Currency.USD;
        }

        return parsedData;
      } catch (error) {
        console.error("Error in parseQuoteDatafromPdf:", error);
        throw new Error(`Error in parseQuoteDatafromPdf: ${String(error)}`);
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
            lineItems: true,
            supplier: {
              select: {
                organization: {
                  select: {
                    id: true,
                    erpUrl: true,
                    name: true
                  }
                }
              }
            }
          }
        });

        // authenticate with odoo
        const odooUrl = quote?.supplier?.organization?.erpUrl;
        const orgName = quote?.supplier?.organization?.name?.toLowerCase();

        if (!odooUrl || !orgName) {
          throw new Error("No ERP url or Org name found");
        }

        const odooUid = await odooUtils.authenticate(odooUrl, orgName);

        if (typeof odooUid !== "number") {
          throw new Error("No ERP user id found");
        }

        if (!quote) {
          throw new Error("Quote not found");
        }

        // create purchase order object from quote
        const purchaseOrderObject = odooUtils.quoteToPurchaseOrder(quote);

        // create odoo purchase order object
        const purchaseOrderId = await odooUtils.createPurchaseOrder(
          odooUrl,
          odooUid,
          purchaseOrderObject,
          orgName
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
    }),
  askQuestionAboutLineItems: publicProcedure
    .input(
      z.object({
        quoteId: z.number(),
        question: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the line items for the given quote
      const lineItems = await ctx.db.lineItem.findMany({
        where: { quoteId: input.quoteId },
        select: {
          partIdString: true,
          description: true,
          quantity: true,
          price: true
        }
      });

      if (!lineItems.length) {
        throw new Error("No line items found");
      }

      // Prepare the prompt for the AI
      const prompt = `
        Given the following line items for quote #${input.quoteId}:
        ${JSON.stringify(lineItems, null, 2)}

        Please answer the following question:
        ${input.question}

        Provide a accurate and crisp answer based on the information given. Don't give markdown formatting.
      `;

      try {
        // Call the OpenAI API
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that answers questions about quote line items."
            },
            { role: "user", content: prompt }
          ],
          max_tokens: 500
        });

        // Extract the AI's response
        const answer = completion.choices[0]?.message?.content;

        if (!answer) {
          throw new Error("No answer generated");
        }

        return answer;
      } catch (error) {
        console.error("Error calling OpenAI:", error);
        throw new Error("Failed to generate an answer. Please try again.");
      }
    })
});
