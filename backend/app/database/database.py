from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

db_url = settings.sync_database_url

# Ensure SQLite directory exists if using file-based SQLite (e.g. /data/roadguard.db)
if db_url.startswith("sqlite:///"):
    db_file_str = db_url.replace("sqlite:///", "")
    if db_file_str and db_file_str != ":memory:":
        Path(db_file_str).resolve().parent.mkdir(parents=True, exist_ok=True)

# SQLite requires check_same_thread=False for multithreaded FastAPI requests
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI database dependency yields a scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Creates database tables if they do not exist."""
    from backend.app.database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)

