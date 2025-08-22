import type { IExecuteFunctions, IRequestOptions, IDataObject } from 'n8n-workflow';

/**
 * Thin wrapper around n8n authenticated requests that returns JSON (object or array).
 */
export async function requestJson(
    ctx: IExecuteFunctions,
    options: IRequestOptions,
): Promise<IDataObject | IDataObject[]> {
    try {
        const res = await ctx.helpers.requestWithAuthentication.call(ctx, 'zapSignApi', options);
        if (typeof res === 'string') {
            try {
                return JSON.parse(res as string) as IDataObject | IDataObject[];
            } catch {
                return { raw: res } as unknown as IDataObject;
            }
        }
        return res as IDataObject | IDataObject[];
    } catch (err: unknown) {
        const error = err as {
            statusCode?: number;
            status?: number;
            message?: string;
            response?: { body?: unknown };
            error?: unknown;
        };

        const status = error.statusCode ?? error.status;
        const rawBody = (error.response?.body as unknown) ?? error.error ?? error.message;

        let parsed: any = undefined;
        if (typeof rawBody === 'string') {
            try { parsed = JSON.parse(rawBody); } catch { /* ignore */ }
        } else if (rawBody && typeof rawBody === 'object') {
            parsed = rawBody as IDataObject;
        }

        const zapCode: string | undefined = parsed?.code || parsed?.error || parsed?.error_code;
        const zapMessage: string | undefined = parsed?.message || parsed?.detail || parsed?.error;

        // Improve messaging for common ZapSign 4xx errors
        if (status === 401) {
            if (zapMessage) {
                throw new Error(`Unauthorized (401): ${zapMessage}. Check if your API token has permission to view this document's data.`);
            }
            throw new Error('Unauthorized (401): Check your API token and ensure it has permission to view this document\'s activity history.');
        }

        if (status === 403) {
            if (zapCode === 'document_already_signed') {
                throw new Error('Document already signed: cancellation is not allowed (403: document_already_signed).');
            }
            if (zapCode === 'document_already_refused') {
                throw new Error('Document already refused: cannot cancel it again (403: document_already_refused).');
            }
            if (zapCode === 'refuse_not_allowed') {
                throw new Error('Refusal not allowed for this document (403: refuse_not_allowed). Check permissions or document state.');
            }
            if (zapCode === 'insufficient_permissions' || zapCode === 'permission_denied') {
                throw new Error(`Forbidden (403): ${zapMessage || 'Insufficient permissions'}. Your API token may not have access to this specific operation or document.`);
            }
            if (zapMessage) {
                throw new Error(`Forbidden (403): ${zapMessage}. This may indicate insufficient permissions or the operation is not allowed for this document state.`);
            }
            // Enhanced 403 error with more context
            const context = `Status: 403 Forbidden | Code: ${zapCode || 'none'} | Message: ${zapMessage || 'none'} | Raw: ${JSON.stringify(parsed || {})}`;
            throw new Error(`Forbidden (403): Check credentials, permissions, or document state. ${context}`);
        }

        if (status === 404) {
            if (zapMessage) {
                throw new Error(`Not Found (404): ${zapMessage}. Verify the document token is correct.`);
            }
            throw new Error('Not Found (404): Document not found. Verify the document token is correct.');
        }

        if (status === 400) {
            // Handle ZapSign-specific error format: {"error": "Signatário tem tentativas"}
            if (parsed?.error === 'Signatário tem tentativas') {
                throw new Error('Bad Request (400): Signer still has validation attempts available. This endpoint only works when the signer has exhausted all validation attempts.');
            }
            if (zapCode === 'signer_has_attempts') {
                throw new Error(`Bad Request (400): ${zapMessage || 'Signer still has validation attempts available'}. This endpoint only works when the signer has exhausted all validation attempts.`);
            }
            
            // Enhanced 400 error handling for template document creation and other operations
            if (zapMessage) {
                // Check for common template-related errors
                if (zapMessage.includes('template') || zapMessage.includes('modelo')) {
                    throw new Error(`Bad Request (400): ${zapMessage}. Check your template token and ensure it's valid.`);
                }
                if (zapMessage.includes('signer') || zapMessage.includes('signatário')) {
                    throw new Error(`Bad Request (400): ${zapMessage}. Check your signer information and ensure required fields are provided.`);
                }
                if (zapMessage.includes('data') || zapMessage.includes('variável')) {
                    throw new Error(`Bad Request (400): ${zapMessage}. Check your template variables and ensure they match the template format.`);
                }
                throw new Error(`Bad Request (400): ${zapMessage}. Check your parameters and ensure all required fields are provided.`);
            }
            
            // Enhanced 400 error with more context for debugging
            const context = `Status: 400 Bad Request | Code: ${zapCode || 'none'} | Message: ${zapMessage || 'none'} | Raw Response: ${JSON.stringify(parsed || {})}`;
            throw new Error(`Bad Request (400): Check your parameters. ${context}`);
        }

        // Fallback: include server-provided message if available
        if (zapMessage) {
            throw new Error(zapMessage);
        }

        // Last resort
        throw new Error(error.message || 'Unexpected error when calling ZapSign API');
    }
}

/**
 * Push result helper that accepts single object or array and appends to accumulator.
 */
export function pushResult(
    accumulator: IDataObject[],
    data: IDataObject | IDataObject[],
): void {
    if (Array.isArray(data)) {
        accumulator.push(...(data as IDataObject[]));
    } else {
        accumulator.push(data as IDataObject);
    }
}

