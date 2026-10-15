# GENERATED FROM S-003-jira-ticket.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import datetime as dt
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field


class JiraTicket(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project_key: Annotated[str, Field(pattern="^[A-Z][A-Z0-9]{1,9}$")]
    issue_type: Literal["Bug"]
    title: Annotated[str, Field(min_length=5, max_length=120)]
    summary: Annotated[str, Field(min_length=10, max_length=1000)]
    log_excerpt: Annotated[str, Field(min_length=1, max_length=2000)]
    first_seen: dt.datetime
    occurrences: Annotated[int, Field(ge=1)]
    priority: Literal["Highest", "High", "Medium", "Low"]
    fingerprint: Annotated[str, Field(pattern="^[a-z0-9-]{3,80}$")] = Field(description="Also added to the issue as a label.")
