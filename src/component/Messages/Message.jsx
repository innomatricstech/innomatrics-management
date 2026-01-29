import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { delEmpMessage, fetchEmplMail, fetchUsers } from '../Reducers/authSlice';

const Message = () => {
    const { emailList,user,users } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [bgColor, setBgColor] = useState('bg-red-500');
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchData = () => {
            dispatch(fetchEmplMail());
            dispatch(fetchUsers());
        };
        const intervalId = setInterval(() => {
            setBgColor(prevColor => prevColor === 'bg-red-500' ? 'bg-green-500' : 'bg-red-500');
            fetchData();
        }, 3000); 

        
        return () => clearInterval(intervalId);
    }, [dispatch]);

    const handleDelete = (id)=>{
        dispatch(delEmpMessage(id))
        emailList.filter((email) => email.id !== id);
        window.location.reload();
    }
    return (
        <div className="container mx-auto p-4">
            {/* Header with navigation */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Inbox</h1>
                <Link to="/sendMail" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md">
                    Send Mail
                </Link>
            
                <Link to="/user" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md">
                    Home
                </Link>
            </div>

            {/* Emails List */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 text-left text-gray-600">Sender</th>
                            <th className="py-2 px-4 text-left text-gray-600">Receiver</th>
                            <th className="py-2 px-4 text-left text-gray-600">Message</th>
                            <th className="py-2 px-4 text-left text-gray-600">Date</th>
                            <th className="py-2 px-4 text-left text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
  {emailList
    .filter((email) => user.username === email.receiver_username).map((email, index) => (
      <tr
        key={index}
        className={`hover:bg-gray-50 border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
      >
        <td className="py-3 px-4 font-medium text-gray-700">
         ADMIN
        </td>

        <td className="py-3 px-4 text-gray-600">{email.receiver_username}</td>

        <td className="py-3 px-4 text-gray-500 truncate">
          {email.messages[0]}
        </td>
        <td>
  {
    (() => {
      const date = new Date(email.createdAt);
      const options = {
        timeZone: 'Asia/Kolkata', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
      };
      return date.toLocaleDateString('en-US', options) ;
    })()
  }
</td>

        <td onClick={() => handleDelete(email._id)} className="cursor-pointer py-3 px-4 text-gray-600">
            Delete Message
        </td>
      </tr>
    ))}
</tbody>

                </table>
            </div>
        </div>
    );
};

export default Message;
