from flask import Blueprint, request, jsonify
from uuid import uuid4
from typing import List, Optional, Dict, Any
from sqlalchemy import delete, func
from models import Quiz, Question, Options, Category, TestResult,QuestionType, SessionLocal, UserAnswer
from auth import token_required
import os
from groq import Groq
from flask_cors import CORS
import json
from datetime import datetime, timedelta


quiz_bp = Blueprint('quiz', __name__)

# Исправляем настройки CORS, чтобы разрешить запросы с localhost:3000
CORS(quiz_bp, resources={r"/quiz/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

@quiz_bp.route('/categories', methods = ['GET'])
@token_required
def get_categories(current_user):
    session = SessionLocal()

    try:
        categories = session.query(Category).all()
        categories_list = [{"id": category.id, "name": category.name} for category in categories]
        return jsonify({"categories": categories_list})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@quiz_bp.route('/quizes', methods=['GET'])
@token_required
def get_quizes(current_user):
    """
    Получение списка всех викторин с пагинацией
    """
    skip = request.args.get('skip', 0, type=int)
    limit = request.args.get('limit', 100, type=int)
    
    session = SessionLocal()
    try:
        # Получаем викторины с присоединением категорий
        quizes = session.query(Quiz, Category.name.label('category_name'))\
            .join(Category, Quiz.category_id == Category.id)\
            .offset(skip).limit(limit).all()
        total_count = session.query(Quiz).count()
        
        return jsonify({
            'quizes': [{
                'id': quiz.id,
                'title': quiz.title,
                'description': quiz.description,
                'category_id': quiz.category_id,
                'category_name': category_name
            } for quiz, category_name in quizes],
            'total_count': total_count
        })
    finally:
        session.close()

@quiz_bp.route('/quizes/<quiz_id>', methods=['GET'])
@token_required
def get_quiz_by_id(current_user, quiz_id: str):
    """
    Получение викторины по ID
    """
    session = SessionLocal()
    try:
        quiz = session.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            return jsonify({"error": "Викторина не найдена"}), 404
        
        # Получаем вопросы для викторины
        questions = session.query(Question).filter(Question.quiz_id == quiz_id).all()
        questions_data = []
        
        for question in questions:
            # Получаем варианты ответов для вопроса
            options = session.query(Options).filter(Options.question_id == question.id).all()
            options_data = [{
                'id': option.id,
                'name': option.name,
                'is_correct': option.is_correct
            } for option in options]
            
            questions_data.append({
                'id': question.id,
                'question_type': question.question_type,
                'points': question.points,
                'options': options_data,
                'question': question.question,
                'image_url': question.image_url
            })
        
        quiz_data = {
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'category_id': quiz.category_id,
            'questions': questions_data
        }
        
        return jsonify(quiz_data)
    finally:
        session.close()

@quiz_bp.route('/quizes', methods=['POST'])
@token_required
def add_quiz(current_user):
    """
    Создание новой викторины с вопросами и вариантами ответов
    """
    try:
        # Проверяем, есть ли JSON данные в запросе
        if 'quizData' in request.form:
            # Получаем JSON данные из FormData
            data = json.loads(request.form['quizData'])
            
            # Обрабатываем изображения вопросов, если они есть
            question_images = {}
            for key in request.files:
                if key.startswith('question_images['):
                    index = int(key.split('[')[1].split(']')[0])
                    file = request.files[key]
                    # Здесь должна быть логика сохранения файла и получения URL
                    # Для простоты демонстрации просто сохраним имя файла
                    question_images[index] = file.filename
            
        else:
            # Если данные отправляются как обычный JSON
            data = request.get_json()
            question_images = {}
            
        title = data.get('title')
        description = data.get('description')
        category_id = data.get('category_id')
        questions_data = data.get('questions', [])
        
        session = SessionLocal()
        try:
            # Создаем викторину
            quiz = Quiz(
                id=str(uuid4()),
                title=title,
                description=description,
                category_id=category_id
            )
            session.add(quiz)
            session.flush()  # Получаем ID викторины
            
            # Добавляем вопросы
            for i, question_data in enumerate(questions_data):
                question = Question(
                    id=str(uuid4()),
                    question_type=question_data["question_type"],
                    quiz_id=quiz.id,
                    points=question_data.get("points", 100),
                    question=question_data.get("question"),
                    image_url=question_images.get(i)  # Устанавливаем URL изображения, если есть
                )
                session.add(question)
                session.flush()  # Получаем ID вопроса
                
                # Добавляем варианты ответов для вопроса
                if "options" in question_data:
                    for option_data in question_data["options"]:
                        option = Options(
                            id=str(uuid4()),
                            question_id=question.id,
                            name=option_data["name"],
                            is_correct=option_data.get("is_correct", False)
                        )
                        session.add(option)
            
            session.commit()
            
            # Создаем словарь с данными викторины
            quiz_data = {
                'id': quiz.id,
                'title': quiz.title,
                'description': quiz.description,
                'category_id': quiz.category_id
            }
            
            return jsonify(quiz_data), 201
        finally:
            session.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@quiz_bp.route('/quizes/<quiz_id>', methods=['PUT'])
@token_required
def update_quiz(current_user, quiz_id: str):
    """
    Обновление викторины, вопросов и вариантов ответов
    """
    try:
        # Проверяем, есть ли JSON данные в запросе
        if 'quizData' in request.form:
            # Получаем JSON данные из FormData
            data = json.loads(request.form['quizData'])
            
            # Обрабатываем изображения вопросов, если они есть
            question_images = {}
            for key in request.files:
                if key.startswith('question_images['):
                    index = int(key.split('[')[1].split(']')[0])
                    file = request.files[key]
                    # Здесь должна быть логика сохранения файла и получения URL
                    # Для простоты демонстрации просто сохраним имя файла
                    question_images[index] = file.filename
            
        else:
            # Если данные отправляются как обычный JSON
            data = request.get_json()
            question_images = {}
            
        title = data.get('title')
        description = data.get('description')
        category_id = data.get('category_id')
        questions_update = data.get('questions')
        
        session = SessionLocal()
        try:
            quiz = session.query(Quiz).filter(Quiz.id == quiz_id).first()
            if not quiz:
                return jsonify({"error": "Викторина не найдена"}), 404
            
            # Обновляем данные викторины
            if title:
                quiz.title = title
            if description:
                quiz.description = description
            if category_id:
                quiz.category_id = category_id
            
            # Обновляем вопросы и варианты ответов
            if questions_update:
                for i, question_data in enumerate(questions_update):
                    if "id" in question_data and question_data["id"]:
                        # Обновляем существующий вопрос
                        question = session.query(Question).filter(Question.id == question_data["id"]).first()
                        if question:
                            if "question_type" in question_data:
                                question.question_type = question_data["question_type"]
                            if "points" in question_data:
                                question.points = question_data["points"]
                            if "question" in question_data:
                                question.question = question_data["question"]
                            
                            # Обновляем URL изображения, если оно было загружено
                            if i in question_images:
                                question.image_url = question_images[i]
                            
                            # Обновляем или добавляем варианты ответов
                            if "options" in question_data:
                                for option_data in question_data["options"]:
                                    if "id" in option_data and option_data["id"]:
                                        # Обновляем существующий вариант
                                        option = session.query(Options).filter(Options.id == option_data["id"]).first()
                                        if option:
                                            if "name" in option_data:
                                                option.name = option_data["name"]
                                            if "is_correct" in option_data:
                                                option.is_correct = option_data["is_correct"]
                                    else:
                                        # Добавляем новый вариант
                                        option = Options(
                                            id=str(uuid4()),
                                            question_id=question.id,
                                            name=option_data["name"],
                                            is_correct=option_data.get("is_correct", False)
                                        )
                                        session.add(option)
                            
                            # Удаляем указанные варианты ответов
                            if "delete_options" in question_data:
                                for option_id in question_data["delete_options"]:
                                    session.query(Options).filter(Options.id == option_id).delete()
                    else:
                        # Создаем новый вопрос
                        question = Question(
                            id=str(uuid4()),
                            question_type=question_data["question_type"],
                            quiz_id=quiz.id,
                            points=question_data.get("points", 100),
                            question=question_data.get("question"),
                            image_url=question_images.get(i)  # Устанавливаем URL изображения, если есть
                        )
                        session.add(question)
                        session.flush()  # Получаем ID вопроса
                        
                        # Добавляем варианты ответов для нового вопроса
                        if "options" in question_data:
                            for option_data in question_data["options"]:
                                option = Options(
                                    id=str(uuid4()),
                                    question_id=question.id,
                                    name=option_data["name"],
                                    is_correct=option_data.get("is_correct", False)
                                )
                                session.add(option)
            
            session.commit()
            
            # Создаем словарь с данными викторины
            quiz_data = {
                'id': quiz.id,
                'title': quiz.title,
                'description': quiz.description,
                'category_id': quiz.category_id
            }
            
            return jsonify(quiz_data)
        finally:
            session.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@quiz_bp.route('/quizes/<quiz_id>', methods=['DELETE'])
@token_required
def delete_quiz(current_user, quiz_id: str):
    """
    Удаление викторины каскадно (включая все вопросы и варианты ответов)
    """
    session = SessionLocal()
    try:
        # Получаем все вопросы для этой викторины
        questions = session.query(Question).filter(Question.quiz_id == quiz_id).all()
        
        # Удаляем все варианты ответов для каждого вопроса
        for question in questions:
            session.query(Options).filter(Options.question_id == question.id).delete()
        
        # Удаляем все вопросы
        session.query(Question).filter(Question.quiz_id == quiz_id).delete()
        
        # Удаляем саму викторину
        quiz = session.query(Quiz).filter(Quiz.id == quiz_id).delete()
        
        session.commit()
        return jsonify({"message": "Викторина успешно удалена"}), 200
    finally:
        session.close()

@quiz_bp.route('/generate-quiz', methods=['POST'])
@token_required
def generate_quiz(current_user):
    """
    Генерация викторины с использованием LLM на основе текста и категории
    """
    session = SessionLocal()
    try:
        data = request.json
        if not data or 'text' not in data or 'category_id' not in data:
            return jsonify({"error": "Необходимо предоставить текст и ID категории"}), 400
        
        text = data['text']
        category_id = data['category_id']
        
        # Проверяем существование категории
        category = session.query(Category).filter(Category.id == category_id).first()
        if not category:
            return jsonify({"error": "Указанная категория не существует"}), 404
        
        # Используем Groq для генерации викторины
        
        client = Groq(
            api_key=os.environ.get("GROQ_API_KEY", "")
        )
        chat_completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "system",
                    "content": f"""Ты генератор викторин. Пользователь даст тебе тему, статью или документ. На основе этого сгенерируй 5 вопросов для категории "{category.name}". Возвращай только JSON в таком формате:
{{
  "quizTitle": "Название викторины",
  "questions": [
    {{
      "type": "single",
      "question": "Вопрос?",
      "options": ["Вариант1", "Вариант2", "Вариант3", "Вариант4"],
      "correct": [2],
      "points": 1
    }},
    {{
      "type": "multiple",
      "question": "Вопрос с несколькими ответами?",
      "options": ["A", "B", "C", "D"],
      "correct": [0, 3],
      "points": 2
    }},
    {{
      "type": "text",
      "question": "Открытый вопрос?",
      "answer": "Правильный ответ",
      "points": 2
    }}
  ]
}}"""
                },
                {
                    "role": "user",
                    "content": f"Категория: {category.name}. Текст: {text}"
                }
            ]
        )
        
        result = chat_completion.choices[0].message.content
        
        # Парсим JSON результат
        quiz_data = json.loads(result)
        
        # Создаем новую викторину в базе данных
        new_quiz = Quiz(
            id=str(uuid4()),
            title=quiz_data["quizTitle"],
            description=f"Автоматически сгенерированная викторина на основе текста. Категория: {category.name}",
            category_id=category_id
        )
        session.add(new_quiz)
        session.flush()
        
        # Добавляем вопросы и варианты ответов
        for q_data in quiz_data["questions"]:
            question_type = None
            if q_data["type"] == "single":
                question_type = QuestionType.SINGLE
            elif q_data["type"] == "multiple":
                question_type = QuestionType.MULTIPLE
            elif q_data["type"] == "text":
                question_type = QuestionType.TEXT_ANSWER
                
            question = Question(
                id=str(uuid4()),
                question_type=question_type,
                quiz_id=new_quiz.id,
                points=q_data.get("points", 1),
                question=q_data.get("question")
            )
            session.add(question)
            session.flush()
            
            # Добавляем варианты ответов для вопросов с вариантами
            if q_data["type"] in ["single", "multiple"] and "options" in q_data:
                for i, option_text in enumerate(q_data["options"]):
                    is_correct = i in q_data["correct"]
                    option = Options(
                        id=str(uuid4()),
                        question_id=question.id,
                        name=option_text,
                        is_correct=is_correct
                    )
                    session.add(option)
        
        session.commit()
        
        return jsonify({
            "id": new_quiz.id,
            "title": new_quiz.title,
            "description": new_quiz.description,
            "category_id": new_quiz.category_id,
            "generated_data": quiz_data
        })
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@quiz_bp.route('/submit-answers', methods=['POST'])
@token_required
def submit_answers(current_user):
    """
    Сохраняет ответы пользователя и результаты теста в базе данных
    """
    session = SessionLocal()
    try:
        data = request.get_json()
        
        if not data or 'quiz_id' not in data or 'answers' not in data:
            return jsonify({"error": "Необходимо предоставить ID викторины и ответы"}), 400
            
        quiz_id = data['quiz_id']
        answers = data['answers']
        total_score = data.get('total_score', 0)
        
        # Проверяем существование викторины
        quiz = session.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            return jsonify({"error": "Викторина не найдена"}), 404
            
        # Создаем запись о результате теста
        test_result = TestResult(
            id=str(uuid4()),
            user_id=current_user.id,
            score=total_score,
            completed_at=datetime.utcnow()
        )
        session.add(test_result)
        
        # Сохраняем ответы пользователя
        for answer in answers:
            question_id = answer.get('question_id')
            option_ids = answer.get('option_ids', [])
            text_answer = answer.get('text_answer')
            
            # Если это вопрос с текстовым ответом
            if text_answer is not None:
                user_answer = UserAnswer(
                    id=str(uuid4()),
                    user_id=current_user.id,
                    question_id=question_id,
                    text_answer=text_answer,
                    option_id=None
                )
                session.add(user_answer)
            
            # Если это вопрос с выбором вариантов
            for option_id in option_ids:
                user_answer = UserAnswer(
                    id=str(uuid4()),
                    user_id=current_user.id,
                    question_id=question_id,
                    text_answer=None,
                    option_id=option_id
                )
                session.add(user_answer)
        
        # Обновляем счет пользователя
        current_user.score += total_score
        
        session.commit()
        
        return jsonify({
            "message": "Ответы успешно сохранены",
            "test_result_id": test_result.id,
            "updated_score": current_user.score
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@quiz_bp.route('/user-tests-count', methods=['GET'])
@token_required
def get_user_tests_count(current_user):
    session = SessionLocal()
    try:
        # Подсчитываем количество тестов, которые прошел пользователь
        tests_count = session.query(TestResult).filter_by(user_id=current_user.id).count()
        return jsonify({"tests_count": tests_count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@quiz_bp.route('/user-activity', methods=['GET'])
@token_required
def get_user_activity(current_user):
    """
    Возвращает активность пользователя по дням за последние 90 дней
    """
    session = SessionLocal()
    try:
        days = 90
        today = datetime.utcnow().date()
        start_date = today - timedelta(days=days-1)

        # Получаем количество тестов по дням
        results = (
            session.query(
                func.date(TestResult.completed_at).label('date'),
                func.count(TestResult.id).label('count')
            )
            .filter(
                TestResult.user_id == current_user.id,
                TestResult.completed_at >= start_date
            )
            .group_by(func.date(TestResult.completed_at))
            .all()
        )

        # Преобразуем в словарь для быстрого поиска
        activity_map = {str(row.date): row.count for row in results}

        # Формируем полный список дней
        activity = []
        for i in range(days):
            day = start_date + timedelta(days=i)
            day_str = day.isoformat()
            activity.append({
                "date": day_str,
                "count": activity_map.get(day_str, 0)
            })

        return jsonify(activity)
    finally:
        session.close()

