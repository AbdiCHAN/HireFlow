"""
Applications Routes Handle job applications 
"""
from flask import request
from extensions import db
from models import Job, JobApplication, CV
from utils.auth import authenticate_token, authorize_role
from utils.responses import success_response, error_response
from utils import validate_integer


def register_application_routes(app):
    @app.route('/api/applications', methods=['POST'])
    @authenticate_token
    def apply_for_job():
        data = request.get_json() or {}
        job_id = data.get('jobId')
        cover_note = data.get('coverNote', '').strip()

        if not validate_integer(job_id, min_value=1):
            return error_response('Valid jobId is required', 400)

        job = Job.query.get(job_id)
        if not job:
            return error_response('Job not found', 404)

        existing = JobApplication.query.filter_by(user_id=request.user.get('id'), job_id=job_id).first()
        if existing:
            return error_response('You have already applied for this job', 409, {'id': existing.id, 'status': existing.status})

        cv = CV.query.filter_by(user_id=request.user.get('id')).first()
        application = JobApplication(
            user_id=request.user.get('id'),
            job_id=job_id,
            cv_id=cv.id if cv else None,
            cover_note=cover_note or None,
            status='submitted'
        )
        db.session.add(application)
        db.session.commit()

        message = 'Application submitted successfully' if cv else 'Application submitted. Upload a CV to strengthen it.'
        return success_response({
            'id': application.id,
            'jobId': application.job_id,
            'status': application.status,
            'createdAt': application.created_at.isoformat()
        }, message, 201)

    @app.route('/api/applications/my', methods=['GET'])
    @authenticate_token
    def get_my_applications():
        applications = JobApplication.query.filter_by(user_id=request.user.get('id')).all()
        data = [
            {
                'id': app.id,
                'jobId': app.job_id,
                'cvId': app.cv_id,
                'coverNote': app.cover_note,
                'status': app.status,
                'createdAt': app.created_at.isoformat(),
                'updatedAt': app.updated_at.isoformat(),
                'jobTitle': app.job.title if app.job else None,
                'company': app.job.company if app.job else None,
                'jobLocation': app.job.location if app.job else None
            }
            for app in applications
        ]
        return success_response(data)

    @app.route('/api/applications', methods=['GET'])
    @authenticate_token
    @authorize_role('employer', 'admin')
    def get_applications():
        if request.user.get('role') == 'admin':
            applications = JobApplication.query.all()
        else:
            applications = db.session.query(JobApplication).join(Job).filter(Job.posted_by_user_id == request.user.get('id')).all()

        data = [
            {
                'id': app.id,
                'userId': app.user_id,
                'jobId': app.job_id,
                'cvId': app.cv_id,
                'coverNote': app.cover_note,
                'status': app.status,
                'createdAt': app.created_at.isoformat(),
                'updatedAt': app.updated_at.isoformat(),
                'applicantName': app.applicant.username if app.applicant else None,
                'applicantEmail': app.applicant.email if app.applicant else None,
                'jobTitle': app.job.title if app.job else None,
                'company': app.job.company if app.job else None,
                'jobLocation': app.job.location if app.job else None
            }
            for app in applications
        ]
        return success_response(data)

    @app.route('/api/applications/<int:app_id>', methods=['GET'])
    @authenticate_token
    def get_application(app_id):
        application = JobApplication.query.get(app_id)
        if not application:
            return error_response('Application not found', 404)

        is_applicant = application.user_id == request.user.get('id')
        is_job_owner = application.job and application.job.posted_by_user_id == request.user.get('id')
        is_admin = request.user.get('role') == 'admin'
        if not (is_applicant or is_job_owner or is_admin):
            return error_response('Insufficient permissions', 403)

        return success_response({
            'id': application.id,
            'userId': application.user_id,
            'jobId': application.job_id,
            'cvId': application.cv_id,
            'coverNote': application.cover_note,
            'status': application.status,
            'createdAt': application.created_at.isoformat(),
            'updatedAt': application.updated_at.isoformat()
        })

    @app.route('/api/applications/<int:app_id>/status', methods=['PATCH'])
    @authenticate_token
    @authorize_role('employer', 'admin')
    def update_application_status(app_id):
        application = JobApplication.query.get(app_id)
        if not application:
            return error_response('Application not found', 404)
        if application.job and application.job.posted_by_user_id != request.user.get('id') and request.user.get('role') != 'admin':
            return error_response('Insufficient permissions', 403)

        data = request.get_json() or {}
        new_status = data.get('status', '').strip()
        if new_status not in {'submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'}:
            return error_response('Invalid status', 400)

        application.status = new_status
        db.session.commit()
        return success_response({'id': application.id, 'status': application.status, 'updatedAt': application.updated_at.isoformat()}, 'Application status updated successfully')

    @app.route('/api/applications/<int:app_id>', methods=['DELETE'])
    @authenticate_token
    def delete_application(app_id):
        application = JobApplication.query.get(app_id)
        if not application:
            return error_response('Application not found', 404)
        if application.user_id != request.user.get('id') and request.user.get('role') != 'admin':
            return error_response('Insufficient permissions', 403)

        db.session.delete(application)
        db.session.commit()
        return success_response(None, 'Application deleted successfully')
