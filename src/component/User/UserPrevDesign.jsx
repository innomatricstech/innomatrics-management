// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import { fetchProjects, fetchUsers, loggedOutUser, updateWorkMode } from '../Reducers/AuthSlice';

// const User = () => {
//   const { user, users, project, projectList } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [workMode, setWorkMode] = useState('');

//   // const handleChange = (e) => {
//   //   setWorkMode(e.target.value);
//   // };
//   const handleLogout = () => {
//     dispatch(loggedOutUser())
//       .unwrap()
//       .then(() => {
//         localStorage.removeItem('token');
//         window.location.reload();
//         navigate('/login');
//       })
//       .catch((err) => console.error(err));
//   };

//   const handleSubmission = (e) => {
//     e.preventDefault();
//     dispatch(updateWorkMode({ id: user._id, isPresent: workMode }))
//       .unwrap()
//       .then((response) => {
//         console.log('Work Mode Updated:', response);
//       })
//       .catch((error) => console.error(error));
//   };
//   useEffect(() => {
//     dispatch(fetchUsers());
//     dispatch(fetchProjects());
//   }, [dispatch]);

//   // Filter projects where the current user is assigned
//   const assignedProject = projectList.find(
//     (project) => project.assignedTo === user.username
//   );

//   return (
//     <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
//       <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg space-y-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-semibold text-gray-700">Welcome, {user.username}</h1>
//           <h1 className="text-2xl font-semibold text-gray-700">Employee ID: {user.empId}</h1>
          

//           <button
//             onClick={handleLogout}
//             className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
//           >
//             Logout
//           </button>
//         </div>

//         <p className="text-gray-600">
//           Email: <span className="text-gray-800">{user.email}</span>
//         </p>
//         <div className="relative inline-block text-left">
//       <label htmlFor="workMode" className="block text-sm font-medium text-gray-700">
//         Select Work Mode
//       </label>
//       <form onSubmit={handleSubmission}>
//             <select
//               id="workMode"
//               value={workMode}
//               onChange={(e) => setWorkMode(e.target.value)}
//               className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
//             >
//               <option value="" disabled>
//                 -- Select an Option --
//               </option>
//               <option value="WFO">Working from Office (WFO)</option>
//               <option value="WFH">Working from Home (WFH)</option>
//               <option value="Leave">Leave</option>
//               <option value="Off Duty">Logging Out</option>
//             </select>
//             <button
//               type="submit"
//               className="mt-3 p-2 bg-blue-500 text-white rounded"
//             >
//               Submit
//             </button>
//           </form>


//       <div className="mt-2">
        
//           <p className="text-sm text-gray-500">
//             Selected Mode: <span className="font-semibold">{user.isPresent}</span>
//           </p>
      
//       </div>
//     </div>

//         {assignedProject ? (
//           <>
//             <p className="text-xl font-semibold text-gray-700">
//               Your currently assigned project: {assignedProject.projectName}
//             </p>
//             <p>
//           Project Status: {!assignedProject.projectStatus ? <span>Ongoing</span> : <span>Completed</span>}
//         </p>
//             <p>
//           Project Descritpion: {assignedProject.projectDescription}
//         </p>
//         </>
//           ) : (
//             <h2 className="text-2xl font-semibold text-gray-700">
//               No assigned project found
//             </h2>
//           )}
//         {/* <p>
//           Project Status: {assignedProject.projectstatus}
//         </p> */}
        
//         <p className="text-gray-600">
//           Department: <span className="text-gray-800">{user.department}</span>
//         </p>

//         <div className="flex justify-between space-x-4 mt-6">
//           <Link
//             to="/sendMail"
//             className="w-full bg-blue-500 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg"
//           >
//             Send Mail
//           </Link>
//           <Link
//             to="/receiveMail"
//             className="w-full bg-green-500 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg"
//           >
//             Check Mail
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default User;