#!/bin/bash
# Setup script for Contacts App - Luiz Apolinario
# Run this from the ~/html directory after uploading files

set -e

echo "=========================================="
echo "  Contacts App - Setup"
echo "  Luiz Apolinario"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Copy .env.example to .env and configure:"
    echo "  cp .env.example .env"
    exit 1
fi

echo "[1/4] Installing backend dependencies..."
cd src/backend && npm install && cd ../..

echo "[2/4] Installing frontend dependencies..."
cd src/frontend && npm install && cd ../..

echo "[3/4] Building frontend..."
cd src/frontend && npm run build && cd ../..

echo "[4/4] Checking build output..."
if [ -f src/frontend/dist/index.html ]; then
    echo "  Frontend build: OK"
else
    echo "  ERROR: Frontend build failed - dist/index.html not found"
    exit 1
fi

echo ""
echo "=========================================="
echo "  Setup complete!"
echo "=========================================="
echo ""
echo "To start/restart the app:"
echo "  pm2 start ecosystem.config.cjs"
echo "  or: pm2 restart all"
echo ""
echo "To check logs:"
echo "  pm2 logs"
echo ""
