// import { createSlice, createAsyncThunk, configureStore } from '@reduxjs/toolkit';

// const initialState = {
//     isAuthenticated: false,
//     user: null,
//     error: null,
//     loading: false,  // Add the loading state
//     users: []
// };

// // Async thunk to fetch users
// export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
//     const response = await fetch('/users', { method: 'GET' });
//     const data = await response.json();
//     return data;
// });

// // Async thunk to handle login
// export const loggedInUSer = createAsyncThunk('users/loggedInUSer', async ({ email, password, isLoggedIn }, { rejectWithValue }) => {
//     try {
//         const response = await fetch('/users/login', {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ email, password, isLoggedIn })
//         });

//         if (!response.ok) {
//             throw new Error('Invalid credentials');
//         }

//         const data = await response.json();
//         alert("Logged in successfully");
//         return { email, password, isLoggedIn, data };
//     } catch (error) {
//         return rejectWithValue(error.message);
//     }
// });

// // Async thunk to handle logout
// export const loggedOutUser = createAsyncThunk('users/loggedOutUser', async ({ id, isLoggedIn }, { rejectWithValue }) => {
//     try {
//         const response = await fetch('/users/logout', {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ id, isLoggedIn })
//         });

//         if (!response.ok) {
//             throw new Error('Invalid credentials');
//         }

//         const data = await response.json();
//         alert("Logged out successfully");
//         return { id, isLoggedIn, data };  // Fix the return here to include id
//     } catch (error) {
//         return rejectWithValue(error.message);
//     }
// });

// // Creating the auth slice
// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {},
//     extraReducers: (builder) => {
//         // Handle fetchUsers
//         builder
            
//             .addCase(fetchUsers.fulfilled, (state, action) => {
//                 state.loading = false; // Stop loading when users are fetched
//                 state.users = action.payload;
//             })
//             .addCase(fetchUsers.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })

//         // Handle loggedInUser
//         .addCase(loggedInUSer.pending, (state) => {
//             state.loading = true;  // Start loading when logging in
//         })
//         .addCase(loggedInUSer.fulfilled, (state, action) => {
//             state.loading = false;  // Stop loading after login
//             const loggedUser = state.users.find(
//                 (user) => user.email === action.payload.email && user.password === action.payload.password
//             );
//             if (loggedUser) {
//                 state.isAuthenticated = true;
//                 state.user = loggedUser;
//                 state.user.isLoggedIn = true;
//             }
//         })
//         .addCase(loggedInUSer.rejected, (state, action) => {
//             state.loading = false;  
//             state.error = action.payload;
//         })

        
//         .addCase(loggedOutUser.pending, (state) => {
//             state.loading = true; 
//         })
//         .addCase(loggedOutUser.fulfilled, (state, action) => {
//             state.loading = false;  
            
//             state.isAuthenticated = false;
//             const loggedUser = state.users.find(
//                 (user) => user.id === action.payload.id 
//             );
//             if (loggedUser) {
//                 state.user = loggedUser;
//                 state.user.id = action.payload.id;
//                 state.user.isLoggedIn = false;
//             }
//         })
//         .addCase(loggedOutUser.rejected, (state, action) => {
//             state.loading = false;  // Stop loading if logout fails
//             state.error = action.payload;
//         });
//     },
// });

// // Setting up the store with the auth reducer
// const store = configureStore({
//     reducer: {
//         auth: authSlice.reducer,
//     },
// });

// export default store;