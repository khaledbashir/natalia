#!/bin/bash

# 1. Start FastAPI Backend (Background process)
# Navigate to src to ensure imports work correctly relative to the script
echo "Starting FastAPI Backend..."
cd src
# Run uvicorn on localhost:8000 so Next.js rewrite can hit it
../venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 2. Start Next.js Frontend (Foreground process)
echo "Starting Next.js Frontend..."
cd ../anc-cpq
# Next.js requests are proxied to localhost:8000 via next.config.mjs
npm start

# Trap cleanup
trap "kill $BACKEND_PID" EXIT
