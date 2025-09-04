import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PatientSetup } from "./PatientSetup";
import { Dashboard } from "./Dashboard";
import { SymptomChecker } from "./SymptomChecker";
import { PrescriptionScanner } from "./PrescriptionScanner";
import { Reminders } from "./Reminders";
import { EmergencyHelp } from "./EmergencyHelp";
import { HealthRecords } from "./HealthRecords";
import { useLanguage } from "../contexts/LanguageContext";

type View = "dashboard" | "symptoms" | "prescriptions" | "reminders" | "emergency" | "records";

export function HealthcareApp() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const patient = useQuery(api.patients.getPatient);
  const { t } = useLanguage();

  if (patient === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!patient) {
    return <PatientSetup />;
  }

  const navigation = [
    { id: "dashboard", label: t('dashboard'), icon: "🏠" },
    { id: "symptoms", label: t('symptomChecker'), icon: "🩺" },
    { id: "prescriptions", label: t('prescriptions'), icon: "💊" },
    { id: "reminders", label: t('reminders'), icon: "⏰" },
    { id: "emergency", label: t('emergency'), icon: "🚨" },
    { id: "records", label: t('healthRecords'), icon: "📋" },
  ];

  const handleNavClick = (viewId: View) => {
    setCurrentView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white border-r shadow-sm transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-3 sm:p-4 border-b">
          <div className="flex justify-between items-center lg:block">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                {t('welcome')}, {patient.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{patient.village}</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <nav className="p-3 sm:p-4 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as View)}
              className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors ${
                currentView === item.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg sm:text-xl">{item.icon}</span>
              <span className="font-medium text-sm sm:text-base truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-semibold text-gray-800">
            {navigation.find(nav => nav.id === currentView)?.label}
          </h1>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {currentView === "dashboard" && <Dashboard patient={patient} />}
          {currentView === "symptoms" && <SymptomChecker patient={patient} />}
          {currentView === "prescriptions" && <PrescriptionScanner patient={patient} />}
          {currentView === "reminders" && <Reminders patient={patient} />}
          {currentView === "emergency" && <EmergencyHelp patient={patient} />}
          {currentView === "records" && <HealthRecords patient={patient} />}
        </div>
      </div>
    </div>
  );
}
