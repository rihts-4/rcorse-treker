import Link from "next/link";
import { Button } from "./ui/button";
import { SignOutButton, UserButton } from "@clerk/nextjs";

/**
 * Renders the application's top header with branding, primary navigation, and user account control.
 *
 * The header includes a logo and title ("Ritsurate") on the left, four navigation links (Dashboard, Courses,
 * Professors, Schedule Builder), and a user account button on the right.
 *
 * @returns A JSX header element containing the logo/title, navigation links, and a user account control.
 */
export default function Header() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf3] px-10 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 text-[#0d141b]">
          <div className="size-6">
            <img src="/logo.svg" alt="Logo" />
          </div>
          <h2 className="text-[#0d141b] text-lg font-bold leading-tight">
            Ritsurate
          </h2>
        </div>
        <div className="flex items-center gap-9">
          <Link
            className="text-[#0d141b] text-sm font-medium leading-normal"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-[#0d141b] text-sm font-medium leading-normal"
            href="/course"
          >
            Courses
          </Link>
          <Link
            className="text-[#0d141b] text-sm font-medium leading-normal"
            href="/professor"
          >
            Professors
          </Link>
          <Link
            className="text-[#0d141b] text-sm font-medium leading-normal"
            href="/schedule"
          >
            Schedule Builder
          </Link>
        </div>
      </div>
      <UserButton />
    </header>
  );
}