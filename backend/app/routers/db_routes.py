from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..config import get_db

db_router = APIRouter(
    prefix="",
    tags=["history"],
    dependencies=[Depends(get_db)]
)


