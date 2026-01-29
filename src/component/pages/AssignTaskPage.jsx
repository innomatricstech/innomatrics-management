import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

const AssignTaskPage = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    employeeId: "",
    dueDate: "",
    priority: "Medium",
    assignmentType: "",
  });

  // 🔹 Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const q = query(collection(db, "team"));
        const snapshot = await getDocs(q);
        setEmployees(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  // 🔹 Fetch Tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const q = query(collection(db, "tasks"));
        const snapshot = await getDocs(q);
        setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    fetchTasks();
  }, []);

  // 🔹 Submit Task
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!task.assignmentType) return alert("Please select assignment type!");
    if (!task.employeeId) return alert("Please select an employee!");

    try {
      await addDoc(collection(db, "tasks"), {
        ...task,
        createdAt: serverTimestamp(),
      });

      alert("✅ Task Assigned Successfully!");
      setTask({
        title: "",
        description: "",
        assignedTo: "",
        employeeId: "",
        dueDate: "",
        priority: "Medium",
        assignmentType: "",
      });

      // Refresh Task List
      const q = query(collection(db, "tasks"));
      const snapshot = await getDocs(q);
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error adding task:", err);
      alert("❌ Failed to add task. Check console for details.");
    }
  };

  // 🔹 Delete Task
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      setTasks(tasks.filter((t) => t.id !== id));
      alert("🗑 Task deleted successfully!");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("❌ Failed to delete task.");
    }
  };

  // 🔹 Handle Employee Selection
  const handleSelectEmployee = (e) => {
    const selectedId = e.target.value;
    const selectedEmp = employees.find(
      (emp) => emp.employeeId === selectedId || emp.id === selectedId
    );

    setTask({
      ...task,
      assignedTo: selectedEmp?.name || "",
      employeeId: selectedEmp?.employeeId || selectedEmp?.id || "",
    });
  };

  return (
    <div className="min-h-screen mt-3 bg-gray-50 px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">🗂️ Assign Tasks</h2>
          <p className="text-gray-500 mt-1">
            Manage and assign tasks to your IT team efficiently.
          </p>
        </div>
      </div>

      {/* Assign Task Form */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100 mb-10">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Create New Task</h3>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Task Title */}
          <div>
            <label className="text-gray-600 font-medium">Task Title</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              required
            />
          </div>

          {/* Assignment Type */}
          <div>
            <label className="text-gray-600 font-medium">Assignment Type</label>
            <select
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              value={task.assignmentType}
              onChange={(e) =>
                setTask({
                  ...task,
                  assignmentType: e.target.value,
                  assignedTo: "",
                  employeeId: "",
                })
              }
              required
            >
              <option value="">Select Type</option>
              <option value="Individual">Individual</option>
              <option value="Team">Team</option>
            </select>
          </div>

          {/* Assign To */}
          <div>
            <label className="text-gray-600 font-medium">
              {task.assignmentType === "Team" ? "Select Team Lead" : "Assign To"}
            </label>
            <select
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              value={task.employeeId}
              onChange={handleSelectEmployee}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.employeeId || emp.id}>
                  {emp.name || "Unnamed"} — {emp.employeeId || emp.id || "No ID"}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="text-gray-600 font-medium">Description</label>
            <textarea
              rows="3"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              required
            ></textarea>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-gray-600 font-medium">Due Date</label>
            <input
              type="date"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              value={task.dueDate}
              onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-gray-600 font-medium">Priority</label>
            <select
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              value={task.priority}
              onChange={(e) => setTask({ ...task, priority: e.target.value })}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-all shadow-sm"
            >
              ➕ Assign Task
            </button>
          </div>
        </form>
      </div>

      {/* Task List */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Assigned Tasks</h3>

        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <p>No tasks assigned yet. Start by creating one above.</p>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <h4 className="font-semibold text-gray-800 text-lg">{t.title}</h4>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {t.description}
                </p>

                <div className="flex flex-wrap items-center justify-between mt-3 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full font-medium ${
                      t.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : t.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {t.priority}
                  </span>
                  <span className="text-gray-500">Due: {t.dueDate || "—"}</span>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  {t.assignmentType === "Team" ? (
                    <>
                      👥 <span className="font-semibold">Team Task</span> <br />
                      Lead: {t.assignedTo || "—"} ({t.employeeId || "—"})
                    </>
                  ) : (
                    <>
                      👤 {t.assignedTo || "Unassigned"} <br />
                      🆔 {t.employeeId || "—"}
                    </>
                  )}
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
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

export default AssignTaskPage;
