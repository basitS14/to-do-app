import os
from dotenv import load_dotenv

load_dotenv()



class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') 
    POSTGRES_DB = os.environ.get('POSTGRES_DB') 
    POSTGRES_USER = os.environ.get('POSTGRES_USER') 
    POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD') 
    POSTGRES_HOST = os.environ.get('POSTGRES_HOST') 

    SQLALCHEMY_DATABASE_URI = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:5432/{POSTGRES_DB}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session Configuration
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_KEY_PREFIX = 'todo_app_'
    PERMANENT_SESSION_LIFETIME = 3600  # 1 hour


    
    # CORS Configuration
    CORS_ORIGINS=['*']  # Nginx acts as reverse proxy, CORS not needed

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    # For local development with separate frontend/backend
    CORS_ORIGINS=['http://localhost:3000', 'http://localhost:80', 'http://localhost']

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SESSION_TYPE = 'filesystem'  # In production, use 'redis' or 'sqlalchemy'

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://todouser:todopass@postgres:5432/tododb'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
