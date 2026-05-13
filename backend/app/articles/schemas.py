from datetime import datetime
from pydantic import BaseModel


class ArticleCreate(BaseModel):
    title: str
    body: str


class AuthorOut(BaseModel):
    id: int
    email: str
    model_config = {"from_attributes": True}


class AiScoreOut(BaseModel):
    score: float
    bertScore: float | None = None
    claimbusterScore: float | None = None
    factcheckScore: float | None = None
    explanation: str | None = None

    model_config = {"from_attributes": True, "populate_by_name": True}

    @classmethod
    def from_orm_obj(cls, obj):
        return cls(
            score=obj.score,
            bertScore=obj.bert_score,
            claimbusterScore=obj.claimbuster_score,
            factcheckScore=obj.factcheck_score,
            explanation=obj.explanation,
        )


class ArticleOut(BaseModel):
    id: int
    title: str
    body: str
    status: str
    createdAt: datetime
    author: AuthorOut
    aiScore: AiScoreOut | None = None

    model_config = {"from_attributes": True}


class ArticlesPage(BaseModel):
    data: list[ArticleOut]
    total: int
