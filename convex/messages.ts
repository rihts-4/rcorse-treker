import { query } from "./_generated/server";
import { v } from "convex/values";

// First, get the current user's Convex record
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    // Look up user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

// Then, get schedule items for current user
export const getScheduleForCurrentUser = query({
  args: { semester: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Find the user first
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Query schedule items for the user and semester
    const scheduleItems = await ctx.db
      .query("scheduleItems")
      .withIndex("by_user_semester", (q) =>
        q.eq("userId", user._id).eq("semester", args.semester),
      )
      .collect();

    return scheduleItems;
  },
});
