# GENERATED FROM S-001-error-event.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import datetime as dt
from typing import Annotated, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class ErrorEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    file: Annotated[str, Field(min_length=1)] = Field(description="Log file name inside LOG_DIR.")
    line_number: Annotated[int, Field(ge=1)]
    level: Literal["ERROR", "FATAL", "CRITICAL"]
    message: Annotated[str, Field(min_length=1, max_length=4000)]
    stack: Optional[Annotated[str, Field(max_length=8000)]] = Field(default=None, description="Stack-trace lines after the error line, empty when none.")
    log_timestamp: Optional[str] = Field(default=None, description="Timestamp text as written in the log, if any.")
    seen_at: dt.datetime = Field(description="When the agent read the line.")
