import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface RemindersProps {
  patient: Doc<"patients">;
}

export function Reminders({ patient }: RemindersProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: "medicine",
    title: "",
    description: "",
    date: "",
    time: "",
    repeatInterval: "",
  });

  const upcomingReminders = useQuery(api.reminders.getUpcomingReminders, {
    patientId: patient._id,
  });
  const allReminders = useQuery(api.reminders.getAllReminders, {
    patientId: patient._id,
  });
  
  const markCompleted = useMutation(api.reminders.markReminderCompleted);
  const createReminder = useMutation(api.reminders.createCustomReminder);

  const handleMarkCompleted = async (reminderId: string) => {
    try {
      await markCompleted({ reminderId: reminderId as any });
      toast.success("Reminder marked as completed!");
    } catch (error) {
      toast.error("Failed to mark reminder as completed");
      console.error(error);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReminder.title || !newReminder.date || !newReminder.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const scheduledTime = new Date(`${newReminder.date}T${newReminder.time}`).getTime();
      
      await createReminder({
        patientId: patient._id,
        type: newReminder.type,
        title: newReminder.title,
        description: newReminder.description,
        scheduledTime,
        repeatInterval: newReminder.repeatInterval || undefined,
      });

      toast.success("Reminder created successfully!");
      setNewReminder({
        type: "medicine",
        title: "",
        description: "",
        date: "",
        time: "",
        repeatInterval: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to create reminder");
      console.error(error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "medicine": return "💊";
      case "vaccine": return "💉";
      case "checkup": return "🩺";
      default: return "⏰";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medicine": return "bg-blue-100 text-blue-800";
      case "vaccine": return "bg-green-100 text-green-800";
      case "checkup": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">⏰</span>
                Medicine & Health Reminders
              </h1>
              <p className="text-gray-600 mt-2">
                Never miss your medicines or health checkups
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Reminder
            </button>
          </div>
        </div>

        {/* Create Reminder Form */}
        {showCreateForm && (
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Create New Reminder</h2>
            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={newReminder.type}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="medicine">Medicine</option>
                    <option value="vaccine">Vaccine</option>
                    <option value="checkup">Health Checkup</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Take Paracetamol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newReminder.date}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat
                </label>
                <select
                  value={newReminder.repeatInterval}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, repeatInterval: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No repeat</option>
                  <option value="6h">Every 6 hours</option>
                  <option value="8h">Every 8 hours</option>
                  <option value="12h">Every 12 hours</option>
                  <option value="24h">Daily</option>
                  <option value="7d">Weekly</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                >
                  Create Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Upcoming Reminders (Next 24 Hours)</h2>
        </div>
        
        <div className="p-6">
          {upcomingReminders && upcomingReminders.length > 0 ? (
            <div className="space-y-4">
              {upcomingReminders.map((reminder) => (
                <div key={reminder._id} className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-2xl">{getTypeIcon(reminder.type)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{reminder.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(reminder.type)}`}>
                        {reminder.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{reminder.description}</p>
                    <p className="text-sm text-gray-500">{formatTime(reminder.scheduledTime)}</p>
                  </div>
                  
                  <button
                    onClick={() => handleMarkCompleted(reminder._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Mark Done
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming reminders</p>
          )}
        </div>
      </div>

      {/* All Reminders */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">All Reminders</h2>
        </div>
        
        <div className="p-6">
          {allReminders && allReminders.length > 0 ? (
            <div className="space-y-4">
              {allReminders.map((reminder) => (
                <div key={reminder._id} className={`flex items-center gap-4 p-4 rounded-lg border ${
                  reminder.isCompleted 
                    ? "bg-gray-50 border-gray-200 opacity-75" 
                    : "bg-white border-gray-200"
                }`}>
                  <div className="text-2xl">{getTypeIcon(reminder.type)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${reminder.isCompleted ? "text-gray-500 line-through" : "text-gray-800"}`}>
                        {reminder.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(reminder.type)}`}>
                        {reminder.type}
                      </span>
                      {reminder.isCompleted && (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{reminder.description}</p>
                    <p className="text-sm text-gray-500">{formatTime(reminder.scheduledTime)}</p>
                  </div>
                  
                  {!reminder.isCompleted && (
                    <button
                      onClick={() => handleMarkCompleted(reminder._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No reminders found</p>
          )}
        </div>
      </div>
    </div>
  );
}
