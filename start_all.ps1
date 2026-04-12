# Smart Career Domain Analyzer - Unified Startup Script
# ---------------------------------------------------
# This script launches all 3 microservices in separate windows.

Write-Host "🚀 Starting Smart Career Domain Analyzer..." -ForegroundColor Cyan

# 1. Start ML Service (Python FastAPI)
Write-Host "Starting ML Service (Port 8000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ml-service; .\.venv\Scripts\activate; uvicorn app:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start Node.js Backend (Express)
Write-Host "Starting Backend (Port 5000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# 3. Start Frontend (Next.js)
Write-Host "Starting Frontend (Port 3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd my-app; npm run dev"

Write-Host "✅ All services are launching. Check the new windows for logs." -ForegroundColor Green
