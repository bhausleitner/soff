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
  street2: false;
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
): Promise<any[]> {
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

export async function syncSuppliers(
  odooUrl: string,
  odooUid: number,
  orgName: string,
  orgId: number
) {
  const suppliers = await getAllContacts(odooUrl, odooUid, orgName);

  // iterate through suppliers, if parent_id = false -> create new supplier
  async function createSupplier(supplier: OdooSupplier) {
    if (supplier.parent_id === false) {
      // if supplier already exists -> return
      const supplierExists =
        (await db.supplier.findFirst({
          where: {
            erpId: supplier.id,
            organizationId: orgId
          },
          select: {
            id: true
          }
        })) !== null;

      if (supplierExists) {
        return;
      }
      await db.supplier.create({
        data: {
          name: supplier.name ? supplier.name : "",
          erpId: supplier.id,
          email: supplier.email ? supplier.email : "",
          phone: supplier.phone ? supplier.phone : "",
          function: supplier.function ? supplier.function : "",
          city: supplier.city ? supplier.city : "",
          street: supplier.street ? supplier.street : "",
          street2: supplier.street2 ? (supplier.street2 as string) : "",
          zip: supplier.zip ? supplier.zip : "",
          country: supplier.country_id ? supplier.country_id[1] : "",
          organizationId: orgId
        }
      });
    }
  }

  // iterate through suppliers again, if parent_id exists -> create contact object and add to suppliers
  async function createContact(supplier: OdooSupplier) {
    if (supplier.parent_id !== false) {
      const contactExists =
        (await db.supplier.findFirst({
          where: {
            erpId: supplier.id,
            organizationId: orgId
          }
        })) !== null;

      if (contactExists) {
        return;
      }

      const parentSupplier = await db.supplier.findFirst({
        where: {
          erpId: supplier.parent_id[0],
          organizationId: orgId
        },
        select: {
          id: true,
          name: true
        }
      });

      if (!parentSupplier) {
        return;
      }

      await db.supplier.create({
        data: {
          name: parentSupplier.name ? parentSupplier.name : "",
          contactPerson: supplier.name ? supplier.name : "",
          erpId: supplier.id,
          email: supplier.email ? supplier.email : "",
          phone: supplier.phone ? supplier.phone : "",
          function: supplier.function ? supplier.function : "",
          city: supplier.city ? supplier.city : "",
          street: supplier.street ? supplier.street : "",
          street2: supplier.street2 ? (supplier.street2 as string) : "",
          zip: supplier.zip ? supplier.zip : "",
          country: supplier.country_id ? supplier.country_id[1] : "",
          supplierParentId: parentSupplier.id,
          organizationId: orgId
        }
      });
    }
  }

  // Create suppliers first
  await Promise.all(suppliers.map(createSupplier));

  // Then create contacts
  await Promise.all(suppliers.map(createContact));
}
