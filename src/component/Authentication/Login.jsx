import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import logo from "../../assets/innomatric_logo_only.png";
import { Eye, EyeOff } from "lucide-react";



function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // 1️⃣ Firebase Auth Login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const loggedInEmail = userCredential.user.email;

    // 2️⃣ Fetch user from Firestore (team collection)
    const q = query(
      collection(db, "team"),
      where("loginEmail", "==", loggedInEmail)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("User record not found in database");
    }

    // 3️⃣ Get user data
    const userDoc = snapshot.docs[0];
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    };

    // 4️⃣ Save user data in localStorage
    localStorage.setItem("user", JSON.stringify(userData));

    // 5️⃣ Redirect based on role
    if (userData.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/dashboard");
    }

  } catch (err) {
    console.error(err);

    if (err.code === "auth/invalid-credential") {
      setError("Invalid email or password.");
    } else {
      setError(err.message || "Login failed");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#2a2a2a] overflow-hidden">
      {/* Animated glowing blobs in background */}
      <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl top-[-5rem] left-[-5rem] animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-[-5rem] right-[-5rem] animate-pulse"></div>

      {/* Login Card with background */}
      <div className="relative z-10 w-full max-w-md p-10 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-lg 
                      bg-gradient-to-br from-[#ffffff1a] via-[#ffffff0d] to-[#ffffff1a]">
        {/* Card Background Accent Layer */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent blur-xl"></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="Innomatrics Logo"
              className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            />
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 tracking-wide text-white">
            Welcome Back 👋
          </h2>
          <p className="text-center text-gray-300 mb-6 text-sm">
            Sign in to continue to your dashboard
          </p>

          {error && (
            <p className="bg-red-500/20 text-red-200 p-3 rounded-md mb-4 text-center border border-red-400/30 text-sm">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-1 text-gray-200">Email</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-gray-300 text-white focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
            </div>
<div>
  <label className="block text-sm mb-1 text-gray-200">Password</label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="w-full p-3 pr-12 rounded-lg bg-white/20 border border-white/30 
                 placeholder-gray-300 text-white focus:ring-2 
                 focus:ring-pink-400 focus:outline-none"
    />

    {/* Eye Icon */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 
                 hover:text-white transition"
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
</div>


            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-pink-500/40 hover:scale-105 transform transition-all duration-300 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Innomatrics Technologies
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
