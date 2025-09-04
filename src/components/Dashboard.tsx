import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useLanguage } from "../contexts/LanguageContext";

interface DashboardProps {
  patient: Doc<"patients">;
}

export function Dashboard({ patient }: DashboardProps) {
  const { t } = useLanguage();
  const upcomingReminders = useQuery(api.reminders.getUpcomingReminders, {
    patientId: patient._id,
  });
  const recentSymptoms = useQuery(api.symptoms.getSymptomHistory, {
    patientId: patient._id,
  });
  const prescriptions = useQuery(api.prescriptions.getPrescriptions, {
    patientId: patient._id,
  });
  const villageStats = useQuery(api.analytics.getHealthTrends, {
    village: patient.village,
  });

  const activePrescriptions = prescriptions?.filter(p => p.isActive) || [];
  const todayReminders = upcomingReminders?.filter(r => {
    const reminderDate = new Date(r.scheduledTime).toDateString();
    const today = new Date().toDateString();
    return reminderDate === today;
  }) || [];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-4 sm:p-6 text-white">
        <h1 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
          {t('welcome')}, {patient.name}!
        </h1>
        <p className="opacity-90 text-sm sm:text-base">{t('healthOverview')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg p-3 sm:p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{t('todaysReminders')}</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{todayReminders.length}</p>
            </div>
            <span className="text-lg sm:text-2xl">⏰</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{t('activePrescriptions')}</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{activePrescriptions.length}</p>
            </div>
            <span className="text-lg sm:text-2xl">💊</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{t('recentCheckups')}</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{recentSymptoms?.length || 0}</p>
            </div>
            <span className="text-lg sm:text-2xl">🩺</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{t('healthScore')}</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">Good</p>
            </div>
            <span className="text-lg sm:text-2xl">❤️</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Today's Reminders */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-3 sm:p-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <span>⏰</span>
              {t('todaysReminders')}
            </h2>
          </div>
          <div className="p-3 sm:p-4">
            {todayReminders.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">{t('noData')}</p>
            ) : (
              <div className="space-y-3">
                {todayReminders.slice(0, 3).map((reminder) => (
                  <div key={reminder._id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{reminder.title}</p>
                      <p className="text-xs text-gray-600 truncate">{reminder.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(reminder.scheduledTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-3 sm:p-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <span>📋</span>
              {t('recentActivity')}
            </h2>
          </div>
          <div className="p-3 sm:p-4">
            {recentSymptoms && recentSymptoms.length > 0 ? (
              <div className="space-y-3">
                {recentSymptoms.slice(0, 3).map((symptom) => (
                  <div key={symptom._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      symptom.urgency === "emergency" ? "bg-red-500" :
                      symptom.urgency === "high" ? "bg-orange-500" :
                      symptom.urgency === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">Symptom Check</p>
                      <p className="text-xs text-gray-600 truncate">
                        {symptom.symptoms.join(", ")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(symptom._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">{t('noData')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Village Health Stats */}
      {villageStats && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-3 sm:p-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <span>🏘️</span>
              {patient.village} {t('villageHealthOverview')}
            </h2>
          </div>
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{villageStats.totalCases}</p>
                <p className="text-xs sm:text-sm text-gray-600">{t('totalCases')}</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-green-600">{villageStats.averageDailyCases}</p>
                <p className="text-xs sm:text-sm text-gray-600">{t('dailyAverage')}</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-red-600">{villageStats.totalEmergencies}</p>
                <p className="text-xs sm:text-sm text-gray-600">{t('emergencies')}</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{villageStats.emergencyRate}%</p>
                <p className="text-xs sm:text-sm text-gray-600">{t('emergencyRate')}</p>
              </div>
            </div>
            
            {villageStats.topSymptoms.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-800 mb-2 text-sm">{t('commonSymptoms')}</h3>
                <div className="flex flex-wrap gap-2">
                  {villageStats.topSymptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {symptom.symptom} ({symptom.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
