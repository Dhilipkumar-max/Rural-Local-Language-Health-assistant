import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getHealthRecords = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("healthRecords")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(50);
  },
});

export const createHealthRecord = mutation({
  args: {
    patientId: v.id("patients"),
    type: v.string(),
    data: v.any(),
    notes: v.optional(v.string()),
    healthWorkerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== userId) {
      throw new Error("Patient not found or unauthorized");
    }

    return await ctx.db.insert("healthRecords", args);
  },
});

export const updateHealthRecord = mutation({
  args: {
    recordId: v.id("healthRecords"),
    notes: v.optional(v.string()),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const record = await ctx.db.get(args.recordId);
    if (!record) {
      throw new Error("Health record not found");
    }

    const patient = await ctx.db.get(record.patientId);
    if (!patient || patient.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const { recordId, ...updates } = args;
    await ctx.db.patch(recordId, updates);
  },
});

export const deleteHealthRecord = mutation({
  args: { recordId: v.id("healthRecords") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const record = await ctx.db.get(args.recordId);
    if (!record) {
      throw new Error("Health record not found");
    }

    const patient = await ctx.db.get(record.patientId);
    if (!patient || patient.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.recordId);
  },
});
