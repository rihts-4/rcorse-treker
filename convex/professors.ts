import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getProfessors = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const search = args.search;
    if (!search) {
      return await ctx.db.query("professors").collect();
    }

    const allProfessors = await ctx.db.query("professors").collect();
    return allProfessors.filter((professor) =>
      professor.name.toLowerCase().includes(search.toLowerCase()) ||
      (professor.lab && professor.lab.toLowerCase().includes(search.toLowerCase()))
    );
  },
});

export const getProfessorDetails = query({
  args: { professorId: v.id("professors") },
  handler: async (ctx, args) => {
    const professor = await ctx.db.get(args.professorId);
    if (!professor) {
      return null;
    }

    // Fetch associated courses
    const courseToProfessors = await ctx.db
      .query("coursesToProfessors")
      .withIndex("by_professor", (q) => q.eq("professorId", args.professorId))
      .collect();

    const courseIds = courseToProfessors.map((ctp) => ctp.courseId);
    const courses = await Promise.all(courseIds.map((id) => ctx.db.get(id)));
    const validCourses = courses.filter(Boolean);

    // Fetch reviews for all courses taught by this professor
    const reviews = (
      await Promise.all(
        courseIds.map((courseId) =>
          ctx.db
            .query("reviews")
            .withIndex("by_course", (q) => q.eq("courseId", courseId))
            .collect()
        )
      )
    ).flat();

    // Calculate average rating, count, and distribution for the professor
    let totalRating = 0;
    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      totalRating += review.rating;
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });
    const count = reviews.length;
    const avg = count > 0 ? totalRating / count : 0;

    return { professor, courses: validCourses, reviews, avg, count, distribution };
  },
});