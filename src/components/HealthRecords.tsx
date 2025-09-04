import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

interface HealthRecordsProps {
  patient: Doc<"patients">;
}

export function HealthRecords({ patient }: HealthRecordsProps) {
  const healthRecords = useQuery(api.healthRecords.getHealthRecords, {
    patientId: patient._id,
  });
  const symptomHistory = useQuery(api.symptoms.getSymptomHistory, {
    patientId: patient._id,
  });
  const prescriptions = useQuery(api.prescriptions.getPrescriptions, {
    patientId: patient._id,
  });

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "symptom_check": return "🩺";
      case "prescription": return "💊";
      case "checkup": return "👩‍⚕️";
      case "emergency": return "🚨";
      default: return "📋";
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case "symptom_check": return "bg-blue-100 text-blue-800";
      case "prescription": return "bg-green-100 text-green-800";
      case "checkup": return "bg-purple-100 text-purple-800";
      case "emergency": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Health Records
          </h1>
          <p className="text-gray-600 mt-2">
            Complete history of your health checkups, symptoms, and treatments
          </p>
        </div>

        {/* Summary Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {symptomHistory?.length || 0}
              </div>
              <div className="text-sm text-blue-600">Symptom Checks</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {prescriptions?.length || 0}
              </div>
              <div className="text-sm text-green-600">Prescriptions</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {healthRecords?.filter(r => r.type === "checkup").length || 0}
              </div>
              <div className="text-sm text-purple-600">Checkups</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {healthRecords?.filter(r => r.type === "emergency").length || 0}
              </div>
              <div className="text-sm text-red-600">Emergencies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Symptom Checks */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>🩺</span>
            Recent Symptom Checks
          </h2>
        </div>
        
        <div className="p-6">
          {symptomHistory && symptomHistory.length > 0 ? (
            <div className="space-y-4">
              {symptomHistory.slice(0, 5).map((symptom) => (
                <div key={symptom._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getUrgencyColor(symptom.urgency)}`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {symptom.symptoms.join(", ")}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Severity: {symptom.severity} • Duration: {symptom.duration}
                        </p>
                        {symptom.temperature && (
                          <p className="text-sm text-gray-600">
                            Temperature: {symptom.temperature}°F
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        symptom.urgency === "emergency" ? "bg-red-100 text-red-800" :
                        symptom.urgency === "high" ? "bg-orange-100 text-orange-800" :
                        symptom.urgency === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {symptom.urgency.toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(symptom._creationTime)}
                      </p>
                    </div>
                  </div>
                  
                  {symptom.aiAnalysis && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <h4 className="font-medium text-gray-800 mb-2">AI Analysis:</h4>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {symptom.aiAnalysis.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No symptom checks recorded</p>
          )}
        </div>
      </div>

      {/* Prescription History */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>💊</span>
            Prescription History
          </h2>
        </div>
        
        <div className="p-6">
          {prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {prescription.doctorName && (
                        <h3 className="font-semibold text-gray-800">{prescription.doctorName}</h3>
                      )}
                      <p className="text-sm text-gray-600">
                        {formatDate(prescription._creationTime)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      prescription.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {prescription.isActive ? "Active" : "Completed"}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">Medicines:</h4>
                    {prescription.medicines.map((medicine, index) => (
                      <div key={index} className="bg-gray-50 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-sm text-gray-600">
                              {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                            </p>
                            {medicine.instructions && (
                              <p className="text-sm text-gray-500 italic">{medicine.instructions}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No prescriptions recorded</p>
          )}
        </div>
      </div>

      {/* All Health Records */}
      {healthRecords && healthRecords.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>📋</span>
              All Health Records
            </h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {healthRecords.map((record) => (
                <div key={record._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getRecordIcon(record.type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800 capitalize">
                          {record.type.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(record._creationTime)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getRecordColor(record.type)}`}>
                      {record.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {record.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <p className="text-sm text-gray-700">{record.notes}</p>
                    </div>
                  )}
                  
                  {record.data && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <h4 className="font-medium text-gray-800 mb-2">Details:</h4>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(record.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-gray-50 rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Export Health Records</h2>
        <p className="text-gray-600 mb-4">
          Download your complete health records for sharing with healthcare providers
        </p>
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            📄 Export as PDF
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            📊 Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
}
