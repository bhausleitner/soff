import { type NextApiRequest, type NextApiResponse } from "next";
import { initGraphClient } from "~/server/email/outlook/outlookHelper";

export default async function callbackHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await initGraphClient(req.query.code as string);

  res.redirect("/");
}
