import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function EmployerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployerDashboard = async () => {
      setLoading(true);

      // Get logged-in user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      // Get jobs posted by this employer
      const { data: jobsData, error: jobsError } =
        await supabase
          .from("jobs")
          .select("*")
          .eq("employer_id", currentUser.id)
          .order("created_at", {
            ascending: false,
          });

      if (jobsError) {
        console.error(
          "Error loading employer jobs:",
          jobsError
        );
      }

      setJobs(jobsData || []);

      // Get applications for this employer's jobs
      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map((job) => job.id);

        const {
          data: applicationsData,
          error: applicationsError,
        } = await supabase
          .from("applications")
          .select("*")
          .in("job_id", jobIds)
          .order("created_at", {
            ascending: false,
          });

        if (applicationsError) {
          console.error(
            "Error loading applications:",
            applicationsError
          );
        }

        setApplications(
          applicationsData || []
        );
      }

      setLoading(false);
    };

    loadEmployerDashboard();
  }, [navigate]);

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="dashboard-message">
        <h2>Loading employer dashboard...</h2>
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
            onClick={() =>
              navigate("/employer-dashboard")
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/employer/post-job")
            }
          >
            Post a Job
          </button>

          <button
            onClick={() =>
              document
                .getElementById("employer-jobs")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            My Jobs
          </button>

          <button
            onClick={() =>
              document
                .getElementById("employer-applications")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
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

      <main
        className="dashboard-main"
        id="employer-dashboard"
      >

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <h1>
              Welcome back!
            </h1>

            <p>
              Manage your jobs and applicants
              from your employer dashboard.
            </p>

          </div>

          <button
            className="apply-button"
            onClick={() =>
              navigate("/employer/post-job")
            }
          >
            + Post a Job
          </button>

        </div>


        {/* STATS */}

        <div className="dashboard-stats">

          <div className="stat-card">

            <h3>
              {jobs.length}
            </h3>

            <p>
              Jobs Posted
            </p>

          </div>


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
              {
                applications.filter(
                  (application) =>
                    application.status ===
                    "Under Review"
                ).length
              }
            </h3>

            <p>
              Under Review
            </p>

          </div>

        </div>


        {/* MY JOBS */}

        <section
          className="applications-section"
          id="employer-jobs"
        >

          <div className="profile-heading">

            <div>

              <h2>
                My Jobs
              </h2>

              <p>
                Jobs you have posted on
                SkillBridge.
              </p>

            </div>

          </div>


          {jobs.length === 0 ? (

            <div className="no-applications">

              <p>
                You haven't posted any jobs yet.
              </p>

              <button
                onClick={() =>
                  navigate("/employer/post-job")
                }
              >
                Post Your First Job
              </button>

            </div>

          ) : (

            <div className="applications-list">

              {jobs.map((job) => (

                <div
                  className="application-card"
                  key={job.id}
                >

                  <div>

                    <h3>
                      {job.title}
                    </h3>

                    <p>
                      {job.company}
                    </p>

                    <span>
                      📍 {job.location}
                    </span>

                  </div>


                  <div>

                    <p>
                      {
                        applications.filter(
                          (application) =>
                            application.job_id ===
                            job.id
                        ).length
                      }{" "}
                      applicants
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* APPLICATIONS */}

        <section
          className="applications-section"
          id="employer-applications"
        >

          <div className="profile-heading">

            <div>

              <h2>
                Recent Applications
              </h2>

              <p>
                Applicants who applied for
                your jobs.
              </p>

            </div>

          </div>


          {applications.length === 0 ? (

            <div className="no-applications">

              <p>
                You don't have any applications
                yet.
              </p>

            </div>

          ) : (

            <div className="applications-list">

              {applications
                .slice(0, 10)
                .map((application) => (

                  <div
                    className="application-card"
                    key={application.id}
                  >

                    <div>

                      <h3>
                        {application.title ||
                          "Job Application"}
                      </h3>

                      <p>
                        Applicant ID:{" "}
                        {application.user_id}
                      </p>

                      <span>
                        Applied on{" "}
                        {application.created_at
                          ? new Date(
                              application.created_at
                            ).toLocaleDateString()
                          : "Unknown"}
                      </span>

                    </div>


                    <div className="application-status">

                      {application.status ||
                        "Applied"}

                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default EmployerDashboard;