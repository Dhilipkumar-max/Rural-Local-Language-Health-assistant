import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // App Header
    appName: "Rural Health",
    
    // Authentication
    signIn: "Sign In",
    signOut: "Sign Out",
    username: "Username",
    password: "Password",
    
    // Patient Setup
    setupProfile: "Set Up Your Profile",
    setupDescription: "Please provide your basic information to get started",
    fullName: "Full Name",
    age: "Age",
    gender: "Gender",
    village: "Village",
    phoneNumber: "Phone Number",
    emergencyContact: "Emergency Contact",
    bloodGroup: "Blood Group",
    allergies: "Allergies",
    chronicConditions: "Chronic Conditions",
    createProfile: "Create Profile",
    male: "Male",
    female: "Female",
    other: "Other",
    selectGender: "Select gender",
    selectBloodGroup: "Select blood group",
    
    // Navigation
    dashboard: "Dashboard",
    symptomChecker: "Symptom Checker",
    prescriptions: "Prescriptions",
    reminders: "Reminders",
    emergency: "Emergency",
    healthRecords: "Health Records",
    
    // Dashboard
    welcome: "Welcome back",
    healthOverview: "Here's your health overview for today",
    todaysReminders: "Today's Reminders",
    activePrescriptions: "Active Prescriptions",
    recentCheckups: "Recent Checkups",
    healthScore: "Health Score",
    recentActivity: "Recent Activity",
    villageHealthOverview: "Village Health Overview",
    totalCases: "Total Cases (30 days)",
    dailyAverage: "Daily Average",
    emergencies: "Emergencies",
    emergencyRate: "Emergency Rate",
    commonSymptoms: "Common Symptoms in Your Village:",
    
    // Symptom Checker
    aiSymptomChecker: "AI Symptom Checker",
    symptomCheckerDescription: "Select your symptoms and get AI-powered health recommendations",
    whatSymptoms: "What symptoms are you experiencing?",
    howSevere: "How severe are your symptoms?",
    mild: "Mild - Barely noticeable",
    moderate: "Moderate - Uncomfortable",
    severe: "Severe - Very painful",
    howLong: "How long have you had these symptoms?",
    temperature: "Temperature (optional)",
    additionalInfo: "Additional Information (optional)",
    analyzeSymptoms: "Analyze Symptoms",
    analyzing: "Analyzing...",
    aiAnalysis: "AI Analysis",
    saveToRecords: "Save to Health Records",
    startOver: "Start Over",
    
    // Emergency
    emergencyHelp: "Emergency Help",
    emergencyDescription: "Get immediate help in case of medical emergencies",
    emergencyCallHelp: "EMERGENCY - CALL FOR HELP",
    emergencyButton: "Press this button in case of immediate emergency",
    emergencyDetails: "Emergency Details (Optional)",
    typeOfEmergency: "Type of Emergency",
    currentLocation: "Current Location",
    description: "Description",
    emergencyContacts: "Emergency Contacts",
    emergencyInfo: "Your Emergency Information",
    personalDetails: "Personal Details",
    medicalInfo: "Medical Information",
    emergencyTips: "Emergency Tips",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading...",
    noData: "No data available",
    error: "Error occurred",
    success: "Success",
    required: "Required",
    optional: "Optional",
    
    // Language
    language: "Language",
    english: "English",
    tamil: "தமிழ்",
  },
  ta: {
    // App Header
    appName: "கிராமப்புற சுகாதாரம்",
    
    // Authentication
    signIn: "உள்நுழைய",
    signOut: "வெளியேறு",
    username: "பயனர் பெயர்",
    password: "கடவுச்சொல்",
    
    // Patient Setup
    setupProfile: "உங்கள் சுயவிவரத்தை அமைக்கவும்",
    setupDescription: "தொடங்குவதற்கு உங்கள் அடிப்படை தகவல்களை வழங்கவும்",
    fullName: "முழு பெயர்",
    age: "வயது",
    gender: "பாலினம்",
    village: "கிராமம்",
    phoneNumber: "தொலைபேசி எண்",
    emergencyContact: "அவசர தொடர்பு",
    bloodGroup: "இரத்த வகை",
    allergies: "ஒவ்வாமை",
    chronicConditions: "நாள்பட்ட நோய்கள்",
    createProfile: "சுயவிவரம் உருவாக்கு",
    male: "ஆண்",
    female: "பெண்",
    other: "மற்றவை",
    selectGender: "பாலினத்தை தேர்ந்தெடுக்கவும்",
    selectBloodGroup: "இரத்த வகையை தேர்ந்தெடுக்கவும்",
    
    // Navigation
    dashboard: "முகப்பு",
    symptomChecker: "அறிகுறி சரிபார்ப்பு",
    prescriptions: "மருந்து பரிந்துரைகள்",
    reminders: "நினைவூட்டல்கள்",
    emergency: "அவசரநிலை",
    healthRecords: "சுகாதார பதிவுகள்",
    
    // Dashboard
    welcome: "மீண்டும் வரவேற்கிறோம்",
    healthOverview: "இன்றைய உங்கள் சுகாதார மேலோட்டம் இங்கே",
    todaysReminders: "இன்றைய நினைவூட்டல்கள்",
    activePrescriptions: "செயலில் உள்ள மருந்துகள்",
    recentCheckups: "சமீபத்திய பரிசோதனைகள்",
    healthScore: "சுகாதார மதிப்பெண்",
    recentActivity: "சமீபத்திய செயல்பாடு",
    villageHealthOverview: "கிராம சுகாதார மேலோட்டம்",
    totalCases: "மொத்த வழக்குகள் (30 நாட்கள்)",
    dailyAverage: "தினசரி சராசரி",
    emergencies: "அவசரநிலைகள்",
    emergencyRate: "அவசர விகிதம்",
    commonSymptoms: "உங்கள் கிராமத்தில் பொதுவான அறிகுறிகள்:",
    
    // Symptom Checker
    aiSymptomChecker: "AI அறிகுறி சரிபார்ப்பு",
    symptomCheckerDescription: "உங்கள் அறிகுறிகளை தேர்ந்தெடுத்து AI-சக்தி வாய்ந்த சுகாதார பரிந்துரைகளைப் பெறுங்கள்",
    whatSymptoms: "நீங்கள் என்ன அறிகுறிகளை அனுபவிக்கிறீர்கள்?",
    howSevere: "உங்கள் அறிகுறிகள் எவ்வளவு கடுமையானவை?",
    mild: "லேசான - கவனிக்க முடியாத அளவு",
    moderate: "மிதமான - அசௌகரியமான",
    severe: "கடுமையான - மிகவும் வலிமிகுந்த",
    howLong: "இந்த அறிகுறிகள் எவ்வளவு காலமாக உள்ளன?",
    temperature: "வெப்பநிலை (விருப்பமானது)",
    additionalInfo: "கூடுதல் தகவல் (விருப்பமானது)",
    analyzeSymptoms: "அறிகுறிகளை பகுப்பாய்வு செய்",
    analyzing: "பகுப்பாய்வு செய்கிறது...",
    aiAnalysis: "AI பகுப்பாய்வு",
    saveToRecords: "சுகாதார பதிவுகளில் சேமி",
    startOver: "மீண்டும் தொடங்கு",
    
    // Emergency
    emergencyHelp: "அவசர உதவி",
    emergencyDescription: "மருத்துவ அவசரநிலைகளில் உடனடி உதவி பெறுங்கள்",
    emergencyCallHelp: "அவசரநிலை - உதவிக்கு அழைக்கவும்",
    emergencyButton: "உடனடி அவசரநிலையில் இந்த பொத்தானை அழுத்தவும்",
    emergencyDetails: "அவசர விவரங்கள் (விருப்பமானது)",
    typeOfEmergency: "அவசரநிலையின் வகை",
    currentLocation: "தற்போதைய இடம்",
    description: "விளக்கம்",
    emergencyContacts: "அவசர தொடர்புகள்",
    emergencyInfo: "உங்கள் அவசர தகவல்",
    personalDetails: "தனிப்பட்ட விவரங்கள்",
    medicalInfo: "மருத்துவ தகவல்",
    emergencyTips: "அவசர குறிப்புகள்",
    
    // Common
    save: "சேமி",
    cancel: "ரத்து செய்",
    edit: "திருத்து",
    delete: "நீக்கு",
    loading: "ஏற்றுகிறது...",
    noData: "தரவு இல்லை",
    error: "பிழை ஏற்பட்டது",
    success: "வெற்றி",
    required: "தேவையான",
    optional: "விருப்பமானது",
    
    // Language
    language: "மொழி",
    english: "English",
    tamil: "தமிழ்",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ta')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
