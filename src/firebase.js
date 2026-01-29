// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  limit,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBwh9KvSYkZuSA1fq1A7QVhHLx2B6H3uNA",
  authDomain: "innomatrics-employee.firebaseapp.com",
  projectId: "innomatrics-employee",
  storageBucket: "innomatrics-employee.appspot.com",
  messagingSenderId: "806122281643",
  appId: "1:806122281643:web:30bb3401e1f244ae4ef5ee",
  measurementId: "G-7QQWBYVTFY",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
};
