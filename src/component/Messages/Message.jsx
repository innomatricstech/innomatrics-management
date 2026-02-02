import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

const AdminMessages = () => {
  const chatId = "admin_001_sxePtdlzfygtHswplX8E";
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      },
      (error) => {
        console.error("Admin Firestore error:", error);
      }
    );

    return () => unsub();
  }, []);

  const sendMessage = async () => {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderRole: "admin",
      senderName: "Admin",
      senderEmail: "admin@company.com",
      text,
      createdAt: serverTimestamp()
    });
    setText("");
  };

  return (
    <div>
      <h2>Admin Messages</h2>

      {messages.map(m => (
        <div key={m.id}>
          <b>{m.senderName}</b>: {m.text}
        </div>
      ))}

      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default AdminMessages;
