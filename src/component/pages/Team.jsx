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

  const defaultForm = {
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
    loginEmail: "",
    password: "",
  };

  const [formData, setFormData] = useState(defaultForm);

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

  const openAddModal = () => {
    setFormData(defaultForm);
    setShowFormModal(true);
  };

  const openEditModal = (member) => {
    setFormData({ ...defaultForm, ...member });
    setShowFormModal(true);
  };

  const handleFormChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      delete payload.id;

      if (formData.id) {
        const ref = doc(db, "team", formData.id);
        await updateDoc(ref, payload);
        alert("Employee updated successfully!");
      } else {
        await addDoc(collection(db, "team"), payload);
        alert("Employee added successfully!");
      }

      setShowFormModal(false);
      setFormData(defaultForm);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save employee.");
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this employee?");
    if (!ok) return;

    try {
      const ref = doc(db, "team", id);
      await deleteDoc(ref);
      alert("Employee deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete employee");
    }
  };

  const showDetails = (member) => setSelectedMember(member);
  const closeDetails = () => setSelectedMember(null);

  const formFields = [
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
    "loginEmail",
    "password",
  ];

  return (
    <div className="min-h-screen mt-2 bg-gray-50 px-4 py-10">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Innomatrics Team</h1>
          <p className="text-gray-600">Manage team details</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {loading ? (
          <div>Loading...</div>
        ) : team.length > 0 ? (
          team.map((m) => (
            <div
              key={m.id}
              onClick={() => showDetails(m)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer flex flex-col items-center"
            >
              <img
                src={
                  m.image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    m.name || "User"
                  )}`
                }
                alt={m.name}
                className="w-20 h-20 rounded-full mb-3"
              />
              <div className="font-semibold">{m.name}</div>
              <div className="text-sm text-blue-600">{m.role}</div>
            </div>
          ))
        ) : (
          <div>No employees found</div>
        )}
      </div>

      {showFormModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-semibold mb-3">
              {formData.id ? "Edit Employee" : "Add Employee"}
            </h2>

            <form
              onSubmit={handleFormSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {formFields.map((f) => (
                <input
                  key={f}
                  name={f}
                  type={
                    f === "joiningDate"
                      ? "date"
                      : f === "password"
                      ? "password"
                      : "text"
                  }
                  value={formData[f] || ""}
                  onChange={handleFormChange}
                  placeholder={f}
                  className="border rounded p-2"
                />
              ))}

              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleFormChange}
                placeholder="Skills"
                className="border rounded p-2 md:col-span-2"
              />

              <textarea
                name="about"
                value={formData.about}
                onChange={handleFormChange}
                placeholder="About"
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
      )}

      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl p-6">
            <button
              onClick={closeDetails}
              className="float-right text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-2">
              {selectedMember.name}
            </h2>

            <p className="mb-4 text-gray-600">
              {selectedMember.role} • {selectedMember.department}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{selectedMember.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Login Email</p>
                <p>{selectedMember.loginEmail || "N/A"}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  openEditModal(selectedMember);
                  setSelectedMember(null);
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedMember.id);
                  setSelectedMember(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;