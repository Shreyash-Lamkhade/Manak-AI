"""Pydantic response schemas for the MANAK-AI API."""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from pydantic import ConfigDict


class SearchRequest(BaseModel):
    query: str


class CertificationCheckRequest(BaseModel):
    product_name: str


class ReviewCreate(BaseModel):
    request_id: str
    is_number: str
    decision: str  # accept, reject, flag


class NormativeReference(BaseModel):
    is_number: str
    title: Optional[str] = None
    category: Optional[str] = None


class RelatedStandard(BaseModel):
    is_number: str
    title: Optional[str] = None
    category: Optional[str] = None


class Evidence(BaseModel):
    source_excerpt: str
    matched_specifications: List[Dict[str, str]]
    overlapping_keywords: List[str]


class Amendment(BaseModel):
    amendment_number: str
    date: str
    description: str


class VersionInfo(BaseModel):
    version: Optional[str] = None
    last_amended: Optional[str] = None
    amendment_history: List[Amendment] = []


class StandardResult(BaseModel):
    rank: int
    is_number: str
    title: str
    category: str
    sub_category: Optional[str] = None
    scope: str
    relevance_score: float
    similarity_score: float
    keyword_score: float
    specification_score: float
    is_qco_mandatory: bool
    qco_enforcement_date: Optional[str] = None
    evidence: Evidence
    explanation: str
    normative_references: List[NormativeReference]
    related_standards: List[RelatedStandard]
    version_info: VersionInfo
    certification: Dict[str, Any]


class SearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    request_id: str
    query: str
    abstained: bool
    abstention_reason: Optional[str] = None
    results: List[StandardResult] = []
    threshold: Optional[float] = None
