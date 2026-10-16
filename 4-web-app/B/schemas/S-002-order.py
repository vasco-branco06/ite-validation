# GENERATED FROM S-002-order.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
import datetime as dt
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field


class Order(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Annotated[int, Field(ge=1)] = Field(description="Database row id")
    customer_name: Annotated[str, Field(min_length=1, pattern="\\S")]
    phone: Annotated[str, Field(pattern="^[0-9 +]*[0-9][0-9 +]*$")]
    cake: Annotated[str, Field(min_length=1, pattern="\\S")]
    pickup_date: dt.date
    pickup_time: Optional[Annotated[str, Field(pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$")]]
    picked_up: bool = Field(description="True after Picked up is clicked")
    created_at: dt.datetime
