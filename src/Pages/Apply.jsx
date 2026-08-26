import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [cv, setCv] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  });

  const jobs = [
    {
      id: "1",
      title: "Junior Software Developer",
      company: "TechZim Solutions",
    },
    {
      id: "2",
      title: "UI/UX Design Intern",
      company: "CreativeHub",
    },
    {
      id: "3",
      title: "Digital Marketing Assistant",
      company: "MarketWave",
    },
  ];

  const job = jobs.find(
    (job) => job.id === String(id)
  );

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

    const { data: existingApplication } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("job_id", job.id)
      .maybeSingle();

    if (existingApplication) {
      alert("You have already applied for this job.");
      navigate("/dashboard");
      return;
    }

    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      job_id: job.id,
      title: job.title,
      company: job.company,
      location: "",
      type: "",
      salary: "",
      applicant: user.user_metadata?.full_name || "",
      phone,
      cv,
      coverLetter,
      status: "Applied",
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Application submitted successfully!");

    navigate("/dashboard");
  };

  if (!job) {
    return (
      <div className="not-found">
        <h2>Job not found</h2>

        <button onClick={() => navigate("/jobs")}>
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="apply-page">

      <div className="apply-container">

        <button
          className="back-button"
          onClick={() => navigate(`/jobs/${id}`)}
        >
          ← Back to Job
        </button>

        <div className="apply-header">

          <h1>Apply for this position</h1>

          <p>
            {job.title} at {job.company}
          </p>

        </div>

        <form
          className="application-form"
          onSubmit={handleSubmit}
        >

          <h2>Your Information</h2>

          <label>Full Name</label>

          <input
            type="text"
            value={user?.name || ""}
            disabled
          />

          <label>Email</label>

          <input
            type="email"
            value={user?.email || ""}
            disabled
          />

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
          />

          <label>CV / Resume Link</label>

          <input
            type="text"
            placeholder="Paste your CV link"
            value={cv}
            onChange={(e) =>
              setCv(e.target.value)
            }
          />

          <label>
            Cover Letter <span>*</span>
          </label>

          <textarea
            placeholder="Tell the employer why you are a good fit for this position..."
            value={coverLetter}
            onChange={(e) =>
              setCoverLetter(e.target.value)
            }
          />

          <button
            type="submit"
            className="submit-application-button"
          >
            Submit Application
          </button>

        </form>

      </div>

    </div>
  );
}

export default Apply;