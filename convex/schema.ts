import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    program: v.string(),
    year: v.number(),
    semester: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  courses: defineTable({
    courseCode: v.number(),
    courseName: v.string(),
    gradeReq: v.number(),
    semester: v.string(),
    credit: v.number(),
    category: v.string(),
    location: v.string(),
    period: v.number(),
    day: v.string(),
  })
    .index("by_course_code", ["courseCode"])
    .index("by_semester", ["semester"])
    .index("by_day_period", ["day", "period"]),

  professors: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    lab: v.optional(v.string()),
  }).index("by_name", ["name"]),

  coursesToProfessors: defineTable({
    courseId: v.id("courses"),
    professorId: v.id("professors"),
  })
    .index("by_course", ["courseId"])
    .index("by_professor", ["professorId"]),

  reviews: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    rating: v.number(),
    comment: v.string(),
  })
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),
  scheduleItems: defineTable({
    userId: v.id("users"), // Reference to Convex users table
    semester: v.string(),
    day: v.string(),
    period: v.number(),
    courseId: v.id("courses"),
  })
    .index("by_user", ["userId"])
    .index("by_user_semester", ["userId", "semester"])
    .index("by_user_slot", ["userId", "semester", "day", "period"]),
});
