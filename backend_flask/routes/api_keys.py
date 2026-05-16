"""
API Keys Routes 
"""
from flask import request, jsonify
from extensions import db
from models import ApiKey
from auth_utils import authenticate_token
import secrets


def register_api_key_routes(app):
    """Register all API key routes to Flask app"""
    
    @app.route('/api/keys', methods=['GET'])
    @authenticate_token
    def list_api_keys():
        """List user's API keys"""
        try:
            user = request.user
            keys = ApiKey.query.filter_by(user_id=user.get('id')).all()
            
            return jsonify({
                'data': [{
                    'id': key.id,
                    'name': key.name,
                    'isActive': key.is_active,
                    'lastUsed': key.last_used.isoformat() if key.last_used else None,
                    'createdAt': key.created_at.isoformat(),
                    'updatedAt': key.updated_at.isoformat()
                } for key in keys]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/keys', methods=['POST'])
    @authenticate_token
    def create_api_key():
        """Create a new API key"""
        try:
            user = request.user
            data = request.get_json() or {}
            
            name = data.get('name', 'HireFlow API Key')
            if not isinstance(name, str) or not name.strip():
                name = 'HireFlow API Key'
            
            # Generate a unique API key
            new_key = f"hf_{secrets.token_urlsafe(32)}"
            
            api_key = ApiKey(
                user_id=user.get('id'),
                key=new_key,
                name=name.strip(),
                is_active=True
            )
            
            db.session.add(api_key)
            db.session.commit()
            
            return jsonify({
                'message': 'API key created. Copy it now; it will not be shown again.',
                'data': {
                    'id': api_key.id,
                    'key': new_key,
                    'name': api_key.name,
                    'isActive': api_key.is_active,
                    'createdAt': api_key.created_at.isoformat()
                }
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/keys/<int:key_id>', methods=['DELETE'])
    @authenticate_token
    def revoke_api_key(key_id):
        """Revoke an API key"""
        try:
            user = request.user
            
            api_key = ApiKey.query.filter_by(
                id=key_id,
                user_id=user.get('id')
            ).first()
            
            if not api_key:
                return jsonify({'error': 'API key not found'}), 404
            
            db.session.delete(api_key)
            db.session.commit()
            
            return jsonify({'message': 'API key revoked successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/keys/<int:key_id>/toggle', methods=['PATCH'])
    @authenticate_token
    def toggle_api_key(key_id):
        """Toggle API key active/inactive status"""
        try:
            user = request.user
            api_key = ApiKey.query.filter_by(
                id=key_id,
                user_id=user.get('id')
            ).first()
            
            if not api_key:
                return jsonify({'error': 'API key not found'}), 404
            
            api_key.is_active = not api_key.is_active
            db.session.commit()
            
            return jsonify({
                'message': f'API key {"activated" if api_key.is_active else "deactivated"}',
                'data': {
                    'id': api_key.id,
                    'isActive': api_key.is_active,
                    'updatedAt': api_key.updated_at.isoformat()
                }
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
