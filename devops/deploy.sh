#!/bin/bash

# Exit immediately if a command fails
set -e

echo "Navigating to frontend directory..."
cd ~/dare-frontend

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install --frozen-lockfile

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
