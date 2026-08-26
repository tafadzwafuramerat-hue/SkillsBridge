import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import JobCard from "../Components/JobCard";

function Jobs() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search and filter states
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );

  const [jobType, setJobType] = useState("All");

  // Jobs from Supabase
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  // Get jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error fetching jobs:",
          error
        );

        setLoading(false);
        return;
      }

      setJobs(data || []);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      job.company
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesLocation =
      location === "" ||
      job.location
        ?.toLowerCase()
        .includes(location.toLowerCase());

    const matchesType =
      jobType === "All" ||
      job.type === jobType;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesType
    );
  });

  // Loading screen
  if (loading) {
    return (
      <div className="loading">
        <h2>Loading jobs...</h2>
      </div>
    );
  }

  return (
    <div className="jobs-page">

      {/* PAGE HEADER */}

      <section className="jobs-header">

        <h1>Find Your Next Opportunity</h1>

        <p>
          Discover jobs, internships, and
          opportunities that match your skills.
        </p>

      </section>


      {/* SEARCH AREA */}

      <section className="jobs-search-section">

        <div className="jobs-search-box">

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Job title, skill or keyword"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {/* LOCATION */}

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
          />

          {/* JOB TYPE */}

          <select
            value={jobType}
            onChange={(e) =>
              setJobType(e.target.value)
            }
          >

            <option value="All">
              All Job Types
            </option>

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

        </div>

      </section>


      {/* RESULTS */}

      <section className="jobs-results">

        <div className="jobs-results-header">

          <h2>
            {filteredJobs.length} Jobs Found
          </h2>

          {(search ||
            location ||
            jobType !== "All") && (

            <button
              className="clear-filters"
              onClick={() => {
                setSearch("");
                setLocation("");
                setJobType("All");
              }}
            >
              Clear Filters
            </button>

          )}

        </div>


        {/* NO JOBS */}

        {filteredJobs.length === 0 ? (

          <div className="no-jobs">

            <h2>
              No jobs found
            </h2>

            <p>
              Try changing your search or
              filters.
            </p>

          </div>

        ) : (

          /* JOB CARDS */

          <div className="jobs-grid">

            {filteredJobs.map((job) => (

              <div
                className="job-card-wrapper"
                key={job.id}
              >

                <JobCard
                  logo={
                    job.company
                      ? job.company.charAt(0)
                      : "S"
                  }

                  title={job.title}

                  company={job.company}

                  location={job.location}

                  type={job.type}

                  salary={job.salary}
                />

                <button
                  className="view-job-button"
                  onClick={() =>
                    navigate(
                      `/jobs/${job.id}`
                    )
                  }
                >
                  View Job
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Jobs;