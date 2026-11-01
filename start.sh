#!/bin/bash

# Build everything
npm run build
# Build the Rust service correctly
cargo build --manifest-path services/image-manager/Cargo.toml --release

# Start everything with PM2
# Note: Ensure you run 'npm install -g pm2' if not installed
pm2 start npm --name "web" -- run start -- --prefix apps/web
pm2 start npm --name "backend" -- run start -- --prefix apps/backend
pm2 start services/image-manager/target/release/image-manager --name "image-manager"

# Save the process list
pm2 save
