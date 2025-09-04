import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const updateVillageStats = internalMutation({
  args: {
    village: v.string(),
    symptoms: v.array(v.string()),
    urgency: v.string(),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const existingStats = await ctx.db
      .query("villageHealth")
      .withIndex("by_village_date", (q) => 
        q.eq("village", args.village).eq("date", today)
      )
      .first();

    if (existingStats) {
      // Update existing stats
      const newCommonSymptoms = [...existingStats.commonSymptoms];
      args.symptoms.forEach(symptom => {
        if (!newCommonSymptoms.includes(symptom)) {
          newCommonSymptoms.push(symptom);
        }
      });

      await ctx.db.patch(existingStats._id, {
        totalCases: existingStats.totalCases + 1,
        commonSymptoms: newCommonSymptoms,
        emergencyCases: existingStats.emergencyCases + 
          (args.urgency === "emergency" ? 1 : 0),
      });
    } else {
      // Create new stats entry
      await ctx.db.insert("villageHealth", {
        village: args.village,
        date: today,
        totalCases: 1,
        commonSymptoms: args.symptoms,
        emergencyCases: args.urgency === "emergency" ? 1 : 0,
      });
    }
  },
});

export const getVillageHealthStats = query({
  args: { 
    village: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const days = args.days || 7;
    const stats = await ctx.db
      .query("villageHealth")
      .withIndex("by_village_date", (q) => q.eq("village", args.village))
      .order("desc")
      .take(days);

    return stats;
  },
});

export const getHealthTrends = query({
  args: { village: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const last30Days = await ctx.db
      .query("villageHealth")
      .withIndex("by_village_date", (q) => q.eq("village", args.village))
      .order("desc")
      .take(30);

    if (last30Days.length === 0) {
      return null;
    }

    // Calculate trends
    const totalCases = last30Days.reduce((sum, day) => sum + day.totalCases, 0);
    const totalEmergencies = last30Days.reduce((sum, day) => sum + day.emergencyCases, 0);
    
    // Find most common symptoms
    const symptomCounts: Record<string, number> = {};
    last30Days.forEach(day => {
      day.commonSymptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));

    return {
      totalCases,
      totalEmergencies,
      averageDailyCases: Math.round(totalCases / last30Days.length),
      topSymptoms,
      emergencyRate: totalCases > 0 ? Math.round((totalEmergencies / totalCases) * 100) : 0,
    };
  },
});
