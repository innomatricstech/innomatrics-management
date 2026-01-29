import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../Authentication/Auth";
import { useNavigate } from "react-router-dom";
import ProjectForm from "../Dashboard/ProjectForm";

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("latest");
  const [editingProject, setEditingProject] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("To Do");

  const navigate = useNavigate();

  // 🔹 Fetch All Projects (Realtime)
  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setProjects(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchProjects();

    // Realtime listener
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Metrics
  const metrics = useMemo(
    () => ({
      total: projects.length,
      todo: projects.filter((p) => p.status === "To Do").length,
      progress: projects.filter((p) => p.status === "In Progress").length,
      done: projects.filter((p) => p.status === "Completed").length,
    }),
    [projects]
  );

  // 🔹 Filter + Sort + Search
  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (filter !== "All") list = list.filter((p) => p.status === filter);
    if (search.trim())
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(search.toLowerCase())
      );
    if (sort === "latest")
      list.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    else if (sort === "oldest")
      list.sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
    else if (sort === "status")
      list.sort((a, b) => a.status?.localeCompare(b.status));
    return list;
  }, [projects, filter, search, sort]);

  // 🔹 Delete a Project
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "projects", id));
      alert("✅ Project deleted successfully!");
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("❌ Failed to delete project");
    }
  };

  // 🔹 Open Edit Mode
  const handleEdit = (project) => {
    setEditingProject(project);
    setEditTitle(project.title);
    setEditDescription(project.description);
    setEditStatus(project.status || "To Do");
  };

  // 🔹 Save Edited Project
  const handleSaveEdit = async () => {
    try {
      await updateDoc(doc(db, "projects", editingProject.id), {
        title: editTitle,
        description: editDescription,
        status: editStatus,
      });
      alert("✅ Project updated successfully!");
      setEditingProject(null);
    } catch (err) {
      console.error("Error updating project:", err);
      alert("❌ Failed to update project");
    }
  };

  // 🔹 Cancel Edit
  const handleCancelEdit = () => {
    setEditingProject(null);
  };

  return (
    <div className="p-10 mt-3 sm:p-1 space-y-6 bg-gradient-to-b from-blue-50 to-white min-h-screen overflow-y-auto">
      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
        Welcome back, {currentUser?.email?.split("@")[0] || "User"}!
      </h2>

      {/* Metrics Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", val: metrics.total, color: "bg-white text-gray-800 border-blue-100 border-l-4 border-blue-400" },
          { label: "To Do", val: metrics.todo, color: "bg-red-50 text-red-700 border-l-4 border-red-400" },
          { label: "In Progress", val: metrics.progress, color: "bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400" },
          { label: "Completed", val: metrics.done, color: "bg-green-50 text-green-700 border-l-4 border-green-400" },
        ].map((m) => (
          <div
            key={m.label}
            className={`rounded-xl p-4 text-center shadow-sm transition-transform hover:scale-105 ${m.color}`}
          >
            <p className="text-xs sm:text-sm uppercase font-semibold tracking-wide">{m.label}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{m.val}</p>
          </div>
        ))}
      </div>

      {/* Project Form */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
        <ProjectForm />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mt-4">
        <input
          type="text"
          placeholder="🔍 Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full sm:w-64 focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="All">All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="latest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="status">By Status</option>
          </select>
        </div>
      </div>

      {/* Project List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-40 sm:h-44"></div>
            ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center mt-10 text-gray-500">
          <img
            src="https://illustrations.popsy.co/gray/empty-state.svg"
            alt="empty"
            className="w-40 sm:w-60 mx-auto mb-4"
          />
          <p>No projects found. Create one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {filteredProjects.map((p) =>
            editingProject?.id === p.id ? (
              // 🔹 Edit Form View
              <div key={p.id} className="bg-white shadow-md rounded-xl p-5 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">✏️ Edit Project</h3>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border p-2 w-full rounded mb-2"
                  placeholder="Project Title"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="border p-2 w-full rounded mb-2"
                  placeholder="Description"
                />
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="border p-2 w-full rounded mb-3"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              // 🔹 Normal Project Card View
              <div
                key={p.id}
                className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition-all border border-gray-100 flex flex-col justify-between"
              >
                <div onClick={() => navigate(`/projects/${p.id}`)} className="cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {p.title || "Untitled Project"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {p.description || "No description provided."}
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm mt-3 pt-3 border-t border-gray-200">
                  <span
                    className={`px-2 py-1 rounded-full font-medium ${
                      p.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : p.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.status || "Pending"}
                  </span>
                  <span className="text-gray-500">
                    {p.createdAt?.toDate
                      ? new Date(p.createdAt.toDate()).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                {/* 🔹 Edit & Delete Buttons */}
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1 text-blue-600 border border-blue-500 rounded hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 text-red-600 border border-red-500 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;