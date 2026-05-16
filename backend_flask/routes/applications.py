"""
Route registration for job applications
"""
from flask import request, jsonify
from extensions import db
from models import JobApplication, Job, CV
from auth_utils import authenticate_token, authorize_role


VALID_STATUSES = {'submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'}


def register_application_routes(app):
    """Register all application routes to Flask app"""

    @app.route('/api/applications', methods=['POST'])
    @authenticate_token
    @authorize_role('job_seeker', 'employer', 'admin')
    def create_application():
        """Apply for a job"""
        try:
            user = request.user
            data = request.get_json() or {}

            job_id = data.get('jobId')
            cover_note = data.get('coverNote', '').strip()

            if not job_id or not isinstance(job_id, int):
                return jsonify({'error': 'Valid jobId required'}), 400

            job = Job.query.get(job_id)
            if not job:
                return jsonify({'error': 'Job not found'}), 404

            existing = JobApplication.query.filter_by(
                user_id=user.get('id'),
                job_id=job_id
            ).first()

            if existing:
                return jsonify({
                    'error': 'Already applied for this job',
                    'data': {
                        'id': existing.id,
                        'userId': existing.user_id,
                        'jobId': existing.job_id,
                        'status': existing.status
                    }
                }), 409

            cv = CV.query.filter_by(user_id=user.get('id')).first()

            application = JobApplication(
                user_id=user.get('id'),
                job_id=job_id,
                cv_id=cv.id if cv else None,
                cover_note=cover_note,
                status='submitted'
            )

            db.session.add(application)
            db.session.commit()

            message = 'Application submitted successfully' if cv else 'Application submitted. Upload a CV to strengthen it.'

            return jsonify({
                'message': message,
                'data': {
                    'id': application.id,
                    'userId': application.user_id,
                    'jobId': application.job_id,
                    'cvId': application.cv_id,
                    'coverNote': application.cover_note,
                    'status': application.status,
                    'createdAt': application.created_at.isoformat(),
                    'updatedAt': application.updated_at.isoformat()
                }
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500


    @app.route('/api/applications/my', methods=['GET'])
    @authenticate_token
    @authorize_role('job_seeker', 'admin')
    def get_my_applications():
        """Get authenticated user's applications"""
        try:
            user = request.user
            applications = JobApplication.query.filter_by(user_id=user.get('id')).all()

            return jsonify({
                'data': [{
                    'id': app.id,
                    'userId': app.user_id,
                    'jobId': app.job_id,
                    'cvId': app.cv_id,
                    'coverNote': app.cover_note,
                    'status': app.status,
                    'createdAt': app.created_at.isoformat(),
                    'updatedAt': app.updated_at.isoformat(),
                    'jobTitle': app.job.title if app.job else None,
                    'company': app.job.company if app.job else None,
                    'jobLocation': app.job.location if app.job else None
                } for app in applications]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500


    @app.route('/api/applications', methods=['GET'])
    @authenticate_token
    @authorize_role('employer', 'admin')
    def get_applications():
        """Get applications — employer sees their jobs', admin sees all"""
        try:
            user = request.user

            if user.get('role') == 'admin':
                applications = JobApplication.query.all()
            else:
                applications = db.session.query(JobApplication).join(Job).filter(
                    Job.posted_by_user_id == user.get('id')
                ).all()

            return jsonify({
                'data': [{
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
                    'jobLocation': app.job.location if app.job else None,
                    'postedByUserId': app.job.posted_by_user_id if app.job else None,
                    'cvFullName': app.cv.full_name if app.cv else None,
                    'cvEmail': app.cv.email if app.cv else None,
                    'cvPhone': app.cv.phone if app.cv else None,
                    'currentRole': app.cv.current_role if app.cv else None,
                    'expectedSalary': app.cv.expected_salary if app.cv else None,
                    'cvFilePath': app.cv.cv_file_path if app.cv else None
                } for app in applications]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500


    @app.route('/api/applications/<int:app_id>', methods=['GET'])
    @authenticate_token
    def get_application(app_id):
        """Get single application details"""
        try:
            user = request.user
            application = JobApplication.query.get(app_id)

            if not application:
                return jsonify({'error': 'Application not found'}), 404

            if (application.user_id != user.get('id') and
                application.job.posted_by_user_id != user.get('id') and
                user.get('role') != 'admin'):
                return jsonify({'error': 'Insufficient permissions'}), 403

            return jsonify({
                'data': {
                    'id': application.id,
                    'userId': application.user_id,
                    'jobId': application.job_id,
                    'cvId': application.cv_id,
                    'coverNote': application.cover_note,
                    'status': application.status,
                    'createdAt': application.created_at.isoformat(),
                    'updatedAt': application.updated_at.isoformat()
                }
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500


    @app.route('/api/applications/<int:app_id>/status', methods=['PATCH'])
    @authenticate_token
    @authorize_role('employer', 'admin')
    def update_application_status(app_id):
        """Update application status"""
        try:
            user = request.user
            application = JobApplication.query.get(app_id)

            if not application:
                return jsonify({'error': 'Application not found'}), 404

            if application.job.posted_by_user_id != user.get('id') and user.get('role') != 'admin':
                return jsonify({'error': 'Insufficient permissions'}), 403

            new_status = (request.get_json() or {}).get('status')

            if new_status not in VALID_STATUSES:
                return jsonify({'error': f'Invalid status. Must be one of: {", ".join(VALID_STATUSES)}'}), 400

            application.status = new_status
            db.session.commit()

            return jsonify({
                'message': 'Application status updated',
                'data': {
                    'id': application.id,
                    'status': application.status,
                    'updatedAt': application.updated_at.isoformat()
                }
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500


    @app.route('/api/applications/<int:app_id>', methods=['DELETE'])
    @authenticate_token
    def delete_application(app_id):
        """Delete application (owner or admin only)"""
        try:
            user = request.user
            application = JobApplication.query.get(app_id)

            if not application:
                return jsonify({'error': 'Application not found'}), 404

            if application.user_id != user.get('id') and user.get('role') != 'admin':
                return jsonify({'error': 'Insufficient permissions'}), 403

            db.session.delete(application)
            db.session.commit()

            return jsonify({'message': 'Application deleted'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
