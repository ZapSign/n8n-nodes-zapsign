#!/bin/bash

echo "Cleaning dist directory..."
rm -rf dist

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npx tsc

echo "Building icons..."
npx gulp build:icons

echo "Build completed!" 