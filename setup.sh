#!/bin/bash

# Make clean-install.sh executable
chmod +x clean-install.sh

# Run clean installation
./clean-install.sh

# Install additional dev dependencies
npm install -D @types/node@^20.11.19 \
  @vitejs/plugin-react@^4.2.1 \
  autoprefixer@^10.4.17 \
  concurrently@^8.2.2 \
  postcss@^8.4.35 \
  tailwindcss@^3.4.1 \
  tsx@^4.7.1 \
  typescript@^5.3.3 \
  vitest@^1.2.2

# Install production dependencies
npm install dotenv@^16.4.5 \
  express@^4.18.2 \
  nodemailer@^6.9.9 \
  @types/nodemailer@^6.4.14

# Create required directories
mkdir -p dist/server

echo "Setup complete! You can now run:"
echo "npm run dev    # Start development servers"
echo "npm run build  # Build for production"