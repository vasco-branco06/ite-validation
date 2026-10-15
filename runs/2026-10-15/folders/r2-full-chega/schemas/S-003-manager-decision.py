# GENERATED FROM S-003-manager-decision.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
from typing import Annotated, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class ManagerDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    requestId: Annotated[str, Field(min_length=1)]
    decision: Literal["approve", "reject"]
    reason: Optional[Annotated[str, Field(max_length=500)]] = None
