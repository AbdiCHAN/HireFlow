from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class CV(db.Model):
    __tablename__ = "cvs"

    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(
        db.String(120),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        nullable=False
    )

    phone = db.Column(
        db.String(20),
        nullable=False
    )

    skills = db.Column(db.Text)

    experience = db.Column(db.Text)

    education = db.Column(db.Text)

    cv_file = db.Column(db.String(255))

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "skills": self.skills,
            "experience": self.experience,
            "education": self.education,
            "cv_file": self.cv_file,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
