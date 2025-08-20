# ZapSign Node Usage Examples

This document provides practical examples of how to use the ZapSign node with different file input types.

## Document Creation Examples

### 1. File Upload (Binary Data)

Use this method when you have a file uploaded through n8n's binary data system.

**Node Configuration:**
- Resource: Document
- Operation: Create
- File Input Type: File Upload
- Document Name: Contract Agreement
- File: data (binary property name)

**Use Cases:**
- File upload from HTTP request
- File from previous node's binary output
- File from file system operations

**Example Workflow:**
```
HTTP Request → ZapSign (Create Document) → Email (Send Confirmation)
```

### 2. Base64 Encoding

Use this method when you have file content as a base64 string.

**Node Configuration:**
- Resource: Document
- Operation: Create
- File Input Type: Base64
- Document Name: Invoice Document
- Base64 Content: [Your base64 string here]
- File Name: invoice.pdf
- File MIME Type: application/pdf

**Use Cases:**
- Files generated programmatically
- Files stored in databases as base64
- Files from external APIs that return base64 content

**Example Workflow:**
```
Google Sheets → Code (Convert to base64) → ZapSign (Create Document) → Slack (Notify)
```

**Code Node Example (Convert file to base64):**
```javascript
// Convert binary data to base64
const binaryData = $input.all()[0].binary.data;
const base64Content = binaryData.toString('base64');

return [{
  json: {
    base64Content: base64Content,
    fileName: 'document.pdf',
    mimeType: 'application/pdf'
  }
}];
```

### 3. Public URL

Use this method when the file is publicly accessible via a URL.

**Node Configuration:**
- Resource: Document
- Operation: Create
- File Input Type: Public Link
- Document Name: Public Document
- File URL: https://example.com/document.pdf

**Use Cases:**
- Files hosted on public cloud storage
- Files from public repositories
- Files accessible via public APIs

**Example Workflow:**
```
Schedule Trigger → ZapSign (Create Document from URL) → Database (Log creation)
```

## Advanced Usage Scenarios

### Creating Documents from Multiple Sources

You can use a Switch node to route different file types to the appropriate ZapSign configuration:

```
Switch (File Source)
├─ File Upload → ZapSign (File Upload)
├─ Base64 → ZapSign (Base64)
└─ URL → ZapSign (Public Link)
```

### Dynamic File Processing

Use Code nodes to dynamically determine file input type:

```javascript
// Determine file input type based on available data
const item = $input.all()[0];
let fileInputType = 'file';
let fileData = {};

if (item.json.base64Content) {
  fileInputType = 'base64';
  fileData = {
    base64Content: item.json.base64Content,
    fileName: item.json.fileName || 'document.pdf',
    mimeType: item.json.mimeType || 'application/pdf'
  };
} else if (item.json.fileUrl) {
  fileInputType = 'url';
  fileData = {
    fileUrl: item.json.fileUrl
  };
} else if (item.binary) {
  fileInputType = 'file';
  fileData = {
    binaryPropertyName: 'data'
  };
}

return [{
  json: {
    fileInputType,
    ...fileData
  }
}];
```

### Error Handling

The node includes comprehensive error handling for different file input scenarios:

```javascript
// Handle specific file input errors
try {
  // Your ZapSign operation
} catch (error) {
  if (error.message.includes('Invalid file input type')) {
    // Handle invalid file input type
    console.log('Please select a valid file input type');
  } else if (error.message.includes('base64')) {
    // Handle base64 decoding errors
    console.log('Invalid base64 content provided');
  } else if (error.message.includes('URL')) {
    // Handle URL access errors
    console.log('Unable to access file from URL');
  }
}
```

## File Format Support

The node supports the following file formats with automatic MIME type detection:

### Documents
- **PDF**: application/pdf
- **Word**: application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- **Excel**: application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- **PowerPoint**: application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation
- **Text**: text/plain
- **RTF**: application/rtf

### Images
- **JPEG**: image/jpeg
- **PNG**: image/png
- **GIF**: image/gif
- **BMP**: image/bmp
- **TIFF**: image/tiff

### Web Formats
- **HTML**: text/html
- **XML**: application/xml
- **JSON**: application/json

## Best Practices

1. **File Size**: Keep files under 50MB for optimal performance
2. **File Types**: Use PDF format when possible for best compatibility
3. **Error Handling**: Always implement proper error handling for file operations
4. **Validation**: Validate file content before sending to ZapSign
5. **Caching**: Consider caching frequently used files to avoid repeated processing

## Troubleshooting

### Common Issues

**Base64 Content Error:**
- Ensure the base64 string is valid and complete
- Check that the string doesn't contain extra characters or line breaks

**URL Access Error:**
- Verify the URL is publicly accessible
- Check that the file exists at the specified URL
- Ensure the URL doesn't require authentication

**File Upload Error:**
- Confirm the binary property name is correct
- Verify the file data is properly formatted
   - Check file size limits

**MIME Type Detection:**
- If automatic detection fails, manually specify the MIME type
- Use the most specific MIME type available for your file format