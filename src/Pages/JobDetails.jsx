import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch job
  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching job:", error);
        setLoading(false);
        return;
      }

      setJob(data);
      setLoading(false);
    };

    fetchJob();
  }, [id]);

  // Check whether the job is already saved
  useEffect(() => {
    const checkSavedJob = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_id", id)
        .maybeSingle();

      if (error) {
        console.error(
          "Error checking saved job:",
          error
        );
        return;
      }

      if (data) {
        setIsSaved(true);
      }
    };

    checkSavedJob();
  }, [id]);

  // Save job
  const handleSaveJob = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // User is not logged in
    if (!user) {
      alert("Please log in to save jobs.");
      navigate("/login");
      return;
    }

    // Prevent duplicate saves
    if (isSaved) {
      alert("You have already saved this job.");
      return;
    }

    setSaving(true);

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

      alert(error.message);
      setSaving(false);
      return;
    }

    setIsSaved(true);
    setSaving(false);

    alert("Job saved successfully!");
  };

  // Loading
  if (loading) {
    return (
      <div className="loading">
        <h2>Loading job...</h2>
      </div>
    );
  }

  // Job not found
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

  return (
    <div className="job-details-page">

      <div className="job-details">

        {/* MAIN JOB INFORMATION */}

        <main className="job-details-main">

          <div className="details-header">

            <div className="details-logo">
              {job.company?.charAt(0)}
            </div>

            <div>

              <h1>
                {job.title}
              </h1>

              <p>
                {job.company}
              </p>

              <div className="details-info">

                <span>
                  📍 {job.location}
                </span>

                <span>
                  💼 {job.type}
                </span>

                {job.salary && (
                  <span>
                    💰 {job.salary}
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

            {job.responsibilities &&
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

            {job.requirements &&
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


        {/* SIDE CARD */}

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
            onClick={() =>
              navigate(`/jobs/${id}/apply`)
            }
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
              ? "Saving..."
              : isSaved
              ? "Saved ✓"
              : "Save Job"}
          </button>

        </aside>

      </div>

    </div>
  );
}

export default JobDetails;