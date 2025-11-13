import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

// Create user on first sign-in (call this from your app)
export const createUser = mutation({
  args: {
    email: v.string(),
    program: v.optional(v.string()),
    year: v.optional(v.number()),
    semester: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: args.email || identity.email || "",
      program: args.program || "Undeclared",
      year: args.year || 1,
      semester: args.semester || "Fall 2024",
    });

    return userId;
  },
});

// Rest of your existing code...
export const getScheduleForCurrentUser = query({
  args: { semester: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const scheduleItems = await ctx.db
      .query("scheduleItems")
      .withIndex("by_user_semester", (q) =>
        q.eq("userId", user._id).eq("semester", args.semester)
      )
      .collect();

    return scheduleItems;
  },
});