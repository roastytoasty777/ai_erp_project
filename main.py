from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List

# Database setup
DATABASE_URL = "sqlite:///./erp_database.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBOrder(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String)
    quantity = Column(Integer)
    price = Column(Float)

Base.metadata.create_all(bind=engine)

class OrderCreate(BaseModel):
    item_name: str
    quantity: int
    price: float

class OrderResponse(OrderCreate):
    id: int

    class Config:
        from_attributes = True

# App setup
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Order Management API"}

@app.post("/create-order/")
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    new_db_order = DBOrder(
        item_name=order.item_name, 
        quantity=order.quantity, 
        price=order.price
    )
    db.add(new_db_order)
    db.commit()
    db.refresh(new_db_order)
    return {"status": "Order Saved to Database", "id": new_db_order.id}

@app.get("/orders/", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    orders = db.query(DBOrder).all()
    return orders