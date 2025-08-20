#!/bin/bash

# Build script for publishing n8n-nodes-zapsign
echo "Building n8n-nodes-zapsign for publishing..."

# Clean previous build
rm -rf dist

# Create directory structure
mkdir -p dist/credentials
mkdir -p dist/nodes/ZapSign
mkdir -p dist/nodes/ZapSignTrigger

# Convert TypeScript to JavaScript (simple conversion)
echo "Converting TypeScript to JavaScript..."

# Convert credentials
sed 's/import type {/const {/g' credentials/ZapSignApi.credentials.ts | \
sed 's/} from '\''n8n-workflow'\'';/} = require('\''n8n-workflow'\'');/g' | \
sed 's/export class/class/g' | \
sed 's/export interface/interface/g' | \
sed 's/export type/type/g' > dist/credentials/ZapSignApi.credentials.js

# Convert ZapSign node
sed 's/import type {/const {/g' nodes/ZapSign/ZapSign.node.ts | \
sed 's/} from '\''n8n-workflow'\'';/} = require('\''n8n-workflow'\'');/g' | \
sed 's/export class/class/g' | \
sed 's/export interface/interface/g' | \
sed 's/export type/type/g' | \
sed 's/export const/const/g' | \
sed 's/export default/module.exports =/g' > dist/nodes/ZapSign/ZapSign.node.js

# Convert ZapSignTrigger node
sed 's/import type {/const {/g' nodes/ZapSignTrigger/ZapSignTrigger.node.ts | \
sed 's/} from '\''n8n-workflow'\'';/} = require('\''n8n-workflow'\'');/g' | \
sed 's/export class/class/g' | \
sed 's/export interface/interface/g' | \
sed 's/export type/type/g' | \
sed 's/export const/const/g' | \
sed 's/export default/module.exports =/g' > dist/nodes/ZapSignTrigger/ZapSignTrigger.node.js

# Copy other files
cp nodes/ZapSign/ZapSign.node.json dist/nodes/ZapSign/
cp nodes/ZapSign/zapsign.svg dist/nodes/ZapSign/
cp nodes/ZapSignTrigger/ZapSignTrigger.node.json dist/nodes/ZapSignTrigger/
cp nodes/ZapSignTrigger/zapsign.svg dist/nodes/ZapSignTrigger/

# Copy package.json
cp package.json dist/

echo "Build completed successfully!"
echo "Dist directory structure:"
ls -la dist/ 