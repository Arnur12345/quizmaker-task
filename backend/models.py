from uuid import uuid4
from enum import Enum
from sqlalchemy import create_engine, Column, String,Integer, DateTime, ForeignKey, Enum as dbenum, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from config import Config

engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
Base = declarative_base()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class QuestionType(str,Enum):
    SINGLE = "SINGLE"
    MULTIPLE = "MULTIPLE"
    TEXT_ANSWER = "TEXT_ANSWER"


class User(Base):
    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    login = Column(String(80), unique=True, nullable=False)
    password = Column(String(128), unique=False, nullable=False)
    name = Column(String(20))
    surname = Column(String(20))
    score = Column(Integer, default=0)

class Category(Base):
    __tablename__ = 'category'

    id = Column(String(32), primary_key=True,nullable=False, default=lambda:uuid4())
    name = Column(String(36), nullable = False)

class Quiz(Base):
    __tablename__ = 'quiz'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title = Column(String(56), nullable=False)
    description = Column(Text)
    category_id = Column(String(36), ForeignKey('category.id'), nullable=False)
    image_url = Column(String(500), nullable=True, default="https://res.cloudinary.com/dq2pbzrtu/image/upload/v1746344368/localhost-file-not-found_w9r4qz.jpg")


class Question(Base):
    __tablename__ = 'questions'

    id = Column(String(36), primary_key=True, nullable=False, default=lambda:uuid4())
    question_type = Column(dbenum(QuestionType), nullable=False)
    quiz_id = Column(String(36), ForeignKey('quiz.id'), nullable=False)
    points = Column(Integer, nullable=False, default=100)
    question = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)

class Options(Base):
    __tablename__ = 'options'

    id = Column(String(36), primary_key=True, nullable=False, default=lambda:uuid4())
    question_id = Column(String(36), ForeignKey('questions.id'))
    name = Column(String(100),nullable=False)
    is_correct = Column(Boolean, default=False)

class UserAnswer(Base):
    __tablename__ = 'user_answer'

    id = Column(String(36), primary_key=True, nullable=False, default=lambda:uuid4())
    user_id = Column(String(36), ForeignKey('users.id'))
    question_id = Column(String(36), ForeignKey('questions.id'))
    text_answer = Column(Text, nullable=True)
    option_id = Column(String(36), ForeignKey('options.id'), nullable=True)

class TestResult(Base):
    __tablename__ = 'test_result'

    id = Column(String(36), primary_key=True, nullable=False, default=lambda:uuid4())
    user_id = Column(String(36), ForeignKey('users.id'))
    score = Column(Integer)
    completed_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False)

Base.metadata.create_all(engine) 