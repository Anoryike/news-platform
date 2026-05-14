from pathlib import Path
from pydantic_settings import BaseSettings

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str = "secret"
    jwt_expire_minutes: int = 10080  # 7 days
    claimbuster_api_key: str = ""
    google_factcheck_api_key: str = ""
    news_api_key: str = ""
    bert_model_name: str = "GonzaloA/fake-news-bert-base-uncased"
    port: int = 8000

    class Config:
        env_file = str(_ENV_FILE)


settings = Settings()
