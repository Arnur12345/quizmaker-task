from flask import Flask
from flask_cors import CORS
from config import Config
from models import SessionLocal
from auth import auth_bp
from quiz import quiz_bp 

def create_app():
    app=Flask(__name__)
    app.config.from_object(Config)
    
    # Настраиваем CORS для всего приложения
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "https://quizmaker-nfac.vercel.app"]}})

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
