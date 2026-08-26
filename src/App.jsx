import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./Pages/Home";
import Jobs from "./Pages/Jobs";
import JobDetails from "./Pages/JobDetails";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import Navbar from "./Components/Navbar";
import Dashboard from "./Pages/Dashboard";
import Apply from "./Pages/Apply";
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
    ["/login", "/signup", "/dashboard"].includes(location.pathname) ||
    location.pathname.startsWith("/jobs/") &&
    location.pathname.endsWith("/apply");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />
        <Route
          path="/jobs/:id/apply"
           element={<Apply />}
        />
        <Route
    path="/signup"
    element={<Signup />}
  />

  <Route
    path="/login"
    element={<Login />}
  />
   <Route
    path="/dashboard"
    element={<Dashboard />}
  />
  

      </Routes>
    </>
  );
}

export default App;