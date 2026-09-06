# ==============================================================================
# DESCO Smart Prepaid Meter - Database Connection Engine
# Handles MySQL (desco1) with resilient connection pooling & SQLite fallback
# ==============================================================================

import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment configuration from .env
load_dotenv()

# MySQL Database Configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "rabbi1067")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "desco1")

# Ensure special characters in database password are URL-safe
safe_password = urllib.parse.quote_plus(MYSQL_PASSWORD) if MYSQL_PASSWORD else ""

# Construct primary MySQL connection URL
if safe_password:
    DEFAULT_MYSQL_URL = f"mysql+pymysql://{MYSQL_USER}:{safe_password}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"
else:
    DEFAULT_MYSQL_URL = f"mysql+pymysql://{MYSQL_USER}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_MYSQL_URL)

# Supabase and Heroku compatibility: SQLAlchemy requires postgresql:// instead of postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    is_postgres = "postgresql" in DATABASE_URL
    is_sqlite = "sqlite" in DATABASE_URL
    is_mysql = "mysql" in DATABASE_URL

    connect_args = {}
    if is_mysql:
        connect_args["connect_timeout"] = 10
    elif is_postgres:
        # Supabase PostgreSQL supports SSL and pooling
        connect_args["connect_timeout"] = 15

    # Initialize database engine with connection pre-ping
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=1800 if (is_mysql or is_postgres) else 3600,
        pool_size=10,
        max_overflow=20,
        connect_args=connect_args
    )
    # Test connection liveness
    with engine.connect() as conn:
        pass
    db_type = "Supabase PostgreSQL" if is_postgres else "MySQL" if is_mysql else "SQLite"
    print(f"[✓] Successfully connected to {db_type} database engine.")
except Exception as e:
    print(f"[!] Notice: Could not connect to primary database ({e}).")
    print("[*] Falling back to local SQLite engine (desco_dev.db) for uninterrupted operation.")
    DATABASE_URL = "sqlite:///./desco_dev.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

# Session manager factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI Dependency Injection provider for database sessions
def get_db():
    """
    Yields a transactional database session per request, ensuring clean cleanup.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

