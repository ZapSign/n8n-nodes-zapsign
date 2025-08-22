/**
 * Common tool schemas for AI Agent Tools
 * These schemas define the input/output structure for all ZapSign operations
 */

export const CommonSchemas = {
  // Base schemas for common fields
  baseFields: {
    externalId: {
      type: 'string',
      description: 'Your external reference ID for tracking',
      example: 'contract-123'
    },
    lang: {
      type: 'string',
      enum: ['pt-br', 'en', 'es'],
      description: 'Language for the operation',
      default: 'pt-br'
    },
    brandName: {
      type: 'string',
      description: 'Company brand name to display',
      example: 'My Company'
    },
    skipEmail: {
      type: 'boolean',
      description: 'Skip sending automatic emails',
      default: false
    }
  },

  // Document schemas
  document: {
    name: {
      type: 'string',
      description: 'Document name',
      example: 'Contract Agreement'
    },
    urlPdf: {
      type: 'string',
      format: 'uri',
      description: 'Public URL to download document',
      example: 'https://pdfobject.com/pdf/sample.pdf'
    },
    file: {
      type: 'string',
      description: 'Document file content (base64 encoded)',
      example: 'JVBERi0xLjQKJcOkw7zDtsO...'
    },
    base64: {
      type: 'string',
      description: 'Base64 encoded document content',
      example: 'JVBERi0xLjQKJcOkw7zDtsO...'
    },
    folderPath: {
      type: 'string',
      description: 'Folder path for organization',
      example: '/Contracts/2025'
    },
    dateLimitToSign: {
      type: 'string',
      format: 'date-time',
      description: 'Deadline for signing',
      example: '2025-02-21T20:00:00Z'
    },
    observerEmails: {
      type: 'array',
      items: {
        type: 'string',
        format: 'email'
      },
      description: 'Emails to notify about document progress',
      example: ['observer@example.com']
    }
  },

  // Signer schemas
  signer: {
    name: {
      type: 'string',
      description: 'Signer full name',
      example: 'John Doe'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'Signer email address',
      example: 'john@example.com'
    },
    phoneCountry: {
      type: 'string',
      description: 'Phone country code (e.g., 55 for Brazil)',
      example: '55'
    },
    phoneNumber: {
      type: 'string',
      description: 'Phone number',
      example: '11999999999'
    },
    authMode: {
      type: 'string',
      enum: ['email', 'sms', 'whatsapp', 'certificado_digital', 'reconhecimento_facial'],
      description: 'Authentication method',
      default: 'email'
    },
    lockName: {
      type: 'boolean',
      description: 'Lock signer name field',
      default: false
    },
    lockEmail: {
      type: 'boolean',
      description: 'Lock signer email field',
      default: false
    },
    lockPhone: {
      type: 'boolean',
      description: 'Lock signer phone field',
      default: false
    },
    sendAutomaticEmail: {
      type: 'boolean',
      description: 'Send automatic email notification',
      default: true
    },
    sendAutomaticWhatsapp: {
      type: 'boolean',
      description: 'Send automatic WhatsApp notification',
      default: false
    }
  },

  // Template schemas
  template: {
    templateToken: {
      type: 'string',
      description: 'Template token for creating documents',
      example: 'template-token-123'
    },
    templateData: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          de: {
            type: 'string',
            description: 'Template variable name',
            example: 'company_name'
          },
          para: {
            type: 'string',
            description: 'Template variable value',
            example: 'Acme Corp'
          }
        },
        required: ['de', 'para']
      },
      description: 'Template variables to replace'
    }
  },

  // Metadata schemas
  metadata: {
    key: {
      type: 'string',
      description: 'Metadata key',
      example: 'contract_type'
    },
    value: {
      type: 'string',
      description: 'Metadata value',
      example: 'standard'
    }
  },

  // Background check schemas
  backgroundCheck: {
    type: {
      type: 'string',
      enum: ['person', 'company'],
      description: 'Type of background check'
    },
    country: {
      type: 'string',
      description: 'Country code for the check',
      example: 'BR'
    },
    nationalId: {
      type: 'string',
      description: 'National ID for person checks',
      example: '449.720.338-78'
    },
    taxId: {
      type: 'string',
      description: 'Tax ID for company checks',
      example: '25.311.859/0001-42'
    },
    userAuthorized: {
      type: 'boolean',
      description: 'User has authorized the background check',
      default: true
    },
    forceCreation: {
      type: 'boolean',
      description: 'Force creation even if check exists',
      default: false
    }
  },

  // Partnership schemas
  partnership: {
    companyName: {
      type: 'string',
      description: 'Company name for the partner account',
      example: 'ZapSign Test'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'Partner company email',
      example: 'andre+partner@zapsign.com.br'
    },
    phoneNumber: {
      type: 'string',
      description: 'Partner company phone number',
      example: '11958039555'
    },
    phoneCountry: {
      type: 'string',
      description: 'Phone country code',
      example: '55'
    },
    country: {
      type: 'string',
      description: 'Country code',
      example: 'br'
    },
    clientApiToken: {
      type: 'string',
      description: 'Client API token for payment status update',
      example: '19e9dde1-73ea-47d4-b932-d9517715f21d30e4f5c4-3cef-42d1-bd9f-7c3c24715dab'
    },
    paymentStatus: {
      type: 'string',
      enum: ['adimplente', 'inadimplente'],
      description: 'Payment status to set',
      example: 'inadimplente'
    }
  },

  // Timestamp schemas
  timestamp: {
    documentUrl: {
      type: 'string',
      format: 'uri',
      description: 'URL of the document to timestamp',
      example: 'https://pdfobject.com/pdf/sample.pdf'
    }
  },

  // Webhook schemas
  webhook: {
    url: {
      type: 'string',
      format: 'uri',
      description: 'Webhook URL to receive notifications',
      example: 'https://your-app.com/webhook'
    },
    events: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['SIGN', 'REFUSE', 'FINISH', 'DELETE']
      },
      description: 'Event types to listen for',
      example: ['SIGN', 'FINISH']
    }
  }
};

/**
 * Common response schemas
 */
export const ResponseSchemas = {
  success: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'object' },
      message: { type: 'string', example: 'Operation completed successfully' },
      timestamp: { type: 'string', format: 'date-time' }
    },
    required: ['success', 'timestamp']
  },
  error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: { type: 'string', example: 'An error occurred' },
      timestamp: { type: 'string', format: 'date-time' }
    },
    required: ['success', 'error', 'timestamp']
  }
};
