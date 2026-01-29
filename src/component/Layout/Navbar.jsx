import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/Auth";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import logo from "../../assets/innomatric_logo_only.png";

function Navbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to log out.");
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-md p-4 md:p-5 sticky top-0 md:top-0 z-30 transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center">
        
        <Link
          to="/"
          className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
        >
          <img
            src={logo}
            alt="Innomatrics Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="hidden sm:inline text-lg sm:text-xl md:text-2xl font-bold text-blue-600 whitespace-nowrap">
  Innomatrics Technologies
</span>

           
        </Link>

        {/* 🔹 Navigation / Auth Links */}
        <div className="flex items-center space-x-4 md:space-x-5">
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 md:px-5 py-2 rounded-md hover:bg-red-600 transition-all font-medium shadow-sm"
            >
              Logout
            </button>
          ) : (
            <>
              {/* <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                Login
              </Link> */}
              {/* <Link
                to="/signup"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition font-medium shadow-sm"
              >
                Sign Up
              </Link> */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
