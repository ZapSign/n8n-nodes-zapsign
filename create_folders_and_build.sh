#!/bin/bash

echo "Creating necessary folders..."
mkdir -p build/docker

echo "Building the project..."
npm run build

echo "Build completed! Check the dist/ folder for the compiled files."
