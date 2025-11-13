import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

/**
 * Redirects the current route to the /dashboard page.
 *
 * @returns `null` — no UI is rendered because navigation is performed.
 */
function RedirectToDashboard() {
  redirect("/dashboard");
  // This component will not render anything as it redirects.
  return null;
}

/**
 * Render a page that redirects users based on authentication state.
 *
 * When the user is authenticated, navigates to `/dashboard`. When the user is not
 * authenticated, initiates Clerk's sign-in flow.
 *
 * @returns A React element that conditionally triggers navigation for authenticated and unauthenticated users.
 */
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