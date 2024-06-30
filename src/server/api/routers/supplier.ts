import { z } from "zod";
import { Status } from "@prisma/client";
import sgMail from "@sendgrid/mail";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// init sendgrid mail client
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// define schema
const supplierSchema = z.object({
  title: z.string(),
  status: z.nativeEnum(Status),
  email: z.string().email()
});

const supplierArraySchema = z.array(supplierSchema);

// infer type from schema to keep frontend aligned
export type Supplier = z.infer<typeof supplierSchema>;

export const supplierRouter = createTRPCRouter({
  getAllSuppliers: publicProcedure.query(async ({ ctx }) => {
    // fetch data from db
    const supplierData = await ctx.db.supplier.findMany({
      select: {
        title: true,
        email: true,
        status: true
      }
    });
    // validate data using schema
    supplierArraySchema.parse(supplierData);

    // // send supplier db

    // const msg = {
    //   to: "behausleitner@gmail.com", // Change to your recipient
    //   from: "berni@soff.ai", // Change to your verified sender
    //   subject: "Hello From Soff!",
    //   text: "and easy to do anywhere, even with Node.js",
    //   html: "<strong>and easy to do anywhere, even with Soff ;-)</strong>"
    // };
    // sgMail
    //   .send(msg)
    //   .then(() => {
    //     console.log("Email sent");
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
    // return
    return supplierData;
  })
});
