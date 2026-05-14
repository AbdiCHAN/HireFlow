from flask import Blueprint, jsonify

from models.CV import CV
from models.ApiKey import ApiKey

admin_bp = Blueprint(
    "admin_bp",
    __name__
)


# ADMIN OVERVIEW
@admin_bp.route(
    "/admin/overview",
    methods=["GET"]
)
def admin_overview():

    total_cvs = CV.query.count()

    total_api_keys = ApiKey.query.count()

    return jsonify({
        "total_cvs": total_cvs,
        "total_api_keys": total_api_keys,
        "status": "Backend running"
    })
