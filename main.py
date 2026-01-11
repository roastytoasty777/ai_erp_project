from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Order(BaseModel):
    item_name: str
    quantity: int
    price: float
    status: Optional[str] = "pending"

@app.get("/")
def read_root():
    return {"message": "Welcome to the Order Management API"}

@app.post("/create-order/")
def create_order(order: Order):
    total_cost = order.quantity * order.price
    return {
        "status": "Order Created",
        "item": order.item_name,
        "total_cost": total_cost,
        "ai_note": "Ready for predictive analysis"
    }