import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitReview = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.id("users"), // Assuming you have a users table and userId from Clerk is mapped to Convex userId
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the user has already reviewed this course (optional, but good practice)
    const existingReview = await ctx.db
      .query("reviews")
      .filter((q) =>
        q.and(
          q.eq(q.field("courseId"), args.courseId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (existingReview) {
      // Update existing review
      await ctx.db.patch(existingReview._id, {
        rating: args.rating,
        comment: args.comment,
      });
      return existingReview._id;
    } else {
      // Insert new review
      const reviewId = await ctx.db.insert("reviews", { courseId: args.courseId, userId: args.userId, rating: args.rating, comment: args.comment });
      return reviewId;
    }
  },
});