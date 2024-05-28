import Head from "next/head";

import { api } from "~/utils/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { Button } from "~/components/ui/button";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const user = useUser();

  return (
    <>
      <Head>
        <title>Soff</title>
        <meta name="description" content="Built somewhere inbetween Hayes & Glen Park" />
        <link rel="icon" href="/beaver.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-300">
        {/* {!user.isSignedIn && <SignInButton />}
        {!!user.isSignedIn && <SignOutButton />} */}

        <Button>Soff soff</Button>
      </main>
    </>
  );
}
