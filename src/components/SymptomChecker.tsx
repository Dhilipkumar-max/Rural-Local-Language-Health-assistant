import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

interface SymptomCheckerProps {
  patient: Doc<"patients">;
}

const commonSymptoms = [
  "Fever", "Cough", "Headache", "Body ache", "Sore throat",
  "Runny nose", "Nausea", "Vomiting", "Diarrhea", "Stomach pain",
  "Chest pain", "Shortness of breath", "Dizziness", "Fatigue",
  "Loss of appetite", "Skin rash", "Joint pain", "Back pain"
];

const durationOptions = [
  "Less than 1 day", "1-2 days", "3-5 days", "1 week", "More than 1 week"
];

export function SymptomChecker({ patient }: SymptomCheckerProps) {
  const { t } = useLanguage();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState("");
  const [duration, setDuration] = useState("");
  const [temperature, setTemperature] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeSymptoms = useAction(api.symptoms.analyzeSymptoms);
  const submitSymptoms = useMutation(api.symptoms.submitSymptoms);

  const severityLevels = [
    { value: "mild", label: t('mild'), color: "green" },
    { value: "moderate", label: t('moderate'), color: "yellow" },
    { value: "severe", label: t('severe'), color: "red" },
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0 || !severity || !duration) {
      toast.error("Please select symptoms, severity, and duration");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeSymptoms({
        symptoms: selectedSymptoms,
        severity,
        duration,
        temperature: temperature ? parseFloat(temperature) : undefined,
        age: patient.age,
        gender: patient.gender,
        additionalInfo: additionalInfo || undefined,
      });
      
      setAnalysis(result);
    } catch (error) {
      toast.error("Failed to analyze symptoms");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!analysis) return;

    try {
      await submitSymptoms({
        patientId: patient._id,
        symptoms: selectedSymptoms,
        severity,
        duration,
        temperature: temperature ? parseFloat(temperature) : undefined,
        additionalInfo: additionalInfo || undefined,
        aiAnalysis: analysis.analysis,
        recommendation: analysis.recommendation,
        urgency: analysis.urgency,
      });

      toast.success("Symptoms recorded successfully!");
      
      // Reset form
      setSelectedSymptoms([]);
      setSeverity("");
      setDuration("");
      setTemperature("");
      setAdditionalInfo("");
      setAnalysis(null);
    } catch (error) {
      toast.error("Failed to record symptoms");
      console.error(error);
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 sm:p-6 border-b">
          <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">🩺</span>
            {t('aiSymptomChecker')}
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {t('symptomCheckerDescription')}
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Symptom Selection */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('whatSymptoms')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`p-2 sm:p-3 rounded-lg border text-left transition-all text-xs sm:text-sm ${
                    selectedSymptoms.includes(symptom)
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('howSevere')}</h2>
            <div className="space-y-2 sm:space-y-3">
              {severityLevels.map((level) => (
                <label key={level.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={severity === level.value}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${level.color}-500`}></div>
                    <span className="text-sm sm:text-base">{level.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('howLong')}</h2>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">Select duration</option>
              {durationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('temperature')}</h2>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="98.6"
                step="0.1"
                min="95"
                max="110"
                className="w-24 sm:w-32 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <span className="text-gray-600 text-sm sm:text-base">°F</span>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('additionalInfo')}</h2>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any other details about your symptoms..."
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || selectedSymptoms.length === 0 || !severity || !duration}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isAnalyzing ? t('analyzing') : t('analyzeSymptoms')}
          </button>

          {/* Analysis Results */}
          {analysis && (
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xl sm:text-2xl">🤖</span>
                <h2 className="text-lg sm:text-xl font-semibold">{t('aiAnalysis')}</h2>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  analysis.urgency === "emergency" ? "bg-red-100 text-red-800" :
                  analysis.urgency === "high" ? "bg-orange-100 text-orange-800" :
                  analysis.urgency === "medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {analysis.urgency.toUpperCase()} PRIORITY
                </span>
              </div>
              
              <div className="bg-white rounded-lg p-3 sm:p-4 border">
                <div className="prose prose-sm max-w-none">
                  {analysis.analysis.split('\n').map((line: string, index: number) => (
                    <p key={index} className="mb-2 text-sm sm:text-base">{line}</p>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  {t('saveToRecords')}
                </button>
                <button
                  onClick={() => setAnalysis(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  {t('startOver')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
