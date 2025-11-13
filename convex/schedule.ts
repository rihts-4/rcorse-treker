import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getCoursesForScheduler = query({
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const getSchedule = query({
  args: { userId: v.string(), semester: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      return [];
    }

    const scheduleItems = await ctx.db
      .query("scheduleItems")
      .withIndex("by_user_semester", (q) =>
        q.eq("userId", user._id).eq("semester", args.semester)
      )
      .collect();

    const scheduledCourses = await Promise.all(
      scheduleItems.map(async (item) => {
        const course = await ctx.db.get(item.courseId);
        return course ? { ...item, courseName: course.courseName, location: course.location } : null;
      })
    );

    return scheduledCourses.filter(Boolean);
  },
});

export const saveScheduleItem = mutation({
  args: {
    userId: v.string(),
    semester: v.string(),
    day: v.string(),
    period: v.number(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId)).first();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db.query("scheduleItems").withIndex("by_user_slot", (q) => q.eq("userId", user._id).eq("semester", args.semester).eq("day", args.day).eq("period", args.period)).first();
    if (existing) {
      await ctx.db.patch(existing._id, { courseId: args.courseId });
    } else {
      await ctx.db.insert("scheduleItems", { userId: user._id, semester: args.semester, day: args.day, period: args.period, courseId: args.courseId });
    }
  },
});

export const removeScheduleItem = mutation({
  args: { userId: v.string(), semester: v.string(), day: v.string(), period: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId)).first();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db.query("scheduleItems").withIndex("by_user_slot", (q) => q.eq("userId", user._id).eq("semester", args.semester).eq("day", args.day).eq("period", args.period)).first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});