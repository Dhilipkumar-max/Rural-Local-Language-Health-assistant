import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

interface EmergencyHelpProps {
  patient: Doc<"patients">;
}

export function EmergencyHelp({ patient }: EmergencyHelpProps) {
  const { t } = useLanguage();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyType, setEmergencyType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const emergencyContacts = useQuery(api.emergency.getEmergencyContacts, {
    village: patient.village,
  });
  const triggerEmergency = useMutation(api.emergency.triggerEmergency);

  const emergencyTypes = [
    { value: "medical", label: "Medical Emergency", icon: "🚑", color: "red" },
    { value: "accident", label: "Accident", icon: "⚠️", color: "orange" },
    { value: "breathing", label: "Breathing Problem", icon: "🫁", color: "red" },
    { value: "chest_pain", label: "Chest Pain", icon: "💔", color: "red" },
    { value: "unconscious", label: "Unconscious", icon: "😵", color: "red" },
    { value: "bleeding", label: "Severe Bleeding", icon: "🩸", color: "red" },
    { value: "poisoning", label: "Poisoning", icon: "☠️", color: "red" },
    { value: "other", label: "Other Emergency", icon: "🆘", color: "red" },
  ];

  const handleEmergencyTrigger = async () => {
    if (!emergencyType) {
      toast.error("Please select emergency type");
      return;
    }

    try {
      await triggerEmergency({
        patientId: patient._id,
        emergencyType,
        location: location || undefined,
        description: description || undefined,
      });

      setIsEmergencyActive(true);
      toast.success("Emergency alert sent! Help is on the way.");
      
      // Reset form
      setEmergencyType("");
      setLocation("");
      setDescription("");
    } catch (error) {
      toast.error("Failed to send emergency alert");
      console.error(error);
    }
  };

  const handleCallEmergency = (phoneNumber: string, name: string) => {
    // In a real app, this would initiate a phone call
    toast.info(`Calling ${name} at ${phoneNumber}`);
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Emergency Alert */}
      {isEmergencyActive && (
        <div className="bg-red-100 border border-red-400 rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="text-2xl sm:text-3xl animate-pulse">🚨</span>
            <h2 className="text-lg sm:text-xl font-bold text-red-800">Emergency Alert Active</h2>
          </div>
          <p className="text-red-700 mb-3 sm:mb-4 text-sm sm:text-base">
            Your emergency alert has been sent. Emergency contacts have been notified.
          </p>
          <button
            onClick={() => setIsEmergencyActive(false)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm sm:text-base"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      {/* Emergency Trigger */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 sm:p-6 border-b">
          <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-red-600">
            <span className="text-2xl sm:text-3xl">🆘</span>
            {t('emergencyHelp')}
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {t('emergencyDescription')}
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Quick Emergency Button */}
          <div className="text-center">
            <button
              onClick={() => handleEmergencyTrigger()}
              className="bg-red-600 text-white text-base sm:text-xl font-bold py-4 sm:py-6 px-6 sm:px-12 rounded-full hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
            >
              🚨 {t('emergencyCallHelp')}
            </button>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              {t('emergencyButton')}
            </p>
          </div>

          <div className="border-t pt-4 sm:pt-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('emergencyDetails')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('typeOfEmergency')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {emergencyTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setEmergencyType(type.value)}
                      className={`p-2 sm:p-3 rounded-lg border text-center transition-all ${
                        emergencyType === type.value
                          ? "bg-red-50 border-red-300 text-red-700"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="text-lg sm:text-2xl mb-1">{type.icon}</div>
                      <div className="text-xs sm:text-sm font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('currentLocation')}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Describe your current location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Briefly describe the emergency situation"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-base sm:text-xl font-semibold flex items-center gap-2">
            <span>📞</span>
            {t('emergencyContacts')} - {patient.village}
          </h2>
        </div>
        
        <div className="p-4 sm:p-6">
          {emergencyContacts && emergencyContacts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {emergencyContacts.map((contact) => (
                <div key={contact._id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{contact.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 capitalize">{contact.type.replace('_', ' ')}</p>
                      {contact.address && (
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{contact.address}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ml-2 ${
                      contact.type === "ambulance" ? "bg-red-100 text-red-800" :
                      contact.type === "doctor" ? "bg-blue-100 text-blue-800" :
                      contact.type === "hospital" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {contact.type}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleCallEmergency(contact.phoneNumber, contact.name)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <span>📞</span>
                    Call {contact.phoneNumber}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-500 mb-4 text-sm sm:text-base">No emergency contacts found for {patient.village}</p>
              <p className="text-xs sm:text-sm text-gray-400">
                Contact your local health worker to add emergency contacts for your village
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Personal Emergency Info */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-base sm:text-xl font-semibold flex items-center gap-2">
            <span>👤</span>
            {t('emergencyInfo')}
          </h2>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">{t('personalDetails')}</h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <p><span className="font-medium">Name:</span> {patient.name}</p>
                <p><span className="font-medium">Age:</span> {patient.age}</p>
                <p><span className="font-medium">Gender:</span> {patient.gender}</p>
                <p><span className="font-medium">Village:</span> {patient.village}</p>
                {patient.phoneNumber && (
                  <p><span className="font-medium">Phone:</span> {patient.phoneNumber}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">{t('medicalInfo')}</h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                {patient.bloodGroup && (
                  <p><span className="font-medium">Blood Group:</span> {patient.bloodGroup}</p>
                )}
                {patient.allergies && patient.allergies.length > 0 && (
                  <p><span className="font-medium">Allergies:</span> {patient.allergies.join(", ")}</p>
                )}
                {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                  <p><span className="font-medium">Chronic Conditions:</span> {patient.chronicConditions.join(", ")}</p>
                )}
                {patient.emergencyContact && (
                  <p><span className="font-medium">Emergency Contact:</span> {patient.emergencyContact}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Tips */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center gap-2">
          <span>💡</span>
          {t('emergencyTips')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-blue-700">
          <div>
            <h3 className="font-medium mb-2">Before Emergency Services Arrive:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Stay calm and keep the patient comfortable</li>
              <li>Do not move the patient unless necessary</li>
              <li>Keep airways clear</li>
              <li>Apply pressure to bleeding wounds</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Information to Provide:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Exact location and landmarks</li>
              <li>Nature of emergency</li>
              <li>Patient's condition</li>
              <li>Your contact number</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
