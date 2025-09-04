import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  patients: defineTable({
    userId: v.id("users"),
    name: v.string(),
    age: v.number(),
    gender: v.string(),
    village: v.string(),
    phoneNumber: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    chronicConditions: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),

  symptoms: defineTable({
    patientId: v.id("patients"),
    symptoms: v.array(v.string()),
    severity: v.string(), // "mild", "moderate", "severe"
    duration: v.string(),
    temperature: v.optional(v.number()),
    additionalInfo: v.optional(v.string()),
    aiAnalysis: v.optional(v.string()),
    recommendation: v.optional(v.string()),
    urgency: v.string(), // "low", "medium", "high", "emergency"
  }).index("by_patient", ["patientId"]),

  prescriptions: defineTable({
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
    isActive: v.boolean(),
  }).index("by_patient", ["patientId"]),

  reminders: defineTable({
    patientId: v.id("patients"),
    type: v.string(), // "medicine", "vaccine", "checkup"
    title: v.string(),
    description: v.string(),
    scheduledTime: v.number(),
    isCompleted: v.boolean(),
    medicineId: v.optional(v.string()),
    repeatInterval: v.optional(v.string()), // "daily", "weekly", "monthly"
  }).index("by_patient", ["patientId"])
    .index("by_scheduled_time", ["scheduledTime"]),

  healthRecords: defineTable({
    patientId: v.id("patients"),
    type: v.string(), // "symptom_check", "prescription", "checkup", "emergency"
    data: v.any(),
    notes: v.optional(v.string()),
    healthWorkerId: v.optional(v.id("users")),
  }).index("by_patient", ["patientId"]),

  emergencyContacts: defineTable({
    village: v.string(),
    type: v.string(), // "ambulance", "doctor", "health_worker", "hospital"
    name: v.string(),
    phoneNumber: v.string(),
    address: v.optional(v.string()),
    isAvailable: v.boolean(),
  }).index("by_village", ["village"]),

  villageHealth: defineTable({
    village: v.string(),
    date: v.string(), // YYYY-MM-DD format
    totalCases: v.number(),
    commonSymptoms: v.array(v.string()),
    emergencyCases: v.number(),
    trends: v.optional(v.any()),
  }).index("by_village_date", ["village", "date"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
