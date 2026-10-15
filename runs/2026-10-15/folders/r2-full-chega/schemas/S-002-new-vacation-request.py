# GENERATED FROM S-002-new-vacation-request.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import datetime as dt
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field


class NewVacationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    startDate: dt.date
    endDate: dt.date
    comment: Optional[Annotated[str, Field(max_length=500)]] = None
