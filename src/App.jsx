import { BrowserRouter, Routes, Route } from "react-router-dom";

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
      <Navbar />
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/jobs" element={<Jobs />} />

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
    </BrowserRouter>
  );
}

export default App;