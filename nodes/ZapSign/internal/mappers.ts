import type { IDataObject } from 'n8n-workflow';

export function mapSignerEntries(entries: IDataObject[]): IDataObject[] {
    return entries.map((s) => ({
        name: (s.name as string) || '',
        email: (s.email as string) || '',
        phone_country: (s.phone_country as string) || '55',
        phone_number: (s.phone_number as string) || '',
        lock_name: (s.lock_name as boolean) || false,
        lock_email: (s.lock_email as boolean) || false,
        lock_phone: (s.lock_phone as boolean) || false,
        auth_mode: (s.auth_mode as string) || undefined,
        signature_placement: (s.signature_placement as string) || undefined,
        rubrica_placement: (s.rubrica_placement as string) || undefined,
        require_cpf: (s.require_cpf as boolean) || undefined,
        validate_cpf: (s.validate_cpf as boolean) || undefined,
        cpf: (s.cpf as string) || undefined,
        send_automatic_email: (s.send_automatic_email as boolean) ?? undefined,
        send_automatic_whatsapp: (s.send_automatic_whatsapp as boolean) ?? undefined,
        send_automatic_whatsapp_signed_file: (s.send_automatic_whatsapp_signed_file as boolean) ?? undefined,
        order_group: (s.order_group as number) ?? undefined,
        custom_message: (s.custom_message as string) || undefined,
        blank_email: (s.blank_email as boolean) || undefined,
        hide_email: (s.hide_email as boolean) || undefined,
        blank_phone: (s.blank_phone as boolean) || undefined,
        require_selfie_photo: (s.require_selfie_photo as boolean) || undefined,
        require_document_photo: (s.require_document_photo as boolean) || undefined,
        selfie_validation_type: (s.selfie_validation_type as string) || undefined,
        redirect_link: (s.redirect_link as string) || undefined,
        qualification: (s.qualification as string) || undefined,
        external_id: (s.external_id as string) || undefined,
    }));
}

export function mapOneClickSignerEntries(entries: IDataObject[]): IDataObject[] {
    return entries.map((s) => ({
        name: (s.name as string) || '',
        email: (s.email as string) || '',
        phone_country: (s.phone_country as string) || '55',
        phone_number: (s.phone_number as string) || '',
        lock_name: false,
        lock_email: false,
        lock_phone: false,
    }));
}

