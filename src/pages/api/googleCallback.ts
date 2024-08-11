import { type NextApiRequest, type NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import {
  nylas,
  GOOGLE_APP_REDIRECT_ROUTE
} from "~/server/email/gmail/gmailHelper";
import { getNonHashBaseUrl } from "~/server/email/outlook/outlookHelper";
import { clerkClient } from "@clerk/clerk-sdk-node";

export default async function callbackHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);

  const code = req.query.code as string;

  if (!code) {
    // todo add error handling to the frontend - consuming the error in the redirect target router
    console.error("No code provided");
    res.redirect("/?error=true");
    return;
  }

  const { grantId } = await nylas.auth.exchangeCodeForToken({
    clientId: process.env.NYLAS_CLIENT_ID ?? "",
    code,
    redirectUri: `${getNonHashBaseUrl()}${GOOGLE_APP_REDIRECT_ROUTE}`,
    clientSecret: process.env.NYLAS_API_KEY ?? ""
  });

  // store user grant id in clerk user metadata
  await clerkClient?.users.updateUserMetadata(userId!, {
    publicMetadata: {
      googleGrantId: grantId
    }
  });

  res.redirect("/");
}
