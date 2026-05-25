#!/bin/bash

# Exit immediately if a command fails
set -e

echo "Using Node.js 22 for the frontend/docs build..."
NODE_VERSION="22.16.0"
NODE_DIR="$HOME/.local/node-v${NODE_VERSION}-linux-x64"
if [ ! -x "$NODE_DIR/bin/node" ]; then
  mkdir -p "$HOME/.local"
  curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o /tmp/node-v${NODE_VERSION}-linux-x64.tar.xz
  tar -xJf /tmp/node-v${NODE_VERSION}-linux-x64.tar.xz -C "$HOME/.local"
fi
export PATH="$NODE_DIR/bin:$PATH"
node -v
npm -v

echo "Navigating to frontend directory..."
cd ~/dare-frontend

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install --frozen-lockfile --no-audit --no-fund

echo "Building the project..."
npm run build

echo "Clearing existing frontend files..."
sudo rm -rf /var/www/dare-frontend/*

echo "Moving built files to web directory..."
sudo mv ~/dare-frontend/dist/* /var/www/dare-frontend/

echo "Setting correct ownership and permissions..."
sudo chown -R www-data:www-data /var/www/dare-frontend
sudo chmod -R 755 /var/www/dare-frontend

echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Frontend deployment successful!"
EOF

echo "Deployment script completed successfully!"
