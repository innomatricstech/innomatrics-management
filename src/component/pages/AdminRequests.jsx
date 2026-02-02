import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [comment, setComment] = useState("");

  // 🔹 Fetch all requests
  useEffect(() => {
    const q = query(
      collection(db, "requests"),
      orderBy("appliedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() })
      );
      setRequests(list);
    });

    return () => unsub();
  }, []);

  // 🔹 Update status
  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "requests", id), {
        status,
        managerComment: comment || "",
        actionAt: new Date()
      });

      setComment("");
      alert(`Request ${status.toUpperCase()} ✅`);
    } catch (err) {
      console.error(err);
      alert("Failed to update request");
    }
  };

  const badgeColor = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Request Approvals</h1>
        <p className="text-gray-500 mt-1">
          Approve or reject employee requests
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gray-800 p-5">
          <h2 className="text-xl font-semibold text-white">
            All Requests
          </h2>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Reason</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b last:border-none">

                  <td className="py-3">
                    <div className="font-medium">{r.employeeName}</div>
                    <div className="text-sm text-gray-500">
                      {r.employeeId}
                    </div>
                  </td>

                  <td className="py-3 capitalize">{r.type}</td>

                  <td className="py-3">
                    {r.type === "leave"
                      ? `${r.fromDate} → ${r.toDate}`
                      : r.date}
                  </td>

                  <td className="py-3 text-gray-600 max-w-xs truncate">
                    {r.reason}
                  </td>

                  <td className="py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3 space-y-2">
                    {r.status === "pending" ? (
                      <>
                        <textarea
                          placeholder="Manager comment (optional)"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full border rounded-lg p-2 text-sm"
                          rows={2}
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(r.id, "approved")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "rejected")}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Action taken
                      </span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {requests.length === 0 && (
            <p className="text-center py-10 text-gray-400">
              No requests found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
