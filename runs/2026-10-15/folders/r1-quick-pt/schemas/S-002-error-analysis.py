# GENERATED FROM S-002-error-analysis.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field


class DistinctError(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fingerprint: Annotated[str, Field(pattern="^[a-z0-9-]{3,80}$")] = Field(description="Stable kebab-case key for the error, without numbers that change between occurrences.")
    title: Annotated[str, Field(min_length=5, max_length=120)]
    summary: Annotated[str, Field(min_length=10, max_length=1000)]
    priority: Literal["Highest", "High", "Medium", "Low"]
    event_indexes: Annotated[list[Annotated[int, Field(ge=0)]], Field(min_length=1)] = Field(description="Positions of the input events that belong to this error.")


class ErrorAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    errors: list[DistinctError]
