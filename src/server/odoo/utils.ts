import { type Prisma, type LineItem, type Quote } from "@prisma/client";
import xmlrpc from "xmlrpc";

const db = process.env.ODOO_DB;
const username = process.env.ODOO_USERNAME;
const password = process.env.ODOO_PASSWORD;

type QuoteWithRelations = Prisma.QuoteGetPayload<{
  include: {
    lineItems: {
      include: {
        part: true;
      };
    };
    supplier: {
      select: {
        organization: {
          select: {
            erpUrl: true;
          };
        };
      };
    };
  };
}>;

interface PurchaseOrder {
  partner_id: number;
  currency_id: number;
  company_id: number;
  order_line: [number, number, OrderLine][];
}

interface OrderLine {
  product_id: number;
  product_qty: number;
  price_unit: number;
  name: string;
}

export function authenticate(odooUrl: string) {
  const commonClient = xmlrpc.createClient({
    url: `${odooUrl}/xmlrpc/2/common`
  });
  return new Promise((resolve, reject) => {
    commonClient.methodCall(
      "authenticate",
      [db, username, password, {}],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, uid: number) => {
        if (err) {
          return reject(err);
        }
        resolve(uid);
      }
    );
  });
}

export function quoteToPurchaseOrder(quote: QuoteWithRelations): PurchaseOrder {
  return {
    partner_id: 1, // Replace with the supplier's ID
    // date_order: new Date().toISOString(),
    order_line: quote?.lineItems.map((lineItem: LineItem) => [
      0,
      0,
      {
        product_id: lineItem.partId ?? 1, // Replace with the product's ID
        product_qty: lineItem.quantity ?? 10, // Quantity of the product
        price_unit: lineItem.price ?? 100, // Unit price of the product
        name: lineItem.description ?? "Product Description" // Description of the product
      }
    ]),
    currency_id: 1, // Replace with the currency's ID
    company_id: 1 // Replace with the company's ID
  };
}

export function createPurchaseOrder(
  odooUrl: string,
  uid: number,
  purchaseOrderData: any
): Promise<number> {
  const objectClient = xmlrpc.createClient({
    url: `${odooUrl}/xmlrpc/2/object`
  });
  return new Promise((resolve, reject) => {
    objectClient.methodCall(
      "execute_kw",
      [db, uid, password, "purchase.order", "create", [purchaseOrderData]],
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, purchaseOrderId: number) => {
        if (err) {
          return reject(err);
        }
        resolve(purchaseOrderId);
      }
    );
  });
}
