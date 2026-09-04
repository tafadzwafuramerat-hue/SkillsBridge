import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");

  // Load the job
  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in first.");
        navigate("/login");
        return;
      }

      const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("employer_id", user.id)
        .single();

      if (error) {
        console.error("Error loading job:", error);
        alert("Could not load this job.");
        navigate("/employer-dashboard");
        return;
      }

      setTitle(job.title || "");
      setCompany(job.company || "");
      setLocation(job.location || "");
      setType(job.type || "");
      setSalary(job.salary || "");
      setDescription(job.description || "");

      setResponsibilities(
        Array.isArray(job.responsibilities)
          ? job.responsibilities.join("\n")
          : job.responsibilities || ""
      );

      setRequirements(
        Array.isArray(job.requirements)
          ? job.requirements.join("\n")
          : job.requirements || ""
      );

      setLoading(false);
    };

    fetchJob();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !company.trim() || !location.trim() || !description.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    const responsibilitiesArray = responsibilities
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const requirementsArray = requirements
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const { error } = await supabase
      .from("jobs")
      .update({
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        type,
        salary: salary.trim(),
        description: description.trim(),
        responsibilities: responsibilitiesArray,
        requirements: requirementsArray,
      })
      .eq("id", id)
      .eq("employer_id", user.id);

    if (error) {
      console.error("Error updating job:", error);
      alert(`Could not update job: ${error.message}`);
      setSaving(false);
      return;
    }

    alert("Job updated successfully!");
    navigate("/employer-dashboard");
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading job...</h2>
      </div>
    );
  }

  return (
    <div className="post-job-page">
      <div className="post-job-container">

        <div className="post-job-header">
          <h1>Edit Job</h1>
          <p>Update the details of your job listing.</p>
        </div>

        <form className="post-job-form" onSubmit={handleSubmit}>

          <h2>Job Information</h2>

          <label>Job Title *</label>
          <input
            type="text"
            placeholder="e.g. Junior Software Developer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Company Name *</label>
          <input
            type="text"
            placeholder="e.g. TechZim Solutions"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <label>Location *</label>
          <input
            type="text"
            placeholder="e.g. Harare, Zimbabwe"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <label>Job Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select job type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>

          <label>Salary</label>
          <input
            type="text"
            placeholder="e.g. $500 - $800 per month"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />

          <label>Job Description *</label>
          <textarea
            placeholder="Describe the job and what the successful candidate will be doing..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="6"
          />

          <label>Responsibilities</label>
          <textarea
            placeholder={`Enter one responsibility per line.

Example:
Build and maintain web applications
Work with the development team
Fix software bugs`}
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            rows="7"
          />

          <small className="field-help">
            Enter each responsibility on a new line.
          </small>

          <label>Requirements</label>
          <textarea
            placeholder={`Enter one requirement per line.

Example:
Knowledge of JavaScript
Experience with React
Good communication skills`}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows="7"
          />

          <small className="field-help">
            Enter each requirement on a new line.
          </small>

          <div className="post-job-buttons">

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/employer-dashboard")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="post-job-button"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditJob;