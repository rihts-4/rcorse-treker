import Link from "next/link";
import StarRating from "@/components/StarRating";
import type { Route } from "next";
import Header from "@/components/header";
import { Course, Professor, Review } from "@/app/lib/definitions";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Doc } from "../../../convex/_generated/dataModel";

/**
 * Render the course detail page for the specified course.
 *
 * @param params - Route parameters; `params.id` is the course ID used to fetch details
 * @returns The page's JSX rendering course metadata, ratings, reviews, and a review submission form
 */
export default async function CourseDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const unwrappedParams =
    typeof (params as Promise<{ id: string }>).then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });

  const { id: courseId } = unwrappedParams;
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const data = await fetchQuery(api.courses.getCourseDetails, {
    courseId: courseId as Id<"courses">,
  });

  if (!data || !data.course) {
    return (
      <div className="px-8 py-12">
        <p className="text-red-600">Course not found.</p>
        <Link className="text-blue-600 underline" href="/course">
          Go back to courses
        </Link>
      </div>
    );
  }

  const course: Course = { ...data.course, id: data.course._id };
  const fetchedProfessors: (Doc<"professors"> | null)[] = data.professors;
  // Filter out null values before mapping
  const professors: Professor[] = fetchedProfessors
    .filter((p): p is Doc<"professors"> => p !== null)
    .map((p: Doc<"professors">) => ({
      id: p._id,
      name: p.name, // Explicitly map name as string
      email: p.email, // email is optional in both interfaces
    }));
  const reviews: Review[] = data.reviews.map((r: Doc<"reviews">) => ({
    id: r._id,
    courseId: r.courseId,
    // Assert rating type to match the Review interface's literal union
    rating: r.rating as 1 | 2 | 3 | 4 | 5,
    comment: r.comment,
    // Convert _creationTime (number) to string for createdAt
    // You can choose a different date format if needed (e.g., .toLocaleDateString())
    createdAt: new Date(r._creationTime).toISOString(),
  }));
  const avg = data.avg;
  const count = data.count;
  const distribution = data.distribution;

  // Server Action for submitting a review
  const submitReviewAction = async (formData: FormData) => {
    "use server";

    const rating = Number(formData.get("rating"));
    const comment = formData.get("comment") as string;
    const courseId = formData.get("courseId") as Id<"courses">;

    if (!userId) {
      // This should ideally not happen if the page is protected, but good for type safety
      redirect("/");
    }

    await fetchMutation(api.reviews.submitReview, {
      courseId: courseId,
      userId: userId as Id<"users">, // Assuming Clerk userId maps directly to Convex users table _id
      rating: rating,
      comment: comment,
    });

    // Revalidate the path to show the new review
    redirect(`/coursedetail/${courseId}`);
  };

  // Assuming a course has at least one professor for display purposes
  const prof = professors[0];
  const pct = (n: number) => (count ? Math.round((n / count) * 100) : 0);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* <div className="flex flex-wrap gap-2 p-4">
              <Link className="text-[#4c739a] text-base font-medium leading-normal" href="/course">Courses</Link>
              <span className="text-[#4c739a] text-base font-medium leading-normal">/</span>
              <span className="text-[#0d141b] text-base font-medium leading-normal">{course.courseName}</span>
            </div> */}

            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0d141b] tracking-light text-[32px] font-bold leading-tight">
                  {course.courseName}
                </p>
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  {course.courseCode} • {course.category}
                </p>
              </div>
            </div>

            <h2 className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Course Information
            </h2>
            <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cfdbe7] py-5">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Credit Type
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {course.category}
                </p>
              </div>
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cfdbe7] py-5">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Semester
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {course.semester}
                </p>
              </div>
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cfdbe7] py-5">
                <p className="text-[#4c739a] text-sm font-normal leading-normal">
                  Professor(s)
                </p>
                <p className="text-[#0d141b] text-sm font-normal leading-normal">
                  {prof.name}
                </p>
              </div>
            </div>

            <h2 className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Overall Ratings
            </h2>
            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-[#0d141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                  {avg.toFixed(1)}
                </p>
                <div
                  className="flex gap-0.5"
                  aria-label={`Average rating ${avg.toFixed(1)} out of 5`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={
                        i < Math.round(avg)
                          ? "text-[#1172d4]"
                          : "text-[#adc2d7]"
                      }
                    >
                      <Star size={20} fill="currentColor" />
                    </div>
                  ))}
                </div>
                <p className="text-[#0d141b] text-base font-normal leading-normal">
                  {count} review{count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="contents">
                    <p
                      key={`l-${star}`}
                      className="text-[#0d141b] text-sm font-normal leading-normal"
                    >
                      {star}
                    </p>
                    <div
                      key={`b-${star}`}
                      className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#cfdbe7]"
                    >
                      <div
                        className="rounded-full bg-[#1172d4]"
                        style={{
                          width: `${pct(
                            distribution[star as 1 | 2 | 3 | 4 | 5]
                          )}%`,
                        }}
                      />
                    </div>
                    <p
                      key={`r-${star}`}
                      className="text-[#4c739a] text-sm font-normal leading-normal text-right"
                    >
                      {pct(distribution[star as 1 | 2 | 3 | 4 | 5])}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Reviews
            </h2>
            <div className="flex flex-col gap-8 overflow-x-hidden bg-slate-50 p-4">
              {reviews.length === 0 ? (
                <p className="text-[#4c739a] text-sm">
                  No reviews yet. Be the first to add one below.
                </p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="flex flex-col gap-3 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        {((r as Review).createdAt &&
                          new Date((r as Review).createdAt).toLocaleString([], {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })) ||
                          ""}
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={
                            i < r.rating ? "text-[#1172d4]" : "text-[#adc2d7]"
                          }
                        >
                          <Star size={20} fill="currentColor" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[#0d141b] text-base font-normal leading-normal line-clamp-4">
                      {r.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-6">
              <form
                action={submitReviewAction}
                className="flex flex-col gap-3 max-w-xl"
              >
                <Input type="hidden" name="courseId" value={course.id} />
                <label className="text-sm text-[#0d141b] font-medium">
                  Add your rating
                </label>
                <StarRating name="rating" value={5} />
                <textarea
                  name="comment"
                  placeholder="Share your experience..."
                  className="form-textarea min-h-28 rounded-md border border-[#cfdbe7] p-3"
                  required
                />
                <Button className="flex items-center justify-center h-10 rounded-lg bg-[#1172d4] text-white px-4 text-sm font-bold">
                  Submit Review
                </Button>
              </form>
            </div>

            <div className="flex justify-stretch">
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
                <Link
                  href={`/profdetail/${prof.id}` as Route}
                  className="flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf3] text-[#0d141b] text-sm font-bold"
                >
                  View {prof.name}'s Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}