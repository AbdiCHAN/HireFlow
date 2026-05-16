"""
API Keys Routes Handle API key management
"""
from flask import request
from extensions import db
from models import ApiKey
from utils.auth import authenticate_token
from utils.responses import success_response, error_response
from utils import validate_integer, validate_string
import secrets


def register_api_key_routes(app):
    @app.route('/api/keys', methods=['GET'])
    @authenticate_token
    def list_api_keys():
        user = request.user
        keys = ApiKey.query.filter_by(user_id=user.get('id')).all()
        data = [
            {
                'id': key.id,
                'name': key.name,
                'isActive': key.is_active,
                'lastUsed': key.last_used.isoformat() if key.last_used else None,
                'createdAt': key.created_at.isoformat(),
                'updatedAt': key.updated_at.isoformat()
            }
            for key in keys
        ]
        return success_response(data)

    @app.route('/api/keys', methods=['POST'])
    @authenticate_token
    def create_api_key():
        user = request.user
        data = request.get_json() or {}
        name = data.get('name', 'HireFlow API Key')

        if name and not validate_string(name, min_length=1, max_length=100):
            return error_response('API key name must be 1-100 characters', 400)

        key_value = f"hf_{secrets.token_urlsafe(32)}"
        api_key = ApiKey(user_id=user.get('id'), key=key_value, name=name or 'HireFlow API Key', is_active=True)
        db.session.add(api_key)
        db.session.commit()
        return success_response({
            'id': api_key.id,
            'key': key_value,
            'name': api_key.name,
            'isActive': api_key.is_active,
            'createdAt': api_key.created_at.isoformat()
        }, 'API key created. Copy it now; it will not be shown again.', 201)

    @app.route('/api/keys/<int:key_id>', methods=['DELETE'])
    @authenticate_token
    def revoke_api_key(key_id):
        if not validate_integer(key_id, min_value=1):
            return error_response('Invalid API key ID', 400)

        api_key = ApiKey.query.filter_by(id=key_id, user_id=request.user.get('id')).first()
        if not api_key:
            return error_response('API key not found', 404)

        db.session.delete(api_key)
        db.session.commit()
        return success_response(None, 'API key revoked successfully')

    @app.route('/api/keys/<int:key_id>', methods=['PATCH'])
    @authenticate_token
    def toggle_api_key(key_id):
        if not validate_integer(key_id, min_value=1):
            return error_response('Invalid API key ID', 400)

        api_key = ApiKey.query.filter_by(id=key_id, user_id=request.user.get('id')).first()
        if not api_key:
            return error_response('API key not found', 404)

        data = request.get_json() or {}
        new_status = data.get('is_active')
        if new_status is not None:
            api_key.is_active = bool(new_status)
            db.session.commit()

        return success_response({
            'id': api_key.id,
            'isActive': api_key.is_active,
            'updatedAt': api_key.updated_at.isoformat()
        }, 'API key status updated')
