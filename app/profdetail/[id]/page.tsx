import Header from "@/components/header";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import { Course, Professor, Review } from "@/app/lib/definitions";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id, Doc } from "../../../convex/_generated/dataModel";

export default async function ProfessorDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const unwrappedParams =
    typeof (params as Promise<{ id: string }>).then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });

  const data = await fetchQuery(api.professors.getProfessorDetails, {
    professorId: unwrappedParams.id as Id<"professors">,
  });

  if (!data || !data.professor) {
    return (
      <div className="px-8 py-12">
        <p className="text-red-600">Professor not found.</p>
        <Link className="text-blue-600 underline" href="/professor">
          Back to Professors
        </Link>
      </div>
    );
  }

  const prof: Professor = { ...data.professor, id: data.professor._id };
  const courses: Course[] = data.courses
    .filter((c): c is Doc<"courses"> => c !== null)
    .map((c: Doc<"courses">) => ({
      ...c,
      id: c._id,
    }));
  const reviews: Review[] = data.reviews.map((r: Doc<"reviews">) => ({
    ...r,
    id: r._id,
    rating: r.rating as 1 | 2 | 3 | 4 | 5,
    createdAt: new Date(r._creationTime).toISOString(),
  }));

  const overall = data.avg;
  const count = data.count;
  const distribution = data.distribution;

  const pct = (n: number) => (count ? Math.round((n / count) * 100) : 0);

  // Server action: add a review for this professor by selecting one of their courses
  async function addProfReview(formData: FormData) {
    "use server";

    const courseId = String(formData.get("courseId") || "").trim();
    const ratingRaw = Number(formData.get("rating"));
    const comment = String(formData.get("comment") || "").trim();

    if (
      !courseId ||
      !Number.isFinite(ratingRaw) ||
      ratingRaw < 1 ||
      ratingRaw > 5 ||
      !comment
    ) {
      console.error("Invalid review data");
      return;
    }

    if (!userId) {
      redirect("/");
    }

    await fetchMutation(api.reviews.submitReview, {
      courseId: courseId as Id<"courses">,
      userId: userId as Id<"users">,
      rating: ratingRaw,
      comment,
    });

    redirect(`/profdetail/${unwrappedParams.id}`);
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Profile header */}
            <div className="flex p-4 @container">
              <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
                <div className="flex gap-4">
                  <Image
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                    src="/prof.png"
                    alt="Professor Photo"
                    width="100"
                    height="100"
                  />
                  <div className="flex flex-col justify-center">
                    <p className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em]">
                      {prof.name}
                    </p>
                    <p className="text-[#4c739a] text-base font-normal leading-normal">
                      Professor
                    </p>
                    <p className="text-[#4c739a] text-base font-normal leading-normal">
                      Ritsumeikan University
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses taught */}
            <h2 className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Courses
            </h2>
            <div className="px-4 py-3 @container">
              <div className="flex overflow-hidden rounded-lg border border-[#cfdbe7] bg-slate-50">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="table-prof-course-col120 px-4 py-3 text-left text-[#0d141b] w-[400px] text-sm font-medium leading-normal">
                        Course
                      </th>
                      <th className="table-prof-course-col240 px-4 py-3 text-left text-[#0d141b] w-[400px] text-sm font-medium leading-normal">
                        Rating
                      </th>
                      <th className="table-prof-course-col360 px-4 py-3 text-left text-[#0d141b] w-[400px] text-sm font-medium leading-normal">
                        Reviews
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length === 0 ? (
                      <tr className="border-t border-t-[#cfdbe7]">
                        <td
                          colSpan={3}
                          className="px-4 py-6 text-center text-[#4c739a] text-sm"
                        >
                          No courses found.
                        </td>
                      </tr>
                    ) : (
                      courses.map((c) => {
                        const courseReviews = reviews.filter(
                          (r) => r.courseId === c.id
                        );
                        const ratings = courseReviews
                          .filter((r) => r.courseId === c.id)
                          .map((r) => r.rating);
                        const avgCourse =
                          ratings.length > 0
                            ? ratings.reduce((a, b) => a + b, 0) /
                              ratings.length
                            : 0;
                        const cnt = courseReviews.length;
                        return (
                          <tr
                            key={c.id}
                            className="border-t border-t-[#cfdbe7]"
                          >
                            <td className="table-prof-course-col120 h-[72px] px-4 py-2 w-[400px] text-[#0d141b] text-sm font-normal leading-normal">
                              <Link
                                className="underline hover:text-[#1172d4]"
                                href={`/coursedetail/${c.id}`}
                              >
                                {c.courseName}
                              </Link>
                            </td>
                            <td className="table-prof-course-col240 h-[72px] px-4 py-2 w-[400px] text-[#4c739a] text-sm font-normal leading-normal">
                              {avgCourse.toFixed(1)}
                            </td>
                            <td className="table-prof-course-col360 h-[72px] px-4 py-2 w-[400px] text-[#4c739a] text-sm font-normal leading-normal">
                              {cnt}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <style>{`
                @container(max-width:120px){.table-prof-course-col120{display: none;}}
                @container(max-width:240px){.table-prof-course-col240{display: none;}}
                @container(max-width:360px){.table-prof-course-col360{display: none;}}
              `}</style>
            </div>

            {/* Overall rating */}
            <h2 className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Overall Rating
            </h2>
            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-[#0d141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                  {overall.toFixed(1)}
                </p>
                <div
                  className="flex gap-0.5"
                  aria-label={`Average rating ${overall.toFixed(1)} out of 5`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={
                        i < Math.round(overall)
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

            {/* Reviews */}
            <h2 className="text-[#0d141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Reviews
            </h2>
            <div className="flex flex-col gap-8 overflow-x-hidden bg-slate-50 p-4">
              {reviews.length === 0 ? (
                <p className="text-[#4c739a] text-sm">No reviews yet.</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="flex flex-col gap-3 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-[#0d141b] text-base font-medium leading-normal">
                          {
                            courses.filter((c) => c.id === r.courseId)[0]
                              ?.courseName
                          }
                        </p>
                        <p className="text-[#4c739a] text-sm font-normal leading-normal">
                          {((r as Review).createdAt &&
                            new Date((r as Review).createdAt).toLocaleString(
                              [],
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )) ||
                            ""}
                        </p>
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
                    <p className="text-[#0d141b] text-base font-normal leading-normal">
                      {r.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add review form (professor rating only; no course selection) */}
            {courses.length > 0 && (
              <div className="px-4 py-6">
                <form
                  action={addProfReview}
                  className="flex flex-col gap-3 max-w-xl"
                >
                  <Input type="hidden" name="professorId" value={prof.id} />
                  <select
                    name="courseId"
                    id="course"
                    className="form-select rounded-md border border-[#cfdbe7] p-3"
                    required
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseName}
                      </option>
                    ))}
                  </select>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
