import { ClerkProvider } from "@clerk/nextjs";
import { type AppType } from "next/app";

import { api } from "~/utils/api";
import "~/styles/globals.css";
import { PageLayout } from "~/components/layout/layout";


const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ClerkProvider>
        <PageLayout>
          <Component {...pageProps} />
        </PageLayout>
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
