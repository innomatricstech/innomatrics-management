// // src/components/Dashboard/ProjectCard.jsx
// import React, { useState } from 'react';
// import { db } from '../../firebase';
// import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Trash2, Edit3, Clock, CheckCircle2, Loader2, Send } from 'lucide-react'; 

// const statusOptions = [
//   { label: 'To Do', color: 'bg-red-100 text-red-800', icon: <Clock className="w-4 h-4 mr-1" /> },
//   { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: <Loader2 className="w-4 h-4 mr-1 animate-spin-slow" /> },
//   { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-4 h-4 mr-1" /> },
// ];

// function ProjectCard({ project }) {
//   const { id, title, description, status, priority = 'Medium', progress = 0 } = project;
//   const [loading, setLoading] = useState(false);
//   const [localProgress, setLocalProgress] = useState(progress); 

//   // 🔄 Update project status (Auto-sets progress to 100 on 'Completed')
//   const handleStatusChange = async (e) => {
//     e.stopPropagation();
//     const newStatus = e.target.value;
//     setLoading(true);

//     const updateData = { status: newStatus };

//     // ⭐️ LOGIC 1: Status Change -> Progress Update
//     if (newStatus === 'Completed') {
//         updateData.progress = 100;
//         setLocalProgress(100);
//     }

//     try {
//       const projectRef = doc(db, 'projects', id);
//       await updateDoc(projectRef, updateData);
//     } catch (error) {
//       console.error("Error updating status:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 📈 Handle manual progress change (Auto-sets status to 'Completed' if progress hits 100)
//   const handleProgressUpdate = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     // Ensure progress is a number within 0-100 range and an actual change occurred
//     const newProgress = Math.max(0, Math.min(100, parseInt(localProgress, 10)));
//     if (isNaN(newProgress) || newProgress === progress) return;

//     setLoading(true);
//     let newStatus = status;
    
//     // ⭐️ LOGIC 2: Progress Update -> Status Change
//     if (newProgress === 100 && status !== 'Completed') {
//         newStatus = 'Completed';
//     } else if (newProgress < 100 && status === 'Completed') {
//         newStatus = 'In Progress';
//     }
    
//     try {
//       const projectRef = doc(db, 'projects', id);
//       await updateDoc(projectRef, { progress: newProgress, status: newStatus });
//       setLocalProgress(newProgress); 
//     } catch (error) {
//       console.error("Error updating progress:", error);
//     } finally {
//       setLoading(false);
//     }
//   };


//   // 🗑️ Delete project
//   const handleDelete = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
//       try {
//         await deleteDoc(doc(db, 'projects', id));
//       } catch (error) {
//         console.error("Error deleting project:", error);
//       }
//     }
//   };

//   // 🎨 Priority color system
//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'High': return 'text-red-600 bg-red-100';
//       case 'Medium': return 'text-yellow-700 bg-yellow-100';
//       case 'Low': return 'text-green-700 bg-green-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   // 🌈 Status visual style
//   const currentStatus = statusOptions.find(opt => opt.label === status) || statusOptions[0];

//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       whileTap={{ scale: 0.98 }}
//       transition={{ duration: 0.2 }}
//     >
//       <Link to={`/project/${id}`} className="block h-full">
//         <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-2xl transition-all duration-300 p-5 flex flex-col justify-between relative overflow-hidden">

//           {/* Glow accent */}
//           <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-transparent opacity-0 hover:opacity-100 transition duration-500"></div>

//           {/* Title and Description */}
//           <div className="z-10">
//             <div className="flex justify-between items-start">
//               <h4 className="text-lg font-semibold text-gray-900 truncate">{title}</h4>
//               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(priority)}`}>
//                 {priority}
//               </span>
//             </div>

//             <p className="text-gray-600 mt-2 text-sm line-clamp-3">
//               {description || "No description provided."}
//             </p>

//             {/* Status Badge */}
//             <div className={`inline-flex items-center mt-4 px-3 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
//               {currentStatus.icon}
//               {status}
//             </div>

//             {/* Progress Bar */}
//             <div className="mt-3">
//               <div className="h-2 bg-gray-200 rounded-full">
//                 <div
//                   className={`h-2 rounded-full ${
//                     status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
//                   }`}
//                   style={{ width: `${progress}%` }}
//                 ></div>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">{progress}% completed</p>
//             </div>
//           </div>

//           {/* Controls */}
//           <div className="flex flex-col gap-3 mt-5 pt-3 border-t border-gray-100 z-10">
            
//             {/* NEW: Progress Input Form */}
//             <form onSubmit={handleProgressUpdate} className="flex gap-2 items-center">
//               <input
//                 type="number"
//                 min="0"
//                 max="100"
//                 value={localProgress}
//                 onChange={(e) => setLocalProgress(e.target.value)}
//                 onClick={(e) => e.stopPropagation()}
//                 onMouseDown={(e) => e.stopPropagation()}
//                 className="w-1/3 p-2 border border-gray-300 rounded-md text-sm text-center focus:ring-blue-500"
//                 aria-label="Set progress percentage"
//               />
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition disabled:opacity-50"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <Send className="w-4 h-4" />
//               </button>
//               <span className="text-sm text-gray-600 ml-auto">Update Progress</span>
//             </form>

//             {/* Status Selector */}
//             <div className="flex justify-between items-center">
//               <select
//                 value={status}
//                 onChange={handleStatusChange}
//                 onMouseDown={(e) => e.stopPropagation()}
//                 disabled={loading}
//                 className="p-2 border border-gray-300 rounded-md text-sm bg-gray-50 hover:bg-gray-100 transition"
//               >
//                 {statusOptions.map(opt => (
//                   <option key={opt.label} value={opt.label}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>

//               <div className="flex gap-2">
//                 <Link
//                   to={`/edit/${id}`}
//                   onClick={(e) => e.stopPropagation()}
//                   className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
//                 >
//                   <Edit3 className="w-4 h-4" />
//                 </Link>
//                 <button
//                   onClick={handleDelete}
//                   className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </div>

//         </div>
//       </Link>
//     </motion.div>
//   );
// }

// export default ProjectCard;