import { ClerkProvider } from "@clerk/nextjs";
import { type AppType } from "next/app";

import { api } from "~/utils/api";
import "~/styles/globals.css";
import { Inter as FontSans } from "next/font/google"
import { cn } from "~/lib/utils"
import Header from "~/components/layout/header"
import Sidebar from "~/components/layout/sidebar"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})


const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ClerkProvider>
        <Header />
        <main className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
          <Sidebar />
          <Component {...pageProps} />
        </main>
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
