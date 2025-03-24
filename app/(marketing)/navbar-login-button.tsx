import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";
import Link from "next/link";

export default async function NavbarLoginButton() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <Button size="sm" asChild>
        <Link href="/auth/login">Log in</Link>
      </Button>
    );
  }

  return (
    <Button size="sm" variant="ghost" asChild>
      <Link href="/auth/logout">Log out</Link>
    </Button>
  );
}
