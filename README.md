# AI-ERP Vision 🚀

A modern, full-stack Enterprise Resource Planning (ERP) system with **AI-powered analytics, stock management, and business insights**. Built with **FastAPI** backend and **React** frontend, featuring real-time risk assessment and intelligent inventory tracking.

## 🌟 Key Features

### 📦 **Stock Management System**
* **Real-time Risk Assessment**: Automatically calculates inventory risk based on stock levels vs. sales data
* **Warehouse Stock Tracking**: Monitor actual inventory counts alongside sales data
* **CRITICAL/STABLE Status**: 
  - CRITICAL: Stock level < (units sold × 1.5)
  - STABLE: Stock level ≥ (units sold × 1.5)
* **Dual-column View**: See both "Sales Tier" and "Risk Status" at a glance

### 📊 **Business Intelligence Dashboard**
* **AI Sales Insights**: Powered by Pandas data analysis
  - ⭐ **The Star**: Identifies top revenue-generating products
  - 📈 **The Trend**: Shows items trending in recent purchases
  - 📊 **Pareto Analysis**: Validates if top 20% of items generate 80% of revenue
* **Interactive Charts**: Real-time revenue and quantity distribution visualizations
* **Sales Tier Badges**: "Top Performer", "Emerging", "At Risk" classifications

### 🎯 **Order Management**
* **Full CRUD Operations**: Create, Read, Update, Delete inventory items
* **Inline Editing**: Edit quantity, price, and stock levels directly in the table
* **Manual Entry**: Quick-add items with sales and stock data
* **Probabilistic Analytics**: Automatic demand probability calculations

### 🔍 **AI Vision (OCR)**
* **Receipt Scanning**: Extract text from uploaded receipt images
* **Tesseract OCR Integration**: AI-powered text recognition
* **Smart Detection**: Automatically parse item information

### 🎨 **Modern UI/UX**
* **Dark Theme**: Professional gradient-based design
* **Responsive Layout**: Mobile-friendly interface
* **Real-time Updates**: Instant data synchronization
* **Search & Filter**: Quick item lookup with live results
* **Centered Alignment**: Clean, organized table display

## 🛠️ Technical Stack

### Backend
* **FastAPI**: High-performance Python web framework
* **SQLAlchemy ORM**: Database abstraction layer
* **SQLite**: Lightweight, file-based database
* **Pandas**: Data analysis and manipulation
* **Pydantic**: Data validation and serialization

### Frontend
* **React**: Component-based UI framework
* **Recharts**: Beautiful, responsive charts
* **CSS3**: Modern styling with gradients and animations
* **Fetch API**: RESTful API communication

### AI/ML
* **Tesseract OCR**: Optical character recognition
* **Pillow (PIL)**: Image processing
* **Pandas Analytics**: Statistical analysis and insights

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 16+ (for frontend)
* Tesseract OCR Engine installed on your system

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/roastytoasty777/ai_erp_project.git
   cd ai_erp_project
   ```

2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy pandas pytesseract pillow python-multipart
   ```

3. Start the backend server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd erp-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at: `http://localhost:5173`

### API Documentation
Interactive API docs available at: `http://localhost:8000/docs`

## 📊 Analytics & Risk Logic

### Demand Probability
The system calculates demand probability for each item as:
<div align="center">
  <img src="https://latex.codecogs.com/svg.latex?\color{white}\Large&space;P(\text{item})=\frac{\sum\text{Quantity}_{\text{item}}}{\sum\text{Quantity}_{\text{total}}}" title="Probability Formula" alt="P(item) = sum(Quantity_item) / sum(Quantity_total)" />
</div>

### Risk Assessment
Stock risk is determined by comparing warehouse inventory to sales velocity:
- **Risk Threshold** = Units Sold × 1.5
- **CRITICAL**: Current Stock < Risk Threshold
- **STABLE**: Current Stock ≥ Risk Threshold

### Sales Tier Classification
- **Top Performer**: Highest demand probability + STABLE stock
- **Emerging**: Lower demand but STABLE stock
- **At Risk**: Any item with CRITICAL stock status

## 🔧 API Endpoints

### Orders
- `POST /create-order/` - Create new order
- `GET /orders/` - List all orders
- `PUT /update-item/{item_name}` - Update item details
- `DELETE /orders/{item_name}` - Delete item

### Stock Management
- `PUT /update-stock/{item_name}` - Update warehouse stock level

### Analytics
- `GET /dashboard/analytics/` - Get inventory analytics with risk assessment
- `GET /dashboard/chart-data/` - Get chart visualization data
- `GET /dashboard/sales-insights/` - Get AI-powered business insights

### OCR
- `POST /upload-receipt/` - Upload and process receipt image