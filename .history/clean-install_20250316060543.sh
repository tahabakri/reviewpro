#!/bin/bash

# Kill any existing node processes
if command -v taskkill &> /dev/null
then
    echo "Stopping existing processes..."
    taskkill //IM node.exe //F
else
    echo "Stopping existing processes..."
    pkill -f node
fi

# Clean install dependencies
echo "Installing dependencies..."
npm install

# Build and start the server
cd server
npm install
npm run build
npm run dev &

# Wait a moment for the server to start
sleep 5

# Start the frontend
cd ..
npm run dev