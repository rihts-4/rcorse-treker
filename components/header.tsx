import Link from "next/link";
import { Button } from "./ui/button";
import { SignOutButton, UserButton } from "@clerk/nextjs";

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
