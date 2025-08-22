import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { requestJson, pushResult, mapSignerEntries, mapOneClickSignerEntries } from './internal';
import { ZapSignDescriptionBuilder } from './description/ZapSignDescriptionBuilder';
import 'dotenv/config';

// Helper function to determine MIME type from file extension
function getMimeTypeFromExtension(extension?: string): string {
	if (!extension) return 'application/octet-stream';
	
	const mimeTypes: { [key: string]: string } = {
		'pdf': 'application/pdf',
		'doc': 'application/msword',
		'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'xls': 'application/vnd.ms-excel',
		'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'ppt': 'application/vnd.ms-powerpoint',
		'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'txt': 'text/plain',
		'rtf': 'application/rtf',
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'png': 'image/png',
		'gif': 'image/gif',
		'bmp': 'image/bmp',
		'tiff': 'image/tiff',
		'html': 'text/html',
		'htm': 'text/html',
		'xml': 'application/xml',
		'json': 'application/json',
	};
	
	return mimeTypes[extension] || 'application/octet-stream';
}

export class ZapSign implements INodeType {

	description: INodeTypeDescription = {
		...new ZapSignDescriptionBuilder().build(),
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Document',
						value: 'document',
					},
					{
						name: 'Signer',
						value: 'signer',
					},
					{
						name: 'Template',
						value: 'template',
					},
									{
					name: 'Background Check',
					value: 'backgroundCheck',
				},
				{
					name: 'Partnership',
					value: 'partnership',
				},
				{
					name: 'Timestamp',
					value: 'timestamp',
				},
				{
					name: 'Webhook',
					value: 'webhook',
				},
				],
				default: 'document',
			},
			// Document operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a document',
						action: 'Create a document',
					},
					{
						name: 'Create From Template',
						value: 'createFromTemplate',
						description: 'Create a document from a template',
						action: 'Create a document from a template',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a document by token',
						action: 'Get a document',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many documents',
						action: 'Get many documents',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a document',
						action: 'Update a document',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a document',
						action: 'Delete a document',
					},
					{
						name: 'Send for Signing',
						value: 'sendForSigning',
						description: 'Send a document for signing',
						action: 'Send a document for signing',
					},
					{
						name: 'Cancel',
						value: 'cancel',
						description: 'Cancel a document',
						action: 'Cancel a document',
					},
					{
						name: 'Download',
						value: 'download',
						description: 'Download a document',
						action: 'Download a document',
					},
					{
						name: 'Place Signatures',
						value: 'placeSignatures',
						description: 'Place signatures on a document',
						action: 'Place signatures on a document',
					},
					{
						name: 'Get Activity History',
						value: 'getActivityHistory',
						description: 'Get document activity history',
						action: 'Get document activity history',
					},
					{
						name: 'Validate Signatures',
						value: 'validateSignatures',
						description: 'Validate document signatures',
						action: 'Validate document signatures',
					},
					{
						name: 'Refuse',
						value: 'refuse',
						description: 'Refuse a document',
						action: 'Refuse a document',
					},
					{
						name: 'Add Extra Document',
						value: 'addExtraDocument',
						description: 'Add an extra document to an envelope',
						action: 'Add an extra document to an envelope',
					},
					{
						name: 'Add Extra Document From Template',
						value: 'addExtraDocumentFromTemplate',
						description: 'Add an extra document from template to an envelope',
						action: 'Add an extra document from template to an envelope',
					},
					{
						name: 'Reprocess Document',
						value: 'reprocessDocument',
						description: 'Reprocess a document and webhooks',
						action: 'Reprocess a document and webhooks',
					},

				],
				default: 'create',
			},
			// Signer operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['signer'],
					},
				},
				options: [
					{
						name: 'Add',
						value: 'add',
						description: 'Add a signer to a document',
						action: 'Add a signer',
					},
					{
						name: 'Remove',
						value: 'remove',
						description: 'Remove a signer from a document',
						action: 'Remove a signer',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a signer',
						action: 'Update a signer',
					},
					{
						name: 'Detail',
						value: 'get',
						description: 'Get signer details by token',
						action: 'Get signer details',
					},
					{
						name: 'Reset Validation Attempts',
						value: 'resetAttempts',
						description: 'Reset a signer\'s validation attempts',
						action: 'Reset signer validation attempts',
					},
				],
				default: 'add',
			},
			// Template operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['template'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many templates',
						action: 'Get many templates',
					},
					{
						name: 'Create Document From Template',
						value: 'createDocument',
						action: 'Create document from template',
					},
					{
						name: 'Create Template (DOCX)',
						value: 'createTemplateDocx',
						action: 'Create template DOCX',
					},
					{
						name: 'Update Template Form',
						value: 'updateTemplateForm',
						action: 'Update template form inputs',
					},
					{
						name: 'Get Template',
						value: 'get',
						action: 'Get a template',
					},
					{
						name: 'Update Template',
						value: 'update',
						action: 'Update a template',
					},
					{
						name: 'Delete Template',
						value: 'delete',
						action: 'Delete a template',
					},
				],
				default: 'getAll',
			},
			// Webhook operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a webhook',
						action: 'Create a webhook',
					},

					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a webhook',
						action: 'Delete a webhook',
					},
				],
				default: 'create',
			},
			// Background Check operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['backgroundCheck'] } },
				options: [
					{ name: 'Create Person Check', value: 'createPerson', action: 'Create person background check' },
					{ name: 'Create Company Check', value: 'createCompany', action: 'Create company background check' },
					{ name: 'Get Check', value: 'get', action: 'Retrieve a background check' },
					{ name: 'Get Check Details', value: 'details', action: 'Retrieve background check details' },
				],
				default: 'createPerson',
			},
			// Partnership operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['partnership'] } },
				options: [
					{ name: 'Create Partner Account', value: 'createAccount', action: 'Create a new partner account' },
					{ name: 'Update Payment Status', value: 'updatePaymentStatus', action: 'Update partner payment status' },
				],
				default: 'createAccount',
			},
			// Timestamp operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['timestamp'] } },
				options: [
					{ name: 'Add Timestamp', value: 'add', action: 'Add timestamp to a document' },
				],
				default: 'add',
			},
			// Document fields
			{
				displayName: 'Document Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create', 'createOneClick'],
					},
				},
				description: 'Name of the document',
			},
			// File input type for Create (includes Markdown)
			{
				displayName: 'File Input Type',
				name: 'fileInputType',
				type: 'options',
				options: [
					{ name: 'File Upload', value: 'file', description: 'Upload a file from binary data' },
					{ name: 'Base64', value: 'base64', description: 'Provide file content as base64 string' },
					{ name: 'Public Link', value: 'url', description: 'Provide a public URL to the file' },
					{ name: 'Markdown Text', value: 'markdown', description: 'Provide raw Markdown text to generate the document' },
				],
				default: 'file',
				required: true,
				displayOptions: { show: { resource: ['document'], operation: ['create'] } },
				description: 'How to provide the file for document creation',
			},
			// File input type for Create OneClick (PDF/DOCX only)
			{
				displayName: 'File Input Type',
				name: 'fileInputType',
				type: 'options',
				options: [
					{ name: 'File Upload', value: 'file', description: 'Upload a file from binary data' },
					{ name: 'Base64', value: 'base64', description: 'Provide file content as base64 string' },
					{ name: 'Public Link', value: 'url', description: 'Provide a public URL to the file' },
				],
				default: 'file',
				required: true,
				displayOptions: { show: { resource: ['document'], operation: ['createOneClick'] } },
				description: 'How to provide the file for OneClick document creation (PDF/DOCX via file, base64 or URL)',
			},
			{
				displayName: 'File',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create', 'createOneClick'],
						fileInputType: ['file'],
					},
				},
				description: 'Name of the binary property containing the file data',
			},
			{
				displayName: 'Base64 Content',
				name: 'base64Content',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create', 'createOneClick'],
						fileInputType: ['base64'],
					},
				},
				description: 'File content encoded in base64',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: 'document.pdf',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create', 'createOneClick'],
						fileInputType: ['base64'],
					},
				},
				description: 'Name of the file (including extension)',
			},
			{
				displayName: 'File MIME Type',
				name: 'fileMimeType',
				type: 'string',
				default: 'application/pdf',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create', 'createOneClick'],
						fileInputType: ['base64'],
					},
				},
				description: 'MIME type of the file (e.g., application/pdf, image/jpeg)',
			},
			{
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create', 'createOneClick'],
						fileInputType: ['url'],
					},
				},
				description: 'Public URL to the file',
			},
			{
				displayName: 'Markdown Text',
				name: 'markdownText',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create'],
						fileInputType: ['markdown'],
					},
				},
				description: 'Raw Markdown content to generate the document (alternative to URL/base64/upload)',
			},

			{
				displayName: 'Validate File',
				name: 'validateBinaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['validateSignatures'],
					},
				},
				description: 'Name of the binary property containing the file data to validate',
			},

			// Template Token field - moved here to appear before Signers for better UX
			{
				displayName: 'Template Token',
				name: 'templateToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument', 'get', 'update', 'delete', 'updateTemplateForm'],
					},
				},
				description: 'Token of the template (modelo)',
			},
			
			// Document Name field - moved here to appear after Template Token
			{
				displayName: 'Document Name',
				name: 'name',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument', 'createTemplateDocx', 'update'],
					},
				},
				description: 'Name of the document (optional)',
			},

			// Note: For template documents, only basic signer fields are supported
			// Advanced options like auth_mode, signature_placement, etc. are defined in the template
			
			// Individual signer properties for template document creation
			{
				displayName: 'Signer Name',
				name: 'signer_name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Name of the signer (required)',
			},
			{
				displayName: 'Signer Email',
				name: 'signer_email',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Email of the signer',
			},
			{
				displayName: 'Phone Country Code',
				name: 'signer_phone_country',
				type: 'string',
				default: '55',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Country code for phone number (e.g., 55 for Brazil)',
			},
			{
				displayName: 'Phone Number',
				name: 'signer_phone_number',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Phone number of the signer',
			},
			
			// Template Data field - template variables to replace in the document
			{
				displayName: 'Template Data',
				name: 'templateData',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Template Variable',
				default: {},
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Template variables to replace in the document',
				options: [
					{
						displayName: 'Variable',
						name: 'variable',
						values: [
							{
								displayName: 'Variable Name',
								name: 'variableName',
								type: 'string',
								default: '',
								description: 'Name of the variable in the template (e.g., "NOME COMPLETO")',
							},
							{
								displayName: 'Variable Value',
								name: 'variableValue',
								type: 'string',
								default: '',
								description: 'Value to replace the variable with',
							},
						],
					},
				],
			},
			
			// Additional supported fields for template document creation
			{
				displayName: 'Language',
				name: 'lang',
				type: 'options',
				options: [
					{ name: 'Português', value: 'pt-br' },
					{ name: 'Español', value: 'es' },
					{ name: 'English', value: 'en' },
				],
				default: 'pt-br',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Language of the document',
			},
			{
				displayName: 'Disable Signer Emails',
				name: 'disable_signer_emails',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Disable emails sent to signers',
			},
			{
				displayName: 'Brand Logo',
				name: 'brand_logo',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'URL of the brand logo image (must be publicly accessible)',
			},
			{
				displayName: 'Brand Primary Color',
				name: 'brand_primary_color',
				type: 'color',
				default: '',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Primary color in RGB or hexadecimal (e.g., "#0011ee")',
			},
			{
				displayName: 'Brand Name',
				name: 'brand_name',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Brand name for email sender (max 100 characters)',
			},
			{
				displayName: 'External ID',
				name: 'external_id',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'ID of the document in your application',
			},
			{
				displayName: 'Folder Path',
				name: 'folder_path',
				type: 'string',
				default: '/',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Path where document will be placed (max 255 chars, 5 levels)',
			},
			{
				displayName: 'Created By',
				name: 'created_by',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Email of the user who will be set as creator',
			},
			{
				displayName: 'Folder Token',
				name: 'folder_token',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Token of the folder (has priority over folder_path)',
			},
			{
				displayName: 'Disable Signers Get Original File',
				name: 'disable_signers_get_original_file',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Disable signers from downloading the original file',
			},
			{
				displayName: 'Send Automatic WhatsApp',
				name: 'send_automatic_whatsapp',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Send invitation via WhatsApp (costs R$ 0.50 per message)',
			},
			{
				displayName: 'Send WhatsApp Signed File',
				name: 'send_automatic_whatsapp_signed_file',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Send signed file via WhatsApp (costs R$ 0.50 per message)',
			},
			{
				displayName: 'Signature Order Active',
				name: 'signature_order_active',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Enable sequential signature ordering',
			},
			
			// Metadata field for template document creation
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'collection',
				placeholder: 'Add Metadata',
				default: {},
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument'],
					},
				},
				description: 'Custom metadata for the document (appears in webhooks). Add metadata as key-value pairs.',
				options: [
					{
						displayName: 'Metadata Key',
						name: 'key',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Metadata Value',
						name: 'value',
						type: 'string',
						default: '',
					},
				],
			},

			// Signers field - only for regular document creation (not templates)
			{
				displayName: 'Signers',
				name: 'signers',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Signer',
				default: {},
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create', 'createOneClick'],
					},
				},
				description: 'Signers for the document (not used for template documents)',
				options: [
					{
						displayName: 'Signer',
						name: 'signer',
						values: [
							{
						displayName: 'Auth Mode',
						name: 'auth_mode',
						type: 'options',
						options: [
									{
										name: 'Assinatura Na Tela',
										value: 'assinaturaTela',
									},
									{
										name: 'Token Por Email',
										value: 'tokenEmail',
									},
									{
										name: 'Assinatura Na Tela	+	Token Por Email',
										value: 'assinaturaTela-tokenEmail',
									},
									{
										name: 'Token Por SMS',
										value: 'tokenSms',
									},
									{
										name: 'Assinatura Na Tela	+	Token Por SMS',
										value: 'assinaturaTela-tokenSms',
									},
									{
										name: 'Token Por WhatsApp',
										value: 'tokenWhatsapp',
									},
									{
										name: 'Assinatura Na Tela	+	Token Por WhatsApp',
										value: 'assinaturaTela-tokenWhatsapp',
									},
									{
										name: 'Certificado Digital',
										value: 'certificadoDigital',
									},
									{
										name: 'Nenhum',
										value: '',
									},
								],
						default: '',
						description: 'Modo de autenticação do signatário conforme a documentação ZapSign',
							},
							{
						displayName: 'Blank Email',
						name: 'blank_email',
						type: 'boolean',
						default: false,
						description: 'Do not request email from signer (leave blank)',
							},
							{
						displayName: 'Blank Phone',
						name: 'blank_phone',
						type: 'boolean',
						default: false,
						description: 'Do not request phone from signer (leave blank)',
							},
							{
						displayName: 'CPF',
						name: 'cpf',
						type: 'string',
						default: '',
						description: 'CPF number of the signer',
							},
							{
						displayName: 'Custom Message',
						name: 'custom_message',
						type: 'string',
						default: '',
						description: 'Custom message to show the signer in the invitation',
							},
							{
						displayName: 'External ID',
						name: 'external_id',
						type: 'string',
						default: '',
						description: 'Signer ID in your application',
							},
							{
						displayName: 'Hide Email',
						name: 'hide_email',
						type: 'boolean',
						default: false,
						description: 'Hide email field from signer UI',
							},
							{
						displayName: 'Order Group',
						name: 'order_group',
						type: 'number',
						default: 0,
						description: 'Group index for signature order when ordering is active',
							},
							{
						displayName: 'Phone Country Code',
						name: 'phone_country',
						type: 'string',
						default: '55',
						description: 'Country code for phone number (e.g., 55 for Brazil)',
							},
							{
						displayName: 'Phone Number',
						name: 'phone_number',
						type: 'string',
						default: '',
						description: 'Phone number of the signer',
							},
							{
						displayName: 'Qualification',
						name: 'qualification',
						type: 'string',
						default: '',
						description: 'Qualification to appear in the signature report',
							},
							{
						displayName: 'Redirect Link',
						name: 'redirect_link',
						type: 'string',
						default: '',
						description: 'URL to redirect signer after signature',
							},
							{
						displayName: 'Require CPF',
						name: 'require_cpf',
						type: 'boolean',
						default: false,
						description: 'Require CPF input from signer',
							},
							{
						displayName: 'Require Document Photo',
						name: 'require_document_photo',
						type: 'boolean',
						default: false,
						description: 'Require an ID document photo during the signing process',
							},
							{
						displayName: 'Require Selfie Photo',
						name: 'require_selfie_photo',
						type: 'boolean',
						default: false,
						description: 'Require a selfie photo during the signing process',
							},
							{
						displayName: 'Rubrica Placement',
						name: 'rubrica_placement',
						type: 'string',
						default: '',
						description: 'JSON positions for initials (rubrica) placement',
							},
							{
						displayName: 'Selfie Validation Type',
						name: 'selfie_validation_type',
						type: 'options',
						options: [
									{
										name: 'None',
										value: '',
									},
									{
										name: 'Face Match',
										value: 'facematch',
									},
					],
						default: '',
						description: 'Type of selfie validation to perform',
							},
							{
						displayName: 'Send Automatic Email',
						name: 'send_automatic_email',
						type: 'boolean',
						default: true,
						description: 'Automatically send invitation email to signer',
							},
							{
						displayName: 'Send Automatic WhatsApp',
						name: 'send_automatic_whatsapp',
						type: 'boolean',
						default: false,
						description: 'Automatically send invitation via WhatsApp',
							},
							{
						displayName: 'Send WhatsApp Signed File',
						name: 'send_automatic_whatsapp_signed_file',
						type: 'boolean',
						default: false,
						description: 'Send the signed file to signer via WhatsApp after completion',
							},
							{
						displayName: 'Signature Placement',
						name: 'signature_placement',
						type: 'string',
						default: '',
						description: 'JSON positions for signature placement as per ZapSign docs',
							},
							{
						displayName: 'Signer Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						default: '',
						description: 'Email of the signer',
							},
							{
						displayName: 'Signer Name',
						name: 'name',
						type: 'string',
						default: '',
							required:	true,
						description: 'Name of the signer',
							},
							{
						displayName: 'Validate CPF',
						name: 'validate_cpf',
						type: 'boolean',
						default: false,
						description: 'Validate CPF format and checksum',
							},
					],
					},
				],
			},
			{
				displayName: 'Document Token',
				name: 'documentToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['get', 'send', 'cancel', 'refuse', 'download', 'addExtraDocument', 'addExtraDocumentFromTemplate', 'update', 'reorderEnvelope', 'placeSignatures', 'activityHistory', 'delete'],
					},
				},
				description: 'Token of the document',
			},
			{
				displayName: 'Download PDF',
				name: 'downloadPdf',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['activityHistory'],
					},
				},
				description: 'Whether to return the activity history as a PDF file (true) or JSON format (false)',
			},
			{
				displayName: 'Rejected Reason',
				name: 'rejectedReason',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['cancel', 'refuse'],
					},
				},
				description: 'Reason for cancellation/refusal to be stored in the document history',
			},
			{
				displayName: 'Extra Document Name',
				name: 'extraDocumentName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['addExtraDocument'],
					},
				},
				description: 'Title of the extra document (max 255 characters)',
			},
			{
				displayName: 'Extra Document File Input Type',
				name: 'extraDocumentFileInputType',
				type: 'options',
				options: [
					{
						name: 'Public URL',
						value: 'url',
						description: 'Provide a public URL to the PDF file',
					},
					{
						name: 'Base64',
						value: 'base64',
						description: 'Provide PDF content as base64 string',
					},
				],
				default: 'url',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['addExtraDocument'],
					},
				},
				description: 'How to provide the extra document file (only PDF files up to 10MB)',
			},
			{
				displayName: 'Extra Document URL',
				name: 'extraDocumentUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['addExtraDocument'],
						extraDocumentFileInputType: ['url'],
					},
				},
				description: 'Public URL to the PDF file (must be publicly accessible)',
			},
			{
				displayName: 'Extra Document Base64 Content',
				name: 'extraDocumentBase64',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['addExtraDocument'],
						extraDocumentFileInputType: ['base64'],
					},
				},
				description: 'PDF file content encoded in base64 (max 10MB)',
			},
			// Extra Document From Template fields
			{
				displayName: 'Template Token',
				name: 'extraDocumentTemplateToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['addExtraDocumentFromTemplate'],
					},
				},
				description: 'Token of the template (modelo dinâmico) to use for the extra document',
			},
			// Update Document fields
			{
				displayName: 'Document Token',
				name: 'documentToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['update'],
					},
				},
				description: 'Token of the document to update',
			},
			{
				displayName: 'New Document Name',
				name: 'newDocumentName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['update'],
					},
				},
				description: 'New name for the document',
			},
			{
				displayName: 'New Date Limit to Sign',
				name: 'newDateLimitToSign',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['update'],
					},
				},
				description: 'New date limit for signature (YYYY-MM-DD format)',
			},
			{
				displayName: 'New Folder Path',
				name: 'newFolderPath',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['update'],
					},
				},
				description: 'New folder path where the document will be organized',
			},
			{
				displayName: 'New Folder Token',
				name: 'newFolderToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['update'],
					},
				},
				description: 'Folder token (overrides folder_path if provided)',
			},
			{
				displayName: 'Extra Documents to Rename',
				name: 'extraDocsToRename',
				type: 'collection',
				placeholder: 'Add Extra Document',
				default: {},
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['update'],
					},
				},
				description: 'List of extra documents that can be renamed',
				options: [
					{
						displayName: 'Extra Document Token',
						name: 'extraDocToken',
						type: 'string',
						typeOptions: { password: true },
						default: '',
						description: 'Token of the extra document already sent previously',
					},
					{
						displayName: 'New Extra Document Name',
						name: 'newExtraDocName',
						type: 'string',
						default: '',
						description: 'New name for this extra document',
					},
				],
			},
			{
				displayName: 'Template Variables',
				name: 'extraDocumentTemplateData',
				type: 'collection',
				placeholder: 'Add Template Variable',
				default: {},
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['addExtraDocumentFromTemplate'],
					},
				},
				description: 'Template variables to replace in the document',
				options: [
					{
						displayName: 'Variable Name',
						name: 'variableName',
						type: 'string',
						default: '',
						description: 'Name of the variable in the template (e.g., "NOME COMPLETO")',
					},
					{
						displayName: 'Variable Value',
						name: 'variableValue',
						type: 'string',
						default: '',
						description: 'Value to replace the variable with',
					},
				],
			},
			// Reorder Envelope fields
			{
				displayName: 'Document Display Order',
				name: 'documentDisplayOrder',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Document Token',
				default: { documentToken: [] },
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['reorderEnvelope'],
					},
				},
				description: 'List of document tokens in the desired display order. Add at least one document token to specify the order.',
				options: [
					{
						displayName: 'Document Tokens',
						name: 'documentToken',
						values: [
							{
								displayName: 'Document Token',
								name: 'token',
								type: 'string',
								typeOptions: { password: true },
								default: '',
								required: true,
								description: 'Token of the document to include in the envelope order',
							},
						],
					},
				],
			},
			{
				displayName: 'Document Token',
				name: 'signerDocumentToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add'],
					},
				},
				description: 'Token of the document',
			},
			{
				displayName: 'Signer Token',
				name: 'signerToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['update', 'remove', 'get', 'resetAttempts'],
					},
				},
				description: 'Token of the signer to update/remove',
			},
			// Signer fields
			{
				displayName: 'Signer Email',
				name: 'signerEmail',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add'],
					},
				},
				description: 'Email of the signer',
			},
			{
				displayName: 'New Signer Email',
				name: 'newSignerEmail',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['update'],
					},
				},
				description: 'New email for the signer (optional)',
			},
			{
				displayName: 'Signer Name',
				name: 'signerName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Name of the signer',
			},
			{
				displayName: 'Authentication Method',
				name: 'authMethod',
				type: 'options',
				options: [
					{ name: 'Assinatura Na Tela', value: 'assinaturaTela' },
					{ name: 'Token Por Email', value: 'tokenEmail' },
					{ name: 'Assinatura Na Tela + Token Por Email', value: 'assinaturaTela-tokenEmail' },
					{ name: 'Token Por SMS', value: 'tokenSms' },
					{ name: 'Assinatura Na Tela + Token Por SMS', value: 'assinaturaTela-tokenSms' },
					{ name: 'Token Por WhatsApp', value: 'tokenWhatsapp' },
					{ name: 'Assinatura Na Tela + Token Por WhatsApp', value: 'assinaturaTela-tokenWhatsapp' },
					{ name: 'Certificado Digital', value: 'certificadoDigital' },
					{ name: 'Nenhum', value: '' },
				],
				default: 'assinaturaTela',
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Authentication method for the signer',
			},
			{
				displayName: 'Redirect Link',
				name: 'redirectLink',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'URL to redirect signer after signature',
			},
			{
				displayName: 'Phone Country Code',
				name: 'phoneCountry',
				type: 'string',
				default: '55',
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
						authMethod: ['tokenSms', 'assinaturaTela-tokenSms', 'tokenWhatsapp', 'assinaturaTela-tokenWhatsapp'],
					},
				},
				description: 'Country code for phone number (e.g., 55 for Brazil)',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
						authMethod: ['tokenSms', 'assinaturaTela-tokenSms', 'tokenWhatsapp', 'assinaturaTela-tokenWhatsapp'],
					},
				},
				description: 'Phone number for SMS or WhatsApp authentication',
			},
			{
				displayName: 'Lock Name',
				name: 'lockName',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Prevent the signer from changing their name',
			},
			{
				displayName: 'Lock Email',
				name: 'lockEmail',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Prevent the signer from changing their email',
			},
			{
				displayName: 'Lock Phone',
				name: 'lockPhone',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Prevent the signer from changing their phone number',
			},
			{
				displayName: 'Qualification',
				name: 'qualification',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Qualification to appear in the signature report (e.g., testemunha)',
			},
			{
				displayName: 'External ID',
				name: 'externalId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Signer ID in your application',
			},
			{
				displayName: 'Send Automatic Email',
				name: 'sendAutomaticEmail',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Send invitation to signer via email automatically',
			},
			{
				displayName: 'Send Automatic WhatsApp',
				name: 'sendAutomaticWhatsapp',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Send invitation to signer via WhatsApp automatically',
			},
			{
				displayName: 'Send WhatsApp Signed File',
				name: 'sendAutomaticWhatsappSignedFile',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Send the signed file to the signer via WhatsApp after completion',
			},
			{
				displayName: 'Require CPF',
				name: 'requireCpf',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Require CPF input from signer',
			},
			{
				displayName: 'CPF',
				name: 'cpf',
						type: 'string',
						default: '',
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'CPF number of the signer',
			},
			{
				displayName: 'Validate CPF',
				name: 'validateCpf',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Validate CPF data against Receita Federal',
			},
			{
				displayName: 'Selfie Validation Type',
				name: 'selfieValidationType',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Face Match', value: 'facematch' },
				],
						default: '',
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Type of selfie validation to perform',
			},
			{
				displayName: 'Require Document Authentication',
				name: 'requireDocAuth',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Whether to require document authentication (ID upload)',
			},
			{
				displayName: 'Require Facial Recognition',
				name: 'requireFacialRecognition',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['signer'],
						operation: ['add', 'update'],
					},
				},
				description: 'Whether to require facial recognition',
			},
			// Removed signer information for template-created documents. Signers should be created via dynamic data.
			{
				displayName: 'Template Additional Fields',
				name: 'templateAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['createDocument', 'createTemplateDocx', 'update'],
					},
				},
				description: 'Additional fields for template document creation',
				options: [
					{
						displayName: 'Language',
						name: 'lang',
						type: 'options',
						options: [
							{
								name: 'Portuguese (Brazil)',
								value: 'pt-br',
							},
							{
								name: 'English',
								value: 'en',
							},
							{
								name: 'Spanish',
								value: 'es',
							},
						],
						default: 'pt-br',
						description: 'Language for the document interface',
					},
					{
						displayName: 'Disable Signer Emails',
						name: 'disable_signer_emails',
						type: 'boolean',
						default: false,
						description: 'Disable automatic emails sent to signers (default: false)',
					},
					{
						displayName: 'Brand Logo URL',
						name: 'brand_logo',
						type: 'string',
						default: '',
						description: 'Public URL of the brand logo image',
					},
					{
						displayName: 'Brand Primary Color',
						name: 'brand_primary_color',
						type: 'color',
						default: '',
						description: 'Primary brand color in RGB or hex (e.g., "#0011ee")',
					},
					{
						displayName: 'Brand Name',
						name: 'brand_name',
						type: 'string',
						default: '',
						description: 'Brand name to appear in emails (max 100 characters)',
					},
					{
						displayName: 'External ID',
						name: 'external_id',
						type: 'string',
						default: '',
						description: 'Document ID in your application',
					},
					{
						displayName: 'Folder Path',
						name: 'folder_path',
						type: 'string',
						default: '/',
						description: 'Folder path in ZapSign; missing folders will be created automatically',
					},
					{
						displayName: 'Date Limit to Sign',
						name: 'date_limit_to_sign',
						type: 'string',
						default: '',
						description: 'Signature deadline in YYYY-MM-DD format',
					},
					{
						displayName: 'Signature Order Active',
						name: 'signature_order_active',
						type: 'boolean',
						default: false,
						description: 'Enable signature ordering between signers',
					},
					{
						displayName: 'Reminder Every N Days',
						name: 'reminder_every_n_days',
						type: 'number',
						default: 0,
						description: 'Send automatic reminders every N days (0 disables reminders)',
					},
					{
						displayName: 'Allow Refuse Signature',
						name: 'allow_refuse_signature',
						type: 'boolean',
						default: true,
						description: 'Allow signer to refuse the document',
					},
					{
						displayName: 'Created By',
						name: 'created_by',
						type: 'string',
						default: '',
						description: 'Email of the user who will be set as document creator',
					},
					{
						displayName: 'Signer Has Incomplete Fields',
						name: 'signer_has_incomplete_fields',
						type: 'boolean',
						default: false,
						description: 'Whether the signer has incomplete fields to fill',
					},
					{
						displayName: 'Allow Signer Refusal',
						name: 'allow_signer_refusal',
						type: 'boolean',
						default: false,
						description: 'Whether signers can refuse to sign the document',
					},
					{
						displayName: 'Disable Signers Get Original File',
						name: 'disable_signers_get_original_file',
						type: 'boolean',
						default: false,
						description: 'Whether signers can download the original document',
					},
					{
						displayName: 'Send Automatic WhatsApp',
						name: 'send_automatic_whatsapp',
						type: 'boolean',
						default: false,
						description: 'Whether to automatically send WhatsApp message to signer (costs R$ 0.50)',
					},
					{
						displayName: 'Send Automatic WhatsApp Signed File',
						name: 'send_automatic_whatsapp_signed_file',
						type: 'boolean',
						default: false,
						description: 'Whether to automatically send signed file via WhatsApp (costs R$ 0.50)',
					},
					{
						displayName: 'Signature Order Active',
						name: 'signature_order_active',
						type: 'boolean',
						default: false,
						description: 'Whether to request signatures sequentially',
					},
					{
						displayName: 'Folder Token',
						name: 'folder_token',
						type: 'string',
						typeOptions: { password: true },
						default: '',
						description: 'Folder token (overrides folder_path if provided)',
					},
				],
			},
			// Create Template (DOCX) specific fields
			{
				displayName: 'DOCX Source',
				name: 'docxSource',
				type: 'options',
				options: [
					{ name: 'Public URL', value: 'url' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'url',
				required: true,
				displayOptions: {
					show: { resource: ['template'], operation: ['createTemplateDocx'] },
				},
				description: 'How to provide the .docx content',
			},
			{
				displayName: 'DOCX URL',
				name: 'docxUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: { resource: ['template'], operation: ['createTemplateDocx'], docxSource: ['url'] },
				},
				description: 'Public URL to the DOCX file (max 10MB)',
			},
			{
				displayName: 'DOCX Base64',
				name: 'docxBase64',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				displayOptions: {
					show: { resource: ['template'], operation: ['createTemplateDocx'], docxSource: ['base64'] },
				},
				description: 'Base64 of the DOCX file (do not include data: prefix)',
			},
			// Update Template Form fields
			{
				displayName: 'Inputs',
				name: 'templateFormInputs',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Input',
				default: {},
				displayOptions: { show: { resource: ['template'], operation: ['updateTemplateForm'] } },
				description: 'Configure template form inputs (variables)',
				options: [
					{
						displayName: 'Input',
						name: 'input',
						values: [
							{
						displayName: 'Help Text',
						name: 'help_text',
						type: 'string',
						default: '',
							},
							{
						displayName: 'Input Type',
						name: 'input_type',
						type: 'string',
						default: 'input',
							},
							{
						displayName: 'Label',
						name: 'label',
						type: 'string',
						default: '',
							},
							{
						displayName: 'Options (Comma-Separated)',
						name: 'options',
						type: 'string',
						default: '',
							},
							{
						displayName: 'Order',
						name: 'order',
						type: 'number',
						default: 1
							},
							{
						displayName: 'Required',
						name: 'required',
						type: 'boolean',
						default: false,
							},
							{
						displayName: 'Variable',
						name: 'variable',
						type: 'string',
						default: '',
							},
						],
					},
				],
			},
			// Webhook fields
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['create'],
					},
				},
				description: 'URL to receive webhook notifications',
			},
			{
				displayName: 'Event Type',
				name: 'events',
				type: 'options',
				options: [
					{
						name: 'All Document Events (Default)',
						value: '',
						description: 'All document events (created, signed, deleted, refused)',
					},
					{
						name: 'Document Signed',
						value: 'doc_signed',
						description: 'Document signed event',
					},
					{
						name: 'Document Created',
						value: 'doc_created',
						description: 'Document created event',
					},
					{
						name: 'Document Deleted',
						value: 'doc_deleted',
						description: 'Document deleted event',
					},
					{
						name: 'Document Refused',
						value: 'doc_refused',
						description: 'Document refused event',
					},
					{
						name: 'Email Bounce',
						value: 'email_bounce',
						description: 'Email delivery failure event',
					},
				],
				default: '',
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['create'],
					},
				},
				description: 'Event type to listen for (leave empty for all document events)',
			},
			{
				displayName: 'Webhook ID',
				name: 'webhookId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['delete'],
					},
				},
				description: 'ID of the webhook to delete',
			},
			// Additional options
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create', 'createOneClick'],
					},
				},
				options: [
					{
						displayName: 'Language',
						name: 'lang',
						type: 'options',
						options: [
							{
								name: 'Portuguese (Brazil)',
								value: 'pt-br',
							},
							{
								name: 'English',
								value: 'en',
							},
							{
								name: 'Spanish',
								value: 'es',
							},
						],
						default: 'pt-br',
						description: 'Language for the document interface',
					},
					{
						displayName: 'Disable Signer Emails',
						name: 'disable_signer_emails',
						type: 'boolean',
						default: false,
						description: 'Whether to disable emails sent to signers',
					},
					{
						displayName: 'Brand Logo URL',
						name: 'brand_logo',
						type: 'string',
						default: '',
						description: 'URL of the brand logo image (must be publicly accessible)',
					},
					{
						displayName: 'Brand Primary Color',
						name: 'brand_primary_color',
						type: 'color',
						default: '',
						description: 'Primary color for branding (RGB or hex format, e.g., "#0011ee")',
					},
					{
						displayName: 'Brand Name',
						name: 'brand_name',
						type: 'string',
						default: '',
						description: 'Brand name to appear in emails (max 100 characters)',
					},
					{
						displayName: 'Allow Refuse Signature',
						name: 'allow_refuse_signature',
						type: 'boolean',
						default: true,
						description: 'Allow signer to refuse the document',
					},
					{
						displayName: 'Metadata (JSON)',
						name: 'metadata',
						type: 'string',
						typeOptions: { rows: 4 },
						default: '',
						description: 'JSON object with metadata to attach to the document (key-value pairs)',
					},
					{
						displayName: 'External ID',
						name: 'external_id',
						type: 'string',
						default: '',
						description: 'ID of the document in your application',
					},
					{
						displayName: 'Folder Path',
						name: 'folder_path',
						type: 'string',
						default: '',
						description: 'Path to folder in ZapSign (folders will be created automatically)',
					},
					{
						displayName: 'Created By',
						name: 'created_by',
						type: 'string',
						default: '',
						description: 'Email of the user who will be set as document creator',
					},
					{
						displayName: 'Date Limit to Sign',
						name: 'date_limit_to_sign',
						type: 'string',
						default: '',
						description: 'Signature deadline in YYYY-MM-DD format',
					},
					{
						displayName: 'Signature Order Active',
						name: 'signature_order_active',
						type: 'boolean',
						default: false,
						description: 'Enable signature ordering between signers',
					},
					{
						displayName: 'Reminder Every N Days',
						name: 'reminder_every_n_days',
						type: 'number',
						default: 0,
						description: 'Send automatic reminders every N days (0 disables reminders)',
					},
					{
						displayName: 'Disable Signers Get Original File',
						name: 'disable_signers_get_original_file',
						type: 'boolean',
						default: false,
						description: 'Whether signers can download the original document',
					},
					// (moved OneClick Settings to top-level parameter to avoid nested displayOptions in collections)
				],
			},
			// OneClick specific option per official docs
			{
				displayName: 'Require Signature',
				name: 'requireSignature',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['createOneClick'],
					},
				},
				description: 'When OneClick is active, require signer to accept checkbox and draw signature',
			},

			// List Documents parameters
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['getAll'],
					},
				},
				description: 'Page number (starts from 1). Each page contains 25 documents by default.',
			},
			{
				displayName: 'Folder Path',
				name: 'folderPath',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['getAll'],
					},
				},
				description: 'Filter documents by folder path (e.g., "/api/pasta2/" or "/" for root)',
			},
			{
				displayName: 'Deleted Status',
				name: 'deleted',
				type: 'options',
				options: [
					{
						name: 'All Documents',
						value: '',
						description: 'Include both deleted and non-deleted documents',
					},
					{
						name: 'Not Deleted',
						value: 'false',
						description: 'Only non-deleted documents',
					},
					{
						name: 'Deleted Only',
						value: 'true',
						description: 'Only deleted documents',
					},
				],
				default: '',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['getAll'],
					},
				},
				description: 'Filter by deletion status',
			},
			{
				displayName: 'Document Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'All Statuses',
						value: '',
						description: 'Include documents with any status',
					},
					{
						name: 'Pending',
						value: 'pending',
						description: 'Documents in progress (em andamento)',
					},
					{
						name: 'Signed',
						value: 'signed',
						description: 'Completed documents (assinado)',
					},
					{
						name: 'Refused',
						value: 'refused',
						description: 'Documents that were refused (recusado)',
					},
				],
				default: '',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['getAll'],
					},
				},
				description: 'Filter by document status',
			},
			{
				displayName: 'Created From Date',
				name: 'createdFrom',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['getAll'],
					},
				},
				description: 'Filter documents created from this date (YYYY-MM-DD format)',
			},
			{
				displayName: 'Created To Date',
				name: 'createdTo',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['getAll'],
					},
				},
				description: 'Filter documents created up to this date (YYYY-MM-DD format)',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{
						name: 'Default (Newest First)',
						value: '',
						description: 'API default sorting (newest documents first)',
					},
					{
						name: 'Ascending (Oldest First)',
						value: 'asc',
						description: 'Sort by creation date ascending (oldest first)',
					},
					{
						name: 'Descending (Newest First)',
						value: 'desc',
						description: 'Sort by creation date descending (newest first)',
					},
				],
				default: '',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['getAll'],
					},
				},
				description: 'Sort order for the results',
			},
			// Place Signatures fields
			{
				displayName: 'Rubrics',
				name: 'rubrics',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Rubric',
				default: {},
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['placeSignatures'],
					},
				},
				description: 'List of signature/rubrica placements',
				options: [
					{
						displayName: 'Rubric',
						name: 'rubric',
						values: [
							{
						displayName: 'Page (0-Based)',
						name: 'page',
						type: 'number',
						default: 0
							},
							{
						displayName: 'Relative Position Bottom',
						name: 'relative_position_bottom',
						type: 'number',
						default: 0
							},
							{
						displayName: 'Relative Position Left',
						name: 'relative_position_left',
						type: 'number',
						default: 0
							},
							{
						displayName: 'Relative Size X',
						name: 'relative_size_x',
						type: 'number',
						default: 19.55
							},
							{
						displayName: 'Relative Size Y',
						name: 'relative_size_y',
						type: 'number',
						default: 9.42
							},
							{
						displayName: 'Signer Token',
						name: 'signer_token',
						type: 'string',
						typeOptions: { password: true },
						default: '',
							},
							{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
									{
										name: 'Signature',
										value: 'signature',
									},
									{
										name: 'Visto',
										value: 'visto',
									},
								],
						default: 'signature',
							},
					],
					},
				],
			},
			// Background Check fields
			{
				displayName: 'External ID',
				name: 'bcExternalId',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['backgroundCheck'], operation: ['createPerson', 'createCompany'] } },
				description: 'Your external identifier for the check (optional)',
			},
			{
				displayName: 'Person Document (CPF)',
				name: 'personCpf',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['backgroundCheck'], operation: ['createPerson'] } },
				description: 'CPF of the person to check',
			},
			{
				displayName: 'Person Name',
				name: 'personName',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['backgroundCheck'], operation: ['createPerson'] } },
				description: 'Full name of the person (optional)',
			},
			{
				displayName: 'Force Creation',
				name: 'forceCreation',
				type: 'boolean',
				default: true,
				displayOptions: { show: { resource: ['backgroundCheck'], operation: ['createPerson'] } },
				description: 'If true, forces creation of a new check even if one already exists. If false, returns existing result.',
			},
			{
				displayName: 'Company Document (CNPJ)',
				name: 'companyCnpj',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['backgroundCheck'], operation: ['createCompany'] } },
				description: 'CNPJ of the company to check',
			},
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['backgroundCheck'], operation: ['createCompany'] } },
				description: 'Name of the company (optional)',
			},
			{
				displayName: 'Force Creation',
				name: 'forceCreation',
				type: 'boolean',
				default: true,
				displayOptions: { show: { resource: ['backgroundCheck'], operation: ['createCompany'] } },
				description: 'If true, forces creation of a new check even if one already exists. If false, returns existing result.',
			},
			{
				displayName: 'Check Token',
				name: 'checkToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				displayOptions: { show: { resource: ['backgroundCheck'], operation: ['get', 'details'] } },
				description: 'Token of the background check to retrieve',
			},
			// Partnership fields
			{
				displayName: 'Email',
				name: 'partnerEmail',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['partnership'], operation: ['createAccount'] } },
				description: 'Email of the new user who will be added as a member',
			},
			{
				displayName: 'Phone Number',
				name: 'partnerPhoneNumber',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['partnership'], operation: ['createAccount'] } },
				description: 'Phone number of the new user',
			},
			{
				displayName: 'Phone Country Code',
				name: 'partnerPhoneCountry',
				type: 'string',
				default: '55',
				displayOptions: { show: { resource: ['partnership'], operation: ['createAccount'] } },
				description: 'Country code for the phone number (e.g., 55 for Brazil)',
			},
			{
				displayName: 'Country',
				name: 'partnerCountry',
				type: 'options',
				options: [
					{ name: 'Brazil', value: 'br' },
					{ name: 'Mexico', value: 'mx' },
					{ name: 'Colombia', value: 'co' },
					{ name: 'Peru', value: 'pe' },
					{ name: 'Chile', value: 'cl' },
				],
				default: 'br',
				required: true,
				displayOptions: { show: { resource: ['partnership'], operation: ['createAccount'] } },
				description: 'Country of the new account',
			},
			{
				displayName: 'Language',
				name: 'partnerLang',
				type: 'options',
				options: [
					{ name: 'Portuguese (Brazil)', value: 'pt-br' },
					{ name: 'Spanish', value: 'es' },
					{ name: 'English', value: 'en' },
				],
				default: 'pt-br',
				required: true,
				displayOptions: { show: { resource: ['partnership'], operation: ['createAccount'] } },
				description: 'Language of the new company',
			},
			{
				displayName: 'Company Name',
				name: 'partnerCompanyName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['partnership'], operation: ['createAccount'] } },
				description: 'Name of the new company',
			},
			{
				displayName: 'Client API Token',
				name: 'clientApiToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				displayOptions: { show: { resource: ['partnership'], operation: ['updatePaymentStatus'] } },
				description: 'API token of the client account whose payment status you want to update',
			},
			{
				displayName: 'Payment Status',
				name: 'paymentStatus',
				type: 'options',
				options: [
					{ name: 'Adimplente (Up to Date)', value: 'adimplente' },
					{ name: 'Inadimplente (Default)', value: 'inadimplente' },
				],
				default: 'adimplente',
				required: true,
				displayOptions: { show: { resource: ['partnership'], operation: ['updatePaymentStatus'] } },
				description: 'Payment status to set for the client account',
			},
			// Timestamp fields
			{
				displayName: 'Document URL',
				name: 'timestampDocumentUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['timestamp'], operation: ['add'] } },
				description: 'Public URL of your document (PDF or DOCX) up to 10MB',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['getAll'],
					},
				},
				description: 'Max number of results to return',
			},

		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		console.log('ZapSign Node Execute Function Called');
		const items = this.getInputData();
		console.log(`ZapSign Node - Items length: ${items.length}`);
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);
		console.log(`ZapSign Node - Resource: ${resource}, Operation: ${operation}`);

		// Resolve base URL from credentials once, allowing env override
		const credentials = await this.getCredentials('zapSignApi');
		const sandboxApiBaseUrl = process.env.ZAPSIGN_API_BASE_URL_SANDBOX || 'https://sandbox.api.zapsign.com.br';
		const prodApiBaseUrl = process.env.ZAPSIGN_API_BASE_URL || 'https://api.zapsign.com.br';
		const baseUrl = credentials?.environment === 'sandbox' ? sandboxApiBaseUrl : prodApiBaseUrl;


		for (let i = 0; i < items.length; i++) {
			try {
				this.logger.info(`Processing item ${i + 1}/${items.length} - Resource: ${resource}, Operation: ${operation}`);
				if (resource === 'document') {
					if (operation === 'create') {
						// Create document
						const name = this.getNodeParameter('name', i) as string;
						const fileInputType = this.getNodeParameter('fileInputType', i) as string;
						let binaryData: Buffer = Buffer.from('');
						let fileName: string;
						let mimeType: string;

						if (fileInputType === 'file') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryDataObj = this.helpers.assertBinaryData(i, binaryPropertyName);
							binaryData = Buffer.from(binaryDataObj.data, 'base64');
							fileName = binaryDataObj.fileName || 'document.pdf';
							mimeType = binaryDataObj.mimeType || 'application/pdf';
						} else if (fileInputType === 'base64') {
							const base64Content = this.getNodeParameter('base64Content', i) as string;
							fileName = this.getNodeParameter('fileName', i) as string;
							mimeType = this.getNodeParameter('fileMimeType', i) as string;
							binaryData = Buffer.from(base64Content, 'base64');
						} else if (fileInputType === 'url') {
							const fileUrl = this.getNodeParameter('fileUrl', i) as string;
							try {
								const response = await this.helpers.request({
									method: 'GET',
									url: fileUrl,
									encoding: null, // Get binary data
								});
								binaryData = response as Buffer;
								fileName = fileUrl.split('/').pop() || 'document.pdf'; // Attempt to get filename from URL
								// Determine MIME type from file extension
								const fileExtension = fileName.split('.').pop()?.toLowerCase();
								mimeType = getMimeTypeFromExtension(fileExtension);
							} catch (error) {
								throw new NodeOperationError(this.getNode(), `Failed to download file from URL: ${error.message}`, {
									itemIndex: i,
								});
							}
						} else if (fileInputType === 'markdown') {
							// Markdown content does not require binary handling
							fileName = 'markdown.md';
							mimeType = 'text/markdown';
						} else if (fileInputType === 'markdown') {
							// Markdown content does not require binary handling
							fileName = 'markdown.md';
							mimeType = 'text/markdown';
						} else {
							throw new NodeOperationError(this.getNode(), 'Invalid file input type selected.', {
								itemIndex: i,
							});
						}

						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						// Parse metadata if provided as JSON string
						if (additionalFields && typeof additionalFields.metadata === 'string' && (additionalFields.metadata as string).trim() !== '') {
							try {
								additionalFields.metadata = JSON.parse(additionalFields.metadata as string) as IDataObject;
							} catch (e) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in Metadata field. Please provide a valid JSON object string.', { itemIndex: i });
							}
						}

						// According to ZapSign API docs, we need to send JSON with specific parameters
						const body: IDataObject = {
							name,
							...additionalFields,
						};

						// Add file content based on input type
						if (fileInputType === 'markdown') {
							body.markdown_text = this.getNodeParameter('markdownText', i) as string;
						} else if (fileInputType === 'base64') {
							// For base64, use the appropriate parameter based on file type
							if (mimeType === 'application/pdf') {
								body.base64_pdf = this.getNodeParameter('base64Content', i) as string;
							} else if (mimeType.includes('word') || mimeType.includes('document')) {
								body.base64_docx = this.getNodeParameter('base64Content', i) as string;
							} else {
								// For other file types, use base64_pdf as fallback
								body.base64_pdf = this.getNodeParameter('base64Content', i) as string;
							}
						} else if (fileInputType === 'url') {
							// For URL, use the appropriate parameter based on file type
							if (mimeType === 'application/pdf') {
								body.url_pdf = this.getNodeParameter('fileUrl', i) as string;
							} else if (mimeType.includes('word') || mimeType.includes('document')) {
								body.url_docx = this.getNodeParameter('fileUrl', i) as string;
							} else {
								// For other file types, use url_pdf as fallback
								body.url_pdf = this.getNodeParameter('fileUrl', i) as string;
							}
						} else if (fileInputType === 'file') {
							// For file upload, convert to base64 and use appropriate parameter
							const base64Content = binaryData.toString('base64');
							if (mimeType === 'application/pdf') {
								body.base64_pdf = base64Content;
							} else if (mimeType.includes('word') || mimeType.includes('document')) {
								body.base64_docx = base64Content;
							} else {
								// For other file types, use base64_pdf as fallback
								body.base64_pdf = base64Content;
							}
						}

						// Add signers array (required by API)
						const signersCollection = this.getNodeParameter('signers', i) as IDataObject;
						const signerEntries = (signersCollection?.signer as IDataObject[]) || [];
						if (!Array.isArray(signerEntries) || signerEntries.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one signer is required. Add one or more signers.', {
								itemIndex: i,
							});
						}
						body.signers = mapSignerEntries(signerEntries);

						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/docs/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};

						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);

					} else if (operation === 'refuse') {
						// Refuse document (alias of cancel)
						const documentToken = this.getNodeParameter('documentToken', i) as string;
						const rejectedReason = this.getNodeParameter('rejectedReason', i) as string;

						// Add debug logging
						this.logger.debug(`Refuse Document Request - Document Token: ${documentToken}`);
						this.logger.debug(`Refuse Document Request - Rejected Reason: ${rejectedReason}`);
						this.logger.debug(`Refuse Document Request - Base URL: ${baseUrl}`);

						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/refuse/`,
							body: { 
								doc_token: documentToken,
								rejected_reason: rejectedReason
							},
							headers: {
								'Content-Type': 'application/json'
							},
						};

						this.logger.debug(`Refuse Document Request - URL: ${options.url}`);
						this.logger.debug(`Refuse Document Request - Body: ${JSON.stringify(options.body)}`);

						try {
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Refuse Document Error: ${error.message}`);
							this.logger.error(`Refuse Document Request Options: ${JSON.stringify(options)}`);
							
							// Provide specific error messages based on common issues
							if (error.message.includes('400') || error.message.includes('Bad request')) {
								throw new NodeOperationError(this.getNode(), 
									`Document cannot be refused (400 Bad Request).\n\n` +
									`According to ZapSign API documentation, the document must meet these conditions:\n` +
									`1. Document status must be "Em andamento" (In progress)\n` +
									`2. Document must have been created with 'allow_refuse_signature: true'\n` +
									`3. Document must not be completed, expired, or in an invalid state\n\n` +
									`Possible solutions:\n` +
									`- Check if the document is still in progress\n` +
									`- Verify the document was created with refuse permission enabled\n` +
									`- Ensure the document token is valid and active\n\n` +
									`Technical details:\n` +
									`- Document Token: ${documentToken}\n` +
									`- API Endpoint: ${options.url}\n` +
									`- Status: 400 (Bad Request)`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}

					} else if (operation === 'createOneClick') {
						// Create OneClick document (simplified consent)
						const name = this.getNodeParameter('name', i) as string;
						const fileInputType = this.getNodeParameter('fileInputType', i) as string;
						let binaryData: Buffer = Buffer.from('');
						let fileName: string;
						let mimeType: string;

						if (fileInputType === 'file') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryDataObj = this.helpers.assertBinaryData(i, binaryPropertyName);
							binaryData = Buffer.from(binaryDataObj.data, 'base64');
							fileName = binaryDataObj.fileName || 'document.pdf';
							mimeType = binaryDataObj.mimeType || 'application/pdf';
						} else if (fileInputType === 'base64') {
							const base64Content = this.getNodeParameter('base64Content', i) as string;
							fileName = this.getNodeParameter('fileName', i) as string;
							mimeType = this.getNodeParameter('fileMimeType', i) as string;
							binaryData = Buffer.from(base64Content, 'base64');
						} else if (fileInputType === 'url') {
							const fileUrl = this.getNodeParameter('fileUrl', i) as string;
							try {
								const response = await this.helpers.request({
									method: 'GET',
									url: fileUrl,
									encoding: null, // Get binary data
								});
								binaryData = response as Buffer;
								fileName = fileUrl.split('/').pop() || 'document.pdf';
								const fileExtension = fileName.split('.').pop()?.toLowerCase();
								mimeType = getMimeTypeFromExtension(fileExtension);
							} catch (error) {
								throw new NodeOperationError(this.getNode(), `Failed to download file from URL: ${error.message}`, {
									itemIndex: i,
								});
							}
						} else {
							throw new NodeOperationError(this.getNode(), 'Invalid file input type selected.', {
								itemIndex: i,
							});
						}

						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const requireSignature = this.getNodeParameter('requireSignature', i, false) as boolean;
						// Parse metadata if provided via additionalFields in OneClick as well
						const additionalFieldsOC = this.getNodeParameter('additionalFields', i) as IDataObject;
						if (additionalFieldsOC && typeof additionalFieldsOC.metadata === 'string' && (additionalFieldsOC.metadata as string).trim() !== '') {
							try {
								additionalFieldsOC.metadata = JSON.parse(additionalFieldsOC.metadata as string) as IDataObject;
							} catch (e) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in Metadata field. Please provide a valid JSON object string.', { itemIndex: i });
							}
						}

						// Build OneClick document body
						const body: IDataObject = {
							name,
							...additionalFields,
						};

						// Add OneClick specific parameters
						body.one_click_active = true;
						if (requireSignature) {
							body.require_signature = true;
						}

						// Add file content based on input type
						if ((fileInputType as string) === 'markdown') {
							throw new NodeOperationError(this.getNode(), 'Markdown input is not supported for OneClick. Use file, base64 or url.', { itemIndex: i });
						} else if (fileInputType === 'base64') {
							// For base64, use the appropriate parameter based on file type
							if (mimeType === 'application/pdf') {
								body.base64_pdf = this.getNodeParameter('base64Content', i) as string;
							} else if (mimeType.includes('word') || mimeType.includes('document')) {
								body.base64_docx = this.getNodeParameter('base64Content', i) as string;
							} else {
								// For other file types, use base64_pdf as fallback
								body.base64_pdf = this.getNodeParameter('base64Content', i) as string;
							}
						} else if (fileInputType === 'url') {
							// For URL, use the appropriate parameter based on file type
							if (mimeType === 'application/pdf') {
								body.url_pdf = this.getNodeParameter('fileUrl', i) as string;
							} else if (mimeType.includes('word') || mimeType.includes('document')) {
								body.url_docx = this.getNodeParameter('fileUrl', i) as string;
							} else {
								// For other file types, use url_pdf as fallback
								body.url_pdf = this.getNodeParameter('fileUrl', i) as string;
							}
						} else if (fileInputType === 'file') {
							const base64Content = binaryData.toString('base64');
							if (mimeType === 'application/pdf') {
								body.base64_pdf = base64Content;
							} else if (mimeType.includes('word') || mimeType.includes('document')) {
								body.base64_docx = base64Content;
							} else {
								body.base64_pdf = base64Content;
							}
						}

						// For OneClick, accept multiple signers as well
						const signersCollectionOC = this.getNodeParameter('signers', i) as IDataObject;
						const signerEntriesOC = (signersCollectionOC?.signer as IDataObject[]) || [];
						if (!Array.isArray(signerEntriesOC) || signerEntriesOC.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one signer is required. Add one or more signers.', {
								itemIndex: i,
							});
						}
						body.signers = mapOneClickSignerEntries(signerEntriesOC);

						// one_click_active already set above

						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/docs/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};

						try {
						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Create Document Error: ${error.message}`);
							this.logger.error(`Create Document Request Options: ${JSON.stringify(options)}`);
							
							// Provide specific error messages based on common issues
							if (error.message.includes('400') || error.message.includes('Bad request')) {
								throw new NodeOperationError(this.getNode(), 
									`Document creation failed (400 Bad Request).\n\n` +
									`Common issues that cause this error:\n` +
									`1. Missing or invalid signer email address\n` +
									`2. Invalid file format or corrupted file data\n` +
									`3. Missing required fields (name, signers, etc.)\n` +
									`4. Invalid authentication mode or signer configuration\n` +
									`5. File size exceeds limits or unsupported format\n\n` +
									`Please check:\n` +
									`- Ensure all signers have valid email addresses (unless blank_email is enabled)\n` +
									`- Verify the file content and format are valid\n` +
									`- Check that all required fields are properly filled\n` +
									`- Validate signer configuration and authentication modes\n\n` +
									`Technical details:\n` +
									`- API Endpoint: ${options.url}\n` +
									`- Status: 400 (Bad Request)\n` +
									`- Document Name: ${this.getNodeParameter('name', i)}\n` +
									`- File Type: ${this.getNodeParameter('fileInputType', i)}`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}

					} else if (operation === 'get') {
						// Get document details according to ZapSign API documentation
						const documentToken = this.getNodeParameter('documentToken', i) as string;

						const options: IRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/api/v1/docs/${documentToken}/`,
						};

						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);

					} else if (operation === 'getAll') {
						// List documents according to ZapSign API documentation
						const page = this.getNodeParameter('page', i) as number;
						const folderPath = this.getNodeParameter('folderPath', i) as string;
						const deleted = this.getNodeParameter('deleted', i) as string;
						const status = this.getNodeParameter('status', i) as string;
						const createdFrom = this.getNodeParameter('createdFrom', i) as string;
						const createdTo = this.getNodeParameter('createdTo', i) as string;
						const sortOrder = this.getNodeParameter('sortOrder', i) as string;

						// Build query parameters according to ZapSign API documentation
						const qs: IDataObject = {
							page,
						};

						// Add optional query parameters if provided
						if (folderPath) {
							qs.folder_path = folderPath;
						}
						if (deleted) {
							qs.deleted = deleted;
						}
						if (status) {
							qs.status = status;
						}
						if (createdFrom) {
							qs.created_from = createdFrom;
						}
						if (createdTo) {
							qs.created_to = createdTo;
						}
						if (sortOrder) {
							qs.sort_order = sortOrder;
						}

						const options: IRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/api/v1/docs/`,
							qs,
						};

						const responseData = await requestJson(this, options);
						// The API returns a paginated response with count, next, previous, and results
						// Handle both the paginated response structure and direct array responses
						if (responseData && typeof responseData === 'object' && 'results' in (responseData as IDataObject)) {
							// Paginated response
							pushResult(returnData, responseData as IDataObject);
						} else if (Array.isArray(responseData)) {
							// Direct array response
							pushResult(returnData, responseData as IDataObject[]);
						} else {
							// Single object response
							pushResult(returnData, responseData as IDataObject);
						}

					} else if (operation === 'cancel') {
						// Cancel document
						const documentToken = this.getNodeParameter('documentToken', i) as string;
						const rejectedReason = this.getNodeParameter('rejectedReason', i) as string;

						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/refuse/`,
							body: { doc_token: documentToken, rejected_reason: rejectedReason },
							headers: {
								'Content-Type': 'application/json',
								'User-Agent': 'n8n-nodes-zapsign/1.0',
							},
						};

						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);

					} else if (operation === 'activityHistory') {
						// Get document activity history
						const documentToken = this.getNodeParameter('documentToken', i) as string;
						if (!documentToken || typeof documentToken !== 'string' || documentToken.trim() === '') {
							throw new NodeOperationError(this.getNode(), 'Document Token is required for getting activity history.', { itemIndex: i });
						}
						const downloadPdf = this.getNodeParameter('downloadPdf', i, false) as boolean;
						
						// Log the request details for debugging
						this.logger.debug(`Activity History Request - URL: ${baseUrl}/api/v1/docs/signer-log/${documentToken}?download_pdf=${downloadPdf}`);
						
						const options: IRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/api/v1/docs/signer-log/${documentToken}?download_pdf=${downloadPdf}`,
						};
						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
					} else if (operation === 'delete') {
						// Delete document (soft delete)
						const documentToken = this.getNodeParameter('documentToken', i) as string;
						const options: IRequestOptions = {
							method: 'DELETE',
							url: `${baseUrl}/api/v1/docs/${documentToken}/`,
						};
						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
					} else if (operation === 'update') {
						// Update document data while in progress
						const documentToken = this.getNodeParameter('documentToken', i) as string;
						const newDocumentName = this.getNodeParameter('newDocumentName', i, '') as string;
						const newDateLimitToSign = this.getNodeParameter('newDateLimitToSign', i, '') as string;
						const newFolderPath = this.getNodeParameter('newFolderPath', i, '') as string;
						const newFolderToken = this.getNodeParameter('newFolderToken', i, '') as string;
						const extraDocsToRename = this.getNodeParameter('extraDocsToRename', i, {}) as IDataObject;

						// Build request body according to ZapSign API documentation
						const body: IDataObject = {};

						// Add optional fields if provided
						if (newDocumentName) body.name = newDocumentName;
						if (newDateLimitToSign) body.date_limit_to_sign = newDateLimitToSign;
						if (newFolderPath) body.folder_path = newFolderPath;
						if (newFolderToken) body.folder_token = newFolderToken;

						// Handle extra documents renaming if provided
						if (extraDocsToRename && Object.keys(extraDocsToRename).length > 0) {
							const extraDocToken = extraDocsToRename.extraDocToken as string;
							const newExtraDocName = extraDocsToRename.newExtraDocName as string;
							
							if (extraDocToken && newExtraDocName) {
								body.extra_docs = [{
									token: extraDocToken,
									name: newExtraDocName
								}];
							}
						}

						// Log the request for debugging
						this.logger.debug(`Update Document Request - Document Token: ${documentToken}`);
						this.logger.debug(`Update Document Request - Body: ${JSON.stringify(body)}`);

						const options: IRequestOptions = {
							method: 'PUT',
							url: `${baseUrl}/api/v1/docs/${documentToken}/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};

						try {
							const responseData = await requestJson(this, options);
							this.logger.debug(`Update Document Response: ${JSON.stringify(responseData)}`);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Update Document Error: ${error.message}`);
							throw error;
						}
					} else if (operation === 'placeSignatures') {
						// Place signatures/rubricas by coordinates
						const documentToken = this.getNodeParameter('documentToken', i, '') as string;
						if (!documentToken || typeof documentToken !== 'string' || documentToken.trim() === '') {
							throw new NodeOperationError(this.getNode(), 'Document Token is required for placing signatures.', { itemIndex: i });
						}
						const rubrics = this.getNodeParameter('rubrics', i, { rubric: [] }) as IDataObject;
						const entries = (rubrics?.rubric as IDataObject[]) || [];
						const body: IDataObject = { rubricas: entries.map((r) => ({
							type: (r.type as string) || 'signature',
							page: (r.page as number) ?? 0,
							relative_size_x: (r.relative_size_x as number) ?? 19.55,
							relative_size_y: (r.relative_size_y as number) ?? 9.42,
							relative_position_bottom: (r.relative_position_bottom as number) ?? 0,
							relative_position_left: (r.relative_position_left as number) ?? 0,
							signer_token: (r.signer_token as string) || '',
						})).filter((e) => e.signer_token) };
						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/docs/${documentToken}/place-signatures/`,
							body,
						};
						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
					} else if (operation === 'validateSignatures') {
						// Validate signatures for a PDF file via upload
						const binaryPropertyName = this.getNodeParameter('validateBinaryPropertyName', i) as string;
						const binaryDataObj = this.helpers.assertBinaryData(i, binaryPropertyName);
						const fileData = Buffer.from(binaryDataObj.data, 'base64');
						const fileName = binaryDataObj.fileName || 'document.pdf';
						const contentType = binaryDataObj.mimeType || 'application/pdf';

						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/validate-pdf-signature`,
							formData: {
								file: {
									value: fileData,
									options: {
										filename: fileName,
										contentType: contentType,
									},
								},
							},
						};

						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
					} else if (operation === 'addExtraDocument') {
						// Add extra document/attachment to main document
						const documentToken = this.getNodeParameter('documentToken', i) as string;
						const extraDocumentName = this.getNodeParameter('extraDocumentName', i) as string;
						const extraDocumentFileInputType = this.getNodeParameter('extraDocumentFileInputType', i) as string;

						// Build request body according to ZapSign API documentation
						const body: IDataObject = {
							name: extraDocumentName,
						};

						// Add file content based on input type
						if (extraDocumentFileInputType === 'url') {
							const extraDocumentUrl = this.getNodeParameter('extraDocumentUrl', i) as string;
							body.url_pdf = extraDocumentUrl;
						} else if (extraDocumentFileInputType === 'base64') {
							const extraDocumentBase64 = this.getNodeParameter('extraDocumentBase64', i) as string;
							body.base64_pdf = extraDocumentBase64;
						}

						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/docs/${documentToken}/upload-extra-doc/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};

						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
					} else if (operation === 'addExtraDocumentFromTemplate') {
						// Add extra document from template with variable replacement
						const documentToken = this.getNodeParameter('documentToken', i) as string;
						const templateToken = this.getNodeParameter('extraDocumentTemplateToken', i) as string;
						const extraDocTemplateData = this.getNodeParameter('extraDocumentTemplateData', i) as IDataObject;

						// Build request body according to ZapSign API documentation
						const body: IDataObject = {
							template_id: templateToken,
						};

						// Add template data (variables) if provided (fixedCollection -> array of {de, para})
						const variables = (extraDocTemplateData?.variable as IDataObject[]) || [];
						
						this.logger.debug(`Add Extra Document from Template - Template Data: ${JSON.stringify(extraDocTemplateData)}`);
						this.logger.debug(`Add Extra Document from Template - Variables: ${JSON.stringify(variables)}`);
						
						if (Array.isArray(variables) && variables.length > 0) {
							const dataArray = variables
								.map((entry) => ({ de: (entry.variableName as string) || '', para: (entry.variableValue as string) || '' }))
								.filter((v) => v.de && v.para);
							
							this.logger.debug(`Add Extra Document from Template - Data Array: ${JSON.stringify(dataArray)}`);
							
							// Validate that we have at least one valid variable
							if (dataArray.length === 0) {
								this.logger.warn('No valid template variables found. All variables must have both name and value.');
							} else {
								// Validate variable format according to ZapSign API docs
								const invalidVars = dataArray.filter(v => !v.de.trim() || !v.para.trim());
								if (invalidVars.length > 0) {
									this.logger.warn(`Some template variables have empty names or values: ${JSON.stringify(invalidVars)}`);
								}
								
								// Only add valid variables to the request
								const validVars = dataArray.filter(v => v.de.trim() && v.para.trim());
								if (validVars.length > 0) {
									body.data = validVars;
									this.logger.debug(`Added ${validVars.length} valid template variables to request`);
								}
							}
						}
						
						// Log the final request body for debugging
						this.logger.debug(`Add Extra Document from Template - Final Body: ${JSON.stringify(body)}`);
						this.logger.debug(`Add Extra Document from Template - Body Keys: ${Object.keys(body)}`);
						
						// Final validation: ensure we have the minimum required fields
						const requiredFields = ['template_id'];
						const missingFields = requiredFields.filter(field => !body[field]);
						if (missingFields.length > 0) {
							throw new NodeOperationError(this.getNode(), 
								`Missing required fields for extra document creation: ${missingFields.join(', ')}. ` +
								`Please ensure you have provided a template token.`
							);
						}
						
						// Log what we're about to send
						this.logger.info(`Adding extra document from template with: template_id=${body.template_id}, variables=${Array.isArray(body.data) ? body.data.length : 0}`);
						
						// Log the complete request body for debugging
						this.logger.debug(`Add Extra Document from Template - Complete request body: ${JSON.stringify(body, null, 2)}`);
						
						// According to ZapSign API docs for extra documents
						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/docs/${documentToken}/extra-docs/`,
							body,
						};

						this.logger.debug(`Add Extra Document from Template - URL: ${options.url}`);

						try {
						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Add Extra Document from Template Error: ${error.message}`);
							this.logger.error(`Add Extra Document from Template Request Options: ${JSON.stringify(options)}`);
							
							// Provide more specific error messages based on common issues
							if (error.message.includes('400') || error.message.includes('Bad Request')) {
								throw new NodeOperationError(this.getNode(), 
									`Bad request - please check your parameters. Common issues:\n` +
									`1. Template token is invalid or expired\n` +
									`2. Template variables have invalid names or values\n` +
									`3. Required fields are missing\n\n` +
									`Request body: ${JSON.stringify(body)}`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}
					} else if (operation === 'reorderEnvelope') {
						// Reorder documents within an envelope
						const documentToken = this.getNodeParameter('documentToken', i) as string;
						const documentDisplayOrder = this.getNodeParameter('documentDisplayOrder', i) as IDataObject;

						// Build request body according to ZapSign API documentation
						const body: IDataObject = {};

						// Extract document tokens from the fixed collection
						if (documentDisplayOrder && documentDisplayOrder.documentToken) {
							const tokens = Array.isArray(documentDisplayOrder.documentToken) 
								? documentDisplayOrder.documentToken 
								: [documentDisplayOrder.documentToken];
							
							// Filter out empty tokens and create the document_display_order array
							const validTokens = tokens.filter((token: IDataObject) => {
								const docToken = token.token;
								return typeof docToken === 'string' && docToken.trim() !== '';
							});
							
							if (validTokens.length > 0) {
								body.document_display_order = validTokens.map((token: IDataObject) => token.token as string);
							}
						}

						// Validate that we have at least one document token
						if (!body.document_display_order || (Array.isArray(body.document_display_order) && body.document_display_order.length === 0)) {
							throw new NodeOperationError(this.getNode(), 'At least one document token is required for reordering. Please add document tokens to the Document Display Order field.', {
								itemIndex: i,
							});
						}

						// Log the request details for debugging
						this.logger.debug(`Reorder Envelope Request - URL: ${baseUrl}/api/v1/docs/${documentToken}/document-display-order/`);
						this.logger.debug(`Reorder Envelope Request - Body: ${JSON.stringify(body)}`);

						const options: IRequestOptions = {
							method: 'PUT',
							url: `${baseUrl}/api/v1/docs/${documentToken}/document-display-order/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};

						const responseData = await requestJson(this, options);
						
						// Log the response for debugging
						this.logger.debug(`Reorder Envelope Response: ${JSON.stringify(responseData)}`);
						
						// Ensure we have valid response data before pushing
						if (responseData) {
						pushResult(returnData, responseData);
						} else {
							// If no response data, create a success message
							pushResult(returnData, {
								success: true,
								message: 'Documents reordered successfully',
								documentToken,
								documentDisplayOrder: body.document_display_order
							});
						}
						
						this.logger.info(`Reorder Envelope operation completed successfully for item ${i + 1}`);
					}

				} else if (resource === 'signer') {
					const signerHandlers: Record<string, (idx: number) => Promise<void>> = {
						add: async (idx: number) => {
							const documentToken = this.getNodeParameter('signerDocumentToken', idx) as string;
							const signerEmail = this.getNodeParameter('signerEmail', idx) as string;
							const signerName = this.getNodeParameter('signerName', idx) as string;
							const authMethod = this.getNodeParameter('authMethod', idx) as string;
							const phoneCountry = this.getNodeParameter('phoneCountry', idx, '') as string;
							const phoneNumber = this.getNodeParameter('phoneNumber', idx, '') as string;
							const redirectLink = this.getNodeParameter('redirectLink', idx, '') as string;
							const requireDocAuth = this.getNodeParameter('requireDocAuth', idx) as boolean;
							const requireFacialRecognition = this.getNodeParameter('requireFacialRecognition', idx) as boolean;

						const body: IDataObject = {
							email: signerEmail,
							name: signerName,
								auth_mode: authMethod,
								require_document_photo: requireDocAuth,
								require_selfie_photo: requireFacialRecognition,
							};

							if (redirectLink) body.redirect_link = redirectLink;
							if (phoneCountry) body.phone_country = phoneCountry;
							if (phoneNumber) body.phone_number = phoneNumber;

							const lockName = this.getNodeParameter('lockName', idx, false) as boolean;
							const lockEmail = this.getNodeParameter('lockEmail', idx, false) as boolean;
							const lockPhone = this.getNodeParameter('lockPhone', idx, false) as boolean;
							const qualification = this.getNodeParameter('qualification', idx, '') as string;
							const externalId = this.getNodeParameter('externalId', idx, '') as string;
							const sendAutomaticEmail = this.getNodeParameter('sendAutomaticEmail', idx, true) as boolean;
							const sendAutomaticWhatsapp = this.getNodeParameter('sendAutomaticWhatsapp', idx, false) as boolean;
							const sendAutomaticWhatsappSignedFile = this.getNodeParameter('sendAutomaticWhatsappSignedFile', idx, false) as boolean;
							const requireCpf = this.getNodeParameter('requireCpf', idx, false) as boolean;
							const cpf = this.getNodeParameter('cpf', idx, '') as string;
							const validateCpf = this.getNodeParameter('validateCpf', idx, false) as boolean;
							const selfieValidationType = this.getNodeParameter('selfieValidationType', idx, '') as string;

							if (lockName) body.lock_name = lockName;
							if (lockEmail) body.lock_email = lockEmail;
							if (lockPhone) body.lock_phone = lockPhone;
							if (qualification) body.qualification = qualification;
							if (externalId) body.external_id = externalId;
							if (sendAutomaticEmail !== undefined) body.send_automatic_email = sendAutomaticEmail;
							if (sendAutomaticWhatsapp !== undefined) body.send_automatic_whatsapp = sendAutomaticWhatsapp;
							if (sendAutomaticWhatsappSignedFile !== undefined) body.send_automatic_whatsapp_signed_file = sendAutomaticWhatsappSignedFile;
							if (requireCpf !== undefined) body.require_cpf = requireCpf;
							if (cpf) body.cpf = cpf;
							if (validateCpf !== undefined) body.validate_cpf = validateCpf;
							if (selfieValidationType) body.selfie_validation_type = selfieValidationType;

						const options: IRequestOptions = {
							method: 'POST',
								url: `${baseUrl}/api/v1/docs/${documentToken}/add-signer/`,
							body,
						};
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						},
						remove: async (idx: number) => {
							const signerToken = this.getNodeParameter('signerToken', idx) as string;
						const options: IRequestOptions = {
							method: 'DELETE',
								url: `${baseUrl}/api/v1/signer/${encodeURIComponent(signerToken)}/remove/`,
							};
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						},
						update: async (idx: number) => {
							const signerToken = this.getNodeParameter('signerToken', idx) as string;
							const signerName = this.getNodeParameter('signerName', idx) as string;
							const authMethod = this.getNodeParameter('authMethod', idx) as string;
							const phoneCountry = this.getNodeParameter('phoneCountry', idx, '') as string;
							const phoneNumber = this.getNodeParameter('phoneNumber', idx, '') as string;
							const redirectLink = this.getNodeParameter('redirectLink', idx, '') as string;
							const requireDocAuth = this.getNodeParameter('requireDocAuth', idx) as boolean;
							const requireFacialRecognition = this.getNodeParameter('requireFacialRecognition', idx) as boolean;
							const newSignerEmail = this.getNodeParameter('newSignerEmail', idx, '') as string;
							const lockName = this.getNodeParameter('lockName', idx, false) as boolean;
							const lockEmail = this.getNodeParameter('lockEmail', idx, false) as boolean;
							const lockPhone = this.getNodeParameter('lockPhone', idx, false) as boolean;
							const qualification = this.getNodeParameter('qualification', idx, '') as string;
							const externalId = this.getNodeParameter('externalId', idx, '') as string;
							const sendAutomaticEmail = this.getNodeParameter('sendAutomaticEmail', idx, undefined) as boolean | undefined;
							const sendAutomaticWhatsapp = this.getNodeParameter('sendAutomaticWhatsapp', idx, undefined) as boolean | undefined;
							const sendAutomaticWhatsappSignedFile = this.getNodeParameter('sendAutomaticWhatsappSignedFile', idx, undefined) as boolean | undefined;
							const requireCpf = this.getNodeParameter('requireCpf', idx, undefined) as boolean | undefined;
							const cpf = this.getNodeParameter('cpf', idx, '') as string;
							const validateCpf = this.getNodeParameter('validateCpf', idx, undefined) as boolean | undefined;
							const selfieValidationType = this.getNodeParameter('selfieValidationType', idx, '') as string;

							const body: IDataObject = {};
							if (signerName) body.name = signerName;
							if (newSignerEmail) body.email = newSignerEmail;
							if (authMethod) body.auth_mode = authMethod;
							if (phoneCountry) body.phone_country = phoneCountry;
							if (phoneNumber) body.phone_number = phoneNumber;
							if (redirectLink) body.redirect_link = redirectLink;
							if (requireDocAuth !== undefined) body.require_document_photo = requireDocAuth;
							if (requireFacialRecognition !== undefined) body.require_selfie_photo = requireFacialRecognition;
							if (lockName !== undefined) body.lock_name = lockName;
							if (lockEmail !== undefined) body.lock_email = lockEmail;
							if (lockPhone !== undefined) body.lock_phone = lockPhone;
							if (qualification) body.qualification = qualification;
							if (externalId) body.external_id = externalId;
							if (sendAutomaticEmail !== undefined) body.send_automatic_email = sendAutomaticEmail;
							if (sendAutomaticWhatsapp !== undefined) body.send_automatic_whatsapp = sendAutomaticWhatsapp;
							if (sendAutomaticWhatsappSignedFile !== undefined) body.send_automatic_whatsapp_signed_file = sendAutomaticWhatsappSignedFile;
							if (requireCpf !== undefined) body.require_cpf = requireCpf;
							if (cpf) body.cpf = cpf;
							if (validateCpf !== undefined) body.validate_cpf = validateCpf;
							if (selfieValidationType) body.selfie_validation_type = selfieValidationType;

						const options: IRequestOptions = {
								method: 'POST',
								url: `${baseUrl}/api/v1/signers/${encodeURIComponent(signerToken)}/`,
							body,
							};
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						},
						get: async (idx: number) => {
							const signerToken = this.getNodeParameter('signerToken', idx) as string;
							const options: IRequestOptions = {
								method: 'GET',
								url: `${baseUrl}/api/v1/signers/${encodeURIComponent(signerToken)}/`,
							};
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						},
						resetAttempts: async (idx: number) => {
							const signerToken = this.getNodeParameter('signerToken', idx) as string;
							if (!signerToken || typeof signerToken !== 'string' || signerToken.trim() === '') {
								throw new NodeOperationError(this.getNode(), 'Signer Token is required for resetting validation attempts.', { itemIndex: idx });
							}
							
							// Log the request details for debugging
							this.logger.debug(`Reset Attempts Request - URL: ${baseUrl}/api/v1/reset-auth-attempts/${encodeURIComponent(signerToken)}`);
							this.logger.debug(`Reset Attempts Request - Signer Token: ${signerToken}`);
							this.logger.debug(`Reset Attempts Request - Base URL: ${baseUrl}`);
							
							const options: IRequestOptions = {
								method: 'PUT',
								url: `${baseUrl}/api/v1/reset-auth-attempts/${encodeURIComponent(signerToken)}`,
							};
							
							try {
								const responseData = await requestJson(this, options);
								pushResult(returnData, responseData);
							} catch (error) {
								this.logger.error(`Reset Attempts Error: ${error.message}`);
								this.logger.error(`Reset Attempts Request Options: ${JSON.stringify(options)}`);
								throw error;
							}
						},
					};

					const signerHandler = signerHandlers[operation as string];
					if (!signerHandler) {
						throw new NodeOperationError(this.getNode(), `Unsupported signer operation: ${operation}`, { itemIndex: i });
					}
					await signerHandler(i);

				} else if (resource === 'template') {
					if (operation === 'getAll') {
						// Get all templates
						const limit = this.getNodeParameter('limit', i) as number;

						const options: IRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/api/v1/templates`,
							qs: {
								limit,
							},
						};

						const responseData = await requestJson(this, options);

						if (Array.isArray(responseData)) {
							pushResult(returnData, responseData as IDataObject[]);
						} else {
							pushResult(returnData, responseData as IDataObject);
						}

					} else if (operation === 'createDocument') {
						// Create document from template
						const templateToken = this.getNodeParameter('templateToken', i) as string;
						const name = this.getNodeParameter('name', i) as string;

						// Validate required template token
						if (!templateToken || templateToken.trim() === '') {
							throw new NodeOperationError(this.getNode(), 'Template Token is required for template document creation');
						}
						
						// Basic validation for template token format (should be a UUID-like string)
						if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(templateToken.trim())) {
							this.logger.warn(`Template token format may be invalid. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. Got: ${templateToken}`);
						}

						// Add debug logging
						this.logger.debug(`Create Document from Template Request - Template Token: ${templateToken}`);
						this.logger.debug(`Create Document from Template Request - Name: ${name}`);
						this.logger.debug(`Create Document from Template Request - Base URL: ${baseUrl}`);

						const body: IDataObject = {
							template_id: templateToken,
						};

						// Add optional parameters if provided
						if (name) {
							body.name = name;
						}

						// Add signer information - according to ZapSign API docs, only basic fields are supported for template documents
						// For template documents, we use individual signer properties, not an array
						const signerName = this.getNodeParameter('signer_name', i) as string;
						
						// Validate that signer name is provided
						if (!signerName || signerName.trim() === '') {
							throw new NodeOperationError(this.getNode(), 'Signer name is required for template document creation');
						}
						
						// According to ZapSign API docs for template documents, only these basic signer fields are supported:
						// - signer_name (required)
						// - signer_email
						// - signer_phone_country  
						// - signer_phone_number
						// 
						// All other signer options (auth_mode, signature_placement, etc.) are defined in the template
						// and cannot be overridden when creating the document.
						
						// Required field
						body.signer_name = signerName;
						
						// Optional basic fields
						const signerEmail = this.getNodeParameter('signer_email', i) as string;
						if (signerEmail && signerEmail.trim() !== '') {
							body.signer_email = signerEmail;
						}
						
						const signerPhoneCountry = this.getNodeParameter('signer_phone_country', i) as string;
						if (signerPhoneCountry && signerPhoneCountry.trim() !== '') {
							body.signer_phone_country = signerPhoneCountry;
						}
						
						const signerPhoneNumber = this.getNodeParameter('signer_phone_number', i) as string;
						if (signerPhoneNumber && signerPhoneNumber.trim() !== '') {
							body.signer_phone_number = signerPhoneNumber;
						}
						
						this.logger.debug(`Create Document from Template Request - Mapped basic signer fields: ${JSON.stringify({
							name: body.signer_name,
							email: body.signer_email,
							phone_country: body.signer_phone_country,
							phone_number: body.signer_phone_number
						})}`);
						
						// Note: All other signer options (auth_mode, signature_placement, require_cpf, etc.)
						// are defined in the template and cannot be changed when creating the document.
						// The template controls the signing experience and validation rules.
						
						// Add additional supported fields for template document creation
						const lang = this.getNodeParameter('lang', i) as string;
						if (lang && lang !== 'pt-br') {
							body.lang = lang;
						}
						
						const disableSignerEmails = this.getNodeParameter('disable_signer_emails', i) as boolean;
						if (disableSignerEmails) {
							body.disable_signer_emails = disableSignerEmails;
						}
						
						const brandLogo = this.getNodeParameter('brand_logo', i) as string;
						if (brandLogo && brandLogo.trim() !== '') {
							body.brand_logo = brandLogo;
						}
						
						const brandPrimaryColor = this.getNodeParameter('brand_primary_color', i) as string;
						if (brandPrimaryColor && brandPrimaryColor.trim() !== '') {
							body.brand_primary_color = brandPrimaryColor;
						}
						
						const brandName = this.getNodeParameter('brand_name', i) as string;
						if (brandName && brandName.trim() !== '') {
							body.brand_name = brandName;
						}
						
						const externalId = this.getNodeParameter('external_id', i) as string;
						if (externalId && externalId.trim() !== '') {
							body.external_id = externalId;
						}
						
						const folderPath = this.getNodeParameter('folder_path', i) as string;
						if (folderPath && folderPath !== '/') {
							body.folder_path = folderPath;
						}
						
						const createdBy = this.getNodeParameter('created_by', i) as string;
						if (createdBy && createdBy.trim() !== '') {
							body.created_by = createdBy;
						}
						
						const folderToken = this.getNodeParameter('folder_token', i) as string;
						if (folderToken && folderToken.trim() !== '') {
							body.folder_token = folderToken;
						}
						
						const disableSignersGetOriginalFile = this.getNodeParameter('disable_signers_get_original_file', i) as boolean;
						if (disableSignersGetOriginalFile) {
							body.disable_signers_get_original_file = disableSignersGetOriginalFile;
						}
						
						const sendAutomaticWhatsapp = this.getNodeParameter('send_automatic_whatsapp', i) as boolean;
						if (sendAutomaticWhatsapp) {
							body.send_automatic_whatsapp = sendAutomaticWhatsapp;
						}
						
						const sendWhatsappSignedFile = this.getNodeParameter('send_automatic_whatsapp_signed_file', i) as boolean;
						if (sendWhatsappSignedFile) {
							body.send_automatic_whatsapp_signed_file = sendWhatsappSignedFile;
						}
						
						const signatureOrderActive = this.getNodeParameter('signature_order_active', i) as boolean;
						if (signatureOrderActive) {
							body.signature_order_active = signatureOrderActive;
						}
						
						// Add template data (variables) if provided
						const templateData = this.getNodeParameter('templateData', i) as IDataObject;
						const variables = (templateData?.variable as IDataObject[]) || [];
						
						this.logger.debug(`Create Document from Template - Template Data: ${JSON.stringify(templateData)}`);
						this.logger.debug(`Create Document from Template - Variables: ${JSON.stringify(variables)}`);
						
						if (Array.isArray(variables) && variables.length > 0) {
							const dataArray = variables
								.map((entry) => ({ de: (entry.variableName as string) || '', para: (entry.variableValue as string) || '' }))
								.filter((v) => v.de && v.para);
							
							this.logger.debug(`Create Document from Template - Data Array: ${JSON.stringify(dataArray)}`);
							
							// Validate that we have at least one valid variable
							if (dataArray.length === 0) {
								this.logger.warn('No valid template variables found. All variables must have both name and value.');
							} else {
								// Validate variable format according to ZapSign API docs
								const invalidVars = dataArray.filter(v => !v.de.trim() || !v.para.trim());
								if (invalidVars.length > 0) {
									this.logger.warn(`Some template variables have empty names or values: ${JSON.stringify(invalidVars)}`);
								}
								
								// Only add valid variables to the request
								const validVars = dataArray.filter(v => v.de.trim() && v.para.trim());
								if (validVars.length > 0) {
									body.data = validVars;
									this.logger.debug(`Added ${validVars.length} valid template variables to request`);
								}
							}
						}
						
						// Add metadata if provided
						const metadata = this.getNodeParameter('metadata', i) as IDataObject;
						const metadataEntries = (metadata?.metadata as IDataObject[]) || [];
						
						if (Array.isArray(metadataEntries) && metadataEntries.length > 0) {
							const metadataArray = metadataEntries
								.map((entry) => ({ key: (entry.key as string) || '', value: (entry.value as string) || '' }))
								.filter((m) => m.key && m.value);
							
							if (metadataArray.length > 0) {
								body.metadata = metadataArray;
								this.logger.debug(`Added ${metadataArray.length} metadata entries to request`);
							}
						}

						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/models/create-doc/`,
							body,
						};

						this.logger.debug(`Create Document from Template Request - URL: ${options.url}`);

						try {
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Create Document from Template Error: ${error.message}`);
							this.logger.error(`Create Document from Template Request Options: ${JSON.stringify(options)}`);
							
							// Provide more specific error messages based on common issues
							if (error.message.includes('400') || error.message.includes('Bad Request')) {
								throw new NodeOperationError(this.getNode(), 
									`Bad request - please check your parameters. Common issues:\n` +
									`1. Template token is invalid or expired\n` +
									`2. Signer name is missing or invalid\n` +
									`3. Template variables have invalid names or values\n` +
									`4. Required fields are missing\n\n` +
									`Request body: ${JSON.stringify(body)}`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}
					} else if (operation === 'createTemplateDocx') {
						// Create template DOCX
						const name = this.getNodeParameter('name', i) as string;
						const docxSource = this.getNodeParameter('docxSource', i) as string;
						const templateAdditionalFields = this.getNodeParameter('templateAdditionalFields', i, {}) as IDataObject;

						const body: IDataObject = { name };
						if (docxSource === 'url') {
							body.docx_url = this.getNodeParameter('docxUrl', i) as string;
						} else {
							body.base64_docx = this.getNodeParameter('docxBase64', i) as string;
						}
						if (templateAdditionalFields && Object.keys(templateAdditionalFields).length > 0) {
							Object.assign(body, templateAdditionalFields);
						}

						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/templates/create/`,
							body,
						};

						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
					} else if (operation === 'get') {
						// Get template details
						const templateToken = this.getNodeParameter('templateToken', i) as string;
						const options: IRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/api/v1/templates/${encodeURIComponent(templateToken)}/`,
						};
						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
					} else if (operation === 'update') {
						// Update template metadata
						const templateToken = this.getNodeParameter('templateToken', i) as string;
						const name = this.getNodeParameter('name', i, '') as string;
						const templateAdditionalFields = this.getNodeParameter('templateAdditionalFields', i, {}) as IDataObject;
						const body: IDataObject = {};
						if (name) body.name = name;
						if (templateAdditionalFields && Object.keys(templateAdditionalFields).length > 0) {
							Object.assign(body, templateAdditionalFields);
						}
						const options: IRequestOptions = {
							method: 'PUT',
							url: `${baseUrl}/api/v1/templates/${encodeURIComponent(templateToken)}/`,
							body,
						};
						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
					} else if (operation === 'delete') {
						// Delete template
						const templateToken = this.getNodeParameter('templateToken', i) as string;
						const options: IRequestOptions = {
							method: 'DELETE',
							url: `${baseUrl}/api/v1/templates/${encodeURIComponent(templateToken)}/`,
						};
						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
					} else if (operation === 'updateTemplateForm') {
						// Update template form (inputs)
						const templateToken = this.getNodeParameter('templateToken', i) as string;
						const inputsCollection = this.getNodeParameter('templateFormInputs', i) as IDataObject;
						const inputs = (inputsCollection?.input as IDataObject[]) || [];

						// Add debug logging
						this.logger.debug(`Update Template Form Request - Template Token: ${templateToken}`);
						this.logger.debug(`Update Template Form Request - Inputs Collection: ${JSON.stringify(inputsCollection)}`);
						this.logger.debug(`Update Template Form Request - Base URL: ${baseUrl}`);

						const body: IDataObject = {
							template_id: templateToken, // Required by API
						};
						if (Array.isArray(inputs) && inputs.length > 0) {
							body.inputs = inputs.map((inp) => ({
								variable: (inp.variable as string) || '',
								label: (inp.label as string) || '',
								help_text: (inp.help_text as string) || '',
								input_type: (inp.input_type as string) || 'input',
								options: (inp.options as string) || '',
								required: Boolean(inp.required),
								order: (inp.order as number) ?? 1,
							})).filter((e) => e.variable);
						}

						this.logger.debug(`Update Template Form Request - Body: ${JSON.stringify(body)}`);

						// According to ZapSign API docs: https://docs.zapsign.com.br/modelos/create-template-docx/update-form
						// The correct endpoint is: POST /api/v1/templates/update-form/
						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/templates/update-form/`,
							body,
						};

						this.logger.debug(`Update Template Form Request - URL: ${options.url}`);

						try {
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Update Template Form Error: ${error.message}`);
							this.logger.error(`Update Template Form Request Options: ${JSON.stringify(options)}`);
							throw error;
						}
					}

				} else if (resource === 'backgroundCheck') {
					if (operation === 'createPerson') {
						const personCpf = this.getNodeParameter('personCpf', i) as string;
						const personName = this.getNodeParameter('personName', i, '') as string;
						const externalId = this.getNodeParameter('bcExternalId', i, '') as string;
						const forceCreation = this.getNodeParameter('forceCreation', i, true) as boolean;
						
						// Add debug logging
						this.logger.debug(`Create Person Background Check - CPF: ${personCpf}`);
						this.logger.debug(`Create Person Background Check - Name: ${personName}`);
						this.logger.debug(`Create Person Background Check - External ID: ${externalId}`);
						this.logger.debug(`Create Person Background Check - Force Creation: ${forceCreation}`);
						this.logger.debug(`Create Person Background Check - Base URL: ${baseUrl}`);
						
						// Build request body according to ZapSign API documentation
						const body: IDataObject = {
							user_authorized: true,
							force_creation: forceCreation,
							type: 'person',
							country: 'BR',
							national_id: personCpf
						};
						
						// Add optional fields if provided
						if (personName) {
							const nameParts = personName.trim().split(' ');
							if (nameParts.length > 0) {
								body.first_name = nameParts[0];
								if (nameParts.length > 1) {
									body.last_name = nameParts.slice(1).join(' ');
								}
							}
						}
						if (externalId) body.custom_input = externalId;
						
						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/checks/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};
						
						this.logger.debug(`Create Person Background Check - URL: ${options.url}`);
						this.logger.debug(`Create Person Background Check - Body: ${JSON.stringify(body)}`);
						
						try {
						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Create Person Background Check Error: ${error.message}`);
							this.logger.error(`Create Person Background Check Request Options: ${JSON.stringify(options)}`);
							
							// Provide more specific error messages
							if (error.message.includes('404') || error.message.includes('not be found')) {
								throw new NodeOperationError(this.getNode(), 
									`Background Check feature not available (404 error).\n\n` +
									`Possible causes:\n` +
									`1. Background checks may not be included in your ZapSign plan\n` +
									`2. This feature may require additional permissions or account upgrade\n` +
									`3. The API endpoint may have changed or been deprecated\n` +
									`4. Your ZapSign account may not have access to this feature\n\n` +
									`Please contact ZapSign support to verify if background checks are available for your account.\n\n` +
									`Technical details:\n` +
									`- Request URL: ${options.url}\n` +
									`- CPF: ${personCpf}\n` +
									`- Status: 404 (Not Found)`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}
					} else if (operation === 'createCompany') {
						const companyCnpj = this.getNodeParameter('companyCnpj', i) as string;
						const companyName = this.getNodeParameter('companyName', i, '') as string;
						const externalId = this.getNodeParameter('bcExternalId', i, '') as string;
						const forceCreation = this.getNodeParameter('forceCreation', i, true) as boolean;
						
						// Add debug logging
						this.logger.debug(`Create Company Background Check - CNPJ: ${companyCnpj}`);
						this.logger.debug(`Create Company Background Check - Company Name: ${companyName}`);
						this.logger.debug(`Create Company Background Check - External ID: ${externalId}`);
						this.logger.debug(`Create Company Background Check - Force Creation: ${forceCreation}`);
						this.logger.debug(`Create Company Background Check - Base URL: ${baseUrl}`);
						
						// Build request body according to ZapSign API documentation
						const body: IDataObject = {
							user_authorized: true,
							force_creation: forceCreation,
							type: 'company',
							country: 'BR',
							tax_id: companyCnpj
						};
						
						// Add optional fields if provided
						if (companyName) body.company_name = companyName;
						if (externalId) body.custom_input = externalId;
						
						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/checks/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};
						
						this.logger.debug(`Create Company Background Check - URL: ${options.url}`);
						this.logger.debug(`Create Company Background Check - Body: ${JSON.stringify(body)}`);
						
						try {
						const responseData = await requestJson(this, options);
						pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Create Company Background Check Error: ${error.message}`);
							this.logger.error(`Create Company Background Check Request Options: ${JSON.stringify(options)}`);
							
							// Provide more specific error messages
							if (error.message.includes('404') || error.message.includes('not be found')) {
								throw new NodeOperationError(this.getNode(), 
									`Background Check feature not available (404 error).\n\n` +
									`Possible causes:\n` +
									`1. Background checks may not be included in your ZapSign plan\n` +
									`2. This feature may require additional permissions or account upgrade\n` +
									`3. The API endpoint may have changed or been deprecated\n` +
									`4. Your ZapSign account may not have access to this feature\n\n` +
									`Please contact ZapSign support to verify if background checks are available for your account.\n\n` +
									`Technical details:\n` +
									`- Request URL: ${options.url}\n` +
									`- CNPJ: ${companyCnpj}\n` +
									`- Status: 404 (Not Found)`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}
					} else if (operation === 'get') {
						const checkToken = this.getNodeParameter('checkToken', i) as string;
						
						// Add debug logging
						this.logger.debug(`Retrieve Background Check - Check Token: ${checkToken}`);
						this.logger.debug(`Retrieve Background Check - Base URL: ${baseUrl}`);
						
						const options: IRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/api/v1/checks/${encodeURIComponent(checkToken)}/`,
						};
						
						this.logger.debug(`Retrieve Background Check - URL: ${options.url}`);
						
						try {
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Retrieve Background Check Error: ${error.message}`);
							this.logger.error(`Retrieve Background Check Request Options: ${JSON.stringify(options)}`);
							
							// Provide more specific error messages
							if (error.message.includes('404') || error.message.includes('not be found')) {
								throw new NodeOperationError(this.getNode(), 
									`Background check not found (404 error).\n\n` +
									`Possible causes:\n` +
									`1. Invalid check token provided\n` +
									`2. Background check may have expired or been deleted\n` +
									`3. Check token format is incorrect\n` +
									`4. You may not have access to this background check\n\n` +
									`Please verify:\n` +
									`- The check token is valid and correctly formatted (starts with "CHK")\n` +
									`- The background check was created successfully\n` +
									`- You have proper permissions to access this check\n\n` +
									`Technical details:\n` +
									`- Check Token: ${checkToken}\n` +
									`- API Endpoint: ${options.url}\n` +
									`- Status: 404 (Not Found)`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}
					} else if (operation === 'details') {
						const checkToken = this.getNodeParameter('checkToken', i) as string;
						
						// Add debug logging
						this.logger.debug(`Retrieve Background Check Details - Check Token: ${checkToken}`);
						this.logger.debug(`Retrieve Background Check Details - Base URL: ${baseUrl}`);
						
						const options: IRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/api/v1/checks/${encodeURIComponent(checkToken)}/details/`,
						};
						
						this.logger.debug(`Retrieve Background Check Details - URL: ${options.url}`);
						
						try {
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Retrieve Background Check Details Error: ${error.message}`);
							this.logger.error(`Retrieve Background Check Details Request Options: ${JSON.stringify(options)}`);
							
							// Provide more specific error messages
							if (error.message.includes('404') || error.message.includes('not be found')) {
								throw new NodeOperationError(this.getNode(), 
									`Background check details not found (404 error).\n\n` +
									`Possible causes:\n` +
									`1. Invalid check token provided\n` +
									`2. Background check may have expired or been deleted\n` +
									`3. Check token format is incorrect\n` +
									`4. You may not have access to this background check\n` +
									`5. The background check may still be in progress\n\n` +
									`Please verify:\n` +
									`- The check token is valid and correctly formatted (starts with "CHK")\n` +
									`- The background check was created successfully and completed\n` +
									`- You have proper permissions to access this check\n` +
									`- The check status is "completed" before requesting details\n\n` +
									`Technical details:\n` +
									`- Check Token: ${checkToken}\n` +
									`- API Endpoint: ${options.url}\n` +
									`- Status: 404 (Not Found)`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}
					}
				} else if (resource === 'partnership') {
					if (operation === 'createAccount') {
						// Create partner account
						const email = this.getNodeParameter('partnerEmail', i) as string;
						const phoneNumber = this.getNodeParameter('partnerPhoneNumber', i, '') as string;
						const phoneCountry = this.getNodeParameter('partnerPhoneCountry', i, '55') as string;
						const country = this.getNodeParameter('partnerCountry', i) as string;
						const lang = this.getNodeParameter('partnerLang', i) as string;
						const companyName = this.getNodeParameter('partnerCompanyName', i) as string;
						
						// Add debug logging
						this.logger.debug(`Create Partner Account - Email: ${email}`);
						this.logger.debug(`Create Partner Account - Phone: ${phoneCountry} ${phoneNumber}`);
						this.logger.debug(`Create Partner Account - Country: ${country}`);
						this.logger.debug(`Create Partner Account - Language: ${lang}`);
						this.logger.debug(`Create Partner Account - Company Name: ${companyName}`);
						this.logger.debug(`Create Partner Account - Base URL: ${baseUrl}`);
						
						// According to ZapSign API docs: https://docs.zapsign.com.br/english/partnerships/create-account
						const body: IDataObject = {
							country,
							lang,
							company_name: companyName,
						};
						
						// Only add email if provided
						if (email) body.email = email;
						
						// Only add phone fields if phone number is provided
						if (phoneNumber) {
							body.phone_number = phoneNumber;
							body.phone_country = phoneCountry;
						}
						
						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/partner/company/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};
						
						this.logger.debug(`Create Partner Account - URL: ${options.url}`);
						this.logger.debug(`Create Partner Account - Body: ${JSON.stringify(options.body)}`);
						
						try {
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Create Partner Account Error: ${error.message}`);
							this.logger.error(`Create Partner Account Request Options: ${JSON.stringify(options)}`);
							
							// Provide more specific error messages
							if (error.message.includes('400') || error.message.includes('Bad request')) {
								throw new NodeOperationError(this.getNode(), 
									`Partner account creation failed (400 Bad Request).\n\n` +
									`Common issues that cause this error:\n` +
									`1. Missing required fields (country, lang, company_name)\n` +
									`2. Invalid email format\n` +
									`3. Invalid country or language codes\n` +
									`4. Phone number format issues\n\n` +
									`Please check:\n` +
									`- All required fields are filled\n` +
									`- Email format is valid (if provided)\n` +
									`- Country and language codes are correct\n` +
									`- Phone number format matches country requirements\n\n` +
									`Technical details:\n` +
									`- API Endpoint: ${options.url}\n` +
									`- Status: 400 (Bad Request)\n` +
									`- Company Name: ${companyName}\n` +
									`- Country: ${country}\n` +
									`- Language: ${lang}`, 
									{ itemIndex: i }
								);
							} else if (error.message.includes('403') || error.message.includes('Forbidden')) {
								throw new NodeOperationError(this.getNode(), 
									`Partner account creation failed (403 Forbidden).\n\n` +
									`Possible causes:\n` +
									`1. Your account doesn't have partner permissions\n` +
									`2. Your plan doesn't support partner features\n` +
									`3. You're trying to create an account from another partner account\n\n` +
									`Please contact ZapSign support to enable partner features on your account.`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}
						
					} else if (operation === 'updatePaymentStatus') {
						// Update partner payment status
						const clientApiToken = this.getNodeParameter('clientApiToken', i) as string;
						const paymentStatus = this.getNodeParameter('paymentStatus', i) as string;
						
						// Add debug logging
						this.logger.debug(`Update Payment Status - Client API Token: ${clientApiToken}`);
						this.logger.debug(`Update Payment Status - Payment Status: ${paymentStatus}`);
						this.logger.debug(`Update Payment Status - Base URL: ${baseUrl}`);
						
						// According to ZapSign API docs: https://docs.zapsign.com.br/english/partnerships/update-payment-status
						const body: IDataObject = {
							client_api_token: clientApiToken,
							payment_status: paymentStatus,
						};
						
						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/partner/update-payment-status/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};
						
						this.logger.debug(`Update Payment Status - URL: ${options.url}`);
						this.logger.debug(`Update Payment Status - Body: ${JSON.stringify(options.body)}`);
						
						try {
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Update Payment Status Error: ${error.message}`);
							this.logger.error(`Update Payment Status Request Options: ${JSON.stringify(options)}`);
							
							// Provide more specific error messages
							if (error.message.includes('400') || error.message.includes('Bad request')) {
								throw new NodeOperationError(this.getNode(), 
									`Payment status update failed (400 Bad Request).\n\n` +
									`Common issues that cause this error:\n` +
									`1. Invalid client API token format\n` +
									`2. Invalid payment status value\n` +
									`3. Missing required fields\n\n` +
									`Please check:\n` +
									`- Client API token is valid and correctly formatted\n` +
									`- Payment status is either "adimplente" or "inadimplente"\n` +
									`- All required fields are provided\n\n` +
									`Technical details:\n` +
									`- API Endpoint: ${options.url}\n` +
									`- Status: 400 (Bad Request)\n` +
									`- Client API Token: ${clientApiToken}\n` +
									`- Payment Status: ${paymentStatus}`, 
									{ itemIndex: i }
								);
							} else if (error.message.includes('403') || error.message.includes('Forbidden')) {
								throw new NodeOperationError(this.getNode(), 
									`Payment status update failed (403 Forbidden).\n\n` +
									`Possible causes:\n` +
									`1. Your account doesn't have partner permissions\n` +
									`2. The client account is not under your control\n` +
									`3. Invalid authentication token\n\n` +
									`Please verify:\n` +
									`- You have partner permissions\n` +
									`- The client account belongs to your partner network\n` +
									`- Your authentication token is valid`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}
					}
				} else if (resource === 'timestamp') {
					if (operation === 'add') {
						// Add timestamp to document
						const documentUrl = this.getNodeParameter('timestampDocumentUrl', i) as string;
						
						// Add debug logging
						this.logger.debug(`Add Timestamp - Document URL: ${documentUrl}`);
						this.logger.debug(`Add Timestamp - Base URL: ${baseUrl}`);
						
						// According to ZapSign API docs: https://docs.zapsign.com.br/english/timestamp/criar-documento
						const body: IDataObject = {
							url: documentUrl,
						};
						
						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/timestamp/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};
						
						this.logger.debug(`Add Timestamp - URL: ${options.url}`);
						this.logger.debug(`Add Timestamp - Body: ${JSON.stringify(options.body)}`);
						
						try {
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Add Timestamp Error: ${error.message}`);
							this.logger.error(`Add Timestamp Request Options: ${JSON.stringify(options)}`);
							
							// Provide more specific error messages
							if (error.message.includes('402') || error.message.includes('Payment Required')) {
								throw new NodeOperationError(this.getNode(), 
									`Timestamp addition failed (402 Payment Required).\n\n` +
									`This feature requires a specific plan that includes timestamp functionality.\n\n` +
									`Please contact ZapSign support to add this functionality to your plan.\n\n` +
									`Technical details:\n` +
									`- API Endpoint: ${options.url}\n` +
									`- Status: 402 (Payment Required)`, 
									{ itemIndex: i }
								);
							} else if (error.message.includes('400') || error.message.includes('Bad request')) {
								throw new NodeOperationError(this.getNode(), 
									`Timestamp addition failed (400 Bad Request).\n\n` +
									`Common issues that cause this error:\n` +
									`1. Invalid document URL\n` +
									`2. Document format not supported (only PDF and DOCX)\n` +
									`3. Document size exceeds 10MB limit\n` +
									`4. Document URL is not accessible\n\n` +
									`Please check:\n` +
									`- Document URL is publicly accessible\n` +
									`- Document is in PDF or DOCX format\n` +
									`- Document size is under 10MB\n\n` +
									`Technical details:\n` +
									`- API Endpoint: ${options.url}\n` +
									`- Status: 400 (Bad Request)\n` +
									`- Document URL: ${documentUrl}`, 
									{ itemIndex: i }
								);
							}
							
							throw error;
						}
					}
				} else if (resource === 'webhook') {
					if (operation === 'create') {
						// Create webhook
						const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
						const events = this.getNodeParameter('events', i) as string[];

						// Add debug logging
						this.logger.debug(`Create Webhook Request - Webhook URL: ${webhookUrl}`);
						this.logger.debug(`Create Webhook Request - Events: ${JSON.stringify(events)}`);
						this.logger.debug(`Create Webhook Request - Base URL: ${baseUrl}`);

						// According to ZapSign API docs: https://docs.zapsign.com.br/webhooks/criar-webhook
						const body: IDataObject = {
							url: webhookUrl,
							type: events, // Single event type or empty string for all
						};

						const options: IRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/api/v1/user/company/webhook/`,
							body,
						};

						this.logger.debug(`Create Webhook Request - URL: ${options.url}`);
						this.logger.debug(`Create Webhook Request - Body: ${JSON.stringify(options.body)}`);

						try {
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Create Webhook Error: ${error.message}`);
							this.logger.error(`Create Webhook Request Options: ${JSON.stringify(options)}`);
							throw error;
						}

					} else if (operation === 'delete') {
						// Delete webhook
						const webhookId = this.getNodeParameter('webhookId', i) as string;

						// Add debug logging
						this.logger.debug(`Delete Webhook Request - Webhook ID: ${webhookId}`);
						this.logger.debug(`Delete Webhook Request - Base URL: ${baseUrl}`);

						// According to ZapSign API docs: https://docs.zapsign.com.br/webhooks/criar-webhook
						// The delete endpoint expects the webhook ID in the request body
						const body: IDataObject = {
							id: webhookId,
						};

						const options: IRequestOptions = {
							method: 'DELETE',
							url: `${baseUrl}/api/v1/user/company/webhook/delete/`,
							body,
							headers: {
								'Content-Type': 'application/json',
							},
						};

						this.logger.debug(`Delete Webhook Request - URL: ${options.url}`);
						this.logger.debug(`Delete Webhook Request - Body: ${JSON.stringify(body)}`);

						try {
							const responseData = await requestJson(this, options);
							pushResult(returnData, responseData);
						} catch (error) {
							this.logger.error(`Delete Webhook Error: ${error.message}`);
							this.logger.error(`Delete Webhook Request Options: ${JSON.stringify(options)}`);
							throw error;
						}
					}
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						error: error.message,
						json: {},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error, {
					itemIndex: i,
				});
			}
		}

		this.logger.info(`Execution loop completed. Processed ${items.length} items. Returning ${returnData.length} results.`);
		return [this.helpers.returnJsonArray(returnData)];
	}
}
