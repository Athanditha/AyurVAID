#!/bin/sh

# Exit immediately if any command exits with a non-zero status
set -e

echo "🌿 [AyurVAID] Starting Python ML Service (FastAPI) on port 8000..."
cd /app/server/python
uvicorn api:app --host 127.0.0.1 --port 8000 &

echo "🚀 [AyurVAID] Starting Node.js Express Backend on port 3001..."
cd /app
node server/server.js &

echo "💎 [AyurVAID] Starting Next.js Client on port 3000..."
cd /app/client
# Use exec to replace this shell process with Next.js, allowing correct SIGTERM propagation
exec npm run start
