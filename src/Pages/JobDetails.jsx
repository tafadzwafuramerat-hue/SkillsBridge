import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const jobs = [
    {
      id: "1",
      title: "Junior Software Developer",
      company: "TechZim Solutions",
      location: "Remote",
      type: "Full-time",
      salary: "$400 - $700/month",
      description:
        "We are looking for a motivated junior software developer to join our development team.",
      requirements: [
        "Basic knowledge of JavaScript or Python",
        "Understanding of HTML and CSS",
        "Knowledge of Git and GitHub",
        "Good problem-solving skills",
      ],
      responsibilities: [
        "Build and maintain web applications",
        "Work with other developers",
        "Fix bugs and improve features",
        "Participate in code reviews",
      ],
    },

    {
      id: "2",
      title: "UI/UX Design Intern",
      company: "CreativeHub",
      location: "Harare",
      type: "Internship",
      salary: "$250/month",
      description:
        "CreativeHub is looking for a creative design intern to help create user-friendly digital experiences.",
      requirements: [
        "Basic knowledge of Figma",
        "Understanding of UI/UX principles",
        "Good visual design skills",
      ],
      responsibilities: [
        "Create wireframes and prototypes",
        "Assist with user research",
        "Design user interfaces",
      ],
    },

    {
      id: "3",
      title: "Digital Marketing Assistant",
      company: "MarketWave",
      location: "Bulawayo",
      type: "Full-time",
      salary: "$300 - $500/month",
      description:
        "MarketWave is looking for a digital marketing assistant to support online marketing campaigns.",
      requirements: [
        "Basic digital marketing knowledge",
        "Social media knowledge",
        "Good communication skills",
      ],
      responsibilities: [
        "Create social media content",
        "Assist with campaigns",
        "Track campaign performance",
      ],
    },
  ];

  const job = jobs.find((job) => job.id === String(id));

  const handleSaveJob = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in before saving a job.");
      navigate("/login");
      return;
    }

    const { error } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      job_id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
    });

    if (error?.code === "23505") {
      alert("This job is already saved.");
      return;
    }

    if (error) {
      alert(error.message);
      return;
    }

    alert("Job saved successfully!");
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
    <div className="job-details-page">

      <button
        className="back-button"
        onClick={() => navigate("/jobs")}
      >
        ← Back to Jobs
      </button>

      <div className="job-details">

        <main className="job-details-main">

          <div className="details-header">

            <div className="details-logo">
              {job.company.charAt(0)}
            </div>

            <div>
              <h1>{job.title}</h1>

              <p>{job.company}</p>

              <div className="details-info">
                <span>📍 {job.location}</span>
                <span>💼 {job.type}</span>
              </div>
            </div>

          </div>

          <hr />

          <section>
            <h2>About the Job</h2>

            <p>{job.description}</p>
          </section>

          <section>
            <h2>Responsibilities</h2>

            <ul>
              {job.responsibilities.map((item, index) => (
                <li key={index}>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Requirements</h2>

            <ul>
              {job.requirements.map((item, index) => (
                <li key={index}>
                  {item}
                </li>
              ))}
            </ul>
          </section>

        </main>

        <aside className="apply-card">

          <h2>{job.salary}</h2>

          <p>Salary</p>

         <button
            className="apply-button"
            onClick={() => navigate(`/jobs/${job.id}/apply`)}
          >
            Apply Now
          </button>
          <button
                className="save-details-button"
                onClick={handleSaveJob}
            >
             ♡ Save Job
    </button>

        </aside>

      </div>

    </div>
  );
}

export default JobDetails;