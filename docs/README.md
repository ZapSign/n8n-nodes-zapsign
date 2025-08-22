# ZapSign API Documentation

This directory contains the complete OpenAPI 3.0 specification for the ZapSign API, a comprehensive digital signature platform.

## Files

- **`zapsign-openapi.yaml`** - Complete OpenAPI 3.0 specification
- **`README.md`** - This documentation file

## Overview

The ZapSign API provides a complete solution for digital signature operations, including:

### Core Features
- **Document Management**: Create, update, delete, and manage documents
- **Digital Signatures**: Multiple authentication methods and signature workflows
- **Template System**: Reusable document templates with variable replacement
- **Signer Management**: Add, update, and manage document signers
- **Background Checks**: Verify person and company information
- **Partnership Management**: Multi-tenant account management
- **Timestamp Services**: Cryptographic timestamping for document integrity
- **Webhook System**: Real-time event notifications

### Authentication
All endpoints require Bearer token authentication using your ZapSign API token.

### Environments
- **Production**: `https://api.zapsign.com.br`
- **Sandbox**: `https://sandbox.api.zapsign.com.br`

## Import Instructions

### Postman
1. Open Postman
2. Click "Import" button
3. Select "File" tab
4. Choose `zapsign-openapi.yaml`
5. Click "Import"

### Other Tools
The OpenAPI specification can be imported into:
- **Insomnia**: File → Import → OpenAPI 3.0
- **Swagger UI**: Upload the YAML file
- **Redoc**: Use the YAML file as input
- **Code Generators**: Generate client libraries in various languages

## API Resources

### 1. Documents (`/api/v1/docs/`)
- **Create Document**: Multiple input methods (file, base64, URL, markdown)
- **Create OneClick Document**: Simple consent workflows
- **Create from Template**: Generate documents using templates
- **Get/List Documents**: Retrieve documents with filtering
- **Update Document**: Modify document properties
- **Delete Document**: Soft delete documents
- **Send Document**: Send to signers for signature
- **Cancel/Refuse Document**: Cancel or reject documents
- **Download Document**: Get document files
- **Place Signatures**: Position signatures by coordinates
- **Validate Signatures**: Verify cryptographic integrity
- **Activity History**: Track document changes
- **Reorder Documents**: Change envelope display order
- **Add Extra Documents**: Attach additional files
- **Reprocess Documents**: Regenerate and resend webhooks

### 2. Signers (`/api/v1/docs/{documentToken}/signers/`)
- **Add Signer**: Add new signers to documents
- **List Signers**: Get all signers with filtering
- **Get Signer Details**: Retrieve specific signer information
- **Update Signer**: Modify signer properties
- **Remove Signer**: Delete signers from documents
- **Reset Validation Attempts**: Clear failed authentication attempts

### 3. Templates (`/api/v1/templates/`)
- **Create Template**: Upload DOCX files as templates
- **List Templates**: Retrieve available templates
- **Get Template**: Get specific template details
- **Update Template**: Modify template properties
- **Delete Template**: Remove templates
- **Create Document from Template**: Generate documents with variables
- **Update Template Form**: Configure form inputs and variables

### 4. Background Checks (`/api/v1/checks/`)
- **Create Person Check**: Verify individual identity
- **Create Company Check**: Verify business information
- **List Checks**: Retrieve all background checks
- **Get Check Details**: Comprehensive check results
- **Filter by**: Type, status, country, ID numbers, dates

### 5. Partnership (`/api/v1/partner/`)
- **Create Partner Account**: Multi-tenant account creation
- **List Partner Accounts**: Manage client accounts
- **Update Payment Status**: Control client access
- **Filter by**: Country, language, company name, dates

### 6. Timestamp (`/api/v1/timestamp/`)
- **Add Timestamp**: Cryptographic timestamping
- **List Timestamps**: Track timestamped documents
- **Filter by**: Document URL, creation dates

### 7. Webhooks (`/api/v1/user/company/webhook/`)
- **Create Webhook**: Set up event notifications
- **List Webhooks**: Manage notification endpoints
- **Delete Webhook**: Remove webhook subscriptions
- **Filter by**: URL, creation dates

## Request/Response Examples

### Create Document
```bash
curl -X POST "https://api.zapsign.com.br/api/v1/docs/" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -F "name=Contract Agreement" \
  -F "file=@document.pdf" \
  -F "signers[0][name]=John Doe" \
  -F "signers[0][email]=john@example.com"
```

### Create Document from Template
```bash
curl -X POST "https://api.zapsign.com.br/api/v1/templates/TEMPLATE_TOKEN/create-doc/" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "TEMPLATE_TOKEN",
    "signer_name": "John Doe",
    "signer_email": "john@example.com",
    "document_name": "Contract for John Doe",
    "data": [
      {"de": "{{client_name}}", "para": "John Doe"},
      {"de": "{{contract_date}}", "para": "2025-01-21"}
    ]
  }'
```

### Create Background Check
```bash
curl -X POST "https://api.zapsign.com.br/api/v1/checks/" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_authorized": true,
    "force_creation": true,
    "type": "person",
    "country": "BR",
    "national_id": "449.720.338-78"
  }'
```

## Error Handling

The API returns standard HTTP status codes with detailed error messages:

- **400 Bad Request**: Invalid parameters or data
- **401 Unauthorized**: Missing or invalid API token
- **402 Payment Required**: Feature not available on current plan
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side issues

## Rate Limits

Please refer to the official ZapSign documentation for current rate limits and usage guidelines.

## Support

- **Documentation**: [https://docs.zapsign.com.br](https://docs.zapsign.com.br)
- **API Reference**: This OpenAPI specification
- **Support**: Contact ZapSign support team

## Version

This specification covers ZapSign API version **1.0.105**

## Updates

This OpenAPI specification is maintained to reflect the current state of the ZapSign API. For the latest changes, refer to the official ZapSign documentation.
