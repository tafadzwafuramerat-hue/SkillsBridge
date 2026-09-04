import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import Home from "./Pages/Home";
import Jobs from "./Pages/Jobs";
import JobDetails from "./Pages/JobDetails";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import Navbar from "./Components/Navbar";
import Dashboard from "./Pages/Dashboard";
import Apply from "./Pages/Apply";

import EmployerDashboard from "./Employer/EmployerDashboard";
import PostJob from "./Employer/PostJob";
import EditJob from "./Employer/EditJob";
import EmployerApplications from "./Employer/EmployerApplications";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();

  const hideNavbar =
    [
      "/login",
      "/signup",
      "/dashboard",
      "/employer-dashboard",
      "/employer/post-job",
      "/employer/applications",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/employer/edit-job/") ||
    (location.pathname.startsWith("/jobs/") &&
      location.pathname.endsWith("/apply"));

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Authentication */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Job seeker */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute role="job_seeker" redirectTo="/employer-dashboard">
              <Dashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/jobs/:id/apply"
          element={
            <RoleRoute role="job_seeker" redirectTo="/employer-dashboard">
              <Apply />
            </RoleRoute>
          }
        />

        {/* Employer */}
        <Route
          path="/employer-dashboard"
          element={
            <RoleRoute role="employer" redirectTo="/dashboard">
              <EmployerDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/employer/post-job"
          element={
            <RoleRoute role="employer" redirectTo="/dashboard">
              <PostJob />
            </RoleRoute>
          }
        />

        <Route
          path="/employer/edit-job/:id"
          element={
            <RoleRoute role="employer" redirectTo="/dashboard">
              <EditJob />
            </RoleRoute>
          }
        />
        <Route
          path="/employer/applications"
          element={
            <RoleRoute role="employer" redirectTo="/dashboard">
              <EmployerApplications />
            </RoleRoute>
          }
        />
      </Routes>
    </>
  );
}

function RoleRoute({ role, redirectTo, children }) {
  const [state, setState] = useState({ loading: true, destination: null });

  useEffect(() => {
    let active = true;

    const verifyRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) {
          setState({ loading: false, destination: "/login" });
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const userRole = profile?.role || user.user_metadata?.role || "job_seeker";

      if (active) {
        setState({
          loading: false,
          destination: userRole === role ? null : redirectTo,
        });
      }
    };

    verifyRole();

    return () => {
      active = false;
    };
  }, [role]);

  if (state.loading) {
    return <div className="loading"><h2>Checking your account...</h2></div>;
  }

  if (state.destination) {
    return <Navigate to={state.destination} replace />;
  }

  return children;
}

export default App;