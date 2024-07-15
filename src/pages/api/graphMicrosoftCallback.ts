import { type NextApiRequest, type NextApiResponse } from "next";
import { initMsGraphClient } from "~/server/email/outlook/outlookHelper";
import { getAuth } from "@clerk/nextjs/server";

export default async function callbackHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);
  await initMsGraphClient(req.query.code as string, userId!);

  res.redirect("/");
}
