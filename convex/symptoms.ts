import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const analyzeSymptoms = action({
  args: {
    symptoms: v.array(v.string()),
    severity: v.string(),
    duration: v.string(),
    temperature: v.optional(v.number()),
    age: v.number(),
    gender: v.string(),
    additionalInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `
You are a medical AI assistant for rural healthcare. Analyze these symptoms and provide:
1. Possible conditions (most likely first)
2. Urgency level (low/medium/high/emergency)
3. Home remedies if appropriate
4. When to seek medical help
5. Warning signs to watch for

Patient Info:
- Age: ${args.age}
- Gender: ${args.gender}
- Symptoms: ${args.symptoms.join(", ")}
- Severity: ${args.severity}
- Duration: ${args.duration}
${args.temperature ? `- Temperature: ${args.temperature}°F` : ""}
${args.additionalInfo ? `- Additional info: ${args.additionalInfo}` : ""}

Provide response in simple, clear language suitable for rural communities. Include both English and suggest local language translation needs.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const analysis = response.choices[0].message.content || "";
    
    // Extract urgency level from the analysis
    let urgency = "medium";
    if (analysis.toLowerCase().includes("emergency") || analysis.toLowerCase().includes("urgent")) {
      urgency = "emergency";
    } else if (analysis.toLowerCase().includes("high priority")) {
      urgency = "high";
    } else if (analysis.toLowerCase().includes("low priority") || analysis.toLowerCase().includes("mild")) {
      urgency = "low";
    }

    return {
      analysis,
      urgency,
      recommendation: analysis,
    };
  },
});

export const submitSymptoms = mutation({
  args: {
    patientId: v.id("patients"),
    symptoms: v.array(v.string()),
    severity: v.string(),
    duration: v.string(),
    temperature: v.optional(v.number()),
    additionalInfo: v.optional(v.string()),
    aiAnalysis: v.string(),
    recommendation: v.string(),
    urgency: v.string(),
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

    const symptomId = await ctx.db.insert("symptoms", args);

    // Create health record
    await ctx.db.insert("healthRecords", {
      patientId: args.patientId,
      type: "symptom_check",
      data: {
        symptoms: args.symptoms,
        severity: args.severity,
        urgency: args.urgency,
        analysis: args.aiAnalysis,
      },
    });

    // Update village health statistics
    await ctx.scheduler.runAfter(0, internal.analytics.updateVillageStats, {
      village: patient.village,
      symptoms: args.symptoms,
      urgency: args.urgency,
    });

    return symptomId;
  },
});

export const getSymptomHistory = query({
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
      .query("symptoms")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(20);
  },
});
