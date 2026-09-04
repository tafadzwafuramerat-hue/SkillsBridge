import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function PostJob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title ||
      !company ||
      !location ||
      !description
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    // Get logged-in employer
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Please log in as an employer.");
      setLoading(false);
      navigate("/login");
      return;
    }

    // Check employer role
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Profile error:",
        profileError
      );

      alert("Unable to verify your employer account.");
      setLoading(false);
      return;
    }

    if (profile?.role !== "employer") {
      alert(
        "Only employers can post jobs."
      );

      setLoading(false);
      navigate("/dashboard");
      return;
    }

    // Convert responsibilities into an array
    const responsibilitiesArray =
      responsibilities
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item !== "");

    // Convert requirements into an array
    const requirementsArray =
      requirements
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item !== "");

    // Insert job
    const { error } = await supabase
      .from("jobs")
      .insert({
        employer_id: user.id,
        title,
        company,
        location,
        type,
        salary,
        description,
        responsibilities:
          responsibilitiesArray,
        requirements:
          requirementsArray,
      });

    if (error) {
      console.error(
        "Job posting error:",
        error
      );

      alert(error.message);
      setLoading(false);
      return;
    }

    alert(
      "Job posted successfully!"
    );

    setLoading(false);

    navigate("/employer-dashboard");
  };

  return (
    <div className="post-job-page">

      <div className="post-job-container">
        {/* HEADER */}

        <div className="post-job-header">

          <h1>
            Post a New Job
          </h1>

          <p>
            Find talented people for your
            next opportunity.
          </p>

        </div>


        {/* FORM */}

        <form
          className="post-job-form"
          onSubmit={handleSubmit}
        >

          <h2>
            Job Information
          </h2>


          {/* JOB TITLE */}

          <label>
            Job Title *
          </label>

          <input
            type="text"
            placeholder="e.g. Junior Frontend Developer"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />


          {/* COMPANY */}

          <label>
            Company Name *
          </label>

          <input
            type="text"
            placeholder="e.g. TechZim Solutions"
            value={company}
            onChange={(e) =>
              setCompany(e.target.value)
            }
          />


          {/* LOCATION */}

          <label>
            Location *
          </label>

          <input
            type="text"
            placeholder="e.g. Harare, Zimbabwe or Remote"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
          />


          {/* JOB TYPE */}

          <label>
            Job Type
          </label>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
          >
            <option value="Full-time">
              Full-time
            </option>

            <option value="Part-time">
              Part-time
            </option>

            <option value="Internship">
              Internship
            </option>

            <option value="Contract">
              Contract
            </option>

            <option value="Remote">
              Remote
            </option>
          </select>


          {/* SALARY */}

          <label>
            Salary
          </label>

          <input
            type="text"
            placeholder="e.g. $400 - $700/month"
            value={salary}
            onChange={(e) =>
              setSalary(e.target.value)
            }
          />


          {/* DESCRIPTION */}

          <label>
            Job Description *
          </label>

          <textarea
            placeholder="Describe the job and what the successful candidate will do..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows="6"
          />


          {/* RESPONSIBILITIES */}

          <label>
            Responsibilities
          </label>

          <textarea
            placeholder={
              "Enter one responsibility per line.\n\nExample:\nBuild React components\nFix frontend bugs\nWork with the design team"
            }
            value={responsibilities}
            onChange={(e) =>
              setResponsibilities(
                e.target.value
              )
            }
            rows="6"
          />


          {/* REQUIREMENTS */}

          <label>
            Requirements
          </label>

          <textarea
            placeholder={
              "Enter one requirement per line.\n\nExample:\nKnowledge of React\nBasic JavaScript knowledge\nGood communication skills"
            }
            value={requirements}
            onChange={(e) =>
              setRequirements(
                e.target.value
              )
            }
            rows="6"
          />


          {/* BUTTONS */}

          <div className="post-job-buttons">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate("/employer-dashboard")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="post-job-button"
              disabled={loading}
            >
              {loading
                ? "Posting Job..."
                : "Post Job"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default PostJob;