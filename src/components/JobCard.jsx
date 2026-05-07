function jobCard({ job }) {
  return (
    <div className="job-card">
      <div className="job-card__header">
        <div>
          <p className="job-card__company">{job.company}</p>
          <h3 className="job-card__title">{job.title}</h3>
        </div>
        <div className="job-card__type">{job.type}</div>
      </div>

      <p className="job-card__description">{job.description}</p>

      <div className="job-card__details">
        <div>{job.location}</div>
        <div>{job.salary}</div>
        <div>{job.postedAt}</div>
      </div>

      {job.tags.length > 0 && (
        <div className="job-card__tags">
          {job.tags.map((tag) => (
            <div className="job-card__tag" key={tag}>
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default jobCard
