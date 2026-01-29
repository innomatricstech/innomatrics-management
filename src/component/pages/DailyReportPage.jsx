import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

const DailyReportPage = () => {
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({ date: "", employeeId: "" });

  // 🔹 Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const snapshot = await getDocs(collection(db, "employees"));
      setEmployees(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchEmployees();
  }, []);

  // 🔹 Real-time Reports Listener
  useEffect(() => {
    const q = query(collection(db, "dailyReports"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Filter Reports
  const filteredReports = reports.filter(
    (r) =>
      (!filter.date || r.date === filter.date) &&
      (!filter.employeeId || r.employeeId === filter.employeeId)
  );

  // 🔹 Delete Report
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "dailyReports", id));
      alert("🗑 Report deleted successfully!");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("❌ Failed to delete report.");
    }
  };

  return (
    <div className="min-h-screen mt-3 bg-gray-50 px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">
            📊 Employee Daily Reports
          </h2>
          <p className="text-gray-500 mt-1">
            View, filter, and manage all employee daily reports.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            className="border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
            value={filter.employeeId}
            onChange={(e) =>
              setFilter({ ...filter, employeeId: e.target.value })
            }
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.employeeId}>
                {emp.name} — {emp.employeeId}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setFilter({ date: "", employeeId: "" })}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-1 rounded-md transition-all"
        >
          🔄 Reset
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
        {filteredReports.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <p>No daily reports found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[600px] overflow-y-auto pr-2">
            {filteredReports.map((r) => (
              <div
                key={r.id}
                className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">
                      {r.employeeName || "Unknown"}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      🆔 {r.employeeId || "—"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      r.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : r.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  <p>
                    <strong>📆 Date:</strong> {r.date || "No date"}
                  </p>
                  <p className="mt-1">
                    <strong>🧩 Task Summary:</strong>{" "}
                    <span className="text-gray-600">{r.taskSummary}</span>
                  </p>
                  <p className="mt-1">
                    <strong>⏱ Hours Worked:</strong> {r.hoursWorked || "—"}
                  </p>
                  {r.issues && (
                    <p className="mt-1 text-red-500">
                      <strong>⚠️ Issues:</strong> {r.issues}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                  <span>📅 Submitted on: {r.date || "—"}</span>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReportPage;
