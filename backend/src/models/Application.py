from extensions import db
from datetime import datetime


class JobApplication(db.Model):
    """JobApplication model - tracks job applications"""
    __tablename__ = 'job_applications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False, index=True)
    cv_id = db.Column(db.Integer, db.ForeignKey('cvs.id'), nullable=True)

    cover_note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='submitted', nullable=False, index=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    cv = db.relationship('CV', backref='applications')

    def __repr__(self):
        return f"<Application {self.id}>"
