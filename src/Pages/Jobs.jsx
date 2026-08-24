import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import JobCard from "../Components/JobCard";

function Jobs() {
  // Get search values from the URL
  const [searchParams] = useSearchParams();

  // Search states
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );

  const [jobType, setJobType] = useState("All");

  // Demo jobs
  const jobs = [
    {
      id: 1,
      logo: "TZ",
      title: "Junior Software Developer",
      company: "TechZim Solutions",
      location: "Remote",
      type: "Full-time",
      salary: "$400 - $700/month",
    },

    {
      id: 2,
      logo: "C",
      title: "UI/UX Design Intern",
      company: "CreativeHub",
      location: "Harare",
      type: "Internship",
      salary: "$250/month",
    },

    {
      id: 3,
      logo: "M",
      title: "Digital Marketing Assistant",
      company: "MarketWave",
      location: "Bulawayo",
      type: "Full-time",
      salary: "$300 - $500/month",
    },

    {
      id: 4,
      logo: "D",
      title: "Junior Software Engineer",
      company: "DevAfrica",
      location: "Remote",
      type: "Full-time",
      salary: "$500 - $800/month",
    },

    {
      id: 5,
      logo: "G",
      title: "Graphic Design Intern",
      company: "Growth Studio",
      location: "Harare",
      type: "Internship",
      salary: "$200/month",
    },

    {
      id: 6,
      logo: "S",
      title: "Customer Support Assistant",
      company: "StartUpZW",
      location: "Remote",
      type: "Part-time",
      salary: "$250 - $400/month",
    },
  ];

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());

    const matchesLocation =
      location === "" ||
      job.location.toLowerCase().includes(location.toLowerCase());

    const matchesType =
      jobType === "All" ||
      job.type === jobType;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesType
    );
  });

  return (
    <div className="jobs-page">

      {/* Header */}
      <div className="jobs-header">
        <h1>Find your next opportunity</h1>

        <p>
          Search jobs and opportunities designed
          for emerging talent.
        </p>
      </div>

      {/* Search */}
      <div className="jobs-search">

        <input
          type="text"
          placeholder="Job title or keyword"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
        >
          <option value="All">
            All job types
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
        </select>

      </div>

      {/* Jobs content */}
      <div className="jobs-content">

        {/* Filters */}
        <aside className="filters">

          <h3>Filter Jobs</h3>

          <label>Job Type</label>

          <button onClick={() => setJobType("All")}>
            All Jobs
          </button>

          <button
            onClick={() => setJobType("Full-time")}
          >
            Full-time
          </button>

          <button
            onClick={() => setJobType("Part-time")}
          >
            Part-time
          </button>

          <button
            onClick={() => setJobType("Internship")}
          >
            Internship
          </button>

        </aside>

        {/* Job results */}
        <main className="job-results">

          <div className="results-header">
            <h2>
              {filteredJobs.length} Jobs Found
            </h2>
          </div>

          <div className="jobs-grid">

            {filteredJobs.length > 0 ? (

              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  logo={job.logo}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  type={job.type}
                  salary={job.salary}
                />
              ))

            ) : (

              <p className="no-results">
                No jobs found. Try another search.
              </p>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default Jobs;