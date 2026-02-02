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
  const [activeView, setActiveView] = useState("cards");
  const [searchTerm, setSearchTerm] = useState("");

  // ===================== DEFAULT FORM =====================
  const defaultForm = {
    id: "",
    name: "",
    employeeId: "",
    email: "",
    phone: "",
    designation: "",
    role: "",
    department: "",
    experience: "",
    skills: "",
    joiningDate: "",
    manager: "",
    location: "",
    paymentMode: "",
    bankName: "",
    bankIFSC: "",
    bankAccount: "",
    linkedIn: "",
    github: "",
    image: "",
    about: "",
    loginEmail: "",
    password: "",
  };

  const [formData, setFormData] = useState(defaultForm);

  // ===================== FETCH DATA =====================
  useEffect(() => {
    const q = query(collection(db, "team"), orderBy("name"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setTeam(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching team:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // ===================== FILTERED TEAM =====================
  const filteredTeam = team.filter(
    (member) =>
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===================== HANDLERS =====================
  const openAddModal = () => {
    setFormData(defaultForm);
    setShowFormModal(true);
  };

  const openEditModal = (member) => {
    setFormData({ ...defaultForm, ...member });
    setShowFormModal(true);
    setSelectedMember(null);
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    delete payload.id;

    try {
      if (formData.id) {
        await updateDoc(doc(db, "team", formData.id), payload);
      } else {
        await addDoc(collection(db, "team"), payload);
      }
      setShowFormModal(false);
      setFormData(defaultForm);
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Failed to save employee details");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteDoc(doc(db, "team", id));
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
    }
  };

  // ===================== FORM GROUPS =====================
  const formGroups = [
    {
      title: "📋 Personal Information",
      fields: [
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "employeeId", label: "Employee ID", type: "text", required: true },
        { name: "email", label: "Email Address", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "tel" },
        { name: "location", label: "Location", type: "text" },
        { name: "image", label: "Profile Image URL", type: "url" },
      ],
    },
    {
      title: "💼 Professional Details",
      fields: [
        { name: "designation", label: "Designation", type: "text" },
        { name: "role", label: "Role", type: "text", required: true },
        { name: "department", label: "Department", type: "text" },
        { name: "experience", label: "Experience (Years)", type: "number" },
        { name: "joiningDate", label: "Joining Date", type: "date" },
        { name: "manager", label: "Manager", type: "text" },
      ],
    },
    {
      title: "🏦 Bank & Account",
      fields: [
        { name: "paymentMode", label: "Payment Mode", type: "text" },
        { name: "bankName", label: "Bank Name", type: "text" },
        { name: "bankIFSC", label: "Bank IFSC", type: "text" },
        { name: "bankAccount", label: "Bank Account", type: "text" },
        { name: "loginEmail", label: "Login Email", type: "email" },
        { name: "password", label: "Password", type: "password" },
      ],
    },
    {
      title: "🌐 Social & Additional",
      fields: [
        { name: "linkedIn", label: "LinkedIn URL", type: "url" },
        { name: "github", label: "GitHub URL", type: "url" },
      ],
    },
  ];

  // ===================== LOADING SKELETON =====================
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* ===================== HEADER ===================== */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                👥 Innomatrics Team
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your team members and their details
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span className="text-lg">+</span>
              Add New Member
            </button>
          </div>

          {/* ===================== CONTROLS ===================== */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search by name, role, department, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView("cards")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === "cards"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🏷️ Card View
              </button>
              <button
                onClick={() => setActiveView("list")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === "list"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📋 List View
              </button>
            </div>
          </div>
        </div>

        {/* ===================== TEAM GRID/LIST ===================== */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredTeam.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No team members found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start by adding your first team member"}
            </p>
          </div>
        ) : activeView === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeam.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 group cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img
                      src={
                        member.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.name
                        )}&background=3b82f6&color=fff&size=128&bold=true`
                      }
                      alt={member.name}
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {member.role?.charAt(0) || "M"}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2">
                    {member.designation}
                  </p>
                  <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {member.department} • {member.role}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                    {member.location && (
                      <span className="flex items-center gap-1">
                        📍 {member.location}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(member);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(member);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    👤 Employee
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    💼 Role & Department
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    📞 Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    ⚙️ Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeam.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={
                            member.image ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              member.name
                            )}&background=3b82f6&color=fff`
                          }
                          alt={member.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            🆔 ID: {member.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{member.role}</div>
                      <div className="text-sm text-gray-500">
                        {member.department}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">📧 {member.email}</div>
                      <div className="text-sm text-gray-500">📱 {member.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===================== ADD/EDIT MODAL ===================== */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {formData.id ? "✏️ Edit Employee" : "➕ Add New Employee"}
                  </h2>
                  <p className="text-gray-600">
                    Fill in the employee details below
                  </p>
                </div>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {formGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                      <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
                        {group.title}
                      </h3>
                      {group.fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          <input
                            type={field.type}
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleFormChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required={field.required}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Skills and About */}
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔧 Skills (comma separated)
                    </label>
                    <textarea
                      name="skills"
                      value={formData.skills || ""}
                      onChange={handleFormChange}
                      placeholder="e.g., React, Node.js, UI/UX Design"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📝 About
                    </label>
                    <textarea
                      name="about"
                      value={formData.about || ""}
                      onChange={handleFormChange}
                      placeholder="Brief description about the employee..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-32"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    ❌ Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    {formData.id ? "💾 Update Employee" : "💾 Add Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== DETAILS MODAL ===================== */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl">
                <div className="absolute -bottom-16 left-8">
                  <img
                    src={
                      selectedMember.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedMember.name
                      )}&background=ffffff&color=3b82f6&size=128&bold=true`
                    }
                    alt={selectedMember.name}
                    className="w-32 h-32 rounded-full border-8 border-white shadow-2xl"
                  />
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="pt-20 px-8 pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {selectedMember.name}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        💼 {selectedMember.designation}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedMember.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <button
                      onClick={() => openEditModal(selectedMember)}
                      className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(selectedMember.id, selectedMember.name)
                      }
                      className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Three-column details layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">
                      📧 Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">📧 Email</div>
                        <div className="font-medium">{selectedMember.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">📱 Phone</div>
                        <div className="font-medium">{selectedMember.phone}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">📍 Location</div>
                        <div className="font-medium">{selectedMember.location}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">📅 Experience</div>
                        <div className="font-medium">{selectedMember.experience} years</div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">
                      💼 Professional Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">🏢 Department</div>
                        <div className="font-medium">{selectedMember.department}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">🆔 Employee ID</div>
                        <div className="font-medium">{selectedMember.employeeId}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">👨‍💼 Manager</div>
                        <div className="font-medium">{selectedMember.manager}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">📅 Joining Date</div>
                        <div className="font-medium">
                          {new Date(selectedMember.joiningDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Banking Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">
                      🏦 Banking Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">💳 Payment Mode</div>
                        <div className="font-medium">{selectedMember.paymentMode}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">🏛️ Bank Name</div>
                        <div className="font-medium">{selectedMember.bankName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">🔢 Account Number</div>
                        <div className="font-medium">{selectedMember.bankAccount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">🏷️ IFSC Code</div>
                        <div className="font-medium">{selectedMember.bankIFSC}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  {selectedMember.skills && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">🔧 Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.skills.split(",").map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMember.about && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">📝 About</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedMember.about}
                      </p>
                    </div>
                  )}

                  {(selectedMember.linkedIn || selectedMember.github) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">🌐 Social Links</h4>
                      <div className="flex gap-3">
                        {selectedMember.linkedIn && (
                          <a
                            href={selectedMember.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            🔗 LinkedIn
                          </a>
                        )}
                        {selectedMember.github && (
                          <a
                            href={selectedMember.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            💻 GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Team;