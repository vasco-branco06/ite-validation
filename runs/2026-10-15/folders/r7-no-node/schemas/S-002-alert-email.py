# GENERATED FROM S-002-alert-email.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import datetime as dt
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LowProduct(BaseModel):
    model_config = ConfigDict(extra="forbid")

    row: Annotated[int, Field(ge=2)]
    product: Annotated[str, Field(min_length=1)]
    quantity: float
    minimum: Annotated[float, Field(ge=0)]


class ProblemRow(BaseModel):
    model_config = ConfigDict(extra="forbid")

    row: Annotated[int, Field(ge=2)]
    product: str
    problem: Literal["quantity_invalid", "minimum_invalid", "duplicate_product"]


class AlertEmail(BaseModel):
    model_config = ConfigDict(extra="forbid")

    to: EmailStr
    date: dt.date
    low_products: list[LowProduct]
    problem_rows: list[ProblemRow]
