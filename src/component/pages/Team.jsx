import React, { useEffect, useState } from "react";
import {
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "../../firebase";

function Team() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    employeeId: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    experience: "",
    skills: "",
    joiningDate: "",
    manager: "",
    location: "",
    linkedIn: "",
    github: "",
    image: "",
    about: "",
  });

  // 🔹 Fetch live data from Firestore
  useEffect(() => {
    const q = query(collection(db, "team"), orderBy("name"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeam(data);
        setLoading(false);
      },
      (err) => {
        console.error("onSnapshot error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // 🔹 Open Add Modal
  const openAddModal = () => {
    setFormData({
      id: "",
      name: "",
      employeeId: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      experience: "",
      skills: "",
      joiningDate: "",
      manager: "",
      location: "",
      linkedIn: "",
      github: "",
      image: "",
      about: "",
    });
    setShowFormModal(true);
  };

  // 🔹 Open Edit Modal
  const openEditModal = (member) => {
    setFormData({ ...member });
    setShowFormModal(true);
  };

  const handleFormChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  // 🔹 Add or Update Employee
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      delete payload.id;

      if (formData.id) {
        // ✅ Update existing document
        const ref = doc(db, "team", formData.id);
        await updateDoc(ref, payload);
        alert("✅ Employee updated successfully!");
      } else {
        // ✅ Add new document
        await addDoc(collection(db, "team"), payload);
        alert("✅ Employee added successfully!");
      }

      setShowFormModal(false);
      setFormData((f) => ({ ...f, id: "" }));
    } catch (err) {
      console.error("Save failed:", err);
      alert("❌ Failed to save employee. Check console.");
    }
  };

  // 🔹 Delete Employee
  const handleDelete = async (id) => {
    if (!id) return alert("Missing employee ID");
    const ok = window.confirm("Are you sure you want to permanently delete this member?");
    if (!ok) return;

    try {
      console.log("🗑️ Attempting delete:", id);
      const ref = doc(db, "team", id);
      console.log("✅ Firestore doc ref:", ref.path);

      await deleteDoc(ref);
      alert("✅ Employee deleted successfully!");
    } catch (err) {
      console.error("🔥 Delete failed:", err);
      alert("❌ Failed to delete employee: " + err.message);
    }
  };

  const showDetails = (member) => setSelectedMember(member);
  const closeDetails = () => setSelectedMember(null);

  return (
    <div className="min-h-screen mt-2 bg-gray-50 px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Innomatrics Team</h1>
          <p className="text-gray-600">Manage your IT team details (live).</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          ➕ Add Employee
        </button>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-xl shadow p-6 flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-gray-200 rounded-full mb-4" />
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </div>
              ))
          : team.length > 0
          ? team.map((m) => (
              <div
                key={m.id}
                onClick={() => showDetails(m)}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer flex flex-col items-center text-center"
              >
                <img
                  src={
                    m.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      m.name || "User"
                    )}&background=0D8ABC&color=fff`
                  }
                  alt={m.name}
                  className="w-20 h-20 rounded-full border-4 border-blue-500 object-cover mb-3"
                />
                <div className="font-semibold text-gray-800">{m.name || "Unnamed"}</div>
                <div className="text-sm text-blue-600">{m.role || "—"}</div>
                <div className="text-xs text-gray-500 mt-2">{m.department || ""}</div>
              </div>
            ))
          : (
            <div className="col-span-full text-center text-gray-500 py-20">
              No employees found.
            </div>
          )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-auto max-h-[90vh]">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-3">
                {formData.id ? "Edit Employee" : "Add Employee"}
              </h2>

              <form
                onSubmit={handleFormSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {[
                  "name",
                  "employeeId",
                  "email",
                  "phone",
                  "role",
                  "department",
                  "experience",
                  "joiningDate",
                  "manager",
                  "location",
                  "linkedIn",
                  "github",
                  "image",
                ].map((f) => (
                  <input
                    key={f}
                    name={f}
                    type={f === "joiningDate" ? "date" : "text"}
                    value={formData[f]}
                    onChange={handleFormChange}
                    placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                    className="border rounded p-2"
                  />
                ))}
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleFormChange}
                  placeholder="Skills (comma separated)"
                  className="border rounded p-2 md:col-span-2"
                />
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleFormChange}
                  placeholder="About / Bio"
                  className="border rounded p-2 md:col-span-2"
                />
                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 rounded bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

     {selectedMember && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn">
      {/* Header Banner */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-500 relative flex-shrink-0">
        <button
          onClick={closeDetails}
          className="absolute top-4 right-4 text-white text-2xl hover:text-gray-200"
        >
          ✕
        </button>
        {/* Floating Profile */}
        <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
          <img
            src={
              selectedMember.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                selectedMember.name || "User"
              )}&background=0D8ABC&color=fff`
            }
            alt={selectedMember.name}
            className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-20 pb-8 px-8 text-center overflow-y-auto flex-1">
        <h2 className="text-2xl font-bold text-gray-800">
          {selectedMember.name}
        </h2>
        <p className="text-blue-600 font-medium mb-2">
          {selectedMember.role || "Team Member"} •{" "}
          {selectedMember.department || "IT Department"}
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Employee ID: {selectedMember.employeeId || "N/A"}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left bg-gray-50 rounded-xl p-6 shadow-inner">
          <div>
            <p className="text-gray-500 text-sm">📧 Email</p>
            <p className="font-semibold text-gray-800">
              {selectedMember.email || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">📞 Phone</p>
            <p className="font-semibold text-gray-800">
              {selectedMember.phone || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">🏢 Location</p>
            <p className="font-semibold text-gray-800">
              {selectedMember.location || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">💼 Manager</p>
            <p className="font-semibold text-gray-800">
              {selectedMember.manager || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">⚙️ Experience</p>
            <p className="font-semibold text-gray-800">
              {selectedMember.experience || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">📅 Joining Date</p>
            <p className="font-semibold text-gray-800">
              {selectedMember.joiningDate || "N/A"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-500 text-sm">🧠 Skills</p>
            <p className="font-semibold text-gray-800 break-words">
              {selectedMember.skills || "Not specified"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-500 text-sm">💬 About</p>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {selectedMember.about ||
                "This employee has not added an about section yet."}
            </p>
          </div>
        </div>

        {/* Social & Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {selectedMember.linkedIn && (
            <a
              href={selectedMember.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              🔗 LinkedIn
            </a>
          )}
          {selectedMember.github && (
            <a
              href={selectedMember.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
            >
              💻 GitHub
            </a>
          )}
          <button
            onClick={() => {
              openEditModal(selectedMember);
              setSelectedMember(null);
            }}
            className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              handleDelete(selectedMember.id);
              setSelectedMember(null);
            }}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Team;
