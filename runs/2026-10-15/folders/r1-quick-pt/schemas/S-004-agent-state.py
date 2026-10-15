# GENERATED FROM S-004-agent-state.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import datetime as dt
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field


class FileOffset(BaseModel):
    model_config = ConfigDict(extra="forbid")

    file: Annotated[str, Field(min_length=1)]
    offset: Annotated[int, Field(ge=0)] = Field(description="Byte position read up to.")


class KnownError(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fingerprint: Annotated[str, Field(pattern="^[a-z0-9-]{3,80}$")]
    jira_key: Annotated[str, Field(pattern="^[A-Z][A-Z0-9]{1,9}-[0-9]+$")]
    created_at: dt.datetime


class QueuedTicket(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fingerprint: Annotated[str, Field(pattern="^[a-z0-9-]{3,80}$")]
    attempts: Annotated[int, Field(ge=0, le=3)]
    last_error: Optional[str] = None
    payload_json: Annotated[str, Field(min_length=2)] = Field(description="The S-003 ticket, serialised as JSON.")


class AgentState(BaseModel):
    model_config = ConfigDict(extra="forbid")

    offsets: list[FileOffset]
    known: list[KnownError]
    queue: list[QueuedTicket]
