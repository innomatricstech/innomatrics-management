import React, { useState, useEffect } from "react";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

const ProfileUpdate = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Listen for auth state changes (ensures user is loaded)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        setPhotoURL(currentUser.photoURL || "");
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage("❌ No user signed in. Please log in first.");
      return;
    }

    try {
      await updateProfile(user, {
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL,
      });
      setMessage("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage(`❌ Failed to update profile: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">Loading user data...</div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-10 text-red-500">
        You must be logged in to update your profile.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 mt-10 border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Update Profile
      </h2>

      {message && (
        <div
          className={`text-sm mb-3 p-2 rounded ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Profile Photo URL
          </label>
          <input
            type="text"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            placeholder="Enter image URL"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {photoURL && (
          <div className="flex justify-center mt-2">
            <img
              src={photoURL}
              alt="Profile Preview"
              className="w-20 h-20 rounded-full object-cover border border-gray-200"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfileUpdate;
