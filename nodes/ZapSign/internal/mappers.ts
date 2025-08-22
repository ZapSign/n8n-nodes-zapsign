import type { IDataObject } from 'n8n-workflow';

export function mapSignerEntries(entries: IDataObject[]): IDataObject[] {
    return entries.map((s) => {
        const signer: IDataObject = {
            name: (s.name as string) || '',
            phone_country: (s.phone_country as string) || '55',
            phone_number: (s.phone_number as string) || '',
            lock_name: (s.lock_name as boolean) || false,
            lock_email: (s.lock_email as boolean) || false,
            lock_phone: (s.lock_phone as boolean) || false,
        };

        // Only add email if it's provided and not empty
        if (s.email && (s.email as string).trim() !== '') {
            signer.email = s.email as string;
        }

        // Only add optional fields if they have meaningful values
        if (s.auth_mode && (s.auth_mode as string).trim() !== '') {
            signer.auth_mode = s.auth_mode as string;
        }
        if (s.signature_placement && (s.signature_placement as string).trim() !== '') {
            signer.signature_placement = s.signature_placement as string;
        }
        if (s.rubrica_placement && (s.rubrica_placement as string).trim() !== '') {
            signer.rubrica_placement = s.rubrica_placement as string;
        }
        if (s.require_cpf !== undefined) {
            signer.require_cpf = s.require_cpf as boolean;
        }
        if (s.validate_cpf !== undefined) {
            signer.validate_cpf = s.validate_cpf as boolean;
        }
        if (s.cpf && (s.cpf as string).trim() !== '') {
            signer.cpf = s.cpf as string;
        }
        if (s.send_automatic_email !== undefined) {
            signer.send_automatic_email = s.send_automatic_email as boolean;
        }
        if (s.send_automatic_whatsapp !== undefined) {
            signer.send_automatic_whatsapp = s.send_automatic_whatsapp as boolean;
        }
        if (s.send_automatic_whatsapp_signed_file !== undefined) {
            signer.send_automatic_whatsapp_signed_file = s.send_automatic_whatsapp_signed_file as boolean;
        }
        if (s.order_group !== undefined) {
            signer.order_group = s.order_group as number;
        }
        if (s.custom_message && (s.custom_message as string).trim() !== '') {
            signer.custom_message = s.custom_message as string;
        }
        if (s.blank_email !== undefined) {
            signer.blank_email = s.blank_email as boolean;
        }
        if (s.hide_email !== undefined) {
            signer.hide_email = s.hide_email as boolean;
        }
        if (s.blank_phone !== undefined) {
            signer.blank_phone = s.blank_phone as boolean;
        }
        if (s.require_selfie_photo !== undefined) {
            signer.require_selfie_photo = s.require_selfie_photo as boolean;
        }
        if (s.require_document_photo !== undefined) {
            signer.require_document_photo = s.require_document_photo as boolean;
        }
        if (s.selfie_validation_type && (s.selfie_validation_type as string).trim() !== '') {
            signer.selfie_validation_type = s.selfie_validation_type as string;
        }
        if (s.redirect_link && (s.redirect_link as string).trim() !== '') {
            signer.redirect_link = s.redirect_link as string;
        }
        if (s.qualification && (s.qualification as string).trim() !== '') {
            signer.qualification = s.qualification as string;
        }
        if (s.external_id && (s.external_id as string).trim() !== '') {
            signer.external_id = s.external_id as string;
        }

        return signer;
    });
}

export function mapOneClickSignerEntries(entries: IDataObject[]): IDataObject[] {
    return entries.map((s) => {
        const signer: IDataObject = {
            // Required/basic fields
            name: (s.name as string) || '',
            phone_country: (s.phone_country as string) || '55',
            phone_number: (s.phone_number as string) || '',
        };

        // Only add email if it's provided and not empty
        if (s.email && (s.email as string).trim() !== '') {
            signer.email = s.email as string;
        }

        // Only add optional fields if they have meaningful values
        if (s.send_automatic_email !== undefined) {
            signer.send_automatic_email = s.send_automatic_email as boolean;
        }
        if (s.order_group !== undefined) {
            signer.order_group = s.order_group as number;
        }
        if (s.custom_message && (s.custom_message as string).trim() !== '') {
            signer.custom_message = s.custom_message as string;
        }
        if (s.blank_email !== undefined) {
            signer.blank_email = s.blank_email as boolean;
        }
        if (s.hide_email !== undefined) {
            signer.hide_email = s.hide_email as boolean;
        }
        if (s.blank_phone !== undefined) {
            signer.blank_phone = s.blank_phone as boolean;
        }
        if (s.hide_phone !== undefined) {
            signer.hide_phone = s.hide_phone as boolean;
        }
        if (s.qualification && (s.qualification as string).trim() !== '') {
            signer.qualification = s.qualification as string;
        }
        if (s.external_id && (s.external_id as string).trim() !== '') {
            signer.external_id = s.external_id as string;
        }
        if (s.redirect_link && (s.redirect_link as string).trim() !== '') {
            signer.redirect_link = s.redirect_link as string;
        }

        return signer;
    });
}

