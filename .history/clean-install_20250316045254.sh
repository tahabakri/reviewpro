#!/bin/bash

# Kill any existing node processes
echo "Stopping existing processes..."
pkill -f node

# Clean install dependencies
echo "Installing dependencies..."
npm ci

# Build and start the server
echo "Building and starting server..."
cd server
npm ci
npm run build
npm run dev &

# Wait a moment for the server to start
sleep 5

# Start the frontend
echo "Starting frontend..."
cd ..
npm run dev