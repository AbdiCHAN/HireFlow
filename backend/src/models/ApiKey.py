from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import secrets

db = SQLAlchemy()


class ApiKey(db.Model):
    __tablename__ = "api_keys"

    id = db.Column(db.Integer, primary_key=True)

    service_name = db.Column(
        db.String(100),
        nullable=False
    )

    api_key = db.Column(
        db.String(255),
        nullable=False,
        unique=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def generate_key(self):
        self.api_key = secrets.token_hex(32)

    def to_dict(self):
        return {
            "id": self.id,
            "service_name": self.service_name,
            "api_key": self.api_key,
            "created_at": self.created_at
        }
