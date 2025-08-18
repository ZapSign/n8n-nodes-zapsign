#!/bin/bash

echo "Cleaning dist directory..."
rm -rf dist

echo "Creating dist directory structure..."
mkdir -p dist/nodes/ZapSign
mkdir -p dist/nodes/ZapSignTrigger
mkdir -p dist/credentials

echo "Copying TypeScript files..."
cp nodes/ZapSign/ZapSign.node.ts dist/nodes/ZapSign/ZapSign.node.js
cp nodes/ZapSignTrigger/ZapSignTrigger.node.ts dist/nodes/ZapSignTrigger/ZapSignTrigger.node.js
cp credentials/ZapSignApi.credentials.ts dist/credentials/ZapSignApi.credentials.js

echo "Copying JSON files..."
cp nodes/ZapSign/ZapSign.node.json dist/nodes/ZapSign/
cp nodes/ZapSignTrigger/ZapSignTrigger.node.json dist/nodes/ZapSignTrigger/

echo "Copying icons..."
cp nodes/ZapSign/*.svg dist/nodes/ZapSign/ 2>/dev/null || true
cp nodes/ZapSignTrigger/*.svg dist/nodes/ZapSignTrigger/ 2>/dev/null || true

echo "Build completed!" 