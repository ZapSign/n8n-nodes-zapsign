#!/bin/bash

# ZapSign API Documentation Setup Script
# This script creates the docs directory and sets up the OpenAPI specification

echo "🚀 Setting up ZapSign API Documentation..."

# Create docs directory
echo "📁 Creating docs directory..."
mkdir -p docs

# Check if files exist
if [ -f "docs/zapsign-openapi.yaml" ]; then
    echo "✅ OpenAPI specification already exists"
else
    echo "❌ OpenAPI specification not found. Please ensure zapsign-openapi.yaml is in the docs directory."
    exit 1
fi

if [ -f "docs/README.md" ]; then
    echo "✅ README documentation already exists"
else
    echo "❌ README documentation not found. Please ensure README.md is in the docs directory."
    exit 1
fi

echo ""
echo "🎉 Documentation setup complete!"
echo ""
echo "📋 Available files:"
echo "   - docs/zapsign-openapi.yaml (OpenAPI 3.0 specification)"
echo "   - docs/README.md (Documentation guide)"
echo ""
echo "🔧 Next steps:"
echo "   1. Import zapsign-openapi.yaml into Postman or other API tools"
echo "   2. Review README.md for usage instructions"
echo "   3. Start testing the ZapSign API endpoints"
echo ""
echo "📚 For more information, visit: https://docs.zapsign.com.br"
