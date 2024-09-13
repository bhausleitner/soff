import { type Prisma, type LineItem } from "@prisma/client";
import xmlrpc from "xmlrpc";
import { db } from "~/server/db";

type OdooSupplier = {
  id: number;
  name: string;
  email: string | false;
  phone: string | false;
  function: string | false;
  company_id: false;
  country_id: [number, string] | false;
  display_name: string;
  parent_id: [number, string] | false;
  city: string | false;
  street: string | false;
  street2: string | false;
  zip: string | false;
};

const DB = {
  soff: "shoesoff",
  navvis: "prod-navvis"
};

const USERNAME = {
  soff: process.env.SOFF_ODOO_USERNAME,
  navvis: process.env.NAVVIS_ODOO_USERNAME
};

const PASSWORD = {
  soff: process.env.SOFF_ODOO_PASSWORD,
  navvis: process.env.NAVVIS_ODOO_PASSWORD
};

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

export async function authenticate(
  odooUrl: string,
  orgName: string
): Promise<number | undefined> {
  try {
    // XML-RPC client for common services (authentication)
    const commonClient = xmlrpc.createSecureClient(
      `${odooUrl}/xmlrpc/2/common`
    );

    // Promisify the client call to use async/await
    const commonCall = (method: string, params: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        commonClient.methodCall(method, params, (error, value) => {
          if (error) reject(error);
          else resolve(value);
        });
      });
    };
    // Get the uid of the authenticated user
    const uid = await commonCall("authenticate", [
      DB[orgName as keyof typeof DB],
      USERNAME[orgName as keyof typeof USERNAME],
      PASSWORD[orgName as keyof typeof PASSWORD],
      {}
    ]);

    if (!uid) {
      throw new Error("Authentication failed");
    }

    console.log(`Authenticated successfully. User ID: ${uid}`);
    return uid as number;
  } catch (error) {
    console.error("Authentication error:", error);
  }
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
  purchaseOrderData: any,
  orgName: string
): Promise<number> {
  const objectClient = xmlrpc.createSecureClient(`${odooUrl}/xmlrpc/2/object`);
  return new Promise((resolve, reject) => {
    objectClient.methodCall(
      "execute_kw",
      [
        DB[orgName as keyof typeof DB],
        uid,
        PASSWORD[orgName as keyof typeof PASSWORD],
        "purchase.order",
        "create",
        [purchaseOrderData]
      ],
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

export function getAllContacts(
  odooUrl: string,
  uid: number,
  orgName: string
): Promise<OdooSupplier[]> {
  const objectClient = xmlrpc.createSecureClient(`${odooUrl}/xmlrpc/2/object`);
  return new Promise((resolve, reject) => {
    objectClient.methodCall(
      "execute_kw",
      [
        DB[orgName as keyof typeof DB],
        uid,
        PASSWORD[orgName as keyof typeof PASSWORD],
        "res.partner",
        "search_read",
        [[]], // Empty domain to get all contacts
        {
          fields: [
            "name",
            "email",
            "phone",
            "function",
            "country_id",
            "display_name",
            "parent_id",
            "city",
            "street",
            "street2",
            "zip",
            "country_id"
          ],
          limit: 0 // Set to 0 to get all records
        }
      ],
      (err: any, contacts: any[]) => {
        if (err) {
          return reject(err);
        }
        resolve(contacts);
      }
    );
  });
}

// import fs from "fs";

// syncSuppliers("https://soff.odoo.com", 2, "soff", 2);

export async function syncSuppliers(
  odooUrl: string,
  odooUid: number,
  orgName: string,
  orgId: number
) {
  const suppliers = await getAllContacts(odooUrl, odooUid, orgName);

  // iterate through suppliers, if parent_id = false
  // check if supplier already exists in db, if not -> create new supplier

  for (const supplier of suppliers) {
    // if parent supplier already exists -> return
    const supplierExists =
      (await db.supplier.findFirst({
        where: {
          erpId: supplier.id,
          organizationId: orgId
        }
      })) !== null;

    if (supplierExists) {
      return;
    }

    if (supplier.parent_id === false) {
      // this is a parent supplier
      await db.supplier.create({
        data: {
          name: supplier.name ? supplier.name.trim() : "",
          erpId: supplier.id,
          email: supplier.email ? supplier.email.trim() : "",
          phone: supplier.phone ? supplier.phone.trim() : "",
          function: supplier.function ? supplier.function.trim() : "",
          city: supplier.city ? supplier.city.trim() : "",
          street: supplier.street ? supplier.street.trim() : "",
          street2: supplier.street2 ? supplier.street2.trim() : "",
          zip: supplier.zip ? supplier.zip.trim() : "",
          country: supplier.country_id ? supplier.country_id[1] : "",
          organizationId: orgId
        }
      });
    } else {
      // this is a child supplier
      let parentSupplier = await db.supplier.findFirst({
        where: {
          erpId: supplier.parent_id[0],
          organizationId: orgId
        },
        select: {
          id: true,
          name: true
        }
      });

      // if parent supplier does not exist -> create it
      if (!parentSupplier) {
        const rawParentSupplier = suppliers.find((supplier: OdooSupplier) => {
          if (
            Array.isArray(supplier.parent_id) &&
            supplier.id === supplier.parent_id[0]
          ) {
            return supplier;
          }
        });

        if (rawParentSupplier) {
          const rawParentSupplierExists =
            (await db.supplier.findFirst({
              where: {
                erpId: rawParentSupplier.id,
                organizationId: orgId
              }
            })) !== null;

          if (rawParentSupplierExists) {
            return;
          }

          parentSupplier = await db.supplier.create({
            data: {
              name: rawParentSupplier?.name
                ? rawParentSupplier.name.trim()
                : "",
              erpId: rawParentSupplier.id,
              email: rawParentSupplier.email
                ? rawParentSupplier.email.trim()
                : "",
              phone: rawParentSupplier.phone
                ? rawParentSupplier.phone.trim()
                : "",
              function: rawParentSupplier.function
                ? rawParentSupplier.function.trim()
                : "",
              city: rawParentSupplier.city ? rawParentSupplier.city.trim() : "",
              street: rawParentSupplier.street
                ? rawParentSupplier.street.trim()
                : "",
              street2: rawParentSupplier.street2
                ? rawParentSupplier.street2.trim()
                : "",
              zip: rawParentSupplier.zip ? rawParentSupplier.zip.trim() : "",
              country: rawParentSupplier.country_id
                ? rawParentSupplier.country_id[1]
                : "",
              organizationId: orgId
            }
          });
        }
      }

      await db.supplier.create({
        data: {
          name:
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            parentSupplier && parentSupplier.name ? parentSupplier.name : "",
          contactPerson: supplier.name ? supplier.name : "",
          erpId: supplier.id,
          email: supplier.email ? supplier.email : "",
          phone: supplier.phone ? supplier.phone : "",
          function: supplier.function ? supplier.function : "",
          city: supplier.city ? supplier.city : "",
          street: supplier.street ? supplier.street : "",
          street2: supplier.street2 ? supplier.street2 : "",
          zip: supplier.zip ? supplier.zip : "",
          country: supplier.country_id ? supplier.country_id[1] : "",
          supplierParentId: parentSupplier ? parentSupplier.id : null,
          organizationId: orgId
        }
      });
    }
  }
}
