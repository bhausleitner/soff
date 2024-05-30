import { ClerkProvider, SignInButton, SignedOut, SignedIn, SignIn } from "@clerk/nextjs";
import { type AppType } from "next/app";

import { api } from "~/utils/api";
import "~/styles/globals.css";
import { PageLayout } from "~/components/layout/layout";
import AuthenticationPage from "~/components/layout/auth-landing";


const MyApp: AppType = ({ Component, pageProps }) => {

  return (
    <>
      <ClerkProvider appearance={{
        elements: {
          footer: "hidden",
        }
      }}>
        <SignedOut>
          <AuthenticationPage />
        </SignedOut>
        <SignedIn>
          <PageLayout>
            <Component {...pageProps} />
          </PageLayout>
        </SignedIn>
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
