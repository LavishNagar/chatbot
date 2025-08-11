from pydantic import BaseModel

class PropertyPayload(BaseModel):
    price: float
    bedrooms: int
    bathrooms: int
