import { Logger } from 'n8n-workflow';

/**
 * Shared formatting utilities for AI Agent Tools
 * Ensures consistent response formatting across all tools
 */
export class SharedFormatters {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Format successful response
   */
  public formatSuccessResponse(data: any, message?: string): any {
    return {
      success: true,
      data,
      message: message || 'Operation completed successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format error response
   */
  public formatErrorResponse(error: any, message?: string): any {
    const errorMessage = message || (error?.message || 'An error occurred');
    
    this.logger.error(`Formatting error response: ${errorMessage}`, { error });
    
    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format document data for consistent output
   */
  public formatDocumentData(document: any): any {
    if (!document) {
      return null;
    }

    return {
      token: document.token || document.document_token,
      name: document.name,
      status: document.status,
      created_at: document.created_at || document.createdAt,
      updated_at: document.updated_at || document.updatedAt,
      expires_at: document.expires_at || document.expiresAt,
      signed_at: document.signed_at || document.signedAt,
      pdf_url: document.pdf_url || document.pdfUrl,
      signers: this.formatSignersArray(document.signers || []),
      metadata: this.formatMetadataArray(document.metadata || []),
      external_id: document.external_id || document.externalId,
      brand_name: document.brand_name || document.brandName,
      lang: document.lang,
      skip_email: document.skip_email || document.skipEmail,
      folder_path: document.folder_path || document.folderPath,
      date_limit_to_sign: document.date_limit_to_sign || document.dateLimitToSign,
      observer_emails: document.observer_emails || document.observerEmails || []
    };
  }

  /**
   * Format signers array for consistent output
   */
  public formatSignersArray(signers: any[]): any[] {
    if (!Array.isArray(signers)) {
      return [];
    }

    return signers.map(signer => ({
      token: signer.token || signer.signer_token,
      name: signer.name,
      email: signer.email,
      phone_country: signer.phone_country || signer.phoneCountry,
      phone_number: signer.phone_number || signer.phoneNumber,
      status: signer.status,
      auth_mode: signer.auth_mode || signer.authMode,
      created_at: signer.created_at || signer.createdAt,
      signed_at: signer.signed_at || signer.signedAt,
      lock_name: signer.lock_name || signer.lockName,
      lock_email: signer.lock_email || signer.lockEmail,
      lock_phone: signer.lock_phone || signer.lockPhone,
      send_automatic_email: signer.send_automatic_email || signer.sendAutomaticEmail,
      send_automatic_whatsapp: signer.send_automatic_whatsapp || signer.sendAutomaticWhatsapp
    }));
  }

  /**
   * Format metadata array for consistent output
   */
  public formatMetadataArray(metadata: any[]): any[] {
    if (!Array.isArray(metadata)) {
      return [];
    }

    return metadata.map(item => ({
      key: item.key,
      value: item.value
    }));
  }

  /**
   * Format template data for consistent output
   */
  public formatTemplateData(template: any): any {
    if (!template) {
      return null;
    }

    return {
      token: template.token || template.template_token,
      name: template.name,
      created_at: template.created_at || template.createdAt,
      updated_at: template.updated_at || template.updatedAt,
      external_id: template.external_id || template.externalId
    };
  }

  /**
   * Format background check data for consistent output
   */
  public formatBackgroundCheckData(check: any): any {
    if (!check) {
      return null;
    }

    return {
      check_id: check.check_id || check.checkId || check.id,
      status: check.status,
      type: check.type,
      created_at: check.created_at || check.createdAt,
      updated_at: check.updated_at || check.updatedAt,
      country: check.country,
      national_id: check.national_id || check.nationalId,
      tax_id: check.tax_id || check.taxId,
      user_authorized: check.user_authorized || check.userAuthorized,
      force_creation: check.force_creation || check.forceCreation
    };
  }

  /**
   * Format partner account data for consistent output
   */
  public formatPartnerAccountData(partner: any): any {
    if (!partner) {
      return null;
    }

    return {
      id: partner.id,
      name: partner.name || partner.company_name,
      api_token: partner.api_token || partner.apiToken,
      created_at: partner.created_at || partner.createdAt,
      credits_balance: partner.credits_balance || partner.creditsBalance,
      lang: partner.lang,
      timezone: partner.timezone
    };
  }

  /**
   * Format webhook data for consistent output
   */
  public formatWebhookData(webhook: any): any {
    if (!webhook) {
      return null;
    }

    return {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events || [],
      created_at: webhook.created_at || webhook.createdAt
    };
  }

  /**
   * Format timestamp data for consistent output
   */
  public formatTimestampData(timestamp: any): any {
    if (!timestamp) {
      return null;
    }

    return {
      id: timestamp.id,
      url: timestamp.url || timestamp.document_url,
      created_at: timestamp.created_at || timestamp.createdAt,
      status: timestamp.status
    };
  }

  /**
   * Format list response with pagination
   */
  public formatListResponse(items: any[], pagination?: any): any {
    const formattedItems = items.map(item => {
      // Auto-detect item type and format accordingly
      if (item.token && item.name) {
        return this.formatDocumentData(item);
      } else if (item.check_id || item.id) {
        return this.formatBackgroundCheckData(item);
      } else if (item.template_token || item.token) {
        return this.formatTemplateData(item);
      } else if (item.webhook_id || item.id) {
        return this.formatWebhookData(item);
      } else {
        return item; // Return as-is if unknown type
      }
    });

    const response: any = {
      success: true,
      data: formattedItems,
      count: formattedItems.length,
      timestamp: new Date().toISOString()
    };

    if (pagination) {
      response.pagination = {
        next: pagination.next,
        previous: pagination.previous,
        total: pagination.total || formattedItems.length
      };
    }

    return response;
  }

  /**
   * Format operation result for consistent output
   */
  public formatOperationResult(operation: string, result: any, message?: string): any {
    return {
      success: true,
      operation,
      data: result,
      message: message || `${operation} completed successfully`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Sanitize sensitive data from responses
   */
  public sanitizeResponse(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['api_token', 'apiToken', 'password', 'secret', 'key'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    // Recursively sanitize nested objects
    for (const [key, value] of Object.entries(sanitized)) {
      if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeResponse(value);
      }
    }

    return sanitized;
  }

  /**
   * Add request ID to response for tracking
   */
  public addRequestId(response: any, requestId: string): any {
    return {
      ...response,
      request_id: requestId
    };
  }

  /**
   * Format validation errors for consistent output
   */
  public formatValidationErrors(errors: string[]): any {
    return {
      success: false,
      error: 'Validation failed',
      details: errors,
      timestamp: new Date().toISOString()
    };
  }
}
