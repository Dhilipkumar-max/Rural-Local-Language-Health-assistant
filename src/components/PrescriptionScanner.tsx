import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface PrescriptionScannerProps {
  patient: Doc<"patients">;
}

export function PrescriptionScanner({ patient }: PrescriptionScannerProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualPrescription, setManualPrescription] = useState({
    doctorName: "",
    medicines: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.prescriptions.generateUploadUrl);
  const createPrescription = useMutation(api.prescriptions.createPrescription);
  const prescriptions = useQuery(api.prescriptions.getPrescriptions, {
    patientId: patient._id,
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      // Get upload URL
      const postUrl = await generateUploadUrl();
      
      // Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      
      const json = await result.json();
      if (!result.ok) {
        throw new Error(`Upload failed: ${JSON.stringify(json)}`);
      }
      
      const { storageId } = json;
      
      // For demo purposes, we'll create a sample prescription
      // In a real app, you'd use OCR to extract text from the image
      const sampleMedicines = [
        {
          name: "Sample Medicine (from image)",
          dosage: "As prescribed",
          frequency: "As directed",
          duration: "As prescribed",
          instructions: "Take with food"
        }
      ];

      await createPrescription({
        patientId: patient._id,
        doctorName: "Dr. from Prescription",
        medicines: sampleMedicines,
        imageId: storageId,
        extractedText: "Sample extracted text from prescription image",
      });

      toast.success("Prescription uploaded and processed!");
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error("Failed to upload prescription");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const addMedicine = () => {
    setManualPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
    }));
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    setManualPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedicine = (index: number) => {
    setManualPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleManualSubmit = async () => {
    const validMedicines = manualPrescription.medicines.filter(med => 
      med.name && med.dosage && med.frequency && med.duration
    );

    if (validMedicines.length === 0) {
      toast.error("Please add at least one complete medicine entry");
      return;
    }

    try {
      await createPrescription({
        patientId: patient._id,
        doctorName: manualPrescription.doctorName || undefined,
        medicines: validMedicines,
      });

      toast.success("Prescription added successfully!");
      setManualPrescription({
        doctorName: "",
        medicines: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
      });
      setShowManualEntry(false);
    } catch (error) {
      toast.error("Failed to add prescription");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">💊</span>
            Prescription Scanner
          </h1>
          <p className="text-gray-600 mt-2">
            Upload prescription images or enter medicine details manually
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">📷 Scan Prescription</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {selectedImage ? (
                  <div className="space-y-4">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Selected prescription"
                      className="max-w-full h-48 object-contain mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-600">{selectedImage.name}</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={handleImageUpload}
                        disabled={isUploading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isUploading ? "Processing..." : "Process Image"}
                      </button>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-4xl">📱</div>
                    <div>
                      <p className="text-lg font-medium">Upload Prescription Image</p>
                      <p className="text-sm text-gray-600">Take a clear photo of your prescription</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      Choose Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Entry */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">✍️ Manual Entry</h2>
              
              <div className="border border-gray-300 rounded-lg p-4">
                <p className="text-gray-600 mb-4">Enter prescription details manually</p>
                <button
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700"
                >
                  {showManualEntry ? "Hide Manual Entry" : "Enter Manually"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry Form */}
      {showManualEntry && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Manual Prescription Entry</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Name (optional)
              </label>
              <input
                type="text"
                value={manualPrescription.doctorName}
                onChange={(e) => setManualPrescription(prev => ({ ...prev, doctorName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dr. Smith"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Medicines</h3>
                <button
                  onClick={addMedicine}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + Add Medicine
                </button>
              </div>

              <div className="space-y-4">
                {manualPrescription.medicines.map((medicine, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Medicine {index + 1}</h4>
                      {manualPrescription.medicines.length > 1 && (
                        <button
                          onClick={() => removeMedicine(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medicine Name *
                        </label>
                        <input
                          type="text"
                          value={medicine.name}
                          onChange={(e) => updateMedicine(index, "name", e.target.value)}
                          className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Paracetamol"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                          className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="500mg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency *
                        </label>
                        <input
                          type="text"
                          value={medicine.frequency}
                          onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                          className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Twice daily"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration *
                        </label>
                        <input
                          type="text"
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                          className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="7 days"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructions
                      </label>
                      <input
                        type="text"
                        value={medicine.instructions}
                        onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Take with food"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleManualSubmit}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700"
            >
              Save Prescription
            </button>
          </div>
        </div>
      )}

      {/* Prescription History */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Prescription History</h2>
        </div>
        
        <div className="p-6">
          {prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {prescription.doctorName && (
                        <p className="font-medium text-gray-800">{prescription.doctorName}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {new Date(prescription._creationTime).toLocaleDateString()}
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
            <p className="text-gray-500 text-center py-8">No prescriptions found</p>
          )}
        </div>
      </div>
    </div>
  );
}
