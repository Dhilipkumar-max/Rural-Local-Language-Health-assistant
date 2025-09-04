import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPrescription = mutation({
  args: {
    patientId: v.id("patients"),
    doctorName: v.optional(v.string()),
    medicines: v.array(v.object({
      name: v.string(),
      dosage: v.string(),
      frequency: v.string(),
      duration: v.string(),
      instructions: v.optional(v.string()),
    })),
    imageId: v.optional(v.id("_storage")),
    extractedText: v.optional(v.string()),
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

    const prescriptionId = await ctx.db.insert("prescriptions", {
      ...args,
      isActive: true,
    });

    // Create reminders for each medicine
    for (const medicine of args.medicines) {
      const frequency = medicine.frequency.toLowerCase();
      let intervalHours = 24; // default daily
      
      if (frequency.includes("twice") || frequency.includes("2")) {
        intervalHours = 12;
      } else if (frequency.includes("thrice") || frequency.includes("3")) {
        intervalHours = 8;
      } else if (frequency.includes("four") || frequency.includes("4")) {
        intervalHours = 6;
      }

      // Create first reminder for 1 hour from now
      const firstReminderTime = Date.now() + (60 * 60 * 1000);
      
      await ctx.db.insert("reminders", {
        patientId: args.patientId,
        type: "medicine",
        title: `Take ${medicine.name}`,
        description: `${medicine.dosage} - ${medicine.instructions || "As prescribed"}`,
        scheduledTime: firstReminderTime,
        isCompleted: false,
        medicineId: medicine.name,
        repeatInterval: `${intervalHours}h`,
      });
    }

    // Create health record
    await ctx.db.insert("healthRecords", {
      patientId: args.patientId,
      type: "prescription",
      data: {
        medicines: args.medicines,
        doctorName: args.doctorName,
      },
    });

    return prescriptionId;
  },
});

export const getPrescriptions = query({
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
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const deactivatePrescription = mutation({
  args: { prescriptionId: v.id("prescriptions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const prescription = await ctx.db.get(args.prescriptionId);
    if (!prescription) {
      throw new Error("Prescription not found");
    }

    const patient = await ctx.db.get(prescription.patientId);
    if (!patient || patient.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.prescriptionId, { isActive: false });
  },
});
