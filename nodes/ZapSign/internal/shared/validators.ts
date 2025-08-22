

/**
 * Shared validation utilities for AI Agent Tools
 */
export class SharedValidators {
  constructor() {}

  /**
   * Validate required fields in an object
   */
  public validateRequiredFields(params: any, requiredFields: string[]): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    for (const field of requiredFields) {
      if (params[field] === undefined || params[field] === null || params[field] === '') {
        missing.push(field);
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Validate email format
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  public validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate date format (ISO 8601)
   */
  public validateDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!dateRegex.test(date)) {
      return false;
    }
    
    try {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    } catch {
      return false;
    }
  }

  /**
   * Validate phone number format
   */
  public validatePhoneNumber(phone: string): boolean {
    // Basic phone validation - can be enhanced per country
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/[\d\s\-\+\(\)]/g, '').length === 0;
  }

  /**
   * Validate base64 string
   */
  public validateBase64(base64: string): boolean {
    try {
      // Check if it's a valid base64 string
      return /^[A-Za-z0-9+/]*={0,2}$/.test(base64);
    } catch {
      return false;
    }
  }

  /**
   * Validate enum values
   */
  public validateEnum(value: any, allowedValues: any[]): boolean {
    return allowedValues.includes(value);
  }

  /**
   * Validate array structure
   */
  public validateArray(value: any, itemValidator?: (item: any) => boolean): boolean {
    if (!Array.isArray(value)) {
      return false;
    }
    
    if (itemValidator) {
      return value.every(item => itemValidator(item));
    }
    
    return true;
  }

  /**
   * Validate object structure
   */
  public validateObject(value: any, requiredKeys?: string[]): boolean {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    
    if (requiredKeys) {
      return requiredKeys.every(key => key in value);
    }
    
    return true;
  }

  /**
   * Validate string length
   */
  public validateStringLength(value: string, minLength?: number, maxLength?: number): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    
    if (minLength !== undefined && value.length < minLength) {
      return false;
    }
    
    if (maxLength !== undefined && value.length > maxLength) {
      return false;
    }
    
    return true;
  }

  /**
   * Validate numeric range
   */
  public validateNumericRange(value: number, min?: number, max?: number): boolean {
    if (typeof value !== 'number' || isNaN(value)) {
      return false;
    }
    
    if (min !== undefined && value < min) {
      return false;
    }
    
    if (max !== undefined && value > max) {
      return false;
    }
    
    return true;
  }

  /**
   * Comprehensive validation with detailed error messages
   */
  public validateParams(params: any, schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Validate required fields
      if (schema.required) {
        const requiredValidation = this.validateRequiredFields(params, schema.required);
        if (!requiredValidation.valid) {
          errors.push(`Missing required fields: ${requiredValidation.missing.join(', ')}`);
        }
      }
      
      // Validate individual fields
      if (schema.properties) {
        for (const [fieldName, fieldSchemaUnknown] of Object.entries(schema.properties)) {
          const fieldSchema = fieldSchemaUnknown as any;
          const fieldValue = params[fieldName];
          
          if (fieldValue !== undefined && fieldValue !== null) {
            // Type validation
            if (fieldSchema.type && !this.validateType(fieldValue, fieldSchema.type)) {
              errors.push(`Field '${fieldName}' has invalid type. Expected ${fieldSchema.type}`);
            }
            
            // Format validation
            if (fieldSchema.format) {
              if (!this.validateFormat(fieldValue, fieldSchema.format)) {
                errors.push(`Field '${fieldName}' has invalid format. Expected ${fieldSchema.format}`);
              }
            }
            
            // Enum validation
            if (fieldSchema.enum && !this.validateEnum(fieldValue, fieldSchema.enum)) {
              errors.push(`Field '${fieldName}' has invalid value. Allowed values: ${fieldSchema.enum.join(', ')}`);
            }
            
            // String length validation
            if (fieldSchema.type === 'string' && fieldSchema.minLength !== undefined) {
              if (!this.validateStringLength(fieldValue, fieldSchema.minLength, fieldSchema.maxLength)) {
                errors.push(`Field '${fieldName}' has invalid length`);
              }
            }
            
            // Numeric range validation
            if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
              if (!this.validateNumericRange(fieldValue, fieldSchema.minimum, fieldSchema.maximum)) {
                errors.push(`Field '${fieldName}' has invalid range`);
              }
            }
          }
        }
      }
      
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate type
   */
  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'integer':
        return Number.isInteger(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Validate format
   */
  private validateFormat(value: any, format: string): boolean {
    switch (format) {
      case 'email':
        return this.validateEmail(value);
      case 'uri':
      case 'url':
        return this.validateUrl(value);
      case 'date-time':
        return this.validateDate(value);
      case 'base64':
        return this.validateBase64(value);
      default:
        return true;
    }
  }
}
