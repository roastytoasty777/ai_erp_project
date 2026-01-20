from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List
import pandas as pd
import pytesseract
from PIL import Image, ImageDraw, ImageFont
import io
import re
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException

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

class DBStock(Base):
    __tablename__ = "stock"
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, unique=True, index=True)
    current_quantity = Column(Integer, default=0)

class ItemUpdate(BaseModel):
    quantity: int
    price: float

class StockUpdate(BaseModel):
    item_name: str
    current_quantity: int

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
    allow_origins=["*"], 
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
    
    # Get stock data
    stock_items = db.query(DBStock).all()
    stock_dict = {item.item_name: item.current_quantity for item in stock_items}
    
    # Group by item_name and aggregate sales
    items_dict = {}
    for order in orders:
        if order.item_name not in items_dict:
            items_dict[order.item_name] = {
                "item_name": order.item_name,
                "quantity": 0,
                "price": order.price,
                "total_price": 0
            }
        items_dict[order.item_name]["quantity"] += order.quantity
        items_dict[order.item_name]["total_price"] += order.quantity * order.price
    
    # Convert to list
    summary_list = list(items_dict.values())
    
    # Calculate total quantity for demand probability
    total_qty = sum(item["quantity"] for item in summary_list)
    
    # Add demand probability and stock level
    for item in summary_list:
        item["demand_probability"] = item["quantity"] / total_qty if total_qty > 0 else 0
        # Get stock level from database, default to 0 if not found
        item["stock_level"] = stock_dict.get(item["item_name"], 0)
        
        # Calculate risk based on stock level vs expected sales (1.5x multiplier)
        risk_threshold = item["quantity"] * 1.5
        if item["stock_level"] < risk_threshold:
            item["inventory_risk"] = "CRITICAL"
        else:
            item["inventory_risk"] = "STABLE"
    
    # Find item with highest demand for "Top Performer" badge
    if summary_list:
        max_demand_item = max(summary_list, key=lambda x: x["demand_probability"])
        for item in summary_list:
            if item["item_name"] == max_demand_item["item_name"] and item["inventory_risk"] == "STABLE":
                item["sales_tier"] = "Top Performer"
            else:
                item["sales_tier"] = "Emerging" if item["inventory_risk"] == "STABLE" else "At Risk"
    
    return summary_list

@app.post("/upload-receipt/")
async def upload_receipt(file: UploadFile = File(...), db: Session = Depends(get_db)):
    request_object_content = await file.read()
    img = Image.open(io.BytesIO(request_object_content))
    text = pytesseract.image_to_string(img)
    lines = text.split('\n')
    
    detected_items = []
    
    for line in lines:
        line = line.strip()
        if not line: continue
        if "TOTAL" in line or "Item" in line: continue
        
        # Regex to find: [Name] [Qty] [Price]
        # Looks for "Name 123 12.34" pattern
        # (.+?) = Name (non-greedy)
        # \s+ = Spaces
        # (\d+) = Quantity (digits)
        # \s+ = Spaces
        # (\d+\.\d{2}) = Price (digits.digits)
        match = re.search(r'(.+?)\s+(\d+)\s+(\d+\.\d{2})', line)
        if match:
            name = match.group(1).strip()
            qty = int(match.group(2))
            price = float(match.group(3))
            
            # Save to Database
            new_order = DBOrder(item_name=name, quantity=qty, price=price)
            db.add(new_order)
            detected_items.append({"name": name, "qty": qty, "price": price})
    
    db.commit()

    return {
        "filename": file.filename,
        "extracted_text": text,
        "detected_item": f"{len(detected_items)} items detected",
        "detected_items": detected_items,
        "ai_note": "Logic enhanced to parse lines and save to DB automatically."
    }

@app.delete("/orders/{item_name}")
def delete_item(item_name: str, db: Session = Depends(get_db)):
    items = db.query(DBOrder).filter(DBOrder.item_name == item_name).all()
    if not items:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for item in items:
        db.delete(item)
    db.commit()
    return {"message": f"Deleted {item_name}"}

@app.put("/update-item/{item_name}")
def update_item(item_name: str, update_data: ItemUpdate, db: Session = Depends(get_db)):
    items = db.query(DBOrder).filter(DBOrder.item_name == item_name).all()
    if not items:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Calculate the difference in total quantity
    current_total = sum(item.quantity for item in items)
    quantity_difference = update_data.quantity - current_total
    
    items[0].quantity = update_data.quantity
    items[0].price = update_data.price
    
    for item in items[1:]:
        db.delete(item)
    
    db.commit()
    return {"message": f"Updated {item_name}", "quantity": update_data.quantity, "price": update_data.price}

@app.put("/update-stock/{item_name}")
def update_stock(item_name: str, update_data: StockUpdate, db: Session = Depends(get_db)):
    """
    Update or create stock level for an item.
    """
    stock = db.query(DBStock).filter(DBStock.item_name == item_name).first()
    
    if stock:
        stock.current_quantity = update_data.current_quantity
    else:
        stock = DBStock(item_name=item_name, current_quantity=update_data.current_quantity)
        db.add(stock)
    
    db.commit()
    db.refresh(stock)
    return {"message": f"Stock updated for {item_name}", "current_quantity": stock.current_quantity}

@app.get("/dashboard/chart-data/")
def get_chart_data(db: Session = Depends(get_db)):
    """
    Returns chart data with revenue and quantity for each item.
    Output: List of objects with name, revenue, and quantity.
    """
    orders = db.query(DBOrder).all()
    if not orders:
        return []
    
    # Group by item_name and aggregate
    items_dict = {}
    for order in orders:
        if order.item_name not in items_dict:
            items_dict[order.item_name] = {
                "name": order.item_name,
                "quantity": 0,
                "revenue": 0.0
            }
        items_dict[order.item_name]["quantity"] += order.quantity
        items_dict[order.item_name]["revenue"] += order.quantity * order.price
    
    # Convert to list and sort by revenue descending
    chart_data = list(items_dict.values())
    chart_data.sort(key=lambda x: x["revenue"], reverse=True)
    
    return chart_data

@app.get("/dashboard/sales-insights/")
def get_sales_insights(db: Session = Depends(get_db)):
    """
    Returns business insights using Pandas analysis:
    - The Star: Item with highest total revenue
    - The Trend: Items that appeared in most recent receipts
    - Revenue Concentration: Checks if top 20% of items generate 80% of revenue (Pareto)
    """
    orders = db.query(DBOrder).all()
    if not orders:
        return {
            "insights": [
                {"title": "No Data", "description": "Insufficient data for business insights."}
            ]
        }
    
    # Create DataFrame from orders
    df = pd.DataFrame([
        {"item_name": o.item_name, "quantity": o.quantity, "price": o.price, "id": o.id}
        for o in orders
    ])
    
    # Calculate revenue per order
    df["revenue"] = df["quantity"] * df["price"]
    
    # Aggregate by item_name
    item_stats = df.groupby("item_name").agg({
        "quantity": "sum",
        "revenue": "sum",
        "id": "count"  # count of receipts
    }).reset_index()
    item_stats.columns = ["item_name", "total_quantity", "total_revenue", "receipt_count"]
    
    insights = []
    
    # Insight 1: The Star - Highest revenue item
    star_item = item_stats.loc[item_stats["total_revenue"].idxmax()]
    insights.append({
        "title": "The Star",
        "description": f"{star_item['item_name']} is your top revenue generator with ${star_item['total_revenue']:.2f} in total sales."
    })
    
    # Insight 2: The Trend - Items in most recent receipts
    recent_orders = df.nlargest(5, "id")  # Last 5 orders
    trend_items = recent_orders["item_name"].value_counts().head(3).index.tolist()
    trend_description = ", ".join(trend_items) if trend_items else "No recent trend data"
    insights.append({
        "title": "The Trend",
        "description": f"Your recent customers are buying: {trend_description}"
    })
    
    # Insight 3: Revenue Concentration - Pareto Principle
    item_stats_sorted = item_stats.sort_values("total_revenue", ascending=False)
    total_revenue = item_stats_sorted["total_revenue"].sum()
    cumulative_revenue = 0
    items_for_80_percent = 0
    
    for revenue in item_stats_sorted["total_revenue"]:
        cumulative_revenue += revenue
        items_for_80_percent += 1
        if cumulative_revenue >= total_revenue * 0.8:
            break
    
    percent_items = (items_for_80_percent / len(item_stats)) * 100
    is_concentrated = percent_items <= 20
    
    if is_concentrated:
        insights.append({
            "title": "Revenue Concentration (Pareto)",
            "description": f"✓ Pareto Principle confirmed! Top {percent_items:.1f}% of items ({items_for_80_percent}/{len(item_stats)}) generate 80% of revenue. Focus on these key products."
        })
    else:
        insights.append({
            "title": "Revenue Distribution",
            "description": f"Your revenue is well-distributed. Top {percent_items:.1f}% of items ({items_for_80_percent}/{len(item_stats)}) generate 80% of revenue."
        })
    
    return {
        "insights": insights,
        "summary": {
            "total_items": len(item_stats),
            "total_revenue": float(total_revenue),
            "total_quantity": int(item_stats["total_quantity"].sum())
        }
    }

# Receipt Generation Models
class ReceiptItem(BaseModel):
    name: str
    qty: int
    price: float

class ReceiptRequest(BaseModel):
    store_name: str
    items: List[ReceiptItem]
    total: float

@app.post("/generate-receipt/")
async def generate_receipt(request: ReceiptRequest):
    # Create image
    width = 400
    # Estimate height: header + items * line_height + total + footer
    line_height = 30
    header_height = 100
    footer_height = 100
    height = header_height + (len(request.items) * line_height) + footer_height
    
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)
    
    # Try to load a font, otherwise default
    try:
        # Monospace font if possible. "consola" is common on Windows.
        font = ImageFont.truetype("consola.ttf", 15)
        title_font = ImageFont.truetype("consola.ttf", 20)
    except IOError:
        font = ImageFont.load_default()
        title_font = ImageFont.load_default()

    y = 20
    # Draw Store Name
    draw.text((width/2, y), request.store_name, font=title_font, fill="black", anchor="ms")
    y += 50
    
    # Draw Headers
    draw.text((20, y), "Item", font=font, fill="black")
    draw.text((250, y), "Qty", font=font, fill="black")
    draw.text((320, y), "Price", font=font, fill="black")
    y += 30
    draw.line((20, y, 380, y), fill="black", width=2)
    y += 20 # Increased padding to prevent collision

    # Draw Items
    for item in request.items:
        # Truncate long names
        name = (item.name[:25] + '..') if len(item.name) > 25 else item.name
        draw.text((20, y), name, font=font, fill="black") # Default anchor Top-Left
        draw.text((260, y), str(item.qty), font=font, fill="black", anchor="ra") # Right Ascender (Top-alignedish)
        draw.text((380, y), f"{item.price:.2f}", font=font, fill="black", anchor="ra")
        y += line_height

    y += 10
    draw.line((20, y, 380, y), fill="black", width=2)
    y += 20
    
    # Draw Total
    draw.text((20, y), "TOTAL", font=title_font, fill="black")
    draw.text((380, y), f"${request.total:.2f}", font=title_font, fill="black", anchor="rs")
    
    # Save to buffer
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    return StreamingResponse(img_byte_arr, media_type="image/png")