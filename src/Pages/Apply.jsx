import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaArrowLeft } from "react-icons/fa";

function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [cv, setCv] = useState("");

  useEffect(() => {
    const loadApplicationPage = async () => {
      setLoading(true);

      // =========================
      // GET CURRENT USER
      // =========================

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setLoading(false);
        navigate("/login");
        return;
      }

      setUser(currentUser);

      // =========================
      // GET JOB FROM SUPABASE
      // =========================

      const { data: jobData, error: jobError } =
        await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single();

      if (jobError) {
        console.error(
          "Error loading job:",
          jobError
        );

        setLoading(false);
        return;
      }

      setJob(jobData);

      setLoading(false);
    };

    loadApplicationPage();
  }, [id, navigate]);

  // =========================
  // SUBMIT APPLICATION
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || !coverLetter) {
      alert(
        "Please complete all required fields."
      );
      return;
    }

    if (!user) {
      alert(
        "Please log in before applying."
      );

      navigate("/login");
      return;
    }

    if (!job) {
      alert("Job information could not be found.");
      return;
    }

    setSubmitting(true);

    // =========================
    // CHECK FOR EXISTING APPLICATION
    // =========================

    const {
      data: existingApplication,
      error: existingError,
    } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("job_id", job.id)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Error checking application:",
        existingError
      );

      alert(existingError.message);
      setSubmitting(false);
      return;
    }

    if (existingApplication) {
      alert(
        "You have already applied for this job."
      );

      setSubmitting(false);
      navigate("/dashboard");
      return;
    }

    // =========================
    // CREATE APPLICATION
    // =========================

    const { error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        job_id: job.id,

        phone: phone,
        cv: cv,

        cover_letter: coverLetter,

        status: "Applied",
      });

    if (error) {
      console.error(
        "Application submission failed:",
        error
      );

      alert(error.message);
      setSubmitting(false);
      return;
    }

    // =========================
    // SUCCESS
    // =========================

    alert(
      "Application submitted successfully!"
    );

    setSubmitting(false);

    navigate("/dashboard");
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="dashboard-message">
        <h2>
          Loading application...
        </h2>
      </div>
    );
  }

  // =========================
  // JOB NOT FOUND
  // =========================

  if (!job) {
    return (
      <div className="not-found">

        <h2>
          Job not found
        </h2>

        <p>
          The job you're trying to apply
          for doesn't exist.
        </p>

        <button
          onClick={() =>
            navigate("/jobs")
          }
        >
          Back to Jobs
        </button>

      </div>
    );
  }

  // =========================
  // APPLICATION PAGE
  // =========================

  return (
    <div className="apply-page">

      <div className="apply-container">

        {/* BACK BUTTON */}

        <button
          className="back-button"
          onClick={() =>
            navigate(`/jobs/${id}`)
          }
        >
          <FaArrowLeft aria-hidden="true" /> Back to Job
        </button>


        {/* HEADER */}

        <div className="apply-header">

          <h1>
            Apply for this position
          </h1>

          <p>
            {job.title} at {job.company}
          </p>

        </div>


        {/* FORM */}

        <form
          className="application-form"
          onSubmit={handleSubmit}
        >

          <h2>
            Your Information
          </h2>


          {/* NAME */}

          <label>
            Full Name
          </label>

          <input
            type="text"
            value={
              user?.user_metadata?.full_name ||
              ""
            }
            disabled
          />


          {/* EMAIL */}

          <label>
            Email
          </label>

          <input
            type="email"
            value={
              user?.email || ""
            }
            disabled
          />


          {/* PHONE */}

          <label>
            Phone Number{" "}
            <span>*</span>
          </label>

          <input
            type="tel"
            placeholder="+263 7X XXX XXXX"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            required
          />


          {/* CV */}

          <label>
            CV / Resume Link
          </label>

          <input
            type="text"
            placeholder="Paste your CV link"
            value={cv}
            onChange={(e) =>
              setCv(e.target.value)
            }
          />


          {/* COVER LETTER */}

          <label>
            Cover Letter{" "}
            <span>*</span>
          </label>

          <textarea
            placeholder="Tell the employer why you are a good fit for this position..."
            value={coverLetter}
            onChange={(e) =>
              setCoverLetter(e.target.value)
            }
            required
          />


          {/* SUBMIT */}

          <button
            type="submit"
            className="submit-application-button"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Application"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Apply;