import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

function AdminChat() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);

  const currentUser = {
    uid: "admin_001",
    displayName: "Admin",
  };

  // 🔹 Fetch employee list from Firestore "team" collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "team"), (snapshot) => {
      const teamList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(teamList);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Select employee → load chat
  useEffect(() => {
    if (!selectedEmployee) return;

    const chatId =
      currentUser.uid < selectedEmployee.id
        ? `${currentUser.uid}_${selectedEmployee.id}`
        : `${selectedEmployee.id}_${currentUser.uid}`;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [selectedEmployee]);

  // 🔹 Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedEmployee) return;

    const chatId =
      currentUser.uid < selectedEmployee.id
        ? `${currentUser.uid}_${selectedEmployee.id}`
        : `${selectedEmployee.id}_${currentUser.uid}`;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: newMsg,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      timestamp: serverTimestamp(),
    });

    setNewMsg("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Employee List */}
      <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
        </div>

        {employees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => setSelectedEmployee(emp)}
            className={`p-4 cursor-pointer border-b hover:bg-gray-100 transition ${
              selectedEmployee?.id === emp.id ? "bg-blue-100" : ""
            }`}
          >
            <h3 className="font-medium text-gray-800">{emp.name}</h3>
            <p className="text-sm text-gray-500">ID: {emp.id}</p>
          </div>
        ))}
      </div>

      {/* Right Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedEmployee ? (
          <>
            {/* Header */}
            <div className="bg-white p-4 shadow-sm border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">
                Chat with {selectedEmployee.name}
              </h2>
              <span className="text-sm text-gray-500">
                ID: {selectedEmployee.id}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === currentUser.uid
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-xs break-words ${
                      msg.senderId === currentUser.uid
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-[10px] opacity-70 mt-1 text-right">
                      {msg.timestamp?.toDate
                        ? msg.timestamp
                            .toDate()
                            .toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="bg-white p-4 border-t flex items-center space-x-2"
            >
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-full px-4 py-2 hover:bg-blue-700 transition"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 justify-center items-center text-gray-500">
            👈 Select an employee to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminChat;
