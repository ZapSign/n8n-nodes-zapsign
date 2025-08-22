import { Logger } from 'n8n-workflow';
import { requestJson } from '../apiClient';
import { mapSignerEntries, mapOneClickSignerEntries } from '../mappers';
import { SharedFormatters } from './formatters';

/**
 * Shared Service Layer for AI Agent Tools
 * Reuses existing ZapSign API client and provides common business logic
 */
export class SharedServiceLayer {
  private logger: Logger;
  private formatters: SharedFormatters;

  constructor(logger: Logger) {
    this.logger = logger;
    this.formatters = new SharedFormatters(logger);
  }

  /**
   * Create a document using the existing API client
   */
  public async createDocument(params: any, credentials: any): Promise<any> {
    try {
      this.logger.info('Creating document via shared service layer', { params });

      const payload = {
        name: params.name,
        signers: params.signers || [],
        url_pdf: params.urlPdf || params.url_pdf,
        file: params.file,
        base64: params.base64,
        folder_path: params.folderPath || params.folder_path,
        date_limit_to_sign: params.dateLimitToSign || params.date_limit_to_sign,
        skip_email: params.skipEmail || params.skip_email,
        external_id: params.externalId || params.external_id,
        brand_name: params.brandName || params.brand_name,
        lang: params.lang || 'pt-br',
        observer_emails: params.observerEmails || params.observer_emails || [],
        metadata: params.metadata || []
      };

      // Map signers if provided
      if (payload.signers && payload.signers.length > 0) {
        payload.signers = mapSignerEntries(payload.signers);
      }

      const response = await requestJson(credentials, {
        method: 'POST',
        url: '/api/v1/docs/',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      this.logger.info('Document created successfully via shared service layer', { 
        documentToken: (response as any).token || (response as any).document_token 
      });

      return this.formatters.formatDocumentData(response);
    } catch (error) {
      this.logger.error('Failed to create document via shared service layer', { error });
      throw error;
    }
  }

  /**
   * Create a document from template using the existing API client
   */
  public async createDocumentFromTemplate(params: any, credentials: any): Promise<any> {
    try {
      this.logger.info('Creating document from template via shared service layer', { params });

      const payload: any = {
        template_token: params.templateToken || params.template_token,
        name: params.name,
        signer_name: params.signerName || params.signer_name,
        signer_email: params.signerEmail || params.signer_email,
        signer_phone_country: params.signerPhoneCountry || params.signer_phone_country,
        signer_phone_number: params.signerPhoneNumber || params.signer_phone_number,
        signer_auth_mode: params.signerAuthMode || params.signer_auth_mode,
        signer_lock_name: params.signerLockName || params.signer_lock_name,
        signer_lock_email: params.signerLockEmail || params.signer_lock_email,
        signer_lock_phone: params.signerLockPhone || params.signer_lock_phone,
        signer_send_automatic_email: params.signerSendAutomaticEmail !== undefined ? params.signerSendAutomaticEmail : true,
        signer_send_automatic_whatsapp: params.signerSendAutomaticWhatsapp || params.signer_send_automatic_whatsapp || false,
        folder_path: params.folderPath || params.folder_path,
        date_limit_to_sign: params.dateLimitToSign || params.date_limit_to_sign,
        skip_email: params.skipEmail || params.skip_email,
        external_id: params.externalId || params.external_id,
        brand_name: params.brandName || params.brand_name,
        lang: params.lang || 'pt-br',
        observer_emails: params.observerEmails || params.observer_emails || [],
        metadata: params.metadata || []
      };

      // Add template data if provided
      if (params.templateData && Array.isArray(params.templateData)) {
        payload.template_data = params.templateData;
      }

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await requestJson(credentials, {
        method: 'POST',
        url: '/api/v1/templates/create-doc/',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      this.logger.info('Document from template created successfully via shared service layer', { 
        documentToken: (response as any).token || (response as any).document_token 
      });

      return this.formatters.formatDocumentData(response);
    } catch (error) {
      this.logger.error('Failed to create document from template via shared service layer', { error });
      throw error;
    }
  }

  /**
   * Create a OneClick document using the existing API client
   */
  public async createOneClickDocument(params: any, credentials: any): Promise<any> {
    try {
      this.logger.info('Creating OneClick document via shared service layer', { params });

      const payload = {
        name: params.name,
        file: params.file,
        base64: params.base64,
        url_pdf: params.urlPdf || params.url_pdf,
        signers: params.signers || [],
        external_id: params.externalId || params.external_id,
        lang: params.lang || 'pt-br'
      };

      // Map OneClick signers if provided
      if (payload.signers && payload.signers.length > 0) {
        payload.signers = mapOneClickSignerEntries(payload.signers);
      }

      const response = await requestJson(credentials, {
        method: 'POST',
        url: '/api/v1/docs/one-click/',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      this.logger.info('OneClick document created successfully via shared service layer', { 
        documentToken: (response as any).token || (response as any).document_token 
      });

      return this.formatters.formatDocumentData(response);
    } catch (error) {
      this.logger.error('Failed to create OneClick document via shared service layer', { error });
      throw error;
    }
  }

  /**
   * Get document details using the existing API client
   */
  public async getDocument(documentToken: string, credentials: any): Promise<any> {
    try {
      this.logger.info('Getting document details via shared service layer', { documentToken });

      const response = await requestJson(credentials, {
        method: 'GET',
        url: `/api/v1/docs/${documentToken}/`,
      });
      
      this.logger.info('Document details retrieved successfully via shared service layer');

      return this.formatters.formatDocumentData(response);
    } catch (error) {
      this.logger.error('Failed to get document details via shared service layer', { error });
      throw error;
    }
  }

  /**
   * List documents using the existing API client
   */
  public async listDocuments(params: any, credentials: any): Promise<any> {
    try {
      this.logger.info('Listing documents via shared service layer', { params });

      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.createdAfter) queryParams.append('created_after', params.createdAfter);
      if (params.createdBefore) queryParams.append('created_before', params.createdBefore);
      if (params.externalId) queryParams.append('external_id', params.externalId);

      const url = `/api/v1/docs/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await requestJson(credentials, {
        method: 'GET',
        url: url,
      });
      
      this.logger.info('Documents listed successfully via shared service layer', { 
        count: (response as any).results?.length || 0 
      });

      return this.formatters.formatListResponse((response as any).results || [], {
        next: (response as any).next,
        previous: (response as any).previous,
        total: (response as any).count
      });
    } catch (error) {
      this.logger.error('Failed to list documents via shared service layer', { error });
      throw error;
    }
  }

  /**
   * Update document using the existing API client
   */
  public async updateDocument(documentToken: string, params: any, credentials: any): Promise<any> {
    try {
      this.logger.info('Updating document via shared service layer', { documentToken, params });

      const payload: any = {};
      
      if (params.name !== undefined) payload.name = params.name;
      if (params.folderPath !== undefined) payload.folder_path = params.folderPath;
      if (params.dateLimitToSign !== undefined) payload.date_limit_to_sign = params.dateLimitToSign;
      if (params.skipEmail !== undefined) payload.skip_email = params.skipEmail;
      if (params.brandName !== undefined) payload.brand_name = params.brandName;
      if (params.lang !== undefined) payload.lang = params.lang;
      if (params.observerEmails !== undefined) payload.observer_emails = params.observerEmails;
      if (params.metadata !== undefined) payload.metadata = params.metadata;

      const response = await requestJson(credentials, {
        method: 'PUT',
        url: `/api/v1/docs/${documentToken}/`,
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      this.logger.info('Document updated successfully via shared service layer');

      return this.formatters.formatDocumentData(response);
    } catch (error) {
      this.logger.error('Failed to update document via shared service layer', { error });
      throw error;
    }
  }

  /**
   * Delete document using the existing API client
   */
  public async deleteDocument(documentToken: string, credentials: any): Promise<any> {
    try {
      this.logger.info('Deleting document via shared service layer', { documentToken });

      await requestJson(credentials, {
        method: 'DELETE',
        url: `/api/v1/docs/${documentToken}/`,
      });
      
      this.logger.info('Document deleted successfully via shared service layer');

      return this.formatters.formatOperationResult('delete', { documentToken }, 'Document deleted successfully');
    } catch (error) {
      this.logger.error('Failed to delete document via shared service layer', { error });
      throw error;
    }
  }

  /**
   * Send document for signing using the existing API client
   */
  public async sendDocument(documentToken: string, credentials: any): Promise<any> {
    try {
      this.logger.info('Sending document for signing via shared service layer', { documentToken });

      const response = await requestJson(credentials, {
        method: 'POST',
        url: `/api/v1/docs/${documentToken}/send/`,
      });
      
      this.logger.info('Document sent for signing successfully via shared service layer');

      return this.formatters.formatOperationResult('send', response, 'Document sent for signing successfully');
    } catch (error) {
      this.logger.error('Failed to send document for signing via shared service layer', { error });
      throw error;
    }
  }

  /**
   * Cancel document using the existing API client
   */
  public async cancelDocument(documentToken: string, credentials: any): Promise<any> {
    try {
      this.logger.info('Cancelling document via shared service layer', { documentToken });

      const response = await requestJson(credentials, {
        method: 'POST',
        url: `/api/v1/docs/${documentToken}/cancel/`,
      });
      
      this.logger.info('Document cancelled successfully via shared service layer');

      return this.formatters.formatOperationResult('cancel', response, 'Document cancelled successfully');
    } catch (error) {
      this.logger.error('Failed to cancel document via shared service layer', { error });
      throw error;
    }
  }

  /**
   * Download document using the existing API client
   */
  public async downloadDocument(documentToken: string, credentials: any): Promise<any> {
    try {
      this.logger.info('Downloading document via shared service layer', { documentToken });

      const response = await requestJson(credentials, {
        method: 'GET',
        url: `/api/v1/docs/${documentToken}/download/`,
      });
      
      this.logger.info('Document downloaded successfully via shared service layer');

      return this.formatters.formatOperationResult('download', response, 'Document downloaded successfully');
    } catch (error) {
      this.logger.error('Failed to download document via shared service layer', { error });
      throw error;
    }
  }

  /**
   * Generic method to execute any ZapSign API call
   */
  public async executeApiCall(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    payload: any,
    credentials: any
  ): Promise<any> {
    try {
      this.logger.info(`Executing API call via shared service layer`, { method, endpoint, payload });

      const response = await requestJson(credentials, {
        method,
        url: endpoint,
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      this.logger.info(`API call executed successfully via shared service layer`, { method, endpoint });

      return response;
    } catch (error) {
      this.logger.error(`Failed to execute API call via shared service layer`, { method, endpoint, error });
      throw error;
    }
  }
}
