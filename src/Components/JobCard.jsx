import { FaBriefcase, FaHeart, FaMapMarkerAlt } from "react-icons/fa";

function JobCard({
  title,
  company,
  location,
  type,
  salary,
  logo,
}) {
  return (
    <div className="job-card">

      <div className="job-top">
        <div className="company-logo">
          {logo}
        </div>

        <button className="save-job" aria-label="Save job" type="button">
          <FaHeart aria-hidden="true" />
        </button>
      </div>

      <h3>{title}</h3>

      <p className="company-name">
        {company}
      </p>

      <div className="job-info">
        <span><FaMapMarkerAlt aria-hidden="true" /> {location}</span>
        <span><FaBriefcase aria-hidden="true" /> {type}</span>
      </div>

      <div className="job-bottom">
        <strong>{salary}</strong>
      </div>

    </div>
  );
}

export default JobCard;