# Network Setup Guide - AI-ERP Multi-PC Access

## Overview
This guide explains how to access your AI-ERP dashboard from a different PC on the same network.

## Step 1: Find Your PC's IP Address

### On Windows (where backend runs):
```powershell
ipconfig
```
Look for **IPv4 Address** under your active network connection (e.g., `192.168.x.x`)

### Example:
```
Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . . : 192.168.1.100
```

## Step 2: Update Frontend API URL

Edit `erp-frontend/src/App.jsx` and change line 6:

```javascript
// BEFORE:
const API_URL = 'http://127.0.0.1:8000';

// AFTER (use your actual PC IP):
const API_URL = 'http://192.168.1.100:8000';
```

## Step 3: Run Backend (on main PC)

```powershell
cd c:\Users\Mostfa\Documents\python\self\ai_erp_project
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Important:** `--host 0.0.0.0` makes the backend accessible from all network interfaces.

## Step 4: Build & Run Frontend (on main PC)

```powershell
cd erp-frontend
npm run build
npm run preview -- --host 0.0.0.0 --port 5173
```

Or for development:
```powershell
npm run dev -- --host 0.0.0.0
```

## Step 5: Access from Other PC

On a different computer on the same network, open your browser and go to:

```
http://192.168.1.100:5173
```

*(Replace 192.168.1.100 with your actual PC's IP address)*

## Step 6: Share the Database

The database is created at `./erp_database.db` in the project root.

### Option A: File Sharing (Easiest for LAN)
1. On the main PC, share the project folder with network access
2. Both PCs will access the same database file

### Option B: Move Database to Network Path
Edit `main.py` line 15:

```python
# Share to a network location
DATABASE_URL = "sqlite:////192.168.1.100/shared_folder/erp_database.db"
```

### Option C: Database Server (Most Robust)
Switch from SQLite to PostgreSQL/MySQL for multi-user access:

```python
DATABASE_URL = "postgresql://user:password@192.168.1.100:5432/erp_db"
```

## Troubleshooting

### "Cannot connect to backend" error
- ✅ Check backend is running on `0.0.0.0:8000`
- ✅ Verify API_URL in App.jsx matches your PC's IP
- ✅ Check firewall isn't blocking port 8000/5173
- ✅ Ensure both PCs are on the same network

### "Database locked" error (with SQLite)
- SQLite doesn't support concurrent writes well
- Use File Sharing (Option A) or switch to PostgreSQL/MySQL

### "Cannot find module" on other PC
- Run `npm install` first if you copied files
- Ensure both PCs have the same Node.js version

## Security Note

⚠️ The CORS setting `allow_origins=["*"]` accepts requests from anywhere.
For production, restrict to your network:

```python
allow_origins=["http://192.168.1.100", "http://192.168.1.x"],
```
