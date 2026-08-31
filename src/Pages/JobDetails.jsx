import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaArrowLeft, FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJobAndSavedStatus = async () => {
      setLoading(true);

      // Get logged-in user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      // Get job
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (jobError) {
        console.error(
          "Error fetching job:",
          jobError
        );

        setLoading(false);
        return;
      }

      setJob(jobData);

      // Check whether this job is already saved
      if (currentUser) {
        const { data: savedJob, error: savedError } =
          await supabase
            .from("saved_jobs")
            .select("id")
            .eq("user_id", currentUser.id)
            .eq("job_id", id)
            .maybeSingle();

        if (savedError) {
          console.error(
            "Error checking saved job:",
            savedError
          );
        }

        setIsSaved(!!savedJob);
      }

      setLoading(false);
    };

    fetchJobAndSavedStatus();
  }, [id]);

  // =========================
  // SAVE / REMOVE JOB
  // =========================

  const handleSaveJob = async () => {
    // User isn't logged in
    if (!user) {
      alert("Please log in to save jobs.");
      navigate("/login");
      return;
    }

    setSaving(true);

    // If already saved → remove it
    if (isSaved) {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", user.id)
        .eq("job_id", id);

      if (error) {
        console.error(
          "Error removing saved job:",
          error
        );

        alert(error.message);
        setSaving(false);
        return;
      }

      setIsSaved(false);
      setSaving(false);

      alert("Job removed from saved jobs.");

      return;
    }

    // Otherwise → save the job
    const { error } = await supabase
      .from("saved_jobs")
      .insert({
        user_id: user.id,
        job_id: id,
      });

    if (error) {
      console.error(
        "Error saving job:",
        error
      );

      // Duplicate save
      if (error.code === "23505") {
        setIsSaved(true);
        alert("This job is already saved.");
      } else {
        alert(error.message);
      }

      setSaving(false);
      return;
    }

    setIsSaved(true);
    setSaving(false);

    alert("Job saved successfully!");
  };

  // =========================
  // APPLY
  // =========================

  const handleApply = () => {
    if (!user) {
      alert("Please log in to apply for jobs.");
      navigate("/login");
      return;
    }

    navigate(`/jobs/${id}/apply`);
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading job...</h2>
      </div>
    );
  }

  // =========================
  // JOB NOT FOUND
  // =========================

  if (!job) {
    return (
      <div className="no-jobs">
        <h2>Job not found</h2>

        <p>
          The job you are looking for does not exist.
        </p>

        <button
          className="view-job-button"
          onClick={() => navigate("/jobs")}
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="job-details-page">

      {/* BACK BUTTON */}

      <button
        className="back-button"
        onClick={() => navigate("/jobs")}
      >
        <FaArrowLeft aria-hidden="true" /> Back to Jobs
      </button>

      <div className="job-details">

        {/* MAIN JOB INFORMATION */}

        <main className="job-details-main">

          <div className="details-header">

            <div className="details-logo">
              {job.company?.charAt(0)?.toUpperCase() ||
                "J"}
            </div>

            <div>

              <h1>
                {job.title}
              </h1>

              <p>
                {job.company}
              </p>

              <div className="details-info">

                {job.location && (
                  <span>
                    <FaMapMarkerAlt aria-hidden="true" /> {job.location}
                  </span>
                )}

                {job.type && (
                  <span>
                    <FaBriefcase aria-hidden="true" /> {job.type}
                  </span>
                )}

                {job.salary && (
                  <span>
                    <FaMoneyBillWave aria-hidden="true" /> {job.salary}
                  </span>
                )}

              </div>

            </div>

          </div>

          <hr />

          {/* DESCRIPTION */}

          <section>

            <h2>
              About the Job
            </h2>

            <p>
              {job.description ||
                "No job description provided."}
            </p>

          </section>

          {/* RESPONSIBILITIES */}

          <section>

            <h2>
              Responsibilities
            </h2>

            {Array.isArray(job.responsibilities) &&
            job.responsibilities.length > 0 ? (

              <ul>
                {job.responsibilities.map(
                  (responsibility, index) => (
                    <li key={index}>
                      {responsibility}
                    </li>
                  )
                )}
              </ul>

            ) : (

              <p>
                No responsibilities provided.
              </p>

            )}

          </section>

          {/* REQUIREMENTS */}

          <section>

            <h2>
              Requirements
            </h2>

            {Array.isArray(job.requirements) &&
            job.requirements.length > 0 ? (

              <ul>
                {job.requirements.map(
                  (requirement, index) => (
                    <li key={index}>
                      {requirement}
                    </li>
                  )
                )}
              </ul>

            ) : (

              <p>
                No requirements provided.
              </p>

            )}

          </section>

        </main>

        {/* APPLY / SAVE CARD */}

        <aside className="apply-card">

          <h2>
            Interested in this job?
          </h2>

          <p>
            Apply for this opportunity and
            take the next step in your career.
          </p>

          {/* APPLY */}

          <button
            className="apply-button"
            onClick={handleApply}
          >
            Apply Now
          </button>

          {/* SAVE */}

          <button
            className="save-details-button"
            onClick={handleSaveJob}
            disabled={saving}
          >
            {saving
              ? "Please wait..."
              : isSaved
              ? "✓ Saved — Remove"
              : "Save Job"}
          </button>

        </aside>

      </div>

    </div>
  );
}

export default JobDetails;