from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import StatsParamsError
from app.db.database import get_db
from app.models.user import User
from app.schemas.stats import StatsOut
from app.services.stats_service import StatsService

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsOut)
def get_stats(
    period: Literal["month", "season", "year"] = Query(...),
    year: int = Query(..., ge=1900, le=2100),
    month: int | None = Query(default=None, ge=1, le=12),
    season: Literal["winter", "spring", "summer", "autumn"] | None = Query(
        default=None
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return StatsService(db).get_stats(
            current_user.id, period, year, month, season
        )
    except StatsParamsError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
