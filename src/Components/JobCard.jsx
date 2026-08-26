function JobCard({
  id,
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
      </div>

    </div>
  );
}

export default JobCard;