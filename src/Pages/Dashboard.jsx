import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Dashboard() {


  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const [profileResult, applicationsResult, savedJobsResult] =
        await Promise.all([
          supabase.from("profiles").select("bio, location, skills").eq("id", currentUser.id).maybeSingle(),
          supabase.from("applications").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
          supabase.from("saved_jobs").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
        ]);

      if (profileResult.error) console.error("Profile load failed:", profileResult.error);
      if (applicationsResult.error) console.error("Applications load failed:", applicationsResult.error);
      if (savedJobsResult.error) console.error("Saved jobs load failed:", savedJobsResult.error);

      setBio(profileResult.data?.bio || "");
      setLocation(profileResult.data?.location || "");
      setSkills(profileResult.data?.skills || "");
      setApplications(applicationsResult.data || []);
      setSavedJobs(savedJobsResult.data || []);
      setLoading(false);
    };

    loadDashboard().catch((error) => {
      console.error("Unable to load dashboard:", error);
      setLoading(false);
    });
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || "",
      email: user.email || "",
      bio,
      location,
      skills,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile updated successfully!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="dashboard-message">
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-message">

        <h2>You are not logged in.</h2>

        <button onClick={() => navigate("/login")}>
          Log In
        </button>

      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          Skill<span>Bridge</span>
        </div>

        <nav>

         

  <button
    className="active"
    onClick={() => {
      document
        .getElementById("dashboard")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }}
  >
    Dashboard
  </button>

  <button
    onClick={() => navigate("/jobs")}
  >
    Find Jobs
  </button>

  <button
    onClick={() => {
      document
        .getElementById("saved-jobs")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }}
  >
    Saved Jobs
  </button>

  <button
    onClick={() => {
      document
        .getElementById("applications")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }}
  >
    Applications
  </button>

</nav>
        

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Log Out
        </button>

      </aside>

      {/* MAIN CONTENT */}

      <main className="dashboard-main" id="dashboard">

        <div className="dashboard-header">

          <div>
            <h1>
              Welcome back, {user.user_metadata?.full_name || user.email}!
            </h1>

            <p>
              Manage your profile and discover new opportunities.
            </p>
          </div>

        </div>

        {/* STATS */}

        <div className="dashboard-stats">

          <div className="stat-card">
           <h3>{applications.length}</h3>
            <p>Applications</p>
          </div>

          <div className="stat-card">
            <h3>0</h3>
            <p>Saved Jobs</p>
          </div>

          <div className="stat-card">
            <h3>0%</h3>
            <p>Profile Complete</p>
          </div>

        </div>

        {/* PROFILE */}

        <section className="profile-section">

          <div className="profile-heading">

            <div>
              <h2>My Profile</h2>

              <p>
                Add information to help employers
                understand your skills.
              </p>
            </div>

          </div>

          <form
            className="profile-form"
            onSubmit={handleSaveProfile}
          >

            <label>Full Name</label>

            <input
              type="text"
              value={user.user_metadata?.full_name || ""}
              disabled
            />

            <label>Email</label>

            <input
              type="email"
              value={user.email || ""}
              disabled
            />

            <label>Location</label>

            <input
              type="text"
              placeholder="e.g. Harare, Zimbabwe"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            />

            <label>Professional Bio</label>

            <textarea
              placeholder="Tell employers about yourself..."
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
            />

            <label>Skills</label>

            <input
              type="text"
              placeholder="e.g. React, Python, Figma"
              value={skills}
              onChange={(e) =>
                setSkills(e.target.value)
              }
            />

            <button
              type="submit"
              className="save-profile-button"
            >
              Save Profile
            </button>

          </form>

        </section>

        <section className="applications-section"id="applications" >

  <div className="profile-heading">
    <h2>My Applications</h2>

    <p>
      Track the jobs you have applied for.
    </p>
  </div>

  {applications.length === 0 ? (
    <div className="no-applications">

      <p>
        You haven't applied for any jobs yet.
      </p>

      <button
        onClick={() => navigate("/jobs")}
      >
        Find Jobs
      </button>

    </div>
  ) : (
    <div className="applications-list">

      {applications.map((application, index) => (

        <div
          className="application-card"
          key={index}
        >

          <div>
            <h3>
              {application.title}
            </h3>

            <p>
              {application.company}
            </p>

            <span>
              📍 {application.location}
            </span>
          </div>

          <div className="application-status">
            {application.status}
          </div>

        </div>

      ))}

    </div>
  )}

</section>

  <section className="saved-jobs-section" id="saved-jobs">

  <div className="profile-heading">

    <h2>Saved Jobs</h2>

    <p>
      Jobs you've saved for later.
    </p>

  </div>

  {savedJobs.length === 0 ? (
    <div className="no-saved-jobs">

      <p>
        You haven't saved any jobs yet.
      </p>

      <button
        onClick={() => navigate("/jobs")}
      >
        Browse Jobs
      </button>

    </div>
  ) : (

    <div className="saved-jobs-list">

      {savedJobs.map((savedJob) => (

        <div
          className="saved-job-card"
          key={savedJob.id}
        >

          <div>

            <h3>
              {savedJob.title}
            </h3>

            <p>
              {savedJob.company}
            </p>

            <span>
              📍 {savedJob.location}
            </span>

          </div>

          <button
            onClick={() =>
              navigate(`/jobs/${savedJob.id}`)
            }
          >
            View Job
          </button>

        </div>

      ))}

    </div>

  )}

</section>
      </main>

    </div>
  );
}

export default Dashboard;