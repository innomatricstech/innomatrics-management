// src/Dashboard/ProjectForm.jsx
import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../Authentication/Auth";

const ProjectForm = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
  });
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in first.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Project title is required!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "projects"), {
        ...formData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("✅ Project added successfully!");
      setFormData({
        title: "",
        description: "",
        status: "To Do",
        priority: "Medium",
      });
    } catch (err) {
      console.error("Error adding project:", err);
      alert("❌ Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
        ➕ Add New Project
      </h3>
      <div>
        <label className="block text-sm text-gray-600">Project Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter project title..."
          className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="Describe your project..."
          className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-600">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-400"
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-400"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Project"}
      </button>
    </form>
  );
};

export default ProjectForm;
