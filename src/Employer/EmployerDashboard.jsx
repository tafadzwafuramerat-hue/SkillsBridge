import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function EmployerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingJobId, setDeletingJobId] = useState(null);

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

      // Get employer profile
      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "Employer role load failed:",
          profileError
        );
      }

      const userRole =
        profileData?.role ||
        currentUser.user_metadata?.role ||
        "job_seeker";

      // Make sure this is an employer
      if (userRole !== "employer") {
        navigate("/dashboard");
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
          (applicationsData || []).map((application) => ({
            ...application,
            job: jobsData.find(
              (job) => job.id === application.job_id
            ),
          }))
        );
      } else {
        setApplications([]);
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

  // Delete job
  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeletingJobId(jobId);

    // Delete applications belonging to this job first
    const { error: applicationsError } = await supabase
      .from("applications")
      .delete()
      .eq("job_id", jobId);

    if (applicationsError) {
      console.error(
        "Error deleting job applications:",
        applicationsError
      );

      alert(
        `Could not delete the job applications: ${applicationsError.message}`
      );

      setDeletingJobId(null);
      return;
    }

    // Delete the job
    const { error: jobError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId)
      .eq("employer_id", user.id);

    if (jobError) {
      console.error(
        "Error deleting job:",
        jobError
      );

      alert(
        `Could not delete the job: ${jobError.message}`
      );

      setDeletingJobId(null);
      return;
    }

    // Remove job from UI
    setJobs((currentJobs) =>
      currentJobs.filter((job) => job.id !== jobId)
    );

    // Remove applications from UI
    setApplications((currentApplications) =>
      currentApplications.filter(
        (application) => application.job_id !== jobId
      )
    );

    setDeletingJobId(null);

    alert("Job deleted successfully.");
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
            onClick={() => navigate("/employer/applications")}
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
              Welcome back
              {user?.user_metadata?.full_name
                ? `, ${user.user_metadata.full_name}`
                : "!"}
            </h1>

            <p>
              Manage your jobs and applicants
              from your employer dashboard.
            </p>

          </div>

        </div>

        {/* STATS */}
        <div className="dashboard-stats">

          <div className="stat-card">
            <h3>{jobs.length}</h3>
            <p>Jobs Posted</p>
          </div>

          <div className="stat-card">
            <h3>{applications.length}</h3>
            <p>Applications</p>
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

            <p>Under Review</p>

          </div>

        </div>

        {/* MY JOBS */}
        <section
          className="applications-section"
          id="employer-jobs"
        >

          <div className="profile-heading">

            <div>

              <h2>My Jobs</h2>

              <p>
                Jobs you have posted on
                SkillBridge.
              </p>

            </div>

            <button
              className="post-job-button"
              onClick={() =>
                navigate("/employer/post-job")
              }
            >
              Post a Job
            </button>

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

              {jobs.map((job) => {

                const jobApplications =
                  applications.filter(
                    (application) =>
                      application.job_id === job.id
                  );

                return (

                  <div
                    className="application-card employer-job-card"
                    key={job.id}
                  >

                    <div className="employer-job-info">

                      <h3>
                        {job.title}
                      </h3>

                      <p>
                        {job.company}
                      </p>

                      <span>
                        📍 {job.location}
                      </span>

                      {job.type && (
                        <span>
                          💼 {job.type}
                        </span>
                      )}

                      {job.salary && (
                        <span>
                          💰 {job.salary}
                        </span>
                      )}

                    </div>

                    <div className="employer-job-actions">

                      <p className="applicant-count">
                        {jobApplications.length}{" "}
                        {jobApplications.length === 1
                          ? "applicant"
                          : "applicants"}
                      </p>

                      <div className="job-action-buttons">

                        {/* VIEW */}
                        <button
                          className="view-job-button"
                          onClick={() =>
                            navigate(`/jobs/${job.id}`)
                          }
                        >
                          View Job
                        </button>

                        {/* EDIT */}
                        <button
                          className="edit-job-button"
                          onClick={() =>
                            navigate(
                              `/employer/edit-job/${job.id}`
                            )
                          }
                        >
                          Edit
                        </button>

                        {/* DELETE */}
                        <button
                          className="delete-job-button"
                          onClick={() =>
                            handleDeleteJob(job.id)
                          }
                          disabled={
                            deletingJobId === job.id
                          }
                        >
                          {deletingJobId === job.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  </div>

                );
              })}

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

              <h2>Recent Applications</h2>

              <p>
                Applicants who applied for
                your jobs.
              </p>

            </div>

          </div>

          {applications.length === 0 ? (

            <div className="no-applications">

              <p>
                You don't have any applicants
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
                        {application.job?.title ||
                          "Job Application"}
                      </h3>

                      <p>
                        {application.job?.company ||
                          "Your job listing"}
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