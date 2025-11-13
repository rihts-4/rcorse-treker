"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

/**
 * Render the user's timetable interface with semester selection, a day/period grid, and an add/remove course modal.
 *
 * Fetches available courses and the user's schedule, redirects unauthenticated users to the home page, and provides UI and handlers to add or remove schedule items for specific day/period slots.
 *
 * @returns The React element for the timetable page.
 */
export default function TimetablePage() {
  const router = useRouter();

  const { userId, isLoaded } = useAuth();
  const [semester, setSemester] = useState<string>("Fall");

  const allCourses = useQuery(api.schedule.getCoursesForScheduler);
  const scheduleItems = useQuery(
    api.schedule.getSchedule,
    userId ? { userId, semester } : "skip"
  );

  const saveScheduleItem = useMutation(api.schedule.saveScheduleItem);
  const removeScheduleItem = useMutation(api.schedule.removeScheduleItem);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    semester: string;
    day: string;
    period: number;
  } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseSelection, setCourseSelection] = useState<any[]>([]);

  const timetable = useMemo(() => {
    const map: Record<string, any> = {};
    if (scheduleItems) {
      for (const item of scheduleItems) {
        if (item) {
          const key = `${item.day}-${item.period}`;
          map[key] = { ...item, id: item._id };
        }
      }
    }
    return map;
  }, [scheduleItems]);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.replace("/");
    }
  }, [isLoaded, userId, router]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  const handleOpenModal = (semester: string, day: string, period: number) => {
    setSelectedSlot({ semester, day, period });
    if (allCourses) {
      setCourseSelection(
        allCourses.filter(
          (c) => c.semester === semester && c.day === day && c.period === period
        )
      );
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    setSelectedCourse(null);
  };

  const handleSaveCourse = async () => {
    if (!selectedSlot || !selectedCourse || !userId) return;

    try {
      await saveScheduleItem({
        userId,
        semester: selectedSlot.semester,
        day: selectedSlot.day,
        period: selectedSlot.period,
        courseId: selectedCourse as any,
      });
    } catch (e) {
      console.error("Failed to save schedule item", e);
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Failed to save. ${msg}`);
    }
    handleCloseModal();
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0d141b] tracking-light text-[32px] font-bold leading-tight min-w-72">
                Timetable
              </p>
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
              <div className="flex overflow-hidden rounded-lg border border-[#cfdbe7] bg-slate-50">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-center text-[#0d141b] w-[400px] text-sm font-medium leading-normal"></th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="px-4 py-3 text-center text-[#4c739a] text-sm font-medium leading-normal w-60"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr key={period} className="border-t border-t-[#cfdbe7]">
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#0d141b] text-sm font-normal leading-normal">
                          Period {period}
                        </td>
                        {days.map((day) => {
                          const key = `${day}-${period}`;
                          const assigned = timetable[key];
                          return (
                            <td
                              key={key}
                              className="h-[72px] px-4 py-2 w-60 text-center"
                            >
                              {assigned ? (
                                <div className="flex flex-col items-center text-sm font-medium text-[#0d141b]">
                                  <p>{assigned.courseName}</p>
                                  <p className="text-[#4c739a] text-xs">
                                    {assigned.location}
                                  </p>
                                  <p
                                    onClick={async () => {
                                      if (
                                        window.confirm(
                                          `Remove "${assigned.courseName}"?`
                                        )
                                      ) {
                                        try {
                                          if (!userId) return;
                                          await removeScheduleItem({
                                            userId,
                                            semester,
                                            day,
                                            period,
                                          });
                                        } catch (e) {
                                          console.error(
                                            "Failed to remove schedule item",
                                            e
                                          );
                                          alert(
                                            "Failed to remove. Please try again."
                                          );
                                        }
                                      }
                                    }}
                                    className="mt-1 text-[10px] text-red-600 cursor-pointer hover:underline"
                                  >
                                    Remove
                                  </p>
                                </div>
                              ) : (
                                <Button
                                  onClick={() =>
                                    handleOpenModal(semester, day, period)
                                  }
                                  className="w-full h-full text-[#4c739a] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#e7edf3] cursor-pointer rounded-md"
                                >
                                  Add Class
                                </Button>
                              )}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
            <h2 className="text-[#0d141b] text-lg font-bold mb-4">Add Class</h2>
            {selectedSlot && (
              <p className="text-[#4c739a] text-sm mb-4">
                Selected: <strong>{selectedSlot.day}</strong> - Period{" "}
                {selectedSlot.period}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="courseSelect"
                  className="text-sm font-medium text-[#0d141b]"
                >
                  Choose a course
                </label>
                <select
                  id="courseSelect"
                  value={selectedCourse ?? ""}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="border border-[#cfdbe7] rounded-md p-2 text-sm"
                >
                  <option value="">Select a Course</option>
                  {courseSelection.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseName} at {course.location}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleSaveCourse}
                className="bg-[#1172d4] text-white font-bold rounded-md py-2 mt-2"
              >
                Save
              </Button>
              <Button
                onClick={() => handleCloseModal()}
                className="w-full bg-[#e7edf3] text-[#0d141b] font-medium rounded-md py-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}