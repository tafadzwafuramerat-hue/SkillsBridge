import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaArrowLeft, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";

function EmployerApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const statusOptions = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Accepted",
    "Rejected",
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);

    try {
      // Get logged-in employer
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please log in first.");
        navigate("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || profile?.role !== "employer") {
        alert("Only employers can view applications.");
        navigate("/dashboard");
        return;
      }

      // Get jobs belonging to this employer
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, company")
        .eq("employer_id", user.id);

      if (jobsError) {
        console.error("Jobs error:", jobsError);
        alert(`Could not load your jobs: ${jobsError.message}`);
        return;
      }

      // Employer has no jobs
      if (!jobs || jobs.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const jobIds = jobs.map((job) => job.id);

      // Get applications for those jobs
      const { data: applicationData, error: applicationsError } =
        await supabase
          .from("applications")
          .select("*")
          .in("job_id", jobIds)
          .order("id", { ascending: false });

      if (applicationsError) {
        console.error("Applications error:", applicationsError);
        alert(
          `Could not load applications: ${applicationsError.message}`
        );
        return;
      }

      // Get applicant profiles
      const userIds = [
        ...new Set(
          (applicationData || [])
            .map((application) => application.user_id)
            .filter(Boolean)
        ),
      ];

      let profiles = [];

      if (userIds.length > 0) {
        const { data: profileData, error: profilesError } =
          await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", userIds);

        if (profilesError) {
          console.error("Profiles error:", profilesError);
        } else {
          profiles = profileData || [];
        }
      }

      // Combine applications + job + applicant information
      const formattedApplications = (applicationData || []).map(
        (application) => {
          const job = jobs.find(
            (jobItem) => jobItem.id === application.job_id
          );

          const profile = profiles.find(
            (profileItem) => profileItem.id === application.user_id
          );

          return {
            ...application,
            jobTitle: job?.title || "Unknown Job",
            company: job?.company || "",
            applicantName:
              profile?.full_name || "Unknown Applicant",
            applicantEmail: profile?.email || "",
          };
        }
      );

      setApplications(formattedApplications);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Something went wrong while loading applications.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);

    const { error } = await supabase
      .from("applications")
      .update({
        status: newStatus,
      })
      .eq("id", applicationId);

    if (error) {
      console.error("Status update error:", error);
      alert(`Could not update status: ${error.message}`);
      setUpdatingId(null);
      return;
    }

    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              status: newStatus,
            }
          : application
      )
    );

    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading applications...</h2>
      </div>
    );
  }

  return (
    <div className="job-details-page employer-applications-page">
      <button
        className="back-button"
        onClick={() => navigate("/employer-dashboard")}
      >
        <FaArrowLeft aria-hidden="true" /> Back to Dashboard
      </button>

      <div className="job-details employer-applications-layout">
        <main className="job-details-main employer-applications-main">
          <div className="details-header">
            <div className="details-logo">
              <FaBriefcase aria-hidden="true" />
            </div>

            <div>
              <h1>Applications</h1>
              <p>Review and manage candidates for your jobs.</p>
              <div className="details-info">
                <span>
                  <FaMapMarkerAlt aria-hidden="true" /> SkillBridge employer portal
                </span>
              </div>
            </div>
          </div>

          <hr />

        {applications.length === 0 ? (
          <div className="no-applications employer-empty-state">

            <h2>No applications yet</h2>

            <p>
              When candidates apply for your jobs, their
              applications will appear here.
            </p>

            <button
              className="post-job-button"
              onClick={() => navigate("/employer/post-job")}
            >
              Post a Job
            </button>
          </div>
        ) : (
          <div className="employer-application-list">
            {applications.map((application) => (
              <div
                className="employer-application-detail"
                key={application.id}
              >
                <div className="application-detail-header">
                  <div className="applicant-info">
                    <div className="applicant-avatar">
                      {application.applicantName
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}
                    </div>

                    <div>
                      <h2>{application.applicantName}</h2>
                      <p>{application.applicantEmail || "No email available"}</p>
                    </div>
                  </div>

                  <div className="application-job">
                    <span>Applied for</span>
                    <strong>{application.jobTitle}</strong>
                    {application.company && (
                      <small>{application.company}</small>
                    )}
                  </div>
                </div>

                <div className="application-detail-grid">

                  <div className="application-detail">
                    <span>Phone</span>
                    <strong>{application.phone || "Not provided"}</strong>
                  </div>

                  <div className="application-detail">
                    <span>Status</span>

                    <select
                      value={
                        application.status || "Applied"
                      }
                      disabled={
                        updatingId === application.id
                      }
                      onChange={(e) =>
                        updateStatus(
                          application.id,
                          e.target.value
                        )
                      }
                    >
                      {statusOptions.map((status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="application-content application-detail-content">

                  <div>
                    <h3>Cover Letter</h3>

                    <p>{application.cover_letter || "No cover letter provided."}</p>
                  </div>

                  <div>
                    <h3>CV / Resume</h3>

                    {application.cv ? (
                      <a
                        href={application.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-cv-button"
                      >
                        View CV / Resume
                      </a>
                    ) : (
                      <p>No CV provided.</p>
                    )}

                    {application.cv_text && (
                      <div className="tailored-cv-preview">
                        <h3>Tailored CV</h3>
                        <p>{application.cv_text}</p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
        </main>

        <aside className="apply-card employer-applications-summary">
          <h2>Candidate review</h2>
          <p>Keep applications moving through your hiring process.</p>

          <div className="application-summary-stat">
            <strong>{applications.length}</strong>
            <span>Total applications</span>
          </div>

          <div className="application-summary-stat">
            <strong>
              {applications.filter(
                (application) => application.status === "Under Review"
              ).length}
            </strong>
            <span>Under review</span>
          </div>

          <button
            className="save-details-button"
            onClick={() => navigate("/employer-dashboard")}
          >
            Back to Dashboard
          </button>
        </aside>
      </div>
    </div>
  );
}

export default EmployerApplications;