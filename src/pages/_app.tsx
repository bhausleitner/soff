import { ClerkProvider, SignedOut, SignedIn } from "@clerk/nextjs";
import { type AppType } from "next/app";
import Head from "next/head";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { PageLayout } from "~/components/layout/layout";
import AuthenticationPage from "~/components/layout/auth-landing";
import { fontInter } from "~/constants/font";
import { TooltipProvider } from "~/components/ui/tooltip";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ClerkProvider
        appearance={{
          elements: {
            footer: "hidden"
          }
        }}
      >
        <TooltipProvider delayDuration={0}>
          <Head>
            <title>Soff</title>
            <meta
              name="description"
              content="Built somewhere inbetween Hayes & Glen Park"
            />
            <link rel="icon" href="/logo_white_blue_bg.ico" />
          </Head>
          <SignedOut>
            <AuthenticationPage />
          </SignedOut>
          <SignedIn>
            <PageLayout>
              <style jsx global>{`
                html {
                  font-family: ${fontInter.style.fontFamily};
                }
              `}</style>
              <Component {...pageProps} />
            </PageLayout>
          </SignedIn>
        </TooltipProvider>
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
