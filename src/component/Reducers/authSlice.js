import { createSlice, createAsyncThunk, configureStore } from '@reduxjs/toolkit';

// Initial state for authentication
const initialState = {
    user: null, // Stores the logged-in user data
    error: null,
    project:null, // Stores any error messages
    loading: false, // Tracks loading state for async operations
    users: [], // All users fetched from backend
    emailList: [], // All emails fetched from backend
    projectList: [], // All emails fetched from backend
};
const baseUrl = import.meta.env.VITE_BASE_URL;
// Async thunk to fetch users from backend
export const fetchUsers = createAsyncThunk('auth/fetchUsers', async () => {
    const response = await fetch(`https://inno-project-system-server.vercel.app/users`, { method: 'GET' });
    const data = await response.json();
    return data;
});

// Async thunk to handle password updates
export const updatePassword = createAsyncThunk(
    'auth/updatePassword',
    async ({ id, password }, { rejectWithValue }) => {
      try {
        const response = await fetch(`https://inno-project-system-server.vercel.app/users/updatePassword/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }), // Sending the new password in request body
        });
  
        if (!response.ok) {
          // Handle API errors
          const errorData = await response.json();
          return rejectWithValue(errorData.message || 'Failed to update password');
        }
  
        return await response.json(); // Assuming the server returns updated user data
      } catch (error) {
        // Handle network errors
        return rejectWithValue(error.message || 'An error occurred');
      }
    }
  );
  


export const fetchProjects = createAsyncThunk('auth/fetchProjects', async()=>{
    const response = await fetch(` https://inno-project-system-server.vercel.app/projects/fetchProjects`, {method: "GET"});
    const data = await response.json();
    return data;
})

export const fetchEmplMail = createAsyncThunk('auth/fetchMail', async () => {
    const response = await fetch(`https://inno-project-system-server.vercel.app/messages/getEmployeeMessages`, { method: 'GET' });
    const data = await response.json();
    return data;
});

export const updateWorkMode = createAsyncThunk(
    'auth/updateWorkMode',
    async ({ id, isPresent }, { rejectWithValue }) => {
        try {
            const response = await fetch(`https://inno-project-system-server.vercel.app/users/updateWorkMode/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isPresent }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update work mode');
            }

            // Return the updated data so Redux state can be updated
            const data = await response.json();
            alert(`Work mode updated succesfully to ${isPresent}`)
            return data; 
        } catch (error) {
            return rejectWithValue(error.message || 'An error occurred');
        }
    }
);


export const delEmpMessage = createAsyncThunk('auth/delEmpMessage', async (id) => {
   try {
    const response = await fetch(`https://inno-project-system-server.vercel.app/messages/employee/${id}`, {method: 'DELETE'});
    if (!response.ok) {
        throw new Error('Failed to delete email');
    }
    const data = await response.json();
    alert("Email deleted succesfully")
   } catch (error) {
    console.error('Error deleting email:', error);
    // alert('Error deleting email: ' + error.message);
    alert("Deleted somehow")
}
    
});

// Async thunk to handle login functionality
export const loggedInUser = createAsyncThunk(
    'auth/loggedInUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch(`https://inno-project-system-server.vercel.app/users/login`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // Sending email and password in request body
            });

            // Handle errors during login
            if (!response.ok) {
                throw new Error('Invalid credentials'); // Reject if credentials are incorrect
            }

            const data = await response.json(); // Assuming backend returns the user data

            alert(`Logged in successfully, user: ${email}`);

            return data; // Return the user data after successful login
        } catch (error) {
            return rejectWithValue(error.message); // Pass error message to state
        }
    }
);

// Async thunk to handle logout functionality
// export const loggedOutUser = createAsyncThunk(
//     'auth/loggedOutUser',
//     async ({ id }, { rejectWithValue }) => {
//         try {
//             const response = await fetch('/users/logout', {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ id, isLoggedIn: false }), // Passing user ID and setting isLoggedIn to false
//             });

//             if (!response.ok) {
//                 throw new Error('Error logging out');
//             }

//             const data = await response.json(); // Response from server after logging out
//             alert('Logged out successfully');

//             return data; // Return updated user data with isLoggedIn set to false
//         } catch (error) {
//             return rejectWithValue(error.message); // Pass error message to state
//         }
//     }
// );


export const loggedOutUser = createAsyncThunk(
    'auth/loggedOutUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve token from localStorage

            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`https://inno-project-system-server.vercel.app/users/logout`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Send token in Authorization header
                },
            });

            if (!response.ok) {
                throw new Error('Error logging out');
            }

            const data = await response.json(); // Response from server after logging out

            // Remove token from localStorage after logout
            localStorage.removeItem('token');

            alert('Logged out successfully');

            return data; // Return the response after successful logout
        } catch (error) {
            return rejectWithValue(error.message); // Pass error message to state
        }
    }
);


export const checkLoggedIn = createAsyncThunk(
    'users/checkLoggedIn',
    async (_, { rejectWithValue }) => {
      const token = localStorage.getItem('token');
  
      if (!token) {
        return rejectWithValue('No token found');
      }
  
      try {
        const response = await fetch(`https://inno-project-system-server.vercel.app/users/validate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Send token for validation
          },
        });
  
        if (!response.ok) {
          throw new Error('Invalid or expired token');
        }
  
        const data = await response.json();
        return data; // Return user data if token is valid
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  

// Creating the auth slice with reducers for login/logout
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {}, // Place for additional reducer actions if needed
    extraReducers: (builder) => {
        builder
            // Handle fetchUsers
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            .addCase(updatePassword.pending, (state)=>{
                state.loading = true;
            })

            .addCase(updatePassword.fulfilled, (state, action)=>{
                state.loading = false;
                const updatedUser = state.users.find((user) => user.id === action.payload.id);
                if (updatedUser) {
                    updatedUser.password = action.payload.password; // Assuming password is returned (for reference)
                }
            })

            .addCase(updatePassword.rejected, (state, action) => {
                state.loading = false; // Stop loading after failure
                state.error = action.payload; // Store error message
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projectList = action.payload; // Properly updating project list
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Assigning the error in case of rejection
            })

            // Handle fetch employee mail logic
            .addCase(fetchEmplMail.fulfilled, (state, action) => {
                state.loading = false;
                state.emailList = action.payload;
            })
            .addCase(fetchEmplMail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateWorkMode.pending, (state) => {
                state.loading = true;
            })

            .addCase(updateWorkMode.fulfilled, (state, action) => {
                state.loading = false;
                // Assuming the server sends back the updated work mode
                if (state.user) {
                    state.user.isPresent = action.payload.isPresent; // Update the work mode in state
                }
            })
            

            .addCase(delEmpMessage.fulfilled, (state, action) => {
                state.loading = false;
                state.emailList = action.payload;
            })
            .addCase(delEmpMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Handle login logic
            .addCase(loggedInUser.pending, (state) => {
                state.loading = true; // Set loading to true when logging in
            })
            .addCase(loggedInUser.fulfilled, (state, action) => {
                state.loading = false; // Stop loading after login

                const loggedUser = action.payload.user; // Backend returns full user object
                const UserProject = action.payload.project;
                if (loggedUser) {
                    state.user = loggedUser;
                    state.project = UserProject;
                    state.user.isLoggedIn = true; // Set user as logged in
                }
            })
            .addCase(loggedInUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Store error message in case of failure
            })


                //JWT validation

                .addCase(checkLoggedIn.fulfilled, (state, action) => {
                    state.user = action.payload.user; // Update the user state with verified data
                    state.user.isLoggedIn = true; // Set logged-in status to true
                  })
                  .addCase(checkLoggedIn.rejected, (state, action) => {
                    state.user = null; // Reset user state if token is invalid
                    state.error = action.payload;
                  })


            // Handle logout logic
            .addCase(loggedOutUser.pending, (state) => {
                state.loading = true; // Set loading to true during logout
            })
            .addCase(loggedOutUser.fulfilled, (state, action) => {
                state.loading = false; // Stop loading after logout

                const loggedUser = state.users.find(
                    (user) => user.id === action.payload.id
                );

                if (loggedUser) {
                    state.user = loggedUser;
                    state.user.isLoggedIn = false; // Set isLoggedIn to false after successful logout
                }
            })
            .addCase(loggedOutUser.rejected, (state, action) => {
                state.loading = false; // Stop loading after failure
                state.error = action.payload; // Store error message in case of failure
            });
    },
});

// Setting up the store with the auth reducer
const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
    },
});

export default store;
