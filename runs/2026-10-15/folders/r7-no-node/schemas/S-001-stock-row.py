# GENERATED FROM S-001-stock-row.schema.json BY ITE 0.1.0 - DO NOT EDIT. Re-run compile.
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field


class StockRow(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product: Annotated[str, Field(min_length=1)] = Field(description="Product name, column A")
    quantity: float = Field(description="Units in stock now, column B")
    minimum: Annotated[float, Field(ge=0)] = Field(description="Alert threshold, column C")
