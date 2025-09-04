import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPatient = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    gender: v.string(),
    village: v.string(),
    phoneNumber: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    chronicConditions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("patients", {
      userId,
      ...args,
    });
  },
});

export const getPatient = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const updatePatient = mutation({
  args: {
    patientId: v.id("patients"),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    phoneNumber: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    chronicConditions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const { patientId, ...updates } = args;
    const patient = await ctx.db.get(patientId);
    
    if (!patient || patient.userId !== userId) {
      throw new Error("Patient not found or unauthorized");
    }

    await ctx.db.patch(patientId, updates);
  },
});
