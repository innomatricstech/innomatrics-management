import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/Auth';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Sidebar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Tasks', path: '/assign-task', icon: '📝' },
    { name: 'Reports', path: '/reports', icon: '📊' },
    { name: 'Team', path: '/team', icon: '👥' },
    { name: 'Calendar', path: '/calendar', icon: '📅' },
    // { name: 'Messages', path: '/messages', icon: '💬' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    // { name: 'Settings', path: '/settings', icon: '⚙️' },
    { name: 'Payslip', path: '/payslip', icon: '🧰' },
    // { name: 'Profile', path: '/profile', icon: '🙍‍♂️' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <>
      {/* 🌐 MOBILE TOP BAR (Placed Below Navbar) */}
<div className="md:hidden fixed top-[60px] left-0 right-0 bg-gray-900 text-white flex items-center justify-between px-5 py-3 shadow-lg z-20">
  <h1 className="text-lg font-bold text-blue-400 tracking-wide">
    P-Manager
  </h1>
  <button
    onClick={() => setIsOpen(true)}
    className="p-2 rounded-md hover:bg-gray-800"
  >
    <Menu className="w-6 h-6" />
  </button>
</div>
x

      {/* 🖥 DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed left-0 top-15 w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white border-r border-gray-700/50 shadow-xl z-30">
        {/* Header */}
        <div className="p-5 border-b border-gray-700 flex flex-col items-start">
          <div className="flex items-center space-x-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser.email
              )}&background=0D8ABC&color=fff`}
              alt="avatar"
              className="w-10 h-10 rounded-full border border-gray-500"
            />
            <div>
              <p className="text-sm font-semibold">{currentUser.email}</p>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-blue-400 mt-4">P-Manager</h2>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-md transition duration-150 text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-md font-semibold text-sm transition-all"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* 📱 MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 w-72 max-w-[85vw] h-full bg-gray-900 text-white shadow-2xl flex flex-col z-50"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-700">
                <h2 className="text-lg font-bold text-blue-400">P-Manager</h2>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-700">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    currentUser.email
                  )}&background=0D8ABC&color=fff`}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border border-gray-600"
                />
                <div>
                  <p className="text-sm font-semibold">{currentUser.email}</p>
                  <p className="text-xs text-green-400">Online</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-md transition duration-150 text-base ${
                        isActive
                          ? 'bg-blue-600/90 text-white shadow-md'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="border-t border-gray-700 p-5">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-md font-semibold text-sm transition-all"
                >
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
