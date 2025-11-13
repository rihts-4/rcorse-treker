import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCourses = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const search = args.search;
    if (!search) {
      // If no search query, return all courses
      return await ctx.db.query("courses").collect();
    }

    // If there is a search query, filter the courses
    const allCourses = await ctx.db.query("courses").collect();
    const searchNum = Number(search);
    const filteredCourses = allCourses.filter((course) => {
      const nameMatch = course.courseName
        .toLowerCase()
        .includes(search.toLowerCase());
      const codeMatch = Number.isFinite(searchNum) && course.courseCode === searchNum;
      return nameMatch || codeMatch;
    });
    return filteredCourses;
  },
});

export const getCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    return course;
  },
});

export const getCourseDetails = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return null;
    }

    // Fetch associated professors
    const courseToProfessors = await ctx.db
      .query("coursesToProfessors")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();

    const professorIds = courseToProfessors.map((ctp) => ctp.professorId);
    const professors = await Promise.all(
      professorIds.map((id) => ctx.db.get(id))
    );

    // Fetch reviews
    const reviews = await ctx.db
      .query("reviews") // Assuming a 'reviews' table exists
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();

    // Calculate average rating, count, and distribution
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

    return { course, professors: professors.filter(Boolean), reviews, avg, count, distribution };
  },
});