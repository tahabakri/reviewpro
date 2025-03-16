#!/bin/bash

# Stop any running processes
echo "Stopping any running processes..."
pkill -f "node"

# Remove existing build artifacts and dependencies
echo "Cleaning up old files..."
rm -rf node_modules
rm -rf dist
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.example .env
fi

# Build the project
echo "Building the project..."
npm run build

echo "Clean installation complete!"
echo "You can now run 'npm run dev' to start the development server"