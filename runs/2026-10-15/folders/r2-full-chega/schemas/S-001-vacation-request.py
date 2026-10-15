# GENERATED FROM S-001-vacation-request.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import datetime as dt
from typing import Annotated, Literal, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class VacationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Annotated[str, Field(min_length=1)]
    requesterEmail: EmailStr
    requesterName: Annotated[str, Field(min_length=1, max_length=200)]
    startDate: dt.date
    endDate: dt.date
    comment: Optional[Annotated[str, Field(max_length=500)]] = None
    status: Literal["pending", "approved", "rejected", "cancelled"]
    decisionReason: Optional[Annotated[str, Field(max_length=500)]] = None
    createdAt: dt.datetime
    decidedAt: Optional[dt.datetime] = None
