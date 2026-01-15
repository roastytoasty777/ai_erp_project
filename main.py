from fastapi import FastAPI, Depends, UploadFile, File
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List
import pandas as pd
import pytesseract
from PIL import Image
import io
from fastapi.middleware.cors import CORSMiddleware

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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes and logic
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

@app.get("/dashboard/analytics/")
def get_analytics(db: Session = Depends(get_db)):
    orders = db.query(DBOrder).all()
    if not orders:
        return {"message": "Insufficient data for AI analytics"}
    data = [{"item_name": o.item_name, "qty": o.quantity} for o in orders]
    df = pd.DataFrame(data)

    total_qty = df['qty'].sum()
    summary = df.groupby("item_name")["qty"].sum().reset_index()
    summary["demand_probability"] = (summary["qty"] / total_qty)

    summary["inventory_risk"] = summary["demand_probability"].apply(
        lambda p: "CRITICAL" if p > 0.6 else "STABLE"
    )

    return summary.to_dict(orient="records")

@app.post("/upload-receipt/")
async def upload_receipt(file: UploadFile = File(...), db: Session = Depends(get_db)):
    request_object_content = await file.read()
    img = Image.open(io.BytesIO(request_object_content))
    text = pytesseract.image_to_string(img)
    lines = text.split('\n')
    extracted_item = lines[0] if lines else "Unknown Item"

    return {
        "filename": file.filename,
        "extracted_text": text,
        "detected_item": extracted_item,
        "ai_note": "In a full version, we'd parse qty/price and save to DB"
    }