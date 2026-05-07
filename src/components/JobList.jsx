import jobCard from './JobCard'

const jobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'HireFlow',
    location: 'Nairobi, Kenya',
    type: 'Full-time',
    salary: 'KES 80k - 120k',
    postedAt: 'Posted today',
    description:
      'Build simple, responsive user interfaces for candidates and hiring teams.',
    tags: ['React', 'CSS', 'JavaScript'],
  },
  {
    id: 2,
    title: 'Junior UI Engineer',
    company: 'Talent Hub',
    location: 'Remote',
    type: 'Contract',
    salary: 'KES 45k - 70k',
    postedAt: 'Posted 2 days ago',
    description:
      'Support the product team by turning job data into clean reusable components.',
    tags: ['React', 'Responsive UI'],
  },
  {
    id: 3,
    title: 'Junior Data Scientist',
    company: 'Safaricom',
    location: 'Remote',
    type: 'Contract',
    salary: 'KES 45k - 70k',
    postedAt: 'Posted 2 days ago',
    description:
      'Support the product team by turning job data into clean reusable components.',
    tags: ['React', 'Responsive UI'],
  },
]

function JobList() {
  if (jobs.length === 0) {
    return (
      <div className="job-list">
        <p className="job-list__eyebrow">Open roles</p>
        <h2 id="job-list-title">Available Jobs</h2>
        <p className="job-list__empty">No jobs are available right now.</p>
      </div>
    )
  }

  return (
    <div className="job-list">
      <div className="job-list__header">
        <p className="job-list__eyebrow">Open roles</p>
        <h2>Available Jobs</h2>
      </div>

      <div className="job-list__grid">
        {jobs.map((job) => (
          <JobCard job={job} key={job.id} />
        ))}
      </div>
    </div>
  )
}

export default JobList
