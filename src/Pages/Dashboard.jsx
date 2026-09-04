import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaMapMarkerAlt } from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      // Get logged-in user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
         navigate("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile role load failed:", profileError);
      }

      const userRole =
        profileData?.role ||
        currentUser.user_metadata?.role ||
        "job_seeker";

      if (userRole !== "job_seeker") {
        navigate("/employer-dashboard");
        return;
      }

      setUser(currentUser);

      // Load profile, applications and saved jobs
      const [
        profileResult,
        applicationsResult,
        savedJobsResult,
        jobsResult,
      ] = await Promise.all([
        // PROFILE
        supabase
          .from("profiles")
          .select("full_name, bio, location, skills")
          .eq("id", currentUser.id)
          .maybeSingle(),

        // APPLICATIONS + JOB INFORMATION
        supabase
          .from("applications")
          .select(`
            id,
            user_id,
            job_id,
            phone,
            cv,
            cover_letter,
            status,
            created_at,
            jobs (
              id,
              title,
              company,
              location,
              type,
              salary
            )
          `)
          .eq("user_id", currentUser.id)
          .order("created_at", {
            ascending: false,
          }),

        // SAVED JOBS + JOB INFORMATION
        supabase
          .from("saved_jobs")
          .select(`
            id,
            user_id,
            job_id,
            created_at,
            jobs (
              id,
              title,
              company,
              location,
              type,
              salary
            )
          `)
          .eq("user_id", currentUser.id)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("jobs")
          .select("id, title, company, location, type, salary, description, requirements")
          .order("created_at", {
            ascending: false,
          }),
      ]);

      // Errors
      if (profileResult.error) {
        console.error(
          "Profile load failed:",
          profileResult.error
        );
      }

      if (applicationsResult.error) {
        console.error(
          "Applications load failed:",
          applicationsResult.error
        );
      }

      if (savedJobsResult.error) {
        console.error(
          "Saved jobs load failed:",
          savedJobsResult.error
        );
      }

      if (jobsResult.error) {
        console.error(
          "Jobs load failed:",
          jobsResult.error
        );
      }

      // Profile
      setFullName(
        profileResult.data?.full_name ||
          currentUser.user_metadata?.full_name ||
          ""
      );
      setBio(profileResult.data?.bio || "");
      setLocation(profileResult.data?.location || "");
      setSkills(profileResult.data?.skills || "");

      // Applications
      setApplications(
        applicationsResult.data || []
      );

      // Saved jobs
      setSavedJobs(
        savedJobsResult.data || []
      );
      setJobs(jobsResult.data || []);

      setLoading(false);
    };

    loadDashboard().catch((error) => {
      console.error(
        "Unable to load dashboard:",
        error
      );

      setLoading(false);
    });
  }, [navigate]);

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!user) {
      alert(
        "Your session has expired. Please log in again."
      );

      navigate("/login");
      return;
    }

    const cleanName = fullName.trim();

    if (!cleanName) {
      alert("Please enter your full name.");
      return;
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: cleanName },
    });

    if (authError) {
      alert(authError.message);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: cleanName,
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


  const handleRemoveSavedJob = async (savedJobId) => {
  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("id", savedJobId);

  if (error) {
    console.error(
      "Error removing saved job:",
      error
    );

    alert(error.message);
    return;
  }

  // Remove it immediately from the screen
  setSavedJobs((currentJobs) =>
    currentJobs.filter(
      (job) => job.id !== savedJobId
    )
  );

  alert("Job removed from saved jobs.");
};

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Loading
  if (loading) {
    return (
      <div className="dashboard-message">
        <h2>
          Loading your dashboard...
        </h2>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="dashboard-message">

        <h2>
          You are not logged in.
        </h2>

        <button
          onClick={() =>
            navigate("/login")
          }
        >
          Log In
        </button>

      </div>
    );
  }

  const recommendedJobs = getRecommendedJobs(jobs, skills, applications);

  return (
    <div className="dashboard">

      {/* =========================
          SIDEBAR
      ========================== */}

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
            onClick={() =>
              navigate("/jobs")
            }
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


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <main
        className="dashboard-main"
        id="dashboard"
      >

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <h1>
              Welcome back,{" "}
              {fullName ||
                user.email}
              !
            </h1>

            <p>
              Manage your profile and
              discover new opportunities.
            </p>

          </div>

        </div>


        {/* =========================
            STATS
        ========================== */}

        <div className="dashboard-stats">

          <div className="stat-card">

            <h3>
              {applications.length}
            </h3>

            <p>
              Applications
            </p>

          </div>


          <div className="stat-card">

            <h3>
              {savedJobs.length}
            </h3>

            <p>
              Saved Jobs
            </p>

          </div>


          <div className="stat-card">

            <h3>
              {calculateProfileCompletion(
                user,
                bio,
                location,
                skills
              )}
              %
            </h3>

            <p>
              Profile Complete
            </p>

          </div>

        </div>


        {/* =========================
            PROFILE
        ========================== */}

        <section className="profile-section">

          <div className="profile-heading">

            <div>

              <h2>
                My Profile
              </h2>

              <p>
                Add information to help
                employers understand your
                skills.
              </p>

            </div>

          </div>


          <form
            className="profile-form"
            onSubmit={handleSaveProfile}
          >

            <label>
              Full Name
            </label>

            <input
              type="text"
              value={
                fullName
              }
              onChange={(e) =>
                setFullName(e.target.value)
              }
            />


            <label>
              Email
            </label>

            <input
              type="email"
              value={
                user.email || ""
              }
              disabled
            />


            <label>
              Location
            </label>

            <input
              type="text"
              placeholder="e.g. Harare, Zimbabwe"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            />


            <label>
              Professional Bio
            </label>

            <textarea
              placeholder="Tell employers about yourself..."
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
            />


            <label>
              Skills
            </label>

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

        <section className="applications-section recommendations-section">
          <div className="profile-heading">
            <div>
              <h2>Recommended Jobs</h2>
              <p>Opportunities selected from your profile skills.</p>
            </div>
          </div>

          {recommendedJobs.length === 0 ? (
            <div className="no-applications">
              <p>Add skills to your profile to get job recommendations.</p>
            </div>
          ) : (
            <div className="recommendations-list">
              {recommendedJobs.map((job) => (
                <div className="recommendation-card" key={job.id}>
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                    <span>{job.location || "Location not provided"}</span>
                  </div>

                  <div className="recommendation-actions">
                    <strong>{job.matchScore}% match</strong>
                    <button
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>


        {/* =========================
            APPLICATIONS
        ========================== */}

        <section
          className="applications-section"
          id="applications"
        >

          <div className="profile-heading">

            <h2>
              My Applications
            </h2>

            <p>
              Track the jobs you have applied
              for.
            </p>

          </div>


          {applications.length === 0 ? (

            <div className="no-applications">

              <p>
                You haven't applied for any
                jobs yet.
              </p>

              <button
                onClick={() =>
                  navigate("/jobs")
                }
              >
                Find Jobs
              </button>

            </div>

          ) : (

            <div className="applications-list">

              {applications.map(
                (application) => {

                  const job =
                    application.jobs;
                  const applicationStatus = String(
                    application.status || "applied"
                  );

                  return (

                    <div
                      className="application-card"
                      key={application.id}
                    >

                      <div>

                        <h3>
                          {job?.title ||
                            "Job"}
                        </h3>

                        <p>
                          {job?.company ||
                            "Company"}
                        </p>

                        <span>
                          <FaMapMarkerAlt aria-hidden="true" />{" "}
                          {job?.location ||
                            "Location not provided"}
                        </span>

                      </div>


                      <div
                        className={`application-status ${applicationStatus
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {application.status || "Applied"}
                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>


        {/* =========================
            SAVED JOBS
        ========================== */}

        <section
          className="saved-jobs-section"
          id="saved-jobs"
        >

          <div className="profile-heading">

            <h2>
              Saved Jobs
            </h2>

            <p>
              Jobs you've saved for later.
            </p>

          </div>


          {savedJobs.length === 0 ? (

            <div className="no-saved-jobs">

              <p>
                You haven't saved any
                jobs yet.
              </p>

              <button
                onClick={() =>
                  navigate("/jobs")
                }
              >
                Browse Jobs
              </button>

            </div>

          ) : (

            <div className="saved-jobs-list">

              {savedJobs.map(
                (savedJob) => {

                  const job =
                    savedJob.jobs;

                  return (

                    <div
                      className="saved-job-card"
                      key={savedJob.id}
                    >

                      <div>

                        <h3>
                          {job?.title ||
                            "Job"}
                        </h3>

                        <p>
                          {job?.company ||
                            "Company"}
                        </p>

                        <span>
                          <FaMapMarkerAlt aria-hidden="true" />{" "}
                          {job?.location ||
                            "Location not provided"}
                        </span>

                      </div>


                      <button
                        onClick={() =>
                          navigate(
                            `/jobs/${job?.id}`
                          )
                        }
                      >
                        View Job
                      </button>

                      <button
                        className="remove-saved-button"
                        onClick={() =>
                          handleRemoveSavedJob(savedJob.id)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

function getRecommendedJobs(jobs, skills, applications) {
  const appliedJobIds = new Set(
    applications.map((application) => application.job_id)
  );
  const profileSkills = skills
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);

  if (profileSkills.length === 0) {
    return [];
  }

  return jobs
    .filter((job) => !appliedJobIds.has(job.id))
    .map((job) => {
      const requirements = Array.isArray(job.requirements)
        ? job.requirements.join(" ")
        : job.requirements || "";
      const searchableText = `${job.title} ${job.description} ${requirements}`.toLowerCase();
      const matchedSkills = profileSkills.filter((skill) =>
        searchableText.includes(skill)
      );

      return {
        ...job,
        matchScore: Math.round(
          (matchedSkills.length / profileSkills.length) * 100
        ),
      };
    })
    .filter((job) => job.matchScore > 0)
    .sort((firstJob, secondJob) => secondJob.matchScore - firstJob.matchScore)
    .slice(0, 3);
}


/* =========================
   PROFILE COMPLETION
========================= */

function calculateProfileCompletion(
  user,
  bio,
  location,
  skills
) {
  let completed = 0;

  if (
    user?.user_metadata?.full_name
  ) {
    completed++;
  }

  if (user?.email) {
    completed++;
  }

  if (location) {
    completed++;
  }

  if (bio) {
    completed++;
  }

  if (skills) {
    completed++;
  }

  return Math.round(
    (completed / 5) * 100
  );
}

export default Dashboard;