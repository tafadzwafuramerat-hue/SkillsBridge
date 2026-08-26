import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);

  const [phone, setPhone] = useState("");
  const [cv, setCv] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get logged-in user and selected job
  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        // Get job from Supabase
        const { data: jobData, error: jobError } =
          await supabase
            .from("jobs")
            .select("*")
            .eq("id", id)
            .single();

        if (jobError) {
          console.error(
            "Error fetching job:",
            jobError
          );

          setJob(null);
          setLoading(false);
          return;
        }

        setJob(jobData);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    loadApplicationData();
  }, [id]);

  // Submit application
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || !coverLetter) {
      alert("Please complete all required fields.");
      return;
    }

    if (!user) {
      alert("Please log in before applying.");
      navigate("/login");
      return;
    }

    if (!job) {
      alert("Job information could not be found.");
      return;
    }

    setSubmitting(true);

    // Check whether user already applied
    const { data: existingApplication, error: checkError } =
      await supabase
        .from("applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_id", job.id)
        .maybeSingle();

    if (checkError) {
      console.error(
        "Error checking application:",
        checkError
      );

      alert(checkError.message);
      setSubmitting(false);
      return;
    }

    if (existingApplication) {
      alert("You have already applied for this job.");
      navigate("/dashboard");
      return;
    }

    // Insert application into Supabase
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
        "Application submission error:",
        error
      );

      alert(error.message);
      setSubmitting(false);
      return;
    }

    alert("Application submitted successfully!");

    navigate("/dashboard");
  };

  // Loading
  if (loading) {
    return (
      <div className="loading">
        <h2>Loading application...</h2>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="not-found">
        <h2>Job not found</h2>

        <p>
          We couldn't find this job.
        </p>

        <button
          onClick={() => navigate("/jobs")}
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="apply-page">

      <div className="apply-container">

        {/* Back button */}

        <button
          className="back-button"
          onClick={() =>
            navigate(`/jobs/${id}`)
          }
        >
          ←  Back to Job
        </button>


        {/* Header */}

        <div className="apply-header">

          <h1>
            Apply for this position
          </h1>

          <p>
            {job.title} at {job.company}
          </p>

          <p>
            📍 {job.location}
          </p>

        </div>


        {/* Form */}

        <form
          className="application-form"
          onSubmit={handleSubmit}
        >

          <h2>Your Information</h2>


          {/* Full Name */}

          <label>
            Full Name
          </label>

          <input
            type="text"
            value={
              user?.user_metadata?.full_name || ""
            }
            disabled
          />


          {/* Email */}

          <label>
            Email
          </label>

          <input
            type="email"
            value={user?.email || ""}
            disabled
          />


          {/* Phone */}

          <label>
            Phone Number <span>*</span>
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


          {/* Cover Letter */}

          <label>
            Cover Letter <span>*</span>
          </label>

          <textarea
            placeholder="Tell the employer why you are a good fit for this position..."
            value={coverLetter}
            onChange={(e) =>
              setCoverLetter(e.target.value)
            }
            required
          />


          {/* Submit */}

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