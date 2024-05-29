import type { PropsWithChildren } from "react"
import { cn } from "~/lib/utils"
import Sidebar from "./sidebar"
import Header from "./header"
import { fontInter } from "~/constants/font"
import Head from "next/head";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"


export const PageLayout = (props: PropsWithChildren) => {
  const user = useUser();
  return (
    <>
      <Head>
        <title>Soff</title>
        <meta name="description" content="Built somewhere inbetween Hayes & Glen Park" />
        <link rel="icon" href="/beaver.ico" />
      </Head>
      {!!user.isSignedIn &&
        <>
          <Header />
          <div className={cn("flex h-screen overflow-hidden", fontInter.variable)}>
            <Sidebar />
            <main className="w-full pt-16 font-sans antialiased">
              {props.children}
            </main>
          </div>
        </>}
      {!user.isSignedIn && <SignInButton />}
    </>
  )
} 