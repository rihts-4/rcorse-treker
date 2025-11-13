import React from "react"; // Import React for React.use()
import { fetchQuery } from "convex/nextjs"; // Keep existing import
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import Header from "@/components/header";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "../../convex/_generated/api";
import { Course } from "../lib/definitions";

/**
 * Render the authenticated Course Explorer page and its searchable course list.
 *
 * If the user is not authenticated this will redirect to the root path. The
 * function accepts searchParams (either an object or a Promise resolving to one)
 * and uses its optional `q` parameter to filter courses. Fetched courses are
 * normalized (Convex `_id` mapped to `id`) and sorted by `courseCode` before
 * being rendered in a responsive table with a search input.
 *
 * @param searchParams - An object or a Promise resolving to an object with an optional `q` search string
 * @returns The JSX element for the Course Explorer page
 */
export default async function CoursePage({
  searchParams, // Receive searchParams as is
}: {
  searchParams: { q?: string } | Promise<{ q?: string }>; // Adjust type to reflect potential Promise
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
  const convexCourses =
    (await fetchQuery(api.courses.getCourses, { search: q })) ?? [];
  const courses: Course[] = convexCourses.map((course) => ({
    ...course,
    id: course._id, // Map Convex's _id to the Course interface's id
  }));
  const sortedCourses = courses
    .slice()
    .sort((a, b) => a.courseCode - b.courseCode);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0d141b] tracking-light text-[32px] font-bold leading-tight">
                  Course Explorer
                </p>
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Explore courses offered at Ritsumeikan University
                </p>
              </div>
            </div>

            <div className="px-4 py-3">
              <form className="flex flex-col min-w-40 h-12 w-full" method="get">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div
                    className="text-[#4c739a] flex border-none bg-[#e7edf3] items-center justify-center pl-4 rounded-l-lg border-r-0"
                    data-icon="MagnifyingGlass"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <Search className="w-6 h-6 text-[#4c739a]" />
                  </div>
                  <Input
                    name="q"
                    placeholder="Search for courses by title or code"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-full placeholder:text-[#4c739a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    defaultValue={q}
                  />
                </div>
              </form>
            </div>

            <div className="px-4 py-3">
              {/* The top part had @container class. For checking later */}
              <div className="flex overflow-hidden rounded-lg border border-[#cfdbe7] bg-slate-50">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-[#0d141b] w-[400px] text-sm font-medium leading-normal">
                        Course Code
                      </th>
                      <th className="px-4 py-3 text-left text-[#0d141b] w-[400px] text-sm font-medium leading-normal">
                        Course Title
                      </th>
                      <th className="px-4 py-3 text-left text-[#0d141b] w-[400px] text-sm font-medium leading-normal">
                        Credit Type
                      </th>
                      <th className="px-4 py-3 text-left text-[#0d141b] w-[400px] text-sm font-medium leading-normal">
                        Credits
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCourses.map((course) => (
                      <tr
                        key={course.id}
                        className="border-t border-t-[#cfdbe7]"
                      >
                        <td
                          key={course.courseCode}
                          className="h-[72px] px-4 py-2 w-[400px] text-[#4c739a] text-sm font-normal leading-normal"
                        >
                          {course.courseCode}
                        </td>
                        <td
                          key={course.courseName}
                          className="h-[72px] px-4 py-2 w-[400px] text-[#0d141b] text-sm font-normal leading-normal"
                        >
                          <Link
                            className="underline hover:text-[#1172d4]"
                            href={`/coursedetail/${course.id}`}
                          >
                            {course.courseName}
                          </Link>
                        </td>
                        <td
                          key={course.category}
                          className="h-[72px] px-4 py-2 w-[400px] text-[#4c739a] text-sm font-normal leading-normal"
                        >
                          {course.category}
                        </td>
                        <td
                          key={course.credit}
                          className="h-[72px] px-4 py-2 w-[400px] text-[#4c739a] text-sm font-normal leading-normal"
                        >
                          {course.credit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}