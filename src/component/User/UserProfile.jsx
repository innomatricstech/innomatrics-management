import React, { useEffect, useState } from 'react'
import Auth from '../Authentication/Auth';

const UserProfile = ({users, email, initialAuth, password}) => {
    const[userList,setUsers] = useState([])
    const [isAuth, setIsAuth] = useState(initialAuth); 
    const fetchUsers = async () => {
        try {
          const response = await fetch('http://localhost:3000/users', {
            method: 'GET',
          });
    
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
    
          const data = await response.json();
          setUsers(data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };

      
    const handleLogout = (id) => {
        
      const user = users.find((user) => user.email === email && user.password === password);
      if (user) {
          alert(`Goodby ${user.username}
            Your login status is ${user.isLoggedIn}
              Your are now logging out`);
              setIsAuth(true)

          const submitAuth = async () => {
              const loggedUser = {
                  email
              };
              try {
                  const response = await fetch('http://localhost:3000/users/logout', {
                      method: 'PUT',  // Changed from POST to PUT
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(loggedUser),  // Directly pass loggedUser, no need for nested object
                  });
                  if (!response.ok) throw new Error('Failed to update auth');
                  const result = await response.json();
                  alert("Logged out successfully");
                  console.log(result);

              } catch (error) {
                  console.error('Error updating auth:', error);
              }
          };
          submitAuth();

      } else {
          alert('Login Failed');
      }
  };
    
      useEffect(()=>{
        fetchUsers()
      },[users])
    
  return (
    <>
    {
      isAuth===false  ? (
          <Auth/>
      ): (
        <>
        <h1>User Profile Testing</h1>
    {
        users.slice(0,1).map((user,index)=>{
            const verifiedUser = userList.find((user) => user.email === email && user.password === password);
            return(
            <>
            <h3>Welcome {verifiedUser ? verifiedUser.username : ''}</h3>
            <p>{verifiedUser ? verifiedUser.email : ''}</p>
            
            <p>{verifiedUser ? verifiedUser.department : ''}</p>
            <p>{isAuth===true ? 'true' : 'false'}</p>
            <button onClick={()=>handleLogout(verifiedUser._id)}>Logout</button>
            </>
            )
    })
    }
        </>
      )
    }
    


    </>
  )
}

export default UserProfile
