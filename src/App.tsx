import { Authenticated, Unauthenticated } from "@convex-dev/auth/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { HealthcareApp } from "./components/HealthcareApp";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { LanguageSelector } from "./components/LanguageSelector";

function AppContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-14 sm:h-16 flex justify-between items-center border-b shadow-sm px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs sm:text-sm">🏥</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{t('appName')}</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </div>
      </header>
      
      <main className="flex-1">
        <Authenticated>
          <HealthcareApp />
        </Authenticated>
        
        <Unauthenticated>
          <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] p-4 sm:p-8">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white text-xl sm:text-2xl">🩺</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {t('appName')}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  AI-powered healthcare assistance for rural communities
                </p>
              </div>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>
      </main>
      
      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
