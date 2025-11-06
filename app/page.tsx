"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import type { Id } from "@/convex/_generated/dataModel";
import { useEffect } from "react";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timePeriods = [1, 2, 3, 4, 5, 6, 7, 8]; // Assuming 8 periods per day

export default function DashboardPage() {
  const { user } = useUser();
  const createUser = useMutation(api.messages.createUser);
  const currentUser = useQuery(api.messages.getCurrentUser);

  // Auto-create user on first load
  useEffect(() => {
    if (user && currentUser === null) {
      createUser({
        email: user.emailAddresses[0]?.emailAddress || "",
      });
    }
  }, [user, currentUser, createUser]);

  return (
    <div className="container mx-auto p-4">
      <SignedOut>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Course Tracker</h1>
          <p className="mb-4">Please sign in to view your schedule.</p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <ScheduleView />
      </SignedIn>
    </div>
  );
}

function ScheduleView() {
  const currentUser = useQuery(api.messages.getCurrentUser);

  // Fetch schedule only when we have the user and their current semester
  const schedule = useQuery(
    api.messages.getScheduleForCurrentUser,
    currentUser ? { semester: currentUser.semester } : "skip"
  );

  if (!currentUser || !schedule) {
    return <div>Loading your schedule...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">My Schedule</h1>
      <p className="text-lg text-gray-600 mb-6">
        Displaying schedule for semester:{" "}
        <span className="font-semibold">{currentUser.semester}</span>
      </p>

      <div className="grid grid-cols-6 gap-1 text-center font-bold">
        <div className="p-2">Time</div>
        {daysOfWeek.map((day) => (
          <div key={day} className="p-2 border-b">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-1 text-center">
        {timePeriods.map((period) => (
          <>
            <div key={`time-${period}`} className="p-4 border-r font-semibold">
              Period {period}
            </div>
            {daysOfWeek.map((day) => {
              const scheduleItem = schedule.find(
                (item) => item.day === day && item.period === period
              );
              return (
                <div
                  key={`${day}-${period}`}
                  className="border-b border-r p-2 min-h-20"
                >
                  {scheduleItem ? (
                    <CourseCard courseId={scheduleItem.courseId} />
                  ) : (
                    <div className="text-gray-400">-</div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function CourseCard({ courseId }: { courseId: Id<"courses"> }) {
  const course = useQuery(api.courses.getCourseById, { courseId });

  if (!course) {
    return <div className="text-sm">Loading course...</div>;
  }

  return (
    <div className="bg-blue-100 p-2 rounded-lg text-left text-sm h-full">
      <p className="font-bold">{course.courseName}</p>
      <p>Code: {course.courseCode}</p>
      <p>Loc: {course.location}</p>
    </div>
  );
}
