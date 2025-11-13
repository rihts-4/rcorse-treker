import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

function RedirectToDashboard() {
  redirect("/dashboard");
  // This component will not render anything as it redirects.
  return null;
}

export default function Page() {
  return (
    <>
      <SignedIn>
        <RedirectToDashboard />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
