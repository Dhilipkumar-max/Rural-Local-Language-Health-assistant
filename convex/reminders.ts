import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUpcomingReminders = query({
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

    const now = Date.now();
    const next24Hours = now + (24 * 60 * 60 * 1000);

    return await ctx.db
      .query("reminders")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => 
        q.and(
          q.eq(q.field("isCompleted"), false),
          q.gte(q.field("scheduledTime"), now),
          q.lte(q.field("scheduledTime"), next24Hours)
        )
      )
      .order("asc")
      .collect();
  },
});

export const getAllReminders = query({
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
      .query("reminders")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(50);
  },
});

export const markReminderCompleted = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const reminder = await ctx.db.get(args.reminderId);
    if (!reminder) {
      throw new Error("Reminder not found");
    }

    const patient = await ctx.db.get(reminder.patientId);
    if (!patient || patient.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.reminderId, { isCompleted: true });

    // Create next reminder if it's a repeating one
    if (reminder.repeatInterval && reminder.type === "medicine") {
      const intervalMs = parseInterval(reminder.repeatInterval);
      const nextTime = reminder.scheduledTime + intervalMs;

      await ctx.db.insert("reminders", {
        patientId: reminder.patientId,
        type: reminder.type,
        title: reminder.title,
        description: reminder.description,
        scheduledTime: nextTime,
        isCompleted: false,
        medicineId: reminder.medicineId,
        repeatInterval: reminder.repeatInterval,
      });
    }
  },
});

export const createCustomReminder = mutation({
  args: {
    patientId: v.id("patients"),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    scheduledTime: v.number(),
    repeatInterval: v.optional(v.string()),
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

    return await ctx.db.insert("reminders", {
      ...args,
      isCompleted: false,
    });
  },
});

function parseInterval(interval: string): number {
  const match = interval.match(/(\d+)([hdwm])/);
  if (!match) return 24 * 60 * 60 * 1000; // default 24 hours

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    case 'm': return value * 30 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}
