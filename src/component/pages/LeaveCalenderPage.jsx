import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const LeaveCalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);

  // 🔹 New Holiday State
  const [newHoliday, setNewHoliday] = useState({ title: "", date: "" });

  // 🔹 New Break State
  const [newBreak, setNewBreak] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  // 🔹 Fetch leaves, holidays, and breaks
  useEffect(() => {
    const fetchData = async () => {
      const leaveSnap = await getDocs(collection(db, "leaves"));
      const holidaySnap = await getDocs(collection(db, "holidays"));
      const breakSnap = await getDocs(collection(db, "breaks"));

      // Employee Leaves
      const leaveEvents = leaveSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: `${data.employeeName} (${data.status || "Pending"})`,
          start: new Date(data.fromDate),
          end: new Date(data.toDate),
          allDay: true,
          type: "leave",
          ...data,
        };
      });

      // Public Holidays
      const holidayEvents = holidaySnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: `🏖 ${data.title}`,
          start: new Date(data.date),
          end: new Date(data.date),
          allDay: true,
          type: "holiday",
        };
      });

      // Breaks (Lunch, Tea)
      const breakEvents = breakSnap.docs.map((doc) => {
        const data = doc.data();
        const start = new Date(`${data.date}T${data.startTime}`);
        const end = new Date(`${data.date}T${data.endTime}`);
        return {
          id: doc.id,
          title: data.title,
          start,
          end,
          allDay: false,
          type: "break",
        };
      });

      setEvents([...leaveEvents, ...holidayEvents, ...breakEvents]);
    };

    fetchData();
  }, []);

  // 🔹 Add Holiday
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday.title || !newHoliday.date) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "holidays"), {
        title: newHoliday.title,
        date: newHoliday.date,
        createdAt: serverTimestamp(),
      });

      const holidayEvent = {
        id: docRef.id,
        title: `🏖 ${newHoliday.title}`,
        start: new Date(newHoliday.date),
        end: new Date(newHoliday.date),
        allDay: true,
        type: "holiday",
      };

      setEvents((prev) => [...prev, holidayEvent]);
      setNewHoliday({ title: "", date: "" });
      setShowAddModal(false);
      alert("✅ Holiday added successfully!");
    } catch (err) {
      console.error("Add Holiday Error:", err);
      alert("❌ Failed to add holiday.");
    }
  };

  // 🔹 Add Break
  const handleAddBreak = async (e) => {
    e.preventDefault();
    const { title, date, startTime, endTime } = newBreak;
    if (!title || !date || !startTime || !endTime) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "breaks"), {
        title,
        date,
        startTime,
        endTime,
        createdAt: serverTimestamp(),
      });

      const breakEvent = {
        id: docRef.id,
        title,
        start: new Date(`${date}T${startTime}`),
        end: new Date(`${date}T${endTime}`),
        allDay: false,
        type: "break",
      };

      setEvents((prev) => [...prev, breakEvent]);
      setNewBreak({ title: "", date: "", startTime: "", endTime: "" });
      setShowBreakModal(false);
      alert("✅ Break added successfully!");
    } catch (err) {
      console.error("Add Break Error:", err);
      alert("❌ Failed to add break.");
    }
  };

  // 🔹 Delete Holiday
  const handleDeleteHoliday = async (id) => {
    try {
      await deleteDoc(doc(db, "holidays", id));
      setEvents((prev) => prev.filter((event) => event.id !== id));
      alert("🗑️ Holiday deleted successfully!");
      setSelectedEvent(null);
    } catch (err) {
      console.error("Delete Holiday Error:", err);
      alert("❌ Failed to delete holiday.");
    }
  };

  return (
    <div className="min-h-screen mt-3 bg-gray-50 px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">
            📅 Leave, Holiday & Break Calendar
          </h2>
          <p className="text-gray-500 mt-1">
            View employee leaves, manage holidays, and track daily breaks.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow-sm transition"
          >
            ➕ Add Holiday
          </button>

          <button
            onClick={() => setShowBreakModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-md shadow-sm transition"
          >
            ☕ Add Break
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 650 }}
          eventPropGetter={(event) => {
            let backgroundColor = "#facc15"; // Default Yellow
            let textColor = "#1f2937";

            if (event.type === "holiday") backgroundColor = "#d1d5db"; // Gray
            else if (event.type === "break")
              backgroundColor = event.title.toLowerCase().includes("lunch")
                ? "#60a5fa"
                : "#c084fc"; // Blue or Purple
            else if (event.status === "Approved") backgroundColor = "#4ade80";
            else if (event.status === "Rejected") backgroundColor = "#f87171";

            return {
              style: {
                backgroundColor,
                color: textColor,
                borderRadius: "8px",
                border: "none",
              },
            };
          }}
          onSelectEvent={(event) => setSelectedEvent(event)}
        />
      </div>

      {/* Add Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              ➕ Add New Holiday
            </h3>
            <form onSubmit={handleAddHoliday}>
              <div className="mb-3">
                <label className="block text-gray-600 font-medium">
                  Holiday Name
                </label>
                <input
                  type="text"
                  value={newHoliday.title}
                  onChange={(e) =>
                    setNewHoliday({ ...newHoliday, title: e.target.value })
                  }
                  className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium">Date</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) =>
                    setNewHoliday({ ...newHoliday, date: e.target.value })
                  }
                  className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Break Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              ☕ Add New Break
            </h3>
            <form onSubmit={handleAddBreak}>
              <div className="mb-3">
                <label className="block text-gray-600 font-medium">
                  Break Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lunch Break, Tea Break"
                  value={newBreak.title}
                  onChange={(e) =>
                    setNewBreak({ ...newBreak, title: e.target.value })
                  }
                  className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium">Date</label>
                  <input
                    type="date"
                    value={newBreak.date}
                    onChange={(e) =>
                      setNewBreak({ ...newBreak, date: e.target.value })
                    }
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newBreak.startTime}
                    onChange={(e) =>
                      setNewBreak({ ...newBreak, startTime: e.target.value })
                    }
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newBreak.endTime}
                    onChange={(e) =>
                      setNewBreak({ ...newBreak, endTime: e.target.value })
                    }
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowBreakModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                >
                  Save Break
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {selectedEvent.title}
            </h3>

            {selectedEvent.type === "holiday" && (
              <>
                <p className="text-gray-600 mb-4">🏖 Public Holiday</p>
                <button
                  onClick={() => handleDeleteHoliday(selectedEvent.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md mt-3"
                >
                  🗑 Delete Holiday
                </button>
              </>
            )}

            {selectedEvent.type === "break" && (
              <p className="text-gray-600 mb-4">
                🕒 From {format(selectedEvent.start, "hh:mm a")} to{" "}
                {format(selectedEvent.end, "hh:mm a")}
              </p>
            )}

            {selectedEvent.type === "leave" && (
              <>
                <p className="text-gray-600 text-sm mb-2">
                  🆔 {selectedEvent.employeeId}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>📅 From:</strong> {selectedEvent.fromDate}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>📅 To:</strong> {selectedEvent.toDate}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>📝 Reason:</strong> {selectedEvent.reason}
                </p>
              </>
            )}

            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3 right-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveCalendarPage;
