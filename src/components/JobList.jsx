import JobCard from "./JobCard";

function JobList({ jobs = [], savedIds, onSave, onSelect }) {
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
    tags: ['Python', 'Responsive UI','Django'],
  },
]

function JobList() {
  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <h3 className="empty-state__title">No jobs found</h3>
        <p className="empty-state__sub">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="jobs-grid">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSaved={savedIds?.has(job.id)}
          onSave={onSave}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default JobList;
