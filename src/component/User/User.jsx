import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  Email as EmailIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const User = () => {
  const [user, setUser] = useState(null);
  const [workMode, setWorkMode] = useState("");
  const [assignedProject, setAssignedProject] = useState(null);
  const navigate = useNavigate();

  // 🔹 Load Firebase user on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      // Create or fetch Firestore user document
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Automatically create the document if not exists
        await setDoc(userRef, {
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          empId: `EMP-${Math.floor(Math.random() * 10000)}`,
          department: "Not Assigned",
          isPresent: "Not Set",
          createdAt: new Date(),
        });
      }

      // Fetch user data
      const updatedUser = (await getDoc(userRef)).data();
      setUser({ id: firebaseUser.uid, ...updatedUser });
    });

    return () => unsubscribe();
  }, [navigate]);

  // 🔹 Fetch assigned project for user
  useEffect(() => {
    const fetchAssignedProject = async () => {
      if (!user) return;

      const q = query(
        collection(db, "projects"),
        where("assignedTo", "==", user.username)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const projectData = querySnapshot.docs[0].data();
        setAssignedProject(projectData);
      } else {
        setAssignedProject(null);
      }
    };

    fetchAssignedProject();
  }, [user]);

  // 🔹 Handle logout
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  // 🔹 Update work mode (auto creates document if missing)
  const handleSubmission = async (e) => {
    e.preventDefault();
    if (!user) return;

    const userRef = doc(db, "users", user.id);

    await setDoc(
      userRef,
      {
        ...user,
        isPresent: workMode,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    alert("✅ Work Mode Updated!");
    setUser((prev) => ({ ...prev, isPresent: workMode }));
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading user data...
      </div>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12}>
          <StyledPaper elevation={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="h4" component="h1">
                  Welcome, {user.username}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              Employee ID: {user.empId}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Email: {user.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Department: {user.department}
            </Typography>
          </StyledPaper>
        </Grid>

        {/* Work Mode Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Work Mode
              </Typography>
              <form onSubmit={handleSubmission}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="work-mode-label">Select Work Mode</InputLabel>
                  <Select
                    labelId="work-mode-label"
                    id="workMode"
                    value={workMode}
                    label="Select Work Mode"
                    onChange={(e) => setWorkMode(e.target.value)}
                  >
                    <MenuItem value="" disabled>
                      -- Select an Option --
                    </MenuItem>
                    <MenuItem value="WFO">Working from Office (WFO)</MenuItem>
                    <MenuItem value="WFH">Working from Home (WFH)</MenuItem>
                    <MenuItem value="Leave">Leave</MenuItem>
                    <MenuItem value="Off Duty">Off Duty</MenuItem>
                  </Select>
                </FormControl>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Submit
                </Button>
              </form>
              <Typography variant="body2" color="textSecondary" mt={2}>
                Current Mode: {user.isPresent}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Assigned Project Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assigned Project
              </Typography>
              {assignedProject ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    {assignedProject.projectName}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Status:{" "}
                    {assignedProject.projectStatus ? "Completed" : "Ongoing"}
                  </Typography>
                  <Typography variant="body2">
                    Description: {assignedProject.projectDescription}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1">
                  No assigned project found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <StyledPaper elevation={3}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  component={Link}
                  to="/sendMail"
                  variant="contained"
                  color="primary"
                  startIcon={<EmailIcon />}
                  fullWidth
                >
                  Send Mail
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  component={Link}
                  to="/receiveMail"
                  variant="contained"
                  color="secondary"
                  startIcon={<EmailIcon />}
                  fullWidth
                >
                  Check Mail
                </Button>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default User;
