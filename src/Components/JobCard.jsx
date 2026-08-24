import { useNavigate } from "react-router-dom";

function JobCard({
  id,
  title,
  company,
  location,
  type,
  salary,
  logo,
}) {
  const navigate = useNavigate();

  return (
    <div className="job-card">

      <div className="job-top">
        <div className="company-logo">
          {logo}
        </div>

        <button className="save-job">
          ♡
        </button>
      </div>

      <h3>{title}</h3>

      <p className="company-name">
        {company}
      </p>

      <div className="job-info">
        <span>📍 {location}</span>
        <span>💼 {type}</span>
      </div>

      <div className="job-bottom">
        <strong>{salary}</strong>

        <button
          className="view-job"
          onClick={() => navigate(`/jobs/${id}`)}
        >
          View Job
        </button>
      </div>

    </div>
  );
}

export default JobCard;