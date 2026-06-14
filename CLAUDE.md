# AI-ERP Vision — Project Context

Full-stack ERP: FastAPI backend (single file `main.py`) + React/Vite frontend (`erp-frontend/`).

## Stack
- Backend: FastAPI, SQLAlchemy, SQLite (`erp_database.db`), Pandas, Tesseract OCR (pytesseract), Pillow
- Frontend: React 19, Vite 7, React Router 7, Recharts 3

## Run commands
Backend:
```
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Frontend:
```
cd erp-frontend && npm run dev
```

## Architecture
- `main.py`: all models, schemas, and endpoints in one file (DBOrder, DBStock).
- Stock and Orders are separate tables. Creating an order deducts from stock; stock must exist first.
- Risk logic: item is `CRITICAL` if `stock_level < quantity_sold * 1.5`, else `STABLE`.
- `/dashboard/analytics/`, `/dashboard/chart-data/`, `/dashboard/sales-insights/` drive the dashboard.
- OCR: `/upload-receipt/` parses lines via regex `(name) (qty) (price)`.
- `/generate-receipt/`: generates a fake receipt PNG from manual item list.

## Frontend structure
- `pages/`: WelcomePage, SalesPage, StockPage
- `components/`: Navbar, SubNavbar, AddItemSection, ReceiptGenerator, SalesInsights, SalesTableSection, StockSection, StockCharts, StatisticsCharts, HighlightsSection, HeroSection

## ⚠️ Known issues to fix
1. **API_URL inconsistency**: hardcoded as `http://192.168.56.1:8000` in `SalesPage.jsx`, `StockSection.jsx`, `SalesInsights.jsx`, `ReceiptGenerator.jsx`, but `App.jsx` (per README) expects `http://127.0.0.1:8000`. Should be a single source of truth — e.g. a `.env` with `VITE_API_URL`, imported everywhere.
2. **CORS wildcard** (`allow_origins=["*"]`) — fine for dev, restrict for any deployment.
3. **`AddItemSection.jsx`** receives `handleFileUpload`, `handleCreateItem`, `formData`, `setFormData`, `stockItems` as props but only uses `handleFileUpload` (for the upload box) — `ReceiptGenerator` inside it doesn't use the rest. Possible dead props to clean up.
4. Schema migration via `try/except ALTER TABLE` in `check_schema()` — fragile; works only for the one `price` column add.

## Code style (per project owner's preference)
- Simple, minimal, junior-friendly code
- No over-engineering
- No comments in code
