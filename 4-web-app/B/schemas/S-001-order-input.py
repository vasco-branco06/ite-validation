# GENERATED FROM S-001-order-input.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import datetime as dt
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field


class OrderInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    customer_name: Annotated[str, Field(min_length=1, pattern="\\S")] = Field(description="Customer name; not blank")
    phone: Annotated[str, Field(pattern="^[0-9 +]*[0-9][0-9 +]*$")] = Field(description="Digits, spaces and + only, at least one digit")
    cake: Annotated[str, Field(min_length=1, pattern="\\S")] = Field(description="Free text: which cake, size, message")
    pickup_date: dt.date = Field(description="Pickup date, YYYY-MM-DD; not before today")
    pickup_time: Optional[Annotated[str, Field(pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$")]] = Field(default=None, description="Optional pickup time, HH:MM")
