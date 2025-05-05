from flask import Blueprint, request, jsonify
from models import SessionLocal, User
import jwt
from config import Config
import datetime
from functools import wraps

auth_bp = Blueprint('auth',__name__)

@auth_bp.route('/register', methods = ['POST'])
def register():
    data = request.get_json()
    session = SessionLocal()
    try:
        if session.query(User).filter_by(login=data['login']).first():
                return jsonify({'error': 'Login already exists'}), 400
            
        user = User(
            login=data['login'],
            password=data['password'],
            name=data['name'],
            surname=data['surname']
        )
            
        session.add(user)
        session.commit()
        return jsonify({'message': 'User created successfully'}), 201
    finally:
        session.close()

@auth_bp.route('/login', methods = ['POST'])
def login():
    data = request.get_json()
    session = SessionLocal()

    try:
        user = session.query(User).filter_by(login=data['login']).first()
        
        if not user or user.password != data['password']:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode(
            {
                'id': user.id,
                'login': user.login,
                'name': user.name,
                'surname': user.surname,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            },
            Config.SECRET_KEY,
            algorithm="HS256"
        )
        
        return jsonify({
            'token': token,
            'login': user.login,
            'name':user.name,
            'surname':user.surname,
            'score':user.score
        }), 200
    finally:
        session.close()

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        session = SessionLocal()
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer'):
                token = auth_header.split(' ')[1]  
            else:
                return jsonify({"message": "Token is missing!"}), 403

            try:
                data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
                current_user = session.query(User).filter_by(id=data['id']).first()
                if not current_user:
                    return jsonify({"message": "User not found!"}), 403
            except Exception as e:
                return jsonify({"message": f"Token is invalid! {str(e)}"}), 403
            
            return f(current_user, *args, **kwargs)
        finally:
            session.close()
    return decorated

@auth_bp.route('/change_user_data', methods=['POST'])
@token_required
def change_user_data(current_user):
    session = SessionLocal()
    try:
        data = request.get_json()
        
        # Проверяем, какие поля нужно обновить
        if 'name' in data:
            current_user.name = data['name']
        if 'surname' in data:
            current_user.surname = data['surname']
        if 'login' in data:
            # Проверяем, не занят ли уже такой логин
            existing_user = session.query(User).filter_by(login=data['login']).first()
            if existing_user and existing_user.id != current_user.id:
                return jsonify({"message": "Логин уже занят"}), 400
            current_user.login = data['login']
        if 'password' in data and data['password']:
            current_user.password = data['password']
            
        session.commit()
        
        # Создаем новый токен с обновленными данными
        token = jwt.encode(
            {
                'id': current_user.id,
                'login': current_user.login,
                'name': current_user.name,
                'surname': current_user.surname,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            },
            Config.SECRET_KEY,
            algorithm="HS256"
        )
        
        return jsonify({
            'token': token,
            'login': current_user.login,
            'name': current_user.name,
            'surname': current_user.surname,
            'score': current_user.score,
            'message': 'Данные пользователя успешно обновлены'
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": f"Ошибка при обновлении данных: {str(e)}"}), 500
    finally:
        session.close()
