import { ClerkProvider, SignInButton, SignedOut, SignedIn, SignIn } from "@clerk/nextjs";
import { type AppType } from "next/app";

import { api } from "~/utils/api";
import "~/styles/globals.css";
import { PageLayout } from "~/components/layout/layout";
import AuthenticationPage from "~/components/layout/auth-landing";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {

  return (
    <>
      <ClerkProvider appearance={{
        elements: {
          footer: "hidden",
        }
      }}>
        <Head>
          <title>Soff</title>
          <meta name="description" content="Built somewhere inbetween Hayes & Glen Park" />
          <link rel="icon" href="/beaver.ico" />
        </Head>
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
