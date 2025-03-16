#!/bin/bash

# Kill any existing node processes
if command -v taskkill &> /dev/null
then
    echo "Stopping existing processes on Windows..."
    taskkill //IM node.exe //F 2> /dev/null || true
else
    echo "Stopping existing processes..."
    pkill -f node 2> /dev/null || true
fi

# Clean install root dependencies
echo "Installing root dependencies..."
npm install

# Install and build server dependencies
echo "Installing server dependencies..."
cd server
npm install
echo "Building server..."
npm run build
cd ..

echo "Starting the application..."
npm run dev