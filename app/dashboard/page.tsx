"use client";

import Header from "@/components/header";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [semester, setSemester] = useState<string>("Fall");

  useEffect(() => {
    // Wait for Clerk to load before checking for a user
    if (isLoaded && !userId) {
      router.replace("/");
    }
  }, [isLoaded, userId, router]);

  const entries = useQuery(
    api.schedule.getSchedule,
    userId ? { userId, semester } : "skip"
  );

  const map = useMemo(() => {
    const m: Record<string, any> = {};
    if (entries) {
      for (const e of entries) {
        if (e) {
          const key = `${e.day}-${e.period}`;
          m[key] = e;
        }
      }
    }
    return m;
  }, [entries]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0d141b] tracking-light text-[32px] font-bold leading-tight">
                  Dashboard
                </p>
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Overview
                </p>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="semesterSelect"
                  className="text-sm font-medium text-[#0d141b] mb-1"
                >
                  Select Semester
                </label>
                <select
                  id="semesterSelect"
                  value={semester}
                  onChange={(e) => {
                    const newSemester = e.target.value;

                    setSemester(newSemester);
                  }}
                  className="border border-[#cfdbe7] rounded-md p-2 text-sm text-[#0d141b] bg-white"
                >
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                </select>
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="overflow-hidden rounded-lg border border-[#cfdbe7] bg-slate-50">
                <table className="w-full table-fixed border-collapse shadow-lg">
                  <thead>
                    <tr className="bg-[#e6eef7]">
                      <th className="w-32 px-4 py-3 text-center text-[#0d141b] text-base font-bold border border-[#cfdbe7]">
                        Period
                      </th>
                      <th className="px-4 py-3 text-center text-[#0d141b] text-base font-bold border border-[#cfdbe7]">
                        Time
                      </th>
                      <th className="px-4 py-3 text-center text-[#0d141b] text-base font-bold border border-[#cfdbe7]">
                        Mon
                      </th>
                      <th className="px-4 py-3 text-center text-[#0d141b] text-base font-bold border border-[#cfdbe7]">
                        Tue
                      </th>
                      <th className="px-4 py-3 text-center text-[#0d141b] text-base font-bold border border-[#cfdbe7]">
                        Wed
                      </th>
                      <th className="px-4 py-3 text-center text-[#0d141b] text-base font-bold border border-[#cfdbe7]">
                        Thu
                      </th>
                      <th className="px-4 py-3 text-center text-[#0d141b] text-base font-bold border border-[#cfdbe7]">
                        Fri
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { period: "1st", time: "09:00 - 10:35" },
                      { period: "2nd", time: "10:45 - 12:20" },
                      { period: "3rd", time: "13:10 - 14:45" },
                      { period: "4th", time: "14:55 - 16:30" },
                      { period: "5th", time: "16:40 - 18:15" },
                      { period: "6th", time: "18:25 - 20:00" },
                      { period: "7th", time: "20:10 - 21:45" },
                    ].map(({ period, time }, idx) => (
                      <tr
                        key={period}
                        className={
                          idx % 2 === 0
                            ? "bg-white hover:bg-blue-50"
                            : "bg-[#f6fafd] hover:bg-blue-50"
                        }
                      >
                        <td className="w-32 px-4 py-3 text-center text-[#0d141b] text-sm font-semibold border border-[#cfdbe7]">
                          {period}
                        </td>
                        <td className="px-4 py-3 text-center text-[#4c739a] text-sm border border-[#cfdbe7]">
                          {time}
                        </td>
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                        ].map((day) => {
                          const key = `${day}-${idx + 1}`;
                          const entry = map[key];
                          return (
                            <td
                              key={day}
                              className="px-4 py-3 text-center text-[#0d141b] text-sm border border-[#cfdbe7]"
                            >
                              {entry ? (
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold">
                                    {entry.courseName}
                                  </span>
                                  <span className="text-xs text-[#4c739a]">
                                    {entry.location}
                                  </span>
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
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
