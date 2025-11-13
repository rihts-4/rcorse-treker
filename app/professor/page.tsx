import React from "react";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import Header from "@/components/header";
import Link from "next/link";
import { Professor } from "../lib/definitions";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "../../convex/_generated/api";

/**
 * Server component that renders a searchable list of professors and their labs.
 *
 * Redirects unauthenticated users to "/" and shows results filtered by the optional `q` query.
 *
 * @param searchParams - An object (or a Promise resolving to an object) with an optional `q` string used to filter professors by name or lab.
 * @returns The page's JSX element containing the header, search input prefilled with `q`, and a table of professors (or a "No professors found" message).
 */
export default async function ProfessorsPage({
  searchParams,
}: {
  searchParams: { q?: string } | Promise<{ q?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const unwrappedSearchParams =
    typeof (searchParams as Promise<{ q?: string }>).then === "function"
      ? await (searchParams as Promise<{ q?: string }>)
      : (searchParams as { q?: string });
  const { q = "" } = unwrappedSearchParams;

  // Assuming a getProfessors query exists similar to getCourses
  const convexProfessors =
    (await fetchQuery(api.professors.getProfessors, { search: q })) ?? [];

  const professors: Professor[] = convexProfessors.map((prof) => ({
    ...prof,
    id: prof._id,
  }));

  const filtered = professors
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0d141b] tracking-light text-[32px] font-bold leading-tight min-w-72">
                Professors
              </p>
            </div>
            <div className="px-4 py-3">
              <form className="flex flex-col min-w-40 h-12 w-full" method="get">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div
                    className="text-[#4c739a] flex border-none bg-[#e7edf3] items-center justify-center pl-4 rounded-l-lg border-r-0"
                    data-icon="MagnifyingGlass" // This is an icon, not a search input
                    data-size="24px"
                    data-weight="regular"
                  >
                    <Search className="w-6 h-6 text-[#4c739a]" />
                  </div>
                  <Input
                    name="q"
                    placeholder="Search for a professor by name or lab"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-full placeholder:text-[#4c739a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    defaultValue={q}
                  />
                </div>
              </form>
            </div>
            <div className="px-4 py-3 @container">
              <div className="flex overflow-hidden rounded-lg border border-[#cfdbe7] bg-slate-50">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="table-column-professor px-4 py-3 text-left text-[#0d141b] w-[400px] text-sm font-medium leading-normal">
                        Professor
                      </th>
                      <th className="table-column-lab px-4 py-3 text-left text-[#0d141b] w-[400px] text-sm font-medium leading-normal">
                        Lab
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr className="border-t border-t-[#cfdbe7]">
                        <td
                          colSpan={2} // Adjusted colspan for the new column
                          className="px-4 py-6 text-center text-[#4c739a] text-sm"
                        >
                          No professors found{q ? ` for "${q}"` : ""}.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p) => (
                        <tr key={p.id} className="border-t border-t-[#cfdbe7]">
                          <td className="table-column-professor h-[72px] px-4 py-2 w-[400px] text-[#0d141b] text-sm font-normal leading-normal">
                            <Link
                              className="underline hover:text-[#1172d4]"
                              href={`/profdetail/${p.id}`}
                            >
                              {p.name}
                            </Link>
                          </td>
                          <td className="table-column-lab h-[72px] px-4 py-2 w-[400px] text-[#0d141b] text-sm font-normal leading-normal">
                            {p.lab || "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <style>{` // Updated responsive styles
                @container(max-width:400px){.table-column-lab{display: none;}}
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}