import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  router.push("/suppliers");
}
