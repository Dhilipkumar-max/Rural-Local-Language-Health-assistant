import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getEmergencyContacts = query({
  args: { village: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emergencyContacts")
      .withIndex("by_village", (q) => q.eq("village", args.village))
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect();
  },
});

export const triggerEmergency = mutation({
  args: {
    patientId: v.id("patients"),
    emergencyType: v.string(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
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

    // Create emergency health record
    const emergencyId = await ctx.db.insert("healthRecords", {
      patientId: args.patientId,
      type: "emergency",
      data: {
        emergencyType: args.emergencyType,
        location: args.location,
        description: args.description,
        timestamp: Date.now(),
        patientInfo: {
          name: patient.name,
          age: patient.age,
          bloodGroup: patient.bloodGroup,
          allergies: patient.allergies,
          chronicConditions: patient.chronicConditions,
          emergencyContact: patient.emergencyContact,
        },
      },
    });

    // In a real app, this would trigger SMS/call notifications
    // to emergency contacts, ambulance services, etc.
    
    return emergencyId;
  },
});

export const addEmergencyContact = mutation({
  args: {
    village: v.string(),
    type: v.string(),
    name: v.string(),
    phoneNumber: v.string(),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("emergencyContacts", {
      ...args,
      isAvailable: true,
    });
  },
});
