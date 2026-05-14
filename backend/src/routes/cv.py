import os

from flask import (
    Blueprint,
    request,
    jsonify
)

from werkzeug.utils import secure_filename

from models.CV import CV, db

cv_bp = Blueprint("cv_bp", __name__)

UPLOAD_FOLDER = "uploads"

ALLOWED_EXTENSIONS = {
    "pdf",
    "doc",
    "docx"
}


def allowed_file(filename):
    return (
        "." in filename and
        filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


# CREATE CV + UPLOAD FILE
@cv_bp.route("/cv", methods=["POST"])
def create_cv():

    full_name = request.form.get("full_name")

    email = request.form.get("email")

    phone = request.form.get("phone")

    skills = request.form.get("skills")

    experience = request.form.get("experience")

    education = request.form.get("education")

    file = request.files.get("cv_file")

    filename = None

    if file and allowed_file(file.filename):

        os.makedirs(
            UPLOAD_FOLDER,
            exist_ok=True
        )

        filename = secure_filename(
            file.filename
        )

        file.save(
            os.path.join(
                UPLOAD_FOLDER,
                filename
            )
        )

    new_cv = CV(
        full_name=full_name,
        email=email,
        phone=phone,
        skills=skills,
        experience=experience,
        education=education,
        cv_file=filename
    )

    db.session.add(new_cv)

    db.session.commit()

    return jsonify(
        new_cv.to_dict()
    ), 201


# GET ALL CVS
@cv_bp.route("/cv", methods=["GET"])
def get_cvs():

    cvs = CV.query.all()

    return jsonify([
        cv.to_dict()
        for cv in cvs
    ])


# UPDATE CV
@cv_bp.route("/cv/<int:id>", methods=["PUT"])
def update_cv(id):

    cv = CV.query.get(id)

    if not cv:
        return jsonify({
            "message": "CV not found"
        }), 404

    data = request.form

    cv.full_name = data.get(
        "full_name",
        cv.full_name
    )

    cv.email = data.get(
        "email",
        cv.email
    )

    cv.phone = data.get(
        "phone",
        cv.phone
    )

    cv.skills = data.get(
        "skills",
        cv.skills
    )

    cv.experience = data.get(
        "experience",
        cv.experience
    )

    cv.education = data.get(
        "education",
        cv.education
    )

    file = request.files.get("cv_file")

    if file and allowed_file(file.filename):

        filename = secure_filename(
            file.filename
        )

        file.save(
            os.path.join(
                UPLOAD_FOLDER,
                filename
            )
        )

        cv.cv_file = filename

    db.session.commit()

    return jsonify(
        cv.to_dict()
    )


# DELETE CV
@cv_bp.route("/cv/<int:id>", methods=["DELETE"])
def delete_cv(id):

    cv = CV.query.get(id)

    if not cv:
        return jsonify({
            "message": "CV not found"
        }), 404

    db.session.delete(cv)

    db.session.commit()

    return jsonify({
        "message": "CV deleted"
    })
